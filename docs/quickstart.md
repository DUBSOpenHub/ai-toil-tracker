# ⚡ Quickstart — Up and Running in 10 Minutes

Get your team's toil tracker live with zero configuration.

## Step 1: Fork the Repo
- Click **Fork** (top right) on the [AI Toil Tracker](https://github.com/DUBSOpenHub/ai-toil-tracker) page
- Keep the default settings and click **Create fork**

## Step 2: Enable GitHub Actions
- Go to the **Actions** tab in your new fork
- Click the green **"I understand my workflows, go ahead and enable them"** button
- This enables the AI triage, dashboard, and celebration automations

> **Note:** The AI triage workflow uses [GitHub Models](https://docs.github.com/en/github-models) to generate automation suggestions. This requires `models: read` permission, which is available on GitHub Team/Enterprise plans and for public repos. If your org doesn't have Models access, the triage still works — you'll get scores and labels, just not AI-generated suggestions.

## Step 3: Generate Your First Dashboard
- Go to **Actions** → **Dashboard Data** → **Run workflow** → **Run workflow**
- Wait ~30 seconds for it to complete
- Go to **Settings** → **Pages** → Source: **Deploy from a branch** → Branch: `main`, folder: `/docs` → **Save**
- Your dashboard is now live at `https://<your-org>.github.io/<your-repo>/dashboard/`

## Step 4: Submit Your First Toil Idea
- Go to **Issues** → **New Issue** → Choose **🤖 Toil Automation Idea**
- Fill out the form: describe a repetitive task, pick frequency/time/people
- Click **Submit new issue**
- Within ~30 seconds, the AI agent will score it, label it, and post a triage report

## Step 5: Set Up the Weekly Reminder
- In Slack, go to **Tools** → **Workflow Builder** → **Create Workflow**
- Trigger: **On a schedule** → Every Friday at 10:00 AM
- Action: **Send a message** with a link to your issue form:
  `https://github.com/<YOUR_ORG>/<YOUR_REPO>/issues/new?template=toil-idea.yml`

## What's Next?
- 📋 [View all toil ideas](../../issues?q=is%3Aissue+label%3Atoil+sort%3Acreated-desc)
- 📊 Check the dashboard weekly to track automation progress
- 🔧 [Propose an automation](../../issues/new?template=automation-proposal.md) for the highest-scoring items
- 🎉 [Log a win](../../issues/new?template=log-win.yml) when you eliminate a toil!
