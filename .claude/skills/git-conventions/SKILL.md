---
name: git-conventions
description: Git commit message conventions and branch naming standards for cibran.es. Use when creating commits, branches, or preparing code for version control.
---

# Git Conventions — cibran.es

## Commit Message Format

```
<type>: <subject>

<bullet points explaining what changed and why>
```

### Rules

1. **Type**: `feat`, `fix`, `chore`, `docs`, `refactor`, `style`, `content`
2. **Subject**: imperative mood, lowercase, no period at end
3. **Body**: bullet points grouped by area (components, styles, content, infra, etc.)
4. **Co-Authored-By**: NEVER include Co-Authored-By lines
5. **Language**: always English
6. **Author/Committer**: always use the git config from the current PC (never hardcode)

## Branch naming

```
feat/<slug>    # new feature or section
fix/<slug>     # bug fix
chore/<slug>   # maintenance, refactor, tooling
content/<slug> # content-only updates (bio, CV, projects)
style/<slug>   # design or CSS changes
```

Examples: `feat/portfolio-section`, `fix/mobile-nav`, `chore/docker-dev-setup`, `content/update-cv`

## PR workflow

```bash
git checkout -b <type>/<slug>
git push -u origin <type>/<slug>
gh pr create --title "<concise title>" --body "..."
```

Never `push --force`. If there are conflicts, resolve with merge.

### Example

```
feat: add portfolio section with project cards

- Add WorkCard component with image, title, tags, and link
- Add portfolio data to src/data/works.json
- Wire masonry layout with CSS grid
- Add Lucide ExternalLink icon to card CTA
```
