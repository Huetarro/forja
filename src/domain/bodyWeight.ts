/** Peso corporal: último registro y tendencia (funciones puras). */
import { addDaysLocal, type LocalDate } from './dates'

export interface WeightPoint {
  date: LocalDate
  value: number
}

export interface BodyWeightSummary {
  /** peso apuntado hoy, si lo hay */
  today: number | null
  /** último peso apuntado (hoy o antes) */
  last: WeightPoint | null
  /** diferencia frente al último peso de hace 7 días o más (kg), si lo hay */
  change: { kg: number; days: number } | null
}

/** Resumen para la tarjeta "Peso de hoy". `points` en cualquier orden. */
export function bodyWeightSummary(
  points: readonly WeightPoint[],
  today: LocalDate,
): BodyWeightSummary {
  const sorted = points.filter((p) => p.date <= today).sort((a, b) => a.date.localeCompare(b.date))
  const last = sorted[sorted.length - 1] ?? null
  if (!last) return { today: null, last: null, change: null }
  const limit = addDaysLocal(last.date, -7)
  const ref = [...sorted].reverse().find((p) => p.date <= limit)
  const change = ref
    ? {
        kg: Math.round((last.value - ref.value) * 10) / 10,
        days: Math.round(
          (Date.parse(`${last.date}T12:00:00`) - Date.parse(`${ref.date}T12:00:00`)) / 86_400_000,
        ),
      }
    : null
  return { today: last.date === today ? last.value : null, last, change }
}

/** Sube o baja 0,1 kg sin errores de coma flotante. */
export function stepWeight(value: number, delta: number): number {
  return Math.max(0, Math.round((value + delta) * 10) / 10)
}
