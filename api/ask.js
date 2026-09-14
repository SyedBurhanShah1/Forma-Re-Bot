// ============================================================
// FORMA RE — Studio Assistant backend (Vercel serverless function)
// ------------------------------------------------------------
// Runs server-side only. The Groq API key never reaches the
// browser. The frontend calls POST /api/ask with { question },
// and this function returns { answer, related, found }.
// Uses Groq's API (free tier) — see README for setup.
// ============================================================

const SYSTEM_PROMPT_TEMPLATE = `You are the internal Studio Assistant for FORMA RE, an architecture firm.
Employees will ask short questions about the firm's policies and standard operating procedures (SOPs).

Answer ONLY using the knowledge base below. Use plain, everyday wording — avoid legal or corporate
phrasing, jargon, or overly formal language even if the source text is written that way. Say things
the way you'd explain them out loud to a coworker. Keep the answer brief: 2-4 sentences for most
questions, a short bullet list only when the question genuinely calls for steps. If a relevant link
or form URL is in the knowledge base, include it plainly.

The knowledge base is organized into named sections marked with "--- Section Name ---". When your
answer is drawn from a specific section, end it with a short reference in parentheses using that
exact section name, e.g. "(see: Meeting & Virtual Conduct SOPs)" or "(see: Time Off and Leave
Policies)" — so the employee knows where to read more in the Handbook or SOPs. Skip this reference
if the question is general and doesn't map cleanly to one section.

If the knowledge base does not contain the answer, set the "answer" field to exactly this style of
message: "This knowledge is not yet updated, please contact HR for this query." — adapt the wording
naturally to the question if needed, but keep that core meaning. Set "found" to false and return an
empty "related" list.

Respond with ONLY a JSON object, no preamble, no markdown code fences, in exactly this shape:
{"answer": "the answer text, in plain wording", "related": ["follow-up question 1", "follow-up question 2", "follow-up question 3"], "found": true}

Rules for "found":
- Set it to true if the knowledge base actually contains a real answer to the question.
- Set it to false if the knowledge base does NOT cover the question and you had to say so and point
  them to HR instead. This is used to flag the question for HR's attention, so be honest about it —
  don't mark "found": true just because you gave a polite response.

Rules for "related":
- Suggest 2-3 short, natural follow-up questions an employee would plausibly ask next.
- Base them ONLY on topics that are actually covered in the knowledge base below — never invent a
  follow-up about something the knowledge base doesn't mention.
- Phrase each as a real question, the way an employee would type it (e.g. "What counts as an emergency?").
- If the knowledge base doesn't clearly support any follow-up questions, return an empty array.

--- KNOWLEDGE BASE ---
{{KNOWLEDGE_BASE}}
--- END KNOWLEDGE BASE ---`;

function buildSystemPrompt(knowledgeBase) {
  return SYSTEM_PROMPT_TEMPLATE.replace('{{KNOWLEDGE_BASE}}', knowledgeBase);
}

// ---- Knowledge base: fetched live from a published Google Doc ----
// This is the "Publish to web" link for the doc. Editing the doc updates the
// bot's answers automatically — no code changes or redeploys needed. Note:
// Google's own "Publish to web" has its own ~5 minute delay before edits show
// up at this URL, on top of anything cached below.
const KNOWLEDGE_BASE_DOC_URL = "https://docs.google.com/document/d/e/2PACX-1vR_iEuKEw_w1Il7U_pG85zqbj4E6W1-l2iHTNWgtbdIJn_fcBfJT5uj9tc6RDqKayzlgUy3OAltvwrF/pub";

// Simple in-memory cache so a burst of questions doesn't re-fetch the doc every
// single time. Resets whenever the serverless function cold-starts anyway.
let cachedKnowledgeBase = null;
let cachedAt = 0;
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes

function htmlToPlainText(html) {
  let text = html;
  text = text.replace(/<script[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[\s\S]*?<\/style>/gi, '');
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<\/(p|div|li|tr|td|th|h1|h2|h3|h4|h5|h6)>/gi, '\n');
  text = text.replace(/<li[^>]*>/gi, '- ');
  text = text.replace(/<[^>]+>/g, '');
  const entities = {
    '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'",
    '&nbsp;': ' ', '&rsquo;': '\u2019', '&lsquo;': '\u2018',
    '&rdquo;': '\u201d', '&ldquo;': '\u201c', '&mdash;': '\u2014', '&ndash;': '\u2013'
  };
  text = text.replace(/&amp;|&lt;|&gt;|&quot;|&#39;|&nbsp;|&rsquo;|&lsquo;|&rdquo;|&ldquo;|&mdash;|&ndash;/g, (m) => entities[m] || m);
  text = text.replace(/[ \t]+/g, ' ');
  text = text.replace(/\n{3,}/g, '\n\n');
  return text.trim();
}

async function fetchKnowledgeBase() {
  const now = Date.now();
  if (cachedKnowledgeBase && (now - cachedAt) < CACHE_TTL_MS) {
    return cachedKnowledgeBase;
  }
  const response = await fetch(KNOWLEDGE_BASE_DOC_URL);
  if (!response.ok) {
    if (cachedKnowledgeBase) return cachedKnowledgeBase; // serve stale rather than nothing
    throw new Error(`Failed to fetch knowledge base doc: ${response.status}`);
  }
  const html = await response.text();
  const text = htmlToPlainText(html);
  cachedKnowledgeBase = text;
  cachedAt = now;
  return text;
}

// Which Groq model to use. llama-3.3-70b-versatile is a strong, well-tested default.
// If you hit free-tier rate limits with many employees using it at once, openai/gpt-oss-20b
// is smaller/faster with a higher allowance — swap the string below.
const GROQ_MODEL = 'openai/gpt-oss-120b';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { question } = req.body || {};
  if (!question || typeof question !== 'string' || !question.trim()) {
    res.status(400).json({ error: 'Missing "question" in request body' });
    return;
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Server is missing GROQ_API_KEY. Set it in your Vercel project environment variables.' });
    return;
  }

  try {
    let knowledgeBase;
    try {
      knowledgeBase = await fetchKnowledgeBase();
    } catch (kbErr) {
      res.status(502).json({ error: `Could not load the knowledge base doc: ${kbErr.message}` });
      return;
    }
    const systemPrompt = buildSystemPrompt(knowledgeBase);

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question }
        ],
        max_tokens: 600,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      res.status(response.status).json({ error: `Groq API error: ${errText}` });
      return;
    }

    const data = await response.json();
    const raw = data?.choices?.[0]?.message?.content || '';
    const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();

    let result;
    try {
      const parsed = JSON.parse(cleaned);
      result = {
        answer: parsed.answer || "I couldn't generate a response — please try again.",
        related: Array.isArray(parsed.related) ? parsed.related.slice(0, 3) : [],
        found: parsed.found !== false
      };
    } catch (parseErr) {
      if (!raw) {
        // Likely blocked by a safety filter or empty response — fail gracefully.
        result = { answer: "I couldn't generate a response — please try again.", related: [], found: true };
      } else {
        result = { answer: raw, related: [], found: true };
      }
    }

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
