export interface Pause {
  /** epoch ms */
  start: number
  /** epoch ms; undefined si la pausa sigue activa */
  end?: number
}

/**
 * Segundos activos de un entreno, calculados con marcas de tiempo para que
 * sigan siendo correctos aunque la app se cierre o el móvil se bloquee.
 */
export function activeSeconds(
  startedAt: number,
  pauses: Pause[],
  now: number,
  endedAt?: number,
): number {
  const end = endedAt ?? now
  let paused = 0
  for (const p of pauses) {
    const ps = Math.max(p.start, startedAt)
    const pe = Math.min(p.end ?? end, end)
    if (pe > ps) paused += pe - ps
  }
  return Math.max(0, Math.floor((end - startedAt - paused) / 1000))
}

export function isPaused(pauses: Pause[]): boolean {
  const last = pauses[pauses.length - 1]
  return last !== undefined && last.end === undefined
}

/** hh:mm:ss (o m:ss si `compact` y dura menos de una hora). */
export function formatClock(totalSeconds: number, compact = false): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  if (compact && h === 0) return `${m}:${pad(sec)}`
  return `${pad(h)}:${pad(m)}:${pad(sec)}`
}

/** "1 h 05 min" · "42 min" */
export function formatDuration(totalSeconds: number): string {
  const m = Math.round(totalSeconds / 60)
  const h = Math.floor(m / 60)
  const mm = m % 60
  if (h === 0) return `${mm} min`
  return `${h} h ${String(mm).padStart(2, '0')} min`
}
