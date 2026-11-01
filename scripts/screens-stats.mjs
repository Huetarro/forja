// Capturas de Estadísticas con datos de ejemplo. Requiere `npm run preview`.
import { chromium, devices } from '@playwright/test'
import { mkdirSync } from 'node:fs'

const BASE = process.env.BASE_URL ?? 'http://localhost:4173/forja/'
mkdirSync('screens', { recursive: true })
const browser = await chromium.launch()
for (const scheme of ['light', 'dark']) {
  const ctx = await browser.newContext({ ...devices['iPhone 12 Pro'], colorScheme: scheme })
  const page = await ctx.newPage()
  page.on('pageerror', (e) => console.error('ERROR', e.message))
  page.on('console', (m) => m.type() === 'error' && console.error('CONSOLE', m.text()))
  await page.goto(BASE)
  await page.getByText('Continuar en el navegador').click()
  await page.getByRole('button', { name: 'Empezar' }).click()
  await page.goto(`${BASE}#/ajustes`)
  await page.getByRole('button', { name: 'Cargar datos de ejemplo' }).click()
  await page.getByRole('button', { name: 'Borrar datos de ejemplo' }).waitFor()
  const shots = [
    ['s1-resumen', '#/estadisticas?tab=resumen&rango=3m', 0],
    ['s2-resumen-b', '#/estadisticas?tab=resumen&rango=3m', 900],
    ['s3-ejercicios', '#/estadisticas?tab=ejercicios&rango=3m', 0],
    ['s5-musculos', '#/estadisticas?tab=musculos&rango=3m', 0],
    ['s6-cuerpo', '#/estadisticas?tab=cuerpo&rango=3m', 0],
    ['s7-habitos', '#/estadisticas?tab=habitos&rango=3m', 0],
    ['s8-inicio', '#/', 0],
    ['s9-calendario', '#/calendario', 500],
  ]
  for (const [name, hash, y] of shots) {
    await page.goto(`${BASE}${hash}`)
    await page.waitForTimeout(1200)
    await page.evaluate(() => window.scrollTo(0, 0))
    if (y) await page.evaluate((v) => window.scrollTo(0, v), y)
    await page.waitForTimeout(300)
    await page.screenshot({ path: `screens/${scheme}-${name}.png` })
  }
  await page.goto(`${BASE}#/estadisticas?tab=ejercicios&rango=3m`)
  await page.waitForTimeout(800)
  await page.getByRole('button', { name: /Press banca/ }).click()
  await page.waitForTimeout(1000)
  await page.screenshot({ path: `screens/${scheme}-s4-ejercicio.png` })
  await ctx.close()
}
await browser.close()
console.log('ok')
