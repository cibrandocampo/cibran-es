import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL ?? 'https://cibran.es',
  output: 'static',
  integrations: [tailwind(), sitemap()],
})
