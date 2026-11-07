import type { SetType } from '@/db/schema'

export const SET_TYPES: SetType[] = ['normal', 'calentamiento', 'dropset', 'restpause', 'negativa']

export const SET_TYPE_LABEL: Record<SetType, string> = {
  normal: 'Normal',
  calentamiento: 'Calentamiento',
  dropset: 'Dropset',
  negativa: 'Negativa',
  restpause: 'Rest-pause',
}

/** Letra del chip: C, D, RP, N; la normal muestra el número de serie. */
export const SET_TYPE_SHORT: Record<SetType, string> = {
  normal: '',
  calentamiento: 'C',
  dropset: 'D',
  negativa: 'N',
  restpause: 'RP',
}

/** Clases de color del chip de cada tipo. */
export const SET_TYPE_CHIP: Record<SetType, string> = {
  normal: 'bg-fill text-ink',
  calentamiento: 'bg-warm-soft text-warm',
  dropset: 'bg-accent-soft text-accent-ink',
  negativa: 'bg-neg-soft text-neg',
  restpause: 'bg-rp-soft text-rp',
}

/** Mini-series por defecto de un rest-pause y bajadas por defecto de un dropset. */
export const DEFAULT_EXTRAS: Partial<Record<SetType, number>> = { dropset: 1, restpause: 2 }

/** El tipo lleva partes extra (bajadas o mini-series) que no suman volumen. */
export function hasExtras(t: SetType): boolean {
  return t === 'dropset' || t === 'restpause'
}

export function nextSetType(t: SetType): SetType {
  const i = SET_TYPES.indexOf(t)
  return SET_TYPES[(i + 1) % SET_TYPES.length] ?? 'normal'
}

/** Series efectivas: normal, dropset, rest-pause y negativa (el calentamiento no cuenta). */
export function isEffective(t: SetType): boolean {
  return t !== 'calentamiento'
}

/** "4 series · 1 calentamiento · 1 dropset" */
export function setsSummary(sets: readonly SetType[]): string {
  const eff = sets.filter(isEffective).length
  const parts = [`${eff} ${eff === 1 ? 'serie' : 'series'}`]
  const count = (t: SetType) => sets.filter((s) => s === t).length
  const warm = count('calentamiento')
  const drop = count('dropset')
  const rp = count('restpause')
  const neg = count('negativa')
  if (warm) parts.push(`${warm} calent.`)
  if (drop) parts.push(`${drop} dropset`)
  if (rp) parts.push(`${rp} rest-pause`)
  if (neg) parts.push(`${neg} ${neg === 1 ? 'negativa' : 'negativas'}`)
  return parts.join(' · ')
}
