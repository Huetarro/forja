/**
 * REGLAS DE "SUBE PESO" — único archivo para ajustarlas.
 *
 * El distintivo aparece (sin decir cuántos kg) si se cumple alguna:
 *  A) En las 2 últimas sesiones del ejercicio se usó el mismo peso (serie a serie) y en la
 *     última se igualaron o superaron las reps de la anterior en todas las series efectivas.
 *  B) En la última sesión, todas las series efectivas tienen RIR 2 o más.
 * En unilaterales, cada lado debe cumplirlo.
 */
import type { Side } from '@/db/schema'
import { isEffectiveSet, type SetLike } from './volume'

export const PROGRESSION_RULES = {
  /** Regla A activada */
  sameWeightRepsRule: true,
  /** Regla B: RIR mínimo en todas las series efectivas */
  minRirAllSets: 2,
} as const

type Eff = SetLike & { weight: number; reps: number }

function effective(sets: readonly SetLike[], side?: Side): Eff[] {
  return sets.filter((s): s is Eff => isEffectiveSet(s) && (side ? s.side === side : true))
}

function ruleA(last: Eff[], prev: Eff[]): boolean {
  if (!PROGRESSION_RULES.sameWeightRepsRule) return false
  if (last.length === 0 || last.length !== prev.length) return false
  return last.every((s, i) => {
    const p = prev[i]
    return p !== undefined && s.weight === p.weight && s.reps >= p.reps
  })
}

function ruleB(last: Eff[]): boolean {
  return (
    last.length > 0 &&
    last.every((s) => s.rir !== undefined && s.rir >= PROGRESSION_RULES.minRirAllSets)
  )
}

/**
 * @param sessions sesiones anteriores del ejercicio, la más reciente primero.
 */
export function shouldSuggestIncrease(sessions: ReadonlyArray<readonly SetLike[]>): boolean {
  const last = sessions[0]
  if (!last) return false
  const prev = sessions[1] ?? []
  const sides: Array<Side | undefined> = last.some((s) => s.side) ? ['izq', 'der'] : [undefined]
  return sides.every((side) => {
    const l = effective(last, side)
    const p = effective(prev, side)
    return ruleA(l, p) || ruleB(l)
  })
}
