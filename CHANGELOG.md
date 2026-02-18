# Changelog

All notable changes to this project will be documented in this file.

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
