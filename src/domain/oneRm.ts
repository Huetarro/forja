import { isEffectiveSet, type SetLike } from './volume'

export const ONE_RM_MIN_REPS = 1
export const ONE_RM_MAX_REPS = 12

/** 1RM estimado (Epley): peso × (1 + reps / 30). Solo con 1 a 12 reps; si no, null. */
export function epley(weight: number, reps: number): number | null {
  if (!(weight > 0) || reps < ONE_RM_MIN_REPS || reps > ONE_RM_MAX_REPS) return null
  return weight * (1 + reps / 30)
}

/** Mejor 1RM estimado de un conjunto de series (efectivas). */
export function bestOneRm(sets: readonly SetLike[]): number | null {
  let best: number | null = null
  for (const s of sets) {
    if (!isEffectiveSet(s)) continue
    const v = epley(s.weight, s.reps)
    if (v !== null && (best === null || v > best)) best = v
  }
  return best
}

/** Tabla de porcentajes del 1RM (50 % a 100 % de 5 en 5). */
export function percentTable(oneRm: number): Array<{ pct: number; weight: number }> {
  const rows: Array<{ pct: number; weight: number }> = []
  for (let pct = 100; pct >= 50; pct -= 5) rows.push({ pct, weight: (oneRm * pct) / 100 })
  return rows
}
