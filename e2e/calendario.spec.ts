import { expect, test } from '@playwright/test'
import { onboard } from './helpers'

import sharp from 'sharp'

const makePng = () =>
  sharp({ create: { width: 30, height: 40, channels: 3, background: '#ff6a1a' } })
    .png()
    .toBuffer()

test('rellenar un día del calendario y verlo en Inicio', async ({ page }) => {
  await onboard(page)
  await page.getByRole('link', { name: 'Calendario' }).click()
  await expect(page.getByRole('heading', { name: 'Calendario' })).toBeVisible()

  // Abrir el día de hoy (el número resaltado)
  const today = new Date()
  const todayCell = page.getByRole('gridcell', {
    name: new RegExp(`^\\p{L}+ ${today.getDate()}(,|$)`, 'u'),
  })
  await todayCell
    .filter({ hasNot: page.locator('.opacity-35') })
    .first()
    .click()
  const sheet = page.getByRole('dialog')
  await expect(sheet).toBeVisible()

  await sheet.getByRole('button', { name: 'Marcar todos' }).click()
  await expect(sheet.getByRole('button', { name: 'Desmarcar todos' })).toBeVisible()
  await sheet.getByRole('radio', { name: 'Bien' }).click()
  await sheet.getByLabel('Horas de sueño').fill('7,5')
  await sheet.getByRole('switch', { name: 'Estiramientos' }).click()
  await sheet.getByLabel('Peso corporal').fill('78,2')
  await sheet.getByLabel('Notas del día').fill('Día tranquilo')
  await sheet
    .getByLabel('Elegir fotos')
    .setInputFiles({ name: 'foto.png', mimeType: 'image/png', buffer: await makePng() })
  await expect(sheet.getByRole('img', { name: /Foto del/ })).toBeVisible()
  await sheet.getByLabel('Notas del día').blur()
  await sheet.getByRole('button', { name: 'Hecho' }).click()

  // La celda refleja suplementos completos y alimentación bien
  await expect(
    page.getByRole('gridcell', { name: /suplementos completos, alimentación bien/ }).first(),
  ).toBeVisible()

  // Reabrir: los datos siguen ahí
  await page
    .getByRole('gridcell', { name: /suplementos completos/ })
    .first()
    .click()
  await expect(sheet.getByLabel('Horas de sueño')).toHaveValue('7,5')
  await expect(sheet.getByLabel('Peso corporal')).toHaveValue('78,2')
  await expect(sheet.getByLabel('Notas del día')).toHaveValue('Día tranquilo')
  await expect(sheet.getByRole('switch', { name: 'Estiramientos' })).toHaveAttribute(
    'aria-checked',
    'true',
  )
  await sheet.getByRole('button', { name: 'Hecho' }).click()

  // Inicio: checks de hoy marcados
  await page.getByRole('link', { name: 'Inicio' }).click()
  await expect(page.getByRole('button', { name: /Peso de hoy: 78,2 kg/ })).toBeVisible()
  const hoy = page.getByRole('region', { name: 'Hoy' })
  await expect(hoy.getByRole('button', { name: 'Creatina' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await expect(hoy.getByRole('radio', { name: 'Bien' })).toHaveAttribute('aria-checked', 'true')
})

test('día de descanso y mapa de calor', async ({ page }) => {
  await onboard(page)
  await page.getByRole('link', { name: 'Calendario' }).click()
  await expect(page.getByText('Último año')).toBeVisible()
  await expect(page.getByText('0 días activos')).toBeVisible()
  await page.getByRole('gridcell').nth(10).click()
  await page.getByRole('dialog').getByRole('radio', { name: 'Descanso' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Hecho' }).click()
  await expect(page.getByRole('gridcell', { name: /descanso/ })).toHaveCount(1)
})
