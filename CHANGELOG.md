# Changelog

All notable changes to this project will be documented in this file.

## [1.3.1] - 2026-02-19

### Fixed
- Bonus factor scoring wired end-to-end (form → workflow → dashboard)
- Case-insensitive parsing in all workflow scoring
- Dead references removed (weekly_time_spent, Save to GitHub, esc() alias)
- Team name normalization in dashboard
- Documentation consistency across PRD, scoring guide, and README

## [1.3.0] - 2026-02-18

### Added
- 📊 **Interactive Dashboard** (`docs/dashboard/index.html`) — visual, single-page GitHub Pages dashboard for teams and managers
  - Summary cards: total ideas, wins, hours saved/month, automation rate, in-progress, high-impact
  - Team & individual breakdown: per-person and per-team stats with time-saved tallies
  - Sortable, filterable toil ideas table with color-coded priority rows and status badges
  - **Inline-editable scores** — click Frequency, Time, or People cells to edit; score recalculates live; edits persist in localStorage
  - **🚀 Launch CLI button** per issue — copies `gh copilot` command to clipboard to start automating
  - "Save to GitHub" link per row to push edits back to the issue
  - Filters by team, category, and status
  - Print-friendly for leadership presentations
  - Works immediately with embedded sample data (no setup required to preview)
- 📊 **Dashboard data workflow** (`dashboard-data.yml`) — generates `dashboard-data.json` daily and on every issue event
  - Parses all toil and WIN issues, extracts structured form fields
  - Calculates scores and monthly time savings using the same formula as AI triage
  - Commits JSON to `docs/dashboard/` for the dashboard to consume
- 👥 **Team field** added to toil idea and log-win issue forms — enables grouping and filtering by team in the dashboard
- Dashboard setup instructions in README with GitHub Pages configuration guide

## [1.2.0] - 2026-02-18

### Fixed
- 🐛 **Critical:** Fixed broken regex patterns in AI triage scoring — en-dash characters (`–`) from issue forms were not matched by ASCII patterns, causing all scores to default to minimums
- 🐛 Fixed fragile `sed`-based toil description extraction — removed unused `/tmp/toil_desc.txt` pipeline
- 🐛 Fixed hardcoded `DUBSOpenHub` URL in stale workflow — now fork-friendly with plain-text reference
- 🐛 Fixed broken scoring guide link in AI triage comment — now uses dynamic `github.repository` URL

### Added
- 🔗 **Feedback loop workflow** (`win-celebration.yml`) — automatically comments on original toil issue when a WIN is logged, adds `automated` label, and closes the original issue
- 📊 **Monthly ROI summary workflow** (`monthly-roi-summary.yml`) — auto-generates a metrics issue on the 1st of each month with submission counts, automation rate, and quick links
- 🔍 **Duplicate detection** — AI triage now searches for similar open toil issues and includes a "Possibly Related Issues" section in the triage comment
- 📂 **Category dropdown** in toil idea form — CI/CD, Communication, Onboarding, Code Review, Operations, Documentation, Data & Analytics, Other
- ⚡ **Bonus scoring factors** — checkboxes for error-prone, morale-killer, and blocking toil (adds weight to priority score)
- 🔒 **AI data privacy notice** in README and SECURITY.md — documents that issue text is sent to GitHub Models API with guidance to avoid sensitive information

### Improved
- 🤖 **Better AI prompt** — added persona grounding, structured output format, few-shot example; reduced temperature (0.7→0.5), increased max_tokens (300→400) for more consistent, actionable suggestions

## [1.0.0] - 2026-02-17

### Added
- 🤖 Initial repo setup
- Toil Automation Idea issue form (YAML) with submitter name, frequency, time, and people-affected fields
- Automation Proposal issue template for proposing solutions
- Log Completed Automation issue form for tracking wins and time saved
- Labels: `toil`, `triage`, `high-impact`, `quick-win`, `in-progress`, `automated`, `stale`
- Frequency labels with color coding: 🔴🟠🟡🔵⚪
- Stale issue workflow (30-day nudge, 60-day auto-close)
- Dependabot for GitHub Actions updates
- CODEOWNERS (@DUBSOpenHub)
- Pull request template
- Slack Workflow Builder setup instructions (Fridays at 10:00 AM PST)
- Toil scoring guide with prioritization formula
- Triage workflow documentation
- Common toil examples for team inspiration
- ROI tracking guide with monthly summary template
- Contributing guide, Code of Conduct, Security policy, License (MIT)
- Fork-friendly design - any team can fork and use in under 10 minutes
