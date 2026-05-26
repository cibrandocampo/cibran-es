# T001 — Sitemap hreflang fix

## Context

El sitemap generado por `@astrojs/sitemap` usa `hreflang="en-GB"`, `hreflang="es-ES"`,
`hreflang="gl-ES"`, mientras que el `<head>` de cada página usa `hreflang="en"`,
`hreflang="es"`, `hreflang="gl"`. Google requiere que los valores sean idénticos en ambos
sitios, de lo contrario ignora los alternates del sitemap. El fix es una sola línea en
`astro.config.mjs`.

Plan de referencia: `docs/plans/seo-metadata-hardening.md`

**Dependencies**: None.

## Objective

Corregir el mapeo de locales en el plugin de sitemap para que use códigos de idioma simples
(`en`, `es`, `gl`) sin región, alineándolos con los que ya usa el `<head>`. Tras el build,
`sitemap-0.xml` debe contener `hreflang="en"` en lugar de `hreflang="en-GB"`.

## Step 1 — Editar astro.config.mjs

En `astro.config.mjs`, en la configuración del integration `sitemap`, cambiar el objeto
`locales` del campo `i18n`:

```js
// Antes:
sitemap({ i18n: { defaultLocale: 'en', locales: { en: 'en-GB', es: 'es-ES', gl: 'gl-ES' } } })

// Después:
sitemap({ i18n: { defaultLocale: 'en', locales: { en: 'en', es: 'es', gl: 'gl' } } })
```

## Step 2 — Build y verificar el sitemap generado

Ejecutar el build para regenerar `dist/sitemap-0.xml`:

```bash
docker compose -f docker-compose.dev.yml run --rm web npm run build 2>&1
```

Verificar que `dist/sitemap-0.xml` ya no contiene `en-GB`:

```bash
grep -o 'hreflang="[^"]*"' dist/sitemap-0.xml | sort -u
```

Resultado esperado:
```
hreflang="en"
hreflang="es"
hreflang="gl"
```

## DoD — Definition of Done

1. Build pasa sin errores.
2. `dist/sitemap-0.xml` contiene `hreflang="en"`, `hreflang="es"`, `hreflang="gl"`.
3. `dist/sitemap-0.xml` NO contiene `hreflang="en-GB"`, `hreflang="es-ES"`, ni `hreflang="gl-ES"`.
4. `dist/index.html` `<head>` sigue teniendo `hreflang="en"` (sin cambios — solo confirmar que no se rompió).

## Evidence to produce

| # | Description | Command | File | PASS condition |
|---|-------------|---------|------|----------------|
| 1 | Build passes | `docker compose -f docker-compose.dev.yml run --rm web npm run build 2>&1` | `build.txt` | Exit 0, no errors |
| 2 | Sitemap hreflang values | `grep -o 'hreflang="[^"]*"' dist/sitemap-0.xml \| sort -u` | `sitemap-check.txt` | Solo `en`, `es`, `gl` |
| 3 | No region codes in sitemap | `grep -c 'en-GB\|es-ES\|gl-ES' dist/sitemap-0.xml` | `sitemap-check.txt` | Output: `0` |
| 4 | Head hreflang intact | `grep 'hreflang' dist/index.html` | `head-check.txt` | Contiene `en`, `es`, `gl`, `x-default` |

## Files to create/modify

| File | Action |
|------|--------|
| `astro.config.mjs` | MODIFY — cambiar locales mapping en sitemap integration |

## Execution evidence

**Date**: 2026-05-26
**Modified files**:
- `astro.config.mjs` — locales mapping: `{ en: 'en-GB', es: 'es-ES', gl: 'gl-ES' }` → `{ en: 'en', es: 'es', gl: 'gl' }`

### Verification table

| # | Deliverable | Evidence file | Result |
|---|------------|---------------|--------|
| 1 | Build passes | `docs/tasks/evidence/T001/build.txt` | PASS |
| 2 | Sitemap hreflang values | `docs/tasks/evidence/T001/sitemap-check.txt` | PASS — solo `en`, `es`, `gl` |
| 3 | No region codes in sitemap | `docs/tasks/evidence/T001/sitemap-check.txt` | PASS — count=0 |
| 4 | Head hreflang intact | `docs/tasks/evidence/T001/head-check.txt` | PASS — `en`, `es`, `gl`, `x-default` presentes |
