---
description: Quick fix — implement a focused bug fix or small change without full dev pipeline
argument-hint: <description of what to fix>
---

# Fix: $1

**Goal**: implement a focused correction and leave the code ready for `/push`.
**Behaviour**: lightweight path — no plan document, no task files, no evidence folder. Read before writing, verify the build, stop if scope grows.

---

## Step 1 — Understand the problem

1. Read `CLAUDE.md` and `MEMORY.md` for context and known pitfalls.
2. Read the affected files before writing a single line.
3. If the fix is unclear or touches more than ~3 files, stop and suggest using `/dev-1-plan` instead.

---

## Step 2 — Implement

1. Apply the minimal change that solves the problem. No refactors, no extra features.
2. Follow conventions from the `frontend-patterns` skill.
3. Self-review: re-read every line you wrote. Fix typos, missing imports, inconsistencies.

---

## Step 3 — Verify

Run the build to confirm nothing is broken:

```bash
docker compose -f docker-compose.dev.yml run --rm web npm run build 2>&1
```

If the build fails: fix and re-run. Do not proceed with a broken build.

---

## Step 4 — Hand off

Tell the user: **"Fix complete. Ready for `/push`."**

---

## Unbreakable rules

- **Read before writing**: never modify code you haven't read.
- **Minimal scope**: if the fix keeps growing, stop and escalate to `/dev-1-plan`.
- **No placeholders, no TODOs**: the fix must be complete and functional.
- **Do NOT commit**: that is `/push`'s responsibility.
