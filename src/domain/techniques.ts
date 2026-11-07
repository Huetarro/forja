/** Técnicas, leyenda y formatos de objetivo/descanso (funciones puras). */
import type { ExerciseMetric, SetType, TargetRange } from '@/db/schema'
import { DEFAULT_EXTRAS, hasExtras } from './setTypes'

export type TechniqueKey = 'DS' | 'RP' | 'NEG' | 'PAUSA'

/** Leyenda tal como la escribió Dani. */
export const LEGEND = {
  DS: 'Dropset: al fallo, bajas un 20-30% del peso y sigues sin descanso hasta el fallo',
  DSx2: 'Dos bajadas de peso seguidas',
  RP: 'Rest-pause: al fallo, descansas 15 s y sacas reps extra; repítelo 2 veces',
  NEG: 'Negativa lenta: bajada de 3-4 s en todas las reps',
  PAUSA: '1-2 s apretando en la contracción',
} as const

export const RIR_NOTE = '1-2 reps en reserva, salvo la última con técnica (al fallo)'
export const RP_REST_NOTE = 'descansa 15 s'

export interface TechniqueChip {
  key: TechniqueKey
  /** texto del chip: "DS", "DS x2", "RP", "NEG", "PAUSA" */
  label: string
  /** detalle opcional (p. ej. "abajo 2 s, estirado") */
  detail?: string
  /** explicación de la leyenda */
  legend: string
}

export interface PlanLike {
  sets: readonly SetType[]
  extras?: readonly number[]
  negative?: boolean
  pause?: string
}

/** Bajadas o mini-series predefinidas de la serie `i` (0 si el tipo no lleva). */
export function extrasAt(plan: Pick<PlanLike, 'sets' | 'extras'>, i: number): number {
  const t = plan.sets[i]
  if (!t || !hasExtras(t)) return 0
  return plan.extras?.[i] || DEFAULT_EXTRAS[t] || 0
}

function dsChip(n: number): TechniqueChip {
  return {
    key: 'DS',
    label: n <= 1 ? 'DS' : `DS x${n}`,
    legend:
      n <= 1
        ? LEGEND.DS
        : `${LEGEND.DS}. DS x${n}: ${n === 2 ? LEGEND.DSx2 : `${n} bajadas de peso seguidas`}.`,
  }
}

/** Chips de técnica de un ejercicio (sin repetir). */
export function techniqueChips(plan: PlanLike): TechniqueChip[] {
  const out: TechniqueChip[] = []
  const seen = new Set<string>()
  const push = (c: TechniqueChip) => {
    if (seen.has(c.label)) return
    seen.add(c.label)
    out.push(c)
  }
  plan.sets.forEach((t, i) => {
    if (t === 'dropset') push(dsChip(extrasAt(plan, i)))
    if (t === 'restpause') push({ key: 'RP', label: 'RP', legend: LEGEND.RP })
  })
  if (plan.negative) push({ key: 'NEG', label: 'NEG', legend: LEGEND.NEG })
  if (plan.pause !== undefined)
    push({
      key: 'PAUSA',
      label: 'PAUSA',
      detail: plan.pause.trim() || undefined,
      legend: LEGEND.PAUSA,
    })
  return out
}

/** 150 → "2:30"; 45 → "0:45". */
export function formatRest(sec: number): string {
  const s = Math.max(0, Math.round(sec))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

/** "2:30" → 150; "90" → 90 (segundos); "" o inválido → undefined. */
export function parseRest(text: string): number | undefined {
  const t = text.trim()
  if (!t) return undefined
  const m = /^(\d{1,2}):([0-5]\d)$/.exec(t)
  if (m) return Number(m[1]) * 60 + Number(m[2])
  if (/^\d{1,3}$/.test(t)) return Number(t)
  return undefined
}

/** "6-10 reps", "12 reps", "30-45 s". */
export function formatTarget(target: TargetRange, metric: ExerciseMetric = 'reps'): string {
  const range = target.min === target.max ? `${target.max}` : `${target.min}-${target.max}`
  return metric === 'segundos' ? `${range} s` : `${range} reps`
}

/** "6-10" → {6,10}; "12" → {12,12}; inválido → undefined. */
export function parseTarget(text: string): TargetRange | undefined {
  const m = /^\s*(\d{1,3})\s*(?:[-–]\s*(\d{1,3}))?\s*$/.exec(text)
  if (!m) return undefined
  const a = Number(m[1])
  const b = m[2] === undefined ? a : Number(m[2])
  if (a <= 0 || b <= 0) return undefined
  return { min: Math.min(a, b), max: Math.max(a, b) }
}

/** Línea discreta: "6-10 reps · desc. 2:30" (en superseries: "desc. 1:30 tras la pareja"). */
export function planLine(
  plan: { target?: TargetRange; restSec?: number },
  metric: ExerciseMetric = 'reps',
  restAfterPair = false,
): string {
  const parts: string[] = []
  if (plan.target) parts.push(formatTarget(plan.target, metric))
  if (plan.restSec)
    parts.push(`desc. ${formatRest(plan.restSec)}${restAfterPair ? ' tras la pareja' : ''}`)
  return parts.join(' · ')
}
