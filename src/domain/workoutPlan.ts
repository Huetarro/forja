/** Cómo se convierte una rutina en las series de un entreno (funciones puras). */
import type { SetType } from '@/db/schema'
import { isEffective } from './setTypes'
import { extrasAt, type PlanLike } from './techniques'

export interface PlannedSet {
  type: SetType
  /** bajadas (dropset) o mini-series (rest-pause) que aparecen ya desplegadas */
  extras: number
}

/** Series de la semana de descarga: la mitad (redondeando hacia arriba), todas normales. */
export function deloadSetCount(sets: readonly SetType[]): number {
  return Math.ceil(sets.filter(isEffective).length / 2)
}

/**
 * Series que se crean al empezar el entreno.
 * - NEG en el ejercicio: las series normales pasan a negativa.
 * - Descarga: mitad de series efectivas, todas normales y sin técnicas.
 */
export function plannedSets(plan: PlanLike, deload = false): PlannedSet[] {
  if (deload) {
    const n = Math.max(1, deloadSetCount(plan.sets))
    return Array.from({ length: n }, () => ({ type: 'normal' as const, extras: 0 }))
  }
  return plan.sets.map((t, i) => ({
    type: plan.negative && t === 'normal' ? 'negativa' : t,
    extras: extrasAt(plan, i),
  }))
}

/** Tipos de serie esperados (para comparar la estructura del entreno con la rutina). */
export function plannedTypes(plan: PlanLike): SetType[] {
  return plannedSets(plan).map((p) => p.type)
}
