# 🛠️ Troubleshooting

Common issues and how to fix them.

---

## "The triage workflow didn't run on my issue"

**Symptoms:** You submitted a toil idea but no AI triage comment appeared, no labels were applied.

**Fixes:**
1. **Enable Actions** — Go to **Settings** → **Actions** → **General** → select **Allow all actions** → **Save**
2. **Check the workflow exists** — Go to **Actions** tab and confirm "AI Triage" appears in the left sidebar
3. **Check the issue template** — The workflow only triggers on issues created with the `toil-idea.yml` template that have the `toil` and `triage` labels
4. **Check Actions logs** — Go to **Actions** → **AI Triage** → click the latest run to see error details

---

## "The dashboard shows no data"

**Symptoms:** Dashboard page loads but shows zeros or "Scanning for toil…"

**Fixes:**
1. **Run the data workflow manually** — Go to **Actions** → **Dashboard Data** → **Run workflow** → **Run workflow**
2. **Enable GitHub Pages** — Go to **Settings** → **Pages** → Source: `main` branch, `/docs` folder → **Save**
3. **Wait for deployment** — GitHub Pages can take 2-3 minutes after the first enable
4. **Check the JSON** — Open `docs/dashboard/dashboard-data.json` in your repo to confirm data was generated

---

## "AI suggestion says 'Unable to generate suggestion'"

**Symptoms:** The triage comment appears but the automation suggestion section says it couldn't generate one.

**Fixes:**
1. **GitHub Models API outage** — Check [GitHub Status](https://www.githubstatus.com) for API issues
2. **Re-run the workflow** — Go to **Actions** → **AI Triage** → find the run → **Re-run all jobs**
3. **Check the model** — Open `config.yml` and verify the `ai.model` value is a valid GitHub Models model ID
4. **Token limit** — If the issue body is very long, the AI call may fail. Try editing the issue to be more concise

---

## "All my scores are showing as 1"

**Symptoms:** Every toil idea gets a score of 1 regardless of the frequency/time/people selected.

**Fixes:**
1. **Check form field labels** — The parsing depends on exact heading matches. Open `.github/ISSUE_TEMPLATE/toil-idea.yml` and verify the `label:` values haven't been changed
2. **Special characters** — The dropdowns use en-dashes (–) not hyphens (-). If you edited the template, make sure the dash characters match
3. **Check Actions logs** — Look at the AI Triage run output for "PARSED FIELDS" to see what values were extracted

---

## "The stale bot closed my important issue"

**Symptoms:** An issue you're actively working on was auto-closed after 60 days.

**Fixes:**
1. **Add an exempt label** — Apply `in-progress`, `automated`, or `high-impact` label to prevent the stale bot from touching it
2. **Post a comment** — Any activity resets the stale timer
3. **Reopen** — Simply reopen the issue and add a label to prevent it from happening again
4. **Customize timers** — Edit `config.yml` → `stale.days_until_stale` and `stale.days_until_close` to change the thresholds
