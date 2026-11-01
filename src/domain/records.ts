import type { Side } from '@/db/schema'
import { epley } from './oneRm'
import { isEffectiveSet, volume, type SetLike } from './volume'

export type RecordKind = 'peso' | '1rm' | 'reps' | 'volumen'

export const RECORD_LABEL: Record<RecordKind, string> = {
  peso: 'Peso máximo',
  '1rm': '1RM estimado',
  reps: 'Más reps con ese peso',
  volumen: 'Volumen en una sesión',
}

export interface ExerciseBests {
  maxWeight: number
  maxOneRm: number
  /** peso → máximo de reps hechas con ese peso */
  repsAtWeight: Map<number, number>
  maxSessionVolume: number
}

/** Una sesión de un ejercicio: sus series. */
export type Session = readonly SetLike[]

const bySide = (sets: Session, side: Side | undefined) =>
  sets.filter((s) => (side ? s.side === side : true))

/**
 * Mejores marcas de un ejercicio en un historial de sesiones (por lado si es unilateral).
 * Devuelve null si no hay ninguna serie efectiva: sin historial no hay récords que batir.
 */
export function bestsFromSessions(sessions: readonly Session[], side?: Side): ExerciseBests | null {
  const b: ExerciseBests = {
    maxWeight: 0,
    maxOneRm: 0,
    repsAtWeight: new Map(),
    maxSessionVolume: 0,
  }
  let any = false
  for (const session of sessions) {
    const sets = bySide(session, side)
    for (const s of sets) {
      if (!isEffectiveSet(s)) continue
      any = true
      b.maxWeight = Math.max(b.maxWeight, s.weight)
      const rm = epley(s.weight, s.reps)
      if (rm !== null) b.maxOneRm = Math.max(b.maxOneRm, rm)
      b.repsAtWeight.set(s.weight, Math.max(b.repsAtWeight.get(s.weight) ?? 0, s.reps))
    }
    b.maxSessionVolume = Math.max(b.maxSessionVolume, volume(sets))
  }
  return any ? b : null
}

/** Récords que bate una serie concreta frente a las mejores marcas (sin el de volumen). */
export function setRecords(bests: ExerciseBests | null, s: SetLike): RecordKind[] {
  if (!bests || !isEffectiveSet(s)) return []
  const kinds: RecordKind[] = []
  if (s.weight > bests.maxWeight) kinds.push('peso')
  const rm = epley(s.weight, s.reps)
  if (rm !== null && rm > bests.maxOneRm + 1e-9) kinds.push('1rm')
  const prevReps = bests.repsAtWeight.get(s.weight)
  if (prevReps !== undefined && s.reps > prevReps) kinds.push('reps')
  return kinds
}

/**
 * Récords que bate la serie `index` de la sesión actual, teniendo en cuenta el historial
 * y las series anteriores de esta misma sesión (para no repetir el aviso).
 */
export function liveSetRecords(
  history: readonly Session[],
  current: Session,
  index: number,
): RecordKind[] {
  const s = current[index]
  if (!s) return []
  const before = current.filter(
    (x, i) => i !== index && x.completed && x.side === s.side && i < index,
  )
  const bests = bestsFromSessions([...history, before], s.side)
  if (!bestsFromSessions(history, s.side)) return [] // primera vez: no hay récord
  const kinds = setRecords(bests, s)
  const prevBestVolume = bestsFromSessions(history, s.side)?.maxSessionVolume ?? 0
  const volBefore = volume(before)
  const volNow = volBefore + volume([s])
  if (volBefore <= prevBestVolume && volNow > prevBestVolume) kinds.push('volumen')
  return kinds
}

export interface SessionRecord {
  kind: RecordKind
  side?: Side
  value: number
  /** solo para 'reps' */
  weight?: number
}

/** Récords batidos en una sesión completa frente al historial anterior. */
export function sessionRecords(history: readonly Session[], current: Session): SessionRecord[] {
  const sides: Array<Side | undefined> = current.some((s) => s.side)
    ? (['izq', 'der'] as const).filter((sd) => current.some((s) => s.side === sd))
    : [undefined]
  const out: SessionRecord[] = []
  for (const side of sides) {
    const bests = bestsFromSessions(history, side)
    if (!bests) continue
    const sets = bySide(current, side).filter(isEffectiveSet)
    const maxW = Math.max(0, ...sets.map((s) => s.weight))
    if (maxW > bests.maxWeight) out.push({ kind: 'peso', side, value: maxW })
    const rms = sets.map((s) => epley(s.weight, s.reps) ?? 0)
    const maxRm = Math.max(0, ...rms)
    if (maxRm > bests.maxOneRm + 1e-9) out.push({ kind: '1rm', side, value: maxRm })
    let bestReps: SessionRecord | undefined
    for (const s of sets) {
      const prev = bests.repsAtWeight.get(s.weight)
      if (prev !== undefined && s.reps > prev && (!bestReps || s.weight > (bestReps.weight ?? 0)))
        bestReps = { kind: 'reps', side, value: s.reps, weight: s.weight }
    }
    if (bestReps) out.push(bestReps)
    const vol = volume(bySide(current, side))
    if (vol > bests.maxSessionVolume) out.push({ kind: 'volumen', side, value: vol })
  }
  return out
}
