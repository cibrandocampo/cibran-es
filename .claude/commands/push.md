---
description: Update documentation, commit, and create PR
argument-hint: <change description or task-id (optional)>
---

# Push: $1

**Goal**: close the work cycle — documentation updated, clean commit, PR created.
**Behaviour**: you are the last gate before code reaches review. Never commit with a broken build.

---

## Step 1 — Review current state

1. Run `git status` to see modified, added, and untracked files.
2. Run `git diff --stat` to see a summary of changes.
3. If `$1` references a task-id, read `docs/tasks/$1*.md` in full:
   - Extract commit context (objective, modified files, design decisions).
   - **Check for `## Code Review — APPROVED`**. If missing, warn the user:
     > "This task has not been QA-approved. Run `/dev-4-qa $1` first, or confirm you want to push anyway."
   - Do not proceed until the user confirms.
4. If there is no `$1`, review modified files to understand what changed.

If there are no changes, inform the user and stop.

---

## Step 2 — Update documentation

Review whether the changes require documentation updates:

- [ ] **`CLAUDE.md`**: are there new patterns or conventions Claude should know?
- [ ] **Skills (`.claude/skills/`)**: did any convention documented in a skill change?
- [ ] **`docs/`**: does the architecture or configuration need updating?

For each applicable item: read the current file, update with the new information.

Ask the user with `AskUserQuestion` if there is anything additional to document.

---

## Step 3 — Verify build locally

**Skip this step if `$1` has `## Code Review — APPROVED`** — QA already ran the build.

Otherwise:

```bash
docker compose -f docker-compose.dev.yml run --rm web npm run build 2>&1
```

If the build fails: **stop, fix, and re-verify.** Do not commit with a broken build.

---

## Step 4 — Commit

**Strictly apply the `git-conventions` skill** for format and rules.

```bash
git add <specific files>
git commit -m "$(cat <<'EOF'
<type>: <subject>

- bullet points
EOF
)"
```

---

## Step 5 — Pull Request

### Create branch (if needed)

If you are on `main`, create a descriptive branch:
```bash
git checkout -b <type>/<descriptive-name>
```

### Push

```bash
git push -u origin <branch>
```

**Never `push --force`.**

### Create PR

Follow the **`pr-create` command** format to build the PR body.

```bash
gh pr create --title "<concise title>" --body "$(cat <<'EOF'
<body following pr-create format>
EOF
)"
```

- Title: <70 characters, English, imperative mood
- Body: structured per `pr-create`

---

## Unbreakable rules

- **Build BEFORE commit**: never commit without a passing build.
- **Apply `git-conventions` skill**: format and commit rules.
- **Never `push --force`**.
- **Commit and PR language**: always English.
