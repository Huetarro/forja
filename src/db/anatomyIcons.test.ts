/** Cambio a iconos anatómicos en un móvil que ya tenía el plan v2.0: no toca nada más. */
import 'fake-indexeddb/auto'
import Dexie from 'dexie'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { ROUTINE_ICONS } from '@/lib/routineStyle'
import { db, V1_STORES, V1_TABLES } from './db'
import { applyAnatomyIcons, loadPlanV2, PLAN_V2_ICON_UPDATE } from './planV2'
import { v1Data } from './v1Fixture'

const DATA_TABLES = [
  'programs',
  'exercises',
  'routineExercises',
  'workouts',
  'workoutExercises',
  'workoutSets',
  'runs',
  'dayLogs',
  'supplements',
  'photos',
] as const

async function dump() {
  const out: Record<string, unknown[]> = {}
  for (const t of DATA_TABLES) out[t] = await db.table(t).toArray()
  return out
}

describe('iconos anatómicos', () => {
  beforeAll(async () => {
    const v1 = new Dexie('forja')
    v1.version(1).stores(V1_STORES)
    const data = v1Data()
    for (const t of V1_TABLES) await v1.table(t).bulkAdd(data[t] ?? [])
    v1.close()
    await db.open()
    await loadPlanV2()
    // Estado de la v2.0: iconos antiguos; Dani cambió a mano el de Tirón
    for (const r of await db.routines.toArray()) {
      const u = PLAN_V2_ICON_UPDATE[r.name]
      if (u && !r.archived)
        await db.routines.update(r.id, { icon: r.name === 'Tirón' ? 'zap' : u.from })
    }
  })

  afterAll(() => db.close())

  it('existen en el selector', () => {
    for (const key of ['pecho', 'espalda', 'pierna', 'torso', 'abdomen'])
      expect(ROUTINE_ICONS[key]).toBeDefined()
  })

  it('cambia solo el icono de las rutinas del plan, respetando uno cambiado a mano', async () => {
    const before = await dump()
    const routinesBefore = await db.routines.toArray()
    const settingsBefore = await db.settings.get('app')

    expect(await applyAnatomyIcons()).toBe(4)

    const icon = async (name: string) =>
      (await db.routines.toArray()).find((r) => r.name === name && !r.archived)?.icon
    expect(await icon('Empuje')).toBe('pecho')
    expect(await icon('Pierna')).toBe('pierna')
    expect(await icon('Torso completo')).toBe('torso')
    expect(await icon('Core + estiramientos')).toBe('abdomen')
    expect(await icon('Tirón')).toBe('zap')

    // Nada más cambia: ni otras tablas, ni otros campos de las rutinas, ni las archivadas
    expect(await dump()).toEqual(before)
    const after = await db.routines.toArray()
    expect(after).toHaveLength(routinesBefore.length)
    for (const r of routinesBefore) {
      const { icon: _a, ...restBefore } = r
      const { icon: _b, ...restAfter } = after.find((x) => x.id === r.id) ?? r
      expect(restAfter).toEqual(restBefore)
    }
    expect((await db.routines.get('r1'))?.icon).toBe('dumbbell')
    const settingsAfter = await db.settings.get('app')
    const { routineIconsV2At, ...restSettings } = settingsAfter ?? { id: 'app' }
    expect(routineIconsV2At).toBeTypeOf('number')
    expect(restSettings).toEqual(settingsBefore)
  })

  it('es de un solo uso', async () => {
    await db.routines.toCollection().modify({ icon: 'flame' })
    expect(await applyAnatomyIcons()).toBe(0)
    expect((await db.routines.toArray()).every((r) => r.icon === 'flame')).toBe(true)
  })
})
