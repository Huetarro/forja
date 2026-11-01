// Capturas finales (Ajustes, ficha de ejercicio, historial, inicio) con datos de ejemplo.
import { chromium, devices } from '@playwright/test'
import { mkdirSync } from 'node:fs'

const BASE = process.env.BASE_URL ?? 'http://localhost:4173/forja/'
mkdirSync('screens', { recursive: true })
const browser = await chromium.launch()
for (const scheme of ['light', 'dark']) {
  const ctx = await browser.newContext({ ...devices['iPhone 12 Pro'], colorScheme: scheme })
  const page = await ctx.newPage()
  page.on('pageerror', (e) => console.error('ERROR', e.message))
  await page.goto(BASE)
  await page.getByText('Continuar en el navegador').click()
  await page.getByRole('button', { name: 'Empezar' }).click()
  await page.goto(`${BASE}#/ajustes`)
  await page.waitForTimeout(500)
  await page.screenshot({ path: `screens/${scheme}-z1-ajustes.png` })
  await page.getByRole('button', { name: 'Cargar datos de ejemplo' }).click()
  await page.getByRole('button', { name: 'Borrar datos de ejemplo' }).waitFor()
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(400)
  await page.screenshot({ path: `screens/${scheme}-z2-ajustes-fin.png` })
  await page.goto(`${BASE}#/`)
  await page.waitForTimeout(1000)
  await page.screenshot({ path: `screens/${scheme}-z3-inicio.png`, fullPage: true })
  await page.goto(`${BASE}#/ejercicios`)
  await page.waitForTimeout(600)
  await page.getByRole('link', { name: /Curl concentrado/ }).click()
  await page.waitForTimeout(1500)
  await page.screenshot({ path: `screens/${scheme}-z4-ficha.png`, fullPage: true })
  await page.goto(`${BASE}#/historial`)
  await page.waitForTimeout(600)
  await page
    .getByRole('link', { name: /ejemplo/ })
    .first()
    .click()
  await page.waitForTimeout(800)
  await page.screenshot({ path: `screens/${scheme}-z5-detalle.png` })
  await ctx.close()
}
await browser.close()
console.log('ok')
