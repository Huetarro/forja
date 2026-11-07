import { expect, test } from '@playwright/test'
import { seedV1Database } from './v1db'

test('actualizar desde una base con datos de la v1 conserva todo', async ({ page }) => {
  await seedV1Database(page)
  await page.goto('./')

  // Había un entreno en curso: la app vuelve a él
  await expect(page.getByRole('region', { name: 'Press banca' })).toBeVisible()

  // Historial intacto
  await page.goto('./#/historial')
  await expect(page.getByText('Torso A').first()).toBeVisible()
  await expect(page.getByText('Pierna').first()).toBeVisible()

  // Carrera y registro diario intactos
  await page.goto('./#/running')
  await expect(page.getByText('6,42').first()).toBeVisible()

  // Copia interna previa a la v2 disponible en Ajustes
  await page.goto('./#/ajustes')
  await expect(page.getByRole('button', { name: 'Restaurar copia anterior a la v2' })).toBeVisible()

  // Comprobación directa en IndexedDB
  const counts = await page.evaluate(async () => {
    const idb = await new Promise<IDBDatabase>((resolve, reject) => {
      const r = indexedDB.open('forja')
      r.onsuccess = () => resolve(r.result)
      r.onerror = () => reject(r.error)
    })
    const count = (name: string) =>
      new Promise<number>((resolve) => {
        const r = idb.transaction(name).objectStore(name).count()
        r.onsuccess = () => resolve(r.result)
      })
    const out = {
      version: idb.version,
      workouts: await count('workouts'),
      workoutSets: await count('workoutSets'),
      photos: await count('photos'),
      dayLogs: await count('dayLogs'),
      runs: await count('runs'),
      snapshots: await count('snapshots'),
    }
    idb.close()
    return out
  })
  expect(counts).toEqual({
    version: 20,
    workouts: 3,
    workoutSets: 10,
    photos: 1,
    dayLogs: 3,
    runs: 1,
    snapshots: 1,
  })
})
