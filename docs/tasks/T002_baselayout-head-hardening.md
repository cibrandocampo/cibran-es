# T002 — BaseLayout `<head>` — JSON-LD + meta tags

## Context

`BaseLayout.astro` es el único punto que controla el `<head>` de las 3 páginas (en, es, gl).
Tiene carencias en los metadatos que leen los crawlers y LLMs: el JSON-LD Person está
incompleto (falta `image`, `knowsLanguage`, `alumniOf`, `hasCredential`; tiene el email
incorrecto), falta el bloque JSON-LD WebSite, faltan las propiedades específicas de
`og:type=profile`, y no hay `meta robots` ni `meta author` explícitos.

Plan de referencia: `docs/plans/seo-metadata-hardening.md`

**Dependencies**: T001 (el sitemap ya debe estar corregido antes de tocar BaseLayout, aunque
técnicamente son ficheros independientes).

## Objective

Enriquecer el `<head>` de BaseLayout.astro con todos los metadatos que faltan, sin alterar
la estructura de la página ni los componentes de contenido. Los 3 locales (en, es, gl) se
benefician automáticamente porque el layout es compartido.

## Step 1 — Actualizar el bloque JSON-LD Person en BaseLayout.astro

Localizar el objeto `jsonLd` en el frontmatter de `BaseLayout.astro` (líneas ~23-47) y
reemplazarlo con la versión enriquecida:

```ts
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Cibrán Docampo Piñeiro',
  jobTitle: 'Senior Software Developer',
  url: siteUrl,
  image: `${siteUrl}/og-image.jpg`,
  email: 'hola@cibran.es',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Cangas',
    addressRegion: 'Galicia',
    addressCountry: 'ES',
  },
  sameAs: [
    'https://www.linkedin.com/in/cidocampo/',
    'https://github.com/cibrandocampo',
    'https://hub.docker.com/u/cibrandocampo',
  ],
  knowsAbout: [
    'Python', 'Django', 'Flask', 'Node.js',
    'PostgreSQL', 'AWS', 'Docker', 'Kubernetes',
    'Backend Development', 'Cloud Architecture', 'Data Engineering',
    'Observability', 'FFmpeg', 'IPTV', 'HLS', 'DASH',
  ],
  knowsLanguage: [
    { '@type': 'Language', name: 'Galician' },
    { '@type': 'Language', name: 'Spanish' },
    { '@type': 'Language', name: 'English' },
    { '@type': 'Language', name: 'Portuguese' },
  ],
  alumniOf: [
    {
      '@type': 'EducationalOrganization',
      name: 'Universidad de Vigo',
      description: 'Telecommunication Technical Engineering — Image and Sound (2009–2014)',
    },
    {
      '@type': 'EducationalOrganization',
      name: 'UNIR — La Universidad en Internet',
      description: "Master's Degree in Teacher Training — Technology and IT (2022–2023)",
    },
  ],
  hasCredential: [
    {
      '@type': 'EducationalOccupationalCredential',
      name: 'Scrum Manager Experto',
      credentialCategory: 'certificate',
      recognizedBy: { '@type': 'Organization', name: 'Scrum Manager' },
    },
    {
      '@type': 'EducationalOccupationalCredential',
      name: 'Drone Pilot Certificate A1-A3',
      credentialCategory: 'license',
      recognizedBy: { '@type': 'Organization', name: 'AESA' },
    },
  ],
}
```

Añadir también la constante para el segundo bloque JSON-LD, justo después de `jsonLd`:

```ts
const jsonLdWebsite = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  url: siteUrl,
  name: 'Cibrán Docampo',
  author: {
    '@type': 'Person',
    name: 'Cibrán Docampo Piñeiro',
  },
}
```

## Step 2 — Añadir los nuevos tags al `<head>` en el template HTML

Dentro del bloque `<head>` del template, realizar los siguientes cambios:

**2a. Después de `<meta name="description">`, añadir:**
```html
<meta name="author" content="Cibrán Docampo Piñeiro" />
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
```

**2b. Después de los tags `og:image:alt`, añadir las propiedades de perfil:**
```html
<!-- Open Graph — profile properties -->
<meta property="profile:first_name" content="Cibrán" />
<meta property="profile:last_name" content="Docampo Piñeiro" />
<meta property="profile:username" content="cibrandocampo" />
```

**2c. Reemplazar el bloque JSON-LD actual (un solo script) por dos bloques:**
```html
<!-- JSON-LD — Person -->
<script type="application/ld+json" set:html={JSON.stringify(jsonLd)} />

<!-- JSON-LD — WebSite -->
<script type="application/ld+json" set:html={JSON.stringify(jsonLdWebsite)} />
```

## Step 3 — Build y verificar el HTML generado

```bash
docker compose -f docker-compose.dev.yml run --rm web npm run build 2>&1
```

Verificar las adiciones en el HTML generado:

```bash
# JSON-LD: comprobar que aparecen los dos bloques y el email correcto
grep -c 'application/ld+json' dist/index.html
grep 'hola@cibran.es' dist/index.html
grep 'knowsLanguage' dist/index.html

# meta tags nuevos
grep 'profile:first_name' dist/index.html
grep 'name="robots"' dist/index.html
grep 'name="author"' dist/index.html
```

## DoD — Definition of Done

1. Build pasa sin errores.
2. `dist/index.html` contiene 2 bloques `application/ld+json`.
3. El JSON-LD Person en `dist/index.html` contiene `hola@cibran.es` (no `hello@`).
4. El JSON-LD Person contiene `knowsLanguage`, `alumniOf`, `hasCredential`, `image`.
5. `dist/index.html` contiene `profile:first_name`, `profile:last_name`, `profile:username`.
6. `dist/index.html` contiene `meta name="robots"` con `max-snippet:-1`.
7. `dist/index.html` contiene `meta name="author"`.
8. Los mismos checks pasan en `dist/es/index.html` y `dist/gl/index.html`.

## Evidence to produce

| # | Description | Command | File | PASS condition |
|---|-------------|---------|------|----------------|
| 1 | Build passes | `docker compose -f docker-compose.dev.yml run --rm web npm run build 2>&1` | `build.txt` | Exit 0, no errors |
| 2 | Dos bloques JSON-LD | `grep -c 'application/ld+json' dist/index.html` | `head-check.txt` | Output: `2` |
| 3 | Email canónico | `grep 'hola@cibran.es' dist/index.html` | `head-check.txt` | Match encontrado |
| 4 | knowsLanguage presente | `grep 'knowsLanguage' dist/index.html` | `head-check.txt` | Match encontrado |
| 5 | og:profile tags | `grep 'profile:first_name' dist/index.html` | `head-check.txt` | Match encontrado |
| 6 | meta robots | `grep 'max-snippet' dist/index.html` | `head-check.txt` | Match encontrado |
| 7 | meta author | `grep 'name="author"' dist/index.html` | `head-check.txt` | Match encontrado |
| 8 | ES locale OK | `grep -c 'application/ld+json' dist/es/index.html` | `head-check.txt` | Output: `2` |

## Files to create/modify

| File | Action |
|------|--------|
| `src/layouts/BaseLayout.astro` | MODIFY — JSON-LD Person enriquecido, WebSite JSON-LD, og:profile, meta robots, meta author |

## Execution evidence

**Date**: 2026-05-26
**Modified files**:
- `src/layouts/BaseLayout.astro` — JSON-LD Person enriquecido (image, email canónico, knowsLanguage, alumniOf, hasCredential), jsonLdWebsite añadido, og:profile tags, meta author, meta robots

### Verification table

| # | Deliverable | Evidence file | Result |
|---|------------|---------------|--------|
| 1 | Build passes | `docs/tasks/evidence/T002/build.txt` | PASS |
| 2 | 2 bloques JSON-LD (ocurrencias en HTML minificado) | `docs/tasks/evidence/T002/head-check.txt` | PASS — 2 |
| 3 | Email canónico `hola@cibran.es` | `docs/tasks/evidence/T002/head-check.txt` | PASS |
| 4 | knowsLanguage, alumniOf, hasCredential, image presentes | `docs/tasks/evidence/T002/head-check.txt` | PASS — todos encontrados |
| 5 | og:profile first_name, last_name, username | `docs/tasks/evidence/T002/head-check.txt` | PASS — los 3 presentes |
| 6 | meta robots con max-snippet:-1 | `docs/tasks/evidence/T002/head-check.txt` | PASS |
| 7 | meta author | `docs/tasks/evidence/T002/head-check.txt` | PASS |
| 8 | ES + GL locales: 2 bloques JSON-LD cada uno | `docs/tasks/evidence/T002/head-check.txt` | PASS — 2 en cada locale |

### Design decisions

- `grep -c` no sirve para HTML minificado (cuenta líneas, no ocurrencias). Se usó `grep -o ... | wc -l` para contar ocurrencias reales en HTML de una sola línea.
