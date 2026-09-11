# FORMA RE — Studio Assistant (Vercel-ready)

This folder is a complete, deployable project:

```
forma-re-studio-assistant/
├── public/
│   └── index.html      ← the widget (frontend)
├── api/
│   └── ask.js           ← serverless function (holds the API key, calls Claude)
├── package.json
├── vercel.json
├── .env.example
└── .gitignore
```

The frontend never talks to Anthropic directly — it calls `POST /api/ask`, and that serverless
function (running on Vercel's servers, not in the browser) is the only place your Anthropic API
key ever lives. The full knowledge base now lives inside `api/ask.js` too, so it's not visible in
the page source anymore either.

## 1. Get an Anthropic API key

Go to console.anthropic.com → get an API key (this is billed separately from any claude.ai
subscription — pay-per-use).

## 2. Run it locally

You need the Vercel CLI to run the serverless function locally (a plain double-click on
`index.html` will NOT work, since `/api/ask` needs a server to run).

```bash
npm install -g vercel        # one-time install
cd forma-re-studio-assistant
cp .env.example .env
# edit .env and paste in your real ANTHROPIC_API_KEY

vercel dev
```

This starts a local server (usually `http://localhost:3000`) that serves `public/index.html` and
runs `api/ask.js` exactly like production. Open that URL and the assistant should work fully,
including real answers and the unanswered-question webhook (if you've set that up too).

## 3. Deploy to Vercel

**Easiest path — GitHub:**
1. Push this folder to a new GitHub repo.
2. Go to vercel.com → New Project → import that repo.
3. Before the first deploy, add your environment variable:
   Project Settings → Environment Variables → add `ANTHROPIC_API_KEY` with your real key
   (set it for Production, Preview, and Development).
4. Deploy. Vercel gives you a live URL immediately, and redeploys automatically on every push.

**Alternative — CLI only (no GitHub needed):**
```bash
cd forma-re-studio-assistant
vercel          # first deploy, follow the prompts
vercel env add ANTHROPIC_API_KEY production
vercel --prod   # deploy to your live URL
```

## 4. Optional: unanswered-question alerts (Google Sheets + email)

The frontend still has the two blank constants for this, near the top of the `<script>` block in
`public/index.html`:

```javascript
const UNANSWERED_WEBHOOK_URL = "";
const UNANSWERED_WEBHOOK_SECRET = "";
```

Follow the separate `apps-script-setup-instructions.md` doc to set up the free Google Apps Script
webhook, then paste the two values in here. This part runs entirely client-side (it's just your
browser calling Google's servers), so it works the same locally and once deployed — no extra
Vercel configuration needed for it.

## 5. Updating the knowledge base later

Since the knowledge base now lives in `api/ask.js` (inside the `KNOWLEDGE_BASE` constant near the
top of the file) rather than in the HTML, that's the one file to edit whenever policies change.
After editing, just redeploy (`git push`, or `vercel --prod` if using the CLI).

## Notes

- `api/ask.js` uses `claude-sonnet-4-6` and `max_tokens: 600` — matches what was used in the
  Claude.ai-hosted version.
- If a request to `/api/ask` fails with a message about a missing `ANTHROPIC_API_KEY`, it means the
  environment variable isn't set for whichever environment you're running (local `.env` vs. Vercel
  dashboard) — that's the #1 thing to check.
- CORS isn't an issue here since the frontend and the API route are served from the same domain.
