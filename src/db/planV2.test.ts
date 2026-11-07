/** Carga del plan v2 sobre una base con datos reales de la v1. */
import 'fake-indexeddb/auto'
import Dexie from 'dexie'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { normalizeName } from '@/domain/planMatch'
import { db, V1_STORES, V1_TABLES } from './db'
import { loadPlanV2, PLAN_V2_PROGRAM } from './planV2'
import { v1Data } from './v1Fixture'

const byName = async (name: string) =>
  (await db.exercises.toArray()).filter((e) => normalizeName(e.name) === normalizeName(name))

async function routineItems(name: string) {
  const r = (await db.routines.toArray()).find((x) => x.name === name && !x.archived)
  if (!r) throw new Error(`Falta la rutina ${name}`)
  const items = (await db.routineExercises.where('routineId').equals(r.id).toArray()).sort(
    (a, b) => a.order - b.order,
  )
  const ex = new Map((await db.exercises.toArray()).map((e) => [e.id, e]))
  return items.map((it) => ({ ...it, name: ex.get(it.exerciseId)?.name ?? '?' }))
}

describe('carga del plan v2', () => {
  const original = v1Data()
  let first: Awaited<ReturnType<typeof loadPlanV2>>

  beforeAll(async () => {
    const v1 = new Dexie('forja')
    v1.version(1).stores(V1_STORES)
    for (const t of V1_TABLES) await v1.table(t).bulkAdd(original[t] ?? [])
    v1.close()
    await db.open()
    expect((await db.settings.get('app'))?.planV2Pending).toBe(true)
    first = await loadPlanV2()
  })

  afterAll(() => db.close())

  it('reutiliza los ejercicios existentes (y su historial) en lugar de duplicarlos', async () => {
    expect(first).toMatchObject({ loaded: true, archivedRoutines: 2 })
    // "Jalón pecho" (v1) = "Jalón al pecho"
    const jalon = await byName('Jalón al pecho')
    expect(jalon.map((e) => e.id)).toEqual(['e3'])
    // "Press inclinado multipower" (archivado, con historial) = "Press inclinado en Smith"
    const smith = await db.exercises.get('e4')
    expect(smith?.archived).toBe(false)
    expect(await byName('Press inclinado en Smith')).toHaveLength(1)
    // El historial sigue apuntando a esos ejercicios
    expect(await db.workoutExercises.where('exerciseId').equals('e3').count()).toBe(1)
    expect(await db.workoutSets.where('workoutExerciseId').equals('we4').count()).toBe(2)
  })

  it('ejercicios compartidos entre días son el mismo ejercicio', async () => {
    const lunes = await routineItems('Empuje')
    const martes = await routineItems('Tirón')
    const viernes = await routineItems('Torso completo')
    const id = (list: typeof lunes, name: string) => list.find((x) => x.name === name)?.exerciseId
    expect(id(viernes, 'Press inclinado multipower')).toBe('e4')
    expect(id(lunes, 'Press inclinado multipower')).toBe('e4')
    expect(id(viernes, 'Remo Gironda')).toBe(id(martes, 'Remo Gironda'))
    expect(id(viernes, 'Aperturas en polea')).toBe(id(lunes, 'Aperturas en polea'))
    expect(id(viernes, 'Curl en máquina')).toBe(id(martes, 'Curl en máquina'))
    const cabeza = 'Extensión de tríceps en polea sobre la cabeza'
    expect(id(viernes, cabeza)).toBe(id(lunes, cabeza))
    expect(id(viernes, cabeza)).toBeDefined()
  })

  it('ejercicios parecidos pero distintos no se mezclan', async () => {
    const viernes = await routineItems('Torso completo')
    const lunes = await routineItems('Empuje')
    expect(viernes.find((x) => x.name === 'Jalón al pecho agarre neutro')?.exerciseId).not.toBe(
      'e3',
    )
    const lat = lunes.find((x) => x.name === 'Elevaciones laterales')?.exerciseId
    const latPolea = viernes.find((x) => x.name === 'Elevaciones laterales en polea')?.exerciseId
    expect(lat).toBeDefined()
    expect(latPolea).toBeDefined()
    expect(lat).not.toBe(latPolea)
  })

  it('rutinas con objetivo, descanso y técnicas', async () => {
    const lunes = await routineItems('Empuje')
    expect(lunes).toHaveLength(6)
    expect(lunes[0]).toMatchObject({ target: { min: 6, max: 10 }, restSec: 150 })
    expect(lunes[0]?.sets).toEqual(['normal', 'normal', 'normal', 'normal'])
    expect(lunes[1]).toMatchObject({ negative: true, restSec: 120 })
    const lat = lunes[3]
    expect(lat?.sets).toEqual(['normal', 'normal', 'normal', 'dropset'])
    expect(lat?.extras).toEqual([0, 0, 0, 2]) // DS x2
    expect(lunes[4]?.sets[2]).toBe('restpause')

    const martes = await routineItems('Tirón')
    expect(martes[1]?.pause).toBe('')
    const pierna = await routineItems('Pierna')
    expect(pierna[5]).toMatchObject({ pause: 'abajo 2 s (estirado)', target: { min: 10, max: 15 } })

    // Viernes: superserie Curl en máquina + tríceps sobre la cabeza, descanso tras la pareja
    const viernes = await routineItems('Torso completo')
    const [curl, tri] = viernes.slice(-2)
    expect(curl?.supersetId).toBeDefined()
    expect(tri?.supersetId).toBe(curl?.supersetId)
    expect(tri?.restSec).toBe(90)
    expect(viernes.slice(0, -2).every((x) => !x.supersetId)).toBe(true)
  })

  it('ejercicios nuevos de core con datos razonables', async () => {
    const [plancha] = await byName('Plancha lateral')
    expect(plancha).toMatchObject({
      unit: 'kg',
      unilateral: true,
      metric: 'segundos',
      optionalLoad: true,
      primaryMuscle: 'Abdomen',
    })
    expect((await byName('Pallof press'))[0]?.unilateral).toBe(true)
    expect((await byName('Rueda abdominal'))[0]?.optionalLoad).toBe(true)
    const domingo = (await db.routines.toArray()).find((r) => r.name === 'Core + estiramientos')
    expect(domingo?.stretches).toBe(true)
  })

  it('archiva las rutinas antiguas sin tocar su historial', async () => {
    expect((await db.routines.get('r1'))?.archived).toBe(true)
    expect((await db.routines.get('r2'))?.archived).toBe(true)
    expect(await db.routineExercises.where('routineId').equals('r1').count()).toBe(2)
    expect(await db.workouts.count()).toBe(3)
    expect(await db.workoutSets.count()).toBe(original.workoutSets?.length)
    expect(await db.photos.count()).toBe(1)
    expect(await db.runs.count()).toBe(1)
  })

  it('crea el programa y el plan semanal por días', async () => {
    const program = (await db.programs.toArray()).find((p) => p.name === PLAN_V2_PROGRAM)
    expect(program).toBeDefined()
    expect(
      await db.routines
        .where('programId')
        .equals(program?.id ?? '')
        .count(),
    ).toBe(5)
    const s = await db.settings.get('app')
    expect(s?.planV2Pending).toBe(false)
    expect(s?.planV2LoadedAt).toBeTypeOf('number')
    expect(s?.stretchList).toHaveLength(8)
    const plan = s?.weekPlan ?? {}
    expect(plan[3]).toEqual({
      kind: 'carrera',
      runType: 'rodaje',
      label: 'Carrera zona 2 · 30-40 min',
    })
    expect(plan[6]).toMatchObject({ kind: 'carrera', runType: 'tirada_larga' })
    for (const d of [1, 2, 4, 5, 7] as const) expect(plan[d]?.kind).toBe('rutina')
    expect(s).toMatchObject({ userName: 'Dani', theme: 'dark' })
  })

  it('es idempotente: una segunda carga no inserta nada', async () => {
    const counts = async () => ({
      ex: await db.exercises.count(),
      r: await db.routines.count(),
      re: await db.routineExercises.count(),
      p: await db.programs.count(),
    })
    const before = await counts()
    expect(await loadPlanV2()).toEqual({ loaded: false })
    expect(await counts()).toEqual(before)
  })
})
