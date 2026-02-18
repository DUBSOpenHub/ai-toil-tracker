# 🎬 Video Walkthrough: AI First Toil Tracker

A step-by-step visual guide to getting started with the AI First Toil Tracker. Follow along to fork the repo, submit your first toil idea, and watch the AI agent triage it automatically.

> 🎥 **Video coming soon!** A full walkthrough video will be linked here once available.

<!-- Replace the link below with your actual video URL (YouTube, Loom, etc.) -->
```
📺 Video placeholder: [Paste YouTube or Loom link here]

Example embed:
[![Watch the walkthrough](https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg)](https://www.youtube.com/watch?v=VIDEO_ID)
```

---

## 📖 Table of Contents

1. [Fork the Repo](#1--fork-the-repo)
2. [Setup](#2--setup)
3. [Submit Your First Toil Idea](#3--submit-your-first-toil-idea)
4. [Watch AI Triage](#4--watch-ai-triage)
5. [Log a Win](#5--log-a-win)
6. [Tips for First-Time GitHub Users](#-tips-for-first-time-github-users)

---

## 1. 🍴 Fork the Repo

Fork the repository to get your own copy with all templates, workflows, and docs included.

1. Navigate to the [AI First Toil Tracker](https://github.com/DUBSOpenHub/ai-first-toil-tracker) repository
2. Click the **Fork** button in the upper-right corner
3. Select your GitHub account or organization as the destination
4. Wait for the fork to complete — you'll be redirected to your copy

**Expected outcome:** You now have `your-username/ai-first-toil-tracker` with all files, issue templates, and GitHub Actions workflows.

> 📸 *Screenshot placeholder: Show the Fork button location on the repo page and the resulting forked repo.*

---

## 2. 🔧 Setup

Enable the AI triage workflow and configure your Slack integration.

1. Go to the **Actions** tab in your forked repo
2. Click **"I understand my workflows, go ahead and enable them"** to activate GitHub Actions
3. Open `.github/ISSUE_TEMPLATE/config.yml` and replace `<YOUR_ORG>/<YOUR_REPO>` with your fork's path (e.g., `my-org/ai-first-toil-tracker`)
4. Update the Slack reminder URL with your fork's issue link (see [Slack Setup](../README.md#slack-setup))
5. Verify the **Labels** exist in your repo (Settings → Labels) — they should be copied from the original

**Expected outcome:** GitHub Actions are enabled, URLs point to your fork, and your repo is ready to receive toil ideas.

> 📸 *Screenshot placeholder: Show the Actions tab with the "enable workflows" banner and the config.yml file being edited.*

---

## 3. 📝 Submit Your First Toil Idea

Use the built-in issue template to log a repetitive task.

1. Click **Issues** → **New Issue**
2. Select the **"Toil Automation Idea"** template
3. Fill in the form fields:
   - **Your GitHub handle** — e.g., `@your-username`
   - **What's the toil?** — Describe the repetitive task
   - **How often?** — Select from the dropdown (daily, weekly, etc.)
   - **How long does it take?** — Estimate per occurrence
   - **Who is affected?** — Just you, your team, or multiple teams
4. Click **Submit new issue**

**Expected outcome:** A new issue is created with the `toil` and `triage` labels automatically applied.

> 📸 *Screenshot placeholder: Show the issue template form filled out with example data and the submit button.*

---

## 4. 🤖 Watch AI Triage

The AI agent processes your issue automatically — no manual triage needed.

1. After submitting, wait approximately 30 seconds
2. Refresh the issue page
3. Observe the AI triage comment that appears, which includes:
   - **Toil Score** — calculated as frequency × time × people
   - **Priority level** — color-coded (🔴🟠🟡🔵⚪)
   - **Estimated monthly time saved** if automated
   - **Suggested automation approach** — a specific recommendation from AI
4. Check the labels — the `triage` label is removed and frequency/impact labels are added

**Expected outcome:** Your issue now has an AI-generated triage report comment, appropriate labels, and a suggested automation approach.

> 📸 *Screenshot placeholder: Show the AI triage comment on an issue with the score breakdown, priority label, and suggested automation approach.*

---

## 5. 🎉 Log a Win

When you've automated a toil item, celebrate by logging the win!

1. Click **Issues** → **New Issue**
2. Select the **"Log Completed Automation"** template
3. Fill in the details:
   - **Which toil was automated?** — Link to the original issue
   - **What was built?** — Describe the automation (script, GitHub Action, agent, etc.)
   - **Time saved** — Estimate the hours saved per week or month
4. Click **Submit new issue**
5. The original toil issue can now be labeled `automated` and closed

**Expected outcome:** A win is logged with measurable time savings. Your team can track cumulative ROI from all automations.

> 📸 *Screenshot placeholder: Show the Log Completed Automation form and a closed toil issue with the `automated` label.*

---

## 💡 Tips for First-Time GitHub Users

New to GitHub? Here are some tips to help you get started:

- **What is a fork?** A fork is your personal copy of someone else's repository. You can make changes without affecting the original project.
- **What are Issues?** Issues are like to-do items or bug reports. In this project, we use them to track toil ideas and automation wins.
- **What are Labels?** Labels are colored tags on issues that help categorize and prioritize them (e.g., `high-impact`, `quick-win`).
- **What are GitHub Actions?** Automated workflows that run when something happens in your repo — like when a new issue is created. The AI triage runs as a GitHub Action.
- **How do I enable Actions?** Go to the **Actions** tab in your repo and click the button to enable them. This is required after forking.
- **Where do I find my issues?** Click the **Issues** tab at the top of your repo. Use filters and labels to sort them.
- **I don't see the AI comment on my issue.** Make sure GitHub Actions are enabled (step 2 in Setup). Check the Actions tab for any workflow run errors.
- **Can I use this without Slack?** Yes! The Slack reminder is optional. You can bookmark the issue template link and share it however you like.

---

## 📚 More Resources

- [Scoring Guide](scoring-guide.md) — How toil scores are calculated
- [Triage Workflow](triage-workflow.md) — The full AI triage process explained
- [ROI Tracking](roi-tracking.md) — Measure and share your team's automation impact
- [Examples](examples.md) — Common toil patterns to inspire ideas
