/**
 * Tests de migración: una base con datos de la v1 se actualiza a la v2 sin perder nada.
 * REGLA Nº 1: no se publica si fallan.
 */
import 'fake-indexeddb/auto'
import Dexie from 'dexie'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { db, PRE_V2_SNAPSHOT_ID, V1_STORES, V1_TABLES } from './db'
import { purgeOldSnapshot, restorePreV2 } from './snapshot'
import { v1Data, photoBytes } from './v1Fixture'

async function blobBytes(b: unknown): Promise<number[]> {
  expect(b).toBeInstanceOf(Blob)
  return [...new Uint8Array(await (b as Blob).arrayBuffer())]
}

/** Quita los Blobs para comparar con toEqual. */
const withoutImage = (rows: unknown[]) =>
  rows.map((r) => {
    const { image: _image, ...rest } = r as Record<string, unknown>
    return rest
  })

const keyOf = (r: unknown) => {
  const o = r as { id?: string; date?: string }
  return String(o.id ?? o.date)
}
const byKey = (rows: unknown[]) => [...rows].sort((a, b) => keyOf(a).localeCompare(keyOf(b)))

describe('migración v1 → v2', () => {
  const original = v1Data()

  beforeAll(async () => {
    // Base exactamente como la deja la v1 publicada
    const v1 = new Dexie('forja')
    v1.version(1).stores(V1_STORES)
    for (const t of V1_TABLES) await v1.table(t).bulkAdd(original[t] ?? [])
    expect(v1.verno).toBe(1)
    v1.close()
    await db.open()
  })

  afterAll(() => db.close())

  it('abre la base en la versión actual', () => {
    expect(db.verno).toBe(3)
  })

  it('conserva todos los registros de todas las tablas, campo a campo', async () => {
    for (const t of V1_TABLES) {
      if (t === 'settings' || t === 'photos' || t === 'dayLogs') continue
      const rows = await db.table(t).toArray()
      expect(byKey(rows), t).toEqual(byKey(original[t] ?? []))
    }
  })

  it('conserva las series con dropsets, unilaterales y entrenos en curso', async () => {
    const drop = await db.workoutSets.get('ws3')
    expect(drop?.drops).toEqual([
      { weight: 60, reps: 6 },
      { weight: 45, reps: null },
    ])
    expect((await db.workoutSets.where('workoutExerciseId').equals('we2').toArray()).length).toBe(3)
    const active = await db.workouts.where('status').equals('en_curso').first()
    expect(active?.id).toBe('w3')
    expect(active?.pauses).toEqual([{ start: 1793950600000 }])
  })

  it('conserva las fotos con su imagen', async () => {
    const photos = await db.photos.toArray()
    expect(withoutImage(photos)).toEqual(withoutImage(original.photos ?? []))
    expect(await blobBytes(photos[0]?.image)).toEqual([...photoBytes])
  })

  it('conserva el registro diario y pasa al día el peso guardado en un entreno', async () => {
    expect(await db.dayLogs.count()).toBe(3)
    expect(await db.dayLogs.get('2026-11-02')).toEqual(original.dayLogs?.[0])
    expect(await db.dayLogs.get('2026-11-05')).toEqual(original.dayLogs?.[1])
    expect((await db.dayLogs.get('2026-11-04'))?.bodyWeight).toBe(79.4)
  })

  it('conserva los ajustes y marca el plan v2 como pendiente', async () => {
    const s = await db.settings.get('app')
    expect(s).toMatchObject(original.settings?.[0] as object)
    expect(s?.planV2Pending).toBe(true)
    expect(typeof s?.preV2SnapshotAt).toBe('number')
  })

  it('guarda una copia interna íntegra previa a la migración', async () => {
    const snap = await db.snapshots.get(PRE_V2_SNAPSHOT_ID)
    expect(snap).toBeDefined()
    for (const t of V1_TABLES) {
      if (t === 'photos') continue
      expect(byKey(snap?.data[t] ?? []), t).toEqual(byKey(original[t] ?? []))
    }
    const photo = snap?.data.photos?.[0] as { image: Blob } | undefined
    expect(await blobBytes(photo?.image)).toEqual([...photoBytes])
  })

  it('"Restaurar copia anterior a la v2" devuelve exactamente los datos de la v1', async () => {
    // Cambios hechos ya en la v2
    await db.workouts.delete('w1')
    await db.exercises.update('e1', { name: 'Cambiado' })
    await db.runs.clear()

    expect(await restorePreV2()).toBe(true)
    for (const t of V1_TABLES) {
      if (t === 'settings' || t === 'photos') continue
      expect(byKey(await db.table(t).toArray()), t).toEqual(byKey(original[t] ?? []))
    }
    expect(await blobBytes((await db.photos.get('ph1'))?.image)).toEqual([...photoBytes])
    const s = await db.settings.get('app')
    expect(s).toMatchObject(original.settings?.[0] as object)
    expect(s?.planV2Pending).toBe(false)
  })

  it('borra la copia interna solo cuando han pasado 30 días', async () => {
    const created = (await db.snapshots.get(PRE_V2_SNAPSHOT_ID))?.createdAt ?? 0
    await purgeOldSnapshot(created + 29 * 86_400_000)
    expect(await db.snapshots.get(PRE_V2_SNAPSHOT_ID)).toBeDefined()
    await purgeOldSnapshot(created + 31 * 86_400_000)
    expect(await db.snapshots.get(PRE_V2_SNAPSHOT_ID)).toBeUndefined()
    // Los datos reales siguen ahí
    expect(await db.workouts.count()).toBe(3)
    expect(await db.photos.count()).toBe(1)
  })
})
