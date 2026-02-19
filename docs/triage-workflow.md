# Triage Workflow

How toil ideas are scored and prioritized.

> **Note:** The `ai-triage.yml` workflow handles scoring and labeling automatically when an issue is opened. This document explains the methodology for reference and manual overrides.

## Weekly Cadence (Fridays)

1. **Slack prompt fires** at 10:00 AM PST - team members reply with toil they've encountered
2. Team members **file issues** using the [Toil Automation Idea](../../issues/new?template=toil-idea.yml) template
3. AI triage scores and labels the issue automatically — no manual triage needed

## Scoring Methodology

The AI triage workflow applies the following for each new issue:

### 1. Validate
- Is this actually toil (repetitive, automatable) or a one-off task?
- Is it a duplicate of an existing issue?

### 2. Score
- Formula: `**Toil Score:** (Frequency (X) × Time (X) × People (X)) + Bonus (X) = **XX**`
- Bonus factors: ❌ Error-prone (+2), 😤 Morale killer (+1), 🔗 Blocking (+3)

### 3. Label
- The `triage` label is removed automatically
- Priority labels are applied based on score:
  - Score 40+ → `high-impact`
  - Quick to automate → `quick-win`
  - Both → add both labels

### 4. Assign (optional)
- If someone volunteers to build the automation, assign them
- Move label to `in-progress`

## Completing an Automation

When the automation is live and verified:

1. Comment on the issue with a link to the automation (PR, Action, script, etc.)
2. Remove `in-progress`, add `automated`
3. Close the issue
4. 🎉 Celebrate in the Slack channel!

## Metrics to Track

Over time, measure your team's progress:

- **Total toil ideas submitted** - Are people engaged?
- **Ideas automated** - How many have been eliminated?
- **Estimated time saved per week** - Sum of (frequency × time) for all automated items
- **Average time from idea → automation** - How fast are you shipping?
