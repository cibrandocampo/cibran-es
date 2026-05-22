# SEO & Indexability — Pending tasks

## Crítico

### 1. `hreflang`
Le dice a Google que `/`, `/es/` y `/gl/` son la misma página en distintos idiomas.
Sin esto, las tres versiones pueden competir entre sí o ser penalizadas como contenido duplicado.
→ Añadir en `BaseLayout.astro` dentro de `<head>`.

### 2. Open Graph
Metaetiquetas `og:title`, `og:description`, `og:image`, `og:locale`, `og:url`.
Esencial para previews en redes sociales y para que las IAs entiendan el contenido al indexarlo.
→ Añadir en `BaseLayout.astro` dentro de `<head>`.

### 3. JSON-LD (Schema.org `Person`)
Datos estructurados que Google usa para el Knowledge Graph y que las IAs leen directamente.
Incluir: nombre, título profesional, URL, redes sociales, skills, ubicación.
→ Añadir como `<script type="application/ld+json">` en `BaseLayout.astro`.

## Importante

### 4. `sitemap.xml`
Astro tiene el plugin oficial `@astrojs/sitemap` que lo genera automáticamente con todas las rutas.
→ Instalar plugin, configurar en `astro.config.mjs` con `site` y los locales.

### 5. `robots.txt` + `llms.txt`
- `robots.txt`: controla qué crawlers acceden y enlaza al sitemap.
- `llms.txt`: estándar emergente (adoptado por Anthropic y otros) — resumen estructurado del sitio para LLMs.
→ Crear ambos en `public/`.

## Nice to have

### 6. `og:image` — Social card
Imagen 1200×630px para previews en redes y mensajería.
Sin ella los previews salen en blanco.
→ Crear imagen estática y referenciarla en el Open Graph.
