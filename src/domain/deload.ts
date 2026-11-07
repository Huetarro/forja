/** Semana de descarga (funciones puras). */
import { daysBetween, weekStart, type LocalDate } from './dates'

/** A partir de esta semana se destaca en Inicio. */
export const DELOAD_HIGHLIGHT_WEEKS = 6

/**
 * Semanas completas desde la última descarga (o desde el inicio del plan si nunca hubo).
 * Se cuentan por semanas de lunes a domingo. null si no hay referencia.
 */
export function weeksSinceDeload(
  lastDeloadDate: LocalDate | undefined,
  planStart: LocalDate | undefined,
  today: LocalDate,
): number | null {
  const ref = lastDeloadDate ?? planStart
  if (!ref || ref > today) return ref ? 0 : null
  return Math.floor(daysBetween(weekStart(ref), weekStart(today)) / 7)
}

export function deloadText(weeks: number): string {
  if (weeks === 0) return 'Esta semana: descarga reciente'
  return `${weeks} ${weeks === 1 ? 'semana' : 'semanas'} desde la última descarga`
}
