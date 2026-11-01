/**
 * CSV para hojas de cálculo en español: separador ";" y decimales con coma.
 * Se abre bien en Excel, Numbers y Google Sheets con configuración española.
 */
export type Cell = string | number | boolean | null | undefined

export function cell(v: Cell): string {
  if (v === null || v === undefined) return ''
  if (typeof v === 'boolean') return v ? 'sí' : 'no'
  const s = typeof v === 'number' ? String(Math.round(v * 100) / 100).replace('.', ',') : v
  return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/** Tabla → texto CSV (con BOM para que Excel detecte UTF-8). */
export function toCsv(head: readonly string[], rows: ReadonlyArray<readonly Cell[]>): string {
  const lines = [head.map(cell).join(';'), ...rows.map((r) => r.map(cell).join(';'))]
  return '﻿' + lines.join('\r\n') + '\r\n'
}
