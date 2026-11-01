import { expect, test, type Page } from '@playwright/test'
import { onboard } from './helpers'

async function createExercise(
  page: Page,
  name: string,
  muscle: string,
  opts: { unilateral?: boolean } = {},
) {
  await page.getByRole('button', { name: 'Nuevo ejercicio' }).click()
  await page.getByLabel('Nombre del ejercicio').fill(name)
  await page.getByLabel('Músculo principal').selectOption(muscle)
  if (opts.unilateral) await page.getByRole('switch', { name: 'Unilateral' }).click()
  await page.getByRole('button', { name: 'Crear', exact: true }).click()
  await expect(page.getByLabel('Nombre del ejercicio')).toBeHidden()
}

test('crear ejercicio en la biblioteca, buscar y filtrar', async ({ page }) => {
  await onboard(page)
  await page.getByRole('link', { name: 'Ejercicios' }).click()
  await expect(page.getByText('Tu biblioteca está vacía')).toBeVisible()

  await page.getByRole('button', { name: 'Crear ejercicio' }).click()
  await page.getByLabel('Nombre del ejercicio').fill('Press banca')
  await page.getByLabel('Músculo principal').selectOption('Pecho')
  await page.getByLabel('Material').selectOption('Barra')
  await page.getByRole('button', { name: 'Tríceps' }).click()
  await page.getByLabel('Notas fijas').fill('Banco plano, agarre medio')
  await page.getByRole('button', { name: 'Crear', exact: true }).click()

  await page.getByRole('button', { name: 'Nuevo ejercicio' }).click()
  await page.getByLabel('Nombre del ejercicio').fill('Curl bíceps')
  await page.getByLabel('Músculo principal').selectOption('Bíceps')
  await page.getByRole('button', { name: 'Crear', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeHidden()

  await page.getByLabel('Buscar ejercicio').fill('biceps')
  await expect(page.getByRole('link', { name: /Curl bíceps/ })).toBeVisible()
  await expect(page.getByRole('link', { name: /Press banca/ })).toBeHidden()
  await page.getByLabel('Buscar ejercicio').fill('')

  // Filtro por músculo secundario
  await page.getByRole('button', { name: 'Tríceps', exact: true }).click()
  await expect(page.getByRole('link', { name: /Press banca/ })).toBeVisible()
  await expect(page.getByRole('link', { name: /Curl bíceps/ })).toBeHidden()

  await page.getByRole('link', { name: /Press banca/ }).click()
  await expect(page.getByRole('heading', { name: 'Press banca' })).toBeVisible()
  await expect(page.getByText('Banco plano, agarre medio')).toBeVisible()
})

test('crear rutina con ejercicios, tipos de serie y superserie', async ({ page }) => {
  await onboard(page)
  await page.getByRole('button', { name: 'Crear rutina' }).click()
  await page.getByLabel('Nombre de la rutina').fill('Torso A')
  await page.getByRole('radio', { name: 'Color 6' }).click()
  await page.getByRole('radio', { name: 'Yunque' }).click()
  await page.getByRole('button', { name: 'Crear', exact: true }).click()

  // Editor: añadir ejercicios creándolos sin salir de la rutina
  await page.getByRole('button', { name: 'Añadir ejercicios' }).click()
  await createExercise(page, 'Press banca', 'Pecho')
  await createExercise(page, 'Remo con barra', 'Espalda')
  await createExercise(page, 'Curl concentrado', 'Bíceps', { unilateral: true })
  await page.getByRole('button', { name: 'Añadir (3)' }).click()
  await expect(page.getByRole('dialog')).toBeHidden()

  await expect(page.getByText('Press banca')).toBeVisible()
  await expect(page.getByText('Curl concentrado')).toBeVisible()

  // Cambiar el tipo de la primera serie a calentamiento y añadir una serie
  await page
    .getByRole('button', { name: /Serie 1: Normal/ })
    .first()
    .click()
  await expect(page.getByRole('button', { name: /Serie 1: Calentamiento/ }).first()).toBeVisible()
  await page.getByRole('button', { name: 'Añadir serie' }).first().click()

  // Superserie entre los dos primeros
  await page.getByRole('button', { name: 'Superserie con el siguiente' }).first().click()
  await expect(page.getByRole('button', { name: 'Separar de la superserie' })).toBeVisible()

  await page.getByRole('button', { name: 'OK' }).click()
  await expect(page.getByRole('heading', { name: 'Torso A' })).toBeVisible()
  await expect(page.getByText('3 series · 1 calent.')).toBeVisible()
  await expect(page.getByRole('heading', { name: '3 ejercicios' })).toBeVisible()

  // En Inicio aparece agrupada y sugerida
  await page.getByRole('link', { name: 'Inicio' }).click()
  await expect(page.getByText('Te toca hoy')).toBeVisible()
  await expect(
    page.getByRole('listitem').getByRole('link', { name: /Torso A.*3 ejercicios/ }),
  ).toBeVisible()
})

test('duplicar, archivar, restaurar y eliminar rutina con deshacer', async ({ page }) => {
  await onboard(page)
  await page.getByRole('button', { name: 'Crear rutina' }).click()
  await page.getByLabel('Nombre de la rutina').fill('Pierna')
  await page.getByRole('button', { name: 'Crear', exact: true }).click()
  await page.getByRole('button', { name: 'OK' }).click()

  await page.getByRole('button', { name: 'Duplicar rutina' }).click()
  await page.getByRole('button', { name: 'OK' }).click()
  await expect(page.getByRole('heading', { name: 'Pierna (copia)' })).toBeVisible()

  await page.getByRole('button', { name: 'Archivar rutina' }).click()
  await expect(page.getByText('Rutina archivada')).toBeVisible()
  await page.getByRole('link', { name: 'Archivados' }).click()
  await page.getByRole('link', { name: /Pierna \(copia\)/ }).click()
  await page.getByRole('button', { name: 'Restaurar rutina' }).click()

  await page.getByRole('button', { name: 'Eliminar rutina' }).click()
  await page.getByRole('alertdialog').getByRole('button', { name: 'Eliminar' }).click()
  await expect(page.getByText('Rutina eliminada')).toBeVisible()
  await page.getByRole('button', { name: 'Deshacer' }).click()
  await expect(page.getByRole('link', { name: /Pierna \(copia\)/ })).toBeVisible()
})

test('programas: crear y agrupar rutinas', async ({ page }) => {
  await onboard(page)
  await page.getByRole('button', { name: 'Programas' }).click()
  await page.getByLabel('Nombre del nuevo programa').fill('Fuerza')
  await page.getByRole('button', { name: 'Crear', exact: true }).click()
  await expect(page.getByLabel('Nombre del programa Fuerza')).toBeVisible()
  await page.getByRole('button', { name: 'Cerrar' }).click()

  await page.getByRole('button', { name: 'Crear rutina' }).click()
  await page.getByLabel('Nombre de la rutina').fill('Empuje')
  await page.getByLabel('Programa').selectOption({ label: 'Fuerza' })
  await page.getByRole('button', { name: 'Crear', exact: true }).click()
  await page.getByRole('button', { name: 'OK' }).click()
  await expect(page.getByText(/Fuerza · Sin entrenos aún/)).toBeVisible()
})
