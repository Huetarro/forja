import Dexie, { type EntityTable, type Transaction } from 'dexie'
import {
  DEFAULT_SETTINGS,
  DEFAULT_SUPPLEMENTS,
  type DayLog,
  type Exercise,
  type Program,
  type ProgressPhoto,
  type Routine,
  type RoutineExercise,
  type Run,
  type Settings,
  type Snapshot,
  type Supplement,
  type Workout,
  type WorkoutExercise,
  type WorkoutSet,
} from './schema'

/** Esquema publicado en la v1 (no se toca nunca: los tests de migración parten de él). */
export const V1_TABLES = [
  'programs',
  'routines',
  'exercises',
  'routineExercises',
  'workouts',
  'workoutExercises',
  'workoutSets',
  'runs',
  'dayLogs',
  'supplements',
  'photos',
  'settings',
] as const
export type V1Table = (typeof V1_TABLES)[number]

export const V1_STORES: Record<V1Table, string> = {
  programs: 'id, order',
  routines: 'id, programId, order, archived',
  exercises: 'id, name, primaryMuscle, archived',
  routineExercises: 'id, routineId, exerciseId, [routineId+order]',
  workouts: 'id, routineId, date, status, startedAt',
  workoutExercises: 'id, workoutId, exerciseId, [workoutId+order]',
  workoutSets: 'id, workoutExerciseId, workoutId',
  runs: 'id, date',
  dayLogs: 'date',
  supplements: 'id, order',
  photos: 'id, date',
  settings: 'id',
}

export const PRE_V2_SNAPSHOT_ID = 'pre-v2'

export class ForjaDB extends Dexie {
  programs!: EntityTable<Program, 'id'>
  routines!: EntityTable<Routine, 'id'>
  exercises!: EntityTable<Exercise, 'id'>
  routineExercises!: EntityTable<RoutineExercise, 'id'>
  workouts!: EntityTable<Workout, 'id'>
  workoutExercises!: EntityTable<WorkoutExercise, 'id'>
  workoutSets!: EntityTable<WorkoutSet, 'id'>
  runs!: EntityTable<Run, 'id'>
  dayLogs!: EntityTable<DayLog, 'date'>
  supplements!: EntityTable<Supplement, 'id'>
  photos!: EntityTable<ProgressPhoto, 'id'>
  settings!: EntityTable<Settings, 'id'>
  snapshots!: EntityTable<Snapshot, 'id'>

  constructor(name = 'forja') {
    super(name)

    /*
     * MIGRACIONES — REGLA DE ORO: nunca borrar datos.
     * Para cambiar el esquema, añade `this.version(N + 1).stores({...}).upgrade(tx => ...)`
     * debajo de la última versión. No edites versiones ya publicadas.
     */
    this.version(1).stores(V1_STORES)

    // v2: copia interna previa a la actualización y campos nuevos (todos opcionales).
    this.version(2)
      .stores({ snapshots: 'id' })
      .upgrade((tx) => upgradeToV2(tx))

    // v3: `Workout.cardio`, campo opcional sin índice. No transforma ni borra nada.
    this.version(3).stores({})

    this.on('populate', (tx) => {
      void tx.table('settings').add(DEFAULT_SETTINGS)
      void tx
        .table('supplements')
        .bulkAdd(
          DEFAULT_SUPPLEMENTS.map((name, i) => ({ id: newId(), name, order: i, active: true })),
        )
    })
  }
}

/**
 * Migración v1 → v2. Primero guarda una copia íntegra de todas las tablas; después solo
 * añade información (nunca borra ni sobrescribe datos del usuario).
 */
async function upgradeToV2(tx: Transaction): Promise<void> {
  const now = Date.now()
  const data: Record<string, unknown[]> = {}
  for (const t of V1_TABLES) data[t] = await tx.table(t).toArray()
  await tx.table('snapshots').put({ id: PRE_V2_SNAPSHOT_ID, createdAt: now, data })

  // Pesos guardados dentro de un entreno → registro de ese día (si ese día no tiene peso).
  const workouts = data.workouts as Array<Workout & { bodyWeight?: unknown }>
  for (const w of workouts) {
    const bw = w.bodyWeight
    if (typeof bw !== 'number' || !Number.isFinite(bw)) continue
    const log = (await tx.table('dayLogs').get(w.date)) as DayLog | undefined
    if (!log)
      await tx.table('dayLogs').add({
        date: w.date,
        rest: false,
        supplements: {},
        nutrition: null,
        stretching: false,
        bodyWeight: bw,
        notes: '',
      } satisfies DayLog)
    else if (log.bodyWeight === undefined)
      await tx.table('dayLogs').update(w.date, { bodyWeight: bw })
  }

  const settings = (await tx.table('settings').get('app')) as Settings | undefined
  await tx.table('settings').put({
    ...DEFAULT_SETTINGS,
    ...settings,
    id: 'app',
    planV2Pending: true,
    preV2SnapshotAt: now,
  } satisfies Settings)
}

export function newId(): string {
  return crypto.randomUUID()
}

export const db = new ForjaDB()

/** Pide al navegador que no borre los datos si falta espacio. */
export async function requestPersistentStorage(): Promise<boolean> {
  try {
    if (navigator.storage?.persist) {
      if (await navigator.storage.persisted()) return true
      return await navigator.storage.persist()
    }
  } catch {
    // no disponible: seguimos igual
  }
  return false
}
