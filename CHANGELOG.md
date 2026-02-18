# Changelog

All notable changes to this project will be documented in this file.

## [1.2.0] - 2026-02-18

### Fixed
- 🐛 **Critical:** Fixed broken regex patterns in AI triage scoring — en-dash characters (`–`) from issue forms were not matched by ASCII patterns, causing all scores to default to minimums
- 🐛 Fixed fragile `sed`-based toil description extraction — removed unused `/tmp/toil_desc.txt` pipeline
- 🐛 Fixed hardcoded `DUBSOpenHub` URL in stale workflow — now fork-friendly with plain-text reference
- 🐛 Fixed broken scoring guide link in AI triage comment — now uses dynamic `github.repository` URL

### Added
- 🔗 **Feedback loop workflow** (`win-celebration.yml`) — automatically comments on original toil issue when a WIN is logged, adds `automated` label, and closes the original issue
- 📊 **Monthly ROI summary workflow** (`monthly-roi-summary.yml`) — auto-generates a metrics issue on the 1st of each month with submission counts, automation rate, and quick links; notifies Teams if configured
- 🔍 **Duplicate detection** — AI triage now searches for similar open toil issues and includes a "Possibly Related Issues" section in the triage comment
- 📂 **Category dropdown** in toil idea form — CI/CD, Communication, Onboarding, Code Review, Operations, Documentation, Data & Analytics, Other
- ⚡ **Bonus scoring factors** — checkboxes for error-prone, morale-killer, and blocking toil (adds weight to priority score)
- 🔒 **AI data privacy notice** in README and SECURITY.md — documents that issue text is sent to GitHub Models API with guidance to avoid sensitive information

### Improved
- 🤖 **Better AI prompt** — added persona grounding, structured output format, few-shot example; reduced temperature (0.7→0.5), increased max_tokens (300→400) for more consistent, actionable suggestions

## [1.1.0] - 2026-02-18

### Added
- 🟣 Microsoft Teams integration as an alternative to Slack
- Incoming Webhook support: AI triage reports are automatically posted to a Teams channel when `TEAMS_WEBHOOK_URL` secret is configured
- Adaptive Card formatting for Teams notifications with a direct link to the GitHub issue
- Microsoft Teams setup guide in README (Power Automate recurring reminder + Incoming Webhook)
- Teams contact link in issue template chooser (`config.yml`)
- Updated docs (triage workflow, ROI tracking) to reference Teams alongside Slack

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
