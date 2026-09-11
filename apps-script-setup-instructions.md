# Logging unanswered questions to Google Sheets + email alerts (free, via Apps Script)

## 1. Create the sheet
1. Go to sheets.google.com → create a new blank spreadsheet.
2. Rename it something like **"FORMA RE — Unanswered Questions"**.
3. In row 1, add headers: `Timestamp | Question | Source` (optional, but nice for reading later).

## 2. Add the script
1. In the sheet, go to **Extensions → Apps Script**.
2. Delete anything in the editor and paste this in:

```javascript
// ---- CONFIG ----
const NOTIFY_EMAIL = "your-hr-email@roushanbuilds.com"; // where alerts go
const SHARED_SECRET = "choose-a-random-string-here";     // must match the widget

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // Simple shared-secret check so random people can't spam your sheet/inbox
    if (data.secret !== SHARED_SECRET) {
      return ContentService.createTextOutput("Unauthorized").setMimeType(ContentService.MimeType.TEXT);
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.question || "(no question provided)",
      data.source || "Unknown"
    ]);

    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: "FORMA RE Assistant — Unanswered Question",
      body:
        "The studio assistant couldn't answer this question:\n\n" +
        "\"" + data.question + "\"\n\n" +
        "Time: " + (data.timestamp || new Date().toISOString()) + "\n\n" +
        "Consider adding this topic to the knowledge base."
    });

    return ContentService.createTextOutput("OK").setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    return ContentService.createTextOutput("Error: " + err.message).setMimeType(ContentService.MimeType.TEXT);
  }
}
```

3. Replace `NOTIFY_EMAIL` with the real HR inbox.
4. Replace `SHARED_SECRET` with any random string you make up (e.g. `formare-9f81xk`) —
   this stops strangers from finding your webhook URL and spamming your sheet/inbox.
   You'll paste this same string into the widget in step 4 below.

## 3. Deploy as a Web App
1. Click **Deploy → New deployment** (top right).
2. Click the gear icon next to "Select type" → choose **Web app**.
3. Settings:
   - **Execute as:** Me
   - **Who has access:** Anyone
   (This doesn't mean anyone can read your sheet — it just means anyone can *call* this specific
   script endpoint. The shared secret above is what keeps it safe.)
4. Click **Deploy**. The first time, Google will ask you to authorize the script — approve it
   (it's your own script, running under your own account).
5. Copy the **Web App URL** it gives you — looks like:
   `https://script.google.com/macros/s/AKfycb.../exec`

## 4. Wire it into the widget
Open `forma-re-widget.html` and find these two lines near the `askClaude` function:

```javascript
const UNANSWERED_WEBHOOK_URL = "";
const UNANSWERED_WEBHOOK_SECRET = "";
```

Fill both in:

```javascript
const UNANSWERED_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycb.../exec";
const UNANSWERED_WEBHOOK_SECRET = "formare-9f81xk"; // same string as SHARED_SECRET in the script
```

That's it — no other code needs to change.

## 5. Test it
Ask the widget something clearly outside the knowledge base (e.g. "what's our stance on remote
work for interns in Antarctica"). Within a few seconds you should see a new row in the sheet and
an email land in the HR inbox.

## Notes & limits
- Apps Script has generous but not unlimited quotas (well beyond what an internal tool like this
  needs — think thousands of calls/day on a free personal Google account).
- If you ever want to disable this without touching the script, just clear out
  `UNANSWERED_WEBHOOK_URL` in the widget — the bot still works, it just stops reporting misses.
- This works today, in the current Claude.ai-hosted version of the widget — it does **not** need
  the Vercel migration, since it's just the browser calling Google's servers directly.
