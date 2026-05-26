# SEO & AI Discoverability Hardening

## Context

Análisis exhaustivo del HTML generado reveló que la base técnica es sólida, pero hay
inconsistencias y omisiones en los metadatos que fragmentan el perfil de entidad que
construyen Google, LLMs y motores de preview. El objetivo es que cualquier sistema
automatizado (crawler, LLM, bot de preview de Slack/WhatsApp) obtenga una imagen
completa, coherente y autoritativa de quién es Cibrán y qué hace.

## Decisions confirmed with user

| Topic | Decision |
|-------|----------|
| Emails en UI | Mantener los 3 emails localizados (hello@, hola@, ola@) en la capa de presentación — es un detalle encantador y los 3 buzones existen |
| Email canónico para máquinas | `hola@cibran.es` en JSON-LD, llms.txt y cualquier dato estructurado |
| hreflang sin región | Usar códigos de idioma simples (`en`, `es`, `gl`) en todo — más amplio y consistente entre `<head>` y sitemap |
| og:type | Mantener `profile` — es el tipo correcto para una página personal |

## Design proposal

Todos los cambios son en la capa de metadatos y ficheros estáticos. Sin cambios en
componentes de contenido, estilos ni estructura de datos. Los ficheros afectados son:

- `BaseLayout.astro` — fuente de todos los tags del `<head>`
- `astro.config.mjs` — configuración del plugin de sitemap (hreflang en sitemap)
- `public/llms.txt` — fichero de orientación para LLMs
- `public/` — nuevos ficheros: `favicon.ico`, `apple-touch-icon.png`

La estrategia es: **una sola edición en BaseLayout cubre las 3 páginas** (en, es, gl)
porque todo el `<head>` se genera desde ahí en tiempo de build.

### Bloque de cambios en BaseLayout.astro

1. **hreflang** — añadir los valores de región para que coincidan con el sitemap.
   Actualmente `hreflang="en"`, cambiar a `hreflang="en-GB"` / `es-ES` / `gl-ES`...
   **NO**. Decisión contraria: cambiar el sitemap para que use códigos simples.
   El `<head>` ya usa `en/es/gl` — más simple y universalmente reconocido.

2. **og:type=profile — propiedades específicas** — añadir:
   ```html
   <meta property="profile:first_name" content="Cibrán" />
   <meta property="profile:last_name" content="Docampo Piñeiro" />
   <meta property="profile:username" content="cibrandocampo" />
   ```

3. **meta robots explícito** — añadir con directivas de snippet:
   ```html
   <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
   ```

4. **meta author** — añadir:
   ```html
   <meta name="author" content="Cibrán Docampo Piñeiro" />
   ```

5. **JSON-LD Person — propiedades adicionales**:
   - `image` → URL de og-image.jpg
   - `email` → cambiar a `hola@cibran.es` (canónico)
   - `knowsLanguage` → array con los 4 idiomas (Galician, Spanish, English, Portuguese)
   - `alumniOf` → EducationalOrganization (Universidad de Vigo)
   - `hasCredential` → array con las certificaciones relevantes (Scrum Manager, Drone Pilot A1/A2/A3, CKA)

6. **WebSite JSON-LD** — añadir segundo bloque `<script type="application/ld+json">`:
   ```json
   {
     "@context": "https://schema.org",
     "@type": "WebSite",
     "url": "https://cibran.es",
     "name": "Cibrán Docampo",
     "author": { "@type": "Person", "name": "Cibrán Docampo Piñeiro" }
   }
   ```

7. **Favicon completo** — añadir los tags que faltan:
   ```html
   <link rel="icon" sizes="any" href="/favicon.ico" />
   <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
   ```
   (Los ficheros se crean en `public/`)

8. **Font preload** — añadir preload para Inter (la fuente principal del body, crítica para LCP):
   ```html
   <link rel="preload" as="font" type="font/woff2" crossorigin
     href="[url subset Inter 400/600]" />
   ```
   Nota: Google Fonts no permite preload directo de sus WOFF2; la optimización real
   aquí es añadir `font-display: swap` que ya está activo vía `&display=swap` en la URL.
   Se descarta este punto — ya está resuelto.

### Cambio en astro.config.mjs

Cambiar el mapping de locales del sitemap plugin para que use códigos simples
(alineando con el `<head>`):

```js
// Antes:
locales: { en: 'en-GB', es: 'es-ES', gl: 'gl-ES' }

// Después:
locales: { en: 'en', es: 'es', gl: 'gl' }
```

### Cambios en llms.txt

- Cambiar email a `hola@cibran.es`
- Añadir sección **Projects** con los proyectos destacados y sus URLs
- Añadir idioma Portugués en la sección Languages
- Mejorar sección Contact con todos los perfiles sociales relevantes

### Nuevos ficheros en public/

- `favicon.ico` — generar a partir del SVG existente (16×16 y 32×32 en un .ico multi-size)
- `apple-touch-icon.png` — 180×180px, fondo oscuro (#18181b = zinc-900) con las iniciales o el logo

## Scope

### What is included

- Corrección de hreflang inconsistencia (astro.config.mjs)
- Email canónico en JSON-LD → `hola@cibran.es`
- og:profile tags (first_name, last_name, username)
- meta robots con directivas de snippet
- meta author
- JSON-LD Person enriquecido (image, knowsLanguage, alumniOf, hasCredential)
- WebSite JSON-LD (segundo bloque)
- favicon.ico + apple-touch-icon.png (ficheros + tags en `<head>`)
- llms.txt mejorado

### What is NOT included

- Traducción de timeline.json a ES/GL (decisión deliberada — el historial detallado en inglés es estándar profesional)
- Cambio de emails en la UI de contacto (se mantienen los 3 localizados)
- lastmod en sitemap (Astro no lo soporta de forma nativa sin customización compleja; ganancia marginal)
- Manifest PWA / web app manifest (fuera de scope — no es una PWA)
- Blog / contenido adicional (fuera de scope)

## Affected layers

| Layer | Impact |
|-------|--------|
| `src/layouts/BaseLayout.astro` | Modificación principal — todos los cambios del `<head>` |
| `astro.config.mjs` | Una línea — mapeo de locales del sitemap |
| `public/llms.txt` | Actualización de contenido |
| `public/favicon.ico` | Fichero nuevo |
| `public/apple-touch-icon.png` | Fichero nuevo |
| Estilos | Sin cambios |
| Componentes de sección | Sin cambios |
| JSON de datos | Sin cambios directos |

## Implementation order

1. **astro.config.mjs** — corregir hreflang en sitemap (1 línea, mayor impacto, menor riesgo)
2. **BaseLayout.astro** — bloque principal de cambios:
   a. JSON-LD Person completo (email, image, knowsLanguage, alumniOf, hasCredential)
   b. WebSite JSON-LD (segundo bloque)
   c. og:profile tags
   d. meta robots + meta author
   e. Tags de favicon completos
3. **public/favicon.ico** — generar fichero multi-size
4. **public/apple-touch-icon.png** — generar fichero 180×180
5. **public/llms.txt** — actualizar contenido
6. Build y verificación del HTML generado

## Critical files

| File | Changes |
|------|---------|
| `src/layouts/BaseLayout.astro` | JSON-LD, og:profile, meta robots, meta author, favicon tags |
| `astro.config.mjs` | Locales mapping: `en-GB→en`, `es-ES→es`, `gl-ES→gl` |
| `public/llms.txt` | Email canónico, sección Projects, idiomas completos |
| `public/favicon.ico` | Nuevo fichero |
| `public/apple-touch-icon.png` | Nuevo fichero |

## Risks and considerations

- **favicon.ico y apple-touch-icon**: los creamos programáticamente desde el SVG existente.
  El SVG de favicon es monocromático, hay que verificar que se ve bien sobre fondos oscuros
  y claros en formato rasterizado.
- **WebSite JSON-LD + Person JSON-LD en la misma página**: Google acepta múltiples bloques
  JSON-LD — es la práctica recomendada (no combinarlos en un solo objeto).
- **hasCredential**: solo incluir credenciales verificables (Scrum Manager, CKA, Drone Pilot).
  No inventar ni incluir cursos informales.
- **alumniOf**: incluir el Grado de Ingeniería (Universidad de Vigo, 2009-2014) que es el
  título formal. El máster también si se considera relevante.

## Open design decisions

Ninguna — todas las decisiones relevantes están confirmadas con el usuario.
