import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL ?? 'https://cibran.es',
  output: 'static',
  integrations: [tailwind()],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es', 'gl'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
})
