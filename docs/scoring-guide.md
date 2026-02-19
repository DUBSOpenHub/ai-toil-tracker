# Toil Scoring Guide

Use this framework to prioritize which toil to automate first.

## Scoring Formula

**Toil Score = (Frequency × Time per Occurrence × People Affected) + Bonus**

| Factor | Score | Description |
|--------|-------|-------------|
| **Frequency** | | |
| | 1 | Monthly or less |
| | 2 | Weekly |
| | 3 | Multiple times per week |
| | 5 | Daily |
| | 8 | Multiple times per day |
| **Time per occurrence** | | |
| | 1 | < 5 minutes |
| | 2 | 5–15 minutes |
| | 3 | 15–30 minutes |
| | 5 | 30–60 minutes |
| | 8 | > 1 hour |
| **People affected** | | |
| | 1 | 1 person |
| | 2 | 2–3 people |
| | 3 | 4–6 people |
| | 5 | Entire team |
| | 8 | Multiple teams / org-wide |

### Example

| Toil | Frequency | Time | People | Score |
|------|-----------|------|--------|-------|
| Manually updating deploy tracker | 5 (daily) | 2 (10 min) | 2 (2 people) | **20** |
| Copy-pasting release notes | 2 (weekly) | 3 (20 min) | 5 (whole team) | **30** |
| Rotating on-call schedule spreadsheet | 1 (monthly) | 5 (45 min) | 3 (4 people) | **15** |

## Priority Tiers

| Score | Priority | Action |
|-------|----------|--------|
| **40+** | 🔴 Critical | Automate immediately |
| **20–39** | 🟡 High | Automate this sprint |
| **10–19** | 🟢 Medium | Add to backlog |
| **< 10** | ⚪ Low | Track but don't prioritize |

## Bonus Factors

Each bonus factor adds individually to the base score (max bonus: +6):

| Factor | Bonus | Description |
|--------|-------|-------------|
| ❌ **Error-prone** | +2 | The toil frequently leads to mistakes |
| 😤 **Morale killer** | +1 | The toil is particularly frustrating or demoralizing |
| 🔗 **Blocking** | +3 | The toil blocks other people or processes |

**Formula**: `Score = (Frequency × Time × People) + Bonus`
