import { useLiveQuery } from 'dexie-react-hooks'
import { summarizeWorkout, totalVolumeKg, type WorkoutSummary } from '@/domain/summary'
import { db } from './db'
import type { Routine, Workout } from './schema'
import { loadWorkout, previousSessions } from './workouts'

export interface SummaryData {
  workout: Workout
  routine?: Routine
  summary: WorkoutSummary
}

async function bundleVolumeKg(workoutId: string): Promise<number> {
  const b = await loadWorkout(workoutId)
  if (!b) return 0
  const items = await Promise.all(
    b.exercises.map(async (we) => ({
      unit: (await db.exercises.get(we.exerciseId))?.unit ?? ('kg' as const),
      sets: b.sets.filter((s) => s.workoutExerciseId === we.id),
    })),
  )
  return totalVolumeKg(items)
}

/** Resumen de un entreno terminado, con récords y comparación con la vez anterior de esa rutina. */
export async function computeSummary(workoutId: string): Promise<SummaryData | null> {
  const b = await loadWorkout(workoutId)
  if (!b) return null
  const { workout } = b
  const items = await Promise.all(
    b.exercises.map(async (we) => {
      const ex = await db.exercises.get(we.exerciseId)
      const prev = await previousSessions(we.exerciseId, workout.id, workout.startedAt)
      return {
        exerciseId: we.exerciseId,
        name: ex?.name ?? 'Ejercicio',
        unit: ex?.unit ?? ('kg' as const),
        sets: b.sets.filter((s) => s.workoutExerciseId === we.id),
        history: prev.map((p) => p.sets),
      }
    }),
  )
  const prevWorkout = (await db.workouts.where('routineId').equals(workout.routineId).toArray())
    .filter(
      (w) => w.status === 'terminado' && w.id !== workout.id && w.startedAt < workout.startedAt,
    )
    .sort((a, b2) => b2.startedAt - a.startedAt)[0]
  const previous = prevWorkout
    ? { durationSec: prevWorkout.activeSeconds, volumeKg: await bundleVolumeKg(prevWorkout.id) }
    : undefined
  return {
    workout,
    routine: await db.routines.get(workout.routineId),
    summary: summarizeWorkout(items, workout.activeSeconds, previous),
  }
}

export function useSummary(workoutId: string | undefined): SummaryData | null | undefined {
  return useLiveQuery(async () => (workoutId ? computeSummary(workoutId) : null), [workoutId])
}
