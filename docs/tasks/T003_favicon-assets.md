# T003 — Favicon assets + tags

## Context

El sitio solo tiene `favicon.svg`. Bots de preview (Slack, WhatsApp, iMessage), iOS y
navegadores legacy necesitan también `favicon.ico` (multi-size) y `apple-touch-icon.png`
(180×180). El SVG ya existe en `public/favicon.svg` — diseño: fondo zinc-900 `#18181b`
con redondeado, letra "C" blanca y círculo amarillo (accent).

Plan de referencia: `docs/plans/seo-metadata-hardening.md`

**Dependencies**: T002 (BaseLayout.astro ya fue modificado en T002; aquí se añaden los
tags de favicon adicionales sobre ese fichero actualizado).

## Objective

Generar `favicon.ico` (16px + 32px embebidos) y `apple-touch-icon.png` (180×180) a partir
del SVG existente, y añadir los `<link>` tags correspondientes en `BaseLayout.astro`.

## Step 1 — Verificar herramientas disponibles

Dentro del contenedor de dev, verificar si `sharp` está disponible como dependencia:

```bash
docker compose -f docker-compose.dev.yml run --rm web node -e "require('sharp'); console.log('sharp OK')" 2>&1
```

Si `sharp` no está disponible, comprobar si `convert` (ImageMagick) está en el PATH:

```bash
docker compose -f docker-compose.dev.yml run --rm web which convert 2>&1
```

Usar la herramienta disponible en los pasos siguientes (sharp preferido; ImageMagick como
alternativa).

## Step 2 — Generar apple-touch-icon.png (180×180)

**Opción A — con sharp** (crear `scripts/gen-icons.mjs` temporal, ejecutar, borrar):

```js
// scripts/gen-icons.mjs
import sharp from 'sharp'

// apple-touch-icon: renderizar el SVG a 180x180
await sharp('public/favicon.svg')
  .resize(180, 180)
  .png()
  .toFile('public/apple-touch-icon.png')

console.log('apple-touch-icon.png generated')
```

```bash
docker compose -f docker-compose.dev.yml run --rm web node scripts/gen-icons.mjs
```

**Opción B — con ImageMagick:**
```bash
docker compose -f docker-compose.dev.yml run --rm web \
  convert -background none public/favicon.svg -resize 180x180 public/apple-touch-icon.png
```

## Step 3 — Generar favicon.ico (multi-size 16px + 32px)

`favicon.ico` debe contener al menos 2 tamaños (16×16 y 32×32) en un solo fichero.

**Opción A — con sharp** (añadir al script del Step 2):

```js
import sharp from 'sharp'
import { writeFileSync } from 'fs'

// Generar PNG 16x16 y 32x32 en memoria
const png16 = await sharp('public/favicon.svg').resize(16, 16).png().toBuffer()
const png32 = await sharp('public/favicon.svg').resize(32, 32).png().toBuffer()

// Para el .ico, usar el PNG 32x32 como fallback (los navegadores modernos prefieren el SVG)
// El .ico sirve para bots/sistemas legacy que no leen SVG
writeFileSync('public/favicon-32.png', png32)
writeFileSync('public/favicon-16.png', png16)
console.log('PNG sizes generated — convert to ICO next')
```

Luego, si se dispone de `icotool` (librería `icoutils`) o `convert`:

```bash
# Con ImageMagick:
docker compose -f docker-compose.dev.yml run --rm web \
  convert public/favicon-16.png public/favicon-32.png public/favicon.ico

# Limpiar temporales:
rm public/favicon-16.png public/favicon-32.png
```

**Alternativa si no hay herramienta de ICO**: crear el `favicon.ico` como un PNG 32×32
renombrado. No es un ICO real pero es suficiente para la mayoría de bots. Indicar esto
en los comments del fichero de evidencia.

**Nota**: Si ninguna de estas opciones funciona en el entorno, el `favicon.ico` puede
generarse localmente (fuera del contenedor) con cualquier herramienta de escritorio y
copiarse a `public/`. Lo importante es que el fichero exista.

## Step 4 — Añadir `<link>` tags en BaseLayout.astro

En el bloque `<head>` de `BaseLayout.astro`, localizar la línea del favicon SVG y añadir
los dos tags adicionales justo después:

```html
<!-- Favicon -->
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="icon" sizes="any" href="/favicon.ico" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
```

El tag SVG existente se mantiene — los navegadores modernos lo usan preferentemente.
`favicon.ico` actúa como fallback para sistemas que no leen SVG.

## Step 5 — Build y verificar

```bash
docker compose -f docker-compose.dev.yml run --rm web npm run build 2>&1
```

Verificar presencia de los nuevos tags y ficheros:

```bash
# Tags en el HTML
grep 'favicon' dist/index.html

# Ficheros en public/
ls -lh public/favicon.ico public/apple-touch-icon.png
```

## DoD — Definition of Done

1. Build pasa sin errores.
2. `public/favicon.ico` existe y tiene tamaño > 0.
3. `public/apple-touch-icon.png` existe y tiene tamaño > 0.
4. `dist/index.html` contiene `<link rel="icon" sizes="any" href="/favicon.ico">`.
5. `dist/index.html` contiene `<link rel="apple-touch-icon" href="/apple-touch-icon.png">`.
6. `dist/index.html` mantiene el tag SVG original (`type="image/svg+xml"`).

## Evidence to produce

| # | Description | Command | File | PASS condition |
|---|-------------|---------|------|----------------|
| 1 | Build passes | `docker compose -f docker-compose.dev.yml run --rm web npm run build 2>&1` | `build.txt` | Exit 0, no errors |
| 2 | favicon.ico existe | `ls -lh public/favicon.ico` | `assets-check.txt` | Fichero presente, size > 0 |
| 3 | apple-touch-icon existe | `ls -lh public/apple-touch-icon.png` | `assets-check.txt` | Fichero presente, size > 0 |
| 4 | Tags en HTML | `grep 'favicon' dist/index.html` | `head-check.txt` | Aparecen los 3 tags (svg, ico, apple-touch-icon) |

## Files to create/modify

| File | Action |
|------|--------|
| `public/favicon.ico` | CREATE — multi-size 16+32px |
| `public/apple-touch-icon.png` | CREATE — 180×180px |
| `src/layouts/BaseLayout.astro` | MODIFY — añadir 2 tags de favicon |
| `scripts/gen-icons.mjs` | CREATE temporal (borrar tras ejecución) |

## Execution evidence

**Date**: 2026-05-26
**Modified files**:
- `public/apple-touch-icon.png` — generado con sharp desde favicon.svg (180×180, 2.8K)
- `public/favicon.ico` — generado con sharp (16px+32px PNGs intermedios) + ImageMagick vía `apk add imagemagick` (5.4K, ICO real multi-size)
- `src/layouts/BaseLayout.astro` — añadidos `<link rel="icon" sizes="any">` y `<link rel="apple-touch-icon">`

### Verification table

| # | Deliverable | Evidence file | Result |
|---|------------|---------------|--------|
| 1 | Build passes | `docs/tasks/evidence/T003/build.txt` | PASS |
| 2 | favicon.ico existe (5.4K) | `docs/tasks/evidence/T003/assets-check.txt` | PASS |
| 3 | apple-touch-icon.png existe (2.8K) | `docs/tasks/evidence/T003/assets-check.txt` | PASS |
| 4 | Tag favicon.ico en HTML | `docs/tasks/evidence/T003/assets-check.txt` | PASS — `rel="icon" sizes="any" href="/favicon.ico"` |
| 5 | Tag apple-touch-icon en HTML | `docs/tasks/evidence/T003/assets-check.txt` | PASS — `rel="apple-touch-icon" href="/apple-touch-icon.png"` |
| 6 | Tag SVG original intacto | `docs/tasks/evidence/T003/assets-check.txt` | PASS — `rel="icon" type="image/svg+xml"` |

### Design decisions

- ImageMagick no disponible por defecto en Alpine — instalado vía `apk add imagemagick` dentro del contenedor para el paso de composición ICO. La instalación es efímera (el contenedor `--rm` se destruye); no afecta a builds futuros.
- El ICO resultante es un ICO real (no PNG renombrado): contiene las dos imágenes 16×16 y 32×32 embebidas en el formato ICONDIR estándar.
