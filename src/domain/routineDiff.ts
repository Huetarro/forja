import type { SetType } from '@/db/schema'

export interface StructureItem {
  exerciseId: string
  sets: readonly SetType[]
  /** bajadas o mini-series de cada serie (solo informativo, no cuenta como cambio) */
  extras?: readonly number[]
  supersetId?: string
}

/** Convierte los ids de superserie en un patrón comparable (índice del grupo). */
function supersetPattern(items: readonly StructureItem[]): Array<number | null> {
  const map = new Map<string, number>()
  return items.map((it) => {
    if (!it.supersetId) return null
    if (!map.has(it.supersetId)) map.set(it.supersetId, map.size)
    return map.get(it.supersetId) ?? null
  })
}

/** ¿Cambió la estructura (ejercicios, orden, número o tipo de series, superseries)? */
export function structureChanged(
  a: readonly StructureItem[],
  b: readonly StructureItem[],
): boolean {
  if (a.length !== b.length) return true
  for (let i = 0; i < a.length; i++) {
    const x = a[i]
    const y = b[i]
    if (!x || !y || x.exerciseId !== y.exerciseId) return true
    if (x.sets.length !== y.sets.length || x.sets.some((t, k) => t !== y.sets[k])) return true
  }
  const pa = supersetPattern(a)
  const pb = supersetPattern(b)
  return pa.some((v, i) => v !== pb[i])
}

/** % de cambio respecto al valor anterior (null si no hay referencia). */
export function percentChange(current: number, previous: number | null | undefined): number | null {
  if (previous === null || previous === undefined || previous === 0) return null
  return ((current - previous) / previous) * 100
}
