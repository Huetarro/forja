/** Km de esta semana frente a la anterior y máximo recomendado (+10 %). */
import { addDaysLocal, weekStart, type LocalDate } from './dates'

export const WEEKLY_KM_INCREASE = 0.1

export interface RunWeekComparison {
  thisWeek: number
  lastWeek: number
  /** máximo recomendado esta semana (+10 % sobre la anterior); null si la anterior fue 0 */
  maxRecommended: number | null
}

const round2 = (n: number) => Math.round(n * 100) / 100

export function runWeekComparison(
  runs: ReadonlyArray<{ date: LocalDate; distanceKm: number }>,
  today: LocalDate,
): RunWeekComparison {
  const start = weekStart(today)
  const prevStart = addDaysLocal(start, -7)
  let thisWeek = 0
  let lastWeek = 0
  for (const r of runs) {
    if (r.date >= start && r.date <= addDaysLocal(start, 6)) thisWeek += r.distanceKm
    else if (r.date >= prevStart && r.date < start) lastWeek += r.distanceKm
  }
  return {
    thisWeek: round2(thisWeek),
    lastWeek: round2(lastWeek),
    maxRecommended: lastWeek > 0 ? round2(lastWeek * (1 + WEEKLY_KM_INCREASE)) : null,
  }
}
