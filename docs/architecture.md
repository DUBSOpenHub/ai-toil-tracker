# Architecture — AI-First Toil Tracker

## Overview

The Toil Tracker is a zero-dependency, GitHub-native system. There is no server, no database, and no build step. GitHub Issues are the data store, GitHub Actions are the compute layer, and GitHub Pages is the presentation layer.

## System Architecture

```mermaid
flowchart TB
    subgraph Users["👤 Users"]
        IC["Individual Contributor"]
        MGR["Manager"]
    end

    subgraph GitHub["GitHub Platform"]
        subgraph Issues["📋 Issues — Data Store"]
            TOIL["Toil Ideas\n(label: toil)"]
            WIN["Wins\n(label: automated)"]
            ROI["Monthly Summaries\n(label: roi-summary)"]
        end

        subgraph Actions["⚙️ Actions — Compute"]
            TRIAGE["ai-triage.yml\nScore + Label + AI Suggest"]
            DASH_GEN["dashboard-data.yml\nGenerate JSON"]
            CELEBRATE["win-celebration.yml\nClose + Comment"]
            MONTHLY["monthly-roi-summary.yml\nMetrics Issue"]
            STALE["stale.yml\nNudge + Close"]
        end

        subgraph Pages["🌐 Pages — Presentation"]
            HTML["index.html\nSingle-file dashboard"]
            JSON["dashboard-data.json"]
        end

        MODELS["🤖 GitHub Models API\n(gpt-4o-mini)"]
    end

    IC -- "Submit form" --> TOIL
    IC -- "Log win" --> WIN
    TOIL -- "on: opened" --> TRIAGE
    TRIAGE -- "API call" --> MODELS
    TRIAGE -- "Labels + comment" --> TOIL
    WIN -- "on: labeled" --> CELEBRATE
    CELEBRATE -- "Close + comment" --> TOIL
    TOIL & WIN -- "on: schedule/change" --> DASH_GEN
    DASH_GEN -- "writes" --> JSON
    JSON -- "loaded by" --> HTML
    MONTHLY -- "creates" --> ROI
    STALE -- "nudges/closes" --> TOIL
    MGR -- "views" --> HTML
```

## Data Flow — Toil Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Submitted: User fills issue form
    Submitted --> Triaged: ai-triage.yml runs
    Triaged --> InProgress: Team picks it up
    InProgress --> Automated: Win logged
    Triaged --> Stale: No activity 30 days
    Stale --> Closed: No activity 60 days
    InProgress --> Automated: Label applied
    Automated --> [*]
    Closed --> [*]

    note right of Triaged
        AI scores, labels,
        and suggests automation
    end note

    note right of Automated
        win-celebration.yml
        comments + closes toil
    end note
```

## Scoring Pipeline

```mermaid
flowchart LR
    FORM["Issue Form"] --> PARSE["Parse Fields"]
    PARSE --> FREQ["Frequency\n1 · 2 · 3 · 5 · 8"]
    PARSE --> TIME["Time\n1 · 2 · 3 · 5 · 8"]
    PARSE --> PPL["People\n1 · 2 · 3 · 5 · 8"]
    FREQ & TIME & PPL --> CALC["Base =\nF × T × P"]
    CALC --> BONUS["Bonus\n+2 error-prone\n+1 morale\n+3 blocking"]
    BONUS --> FINAL["Final Score =\nBase + Bonus"]
    FINAL --> PRI{"Priority"}
    PRI -- "≥ 40" --> CRIT["🔴 Critical"]
    PRI -- "≥ 20" --> HIGH["🟡 High"]
    PRI -- "≥ 10" --> MED["🟢 Medium"]
    PRI -- "< 10" --> LOW["⚪ Low"]
    FINAL --> EST["Monthly mins =\nmult × mins × people"]
    FINAL --> AI["GitHub Models API\nSuggest automation"]
```

## Dashboard Data Pipeline

```mermaid
flowchart LR
    subgraph Trigger["Triggers"]
        SCHED["⏰ Daily cron"]
        EVENT["📋 Issue opened/edited/closed"]
        MANUAL["🖱️ Manual dispatch"]
    end

    subgraph Generate["dashboard-data.yml"]
        FETCH["Fetch all toil + win issues"]
        SCORE["Re-score each item"]
        AGG["Aggregate by team,\ncategory, priority"]
        BUILD["Build JSON"]
    end

    subgraph Serve["GitHub Pages"]
        JSONF["dashboard-data.json"]
        HTMLF["index.html"]
    end

    SCHED & EVENT & MANUAL --> FETCH
    FETCH --> SCORE --> AGG --> BUILD
    BUILD -- "git commit" --> JSONF
    JSONF -- "fetch()" --> HTMLF
```

## File Map

```mermaid
flowchart TB
    subgraph Templates["Issue Templates"]
        T1[".github/ISSUE_TEMPLATE/toil-idea.yml"]
        T2[".github/ISSUE_TEMPLATE/log-win.yml"]
        T3[".github/ISSUE_TEMPLATE/automation-proposal.md"]
        T4[".github/ISSUE_TEMPLATE/config.yml"]
    end

    subgraph Workflows["GitHub Actions"]
        W1[".github/workflows/ai-triage.yml"]
        W2[".github/workflows/dashboard-data.yml"]
        W3[".github/workflows/win-celebration.yml"]
        W4[".github/workflows/monthly-roi-summary.yml"]
        W5[".github/workflows/stale.yml"]
    end

    subgraph Dashboard["Dashboard"]
        D1["docs/dashboard/index.html"]
        D2["docs/dashboard/dashboard-data.json"]
    end

    subgraph Docs["Documentation"]
        DOC1["docs/PRD.md"]
        DOC2["docs/architecture.md"]
        DOC3["docs/scoring-guide.md"]
        DOC4["docs/examples.md"]
        DOC5["docs/triage-workflow.md"]
        DOC6["docs/roi-tracking.md"]
    end

    subgraph Root["Root"]
        R1["README.md"]
        R2["SECURITY.md"]
        R3["CONTRIBUTING.md"]
        R4["CHANGELOG.md"]
        R5["LICENSE"]
    end

    T1 -- "on: opened" --> W1
    T2 -- "on: labeled" --> W3
    W1 -- "scores" --> T1
    W2 -- "generates" --> D2
    D2 -- "renders" --> D1
```

## Workflow Detail

| Workflow | Trigger | Inputs | Outputs | Permissions |
|----------|---------|--------|---------|-------------|
| `ai-triage.yml` | Issue opened (label: `toil`) or manual | Issue number | Labels, triage comment | `issues: write`, `models: read` |
| `dashboard-data.yml` | Daily cron, issue events, manual | — | `dashboard-data.json` | `contents: write`, `issues: read` |
| `win-celebration.yml` | Issue labeled `automated` | — | Comment on original toil issue | `issues: write` |
| `monthly-roi-summary.yml` | 1st of month or manual | — | New summary issue | `issues: write` |
| `stale.yml` | Daily schedule | — | Comments + closes stale issues | `issues: write` |

## Security Model

```mermaid
flowchart TB
    subgraph Hardening["Security Controls"]
        PIN["All Actions pinned to SHA"]
        ENV["All expressions in env: blocks\n(no injection in run:)"]
        CSP["CSP meta tag on dashboard"]
        PERM["Top-level permissions: {}"]
        SEC["No secrets in code"]
    end

    subgraph Secrets["GitHub Secrets"]
        GH["GITHUB_TOKEN\n(auto-provided)"]
    end

    subgraph Data["Data Boundaries"]
        IN["Issue body text → AI model"]
        OUT["AI suggestion → issue comment"]
        NONE["No data stored beyond\nGitHub Issues + JSON"]
    end

    PIN & ENV & CSP & PERM & SEC --> SAFE["Hardened Pipeline"]
    GH --> SAFE
    SAFE --> IN --> OUT
```

## Technology Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Data store | GitHub Issues | Labels, comments, and form fields |
| Compute | GitHub Actions | Ubuntu runners, bash + `gh` CLI + `jq` |
| AI | GitHub Models API | `openai/gpt-4o-mini`, 400 token limit |
| Presentation | GitHub Pages | Static HTML from `/docs` folder |
| Dashboard | Vanilla HTML/CSS/JS | Single file, no build, no dependencies |
| Fonts | Google Fonts (Inter) | Only external resource |
