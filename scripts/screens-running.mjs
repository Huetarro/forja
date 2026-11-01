// Capturas de Running con varias carreras. Requiere `npm run preview`.
import { chromium, devices } from '@playwright/test'
import { mkdirSync } from 'node:fs'

const BASE = process.env.BASE_URL ?? 'http://localhost:4173/forja/'
mkdirSync('screens', { recursive: true })
const RUNS = [
  ['2026-09-14', '5', '27', '10', '148'],
  ['2026-09-28', '8,2', '43', '30', '152'],
  ['2026-10-12', '10', '51', '40', '156'],
  ['2026-10-19', '6,5', '32', '05', '150'],
  ['2026-10-26', '12', '63', '0', '158'],
  ['2026-10-31', '5', '24', '50', '160'],
]

const browser = await chromium.launch()
for (const scheme of ['light', 'dark']) {
  const ctx = await browser.newContext({ ...devices['iPhone 12 Pro'], colorScheme: scheme })
  const page = await ctx.newPage()
  page.on('pageerror', (e) => console.error('ERROR', e.message))
  await page.goto(BASE)
  await page.getByText('Continuar en el navegador').click()
  await page.getByRole('button', { name: 'Empezar' }).click()
  for (const [date, km, min, sec, hr] of RUNS) {
    await page.goto(`${BASE}#/running?nueva=1`)
    const s = page.getByRole('dialog')
    await s.getByLabel('Fecha').fill(date)
    await s.getByLabel('Distancia').fill(km)
    const total = Number(min)
    await s.getByLabel('Horas').selectOption(String(Math.floor(total / 60)))
    await s.getByLabel('Minutos').selectOption(String(total % 60))
    await s.getByLabel('Segundos').selectOption(String(Number(sec)))
    await s.getByLabel('Pulsaciones medias').fill(hr)
    await s.getByRole('button', { name: 'Guardar' }).click()
    await s.waitFor({ state: 'hidden' })
  }
  await page.waitForTimeout(800)
  await page.screenshot({ path: `screens/${scheme}-r1-running.png` })
  await page.evaluate(() => window.scrollTo(0, 650))
  await page.waitForTimeout(400)
  await page.screenshot({ path: `screens/${scheme}-r2-running.png` })
  await page.goto(`${BASE}#/running?nueva=1`)
  await page.waitForTimeout(600)
  await page.screenshot({ path: `screens/${scheme}-r3-form.png` })
  await ctx.close()
}
await browser.close()
console.log('ok')
