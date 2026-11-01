import type { Drop, SetType, Side } from '@/db/schema'
import { toKg, type WeightUnit } from './units'

/** Forma mínima de una serie para los cálculos. */
export interface SetLike {
  type: SetType
  weight: number | null
  reps: number | null
  rir?: number
  completed: boolean
  side?: Side
  drops?: Drop[]
}

/** Serie efectiva y válida: hecha, no calentamiento, con peso y reps. */
export function isEffectiveSet(s: SetLike): s is SetLike & { weight: number; reps: number } {
  return (
    s.completed && s.type !== 'calentamiento' && s.weight !== null && s.reps !== null && s.reps > 0
  )
}

/** Volumen de una serie: peso × reps. En dropsets solo cuenta la primera (las bajadas no suman). */
export function setVolume(s: SetLike): number {
  return isEffectiveSet(s) ? s.weight * s.reps : 0
}

/** Volumen de un ejercicio en su unidad (los dos lados se suman en unilaterales). */
export function volume(sets: readonly SetLike[]): number {
  return sets.reduce((sum, s) => sum + setVolume(s), 0)
}

/** Volumen en kg (para totales que mezclan ejercicios). */
export function volumeKg(sets: readonly SetLike[], unit: WeightUnit): number {
  return toKg(volume(sets), unit)
}

/** Número de series efectivas (un dropset cuenta como 1). */
export function effectiveSetCount(sets: readonly SetLike[]): number {
  return sets.filter(isEffectiveSet).length
}
