import { expect, test, type Page } from '@playwright/test'
import { onboard } from './helpers'

/** Ningún campo de texto tiene el foco (el teclado del iPhone no se abriría). */
async function expectNoFieldFocused(page: Page): Promise<void> {
  const tag = await page.evaluate(() => {
    const el = document.activeElement
    return el && el.matches('input, textarea, select') ? el.outerHTML.slice(0, 120) : null
  })
  expect(tag).toBeNull()
}

test('peso de hoy desde Inicio en dos toques', async ({ page }) => {
  await onboard(page)
  const card = page.getByRole('button', { name: /Peso de hoy/ })
  await expect(card).toHaveAccessibleName(/sin apuntar/)

  // Primera vez: hay que escribirlo
  await card.click()
  const sheet = page.getByRole('dialog', { name: 'Peso de hoy' })
  await expect(sheet).toBeVisible()
  await expectNoFieldFocused(page)
  await sheet.getByLabel('Peso corporal en kg').fill('80,4')
  await sheet.getByRole('button', { name: 'Restar 0,1 kg' }).click()
  await sheet.getByRole('button', { name: 'Guardar' }).click()
  await expect(sheet).toBeHidden()
  await expect(card).toHaveAccessibleName(/80,3 kg/)

  // Editar: dos toques (tarjeta + Guardar) con el peso ya puesto
  await card.click()
  await expect(sheet.getByLabel('Peso corporal en kg')).toHaveValue('80,3')
  await sheet.getByRole('button', { name: 'Sumar 0,1 kg' }).click()
  await sheet.getByRole('button', { name: 'Guardar' }).click()
  await expect(card).toHaveAccessibleName(/80,4 kg/)

  // Se ve también en el día del calendario
  await page.getByRole('link', { name: 'Calendario' }).click()
  await page
    .getByRole('gridcell', { name: new RegExp(`^\\p{L}+ ${new Date().getDate()}(,|$)`, 'u') })
    .filter({ hasNot: page.locator('.opacity-35') })
    .first()
    .click()
  await expect(page.getByRole('dialog').getByLabel('Peso corporal')).toHaveValue('80,4')
})

test('ninguna hoja ni pantalla abre el teclado sola', async ({ page }) => {
  await onboard(page)
  // Nueva rutina
  await page.getByRole('button', { name: 'Crear rutina' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expectNoFieldFocused(page)
  await page.getByLabel('Nombre de la rutina').fill('Prueba')
  // Tocar fuera del campo cierra el teclado
  await page.getByRole('dialog').getByRole('heading', { name: 'Nueva rutina' }).click()
  await expectNoFieldFocused(page)
  await page.getByRole('button', { name: 'Crear', exact: true }).click()

  // Nuevo ejercicio
  await page.getByRole('button', { name: 'Añadir ejercicios' }).click()
  await page.getByRole('button', { name: 'Nuevo ejercicio' }).click()
  await expect(page.getByLabel('Nombre del ejercicio')).toBeVisible()
  await expectNoFieldFocused(page)

  for (const path of ['#/', '#/calendario', '#/estadisticas', '#/running', '#/ajustes']) {
    await page.goto(`./${path}`)
    await page.waitForTimeout(300)
    await expectNoFieldFocused(page)
  }
  await page.goto('./#/running?nueva=1')
  await expect(page.getByRole('dialog')).toBeVisible()
  await expectNoFieldFocused(page)
})
