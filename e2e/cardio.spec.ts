import { expect, test, type Page } from '@playwright/test'
import { createSampleRoutine, onboard } from './helpers'

test.use({ viewport: { width: 390, height: 844 } })

const minutes = (page: Page) => page.getByLabel('Tiempo de cardio en minutos')
const incline = (page: Page) => page.getByLabel('Inclinación del cardio en porcentaje')

async function finish(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Terminar' }).click()
  await page.getByRole('button', { name: 'Descartar y terminar' }).click()
  await page.getByRole('button', { name: 'Guardar' }).click()
  await expect(page.getByRole('heading', { name: '¡Entreno terminado!' })).toBeVisible()
}

test('cardio: se apunta, se reutiliza y se ve en toda la app', async ({ page }) => {
  await onboard(page)
  await createSampleRoutine(page)
  const routineUrl = page.url()

  // Primer entreno: se escribe a mano
  await page.getByRole('button', { name: 'Empezar entreno' }).click()
  await page.getByRole('switch', { name: 'He hecho cardio' }).click()
  await minutes(page).fill('20')
  await incline(page).fill('5,5')
  await finish(page)
  await expect(page.getByText('20 min · 5,5 %')).toBeVisible()

  // Segundo entreno: prerrellenado en gris y aceptado sin tocarlo
  await page.goto(routineUrl)
  await page.getByRole('button', { name: 'Empezar entreno' }).click()
  await page.getByRole('switch', { name: 'He hecho cardio' }).click()
  await expect(minutes(page)).toHaveAttribute('placeholder', '20')
  await expect(incline(page)).toHaveAttribute('placeholder', '5,5')
  await expect(minutes(page)).toHaveValue('')
  await finish(page)
  await expect(page.getByText('20 min · 5,5 %')).toBeVisible()

  // Historial: se ve y se edita
  await page.goto('./#/historial')
  await page
    .getByRole('link', { name: /Torso A/ })
    .first()
    .click()
  await expect(page.getByText('20 min · 5,5 %')).toBeVisible()
  await page.getByRole('button', { name: 'Editar' }).click()
  await minutes(page).fill('35')
  await minutes(page).blur()
  await page.getByRole('button', { name: 'OK' }).click()
  await expect(page.getByText('35 min · 5,5 %')).toBeVisible()

  // Calendario: leyenda, día marcado y hoja del día
  await page.goto('./#/calendario')
  await expect(page.getByText('Cardio', { exact: true })).toBeVisible()
  const day = page.getByRole('gridcell', { name: /cardio/ }).first()
  await day.click()
  await expect(page.getByRole('dialog').getByText('35 min · 5,5 %')).toBeVisible()

  // Estadísticas
  await page.goto('./#/estadisticas')
  await expect(page.getByText('Cardio por semana')).toBeVisible()
})
