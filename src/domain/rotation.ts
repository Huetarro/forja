export interface RotationRoutine {
  id: string
  programId?: string
  order: number
  archived: boolean
}

export interface RotationProgram {
  id: string
  order: number
  archived: boolean
}

/**
 * Rutina sugerida para hoy (no hay días fijos): la siguiente, en el orden de su
 * programa, a la última rutina realizada. Si la última era la última del programa,
 * vuelve a la primera. Sin historial: la primera rutina del primer programa.
 */
export function suggestNextRoutine(
  routines: readonly RotationRoutine[],
  programs: readonly RotationProgram[],
  lastRoutineId: string | undefined,
): string | undefined {
  const archivedPrograms = new Set(programs.filter((p) => p.archived).map((p) => p.id))
  const active = routines.filter(
    (r) => !r.archived && !(r.programId && archivedPrograms.has(r.programId)),
  )
  if (active.length === 0) return undefined

  const programOrder = new Map(programs.map((p) => [p.id, p.order]))
  const sorted = active.slice().sort((a, b) => {
    const pa = a.programId ? (programOrder.get(a.programId) ?? 0) : Number.MAX_SAFE_INTEGER
    const pb = b.programId ? (programOrder.get(b.programId) ?? 0) : Number.MAX_SAFE_INTEGER
    return pa - pb || a.order - b.order
  })

  const last = routines.find((r) => r.id === lastRoutineId)
  if (!last) return sorted[0]?.id

  const siblings = sorted.filter((r) => r.programId === last.programId)
  if (siblings.length === 0) return sorted[0]?.id
  const next = siblings.find((r) => r.order > last.order)
  return (next ?? siblings[0])?.id
}
