import { addDaysLocal, weekStart, type LocalDate } from './dates'

export interface StreakResult {
  /** semanas seguidas con al menos un entreno o carrera */
  current: number
  best: number
}

/**
 * Racha en semanas (lunes a domingo) con al menos un entreno o carrera.
 * La semana en curso no rompe la racha hasta que termina: si aún no tiene actividad,
 * la racha actual se cuenta desde la semana anterior.
 */
export function computeStreak(activeDates: Iterable<LocalDate>, today: LocalDate): StreakResult {
  const weeks = new Set<LocalDate>()
  for (const d of activeDates) if (d <= today) weeks.add(weekStart(d))

  const thisWeek = weekStart(today)
  let cursor = weeks.has(thisWeek) ? thisWeek : addDaysLocal(thisWeek, -7)
  let current = 0
  while (weeks.has(cursor)) {
    current++
    cursor = addDaysLocal(cursor, -7)
  }

  let best = 0
  const sorted = [...weeks].sort()
  let run = 0
  let prev: LocalDate | null = null
  for (const w of sorted) {
    run = prev !== null && addDaysLocal(prev, 7) === w ? run + 1 : 1
    best = Math.max(best, run)
    prev = w
  }
  return { current, best: Math.max(best, current) }
}
