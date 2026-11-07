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

/** @param sinceDeload true si se cuenta desde una descarga; false si desde el inicio del plan */
export function deloadText(weeks: number, sinceDeload = true): string {
  if (weeks === 0) return sinceDeload ? 'Descarga hecha esta semana' : 'Plan empezado esta semana'
  const w = `${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`
  return sinceDeload
    ? `${w} desde la última descarga`
    : `${w} desde el inicio del plan, sin descarga`
}
