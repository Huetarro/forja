/**
 * Migración v2 → v3 (campo opcional `cardio`): una base con datos de la versión publicada
 * se actualiza sin perder nada. REGLA Nº 1: no se publica si falla.
 */
import 'fake-indexeddb/auto'
import Dexie from 'dexie'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { db, V1_STORES, V1_TABLES } from './db'
import { photoBytes, v1Data } from './v1Fixture'

const keyOf = (r: unknown) => {
  const o = r as { id?: string; date?: string }
  return String(o.id ?? o.date)
}
const byKey = (rows: unknown[]) => [...rows].sort((a, b) => keyOf(a).localeCompare(keyOf(b)))
const withoutImage = (rows: unknown[]) =>
  rows.map((r) => {
    const { image: _image, ...rest } = r as Record<string, unknown>
    return rest
  })

describe('migración v2 → v3', () => {
  const original = v1Data()
  const snapshot = { id: 'pre-v2', createdAt: 1793950000000, data: { workouts: [] } }

  beforeAll(async () => {
    // Base exactamente como la deja la versión publicada (esquema v2)
    const v2 = new Dexie('forja')
    v2.version(1).stores(V1_STORES)
    v2.version(2).stores({ snapshots: 'id' })
    await v2.open()
    for (const t of V1_TABLES) await v2.table(t).bulkAdd(original[t] ?? [])
    await v2.table('snapshots').add(snapshot)
    expect(v2.verno).toBe(2)
    v2.close()
    await db.open()
  })

  afterAll(() => db.close())

  it('abre la base en la versión 3', () => {
    expect(db.verno).toBe(3)
  })

  it('conserva todos los registros de todas las tablas, campo a campo', async () => {
    for (const t of V1_TABLES) {
      const rows = await db.table(t).toArray()
      expect(byKey(withoutImage(rows)), t).toEqual(byKey(withoutImage(original[t] ?? [])))
    }
  })

  it('conserva los valores de RIR, aunque ya no se muestren', async () => {
    expect((await db.workoutSets.get('ws2'))?.rir).toBe(2)
  })

  it('conserva dropsets, entreno en curso y copia interna', async () => {
    expect((await db.workoutSets.get('ws3'))?.drops).toEqual([
      { weight: 60, reps: 6 },
      { weight: 45, reps: null },
    ])
    expect((await db.workouts.where('status').equals('en_curso').first())?.id).toBe('w3')
    expect(await db.snapshots.get('pre-v2')).toEqual(snapshot)
  })

  it('conserva las fotos con su imagen', async () => {
    const [photo] = await db.photos.toArray()
    expect(photo?.image).toBeInstanceOf(Blob)
    const bytes = new Uint8Array(await (photo?.image as Blob).arrayBuffer())
    expect([...bytes]).toEqual([...photoBytes])
  })

  it('los entrenos antiguos no tienen cardio y se puede añadir', async () => {
    expect((await db.workouts.get('w1'))?.cardio).toBeUndefined()
    await db.workouts.update('w1', { cardio: { minutes: 20, incline: 5.5 } })
    expect((await db.workouts.get('w1'))?.cardio).toEqual({ minutes: 20, incline: 5.5 })
  })
})
