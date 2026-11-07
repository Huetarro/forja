/**
 * REGLA DE "SUBE PESO" — único archivo para ajustarla (v2, sustituye a la anterior).
 *
 * El aviso aparece (sin decir cuántos kg) cuando en la última sesión del ejercicio que no
 * fue de descarga, TODAS las series efectivas llegaron al tope del rango objetivo
 * (reps ≥ máximo; en ejercicios por tiempo, segundos ≥ máximo). En unilaterales, cada lado.
 * Sin rango objetivo no hay aviso. En ejercicios sin kg, el aviso dice "Tope alcanzado".
 */
import type { Side, TargetRange } from '@/db/schema'
import { isEffectiveSet, type SetLike } from './volume'

/** Una sesión anterior del ejercicio. */
export interface HistorySession<S extends SetLike = SetLike> {
  sets: readonly S[]
  /** sesión de la semana de descarga: no cuenta para "Sube peso" ni para el estancamiento */
  deload?: boolean
}

export type ProgressionBadge = 'sube_peso' | 'tope' | null

export const PROGRESSION_LABEL: Record<Exclude<ProgressionBadge, null>, string> = {
  sube_peso: 'Sube peso',
  tope: 'Tope alcanzado',
}

/** Última sesión que no fue de descarga (la lista va de la más reciente a la más antigua). */
export function lastRegularSession<S extends SetLike>(
  sessions: ReadonlyArray<HistorySession<S>>,
): HistorySession<S> | undefined {
  return sessions.find((s) => !s.deload)
}

function topReached(sets: readonly SetLike[], target: TargetRange, side?: Side): boolean {
  const eff = sets.filter((s) => isEffectiveSet(s) && (side ? s.side === side : true))
  return eff.length > 0 && eff.every((s) => (s.reps ?? 0) >= target.max)
}

/**
 * @param sessions sesiones anteriores, la más reciente primero.
 * @param target rango objetivo del ejercicio en la rutina.
 * @param noLoad el ejercicio se hace sin kg (peso corporal o por tiempo).
 */
export function progressionBadge(
  sessions: ReadonlyArray<HistorySession>,
  target: TargetRange | undefined,
  noLoad = false,
): ProgressionBadge {
  if (!target) return null
  const last = lastRegularSession(sessions)
  if (!last) return null
  const sides: Array<Side | undefined> = last.sets.some((s) => s.side)
    ? ['izq', 'der']
    : [undefined]
  if (!sides.every((side) => topReached(last.sets, target, side))) return null
  const usedLoad = last.sets.some((s) => isEffectiveSet(s) && s.weight > 0)
  return noLoad && !usedLoad ? 'tope' : 'sube_peso'
}
