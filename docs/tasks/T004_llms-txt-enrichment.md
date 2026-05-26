# T004 — llms.txt enrichment

## Context

`public/llms.txt` es el fichero de orientación para LLMs (AI crawlers como GPTBot,
ClaudeBot, PerplexityBot, etc.). El fichero actual tiene problemas: usa `hello@cibran.es`
en lugar del email canónico `hola@cibran.es`, no tiene sección de proyectos (la parte más
concreta y diferenciadora del perfil), no lista Portugués en los idiomas, y la sección
Contact solo incluye 2 de los 8 perfiles sociales.

Plan de referencia: `docs/plans/seo-metadata-hardening.md`

**Dependencies**: None — fichero de texto estático, independiente de cualquier otro cambio.

## Objective

Reescribir `public/llms.txt` para que sea una referencia completa y autoritativa del
perfil de Cibrán: email canónico, sección Projects con los proyectos destacados y sus URLs,
lista de idiomas completa, y todos los perfiles sociales relevantes en Contact.

## Step 1 — Leer el contenido actual de llms.txt y los datos de proyectos

Antes de modificar, revisar el estado actual del fichero y los datos del portfolio en
`src/data/projects.json` para extraer los proyectos `highlight: true` con sus URLs y
descripciones.

## Step 2 — Reescribir llms.txt

Reemplazar el contenido completo de `public/llms.txt` con la versión enriquecida:

```markdown
# Cibrán Docampo — Personal Site

> Senior Software Developer based in Cangas, Galicia, Spain.
> Over a decade of experience designing and building software across IPTV, broadcast,
> maritime surveillance, e-health, and large-scale observability platforms.

## About

Cibrán Docampo Piñeiro is a Telecommunications Engineer and Senior Software Developer
with deep expertise in backend systems, cloud architecture, and data engineering. He has
worked as Tech Lead on high-complexity, high-performance projects across multiple sectors.

## Core expertise

- Backend: Python, Flask, Django/DRF, Node.js, C/C++, Java
- Data & Databases: PostgreSQL, DynamoDB, Redis, InfluxDB, time-series databases
- Cloud & DevOps: AWS, Docker, Kubernetes, Terraform, CI/CD
- Observability: Grafana, Prometheus, ELK Stack, CloudWatch, Loki
- Multimedia & AV: FFmpeg, HW/SW transcoding, DVB/IPTV, HLS/DASH streaming
- Frontend: Vue.js, React, Astro

## Career highlights

- Senior Software Developer at Plexus Tech (2022–present): real-time observability platform
  processing hundreds of millions of events per day; food delivery integration (Burger King,
  Popeyes, Telepizza); e-health platform for MAPFRE.
- Senior Software Developer at Optiva Media (2021–2022): Media & TV streaming platform
  development for Telefónica.
- Multimedia & AV Engineering at TRISON (2018–2021): designed innovative AV solutions for
  interactive retail spaces, touch-sensitive floors in shopping centres, and VR/AR
  experiences for car dealerships worldwide (Porsche, Inditex, Ecoalf, Baleària, AENA).
- DVB/IPTV Engineering at Arantia/Televes (2013–2018): built professional IPTV headend
  and hardware/software transcoding systems.
- Tech Lead: led multidisciplinary software development squads on high-complexity,
  high-performance projects.

## Personal projects

Open source projects on GitHub (github.com/cibrandocampo) and Docker Hub
(hub.docker.com/u/cibrandocampo).

[IMPORTANTE: en este step, rellenar esta sección con los proyectos highlight: true de
src/data/projects.json. Para cada proyecto incluir: nombre, descripción breve, URL si
existe, y enlace a GitHub si existe. Ver Step 3.]

## Contact

- Email: hola@cibran.es
- Location: Cangas, Galicia, Spain
- LinkedIn: linkedin.com/in/cidocampo
- GitHub: github.com/cibrandocampo
- Docker Hub: hub.docker.com/u/cibrandocampo
- HappyWhale: happywhale.com/user/25322
- eBird: ebird.org (124 species logged)
- 500px: 500px.com/p/cibrandocampo

## Languages

- Galician: Native
- Spanish: Native
- English: Professional working proficiency
- Portuguese: Basic (conversational)
```

## Step 3 — Completar la sección Projects con datos reales

Leer `src/data/projects.json` y extraer todos los proyectos con `"highlight": true`.
Para cada uno, añadir una entrada en la sección **Personal projects** con este formato:

```markdown
### Nombre del proyecto

Descripción breve (de projects.json, campo description).
GitHub: github.com/cibrandocampo/repo-name
URL: url-del-proyecto (si existe)
```

Los proyectos highlight actuales son: Nudge, OVH DynDNS, Synology Video Enhancer,
YourFisio, eBird Life List, HappyWhale, CarbWise, Lego Builder. Verificar en el JSON
que estos siguen siendo los correctos y ajustar si hay cambios.

## Step 4 — Verificar el fichero final

```bash
# Verificar email canónico
grep 'hola@cibran.es' public/llms.txt

# Verificar sección Projects
grep -c '###' public/llms.txt

# Verificar idiomas completos
grep 'Portuguese' public/llms.txt

# Verificar perfiles sociales
grep 'Docker Hub\|HappyWhale\|eBird' public/llms.txt
```

## DoD — Definition of Done

1. `public/llms.txt` contiene `hola@cibran.es` (no `hello@`).
2. El fichero tiene una sección `## Personal projects` con al menos 4 proyectos con nombre y descripción.
3. La sección `## Languages` incluye Galician, Spanish, English y Portuguese.
4. La sección `## Contact` incluye al menos LinkedIn, GitHub, Docker Hub.
5. El fichero sigue el formato markdown con `#` / `##` / `###` apropiados.
6. Build pasa sin errores (llms.txt es estático — el build no lo procesa, pero confirmar que no hay errores).

## Evidence to produce

| # | Description | Command | File | PASS condition |
|---|-------------|---------|------|----------------|
| 1 | Email canónico | `grep 'hola@cibran.es' public/llms.txt` | `llms-check.txt` | Match encontrado |
| 2 | Sección proyectos | `grep -c '###' public/llms.txt` | `llms-check.txt` | Output >= 4 |
| 3 | Portugués en idiomas | `grep 'Portuguese' public/llms.txt` | `llms-check.txt` | Match encontrado |
| 4 | Perfiles sociales | `grep 'Docker Hub' public/llms.txt` | `llms-check.txt` | Match encontrado |
| 5 | Build sin errores | `docker compose -f docker-compose.dev.yml run --rm web npm run build 2>&1` | `build.txt` | Exit 0 |

## Files to create/modify

| File | Action |
|------|--------|
| `public/llms.txt` | MODIFY — reescritura completa |

## Execution evidence

**Date**: 2026-05-26
**Modified files**:
- `public/llms.txt` — reescrito completo: email canónico, 8 proyectos highlight con nombre/descripción/URLs, Career highlights con nombres de empresa, sección Contact con 6 perfiles sociales, Languages con Portugués añadido

### Verification table

| # | Deliverable | Evidence file | Result |
|---|------------|---------------|--------|
| 1 | Email `hola@cibran.es` presente | `docs/tasks/evidence/T004/llms-check.txt` | PASS |
| 2 | 8 proyectos `###` (≥4 requeridos) | `docs/tasks/evidence/T004/llms-check.txt` | PASS — 8 |
| 3 | Portuguese en Languages | `docs/tasks/evidence/T004/llms-check.txt` | PASS |
| 4 | Docker Hub + HappyWhale en Contact | `docs/tasks/evidence/T004/llms-check.txt` | PASS |
| 5 | `hello@` ausente | `docs/tasks/evidence/T004/llms-check.txt` | PASS |
| 6 | Build sin errores | `docs/tasks/evidence/T004/build.txt` | PASS — `[build] Complete!` |
