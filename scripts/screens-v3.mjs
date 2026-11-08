// Ronda de capturas del rediseño: todas las pantallas a 390×844, claro y oscuro, más una hoja
// de contactos por tema en screens/. Requiere `npm run preview`.
import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import sharp from 'sharp'

const BASE = process.env.BASE_URL ?? 'http://localhost:4173/forja/'
mkdirSync('screens', { recursive: true })

async function capture(scheme) {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    hasTouch: true,
    isMobile: true,
    colorScheme: scheme,
  })
  const page = await ctx.newPage()
  page.on('pageerror', (e) => console.error('ERROR', e.message))
  const names = []
  const shot = async (name) => {
    await page.waitForTimeout(650)
    const path = `screens/v3-${scheme}-${name}.png`
    await page.screenshot({ path })
    names.push(path)
  }
  const go = async (hash, name) => {
    await page.goto(`${BASE}#/${hash}`)
    await shot(name)
  }

  await page.goto(BASE)
  await shot('instalar')
  await page.getByText('Continuar en el navegador').click()
  await shot('bienvenida')
  await page.getByRole('button', { name: 'Empezar' }).click()
  await page.getByRole('heading', { name: /Hola/ }).waitFor()
  await shot('inicio-vacio')

  await page.goto(`${BASE}#/ajustes`)
  await page.getByRole('button', { name: /Cargar datos de ejemplo/ }).click()
  await page.waitForTimeout(300)
  await shot('confirmar')
  const ok = page.getByRole('alertdialog').getByRole('button').last()
  if (await ok.isVisible().catch(() => false)) await ok.click()
  await page.waitForTimeout(1800)

  await go('', 'inicio')
  await go('calendario', 'calendario')
  await page.getByRole('gridcell').nth(10).click()
  await shot('dia')
  await go('estadisticas', 'stats-resumen')
  for (const tab of ['Ejercicios', 'Músculos', 'Cuerpo', 'Hábitos']) {
    await page.getByRole('tab', { name: tab }).click()
    await shot(`stats-${tab}`)
  }
  await go('running', 'running')
  await go('ajustes', 'ajustes')
  await go('ajustes/plan', 'plan')
  await go('ejercicios', 'ejercicios')
  await page.locator('a[href*="ejercicios/"]').first().click()
  await shot('ficha')
  await go('', 'x')
  names.pop()
  await page.locator('a[href*="rutinas/"]').last().click()
  await shot('rutina')
  const url = page.url()
  await page.getByRole('button', { name: 'Editar' }).click()
  await shot('rutina-editar')
  await go('archivados', 'archivados')
  await go('historial', 'historial')
  await page.locator('a[href*="historial/"]').first().click()
  await shot('detalle')
  await page.goto(`${page.url().split('?')[0]}/resumen`)
  await shot('resumen')
  await page.goto(url)
  await page.getByRole('button', { name: 'Empezar entreno' }).click()
  await page.getByRole('timer').first().waitFor()
  await shot('entreno')
  await page.getByRole('button', { name: 'Terminar' }).click()
  await shot('terminar')
  await browser.close()
  return names
}

const COLS = 7
const W = 260
const H = Math.round((W * 844) / 390)
for (const scheme of ['light', 'dark']) {
  const names = await capture(scheme)
  const rows = Math.ceil(names.length / COLS)
  const composite = await Promise.all(
    names.map(async (p, i) => ({
      input: await sharp(p).resize(W, H).toBuffer(),
      left: (i % COLS) * (W + 8),
      top: Math.floor(i / COLS) * (H + 8),
    })),
  )
  await sharp({
    create: {
      width: COLS * (W + 8),
      height: rows * (H + 8),
      channels: 3,
      background: '#808080',
    },
  })
    .composite(composite)
    .png()
    .toFile(`screens/v3-${scheme}.png`)
  console.log(scheme, names.length)
}
