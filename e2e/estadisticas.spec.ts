import { expect, test } from '@playwright/test'
import { onboard } from './helpers'

test('estadísticas con datos de ejemplo, figura muscular y calculadora de 1RM', async ({
  page,
}) => {
  await onboard(page)
  await page.getByRole('link', { name: 'Estadísticas' }).click()
  await expect(page.getByText('Aún no hay datos')).toBeVisible()

  // Cargar datos de ejemplo desde Ajustes
  await page.getByRole('link', { name: 'Ajustes' }).click()
  await page.getByRole('button', { name: 'Cargar datos de ejemplo' }).click()
  await expect(page.getByRole('button', { name: 'Borrar datos de ejemplo' })).toBeVisible()

  await page.getByRole('link', { name: 'Estadísticas' }).click()
  await expect(page.getByText('Entrenos por semana').first()).toBeVisible()
  await expect(page.getByText('Récords recientes')).toBeVisible()
  await page.getByRole('radio', { name: '4 sem' }).click()
  await expect(page.getByText('Volumen total')).toBeVisible()

  // Ejercicios → detalle con récords
  await page.getByRole('tab', { name: 'Ejercicios' }).click()
  await page.getByRole('button', { name: /Press banca/ }).click()
  await expect(page.getByRole('heading', { name: '1RM estimado' })).toBeVisible()
  await expect(page.getByText('Más reps con cada peso')).toBeVisible()

  // Músculos: tocar un músculo de la figura
  await page.getByRole('tab', { name: 'Músculos' }).click()
  await page.getByRole('button', { name: /^Gemelo:/ }).dispatchEvent('click')
  await expect(page.getByRole('heading', { name: 'Gemelo', level: 2 })).toBeVisible()

  // Cuerpo y hábitos
  await page.getByRole('tab', { name: 'Cuerpo' }).click()
  await expect(page.getByRole('heading', { name: 'Peso corporal' })).toBeVisible()
  await page.getByRole('tab', { name: 'Hábitos' }).click()
  await expect(page.getByText('Días con todos los suplementos').first()).toBeVisible()

  // Calculadora de 1RM: 100 kg × 10 = 133,3
  await page.getByRole('button', { name: 'Calculadora de 1RM' }).click()
  await page.getByLabel('Peso levantado').fill('100')
  await page.getByLabel('Repeticiones').fill('10')
  await expect(page.getByText('133,3').first()).toBeVisible()
  await expect(page.getByRole('cell', { name: '50 %' })).toBeVisible()
  await page.getByRole('button', { name: 'Cerrar' }).click()

  // Borrar los datos de ejemplo
  await page.getByRole('link', { name: 'Ajustes' }).click()
  await page.getByRole('button', { name: 'Borrar datos de ejemplo' }).click()
  await page.getByRole('alertdialog').getByRole('button', { name: 'Borrar' }).click()
  await page.getByRole('link', { name: 'Estadísticas' }).click()
  await expect(page.getByText('Aún no hay datos')).toBeVisible()
})
