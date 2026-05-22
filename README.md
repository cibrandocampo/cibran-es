# cibran.es

<p align="center">
  <img src="https://img.shields.io/badge/Astro-5.x-FF5D01?logo=astro&logoColor=white" alt="Astro 5"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.x-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS 3"/>
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white" alt="TypeScript 5"/>
</p>

<p align="center">
  The quickest way to get to know Cibrán Docampo — who he is, what he's into,
  the projects he's actually proud of, and the kind of work he does best.
  <br/>
  <sub>And don't skip the <em>A few numbers</em> section.</sub>
</p>

<p align="center">
  <a href="https://cibran.es"><strong>cibran.es →</strong></a>
</p>

---

## Stack

| Layer | Technology |
|---|---|
| Framework | [Astro](https://astro.build) — static site generator, zero JS by default |
| Styling | [Tailwind CSS](https://tailwindcss.com) — utility-first, dark theme only |
| Icons | [Lucide](https://lucide.dev) via `@lucide/astro` |
| i18n | Astro i18n routing — EN (default at `/`), ES (`/es/`), GL (`/gl/`) |
| Serving | Nginx (local) · GitHub Pages (live) |
| Dev | Docker + bind mounts — HMR without Node on the host |
| CI/CD | GitHub Actions — builds and deploys on every push to `main` |

## Local development

```bash
# Start the Astro dev server with HMR (port 4321)
docker compose -f docker-compose.dev.yml up -d

# Build for production
docker compose -f docker-compose.dev.yml run --rm web npm run build

# Serve the built output with Nginx (port 9080)
docker compose up -d
```

All Node/npm commands run inside Docker — no local Node installation needed.

## Content

All site content lives in `src/data/` as JSON: bio, experience, education, skills, projects, interests, and fun facts. Docker Hub pull counts for portfolio projects are fetched live from the Docker Hub API at build time and baked into the generated HTML — no client-side requests, no proxy.

A GitHub Actions scheduled workflow rebuilds the site weekly to keep the pull counts current.

## Built with Claude Code

This project was developed with the help of [Claude Code](https://claude.ai/code), Anthropic's AI coding assistant. Custom skills and commands live in `.claude/` to maintain project conventions.

## License

[MIT](LICENSE) © 2026 Cibrán Docampo Piñeiro
