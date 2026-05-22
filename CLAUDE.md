# cibran.es — Project Context

## Working style

Execute all actions within this project without asking for confirmation: edit files, create files, run build/lint/test commands, use Docker, etc. Only ask before actions with external irreversible impact (push to remote, publish to third-party services).

## What this is

Personal website for Cibrán Docampo Piñeiro (Senior Backend Developer, Cangas, Galicia).
Rebuilt from scratch from an old jQuery/ThemeForest template (`old/`) using a modern stack.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Astro (static site generator) |
| Styling | Tailwind CSS |
| Icons | Lucide |
| Serving | Docker + Nginx |
| Build | Astro build → `dist/` → served by Nginx |

See `.claude/skills/dev-workflow` for Docker commands.
See `.claude/skills/frontend-patterns` for component and CSS conventions.

## Key design decisions

- **No CV download**: removed intentionally. LinkedIn + GitHub + contact form is enough.
- **No phone number**: email only (`hola@cibran.es`).
- **Multilingual**: EN (default), ES, GL — language detected from browser `navigator.language`. Uses Astro's i18n routing (`/`, `/es/`, `/gl/`). All UI strings must have translations in all three languages.
- **Docker Hub pulls as project metric**: more meaningful than GitHub stars. Fetched at **build time** via Astro `fetch()` in component frontmatter — every `npm run build` hits the Docker Hub API fresh and bakes the numbers into the generated HTML. No client-side JS, no proxy needed. Docker Hub API has no CORS headers so browser-side fetch is not an option.
- **Weekly auto-rebuild**: GitHub Actions scheduled workflow (copied from nudge repo) triggers a rebuild every week so pull counts stay current. To be configured at the end of the project.
- **No progress bar skills**: replaced with category tag lists and highlight cards.
- **Dark theme only**: no light mode toggle.

## Content model (`src/data/`)

| File | Contents |
|------|----------|
| `profile.json` | Name, title, bio (short + long paragraphs), location, email, typed titles, languages, social links |
| `experience.json` | Work history — role, project, period, company, description[], tags[] |
| `education.json` | Formal degrees, certifications, publications |
| `skills.json` | Personal skills (list), professional (category + items), highlights (cards) |
| `interests.json` | Personal interests with icon, name, description |
| `fun-facts.json` | Fun facts — icon, value, label, note |
| `projects.json` | Portfolio projects — id, title, category, image, description, tags, github, url, highlight, dockerHub |
| `contact.json` | Location, email |

**Rule**: all user-visible content lives in these JSON files. Never hardcode content in components.

## i18n structure

Three locales: `en` (default), `es`, `gl`.
- UI strings in `src/i18n/en.json`, `src/i18n/es.json`, `src/i18n/gl.json`
- Content data (`src/data/`) is in English — translated variants go in `src/data/es/` and `src/data/gl/` as needed, or inline per locale key in each JSON if content is short.
- Language auto-detected from `navigator.language` on first visit; stored in `localStorage`.

## Sections

1. **Hero** — full-screen, name + typed subtitle, dark background with profile photo
2. **About** — bio (long version), interests grid, fun facts
3. **Resume** — skills highlights cards + experience timeline + education
4. **Portfolio** — project cards with Docker Hub pull count badge
5. **Contact** — location, email, LinkedIn link

## Real data sources (for reference / updates)

| Data | Source |
|------|--------|
| Work history | LinkedIn: https://www.linkedin.com/in/cidocampo/ |
| Projects | GitHub: https://github.com/cibrandocampo |
| Docker Hub stats | https://hub.docker.com/u/cibrandocampo (API: `hub.docker.com/v2/repositories/cibrandocampo/`) |
| Bird list | eBird: https://ebird.org/ (124 species logged) |
| Whale encounters | HappyWhale: https://happywhale.com/user/25322 (50 whales) |

## Old site reference

The original site lives in `old/`. It was a ThemeForest jQuery template (author: beshleyua), serving as reference for content only. Do not re-use any of its code.

## Infrastructure

```
docker-compose.dev.yml   → Astro dev server on :4321 (bind mount, HMR)
docker-compose.yml       → Nginx on :9080 serving dist/
```

## Project structure

```
src/
  components/
    sections/     # One component per page section
    ui/           # Reusable primitives (Card, Badge, Tag...)
  layouts/
    BaseLayout.astro
  pages/
    index.astro   # en (default)
    es/index.astro
    gl/index.astro
  data/           # JSON content files
  i18n/           # Translation strings (en, es, gl)
  styles/
    global.css    # Tailwind base + CSS custom properties
public/
  images/
    projects/     # Project thumbnails
dist/             # Build output (gitignored)
```
