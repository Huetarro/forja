import { useState } from 'react'
import { Info } from 'lucide-react'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { RIR_NOTE, type TechniqueChip } from '@/domain/techniques'
import { cn } from '@/lib/cn'

const CHIP_CLS: Record<TechniqueChip['key'], string> = {
  DS: 'bg-accent-soft text-accent-ink',
  RP: 'bg-rp-soft text-rp',
  NEG: 'bg-neg-soft text-neg',
  PAUSA: 'bg-fill text-ink',
}

/** Chips DS, DS x2, RP, NEG y PAUSA. Al tocarlos se abre la leyenda. */
export function TechniqueChips({ chips }: { chips: readonly TechniqueChip[] }) {
  const [open, setOpen] = useState<TechniqueChip | null>(null)
  if (chips.length === 0) return null
  return (
    <>
      {chips.map((c) => (
        <button
          type="button"
          key={c.label}
          onClick={() => setOpen(c)}
          aria-label={`${c.label}${c.detail ? `: ${c.detail}` : ''}. Toca para ver la explicación`}
          className={cn(
            'flex min-h-6 items-center rounded-full px-2 py-0.5 text-caption font-bold',
            CHIP_CLS[c.key],
          )}
        >
          {c.label}
          {c.detail && <span className="ml-1 font-medium">· {c.detail}</span>}
        </button>
      ))}
      <BottomSheet open={open !== null} onClose={() => setOpen(null)} title={open?.label ?? ''}>
        {open && <TechniqueInfo chip={open} />}
      </BottomSheet>
    </>
  )
}

function TechniqueInfo({ chip }: { chip: TechniqueChip }) {
  return (
    <div className="space-y-3 pt-2">
      <p className="rounded-card bg-card p-4 text-body">{chip.legend}</p>
      {chip.detail && (
        <p className="px-1 text-subhead">
          <span className="font-semibold">En este ejercicio: </span>
          {chip.detail}
        </p>
      )}
      <p className="flex gap-2 px-1 text-footnote text-ink-2">
        <Info size={16} className="mt-0.5 shrink-0" aria-hidden />
        Todas las series: {RIR_NOTE}.
      </p>
    </div>
  )
}
