# SEO & Indexabilidad

Estado del SEO del sitio. Todo lo que aparecía como "pendiente" en versiones
anteriores de este documento ya está implementado — este archivo documenta
**qué hay y dónde**, más los trade-offs conocidos del enfoque multilingüe.

## Implementado

### Metadatos (`src/layouts/BaseLayout.astro`, dentro de `<head>`)

- **`<title>` + `<meta name="description">`** — desde `src/i18n/*.json` (`meta.title`, `meta.description`).
- **`<link rel="canonical">`** — apunta a `https://cibran.es`.
- **`<meta name="robots">`** — `index, follow` con `max-snippet:-1`, `max-image-preview:large`, `max-video-preview:-1`.
- **`<meta name="author">`**.

### Open Graph

`og:type=profile`, `og:site_name`, `og:title`, `og:description`, `og:url`,
`og:locale` (`en_GB`), `og:image` (1200×630, con `width`/`height`/`alt`), y
`profile:first_name` / `profile:last_name` / `profile:username`.

### Twitter Card

`summary_large_image` con `title`, `description` e `image`.

### Datos estructurados (JSON-LD)

Dos bloques `<script type="application/ld+json">`:

- **`Person`** — nombre, `jobTitle`, `url`, `image`, `email`, `address`
  (Cangas, Galicia, ES), `sameAs` (LinkedIn, GitHub, Docker Hub), `knowsAbout`
  (stack técnico), `knowsLanguage`, `alumniOf` (Universidad de Vigo, UNIR) y
  `hasCredential` (Scrum Manager, Dron A1-A3).
- **`WebSite`** — `url`, `name`, `author`.

### Archivos en `public/`

- **`robots.txt`** — `Allow: /` + enlace al sitemap.
- **`sitemap-index.xml`** / **`sitemap-0.xml`** — generados en build por
  `@astrojs/sitemap` (configurado en `astro.config.mjs` vía `site`).
- **`llms.txt`** — resumen estructurado del sitio para LLMs.
- **`og-image.jpg`** — social card 1200×630.
- **Favicons** — `favicon.svg`, `favicon.ico`, `apple-touch-icon.png`.

### Rendimiento relevante para SEO

- Fuentes de Google cargadas de forma **no bloqueante**
  (`media="print"` + `onload`, con fallback `<noscript>`).
- `preconnect` a `fonts.googleapis.com` y `fonts.gstatic.com`.

## Trade-offs conocidos del enfoque multilingüe

El sitio usa **una única URL** (`/`) con cambio de idioma vía clases CSS
(`lang-en`, `lang-es`, `lang-gl`) sobre `<html>`. Esto tiene implicaciones SEO
que son **decisiones aceptadas**, no fallos:

- **`hreflang` no aplica.** No hay URLs alternativas (`/es/`, `/gl/`) que
  enlazar entre sí, así que no procede. (Las versiones antiguas de este
  documento lo listaban como pendiente por error.)
- **El HTML se sirve con `<title>`/`description`/`og` en inglés.** Google
  indexa la variante en inglés como canónica. El contenido ES/GL no se indexa
  como páginas independientes.
- **Las tres traducciones están en el DOM** (ocultas con `display:none` según
  el idioma activo). Es una técnica legítima para i18n en cliente, pero implica
  que los crawlers ven texto en los tres idiomas en el mismo documento.

Si en el futuro se quisiera indexación independiente por idioma, habría que
migrar a rutas por locale (`/`, `/es/`, `/gl/`) y añadir `hreflang` — lo que
contradice la decisión actual de URL única (ver `CLAUDE.md`).

## Verificación

- Datos estructurados: [Rich Results Test](https://search.google.com/test/rich-results)
  y [Schema Markup Validator](https://validator.schema.org/).
- Previews sociales: [OpenGraph.xyz](https://www.opengraph.xyz/) o el validador
  de cada red.
- Indexación y cobertura: Google Search Console (propiedad `cibran.es`).
