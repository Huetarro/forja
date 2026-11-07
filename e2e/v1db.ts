import type { Page } from '@playwright/test'
import { photoBytes, v1Data } from '../src/db/v1Fixture'

/** Índices de la v1 tal como los crea Dexie (`version(1)` = IndexedDB versión 10). */
const V1_SCHEMA: Record<string, { key: string; indexes: Array<string | [string, string[]]> }> = {
  programs: { key: 'id', indexes: ['order'] },
  routines: { key: 'id', indexes: ['programId', 'order', 'archived'] },
  exercises: { key: 'id', indexes: ['name', 'primaryMuscle', 'archived'] },
  routineExercises: {
    key: 'id',
    indexes: ['routineId', 'exerciseId', ['[routineId+order]', ['routineId', 'order']]],
  },
  workouts: { key: 'id', indexes: ['routineId', 'date', 'status', 'startedAt'] },
  workoutExercises: {
    key: 'id',
    indexes: ['workoutId', 'exerciseId', ['[workoutId+order]', ['workoutId', 'order']]],
  },
  workoutSets: { key: 'id', indexes: ['workoutExerciseId', 'workoutId'] },
  runs: { key: 'id', indexes: ['date'] },
  dayLogs: { key: 'date', indexes: [] },
  supplements: { key: 'id', indexes: ['order'] },
  photos: { key: 'id', indexes: ['date'] },
  settings: { key: 'id', indexes: [] },
}

/**
 * Crea en el navegador la base "forja" exactamente como la deja la v1, con datos de una
 * semana de uso. Se hace desde una página en blanco del mismo origen, antes de abrir la app.
 */
export async function seedV1Database(page: Page): Promise<void> {
  await page.route('**/forja/__v1-seed.html', (route) =>
    route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>seed</title>' }),
  )
  await page.goto('./__v1-seed.html')
  const { photos: rawPhotos = [], ...data } = v1Data()
  const photos = rawPhotos.map((p) => ({ ...p, image: undefined }))
  await page.evaluate(
    async ({ schema, data, photos, bytes }) => {
      localStorage.setItem('forja-skip-install', '1')
      await new Promise<void>((resolve, reject) => {
        const req = indexedDB.open('forja', 10)
        req.onupgradeneeded = () => {
          const idb = req.result
          for (const [name, def] of Object.entries(schema)) {
            const store = idb.createObjectStore(name, { keyPath: def.key })
            for (const ix of def.indexes) {
              if (typeof ix === 'string') store.createIndex(ix, ix)
              else store.createIndex(ix[0], ix[1])
            }
          }
        }
        req.onerror = () => reject(req.error)
        req.onsuccess = () => {
          const idb = req.result
          const tx = idb.transaction(Object.keys(schema), 'readwrite')
          for (const [name, rows] of Object.entries(data)) {
            if (name === 'photos') continue
            for (const r of rows) tx.objectStore(name).put(r)
          }
          for (const p of photos)
            tx.objectStore('photos').put({
              ...p,
              image: new Blob([new Uint8Array(bytes)], { type: 'image/jpeg' }),
            })
          tx.oncomplete = () => {
            idb.close()
            resolve()
          }
          tx.onerror = () => reject(tx.error)
        }
      })
    },
    { schema: V1_SCHEMA, data, photos, bytes: [...photoBytes] },
  )
}
