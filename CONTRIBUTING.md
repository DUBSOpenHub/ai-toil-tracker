# Contributing to AI Toil Tracker

Thanks for helping us surface and eliminate toil! Here's how to contribute.

## Submitting a Toil Idea

1. Click **[Submit a toil idea](../../issues/new?template=toil-idea.yml)**
2. Fill out the template - be specific about frequency and time spent
3. The team will triage and label your idea

### What makes a good toil submission?

- **Specific** - "I manually copy deploy logs into a spreadsheet every release" is better than "deployments are annoying"
- **Measurable** - Include how often it happens and how long it takes
- **Actionable** - Suggest how it could be automated, if you have ideas

## Prioritization

The team reviews new submissions during our weekly check-in. We prioritize by:

1. **Time saved** - How much total team time does this toil consume?
2. **Frequency** - Daily toil > monthly toil
3. **Number of people affected** - Team-wide > individual
4. **Automation feasibility** - Quick wins get prioritized early

## Building an Automation

Once a toil idea is approved:

1. Assign yourself and move the label from `triage` → `in-progress`
2. Create a branch: `automate/<issue-number>-<short-description>`
3. Build the automation (agent, script, workflow, etc.)
4. Open a PR linking to the original issue
5. Once merged and verified, update the label to `automated` 🎉

## Labels

| Label | When to use |
|-------|-------------|
| `toil` | Auto-applied to all submissions |
| `triage` | Needs team review (auto-applied) |
| `high-impact` | Saves significant time or affects many people |
| `quick-win` | Can be automated in a day or less |
| `in-progress` | Someone is actively building the automation |
| `automated` | The toil has been eliminated |

## Code of Conduct

Be respectful and constructive. No toil is too small to mention - the goal is to make everyone's work life better.
