---
description: Forensic QA of a completed task — independent verification with evidence
argument-hint: <task-id, e.g.: T001>
---

# QA Review: $1

**Goal**: independently verify that the task meets its DoD. You produce real evidence or declare failure. No middle ground.
**Key behaviour**: you do not trust evidence from `/dev-3-run`. You re-execute everything from scratch.

---

## Step 1 — Read the task file

1. Locate the file `docs/tasks/$1*.md` and read it in full.
2. Extract:
   - **DoD**: the acceptance criteria.
   - **Evidence table**: commands, files, conditions.
   - **Dependencies**: are they completed?
3. Read the execution evidence from `/dev-3-run` (section `## Execution evidence`).
4. Read `CLAUDE.md` and `MEMORY.md` for context.

---

## Step 2 — Prepare environment and evidence

```bash
mkdir -p docs/tasks/evidence/$TASK_ID/qa
```

QA evidence goes separate from dev-3-run evidence to avoid contamination.

Make sure the dev environment is running:
```bash
docker compose -f docker-compose.dev.yml ps --format '{{.Service}} {{.State}}'
```

If the container is not running, start it before continuing.

---

## Step 3 — Progressive verification

**Do not trust dev-3-run evidence. Re-execute EVERYTHING.**

Each command saves its evidence:
```bash
<command> 2>&1 | tee docs/tasks/evidence/$TASK_ID/qa/<file>.txt
```

### 3.1 — Lint & format

```bash
docker compose -f docker-compose.dev.yml run --rm web npm run lint 2>&1 | tee docs/tasks/evidence/$TASK_ID/qa/lint.txt
docker compose -f docker-compose.dev.yml run --rm web npm run format:check 2>&1 | tee docs/tasks/evidence/$TASK_ID/qa/format.txt
```

**If any fail:**
1. Fix: `docker compose -f docker-compose.dev.yml run --rm web npm run format`
2. Re-run checks and save clean evidence.
3. Note the correction in the QA report (not a blocker, but documented).

### 3.2 — Build

```bash
docker compose -f docker-compose.dev.yml run --rm web npm run build 2>&1 | tee docs/tasks/evidence/$TASK_ID/qa/build.txt
```

Exit 0 = PASS. Any error = RETURNED immediately.

### 3.3 — Functional DoD checks

Go through EACH DoD item from the task file that is not lint or build. Typical examples:

- File created with expected content → Read tool
- Component renders the expected HTML structure → Read the built output in `dist/`
- Data file has correct structure → Read the JSON file
- Dev server responds → `curl -s -o /dev/null -w "%{http_code}" http://localhost:4321/`

For each functional check, execute the real command and save evidence:
```bash
<command> 2>&1 | tee docs/tasks/evidence/$TASK_ID/qa/dod_<name>.txt
```

### Evidence file verification

For EACH file generated in the previous phases:

1. `Read("docs/tasks/evidence/$TASK_ID/qa/<file>.txt")` — full read.
2. Apply the expected condition.
3. Record: PASS or FAIL with the exact reason.

**Absolute rules:**
- File **does not exist** → FAIL automatic.
- File **is empty** → FAIL automatic.
- Condition not met → FAIL. Copy the fragment that proves it.
- Never evaluate "from memory" — always read the file with Read tool.

---

## Step 4 — Code review and scope

**Only if ALL Step 3 checks passed.**

### 4.1 — Scope verification

1. Re-read the **"Objective"** section of the task file.
2. Verify each step was completed — were all files listed in "Files to create/modify" actually created/modified?
3. Was anything out of scope implemented that shouldn't be?

### 4.2 — Code review

Read all files listed in "Files to create/modify":

1. Does it follow project conventions? (`frontend-patterns` skill)
2. Is the Tailwind usage consistent with the design tokens?
3. Is data properly separated into `src/data/` JSON files (no hardcoded content in components)?
4. Are there any security issues? (XSS in rendered HTML, exposed env vars)
5. Is the code clean and maintainable?

---

## Step 5 — Verdict

### Build verification table

| # | Phase | Deliverable | Evidence file | Condition | Result |
|---|-------|------------|---------------|-----------|--------|
| 1 | 3.1 | Lint | `qa/lint.txt` | No errors | PASS/FAIL |
| 2 | 3.1 | Format | `qa/format.txt` | No diffs | PASS/FAIL |
| 3 | 3.2 | Build | `qa/build.txt` | Exit 0 | PASS/FAIL |
| 4 | 3.3 | Functional DoD | `qa/dod_*.txt` | Per DoD | PASS/FAIL |
| 5 | 4.1 | Scope completed | — | Objective met | PASS/FAIL |
| 6 | 4.2 | Code review | — | No issues | PASS/FAIL |

### If all PASS → APPROVED

Append to the task file:

```markdown
## Code Review — APPROVED

**Date**: YYYY-MM-DD

### QA verification

| # | Deliverable | Evidence | Result |
|---|------------|----------|--------|
| 1 | ... | `tasks/evidence/TXXX/qa/...` | PASS |

### Observations

(Positive notes, minor non-blocking suggestions if any)
```

### If any FAIL → RETURNED

Append to the task file:

```markdown
## Code Review — RETURNED

**Date**: YYYY-MM-DD

### QA verification

| # | Deliverable | Evidence | Result |
|---|------------|----------|--------|
| 1 | ... | `tasks/evidence/TXXX/qa/...` | FAIL |

### Blockers

- **B1**: Exact description of the problem. Affected file and line. What was expected vs what occurred.
- **B2**: ...

### Required action

Run `/dev-3-run $1` to fix the listed blockers.
```

---

## Final step — Update INDEX.md

1. Read `docs/tasks/INDEX.md`.
2. Update the **QA** column for the task:
   - APPROVED → `Approved`
   - RETURNED → `Returned (B1, B2...)`

---

## Absolute rules — etched in stone

- **If you didn't execute the command with Bash tool, you have no evidence.**
- **If the output is not in a physical file in `docs/tasks/evidence/`, you have no evidence.**
- **If you didn't read the file with Read tool, you have no evidence.**
- **"The code looks correct" is not evidence.**
- **"The previous task verified it" is not evidence.**
- **Never approve under time or attempt pressure.**
- **Missing file = command not executed = FAIL.**
- **Empty file = FAIL.**
