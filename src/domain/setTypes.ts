import type { SetType } from '@/db/schema'

export const SET_TYPES: SetType[] = ['normal', 'calentamiento', 'dropset', 'negativa']

export const SET_TYPE_LABEL: Record<SetType, string> = {
  normal: 'Normal',
  calentamiento: 'Calentamiento',
  dropset: 'Dropset',
  negativa: 'Negativa',
}

/** Letra del chip: C, D, N; la normal muestra el número de serie. */
export const SET_TYPE_SHORT: Record<SetType, string> = {
  normal: '',
  calentamiento: 'C',
  dropset: 'D',
  negativa: 'N',
}

export function nextSetType(t: SetType): SetType {
  const i = SET_TYPES.indexOf(t)
  return SET_TYPES[(i + 1) % SET_TYPES.length] ?? 'normal'
}

/** Series efectivas: normal, dropset y negativa (el calentamiento no cuenta). */
export function isEffective(t: SetType): boolean {
  return t !== 'calentamiento'
}

/** "4 series · 1 calentamiento · 1 dropset" */
export function setsSummary(sets: readonly SetType[]): string {
  const eff = sets.filter(isEffective).length
  const parts = [`${eff} ${eff === 1 ? 'serie' : 'series'}`]
  const warm = sets.filter((s) => s === 'calentamiento').length
  const drop = sets.filter((s) => s === 'dropset').length
  const neg = sets.filter((s) => s === 'negativa').length
  if (warm) parts.push(`${warm} calent.`)
  if (drop) parts.push(`${drop} dropset`)
  if (neg) parts.push(`${neg} ${neg === 1 ? 'negativa' : 'negativas'}`)
  return parts.join(' · ')
}
