# 🤖 AI Toil Tracker

**Stop doing repetitive work. Start automating it.**

Every team has busywork - the manual, repetitive tasks that eat up time and could be handled by an agent or script. This tool gives your team a simple way to track it and fix it.

> 💡 **This is for any team.** Use this template, set up a weekly Slack reminder, and start collecting ideas in under 10 minutes. No code required.

## See It in Action

<p align="center">
  <a href="https://dubsopenhub.github.io/ai-toil-tracker/dashboard/">
    <img src="docs/assets/dashboard-preview.png?v=2" alt="AI Toil Tracker Dashboard — glass morphism UI with Pipeline Momentum, Time Reclaimed, and Toil Eliminated gauges" width="720">
  </a>
</p>

<p align="center"><strong><a href="https://dubsopenhub.github.io/ai-toil-tracker/dashboard/">👉 Try the live demo dashboard</a></strong></p>

> ⚡ **Get started fast!** [Use this template](https://github.com/DUBSOpenHub/ai-toil-tracker/generate) to create your own Toil Tracker in one click.

> 🎯 **[See the live demo dashboard →](https://dubsopenhub.github.io/ai-toil-tracker/dashboard/)** — 12 sample toil items, 5 shipped, full glass morphism UI with Pipeline Momentum, Time Reclaimed, and Toil Eliminated gauges.

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

For anyone doing repetitive work who wants to apply AI-first thinking, AI Toil Tracker makes it easy to:

- 🎯 **Capture** - Quickly log toil ideas from a single Slack link in under 2 minutes
- 🤖 **Identify** - AI auto-scores every idea and surfaces the highest-leverage opportunities
- ⚡ **Automate** - Get AI-suggested solutions with agents, scripts, and workflows
- 📈 **Measure** - Track time saved and see the real impact on your team
- 🔁 **Build the habit** - A weekly Slack prompt keeps the team thinking AI-first

All within Slack and GitHub - no new tools, no new logins. Just a way to find leverage for you and your team.

## What Happens When You Submit

Here's exactly what the AI agent does when someone files a toil idea:

```
You click the Slack link
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

---

## 🍴 Get Started (Any Team)

### Quick Start Checklist (10 minutes)

- ✅ **Fork & enable Actions** – fork this repo, then click **Actions → Enable workflows** so the automations start running.
- 🔐 **Set secrets up front** – add any integration tokens under **Settings → Secrets and variables → Actions** before enabling notifications.
- 🔁 **Update contact links** – edit `.github/ISSUE_TEMPLATE/config.yml` plus the Slack reminder text below so they point at _your_ channels.
- 📣 **Schedule the reminder** – configure the Slack Workflow Builder so the team gets nudged every week.
- 🌐 **Publish the dashboard** – enable GitHub Pages (`/docs` folder) so stakeholders can view `https://<org>.github.io/<repo>/dashboard/` immediately.

1. **Copy this project** - Click "Fork" (top right) to get your own copy with all the tools included
2. **Turn on the automation** — Go to the **Actions** tab and click the green **"Enable workflows"** button (GitHub shows a confirmation — it's safe to proceed)
3. **Update the links** - In the [Slack Setup](#slack-setup) section, replace `<YOUR_ORG>/<YOUR_REPO>` with your new link.
4. **Set a reminder** - Follow the [Slack setup](#slack-setup) to ping your team every Friday
5. **Start collecting ideas** - Your team clicks the link, fills out a 2-minute form, done

That's it. Your team now has a living backlog of automation opportunities.

---

## Where Everything Lives

All toil ideas and automation proposals are tracked as **GitHub Issues** in this repo. Bookmark these views:

| View | Link |
|------|------|
| 📊 **Dashboard** | Enable GitHub Pages (see [Dashboard setup](#-dashboard)) |
| 📋 **All toil ideas** | [View](../../issues?q=is%3Aissue+label%3Atoil+sort%3Acreated-desc) |
| ✅ **Automated (done)** | [View](../../issues?q=is%3Aissue+label%3Aautomated+sort%3Acreated-desc) |

> **Tip:** Each issue shows the submitter's name, frequency (🔴🟠🟡🔵⚪), time cost, and who's affected - all visible in the issue body. Sort by newest, most commented, or filter by label to find what matters most.

## 📊 Dashboard

A visual dashboard lets your team and manager see all ideas, filter by team, and track time savings — all in one place.

### What's on the Dashboard

- **Summary Cards** — Total ideas, wins, hours saved/month, automation rate, in-progress, and high-impact counts
- **Team & Individual Breakdown** — Per-person and per-team stats: ideas submitted, automated, and estimated monthly hours saved
- **Toil Ideas Table** — Every toil idea with sortable columns, inline-editable scores, color-coded priority rows, and status badges
- **🚀 Automate Button** — Choose your tool: **GitHub Copilot CLI** (copies a command). Toggle in the dashboard header
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

1. **Weekly Slack ping** - Every Friday at 10:00 AM PST, the team is asked: _"What toil could be automated?"_
2. **File an issue** - Use the [Toil Automation Idea](../../issues/new?template=toil-idea.yml) template to log ideas
3. **AI auto-triages** - An agent scores the idea, applies labels, estimates time saved, and suggests an automation approach
4. **Propose a solution** - Use the [Automation Proposal](../../issues/new?template=automation-proposal.md) template
5. **Build & ship** - Automate the toil and eliminate it for good
6. **Log the win** - Use the [Log Completed Automation](../../issues/new?template=log-win.yml) template to record time saved 🎉
7. **Review the dashboard** - See all toil ideas, scores, and time saved by team at a glance

## 🧠 Architecture at a Glance

| Loop | Purpose | Key Files |
|------|---------|-----------|
| Capture | Collect toil, automation proposals, and wins via GitHub issue forms | `.github/ISSUE_TEMPLATE/*.yml`, `docs/examples.md` |
| Score & label | AI triage parses form answers, scores impact, labels issues | `.github/workflows/ai-triage.yml`, `docs/triage-workflow.md` |
| Visualize | Scheduled workflow generates `docs/dashboard/dashboard-data.json`, GitHub Pages renders `docs/dashboard/index.html` | `.github/workflows/dashboard-data.yml`, `docs/dashboard/index.html` |
| Celebrate | Wins close the original toil and monthly ROI summaries brief leadership | `.github/workflows/win-celebration.yml`, `.github/workflows/monthly-roi-summary.yml`, `docs/roi-tracking.md` |

Each loop is independent—disable or extend one without touching the others—and all data flows through GitHub Issues plus JSON stored in `docs/dashboard/`.

## Quick Links

- [📝 Submit a toil idea](../../issues/new?template=toil-idea.yml)
- [🔧 Propose an automation](../../issues/new?template=automation-proposal.md)
- [📋 View all toil ideas](../../issues?q=is%3Aissue+label%3Atoil)
- [✅ Automated (completed)](../../issues?q=is%3Aissue+label%3Aautomated)

## Documentation

| Doc | Description |
|-----|-------------|
| [PRD](docs/PRD.md) | Product requirements, scoring details, and success metrics |
| [Architecture](docs/architecture.md) | System design with Mermaid diagrams |
| [Security](SECURITY.md) | Threat model, secret management, and AI data handling |
| [Examples](docs/examples.md) | Common toil patterns to inspire your team |
| [Scoring Guide](docs/scoring-guide.md) | How the toil score is calculated |
| [Contributing](CONTRIBUTING.md) | How to submit ideas and build automations |
| [Dashboard](docs/dashboard/index.html) | Interactive team dashboard with time savings |
| [Quickstart](docs/quickstart.md) | Get your team running in 10 minutes |
| [Troubleshooting](docs/troubleshooting.md) | Common issues and how to fix them |

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

> ⚠️ **Replace** `<YOUR_ORG>/<YOUR_REPO>` with your actual repo path (e.g. `your-org/toil-tracker`).

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

### 🗂️ Stale Issue Cleanup (monthly)
- Nudges toil ideas with no activity after 30 days
- Auto-closes after 60 days of inactivity
- Exempts issues labeled `in-progress`, `automated`, or `high-impact`

### 📊 Dashboard Data (daily + on issue changes)
- Generates `dashboard-data.json` with all toil metrics
- Powers the interactive dashboard on GitHub Pages
- Runs automatically — no manual updates needed

## 🧭 Maintainer Checklist

- **Trigger a data refresh after forking** — run the `Generate Dashboard Data` workflow once (Actions → Run workflow) so `docs/dashboard/dashboard-data.json` reflects your repo instead of the sample data.
- **Verify secrets quarterly** — confirm any optional tokens still work, or remove the notification steps to avoid failing Actions runs.
- **Customize contact links** — replace the placeholder Slack URLs in `.github/ISSUE_TEMPLATE/config.yml` and the reminder snippets below so contributors know where to coordinate.
- **Review the forms annually** — ensure the dropdown options in `.github/ISSUE_TEMPLATE/*.yml` still match how you categorize toil; update the scoring constants if you add new values.
- **Keep Actions pinned SHAs current** — accept Dependabot PRs or manually bump the pinned versions so security patches continue to flow.

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

## ✨ Contributors

Thanks to these wonderful humans (and AIs) who help make this project better:

<!-- ALL-CONTRIBUTORS-LIST:START -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="160px">
        <a href="https://github.com/DUBSOpenHub"><img src="https://avatars.githubusercontent.com/DUBSOpenHub" width="80px;" alt="DUBSOpenHub"/><br /><sub><b>DUBSOpenHub</b></sub></a><br />
        🚇 🧑‍🔧
      </td>
      <td align="center" valign="top" width="160px">
        <a href="https://github.com/Copilot"><img src="docs/copilot-avatar.png" width="80px;" alt="GitHub Copilot"/><br /><sub><b>GitHub Copilot</b></sub></a><br />
        💻 📖 🎨
      </td>
      <td align="center" valign="top" width="160px">
        <a href="https://githubnext.com/projects/copilot-cli"><img src="docs/copilot-cli-avatar.png" width="80px;" alt="GitHub Copilot CLI"/><br /><sub><b>Copilot CLI</b></sub></a><br />
        💻 📖 🎨 🤔 📆
      </td>
    </tr>
  </tbody>
</table>
<!-- ALL-CONTRIBUTORS-LIST:END -->

> 💻 code · 📖 docs · 🤔 ideas · 📆 project mgmt · 🚇 infra · 🧑‍🔧 maintenance · 🎨 design

---

## 🐙 Built with Love

Created with 💜 by DUBSOpenHub to help more people discover the joy of GitHub Copilot CLI.

Let's build! 🚀✨
