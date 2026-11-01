// Revisión visual: capturas a 390×844 (iPhone 12 Pro) en claro y oscuro.
// Uso: node scripts/screens.mjs [ruta1 ruta2 ...]   (con `npm run preview` en marcha)
import { chromium, devices } from '@playwright/test'
import { mkdirSync } from 'node:fs'

const BASE = process.env.BASE_URL ?? 'http://localhost:4173/forja/'
const routes = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ['', 'calendario', 'estadisticas', 'running', 'ajustes']
mkdirSync('screens', { recursive: true })

const browser = await chromium.launch()
for (const scheme of ['light', 'dark']) {
  const ctx = await browser.newContext({ ...devices['iPhone 12 Pro'], colorScheme: scheme })
  const page = await ctx.newPage()
  page.on('pageerror', (e) => console.error('ERROR', e.message))
  // instalación + bienvenida
  await page.goto(BASE)
  await page.screenshot({ path: `screens/${scheme}-0-instalar.png` })
  await page.getByText('Continuar en el navegador').click()
  await page.waitForTimeout(300)
  await page.screenshot({ path: `screens/${scheme}-1-bienvenida.png` })
  await page.getByRole('button', { name: 'Empezar' }).click()
  await page.waitForTimeout(400)
  for (const raw of routes) {
    const r = raw === 'inicio' ? '' : raw
    await page.goto(`${BASE}#/${r}`)
    await page.waitForTimeout(500)
    await page.screenshot({ path: `screens/${scheme}-${r || 'inicio'}.png` })
  }
  await ctx.close()
}
await browser.close()
console.log('capturas en ./screens')
