---
name: git-conventions
description: Git commit message conventions and branch naming standards for cibran.es. Use when creating commits, branches, or preparing code for version control. Triggers on commit creation, branch creation, or when user asks about git workflow conventions.
---

# Git Conventions — cibran.es

## Commit Message Format

```
<type>: <subject>

<bullet points explaining what changed and why>
```

### Rules

1. **Type**: `feat`, `fix`, `chore`, `docs`, `refactor`, `style`, `content`, `seo`
2. **Subject**: imperative mood, lowercase, no period at end
3. **Body**: bullet points grouped by area (components, styles, content, infra, i18n, etc.)
4. **Co-Authored-By**: NEVER include Co-Authored-By lines
5. **Language**: always English, even if the conversation was in Spanish/Galician
6. **Author/Committer**: always use the git config from the current PC (never hardcode or use other identities). New commits automatically use `git config user.name` and `git config user.email`. When amending, use `--reset-author` to update to current PC config.

## Branch naming

```
feat/<slug>      # new feature or section
fix/<slug>       # bug fix
chore/<slug>     # maintenance, refactor, tooling
content/<slug>   # content-only updates (bio, projects, experience)
style/<slug>     # design or CSS changes
seo/<slug>       # SEO, meta, structured data
```

Examples: `feat/portfolio-section`, `fix/mobile-nav`, `content/update-cv`, `seo/og-image`

## Workflow

Since `main` is the deploy branch (GitHub Actions triggers on push to `main`), small changes can go directly. For anything larger:

```bash
git checkout -b <type>/<slug>
git push -u origin <type>/<slug>
gh pr create --title "<concise title>" --body "..."
```

Never `push --force`. If there are conflicts, resolve with merge.

### Example

```
feat: add portfolio section with project cards

- Add ProjectCard component with image, title, tags, and links
- Add portfolio data to src/data/projects.json
- Wire 4-column grid layout with responsive breakpoints
- Add GitHub and Globe icons to card footer
```
