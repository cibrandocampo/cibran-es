---
name: frontend-patterns
description: Frontend architecture patterns and conventions for cibran.es. Use when creating or modifying Astro components, pages, layouts, or Tailwind styles. Triggers when working on any frontend code or when the user asks about conventions.
---

# Frontend Patterns — cibran.es

## Architecture

- **Astro** static site generator (`.astro` components and pages)
- **Tailwind CSS** for all styling — no custom CSS files except for things Tailwind cannot do
- **Lucide** for icons — named imports: `import { Github, Linkedin, Mail } from 'lucide-react'`
- **Content**: all site data in `src/data/` as JSON files — never hardcode content in components

## Project structure

```
src/
  components/      # Reusable Astro components
  layouts/         # Page layouts (BaseLayout.astro)
  pages/           # Astro pages (index.astro = home)
  data/            # JSON content files (profile.json, experience.json, projects.json, ...)
  styles/          # global.css only — Tailwind base + custom properties
public/
  images/          # Static images
  fonts/           # Self-hosted fonts (if any)
dist/              # Build output (gitignored)
```

## Data model

All content lives in `src/data/`. Components receive data as props — never import JSON directly inside a component unless it is the page/layout assembling the data.

Key data files:
- `profile.json` — name, bio, location, social links
- `experience.json` — work history array
- `education.json` — education + courses array
- `skills.json` — technical and personal skills
- `projects.json` — portfolio projects
- `fun-facts.json` — fun facts items

## Tailwind conventions

- Use Tailwind utility classes exclusively. No inline `style=` unless strictly necessary (e.g. dynamic background-image URLs).
- Dark theme is the default. Use `bg-zinc-900`, `bg-zinc-800`, `text-zinc-100`, `text-zinc-400` as base tokens.
- Accent color: `indigo-500` / `indigo-400` for highlights and interactive elements.
- Spacing scale: stick to Tailwind defaults (4, 6, 8, 12, 16, 24 are the most common).
- Responsive: mobile-first. Use `md:` and `lg:` breakpoints.

### Design tokens (via CSS custom properties in global.css)

```css
--c-bg: theme('colors.zinc.900');
--c-surface: theme('colors.zinc.800');
--c-border: theme('colors.zinc.700');
--c-text: theme('colors.zinc.100');
--c-text-2: theme('colors.zinc.400');
--c-accent: theme('colors.indigo.500');
```

Use these when Tailwind utilities are not expressive enough (e.g. in generated SVG or canvas code).

## Component patterns

### Astro component structure

```astro
---
// Props interface at the top
interface Props {
  title: string
  href?: string
}
const { title, href } = Astro.props
---

<div class="...tailwind classes...">
  <slot />
</div>
```

### Section pattern

Each section of the page (About, Resume, Portfolio, Contact) is an Astro component in `src/components/sections/`. It receives its data as props from the page.

```astro
---
import type { Experience } from '../../data/experience.json'
interface Props { items: Experience[] }
const { items } = Astro.props
---
```

### Icon usage

Always use Lucide. Import only what you need:

```astro
---
import { Github, Linkedin, Mail, ExternalLink, Download } from 'lucide-react'
---
<Github class="w-5 h-5" />
```

For Astro components (not React islands), use `lucide-astro` if available, otherwise embed the SVG directly for icons that must render without JS.

### Links — external always `target="_blank" rel="noopener noreferrer"`

```astro
<a href={url} target="_blank" rel="noopener noreferrer">...</a>
```

## Typography

Font: **Inter** (primary) + **Cormorant Garamond** (display/hero only).
Load via `<link>` in BaseLayout with `display=swap` and `preconnect`.

| Use | Class |
|-----|-------|
| Hero name | `text-5xl font-bold tracking-tight` |
| Section title | `text-2xl font-semibold` |
| Card title | `text-base font-semibold` |
| Body text | `text-sm text-zinc-300` |
| Muted/secondary | `text-sm text-zinc-400` |
| Label/tag | `text-xs font-medium uppercase tracking-wide` |

## Animation

Use Tailwind's `transition`, `duration-`, `ease-` utilities for hover states.
For entrance animations (scroll-triggered), use the `@tailwindcss/animate` plugin or plain CSS `@keyframes` in `global.css` — keep it minimal.

No heavy animation libraries. The typed effect on the hero can use a small vanilla JS snippet or a lightweight library.

## Content update workflow

To update site content (bio, new job, new project):
1. Edit the relevant JSON file in `src/data/`.
2. Rebuild: `docker compose -f docker-compose.dev.yml run --rm web npm run build`.
3. The component that consumes that data will automatically reflect the change.

## Build verification

Before every push, the build must pass with zero errors:

```bash
docker compose -f docker-compose.dev.yml run --rm web npm run build 2>&1
```

Exit 0 = PASS. Any error = FAIL, fix before pushing.
