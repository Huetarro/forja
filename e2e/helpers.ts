import { expect, type Locator, type Page } from '@playwright/test'

/** Salta la pantalla de instalación y completa la bienvenida. */
export async function onboard(page: Page, name = 'Dani'): Promise<void> {
  await page.goto('./')
  await page.getByRole('button', { name: 'Continuar en el navegador' }).click()
  const input = page.getByLabel('¿Cómo te llamas?')
  await input.fill(name)
  await page.getByRole('button', { name: 'Empezar' }).click()
  await page.getByRole('heading', { name: `Hola, ${name}` }).waitFor()
}

/** Crea un ejercicio desde el selector "Añadir ejercicios" (ya abierto). */
export async function newExerciseInPicker(
  page: Page,
  name: string,
  muscle: string,
  opts: { unilateral?: boolean } = {},
): Promise<void> {
  await page.getByRole('button', { name: 'Nuevo ejercicio' }).click()
  await page.getByLabel('Nombre del ejercicio').fill(name)
  await page.getByLabel('Músculo principal').selectOption(muscle)
  if (opts.unilateral) await page.getByRole('switch', { name: 'Unilateral' }).click()
  await page.getByRole('button', { name: 'Crear', exact: true }).click()
  await expect(page.getByLabel('Nombre del ejercicio')).toBeHidden()
}

/**
 * Crea la rutina "Torso A" con Press banca, Remo (superserie con Press),
 * Curl concentrado (unilateral). Termina en el detalle de la rutina.
 */
export async function createSampleRoutine(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Crear rutina' }).click()
  await page.getByLabel('Nombre de la rutina').fill('Torso A')
  await page.getByRole('button', { name: 'Crear', exact: true }).click()
  await page.getByRole('button', { name: 'Añadir ejercicios' }).click()
  await newExerciseInPicker(page, 'Press banca', 'Pecho')
  await newExerciseInPicker(page, 'Remo con barra', 'Espalda')
  await newExerciseInPicker(page, 'Curl concentrado', 'Bíceps', { unilateral: true })
  await page.getByRole('button', { name: 'Añadir (3)' }).click()
  await expect(page.getByRole('dialog')).toBeHidden()
  await page.getByRole('button', { name: 'Superserie con el siguiente' }).first().click()
  await page.getByRole('button', { name: 'OK' }).click()
  await expect(page.getByRole('heading', { name: 'Torso A' })).toBeVisible()
}

/** Apunta kg y reps en una serie y la marca. */
export async function logSet(
  scope: Page | Locator,
  label: string,
  kg: string,
  reps: string,
): Promise<void> {
  await scope.getByLabel(`Peso ${label}`, { exact: true }).fill(kg)
  await scope.getByLabel(`Reps ${label}`, { exact: true }).fill(reps)
}
