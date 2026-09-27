# SEO & Indexability

Current SEO status of the site. Everything that older versions of this document
listed as "pending" is already implemented — this file documents **what exists
and where**, plus the known trade-offs of the multilingual approach.

## Implemented

### Metadata (`src/layouts/BaseLayout.astro`, inside `<head>`)

- **`<title>` + `<meta name="description">`** — from `src/i18n/*.json`
  (`meta.title`, `meta.description`).
- **`<link rel="canonical">`** — points to `https://cibran.es`.
- **`<meta name="robots">`** — `index, follow` with `max-snippet:-1`,
  `max-image-preview:large`, `max-video-preview:-1`.
- **`<meta name="author">`**.

### Open Graph

`og:type=profile`, `og:site_name`, `og:title`, `og:description`, `og:url`,
`og:locale` (`en_GB`), `og:image` (1200×630, with `width`/`height`/`alt`), and
`profile:first_name` / `profile:last_name` / `profile:username`.

### Twitter Card

`summary_large_image` with `title`, `description`, and `image`.

### Structured data (JSON-LD)

Two `<script type="application/ld+json">` blocks:

- **`Person`** — name, `jobTitle`, `url`, `image`, `email`, `address`
  (Cangas, Galicia, ES), `sameAs` (LinkedIn, GitHub, Docker Hub), `knowsAbout`
  (tech stack), `knowsLanguage`, `alumniOf` (Universidad de Vigo, UNIR), and
  `hasCredential` (Scrum Manager, Drone A1-A3).
- **`WebSite`** — `url`, `name`, `author`.

### Files in `public/`

- **`robots.txt`** — `Allow: /` plus a link to the sitemap.
- **`sitemap-index.xml`** / **`sitemap-0.xml`** — generated at build time by
  `@astrojs/sitemap` (configured in `astro.config.mjs` via `site`).
- **`llms.txt`** — structured summary of the site for LLMs.
- **`og-image.jpg`** — 1200×630 social card.
- **Favicons** — `favicon.svg`, `favicon.ico`, `apple-touch-icon.png`.

### SEO-relevant performance

- Google Fonts loaded **non-blocking** (`media="print"` + `onload`, with a
  `<noscript>` fallback).
- `preconnect` to `fonts.googleapis.com` and `fonts.gstatic.com`.

## Known trade-offs of the multilingual approach

The site uses a **single URL** (`/`) with language switching via CSS classes
(`lang-en`, `lang-es`, `lang-gl`) on `<html>`. This has SEO implications that
are **accepted decisions**, not bugs:

- **`hreflang` does not apply.** There are no alternate URLs (`/es/`, `/gl/`)
  to cross-link, so it is not relevant. (Older versions of this document listed
  it as pending by mistake.)
- **The HTML is served with `<title>`/`description`/`og` in English.** Google
  indexes the English variant as canonical. The ES/GL content is not indexed as
  separate pages.
- **All three translations live in the DOM** (hidden with `display:none`
  depending on the active language). This is a legitimate client-side i18n
  technique, but it means crawlers see text in all three languages within the
  same document.

If per-language indexing were ever desired, the site would need to move to
locale routes (`/`, `/es/`, `/gl/`) and add `hreflang` — which contradicts the
current single-URL decision (see `CLAUDE.md`).

## Verification

- Structured data: [Rich Results Test](https://search.google.com/test/rich-results)
  and [Schema Markup Validator](https://validator.schema.org/).
- Social previews: [OpenGraph.xyz](https://www.opengraph.xyz/) or each network's
  own validator.
- Indexing and coverage: Google Search Console (property `cibran.es`).
