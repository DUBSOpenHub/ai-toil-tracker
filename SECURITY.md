# 🔒 Security Policy

## 🛡️ Supported Versions

| Version | Supported |
|---------|-----------|
| Latest (main branch) | ✅ Yes |

## 🚨 Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability in this tracker or any automation built from it, **please report it responsibly**.

### How to Report

1. **DO NOT** open a public GitHub issue for security vulnerabilities
2. Instead, email us at: **security@dubsopenhub.com**
3. Or use [GitHub's private vulnerability reporting](https://github.com/DUBSOpenHub/ai-first-toil-tracker/security/advisories/new)

### What to Include

- 📝 Description of the vulnerability
- 🔄 Steps to reproduce
- 💥 Potential impact
- 💡 Suggested fix (if you have one)

### What to Expect

- ⏱️ **Acknowledgment** within 48 hours
- 🔍 **Assessment** within 1 week
- 🛠️ **Fix or mitigation** as quickly as possible
- 🎉 **Credit** in the release notes (unless you prefer anonymity)

## 📋 Best Practices

- 🔑 **No secrets in code** - Slack webhook URLs, API tokens, and credentials must be stored as GitHub Secrets or in a secret manager, never committed to the repo
- 🔐 **Least privilege** - Automations should request only the permissions they need
- 🔍 **Dependency awareness** - Keep GitHub Actions and any dependencies updated via Dependabot

## 🔐 Secret Management Checklist

- Store the `TEAMS_WEBHOOK_URL` (and any other integration tokens) in **Settings → Secrets and variables → Actions** and scope them only to the workflows that need them.
- Rotate chat webhooks and API tokens whenever someone leaves the team or a channel is archived, then update the GitHub secret immediately.
- Review workflow logs for unexpected secret usage—if a workflow no longer needs a secret, delete it to shrink the blast radius.
- Never paste secrets into issues, templates, or `docs/dashboard/dashboard-data.json`; redact sensitive values before attaching sample data.

## AI Model Data Handling

The AI triage workflow sends issue body text to the GitHub Models API for generating automation suggestions. To protect sensitive information:

- **Do not include** customer names, credentials, internal system identifiers, or classified information in toil descriptions
- The AI model processes text in real-time and does not retain submitted data beyond the API request
- Organizations with data classification requirements should review this workflow against their AI usage policies
- To disable AI-powered triage, remove `.github/workflows/ai-triage.yml`
