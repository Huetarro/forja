export type WeightUnit = 'kg' | 'lb'

export const LB_TO_KG = 0.45359237

export function toKg(value: number, unit: WeightUnit): number {
  return unit === 'kg' ? value : value * LB_TO_KG
}

export function convertWeight(value: number, from: WeightUnit, to: WeightUnit): number {
  if (from === to) return value
  return from === 'lb' ? value * LB_TO_KG : value / LB_TO_KG
}

/** Redondea a 2 decimales (para guardar pesos convertidos). */
export function round2(n: number): number {
  return Math.round(n * 100) / 100
}

/** Número en formato español: 82,5 · 1250 */
export function formatNumber(n: number, maxDecimals = 1): string {
  return new Intl.NumberFormat('es-ES', { maximumFractionDigits: maxDecimals }).format(n)
}

/** Interpreta "82,5" o "82.5". Devuelve null si no es un número válido. */
export function parseDecimal(s: string): number | null {
  const t = s.trim().replace(',', '.')
  if (t === '') return null
  const n = Number(t)
  return Number.isFinite(n) ? n : null
}
