// Capturas del entreno en curso, resumen e imagen para compartir. Requiere `npm run preview`.
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
  const shot = async (n, full = false) => {
    await page.waitForTimeout(500)
    await page.screenshot({ path: `screens/${scheme}-w${n}.png`, fullPage: full })
  }
  await page.goto(BASE)
  await page.getByText('Continuar en el navegador').click()
  await page.getByRole('button', { name: 'Empezar' }).click()
  await page.getByRole('button', { name: 'Crear rutina' }).click()
  await page.getByLabel('Nombre de la rutina').fill('Torso A')
  await page.getByRole('button', { name: 'Crear', exact: true }).click()
  await page.waitForTimeout(300)
  await page.getByRole('button', { name: 'Añadir ejercicios' }).click()
  await newExercise(page, 'Press banca', 'Pecho')
  await newExercise(page, 'Remo con barra', 'Espalda')
  await newExercise(page, 'Curl concentrado', 'Bíceps', true)
  await page.getByRole('button', { name: /Añadir \(/ }).click()
  await page.waitForTimeout(400)
  await page.getByRole('button', { name: 'Superserie con el siguiente' }).first().click()
  await page.getByRole('button', { name: 'OK' }).click()
  await page.getByRole('button', { name: 'Empezar entreno' }).click()
  await page.waitForTimeout(400)

  const press = page.getByRole('region', { name: 'Press banca' })
  await press.getByLabel('Peso serie 1', { exact: true }).fill('80')
  await press.getByLabel('Reps serie 1', { exact: true }).fill('8')
  await press.getByRole('button', { name: 'Marcar serie como hecha' }).first().click()
  await press
    .getByRole('button', { name: /^Tipo:/ })
    .nth(1)
    .click()
  await press
    .getByRole('button', { name: /^Tipo:/ })
    .nth(1)
    .click()
  await press.getByRole('button', { name: 'bajada' }).click()
  await press.getByLabel('Peso serie 2', { exact: true }).fill('70')
  await press.getByLabel('Peso bajada 1').fill('50')
  await press.getByRole('button', { name: /^RIR/ }).nth(2).click()
  await page.locator('body').click({ position: { x: 5, y: 400 } })
  await shot('1-entreno')
  await page.evaluate(() => window.scrollTo(0, 700))
  await shot('2-entreno-unilateral')

  await page.getByRole('button', { name: 'Terminar' }).click()
  await page.getByRole('button', { name: 'Descartar y terminar' }).click()
  const solo = page.getByRole('button', { name: 'Solo este entreno' })
  await solo.click({ timeout: 2500 }).catch(() => {})
  await page.waitForTimeout(400)
  await shot('3-cierre')
  await page.getByRole('button', { name: 'Guardar' }).click()
  await page.waitForTimeout(2200)
  await shot('4-resumen')
  if (scheme === 'dark') {
    await page.evaluate(() => {
      const el = document.querySelector('[aria-hidden].fixed.-left-\\[2000px\\]')
      if (el) el.style.left = '0px'
    })
    const card = page.locator('div[style*="width: 360px"]').first()
    await card.screenshot({ path: 'screens/share-card.png' })
  }
  await ctx.close()
}
await browser.close()
console.log('ok')
