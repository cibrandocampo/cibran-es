import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL ?? 'https://cibran.es',
  output: 'static',
  integrations: [tailwind(), sitemap({ i18n: { defaultLocale: 'en', locales: { en: 'en', es: 'es', gl: 'gl' } } })],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es', 'gl'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
})
