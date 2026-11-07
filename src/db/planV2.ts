/**
 * Plan semanal de Dani (v2) y su carga de un solo uso.
 * - Idempotente: se marca en Settings (`planV2LoadedAt`) y no se vuelve a insertar.
 * - Reutiliza los ejercicios de la biblioteca (nombre normalizado + sinónimos) para
 *   conservar su historial; solo crea los que faltan.
 * - Archiva (no borra) las rutinas que ya había.
 */
import { todayLocal } from '@/domain/dates'
import { nextOrder } from '@/domain/ordering'
import { findExercise, type LibraryEntry } from '@/domain/planMatch'
import { db, newId } from './db'
import { DEFAULT_STRETCHES } from './plan'
import {
  DEFAULT_SETTINGS,
  type Equipment,
  type Exercise,
  type ExerciseMetric,
  type Muscle,
  type RoutineExercise,
  type SetType,
  type Settings,
  type WeekPlan,
} from './schema'

interface PlanExercise {
  name: string
  aliases?: string[]
  primary: Muscle
  secondary?: Muscle[]
  equipment: Equipment
  unilateral?: boolean
  metric?: ExerciseMetric
  optionalLoad?: boolean
}

/** Biblioteca del plan: ejercicios compartidos entre días = una sola entrada. */
const EX = {
  pressMaquina: {
    name: 'Press en máquina',
    aliases: ['Press pecho en máquina', 'Press de pecho en máquina', 'Press máquina pecho'],
    primary: 'Pecho',
    secondary: ['Tríceps', 'Hombro anterior'],
    equipment: 'Máquina',
  },
  pressInclinadoSmith: {
    name: 'Press inclinado en Smith',
    aliases: ['Press inclinado multipower'],
    primary: 'Pecho',
    secondary: ['Hombro anterior', 'Tríceps'],
    equipment: 'Multipower',
  },
  aperturasPolea: {
    name: 'Aperturas en polea',
    aliases: ['Cruce de poleas', 'Cruces en polea'],
    primary: 'Pecho',
    secondary: ['Hombro anterior'],
    equipment: 'Polea',
  },
  elevacionesLaterales: {
    name: 'Elevaciones laterales',
    aliases: ['Elevaciones laterales con mancuernas'],
    primary: 'Hombro lateral',
    equipment: 'Mancuernas',
  },
  tricepsAbajo: {
    name: 'Extensión de tríceps en polea abajo',
    aliases: ['Extensión tríceps polea', 'Extensión de tríceps en polea', 'Tríceps en polea'],
    primary: 'Tríceps',
    equipment: 'Polea',
  },
  tricepsCabeza: {
    name: 'Extensión de tríceps en polea sobre la cabeza',
    aliases: ['Extensión tríceps sobre cabeza', 'Extensión de tríceps sobre la cabeza'],
    primary: 'Tríceps',
    equipment: 'Polea',
  },
  jalon: {
    name: 'Jalón al pecho',
    aliases: ['Jalón en polea al pecho'],
    primary: 'Dorsal',
    secondary: ['Bíceps', 'Espalda'],
    equipment: 'Polea',
  },
  remoGironda: {
    name: 'Remo Gironda',
    aliases: ['Remo gironda en polea'],
    primary: 'Espalda',
    secondary: ['Dorsal', 'Bíceps', 'Hombro posterior'],
    equipment: 'Polea',
  },
  remoT: {
    name: 'Remo en T',
    aliases: ['Remo con barra T', 'Remo en punta'],
    primary: 'Espalda',
    secondary: ['Dorsal', 'Trapecio', 'Bíceps'],
    equipment: 'Barra',
  },
  facePull: {
    name: 'Face pull',
    primary: 'Hombro posterior',
    secondary: ['Trapecio'],
    equipment: 'Polea',
  },
  curlMaquina: {
    name: 'Curl en máquina',
    aliases: ['Curl de bíceps en máquina'],
    primary: 'Bíceps',
    equipment: 'Máquina',
  },
  curlMartillo: {
    name: 'Curl martillo',
    aliases: ['Curl martillo con mancuernas'],
    primary: 'Bíceps',
    secondary: ['Antebrazo'],
    equipment: 'Mancuernas',
  },
  prensa: {
    name: 'Prensa',
    aliases: ['Prensa de piernas', 'Prensa inclinada'],
    primary: 'Cuádriceps',
    secondary: ['Glúteo'],
    equipment: 'Máquina',
  },
  extCuadriceps: {
    name: 'Extensión de cuádriceps',
    aliases: ['Extensión de piernas'],
    primary: 'Cuádriceps',
    equipment: 'Máquina',
  },
  femoralSentado: {
    name: 'Femoral sentado',
    aliases: ['Curl femoral sentado'],
    primary: 'Isquiotibiales',
    equipment: 'Máquina',
  },
  femoralTumbado: {
    name: 'Femoral tumbado',
    aliases: ['Curl femoral tumbado'],
    primary: 'Isquiotibiales',
    equipment: 'Máquina',
  },
  aductor: {
    name: 'Aductor en máquina',
    primary: 'Aductores',
    equipment: 'Máquina',
  },
  gemelo: {
    name: 'Gemelo',
    aliases: ['Gemelo en máquina', 'Elevación de gemelos'],
    primary: 'Gemelo',
    equipment: 'Máquina',
  },
  jalonNeutro: {
    name: 'Jalón al pecho agarre neutro',
    aliases: ['Jalón agarre neutro'],
    primary: 'Dorsal',
    secondary: ['Bíceps', 'Espalda'],
    equipment: 'Polea',
  },
  elevacionesPolea: {
    name: 'Elevaciones laterales en polea',
    primary: 'Hombro lateral',
    equipment: 'Polea',
  },
  rueda: {
    name: 'Rueda abdominal',
    primary: 'Abdomen',
    equipment: 'Otro',
    optionalLoad: true,
  },
  elevacionPiernas: {
    name: 'Elevación de piernas colgado',
    aliases: ['Elevaciones de piernas colgado'],
    primary: 'Abdomen',
    equipment: 'Peso corporal',
    optionalLoad: true,
  },
  crunchPolea: {
    name: 'Crunch en polea alta',
    aliases: ['Crunch en polea'],
    primary: 'Abdomen',
    equipment: 'Polea',
  },
  pallof: {
    name: 'Pallof press',
    primary: 'Abdomen',
    equipment: 'Polea',
    unilateral: true,
  },
  planchaLateral: {
    name: 'Plancha lateral',
    primary: 'Abdomen',
    equipment: 'Peso corporal',
    unilateral: true,
    metric: 'segundos',
    optionalLoad: true,
  },
  deadBug: {
    name: 'Dead bug',
    primary: 'Abdomen',
    equipment: 'Peso corporal',
    unilateral: true,
    optionalLoad: true,
  },
} satisfies Record<string, PlanExercise>

type ExKey = keyof typeof EX

interface PlanItem {
  ex: ExKey
  sets: number
  min: number
  max: number
  rest: number
  /** técnica de la última serie */
  last?: 'DS' | 'DSx2' | 'RP'
  negative?: boolean
  pause?: string
  /** forma superserie con el siguiente */
  supersetWithNext?: boolean
}

interface PlanRoutine {
  day: 1 | 2 | 4 | 5 | 7
  name: string
  color: number
  icon: string
  notes: string
  stretches?: boolean
  items: PlanItem[]
}

export const PLAN_V2_PROGRAM = 'Plan semanal'

const NOTE = 'Todas las series: 1-2 reps en reserva, salvo la última con técnica (al fallo).'

export const PLAN_V2: PlanRoutine[] = [
  {
    day: 1,
    name: 'Empuje',
    color: 1,
    icon: 'pecho',
    notes: NOTE,
    items: [
      { ex: 'pressMaquina', sets: 4, min: 6, max: 10, rest: 150 },
      { ex: 'pressInclinadoSmith', sets: 3, min: 8, max: 10, rest: 120, negative: true },
      { ex: 'aperturasPolea', sets: 3, min: 12, max: 15, rest: 90, last: 'DS' },
      { ex: 'elevacionesLaterales', sets: 4, min: 12, max: 15, rest: 60, last: 'DSx2' },
      { ex: 'tricepsAbajo', sets: 3, min: 10, max: 12, rest: 90, last: 'RP' },
      { ex: 'tricepsCabeza', sets: 3, min: 10, max: 12, rest: 90 },
    ],
  },
  {
    day: 2,
    name: 'Tirón',
    color: 3,
    icon: 'espalda',
    notes: NOTE,
    items: [
      { ex: 'jalon', sets: 4, min: 8, max: 10, rest: 120, negative: true },
      { ex: 'remoGironda', sets: 3, min: 8, max: 12, rest: 120, pause: '' },
      { ex: 'remoT', sets: 3, min: 8, max: 10, rest: 120 },
      { ex: 'facePull', sets: 3, min: 12, max: 15, rest: 60, pause: '' },
      { ex: 'curlMaquina', sets: 3, min: 10, max: 12, rest: 90, last: 'DS' },
      { ex: 'curlMartillo', sets: 3, min: 10, max: 12, rest: 90 },
    ],
  },
  {
    day: 4,
    name: 'Pierna',
    color: 5,
    icon: 'pierna',
    notes: NOTE,
    items: [
      { ex: 'prensa', sets: 4, min: 8, max: 12, rest: 150, negative: true },
      { ex: 'extCuadriceps', sets: 3, min: 12, max: 15, rest: 90, last: 'DSx2' },
      { ex: 'femoralSentado', sets: 3, min: 10, max: 12, rest: 90, negative: true },
      { ex: 'femoralTumbado', sets: 3, min: 10, max: 12, rest: 90, last: 'RP' },
      { ex: 'aductor', sets: 2, min: 12, max: 15, rest: 60 },
      { ex: 'gemelo', sets: 3, min: 10, max: 15, rest: 60, pause: 'abajo 2 s (estirado)' },
    ],
  },
  {
    day: 5,
    name: 'Torso completo',
    color: 7,
    icon: 'torso',
    notes: NOTE,
    items: [
      { ex: 'pressInclinadoSmith', sets: 3, min: 8, max: 10, rest: 120 },
      { ex: 'remoGironda', sets: 3, min: 10, max: 12, rest: 120 },
      { ex: 'aperturasPolea', sets: 2, min: 12, max: 15, rest: 90, last: 'DS' },
      { ex: 'jalonNeutro', sets: 2, min: 10, max: 12, rest: 90 },
      { ex: 'elevacionesPolea', sets: 3, min: 12, max: 15, rest: 60, last: 'DS' },
      { ex: 'curlMaquina', sets: 3, min: 10, max: 12, rest: 90, supersetWithNext: true },
      { ex: 'tricepsCabeza', sets: 3, min: 10, max: 12, rest: 90 },
    ],
  },
  {
    day: 7,
    name: 'Core + estiramientos',
    color: 9,
    icon: 'abdomen',
    notes: `${NOTE} Estiramientos: 45 s cada uno.`,
    stretches: true,
    items: [
      { ex: 'rueda', sets: 3, min: 8, max: 10, rest: 60 },
      { ex: 'elevacionPiernas', sets: 3, min: 10, max: 12, rest: 60 },
      { ex: 'crunchPolea', sets: 3, min: 12, max: 15, rest: 60, last: 'DS' },
      { ex: 'pallof', sets: 3, min: 12, max: 12, rest: 45 },
      { ex: 'planchaLateral', sets: 2, min: 30, max: 45, rest: 45 },
      { ex: 'deadBug', sets: 2, min: 10, max: 10, rest: 45 },
    ],
  },
]

export const PLAN_V2_RUNS: WeekPlan = {
  3: { kind: 'carrera', runType: 'rodaje', label: 'Carrera zona 2 · 30-40 min' },
  6: { kind: 'carrera', runType: 'tirada_larga', label: 'Tirada larga zona 2 · 45-60 min' },
}

function plannedTypes(it: PlanItem): { sets: SetType[]; extras?: number[] } {
  const sets: SetType[] = Array.from({ length: it.sets }, () => 'normal')
  if (!it.last) return { sets }
  sets[it.sets - 1] = it.last === 'RP' ? 'restpause' : 'dropset'
  const extras = sets.map((_, i) =>
    i === it.sets - 1 ? (it.last === 'DSx2' ? 2 : it.last === 'RP' ? 2 : 1) : 0,
  )
  return { sets, extras }
}

export type LoadPlanResult =
  { loaded: false } | { loaded: true; reused: number; created: number; archivedRoutines: number }

/** Carga el plan v2 (una sola vez). */
export async function loadPlanV2(): Promise<LoadPlanResult> {
  return db.transaction(
    'rw',
    [db.settings, db.programs, db.routines, db.routineExercises, db.exercises, db.workoutExercises],
    async () => {
      const settings: Settings = (await db.settings.get('app')) ?? DEFAULT_SETTINGS
      if (settings.planV2LoadedAt) return { loaded: false }
      const now = Date.now()

      // 1. Ejercicios: reutilizar o crear
      const all = await db.exercises.toArray()
      const sessions = new Map<string, number>()
      await db.workoutExercises.each((we) =>
        sessions.set(we.exerciseId, (sessions.get(we.exerciseId) ?? 0) + 1),
      )
      const library: LibraryEntry[] = all.map((e) => ({
        id: e.id,
        name: e.name,
        archived: e.archived,
        sessions: sessions.get(e.id) ?? 0,
      }))
      const ids = {} as Record<ExKey, string>
      let reused = 0
      let created = 0
      for (const key of Object.keys(EX) as ExKey[]) {
        const def: PlanExercise = EX[key]
        const found = findExercise(library, def.name, def.aliases)
        if (found) {
          reused++
          ids[key] = found.id
          const patch: Partial<Exercise> = {}
          if (found.archived) patch.archived = false
          // Sin historial se le pueden aplicar los datos del plan sin cambiar nada apuntado
          if (found.sessions === 0) {
            if (def.unilateral) patch.unilateral = true
            if (def.metric) patch.metric = def.metric
            if (def.optionalLoad) patch.optionalLoad = true
          }
          if (Object.keys(patch).length) await db.exercises.update(found.id, patch)
          continue
        }
        const id = newId()
        created++
        ids[key] = id
        await db.exercises.add({
          id,
          name: def.name,
          primaryMuscle: def.primary,
          secondaryMuscles: def.secondary ?? [],
          equipment: def.equipment,
          unilateral: def.unilateral ?? false,
          unit: 'kg',
          fixedNotes: '',
          ...(def.metric ? { metric: def.metric } : {}),
          ...(def.optionalLoad ? { optionalLoad: true } : {}),
          archived: false,
          createdAt: now,
        })
        library.push({ id, name: def.name, archived: false, sessions: 0 })
      }

      // 2. Archivar las rutinas que había (con su historial intacto)
      const oldRoutines = (await db.routines.toArray()).filter((r) => !r.archived)
      for (const r of oldRoutines) await db.routines.update(r.id, { archived: true })

      // 3. Programa y rutinas
      const programId = newId()
      await db.programs.add({
        id: programId,
        name: PLAN_V2_PROGRAM,
        order: nextOrder(await db.programs.toArray()),
        archived: false,
      })
      const baseOrder = nextOrder(await db.routines.toArray())
      const weekPlan: WeekPlan = { ...PLAN_V2_RUNS }
      for (const [ri, pr] of PLAN_V2.entries()) {
        const routineId = newId()
        await db.routines.add({
          id: routineId,
          programId,
          name: pr.name,
          color: pr.color,
          icon: pr.icon,
          notes: pr.notes,
          order: baseOrder + ri,
          archived: false,
          createdAt: now + ri,
          ...(pr.stretches ? { stretches: true } : {}),
        })
        weekPlan[pr.day] = { kind: 'rutina', routineId }
        let superset: string | undefined
        const items: RoutineExercise[] = pr.items.map((it, order) => {
          const supersetId = it.supersetWithNext ? (superset = newId()) : superset
          if (!it.supersetWithNext) superset = undefined
          return {
            id: newId(),
            routineId,
            exerciseId: ids[it.ex],
            order,
            notes: '',
            ...(supersetId ? { supersetId } : {}),
            ...plannedTypes(it),
            target: { min: it.min, max: it.max },
            restSec: it.rest,
            ...(it.negative ? { negative: true } : {}),
            ...(it.pause !== undefined ? { pause: it.pause } : {}),
          }
        })
        await db.routineExercises.bulkAdd(items)
      }

      // 4. Ajustes: plan semanal, estiramientos y marca de cargado
      await db.settings.put({
        ...settings,
        id: 'app',
        weekPlan,
        stretchList: settings.stretchList ?? DEFAULT_STRETCHES,
        planStartDate: settings.planStartDate ?? todayLocal(),
        planV2LoadedAt: now,
        planV2Pending: false,
      })
      return { loaded: true, reused, created, archivedRoutines: oldRoutines.length }
    },
  )
}

/** Iconos que tenían las rutinas del plan en la v2.0 → iconos anatómicos (v2.1). */
export const PLAN_V2_ICON_UPDATE: Record<string, { from: string; to: string }> = {
  Empuje: { from: 'flame', to: 'pecho' },
  Tirón: { from: 'anvil', to: 'espalda' },
  Pierna: { from: 'mountain', to: 'pierna' },
  'Torso completo': { from: 'dumbbell', to: 'torso' },
  'Core + estiramientos': { from: 'target', to: 'abdomen' },
}

/**
 * Cambio de un solo uso a los iconos anatómicos en las rutinas del programa "Plan semanal".
 * Solo toca el icono, y solo si sigue siendo el original (si se cambió a mano, se respeta).
 * Idempotente: se marca en Settings (`routineIconsV2At`). Devuelve cuántas rutinas cambió.
 */
export async function applyAnatomyIcons(): Promise<number> {
  return db.transaction('rw', db.settings, db.programs, db.routines, async () => {
    const settings: Settings = (await db.settings.get('app')) ?? DEFAULT_SETTINGS
    if (settings.routineIconsV2At) return 0
    const plans = (await db.programs.toArray()).filter((p) => p.name === PLAN_V2_PROGRAM)
    let changed = 0
    for (const p of plans) {
      for (const r of await db.routines.where('programId').equals(p.id).toArray()) {
        const u = PLAN_V2_ICON_UPDATE[r.name]
        if (u && r.icon === u.from) {
          await db.routines.update(r.id, { icon: u.to })
          changed++
        }
      }
    }
    await db.settings.put({ ...settings, id: 'app', routineIconsV2At: Date.now() })
    return changed
  })
}
