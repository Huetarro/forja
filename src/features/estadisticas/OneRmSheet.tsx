import { useState } from 'react'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { epley, percentTable } from '@/domain/oneRm'
import { formatNumber, parseDecimal } from '@/domain/units'

/** Calculadora de 1RM: peso y reps → 1RM estimado y tabla de porcentajes. */
export function OneRmSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Calculadora de 1RM" tall>
      <Calculator />
    </BottomSheet>
  )
}

function Calculator() {
  const [w, setW] = useState('')
  const [r, setR] = useState('')
  const weight = parseDecimal(w)
  const reps = parseDecimal(r)
  const rm = weight !== null && reps !== null ? epley(weight, Math.round(reps)) : null
  const outOfRange = reps !== null && (reps < 1 || reps > 12)

  return (
    <div className="space-y-5 pt-2">
      <div className="grid grid-cols-2 gap-3">
        <label className="rounded-card bg-card p-3">
          <span className="block text-footnote text-ink-2">Peso</span>
          <input
            inputMode="decimal"
            value={w}
            onChange={(e) => setW(e.target.value.replace(/[^0-9.,]/g, ''))}
            placeholder="0"
            aria-label="Peso levantado"
            className="tnum w-full bg-transparent text-title1 font-bold outline-none"
          />
        </label>
        <label className="rounded-card bg-card p-3">
          <span className="block text-footnote text-ink-2">Repeticiones</span>
          <input
            inputMode="numeric"
            pattern="[0-9]*"
            value={r}
            onChange={(e) => setR(e.target.value.replace(/\D/g, ''))}
            placeholder="0"
            aria-label="Repeticiones"
            className="tnum w-full bg-transparent text-title1 font-bold outline-none"
          />
        </label>
      </div>

      <div className="rounded-card bg-accent p-4 text-on-accent" aria-live="polite">
        <div className="text-footnote font-semibold opacity-80">1RM estimado (Epley)</div>
        <div className="tnum font-display text-hero font-bold tracking-tight">
          {rm === null ? '—' : formatNumber(rm, 1)}
        </div>
      </div>
      {outOfRange && (
        <p className="px-1 text-footnote text-ink-2">
          La estimación solo es fiable entre 1 y 12 repeticiones.
        </p>
      )}

      {rm !== null && (
        <table className="w-full overflow-hidden rounded-card bg-card text-body">
          <thead>
            <tr className="text-footnote text-ink-2">
              <th className="px-4 py-2 text-left font-medium">% del 1RM</th>
              <th className="px-4 py-2 text-right font-medium">Peso</th>
            </tr>
          </thead>
          <tbody className="tnum divide-y divide-sep">
            {percentTable(rm).map((row) => (
              <tr key={row.pct}>
                <td className="px-4 py-2">{row.pct} %</td>
                <td className="px-4 py-2 text-right font-semibold">
                  {formatNumber(row.weight, 1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
