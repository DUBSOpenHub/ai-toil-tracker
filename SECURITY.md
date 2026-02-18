# 🔒 Security Policy

## 🛡️ Supported Versions

| Version | Supported |
|---------|-----------|
| Latest  | ✅ Yes     |

## 🚨 Reporting a Vulnerability

We take security seriously! If you discover a security vulnerability in any automation built from this tracker, **please report it responsibly**.

### How to Report

1. **DO NOT** open a public GitHub issue for security vulnerabilities
2. Instead, email us at: **security@dubsopenhub.com**
3. Or use [GitHub's private vulnerability reporting](https://github.com/DUBSOpenHub/ai-first-toil-tracker/security/advisories/new)
   <!-- ⚠️ Replace DUBSOpenHub/ai-first-toil-tracker with your org/repo — or run ./setup.sh -->

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
