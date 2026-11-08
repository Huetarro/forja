// Capturas de propuesta del rediseño (390×844, ×2). Requiere `npm run preview`.
import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'

const BASE = process.env.BASE_URL ?? 'http://localhost:4173/forja/'
mkdirSync('propuestas', { recursive: true })

const FRIDAY = new Date('2026-11-13T18:00:00+01:00')
const LAST_FRIDAY = new Date('2026-11-06T18:00:00+01:00')
const MIN = 60_000

const WEIGHTS = {
  'Press inclinado en Smith': '60',
  'Remo Gironda': '55',
  'Aperturas en polea': '17,5',
}

async function fillBlock(page, name, reps) {
  const block = page.getByRole('region', { name })
  const kg = block.getByLabel(/^Peso serie/)
  const rp = block.getByLabel(/^Reps serie/)
  const n = await kg.count()
  for (let i = 0; i < n; i++) {
    await kg.nth(i).fill(WEIGHTS[name])
    await rp.nth(i).fill(reps)
  }
  return block
}

async function checkAll(page, block, count) {
  for (let i = 0; i < count; i++) {
    await block.getByRole('button', { name: 'Marcar serie como hecha' }).first().click()
    await page.waitForTimeout(120)
  }
}

async function capture(scheme, names) {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    hasTouch: true,
    isMobile: true,
    colorScheme: scheme,
  })
  const page = await ctx.newPage()
  page.on('pageerror', (e) => console.error('ERROR', e.message))
  await page.clock.setFixedTime(FRIDAY)

  await page.goto(BASE)
  await page.getByText('Continuar en el navegador').click()
  await page.getByLabel('¿Cómo te llamas?').fill('Dani')
  await page.getByRole('button', { name: 'Empezar' }).click()
  await page.getByRole('heading', { name: 'Hola, Dani' }).waitFor()

  await page.goto(`${BASE}#/ajustes`)
  await page
    .getByRole('button', { name: /datos de ejemplo/i })
    .first()
    .click()
  const sure = page.getByRole('alertdialog').getByRole('button').last()
  if (await sure.isVisible().catch(() => false)) await sure.click()
  await page.waitForTimeout(1500)
  await page.goto(`${BASE}#/ajustes/plan`)
  await page.getByRole('button', { name: 'Cargar plan semanal' }).click()
  await page.waitForTimeout(300)
  const sure2 = page.getByRole('alertdialog').getByRole('button').last()
  if (await sure2.isVisible().catch(() => false)) await sure2.click()
  await page.waitForTimeout(800)

  // Sesión anterior: da "Anterior", prerrellenos y cardio de la última vez
  await page.clock.setFixedTime(LAST_FRIDAY)
  await page.goto(`${BASE}#/`)
  await page.getByRole('button', { name: 'Empezar', exact: true }).click()
  await page.getByRole('region', { name: 'Aperturas en polea' }).waitFor()
  for (const [name, reps] of [
    ['Press inclinado en Smith', '10'],
    ['Remo Gironda', '11'],
    ['Aperturas en polea', '14'],
  ]) {
    const block = await fillBlock(page, name, reps)
    await checkAll(
      page,
      block,
      await block.getByRole('button', { name: 'Marcar serie como hecha' }).count(),
    )
  }
  await page.getByRole('switch', { name: 'He hecho cardio' }).click()
  await page.getByLabel('Tiempo de cardio en minutos').fill('20')
  await page.getByLabel('Inclinación del cardio en porcentaje').fill('5,5')
  await page.getByLabel('Inclinación del cardio en porcentaje').blur()
  await page.getByRole('button', { name: 'Terminar' }).click()
  await page.getByRole('button', { name: 'Descartar y terminar' }).click()
  await page.getByRole('button', { name: 'Guardar' }).click()
  await page.getByRole('button', { name: 'Listo' }).click()

  // Inicio
  await page.clock.setFixedTime(FRIDAY)
  await page.goto(`${BASE}#/`)
  await page.getByRole('heading', { name: 'Hola, Dani' }).waitFor()
  await page.waitForTimeout(900)
  if (names.home) await page.screenshot({ path: `propuestas/${names.home}.png` })

  // Entreno en curso
  await page.getByRole('button', { name: 'Empezar', exact: true }).click()
  await page.getByRole('region', { name: 'Aperturas en polea' }).waitFor()
  for (const name of [
    /^Opciones de Jal/,
    /^Opciones de Elevaciones/,
    /^Opciones de Curl/,
    /^Opciones de Extensi/,
  ]) {
    await page.getByRole('button', { name }).first().click()
    await page.getByRole('button', { name: 'Quitar del entreno' }).click()
    await page.waitForTimeout(700)
  }
  for (const [name, reps] of [
    ['Press inclinado en Smith', '10'],
    ['Remo Gironda', '12'],
  ]) {
    const block = await fillBlock(page, name, reps)
    await checkAll(page, block, name === 'Remo Gironda' ? 2 : 3)
  }
  const aperturas = page.getByRole('region', { name: 'Aperturas en polea' })
  await aperturas.getByLabel('Peso serie 1', { exact: true }).fill('20')
  await aperturas.getByLabel('Reps serie 1', { exact: true }).fill('13')
  await aperturas.getByRole('button', { name: 'Marcar serie como hecha' }).first().click()
  await aperturas.getByLabel('Peso bajada 1').fill('12,5')
  await aperturas.getByLabel('Reps bajada 1').fill('10')
  await aperturas.getByLabel('Reps bajada 1').blur()
  await page.getByRole('switch', { name: 'He hecho cardio' }).click()
  await page.clock.setFixedTime(new Date(FRIDAY.getTime() + 47 * MIN + 12_000))
  await page.waitForTimeout(4500)
  await page.getByRole('switch', { name: 'He hecho cardio' }).scrollIntoViewIfNeeded()
  await page.evaluate(() => {
    const el = [...document.querySelectorAll('section')].find(
      (s) => s.getAttribute('aria-label') === 'Aperturas en polea',
    )
    window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 128)
  })
  await page.waitForTimeout(500)
  await page.screenshot({ path: `propuestas/${names.workout}.png` })
  await browser.close()
}

await capture('light', { home: '1-inicio-claro', workout: '2-entreno-claro' })
await capture('dark', { workout: '3-entreno-oscuro' })
console.log('Capturas listas en propuestas/')
