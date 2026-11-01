import { addDays, differenceInCalendarDays, format, parseISO, startOfWeek } from 'date-fns'
import { es } from 'date-fns/locale'

/** Fecha local en formato YYYY-MM-DD (el móvil está en Europe/Madrid). */
export type LocalDate = string

export function toLocalDate(d: Date): LocalDate {
  return format(d, 'yyyy-MM-dd')
}

export function todayLocal(now: Date = new Date()): LocalDate {
  return toLocalDate(now)
}

export function parseLocalDate(s: LocalDate): Date {
  return parseISO(s)
}

/** Lunes de la semana de la fecha dada (semana de lunes a domingo). */
export function weekStart(date: LocalDate): LocalDate {
  return toLocalDate(startOfWeek(parseLocalDate(date), { weekStartsOn: 1 }))
}

/** Los 7 días (lunes→domingo) de la semana que contiene la fecha. */
export function weekDays(date: LocalDate): LocalDate[] {
  const start = parseLocalDate(weekStart(date))
  return Array.from({ length: 7 }, (_, i) => toLocalDate(addDays(start, i)))
}

export function addDaysLocal(date: LocalDate, n: number): LocalDate {
  return toLocalDate(addDays(parseLocalDate(date), n))
}

export function daysBetween(from: LocalDate, to: LocalDate): number {
  return differenceInCalendarDays(parseLocalDate(to), parseLocalDate(from))
}

/** "hoy", "ayer", "hace 3 días". */
export function relativeDays(date: LocalDate, today: LocalDate): string {
  const d = daysBetween(date, today)
  if (d <= 0) return 'hoy'
  if (d === 1) return 'ayer'
  return `hace ${d} días`
}

/** "domingo, 1 de noviembre" */
export function longDate(date: LocalDate): string {
  return format(parseLocalDate(date), "EEEE, d 'de' MMMM", { locale: es })
}

/** Saludo según la hora del día. */
export function greeting(now: Date = new Date()): string {
  const h = now.getHours()
  if (h < 6) return 'Buenas noches'
  if (h < 14) return 'Buenos días'
  if (h < 21) return 'Buenas tardes'
  return 'Buenas noches'
}

/** Primera letra en mayúscula. */
export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
