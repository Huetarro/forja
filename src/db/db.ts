import Dexie, { type EntityTable } from 'dexie'
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
  type Supplement,
  type Workout,
  type WorkoutExercise,
  type WorkoutSet,
} from './schema'

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

  constructor(name = 'forja') {
    super(name)

    /*
     * MIGRACIONES — REGLA DE ORO: nunca borrar datos.
     * Para cambiar el esquema, añade `this.version(N + 1).stores({...}).upgrade(tx => ...)`
     * debajo de la última versión. No edites versiones ya publicadas.
     */
    this.version(1).stores({
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
    })

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
