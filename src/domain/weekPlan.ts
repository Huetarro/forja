/** Plan por días de la semana (sustituye a la rotación). Funciones puras. */
import type { DayPlan, WeekPlan, Weekday } from '@/db/schema'
import { parseLocalDate, type LocalDate } from './dates'

export const WEEKDAYS: Weekday[] = [1, 2, 3, 4, 5, 6, 7]

export const WEEKDAY_LABEL: Record<Weekday, string> = {
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
  7: 'Domingo',
}

/** Día de la semana de una fecha local: 1 = lunes … 7 = domingo. */
export function weekdayOf(date: LocalDate): Weekday {
  const d = parseLocalDate(date).getDay() // 0 = domingo
  return (d === 0 ? 7 : d) as Weekday
}

/** Lo que toca un día; null si ese día no está configurado. */
export function planForDate(plan: WeekPlan | undefined, date: LocalDate): DayPlan | null {
  return plan?.[weekdayOf(date)] ?? null
}

/** ¿Hay algún día configurado? */
export function hasWeekPlan(plan: WeekPlan | undefined): boolean {
  return !!plan && WEEKDAYS.some((d) => plan[d] !== undefined)
}
