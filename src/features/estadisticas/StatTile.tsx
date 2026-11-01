import { ArrowDown, ArrowUp } from 'lucide-react'
import { percentChange } from '@/domain/routineDiff'
import { formatNumber } from '@/domain/units'
import { cn } from '@/lib/cn'

interface Props {
  label: string
  value: string
  current?: number | null
  previous?: number | null
  /** true si subir es bueno (verde); false si es neutro */
  goodUp?: boolean
}

/** Indicador con su comparación con el periodo anterior (± %). */
export function StatTile({ label, value, current, previous, goodUp = true }: Props) {
  const pct =
    current !== undefined && current !== null && previous !== undefined && previous !== null
      ? percentChange(current, previous)
      : null
  return (
    <div className="rounded-card bg-card p-3.5">
      <div className="text-footnote text-ink-2">{label}</div>
      <div className="tnum mt-0.5 font-display text-title2 font-bold tracking-tight">{value}</div>
      {pct !== null && Math.abs(pct) >= 0.5 && (
        <div
          className={cn(
            'tnum mt-0.5 flex items-center gap-0.5 text-footnote font-semibold',
            goodUp && pct > 0 ? 'text-success' : 'text-ink-2',
          )}
          aria-label={`${pct > 0 ? 'Sube' : 'Baja'} un ${formatNumber(Math.abs(pct), 0)} % respecto al periodo anterior`}
        >
          {pct > 0 ? <ArrowUp size={13} aria-hidden /> : <ArrowDown size={13} aria-hidden />}
          {formatNumber(Math.abs(pct), 0)} %
        </div>
      )}
    </div>
  )
}

export function TileGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-6 mb-2 px-1 text-title3 font-bold">{children}</h2>
}
