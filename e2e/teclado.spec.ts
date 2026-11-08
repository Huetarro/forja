import { expect, test, type Locator, type Page } from '@playwright/test'
import { createSampleRoutine, onboard } from './helpers'

test.use({ viewport: { width: 390, height: 844 } })

/** Pausa entre teclas: más larga que el guardado con retardo, como un dedo real. */
const BETWEEN_KEYS_MS = 550

/** Toca el campo y teclea una a una, comprobando que el foco sigue ahí después de cada tecla. */
async function typeKeys(page: Page, field: Locator, keys: string): Promise<void> {
  await field.click()
  for (const key of keys) {
    await page.keyboard.press(key)
    await page.waitForTimeout(BETWEEN_KEYS_MS)
    const focused = await field.evaluate((el) => el === document.activeElement)
    expect(focused, `el campo perdió el foco tras la tecla "${key}"`).toBe(true)
  }
}

/** Lee una tabla directamente de IndexedDB: lo que queda guardado de verdad. */
async function readTable<T>(page: Page, table: string): Promise<T[]> {
  return page.evaluate(
    (name) =>
      new Promise<T[]>((resolve, reject) => {
        const open = indexedDB.open('forja')
        open.onerror = () => reject(new Error('No se pudo abrir la base'))
        open.onsuccess = () => {
          const req = open.result.transaction(name).objectStore(name).getAll()
          req.onerror = () => reject(new Error('No se pudo leer la tabla'))
          req.onsuccess = () => {
            open.result.close()
            resolve(req.result as T[])
          }
        }
      }),
    table,
  )
}

interface StoredSet {
  weight: number | null
  reps: number | null
  drops: Array<{ weight: number | null; reps: number | null }>
}

test('kg, reps y bajadas se escriben tecla a tecla sin perder el foco', async ({ page }) => {
  await onboard(page)
  await createSampleRoutine(page)
  await page.getByRole('button', { name: 'Empezar entreno' }).click()
  await expect(page.getByRole('timer').first()).toBeVisible()

  const press = page.getByRole('region', { name: 'Press banca' })

  const reps = press.getByLabel('Reps serie 1', { exact: true })
  await typeKeys(page, reps, '12')
  await expect(reps).toHaveValue('12')

  const kg = press.getByLabel('Peso serie 1', { exact: true })
  await typeKeys(page, kg, '50')
  await expect(kg).toHaveValue('50')

  const decimal = press.getByLabel('Peso serie 2', { exact: true })
  await typeKeys(page, decimal, '52,5')
  await expect(decimal).toHaveValue('52,5')

  // Serie 2 → dropset (Normal → Calentamiento → Dropset)
  await press
    .getByRole('button', { name: /Tipo: Normal/ })
    .nth(1)
    .click()
  await press.getByRole('button', { name: /Tipo: Calentamiento/ }).click()
  const drop = press.getByLabel('Reps bajada 1')
  await typeKeys(page, drop, '20')
  await expect(drop).toHaveValue('20')

  // Tocar fuera guarda lo último
  await page.getByRole('timer').first().click()

  await expect
    .poll(async () => {
      const sets = await readTable<StoredSet>(page, 'workoutSets')
      return {
        first: sets.some((s) => s.weight === 50 && s.reps === 12),
        second: sets.some((s) => s.weight === 52.5 && s.drops[0]?.reps === 20),
      }
    })
    .toEqual({ first: true, second: true })
})

test('el sueño de la hoja del día también se escribe tecla a tecla', async ({ page }) => {
  await onboard(page)
  await page.goto('./#/calendario')
  await page.getByRole('gridcell').nth(10).click()

  const sleep = page.getByLabel('Horas de sueño')
  await typeKeys(page, sleep, '7,5')
  await expect(sleep).toHaveValue('7,5')

  await page.getByRole('dialog').getByRole('heading').first().click()
  await expect
    .poll(async () => {
      const logs = await readTable<{ sleepHours?: number }>(page, 'dayLogs')
      return logs.some((l) => l.sleepHours === 7.5)
    })
    .toBe(true)
})
