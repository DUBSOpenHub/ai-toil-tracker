# 🤖 AI First - Toil Tracker

**Stop doing repetitive work. Start automating it.**

Every team has busywork - the manual, repetitive tasks that eat up time and could be handled by an agent or script. This tool gives your team a simple way to track it and fix it.

> 💡 **This is for any team.** Fork it, set up a weekly Slack or Teams reminder, and start collecting ideas in under 10 minutes. No code required.

## How AI Is Used

This isn't just a tracker - AI is built into the workflow:

| What happens | How AI does it |
|-------------|---------------|
| Someone submits an idea | A **workflow** runs automatically |
| The idea needs a score | AI **reads the form** and calculates the impact (frequency x time x people) |
| The idea needs labels | AI **adds a label** (🔴🟠🟡🔵⚪) based on how often it happens |
| The team needs a plan | AI **estimates time saved** and suggests how to automate it |

**The human role:** Describe the pain. The AI handles the rest.

## Why Use This

For anyone doing repetitive work who wants to apply AI-first thinking, AI First - Toil Tracker makes it easy to:

- 🎯 **Capture** - Quickly log toil ideas from a single Slack or Teams link in under 2 minutes
- 🤖 **Identify** - AI auto-scores every idea and surfaces the highest-leverage opportunities
- ⚡ **Automate** - Get AI-suggested solutions with agents, scripts, and workflows
- 📈 **Measure** - Track time saved and see the real impact on your team
- 🔁 **Build the habit** - A weekly Slack or Teams prompt keeps the team thinking AI-first

All within Slack or Teams and GitHub - no new tools, no new logins. Just a way to find leverage for you and your team.

## What Happens When You Submit

Here's exactly what the AI agent does when someone files a toil idea:

```
You click the Slack or Teams link
    └─> GitHub issue form opens
         └─> You fill it out (name, toil, frequency, time, people)
              └─> You hit Submit
                   └─> 🤖 AI Agent kicks in automatically
                        │
                        ├─ 1. Reads your form answers
                        ├─ 2. Calculates your toil score (frequency x time x people)
                        ├─ 3. Applies the frequency label (🔴🟠🟡🔵⚪)
                        ├─ 4. Flags it as high-impact if score is 20+
                        ├─ 5. Estimates how much team time this wastes per month
                        ├─ 6. Uses GitHub's AI to suggest how to automate it
                        ├─ 7. Posts a triage comment with the full breakdown
                        └─ 8. Removes the "triage" label (done - no human needed)
```

**Example agent comment on your issue:**

> ## 🤖 AI Triage Report
> **Toil Score:** Frequency (5) x Time (3) x People (5) = **75**
> **Priority:** 🔴 Critical - automate immediately
> **Estimated team time saved if automated:** ~75 hours/month
>
> ### 💡 Suggested Automation Approach
> A GitHub Action triggered on release events could pull PR titles and
> auto-generate release notes into a markdown file, then post a summary
> to the team Slack channel. Estimated effort: 2-3 hours.

The whole process takes about 30 seconds. No one needs to triage, score, or label anything.

> 💡 **Using Microsoft Teams?** The AI triage workflow can also post notifications to a Teams channel via an Incoming Webhook. See the [Teams Setup](#microsoft-teams-setup) section.

---

## 🍴 Get Started (Any Team)

1. **Copy this project** - Click "Fork" (top right) to get your own copy with all the tools included
2. **Turn on the automation** — Go to the **Actions** tab and click the green **"Enable workflows"** button (GitHub shows a confirmation — it's safe to proceed)
3. **Update the links** - In the [Slack Setup](#slack-setup) or [Teams Setup](#microsoft-teams-setup) section, replace `<YOUR_ORG>/<YOUR_REPO>` with your new link.
4. **Set a reminder** - Follow the [Slack setup](#slack-setup) or [Teams setup](#microsoft-teams-setup) to ping your team every Friday
5. **Start collecting ideas** - Your team clicks the link, fills out a 2-minute form, done

That's it. Your team now has a living backlog of automation opportunities.

---

## Where Everything Lives

All toil ideas and automation proposals are tracked as **GitHub Issues** in this repo. Bookmark these views:

| View | Link |
|------|------|
| 📊 **Dashboard** | Enable GitHub Pages (see [Dashboard setup](#-dashboard)) |
| 📋 **All toil ideas** | [View](../../issues?q=is%3Aissue+label%3Atoil+sort%3Acreated-desc) |
| 🏷️ **Needs triage** | [View](../../issues?q=is%3Aissue+label%3Atriage+is%3Aopen+sort%3Acreated-desc) |
| 🔨 **In progress** | [View](../../issues?q=is%3Aissue+label%3Ain-progress+is%3Aopen+sort%3Acreated-desc) |
| ✅ **Automated (done)** | [View](../../issues?q=is%3Aissue+label%3Aautomated+sort%3Acreated-desc) |
| 🎉 **Wins & time saved** | [View](../../issues?q=is%3Aissue+%22%5BWIN%5D%22+label%3Aautomated+sort%3Acreated-desc) |

> **Tip:** Each issue shows the submitter's name, frequency (🔴🟠🟡🔵⚪), time cost, and who's affected - all visible in the issue body. Sort by newest, most commented, or filter by label to find what matters most.

## 📊 Dashboard

A visual dashboard lets your team and manager see all ideas, filter by team, and track time savings — all in one place.

### What's on the Dashboard

- **Summary Cards** — Total ideas, wins, hours saved/month, automation rate, in-progress, and high-impact counts
- **Team & Individual Breakdown** — Per-person and per-team stats: ideas submitted, automated, and estimated monthly hours saved
- **Toil Ideas Table** — Every toil idea with sortable columns, inline-editable scores, color-coded priority rows, and status badges
- **🚀 Automate Button** — One click copies a ready-to-run Copilot command to start automating that specific item
- **Filters** — Filter by team, category, or status to focus on what matters

### Setting Up the Dashboard

1. **Enable GitHub Pages** — Go to **Settings** → **Pages** → Source: **Deploy from a branch** → Branch: `main`, folder: `/docs` → **Save**
2. **Your dashboard URL** will be: `https://<YOUR_ORG>.github.io/<YOUR_REPO>/dashboard/`
3. **Data updates automatically** — The `dashboard-data.yml` workflow runs daily and on every issue change, committing fresh data to `docs/dashboard/dashboard-data.json`
4. **Works immediately** — The dashboard includes sample data so you can see it right away, even before any real issues are filed

### Editing & Interacting

- **Click any score cell** (Frequency, Time, People) to edit it inline — the toil score recalculates in real time
- **Edits persist** in your browser via localStorage
- **"Save to GitHub"** link opens the issue on GitHub so you can update the actual issue
- **Sort** by clicking any column header
- **Filter** using the dropdowns above the table
- **Print** the dashboard for leadership presentations (print-friendly styling included)

## How It Works

1. **Weekly Slack or Teams ping** - Every Friday at 10:00 AM PST, the team is asked: _"What toil could be automated?"_
2. **File an issue** - Use the [Toil Automation Idea](../../issues/new?template=toil-idea.yml) template to log ideas
3. **AI auto-triages** - An agent scores the idea, applies labels, estimates time saved, and suggests an automation approach
4. **Propose a solution** - Use the [Automation Proposal](../../issues/new?template=automation-proposal.md) template
5. **Build & ship** - Automate the toil and eliminate it for good
6. **Log the win** - Use the [Log Completed Automation](../../issues/new?template=log-win.yml) template to record time saved 🎉
7. **Review the dashboard** - See all toil ideas, scores, and time saved by team at a glance

## Quick Links

- [📝 Submit a toil idea](../../issues/new?template=toil-idea.yml)
- [🔧 Propose an automation](../../issues/new?template=automation-proposal.md)
- [📋 View all toil ideas](../../issues?q=is%3Aissue+label%3Atoil)
- [🏷️ Triage queue](../../issues?q=is%3Aissue+label%3Atriage+is%3Aopen)
- [✅ Automated (completed)](../../issues?q=is%3Aissue+label%3Aautomated)
- [🎉 Log a win](../../issues/new?template=log-win.yml)

## Documentation

| Doc | Description |
|-----|-------------|
| [Scoring Guide](docs/scoring-guide.md) | How to prioritize toil by impact |
| [Triage Workflow](docs/triage-workflow.md) | Step-by-step process for reviewing ideas |
| [ROI Tracking](docs/roi-tracking.md) | Measure and share time saved |
| [Examples](docs/examples.md) | Common toil patterns to inspire your team |
| [Contributing](CONTRIBUTING.md) | How to submit ideas and build automations |
| [Code of Conduct](CODE_OF_CONDUCT.md) | Community standards |
| [Dashboard](docs/dashboard/index.html) | Interactive team dashboard with time savings |
| [Security](SECURITY.md) | Security policy for automations |

## Slack Setup

Set up a weekly reminder in your team channel using Slack Workflow Builder:

1. Open Slack → **Tools** → **Workflow Builder** → **Create Workflow**
2. Trigger: **On a schedule** → Every Friday at 10:00 AM PST
3. Add step: **Send a message to a channel** (e.g. `#team-toil`)
4. Paste this message:

> 🤖 **Weekly Toil Check-in**
>
> What repetitive task should a bot handle for you?
>
> 👉 Log it here: `https://github.com/<YOUR_ORG>/<YOUR_REPO>/issues/new?template=toil-idea.yml` — takes 2 minutes.
>
> Not sure what counts? Check out the examples in the repo's `docs/examples.md`.

> ⚠️ **Replace** `<YOUR_ORG>/<YOUR_REPO>` with your actual repo path (e.g. `DUBSOpenHub/ai-first-toil-tracker`).

## Microsoft Teams Setup

If your team uses Microsoft Teams instead of (or in addition to) Slack, you can set up the same weekly reminder and get AI triage notifications directly in a Teams channel.

### Step 1: Create an Incoming Webhook

1. In Teams, go to your channel → click **⋯** → **Connectors** (or **Manage channel** → **Connectors**)
2. Search for **Incoming Webhook** → click **Configure**
3. Give it a name (e.g. `Toil Tracker Bot`) and optionally upload an icon
4. Click **Create** and **copy the webhook URL**
5. In your forked repo, go to **Settings** → **Secrets and variables** → **Actions** → **New repository secret**
6. Name: `TEAMS_WEBHOOK_URL` — Value: paste the webhook URL

> 💡 Once the `TEAMS_WEBHOOK_URL` secret is set, the AI triage workflow will automatically post triage reports to your Teams channel whenever a new toil idea is submitted.

### Step 2: Set Up a Weekly Reminder

Use **Power Automate** (built into Teams) to send a recurring reminder:

1. Open [Power Automate](https://make.powerautomate.com) → **Create** → **Scheduled cloud flow**
2. Name it `Weekly Toil Reminder`, set it to run **every Friday at 10:00 AM**
3. Add action: **Microsoft Teams → Post message in a chat or channel**
4. Select your team and channel, then paste this message:

> 🤖 **Weekly Toil Check-in**
>
> What repetitive task should a bot handle for you?
>
> 👉 Log it here: `https://github.com/<YOUR_ORG>/<YOUR_REPO>/issues/new?template=toil-idea.yml` — takes 2 minutes.
>
> Not sure what counts? Check out the examples in the repo's `docs/examples.md`.

5. **Save** the flow. Your team will be prompted every Friday in Teams.

> ⚠️ **Replace** `<YOUR_ORG>/<YOUR_REPO>` with your actual repo path (e.g. `DUBSOpenHub/ai-first-toil-tracker`).

## Labels

| Label | Purpose |
|-------|---------|
| `toil` | All toil ideas |
| `triage` | Needs review and prioritization |
| `high-impact` | Saves significant time or affects many people |
| `quick-win` | Could be automated quickly |
| `in-progress` | Automation is being built |
| `automated` | Toil has been eliminated 🎉 |

## Automations

### 🤖 AI Triage (on every new issue)
When a toil idea is submitted, an AI agent automatically:
- **Calculates the toil score** (frequency x time x people)
- **Applies the frequency label** (🔴🟠🟡🔵⚪)
- **Flags high-impact items** (score 20+)
- **Estimates monthly time saved** if automated
- **Suggests an automation approach** using AI
- **Removes the `triage` label** - no manual triage needed
- **Posts to Microsoft Teams** (if `TEAMS_WEBHOOK_URL` secret is configured)

### 🗂️ Stale Issue Cleanup (monthly)
- Nudges toil ideas with no activity after 30 days
- Auto-closes after 60 days of inactivity
- Exempts issues labeled `in-progress`, `automated`, or `high-impact`

### 📊 Dashboard Data (daily + on issue changes)
- Generates `dashboard-data.json` with all toil metrics
- Powers the interactive dashboard on GitHub Pages
- Runs automatically — no manual updates needed

## AI & Data Privacy

This tool uses **GitHub's built-in AI** to generate automation suggestions for each idea. When someone submits an idea:

- The **issue body text** (including your description of the toil) is sent to the AI model
- The AI generates a suggested automation approach
- No data is stored beyond the issue comment

> ⚠️ **Avoid including sensitive information** in toil descriptions — such as customer names, internal credentials, classified system names, or proprietary process details. Keep descriptions focused on the *type* of repetitive work, not the specific data involved.

For teams with strict data classification policies, review your organization's AI usage guidelines before enabling the AI triage workflow. The workflow can be disabled by removing the `ai-triage.yml` file from `.github/workflows/`.

## License

[MIT](LICENSE)

---

## 🐙 Built with Love

Made with 💜 by DUBSOpenHub to help more people discover the joy of GitHub Copilot CLI.

Let's build! 🚀✨
