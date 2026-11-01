import { sessionRecords, type SessionRecord } from './records'
import { percentChange } from './routineDiff'
import type { WeightUnit } from './units'
import { effectiveSetCount, volumeKg, type SetLike } from './volume'

export interface SummaryExerciseInput {
  exerciseId: string
  name: string
  unit: WeightUnit
  sets: readonly SetLike[]
  /** sesiones anteriores del ejercicio */
  history: ReadonlyArray<readonly SetLike[]>
}

export interface WorkoutSummary {
  durationSec: number
  exerciseCount: number
  effectiveSets: number
  volumeKg: number
  records: Array<SessionRecord & { exerciseName: string; unit: WeightUnit }>
  durationPct: number | null
  volumePct: number | null
}

/** Volumen total en kg de un entreno (mezcla ejercicios en kg y lb). */
export function totalVolumeKg(
  items: ReadonlyArray<Pick<SummaryExerciseInput, 'unit' | 'sets'>>,
): number {
  return items.reduce((sum, it) => sum + volumeKg(it.sets, it.unit), 0)
}

export function summarizeWorkout(
  items: readonly SummaryExerciseInput[],
  durationSec: number,
  previous?: { durationSec: number; volumeKg: number },
): WorkoutSummary {
  const done = items.filter((it) => effectiveSetCount(it.sets) > 0)
  const vol = totalVolumeKg(items)
  return {
    durationSec,
    exerciseCount: done.length,
    effectiveSets: items.reduce((n, it) => n + effectiveSetCount(it.sets), 0),
    volumeKg: vol,
    records: items.flatMap((it) =>
      sessionRecords(it.history, it.sets).map((r) => ({
        ...r,
        exerciseName: it.name,
        unit: it.unit,
      })),
    ),
    durationPct: previous ? percentChange(durationSec, previous.durationSec) : null,
    volumePct: previous ? percentChange(vol, previous.volumeKg) : null,
  }
}
