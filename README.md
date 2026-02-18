# 🤖 AI First - Toil Tracker

**Stop doing repetitive work. Start automating it.**

Every team has toil - the manual, repetitive tasks that eat up time and could be handled by an agent or script. This repo gives your team a simple, ready-to-use system to surface that toil, track it, and eliminate it.

> 💡 **This is for any team.** Fork it, set up a weekly Slack reminder, and start collecting ideas in under 10 minutes. No code required.

## How AI Is Used

This isn't just a tracker - AI is built into the workflow:

| What happens | How AI does it |
|-------------|---------------|
| Someone submits a toil idea | A **GitHub Actions workflow** fires automatically |
| The idea needs to be scored | AI **parses the form fields** and calculates the toil score (frequency x time x people) |
| The idea needs labels | AI **applies the right frequency label** (🔴🟠🟡🔵⚪) and flags high-impact items |
| The team needs to know what to automate | AI **estimates monthly time saved** and ranks by ROI |
| Nobody knows how to automate it | AI **suggests a specific automation approach** (GitHub Action, script, agent, etc.) using GitHub Models |
| The idea sits untriaged | AI **removes the triage label** - no manual triage needed |

**The human role:** Describe the pain. The AI handles the rest.

## Why Use This

For anyone doing repetitive work who wants to apply AI-first thinking, AI First - Toil Tracker makes it easy to:

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
                        ├─ 6. Calls GitHub Models API to suggest how to automate it
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

1. **[Fork this repo](../../fork)** - you get everything: issue templates, labels, workflows, scoring guides, and docs
2. **Enable GitHub Actions** - go to the **Actions** tab in your fork and click **"I understand my workflows, go ahead and enable them"**
3. **Update two URLs** - in the [Slack Setup](#slack-setup) section, replace `<YOUR_ORG>/<YOUR_REPO>` with your fork's path. Also update the Slack channel link in `.github/ISSUE_TEMPLATE/config.yml`
4. **Create a Slack reminder** - follow the [3-step Slack setup](#slack-setup) to ping your team every Friday
5. **Start collecting ideas** - your team clicks the link, fills out a 2-minute form, done

That's it. Your team now has a living backlog of automation opportunities.

### ⚡ Quick Setup

After forking, run the setup script to automatically replace all repo references with your fork's path:

```bash
./setup.sh              # auto-detects org/repo from your git remote
# or
./setup.sh myorg/myrepo # pass it explicitly
```

This updates `README.md`, `SECURITY.md`, and `.github/workflows/stale.yml` in one step.

---

## Where Everything Lives

All toil ideas and automation proposals are tracked as **GitHub Issues** in this repo. Bookmark these views:

| View | Link |
|------|------|
| 📋 **All toil ideas** | [View](../../issues?q=is%3Aissue+label%3Atoil+sort%3Acreated-desc) |
| 🏷️ **Needs triage** | [View](../../issues?q=is%3Aissue+label%3Atriage+is%3Aopen+sort%3Acreated-desc) |
| 🔨 **In progress** | [View](../../issues?q=is%3Aissue+label%3Ain-progress+is%3Aopen+sort%3Acreated-desc) |
| ✅ **Automated (done)** | [View](../../issues?q=is%3Aissue+label%3Aautomated+sort%3Acreated-desc) |
| 🎉 **Wins & time saved** | [View](../../issues?q=is%3Aissue+%22%5BWIN%5D%22+label%3Aautomated+sort%3Acreated-desc) |

> **Tip:** Each issue shows the submitter's name, frequency (🔴🟠🟡🔵⚪), time cost, and who's affected - all visible in the issue body. Sort by newest, most commented, or filter by label to find what matters most.

## How It Works

1. **Weekly Slack ping** - Every Friday at 10:00 AM PST, the team is asked: _"What toil could be automated?"_
2. **File an issue** - Use the [Toil Automation Idea](../../issues/new?template=toil-idea.yml) template to log ideas
3. **AI auto-triages** - An agent scores the idea, applies labels, estimates time saved, and suggests an automation approach
4. **Propose a solution** - Use the [Automation Proposal](../../issues/new?template=automation-proposal.md) template
5. **Build & ship** - Automate the toil and eliminate it for good
6. **Log the win** - Use the [Log Completed Automation](../../issues/new?template=log-win.yml) template to record time saved 🎉

## Quick Links

- [📝 Submit a toil idea](../../issues/new?template=toil-idea.yml)
- [🔧 Propose an automation](../../issues/new?template=automation-proposal.md)
- [📋 View all toil ideas](../../issues?q=is%3Aissue+label%3Atoil)
- [🏷️ Triage queue](../../issues?q=is%3Aissue+label%3Atriage+is%3Aopen)
- [✅ Automated (completed)](../../issues?q=is%3Aissue+label%3Aautomated)
- [🎉 Log a win](../../issues/new?template=log-win.yml)

## 📊 Dashboard

A live metrics dashboard is available via GitHub Pages. It shows total toil ideas, wins logged, estimated time saved, frequency breakdown, and top submitters — all fetched client-side from the GitHub API.

**To enable it:**
1. Go to your repo's **Settings → Pages**
2. Set the source to **Deploy from a branch**
3. Select the **main** branch and **`/docs`** folder
4. Save — your dashboard will be live at `https://<owner>.github.io/<repo>/`

> The dashboard is a single self-contained HTML file at [`docs/index.html`](docs/index.html) with no dependencies.

## Documentation

| Doc | Description |
|-----|-------------|
| [Scoring Guide](docs/scoring-guide.md) | How to prioritize toil by impact |
| [Triage Workflow](docs/triage-workflow.md) | Step-by-step process for reviewing ideas |
| [ROI Tracking](docs/roi-tracking.md) | Measure and share time saved |
| [Examples](docs/examples.md) | Common toil patterns to inspire your team |
| [Webhook Setup](docs/WEBHOOK_SETUP.md) | Send triage notifications to Teams, Discord, or any webhook |
| [Video Walkthrough](docs/VIDEO_WALKTHROUGH.md) | Step-by-step visual guide to get started |
| [Contributing](CONTRIBUTING.md) | How to submit ideas and build automations |
| [Code of Conduct](CODE_OF_CONDUCT.md) | Community standards |
| [Security](SECURITY.md) | Security policy for automations |

## Slack Setup

Set up a weekly reminder in your team channel using Slack Workflow Builder:

1. Open Slack → **Tools** → **Workflow Builder** → **Create Workflow**
2. Trigger: **On a schedule** → Every Friday at 10:00 AM PST
3. Add step: **Send a message to a channel** (e.g. `#team-toil`)
4. Paste this message:

> 🤖 **Weekly Toil Check-in**
>
> What repetitive work are you doing that could be automated with an agent?
>
> 👉 File it here: `https://github.com/<YOUR_ORG>/<YOUR_REPO>/issues/new?template=toil-idea.yml` - takes 2 minutes.
>
> Not sure what counts? Check out the examples in the repo's `docs/examples.md`.

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

### 🔔 Webhook Notifications (optional)
- Optionally sends triage results to **Microsoft Teams**, **Discord**, or any **generic webhook**
- Configure by adding a `WEBHOOK_URL` secret or variable — see [Webhook Setup](docs/WEBHOOK_SETUP.md)
- Skips gracefully if not configured — no setup required

### 🗂️ Stale Issue Cleanup (monthly)
- Nudges toil ideas with no activity after 30 days
- Auto-closes after 60 days of inactivity
- Exempts issues labeled `in-progress`, `automated`, or `high-impact`

## License

[MIT](LICENSE)

---

## 🐙 Built with Love

Made with 💜 by DUBSOpenHub to help more people discover the joy of GitHub Copilot CLI.

Let's build! 🚀✨
