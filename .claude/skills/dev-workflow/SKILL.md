---
name: dev-workflow
description: Development workflow and Docker commands for cibran.es. Use when setting up the environment, running the dev server, building the site, or running linters. Triggers when the user asks about development setup, Docker, or environment issues.
---

# Development Workflow — cibran.es

## Stack

- **Astro** static site generator
- **Tailwind CSS** for styling
- **Lucide** for icons
- **Docker + Nginx** for serving (production)

## Golden Rule

**NEVER run Node or npm directly on the host.**
Always use Docker — bind mounts mean local file changes are reflected instantly without rebuilding.

Two compose files:
- `docker-compose.dev.yml` — development (Astro dev server with HMR, bind mounts)
- `docker-compose.yml` — production (Nginx serving the built static output)

## Start / Stop

```bash
# Development
docker compose -f docker-compose.dev.yml up -d        # Start dev server
docker compose -f docker-compose.dev.yml down         # Stop

# Production
docker compose up -d                                   # Start Nginx
docker compose down                                    # Stop
```

## Services

| Service  | Port | Purpose                       |
|----------|------|-------------------------------|
| `web`    | 4321 | Astro dev server (HMR)        |
| `nginx`  | 9080 | Nginx serving built site      |

## Common commands

```bash
# Install dependencies
docker compose -f docker-compose.dev.yml run --rm web npm install

# Build for production
docker compose -f docker-compose.dev.yml run --rm web npm run build

# Lint
docker compose -f docker-compose.dev.yml run --rm web npm run lint

# Format (Prettier)
docker compose -f docker-compose.dev.yml run --rm web npm run format

# Format check (for CI/pre-commit)
docker compose -f docker-compose.dev.yml run --rm web npm run format:check

# View logs
docker compose -f docker-compose.dev.yml logs web --tail=50
```

## Quick verification

```bash
# Dev server responding
curl -s -o /dev/null -w "%{http_code}" http://localhost:4321/    # 200

# Production build serving
curl -s -o /dev/null -w "%{http_code}" http://localhost:9080/    # 200
```

## Environment variables

All env vars in `.env` at the project root. Key ones:
- `PUBLIC_SITE_URL` — canonical URL (e.g. https://cibran.es)
- `NGINX_HTTP_PORT` — port for the production Nginx container (default: 9080)

## Build output

Astro builds to `dist/`. The production `docker-compose.yml` mounts `dist/` into Nginx.
After each `npm run build`, restart Nginx to pick up changes:

```bash
docker compose restart nginx
```
