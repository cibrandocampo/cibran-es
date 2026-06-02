---
name: frontend-patterns
description: Frontend architecture patterns and conventions for cibran.es. Use when creating or modifying Astro components, pages, layouts, or Tailwind styles. Triggers when working on any frontend code or when the user asks about conventions.
---

# Frontend Patterns — cibran.es

## Reuse first — never define the same thing twice

The single most important rule: **if a component, class, or pattern with the same intent already exists, consume it. Do not re-implement. Do not duplicate.**

### Pre-write checklist

Before creating ANY new component or style, check in this order:

1. **Design tokens** — `tailwind.config.mjs` (`brand`, `accent`, `primary`) and `global.css` (`--c-*`). Never hardcode a color that maps to an existing token.
2. **UI primitives** — `src/components/ui/`. Check `SectionTitle`, `ProjectCard`, `AccordionEntry`, `FunFact`, `InterestCard`, `SkillHighlight`, `BrandIcon` before building something new.
3. **Section components** — `src/components/sections/`. One component per page section.
4. **Data files** — `src/data/`. All content lives here as JSON. Never hardcode user-visible content in components.

### The 1 / 2 / 3 rule

- **1 occurrence**: local code is fine.
- **2 occurrences**: acceptable only if the intent differs. If intent matches, extract before the second lands.
- **3 occurrences**: extract before merging the third. The pattern has proven itself.

## Architecture

- **Astro** static site generator (`.astro` components and pages)
- **Tailwind CSS** for all styling — no custom CSS except `global.css` (Tailwind base + CSS custom properties)
- **Lucide** for icons via `@lucide/astro` — named imports only
- **Content**: all site data in `src/data/` as JSON — never hardcode content in components

## Project structure

```
src/
  components/
    sections/    # One component per page section (About, Hero, Portfolio…)
    ui/          # Reusable primitives (ProjectCard, FunFact, SectionTitle…)
  layouts/       # BaseLayout.astro
  pages/         # index.astro (en), es/index.astro, gl/index.astro
  data/          # JSON content files
  i18n/          # en.json, es.json, gl.json + utils.ts
  styles/        # global.css only
public/
  images/        # Static images
  favicon.svg
  og-image.jpg
  CNAME
  robots.txt
  llms.txt
dist/            # Build output (gitignored)
```

## Color system

Three custom tokens on top of Tailwind's zinc palette:

| Token | Hex | Use |
|-------|-----|-----|
| `text-brand` / `bg-brand` | `#fcd34d` | Yellow — sparingly: skill icons, project count badges, link icons in portfolio |
| `text-accent` / `bg-accent` | `#4a56a1` | Blue — section underlines, interest/contact icons, tech tag backgrounds, dates |
| `text-primary` / `bg-primary` | `#454961` | Blue-grey — secondary accents |

**Dark base**: `bg-zinc-900` (page), `bg-zinc-800` (cards/surfaces), `bg-zinc-700` (borders).

### Label system (consistent across sections)

| Label type | Style |
|---|---|
| Category / type (e.g. "Web App", "Business Intelligence") | `text-brand bg-brand/10 border border-brand/25 rounded-full` |
| Tech tags (e.g. "Python", "Docker") | `text-zinc-200 bg-accent/25 border border-accent/30 rounded` |
| Social/language buttons | `text-zinc-200 bg-accent/25 border border-accent/30 rounded-lg` |
| Nav language selector (active) | `text-zinc-200 bg-accent/25 border border-accent/30 rounded` |

### Design tokens (CSS custom properties in global.css)

```css
--c-bg: theme('colors.zinc.900');
--c-surface: theme('colors.zinc.800');
--c-border: theme('colors.zinc.700');
--c-text: theme('colors.zinc.100');
--c-text-2: theme('colors.zinc.400');
--c-accent: theme('colors.accent');
```

## Component patterns

### Astro component structure

```astro
---
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

### Icon usage

Always use `@lucide/astro`. Import only what you need:

```astro
---
import { Github, Globe, Mail } from '@lucide/astro'
---
<Github size={20} class="text-accent" />
```

For dynamic icons (from data), use the `toPascalCase` pattern:

```astro
---
import * as LucideIcons from '@lucide/astro'
const IconComponent = (LucideIcons as Record<string, any>)[toPascalCase(icon)]
---
{IconComponent && <IconComponent size={24} class="text-accent" />}
```

### External links — always include rel

```astro
<a href={url} target="_blank" rel="noopener noreferrer">...</a>
```

### z-index and clickable overlays

When a card has a full-card `<a>` overlay (`absolute inset-0 z-10`) AND inner links that must be clickable (`z-20`):

- The card's content wrapper must NOT have `z-0` — that would create a stacking context trapping the inner links below the overlay.
- Use `relative` (no z-index) on the content wrapper; inner links with `z-20` will then be in the same stacking context as the overlay and win.

## i18n

Single URL (`/`), three locales: `en` (default), `es`, `gl`. No URL routing.

- UI strings: `src/i18n/en.json`, `es.json`, `gl.json`
- Data strings: inline per-locale keys in `src/data/*.json` (`name: { en: "...", es: "...", gl: "..." }`)
- **`tAll(key)`** — returns `{ en, es, gl }`; spread directly into `<Tr>`: `<Tr {...tAll('section.about')} />`
- **`<Tr en es gl />`** (`src/components/ui/Tr.astro`) — renders three `<span class="i18n-XX">` inline; CSS shows only the active locale. Use for inline strings.
- **Block content** (paragraphs): render `<p class={`i18n-${lang} ...`}>` via `(['en','es','gl'] as const).map(lang => ...)`. Do NOT use `<Tr>` for block-level content.
- `t(locale, 'key')` still available for static EN-only values (e.g. meta tags, aria-labels)

**Rule**: when adding any user-visible string, add it to all three locales. Never hardcode.

## Typography

Font: **Inter** (primary) + **Space Grotesk** (logo/nav only).

| Use | Class |
|-----|-------|
| Section title | `text-3xl font-bold` |
| Card title | `text-base font-semibold text-white` |
| Body text | `text-sm text-zinc-300 leading-relaxed` |
| Muted/secondary | `text-sm text-zinc-400` |
| Label uppercase | `text-xs font-medium uppercase tracking-widest text-zinc-500` |

## Build verification

Before every push, the build must pass with zero errors:

```bash
docker compose -f docker-compose.dev.yml exec web npm run build
```

Exit 0 = PASS. Any error = FAIL, fix before pushing.
