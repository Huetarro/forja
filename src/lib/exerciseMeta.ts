import type { Exercise, ExerciseMetric } from '@/db/schema'
import { formatNumber } from '@/domain/units'

/** Texto secundario de un ejercicio: "Pecho · Barra · lb · Unilateral" */
export function exerciseMeta(e: Exercise): string {
  return [
    e.primaryMuscle,
    e.equipment,
    e.unit === 'lb' ? 'lb' : null,
    e.unilateral ? 'Unilateral' : null,
    e.metric === 'segundos' ? 'Por tiempo' : null,
  ]
    .filter(Boolean)
    .join(' · ')
}

/** El kg es opcional: peso corporal como carga (sin kg no suma volumen). */
export function isNoLoad(e: Pick<Exercise, 'equipment' | 'optionalLoad'> | undefined): boolean {
  return !!e && (e.optionalLoad === true || e.equipment === 'Peso corporal')
}

export function metricOf(e: Pick<Exercise, 'metric'> | undefined): ExerciseMetric {
  return e?.metric ?? 'reps'
}

/** Cabecera corta de la columna: "Reps" o "Seg." */
export function metricShort(m: ExerciseMetric): string {
  return m === 'segundos' ? 'Seg.' : 'Reps'
}

/** "80 × 8", "80 × 45 s", "12 reps", "45 s" (sin kg). */
export function formatSetValue(
  weight: number | null,
  reps: number | null,
  m: ExerciseMetric,
): string {
  const r = reps ?? 0
  if (!weight) return m === 'segundos' ? `${r} s` : `${r} reps`
  return `${formatNumber(weight, 2)} × ${r}${m === 'segundos' ? ' s' : ''}`
}
