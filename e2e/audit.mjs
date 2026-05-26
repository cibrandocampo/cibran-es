import { chromium } from 'playwright'
import { writeFileSync } from 'fs'

const BASE = 'http://localhost:9080'
const SS = (name) => `/tmp/ss_${name}.png`

const results = []
const log = (emoji, label, detail = '') => {
  const line = `${emoji} ${label}${detail ? ' → ' + detail : ''}`
  results.push(line)
  console.log(line)
}

const browser = await chromium.launch({ args: ['--no-sandbox'] })

// ─── Helper: fresh page with clean localStorage ─────────────────────────────
// locale: BCP-47 primary locale (e.g. 'gl-ES') — sets navigator.language/languages
// acceptLang: full Accept-Language header value (e.g. 'gl-ES,gl;q=0.9,...')
async function freshPage(locale, acceptLang) {
  const header = acceptLang ?? locale
  const ctx = await browser.newContext({
    locale,
    extraHTTPHeaders: { 'Accept-Language': header },
  })
  const page = await ctx.newPage()
  const errors = []
  const failed = []
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('requestfailed', r => failed.push(r.url()))
  return { ctx, page, errors, failed }
}

// ════════════════════════════════════════════════════════════════════════════
// 1. META TAGS — English page
// ════════════════════════════════════════════════════════════════════════════
{
  const { ctx, page } = await freshPage('en-US', 'en-US,en;q=0.9')
  await page.goto(BASE, { waitUntil: 'networkidle' })

  const title = await page.title()
  log(title.includes('Cibrán') ? '✅' : '❌', 'Title', title)

  const desc = await page.$eval('meta[name="description"]', e => e.content).catch(() => 'MISSING')
  log(desc !== 'MISSING' ? '✅' : '❌', 'meta description', desc.slice(0, 80))

  const canonical = await page.$eval('link[rel="canonical"]', e => e.href).catch(() => 'MISSING')
  log(canonical.includes('cibran.es') ? '✅' : '❌', 'canonical', canonical)

  const hreflangs = await page.$$eval('link[rel="alternate"][hreflang]', els => els.map(e => e.hreflang + '=' + e.href))
  log(hreflangs.length >= 4 ? '✅' : '❌', 'hreflang tags', hreflangs.join(', '))

  const ogTitle = await page.$eval('meta[property="og:title"]', e => e.content).catch(() => 'MISSING')
  log(ogTitle !== 'MISSING' ? '✅' : '❌', 'og:title', ogTitle)

  const ogImg = await page.$eval('meta[property="og:image"]', e => e.content).catch(() => 'MISSING')
  log(ogImg !== 'MISSING' ? '✅' : '❌', 'og:image', ogImg)

  const twitterCard = await page.$eval('meta[name="twitter:card"]', e => e.content).catch(() => 'MISSING')
  log(twitterCard !== 'MISSING' ? '✅' : '❌', 'twitter:card', twitterCard)

  const robots = await page.$eval('meta[name="robots"]', e => e.content).catch(() => 'MISSING')
  log(robots.includes('max-snippet') ? '✅' : '❌', 'meta robots', robots)

  const author = await page.$eval('meta[name="author"]', e => e.content).catch(() => 'MISSING')
  log(author !== 'MISSING' ? '✅' : '❌', 'meta author', author)

  const profileFirst = await page.$eval('meta[property="profile:first_name"]', e => e.content).catch(() => 'MISSING')
  log(profileFirst !== 'MISSING' ? '✅' : '❌', 'og:profile tags', profileFirst)

  const jsonldBlocks = await page.$$eval('script[type="application/ld+json"]', els => els.map(e => {
    try { const d = JSON.parse(e.textContent); return d['@type'] } catch { return 'PARSE_ERROR' }
  }))
  log(jsonldBlocks.includes('Person') && jsonldBlocks.includes('WebSite') ? '✅' : '❌', 'JSON-LD blocks', jsonldBlocks.join(', '))

  const jsonldEmail = await page.$eval('script[type="application/ld+json"]', e => {
    try { return JSON.parse(e.textContent).email } catch { return 'MISSING' }
  }).catch(() => 'MISSING')
  log(jsonldEmail === 'hola@cibran.es' ? '✅' : '❌', 'JSON-LD email', jsonldEmail)

  await page.screenshot({ path: SS('01_en_head'), fullPage: false })
  await ctx.close()
}

// ─── Helper: test language redirect ─────────────────────────────────────────
// The inline JS calls window.location.replace() which causes a secondary navigation.
// Using 'domcontentloaded' + waitForURL handles the redirect correctly.
async function testLangDetect(locale, acceptLang, expectedPath) {
  const { ctx, page } = await freshPage(locale, acceptLang)
  // Use domcontentloaded so we don't wait for networkidle on the *first* load;
  // the JS redirect fires before DOMContentLoaded completes, so waitForURL catches it.
  await page.goto(BASE, { waitUntil: 'domcontentloaded' }).catch(() => {})
  // Wait for the redirect to settle (up to 5s)
  await page.waitForURL(u => u.href.includes(expectedPath) || u.href === BASE + '/', { timeout: 5000 }).catch(() => {})
  const url = page.url()
  const htmlLang = await page.$eval('html', e => e.lang).catch(() => '?')
  await ctx.close()
  return { url, htmlLang }
}

// ════════════════════════════════════════════════════════════════════════════
// 2. LANGUAGE DETECTION — Galician
// ════════════════════════════════════════════════════════════════════════════
{
  const { url, htmlLang } = await testLangDetect('gl-ES', 'gl-ES,gl;q=0.9,en-US;q=0.8,en;q=0.7', '/gl/')
  log(url.includes('/gl') ? '✅' : '❌', 'Lang detect → GL', `url=${url} lang=${htmlLang}`)
}

// ════════════════════════════════════════════════════════════════════════════
// 3. LANGUAGE DETECTION — Spanish
// ════════════════════════════════════════════════════════════════════════════
{
  const { url, htmlLang } = await testLangDetect('es-ES', 'es-ES,es;q=0.9', '/es/')
  log(url.includes('/es') ? '✅' : '❌', 'Lang detect → ES', `url=${url} lang=${htmlLang}`)
}

// ════════════════════════════════════════════════════════════════════════════
// 4. LANGUAGE DETECTION — Catalan (should go to ES)
// ════════════════════════════════════════════════════════════════════════════
{
  const { url } = await testLangDetect('ca-ES', 'ca-ES,ca;q=0.9', '/es/')
  log(url.includes('/es') ? '✅' : '❌', 'Lang detect CA → ES', `url=${url}`)
}

// ════════════════════════════════════════════════════════════════════════════
// 5. LANGUAGE DETECTION — Basque (should go to ES)
// ════════════════════════════════════════════════════════════════════════════
{
  const { url } = await testLangDetect('eu-ES', 'eu-ES,eu;q=0.9', '/es/')
  log(url.includes('/es') ? '✅' : '❌', 'Lang detect EU → ES', `url=${url}`)
}

// ════════════════════════════════════════════════════════════════════════════
// 6. LANGUAGE DETECTION — English (no redirect)
// ════════════════════════════════════════════════════════════════════════════
{
  const { url } = await testLangDetect('en-US', 'en-US,en;q=0.9', '/')
  log(!url.includes('/es') && !url.includes('/gl') ? '✅' : '❌', 'Lang detect EN → root', `url=${url}`)
}

// ════════════════════════════════════════════════════════════════════════════
// 7. FULL PAGE RENDER + SECTIONS + CONSOLE ERRORS
// ════════════════════════════════════════════════════════════════════════════
{
  const { ctx, page, errors, failed } = await freshPage('en-US')
  await page.goto(BASE, { waitUntil: 'networkidle' })

  // Sections visible
  const sections = ['#about', '#professional', '#portfolio', '#contact']
  for (const id of sections) {
    await page.locator(id).scrollIntoViewIfNeeded()
    await page.waitForTimeout(300)
    const visible = await page.locator(id).isVisible()
    log(visible ? '✅' : '❌', `Section ${id} visible`)
  }
  await page.screenshot({ path: SS('07_en_full'), fullPage: true })

  // Console errors
  log(errors.length === 0 ? '✅' : '⚠️', 'Console errors', errors.length === 0 ? 'none' : errors.slice(0,3).join(' | '))

  // Failed requests
  log(failed.length === 0 ? '✅' : '⚠️', 'Failed network requests', failed.length === 0 ? 'none' : failed.slice(0,5).join(' | '))

  await ctx.close()
}

// ════════════════════════════════════════════════════════════════════════════
// 8. IMAGES — check all img tags load
// ════════════════════════════════════════════════════════════════════════════
{
  const { ctx, page } = await freshPage('en-US')
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(1500)

  const imgResults = await page.$$eval('img', imgs => imgs.map(img => ({
    src: img.src,
    ok: img.complete && img.naturalWidth > 0,
    alt: img.alt || '(no alt)',
  })))
  const broken = imgResults.filter(i => !i.ok)
  const noAlt = imgResults.filter(i => !i.alt || i.alt === '(no alt)')
  log(broken.length === 0 ? '✅' : '❌', `Images loaded (${imgResults.length} total)`, broken.length > 0 ? 'BROKEN: ' + broken.map(i=>i.src).join(', ') : 'all OK')
  log(noAlt.length === 0 ? '✅' : '⚠️', `Images alt text`, noAlt.length > 0 ? `${noAlt.length} missing alt: ${noAlt.map(i=>i.src.split('/').pop()).join(', ')}` : 'all have alt')

  await ctx.close()
}

// ════════════════════════════════════════════════════════════════════════════
// 9. NAVIGATION LINKS
// ════════════════════════════════════════════════════════════════════════════
{
  const { ctx, page } = await freshPage('en-US')
  await page.goto(BASE, { waitUntil: 'networkidle' })

  const navLinks = await page.$$eval('nav a', els => els.map(e => ({ text: e.textContent.trim(), href: e.href })))
  log(navLinks.length > 0 ? '✅' : '❌', `Nav links (${navLinks.length})`, navLinks.map(l => l.text).join(', '))

  await ctx.close()
}

// ════════════════════════════════════════════════════════════════════════════
// 10. SITEMAP + ROBOTS
// ════════════════════════════════════════════════════════════════════════════
{
  const { ctx, page } = await freshPage('en-US')

  const sitemapRes = await page.goto(`${BASE}/sitemap.xml`)
  log(sitemapRes.status() === 200 ? '✅' : '❌', 'GET /sitemap.xml', `HTTP ${sitemapRes.status()}`)
  const sitemapBody = await page.content()
  log(sitemapBody.includes('sitemap-0.xml') ? '✅' : '❌', 'sitemap.xml references sitemap-0.xml')

  const sitemap0Res = await page.goto(`${BASE}/sitemap-0.xml`)
  log(sitemap0Res.status() === 200 ? '✅' : '❌', 'GET /sitemap-0.xml', `HTTP ${sitemap0Res.status()}`)
  const sitemap0Body = await page.content()
  const hreflangs = [...sitemap0Body.matchAll(/hreflang="([^"]+)"/g)].map(m => m[1])
  const uniqueHreflangs = [...new Set(hreflangs)]
  const hasOldCodes = uniqueHreflangs.some(h => h.includes('-'))
  log(!hasOldCodes ? '✅' : '❌', 'sitemap-0.xml hreflang (no region codes)', uniqueHreflangs.join(', '))

  const robotsRes = await page.goto(`${BASE}/robots.txt`)
  log(robotsRes.status() === 200 ? '✅' : '❌', 'GET /robots.txt', `HTTP ${robotsRes.status()}`)
  const robotsBody = await page.content()
  log(robotsBody.includes('sitemap.xml') ? '✅' : '❌', 'robots.txt references sitemap.xml')

  const llmsRes = await page.goto(`${BASE}/llms.txt`)
  log(llmsRes.status() === 200 ? '✅' : '❌', 'GET /llms.txt', `HTTP ${llmsRes.status()}`)
  const llmsBody = await page.content()
  log(llmsBody.includes('hola@cibran.es') ? '✅' : '❌', 'llms.txt canonical email')
  log(llmsBody.includes('### Nudge') ? '✅' : '❌', 'llms.txt has projects')

  await ctx.close()
}

// ════════════════════════════════════════════════════════════════════════════
// 11. FAVICON FILES
// ════════════════════════════════════════════════════════════════════════════
{
  const { ctx, page } = await freshPage('en-US')

  for (const f of ['/favicon.svg', '/favicon.ico', '/apple-touch-icon.png']) {
    const res = await page.goto(`${BASE}${f}`)
    log(res.status() === 200 ? '✅' : '❌', `GET ${f}`, `HTTP ${res.status()}`)
  }

  await ctx.close()
}

// ════════════════════════════════════════════════════════════════════════════
// 12. ES + GL PAGES — meta consistency
// ════════════════════════════════════════════════════════════════════════════
for (const [locale, path] of [['es', '/es/'], ['gl', '/gl/']]) {
  const { ctx, page } = await freshPage('en-US')
  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' })
  const htmlLang = await page.$eval('html', e => e.lang).catch(() => '?')
  const canonical = await page.$eval('link[rel="canonical"]', e => e.href).catch(() => 'MISSING')
  const ogLocale = await page.$eval('meta[property="og:locale"]', e => e.content).catch(() => 'MISSING')
  log(htmlLang === locale ? '✅' : '❌', `/${locale}/ html lang`, htmlLang)
  log(canonical.includes(`/${locale}/`) ? '✅' : '❌', `/${locale}/ canonical`, canonical)
  log(ogLocale.startsWith(locale) ? '✅' : '❌', `/${locale}/ og:locale`, ogLocale)
  await page.screenshot({ path: SS(`12_${locale}_page`), fullPage: false })
  await ctx.close()
}

// ════════════════════════════════════════════════════════════════════════════
// 13. MOBILE VIEWPORT
// ════════════════════════════════════════════════════════════════════════════
{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, locale: 'en-US' })
  const page = await ctx.newPage()
  await page.goto(BASE, { waitUntil: 'networkidle' })
  const bodyOverflow = await page.evaluate(() => {
    const b = document.body
    return b.scrollWidth > b.clientWidth
  })
  log(!bodyOverflow ? '✅' : '⚠️', 'Mobile 375px — no horizontal overflow', bodyOverflow ? 'OVERFLOW DETECTED' : 'OK')
  await page.screenshot({ path: SS('13_mobile'), fullPage: false })
  await ctx.close()
}

// ════════════════════════════════════════════════════════════════════════════
// 14. PROBE — 404 page
// ════════════════════════════════════════════════════════════════════════════
{
  const { ctx, page } = await freshPage('en-US')
  const res = await page.goto(`${BASE}/nonexistent-page`)
  log(res.status() === 404 ? '✅' : '⚠️', '🔍 404 for unknown route', `HTTP ${res.status()}`)
  await ctx.close()
}

// ════════════════════════════════════════════════════════════════════════════
// 15. PROBE — Docker Hub pull counts (build-time data)
// ════════════════════════════════════════════════════════════════════════════
{
  const { ctx, page } = await freshPage('en-US')
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.locator('#portfolio').scrollIntoViewIfNeeded()
  await page.waitForTimeout(500)
  const pullBadges = await page.$$eval('[class*="pull"], [data-pulls]', els => els.length).catch(() => 0)
  // Check for any number text in portfolio that looks like a pull count
  const portfolioText = await page.locator('#portfolio').innerText().catch(() => '')
  const hasPullNumbers = /\d[\d,\.]+[kK]?\s*(pull|download)/i.test(portfolioText) || /\d{3,}/.test(portfolioText)
  log(hasPullNumbers ? '✅' : '⚠️', '🔍 Docker Hub pull counts in portfolio', hasPullNumbers ? 'numbers found' : 'no pull count numbers visible — may be in badges not text')
  await page.screenshot({ path: SS('15_portfolio'), fullPage: false })
  await ctx.close()
}

await browser.close()

// ════════════════════════════════════════════════════════════════════════════
// SUMMARY
// ════════════════════════════════════════════════════════════════════════════
console.log('\n══════════════════════════════')
console.log('AUDIT SUMMARY')
console.log('══════════════════════════════')
const passes = results.filter(r => r.startsWith('✅')).length
const fails = results.filter(r => r.startsWith('❌')).length
const warns = results.filter(r => r.startsWith('⚠️')).length
console.log(`✅ ${passes} passed`)
console.log(`❌ ${fails} failed`)
console.log(`⚠️  ${warns} warnings`)
if (fails > 0 || warns > 0) {
  console.log('\nISSUES:')
  results.filter(r => r.startsWith('❌') || r.startsWith('⚠️')).forEach(r => console.log(' ', r))
}
