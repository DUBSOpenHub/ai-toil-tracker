# 📊 ROI & Time Saved

Track the return on investment from your team's automation efforts.

## How to Track

When a toil item is automated, file a **[Log Completed Automation](../../issues/new?template=log-win.yml)** issue. This captures:

- What was automated
- Time saved per occurrence
- Frequency and people affected
- **Estimated monthly time savings**
- How long it took to build

## Calculating ROI

### Time Saved per Month

```
Monthly savings = Frequency × Time per occurrence × People affected
```

| Frequency | Multiplier |
|-----------|-----------|
| Multiple times/day | 60×/month |
| Daily | 20×/month |
| Multiple times/week | 10×/month |
| Weekly | 4×/month |
| Monthly | 1×/month |

### Example

| Automation | Frequency | Time saved | People | Monthly savings | Build time |
|------------|-----------|-----------|--------|----------------|-----------|
| Auto-update deploy tracker | Daily | 15 min | 2 | **10 hrs/mo** | 3 hrs |
| Auto-generate release notes | Weekly | 30 min | 5 | **10 hrs/mo** | 4 hrs |
| Auto-assign PR reviewers | Per-PR (~daily) | 5 min | 8 | **13 hrs/mo** | 1 hr |
| **Total** | | | | **33 hrs/mo** | **8 hrs** |

> ☝️ 8 hours of build time → 33 hours saved *every month*. That's a **4× return in the first month alone**.

## Viewing Your Wins

| View | Link |
|------|------|
| 🎉 All completed automations | [View](../../issues?q=is%3Aissue+label%3Aautomated+sort%3Acreated-desc) |
| 📈 Wins with time saved | [View](../../issues?q=is%3Aissue+label%3Aautomated+%22time+saved%22+sort%3Acreated-desc) |

## Sharing Results

Use this monthly summary template in Slack, Teams, or team meetings:

> **🤖 Toil Tracker - Monthly Update**
>
> - **X** toil ideas submitted this month
> - **X** automations completed
> - **X hours/month** of team time saved so far
> - **X hours** total invested in building automations
> - **ROI: X×** return on time invested
>
> Top wins:
> - [Automation name] - saves X hrs/mo
> - [Automation name] - saves X hrs/mo
>
> 👉 Got toil? [File it here](../../issues/new?template=toil-idea.yml)

## Why This Matters

- **Visibility** - The team sees the concrete impact of automation work
- **Momentum** - Celebrating wins encourages more submissions
- **Prioritization** - Real data helps you pick the highest-ROI toil to automate next
- **Culture** - Shifts the team mindset from "we've always done it this way" to "let's automate it"
