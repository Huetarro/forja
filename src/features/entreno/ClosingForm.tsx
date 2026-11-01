import { useState } from 'react'
import { Group, Row, TextArea } from '@/components/ui/Form'
import type { ClosingData } from '@/db/workouts'
import { parseDecimal } from '@/domain/units'
import { cn } from '@/lib/cn'

interface Props {
  id: string
  initial?: Partial<ClosingData>
  showBodyWeight?: boolean
  onSubmit: (data: ClosingData) => void
}

const str = (n: number | undefined) => (n === undefined ? '' : String(n).replace('.', ','))

/** Datos de cierre, todos opcionales. */
export function ClosingForm({ id, initial, showBodyWeight = true, onSubmit }: Props) {
  const [hr, setHr] = useState(str(initial?.avgHeartRate))
  const [kcal, setKcal] = useState(str(initial?.calories))
  const [rating, setRating] = useState<number | undefined>(initial?.rating)
  const [energy, setEnergy] = useState<number | undefined>(initial?.energy)
  const [bw, setBw] = useState(str(initial?.bodyWeight))
  const [notes, setNotes] = useState(initial?.notes ?? '')

  const int = (s: string) => {
    const n = parseDecimal(s)
    return n === null ? undefined : Math.round(n)
  }

  return (
    <form
      id={id}
      className="space-y-6 pt-2"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit({
          avgHeartRate: int(hr),
          calories: int(kcal),
          rating,
          energy,
          bodyWeight: parseDecimal(bw) ?? undefined,
          notes: notes.trim(),
        })
      }}
    >
      <p className="px-1 text-subhead text-ink-2">Todo es opcional. Rellena lo que quieras.</p>
      <Group>
        <Row label="Pulsaciones medias" htmlFor={`${id}-hr`}>
          <Unit>
            <input
              id={`${id}-hr`}
              inputMode="numeric"
              pattern="[0-9]*"
              value={hr}
              onChange={(e) => setHr(e.target.value.replace(/\D/g, ''))}
              placeholder="—"
              className={numCls}
            />
            ppm
          </Unit>
        </Row>
        <Row label="Calorías" htmlFor={`${id}-kcal`}>
          <Unit>
            <input
              id={`${id}-kcal`}
              inputMode="numeric"
              pattern="[0-9]*"
              value={kcal}
              onChange={(e) => setKcal(e.target.value.replace(/\D/g, ''))}
              placeholder="—"
              className={numCls}
            />
            kcal
          </Unit>
        </Row>
        {showBodyWeight && (
          <Row label="Peso corporal" htmlFor={`${id}-bw`}>
            <Unit>
              <input
                id={`${id}-bw`}
                inputMode="decimal"
                value={bw}
                onChange={(e) => setBw(e.target.value.replace(/[^0-9.,]/g, ''))}
                placeholder="—"
                className={numCls}
              />
              kg
            </Unit>
          </Row>
        )}
      </Group>

      <Scale label="Valoración del entreno" value={rating} onChange={setRating} />
      <Scale label="Energía" value={energy} onChange={setEnergy} />

      <Group title="Notas">
        <TextArea
          aria-label="Notas del entreno"
          placeholder="¿Cómo ha ido?"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={1000}
        />
      </Group>
    </form>
  )
}

const numCls = 'tnum w-16 bg-transparent text-right font-semibold outline-none'

function Unit({ children }: { children: React.ReactNode }) {
  return <span className="flex items-center gap-1.5 text-ink-2">{children}</span>
}

/** Escala 1-5 con botones grandes. */
export function Scale({
  label,
  value,
  onChange,
}: {
  label: string
  value: number | undefined
  onChange: (v: number | undefined) => void
}) {
  return (
    <section>
      <h3 className="mb-1.5 px-4 text-footnote font-medium text-ink-2">{label}</h3>
      <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            type="button"
            key={n}
            role="radio"
            aria-checked={value === n}
            aria-label={`${label}: ${n}`}
            onClick={() => onChange(value === n ? undefined : n)}
            className={cn(
              'tnum min-h-12 rounded-md text-body font-bold transition-colors',
              value === n ? 'bg-accent text-on-accent' : 'bg-card text-ink',
            )}
          >
            {n}
          </button>
        ))}
      </div>
    </section>
  )
}
