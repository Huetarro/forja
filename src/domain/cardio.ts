/** Cardio al final del entreno (funciones puras). */
import { formatNumber } from './units'

export interface CardioValues {
  minutes: number | null
  /** inclinación en %, de 0 a 30 */
  incline: number | null
}

export const MAX_INCLINE = 30
export const EMPTY_CARDIO: CardioValues = { minutes: null, incline: null }

/** Limita la inclinación a 0-30 % con un decimal. */
export function cleanIncline(n: number | null): number | null {
  if (n === null || !Number.isFinite(n)) return null
  return Math.round(Math.min(Math.max(n, 0), MAX_INCLINE) * 10) / 10
}

/** Minutos enteros; 0 o menos equivale a no haberlo apuntado. */
export function cleanMinutes(n: number | null): number | null {
  if (n === null || !Number.isFinite(n) || n <= 0) return null
  return Math.round(n)
}

/** Los campos sin tocar aceptan el valor de la última vez, igual que las series. */
export function resolveCardio(
  current: CardioValues,
  last: CardioValues | null | undefined,
): CardioValues {
  return {
    minutes: current.minutes ?? last?.minutes ?? null,
    incline: current.incline ?? last?.incline ?? null,
  }
}

/** Media semanal de un total de minutos repartido en un periodo de `days` días. */
export function minutesPerWeek(totalMinutes: number, days: number): number {
  return days > 0 ? totalMinutes / (days / 7) : 0
}

/** Texto para resúmenes: "20 min · 5,5 %". */
export function formatCardio(c: CardioValues): string {
  const parts = [
    c.minutes !== null ? `${c.minutes} min` : null,
    c.incline !== null ? `${formatNumber(c.incline, 1)} %` : null,
  ].filter(Boolean)
  return parts.length ? parts.join(' · ') : 'Hecho'
}
