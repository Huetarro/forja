// Capturas de flujos con datos (390×844, claro y oscuro). Requiere `npm run preview`.
// Uso: node scripts/screens-flow.mjs
import { chromium, devices } from '@playwright/test'
import { mkdirSync } from 'node:fs'

const BASE = process.env.BASE_URL ?? 'http://localhost:4173/forja/'
mkdirSync('screens', { recursive: true })

async function newExercise(page, name, muscle, unilateral = false) {
  await page.getByRole('button', { name: 'Nuevo ejercicio' }).click()
  await page.getByLabel('Nombre del ejercicio').fill(name)
  await page.getByLabel('Músculo principal').selectOption(muscle)
  if (unilateral) await page.getByRole('switch', { name: 'Unilateral' }).click()
  await page.getByRole('button', { name: 'Crear', exact: true }).click()
  await page.waitForTimeout(450)
}

const browser = await chromium.launch()
for (const scheme of ['light', 'dark']) {
  const ctx = await browser.newContext({ ...devices['iPhone 12 Pro'], colorScheme: scheme })
  const page = await ctx.newPage()
  page.on('pageerror', (e) => console.error('ERROR', e.message))
  const shot = async (n) => {
    await page.waitForTimeout(450)
    await page.screenshot({ path: `screens/${scheme}-${n}.png` })
  }
  await page.goto(BASE)
  await page.getByText('Continuar en el navegador').click()
  await page.getByRole('button', { name: 'Empezar' }).click()

  await page.getByRole('button', { name: 'Crear rutina' }).click()
  await page.getByLabel('Nombre de la rutina').fill('Torso A')
  await shot('f1-meta')
  await page.getByRole('button', { name: 'Crear', exact: true }).click()
  await page.waitForTimeout(400)
  await page.getByRole('button', { name: 'Añadir ejercicios' }).click()
  await newExercise(page, 'Press banca', 'Pecho')
  await newExercise(page, 'Remo con barra', 'Espalda')
  await newExercise(page, 'Curl concentrado', 'Bíceps', true)
  await shot('f2-picker')
  await page.getByRole('button', { name: /Añadir \(/ }).click()
  await page.waitForTimeout(400)
  await page
    .getByRole('button', { name: /Serie 1: Normal/ })
    .first()
    .click()
  await page.getByRole('button', { name: 'Superserie con el siguiente' }).first().click()
  await shot('f3-editor')
  await page.getByRole('button', { name: 'OK' }).click()
  await shot('f4-detalle')
  await page.getByRole('link', { name: 'Inicio' }).click()
  await shot('f5-inicio')
  await page.goto(`${BASE}#/ejercicios`)
  await shot('f6-ejercicios')
  await ctx.close()
}
await browser.close()
console.log('ok')
