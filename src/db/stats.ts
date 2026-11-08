import { useLiveQuery } from 'dexie-react-hooks'
import type { ExerciseInfo, SessionData } from '@/domain/stats'
import { db } from './db'
import { allSupplementsTaken } from './days'
import type { DayLog, Exercise, Run, Supplement } from './schema'
import { sortSets } from './workouts'
import { isNoLoad } from '@/lib/exerciseMeta'

export interface TrainingData {
  sessions: SessionData[]
  exercises: Map<string, ExerciseInfo>
  exerciseList: Exercise[]
  runs: Run[]
  logs: DayLog[]
  supplements: Supplement[]
  earliest?: string
  allSupplementsOn: (log: DayLog) => boolean
}

/** Todo lo necesario para las estadísticas, en un único paso. */
export function useTrainingData(): TrainingData | undefined {
  return useLiveQuery(async () => {
    const workouts = (await db.workouts.where('status').equals('terminado').toArray()).sort(
      (a, b) => a.date.localeCompare(b.date),
    )
    const wes = await db.workoutExercises.toArray()
    const sets = await db.workoutSets.toArray()
    const setsByWe = new Map<string, typeof sets>()
    for (const s of sets)
      setsByWe.set(s.workoutExerciseId, [...(setsByWe.get(s.workoutExerciseId) ?? []), s])
    const wesByWorkout = new Map<string, typeof wes>()
    for (const we of wes)
      wesByWorkout.set(we.workoutId, [...(wesByWorkout.get(we.workoutId) ?? []), we])

    const sessions: SessionData[] = workouts.map((w) => ({
      workoutId: w.id,
      date: w.date,
      routineId: w.routineId,
      activeSeconds: w.activeSeconds,
      avgHeartRate: w.avgHeartRate,
      calories: w.calories,
      deload: w.deload === true,
      cardioMinutes: w.cardio?.minutes ?? undefined,
      exercises: (wesByWorkout.get(w.id) ?? [])
        .sort((a, b) => a.order - b.order)
        .map((we) => ({ exerciseId: we.exerciseId, sets: sortSets(setsByWe.get(we.id) ?? []) })),
    }))

    const exerciseList = (await db.exercises.toArray()).sort((a, b) =>
      a.name.localeCompare(b.name, 'es'),
    )
    const exercises = new Map<string, ExerciseInfo>(
      exerciseList.map((e) => [
        e.id,
        {
          id: e.id,
          name: e.name,
          unit: e.unit,
          primaryMuscle: e.primaryMuscle,
          secondaryMuscles: e.secondaryMuscles,
          unilateral: e.unilateral,
          metric: e.metric,
          noLoad: isNoLoad(e),
        },
      ]),
    )
    const runs = (await db.runs.toArray()).sort((a, b) => a.date.localeCompare(b.date))
    const logs = (await db.dayLogs.toArray()).sort((a, b) => a.date.localeCompare(b.date))
    const supplements = (await db.supplements.toArray()).filter((s) => s.active)
    const dates = [workouts[0]?.date, runs[0]?.date, logs[0]?.date]
      .filter((d): d is string => !!d)
      .sort()
    return {
      sessions,
      exercises,
      exerciseList,
      runs,
      logs,
      supplements,
      earliest: dates[0],
      allSupplementsOn: (log: DayLog) => allSupplementsTaken(log, supplements),
    }
  })
}
