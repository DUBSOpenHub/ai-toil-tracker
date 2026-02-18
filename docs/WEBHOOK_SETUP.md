# 🔔 Webhook Notification Setup

The AI Triage workflow can optionally send a webhook notification after triaging each toil idea. This works with Microsoft Teams, Discord, or any service that accepts JSON via HTTP POST.

## How It Works

After the AI triage comment is posted on the issue, the workflow checks for a `WEBHOOK_URL` secret or repository variable. If configured, it sends the triage results as a JSON payload to that URL. If not configured, the step is skipped gracefully.

## JSON Payload Format

Every webhook receives this JSON body:

```json
{
  "text": "🤖 New Toil Idea Triaged (#42)\nScore: 75 | 🔴 Critical - automate immediately\nTime saved: ~75 hours/month\n...",
  "title": "🤖 New Toil Idea Triaged (#42)",
  "toil_score": 75,
  "priority": "🔴 Critical - automate immediately",
  "monthly_saved": "~75 hours/month",
  "suggestion": "A GitHub Action triggered on release events could...",
  "issue_url": "https://github.com/your-org/your-repo/issues/42"
}
```

The `text` field provides a plain-text summary compatible with most webhook services.

---

## Microsoft Teams (Incoming Webhook)

1. In your Teams channel, click **⋯** → **Connectors** → **Incoming Webhook** → **Configure**
2. Give it a name (e.g. "Toil Tracker") and optionally upload an icon
3. Click **Create** and copy the webhook URL
4. In your GitHub repo, go to **Settings → Secrets and variables → Actions**
5. Add a new **repository secret** named `WEBHOOK_URL` with the copied URL

Teams uses the `text` field from the payload to render the message card.

> **Note:** Microsoft is transitioning from Office 365 Connectors to the Workflows app. If Incoming Webhook is unavailable, create a workflow in Teams with the **"When a Teams webhook request is received"** trigger and use that URL instead.

---

## Discord

1. In your Discord server, go to **Server Settings → Integrations → Webhooks**
2. Click **New Webhook**, choose a channel, and copy the webhook URL
3. Append `/slack` to the URL (e.g. `https://discord.com/api/webhooks/123/abc/slack`) — this enables Discord's Slack-compatible format which reads the `text` field
4. In your GitHub repo, go to **Settings → Secrets and variables → Actions**
5. Add a new **repository secret** named `WEBHOOK_URL` with the modified URL

> **Tip:** The `/slack` suffix tells Discord to parse the `text` field as the message body. Without it, Discord expects a `content` field instead.

---

## Generic Webhook

Any service that accepts an HTTP POST with a JSON body will work. Set `WEBHOOK_URL` to your endpoint and parse the JSON payload fields listed above.

Examples of compatible services:
- **Zapier** — use a "Catch Hook" trigger
- **Make (Integromat)** — use a "Custom Webhook" module
- **n8n** — use a "Webhook" trigger node
- **AWS Lambda / Azure Functions** — expose an HTTP endpoint
- **IFTTT** — use the "Webhooks" service

---

## Configuration Options

You can set `WEBHOOK_URL` as either:

| Method | Where to set | When to use |
|--------|-------------|-------------|
| **Repository secret** | Settings → Secrets → Actions | Recommended — keeps the URL private |
| **Repository variable** | Settings → Variables → Actions | Use if the URL doesn't need to be secret |

The workflow checks secrets first, then falls back to variables.

## Troubleshooting

- **Webhook not firing?** Verify `WEBHOOK_URL` is set in your repo's secrets or variables.
- **Teams not rendering?** Ensure the connector is active and the URL hasn't expired.
- **Discord showing nothing?** Make sure you appended `/slack` to the webhook URL.
- **Check workflow logs** — the webhook step logs the HTTP status code for debugging.
