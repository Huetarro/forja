import { expect, test } from '@playwright/test'
import { onboard } from './helpers'

test('registrar carrera con ritmo en directo, verla en la lista, editarla y en el calendario', async ({
  page,
}) => {
  await onboard(page)
  await page.getByRole('link', { name: 'Registrar carrera' }).click()
  const sheet = page.getByRole('dialog')
  await expect(sheet.getByRole('heading', { name: 'Registrar carrera' })).toBeVisible()

  await sheet.getByLabel('Distancia').fill('10,25')
  await sheet.getByLabel('Minutos').selectOption('51')
  await sheet.getByLabel('Segundos').selectOption('15')
  // 51:15 / 10,25 km = 5:00 /km
  await expect(sheet.getByText('5:00', { exact: true })).toBeVisible()

  await sheet.getByRole('button', { name: 'Tirada larga' }).click()
  await sheet.getByRole('radio', { name: 'Cinta' }).click()
  await sheet.getByLabel('Pulsaciones medias').fill('152')
  await sheet.getByLabel('Calorías').fill('640')
  await sheet.getByLabel('Desnivel').fill('35')
  await sheet.getByRole('radio', { name: 'Sensaciones: 4' }).click()
  await sheet.getByLabel('Notas de la carrera').fill('Buen ritmo')
  await sheet.getByRole('button', { name: 'Guardar' }).click()
  await expect(sheet).toBeHidden()

  // Lista y récords
  await expect(page.getByText('10,25 km').first()).toBeVisible()
  await expect(page.getByText('51:15')).toBeVisible()
  await expect(page.getByText('5:00 /km').first()).toBeVisible()
  await expect(page.getByText('Tirada larga · Cinta')).toBeVisible()
  await expect(page.getByText('Kilómetros', { exact: true }).first()).toBeVisible()

  // Editar
  await page.getByRole('button', { name: /10,25 km/ }).click()
  await expect(sheet.getByLabel('Pulsaciones medias')).toHaveValue('152')
  await sheet.getByLabel('Distancia').fill('10,5')
  await sheet.getByRole('button', { name: 'Guardar' }).click()
  await expect(page.getByText('10,5 km').first()).toBeVisible()

  // Calendario: el día tiene running
  await page.getByRole('link', { name: 'Calendario' }).click()
  await expect(page.getByRole('gridcell', { name: /1 carrera/ })).toHaveCount(1)

  // Racha en Inicio
  await page.getByRole('link', { name: 'Inicio' }).click()
  await expect(page.getByText('1 semana', { exact: true })).toBeVisible()
})
