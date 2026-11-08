import { useState } from 'react'
import { Check } from 'lucide-react'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { setAllSupplements, toggleSupplement, updateDayLog } from '@/db/days'
import type { DayLog, Supplement } from '@/db/schema'
import { parseDecimal } from '@/domain/units'
import { cn } from '@/lib/cn'

/** Chips de suplementos (tocar para marcar). */
export function SupplementChips({
  date,
  log,
  supplements,
  showAll = false,
}: {
  date: string
  log: DayLog
  supplements: Supplement[]
  showAll?: boolean
}) {
  const all = supplements.length > 0 && supplements.every((s) => log.supplements[s.id])
  return (
    <div className="flex flex-wrap gap-2">
      {supplements.map((s) => {
        const on = log.supplements[s.id] === true
        return (
          <button
            type="button"
            key={s.id}
            aria-pressed={on}
            onClick={() => void toggleSupplement(date, s.id)}
            className={cn(
              'flex min-h-10 items-center gap-1.5 rounded-full px-3.5 text-subhead font-medium transition-colors',
              on ? 'bg-accent text-on-accent' : 'bg-fill text-ink',
            )}
          >
            {on && <Check size={15} aria-hidden />}
            {s.name}
          </button>
        )
      })}
      {showAll && supplements.length > 1 && (
        <button
          type="button"
          onClick={() =>
            void setAllSupplements(
              date,
              supplements.map((s) => s.id),
              !all,
            )
          }
          className="min-h-10 px-2 text-subhead font-semibold text-accent-ink"
        >
          {all ? 'Desmarcar todos' : 'Marcar todos'}
        </button>
      )}
    </div>
  )
}

/** Alimentación: Bien / Mal (tocar de nuevo para quitar). */
export function NutritionToggle({ date, log }: { date: string; log: DayLog }) {
  return (
    <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Alimentación">
      {(['bien', 'mal'] as const).map((v) => {
        const on = log.nutrition === v
        return (
          <button
            type="button"
            key={v}
            role="radio"
            aria-checked={on}
            onClick={() => void updateDayLog(date, { nutrition: on ? null : v })}
            className={cn(
              'min-h-11 rounded-full text-subhead transition-colors',
              on && 'bg-accent text-on-accent',
              !on && 'bg-fill text-ink',
            )}
          >
            {v === 'bien' ? 'Bien' : 'Mal'}
          </button>
        )
      })}
    </div>
  )
}

/** Campo decimal que guarda al salir (sueño, peso). */
export function DecimalField({
  value,
  onSave,
  label,
  unit,
  id,
}: {
  value: number | undefined
  onSave: (v: number | undefined) => void
  label: string
  unit: string
  id: string
}) {
  const [text, setText] = useState(value === undefined ? '' : String(value).replace('.', ','))
  return (
    <span className="flex items-center gap-1.5 text-ink-2">
      <input
        id={id}
        aria-label={label}
        inputMode="decimal"
        value={text}
        placeholder="—"
        onChange={(e) => setText(e.target.value.replace(/[^0-9.,]/g, ''))}
        onBlur={() => onSave(parseDecimal(text) ?? undefined)}
        className="tnum w-16 bg-transparent text-right font-semibold text-ink outline-none"
      />
      {unit}
    </span>
  )
}

export function RestSegment({ date, log }: { date: string; log: DayLog }) {
  return (
    <SegmentedControl
      label="Tipo de día"
      value={log.rest ? 'rest' : 'normal'}
      options={[
        { value: 'normal', label: 'Día normal' },
        { value: 'rest', label: 'Descanso' },
      ]}
      onChange={(v) => void updateDayLog(date, { rest: v === 'rest' })}
    />
  )
}
