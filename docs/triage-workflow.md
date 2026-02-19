# Triage Workflow

How we review and prioritize toil ideas as a team.

## Weekly Triage (Fridays)

1. **Slack prompt fires** at 10:00 AM PST - team members reply with toil they've encountered
2. Team members **file issues** using the [Toil Automation Idea](../../issues/new?template=toil-idea.yml) template
3. A designated triager reviews new issues labeled `triage`

## Triage Steps

For each new issue:

### 1. Validate
- Is this actually toil (repetitive, automatable) or a one-off task?
- Is it a duplicate of an existing issue?

### 2. Score
- Apply the [scoring formula](scoring-guide.md) in a comment
- Format: `**Toil Score:** Frequency (X) × Time (X) × People (X) = **XX**`

### 3. Label
- Remove `triage` label
- Add appropriate priority label:
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
