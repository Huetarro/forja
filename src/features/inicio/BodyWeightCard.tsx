import { useState } from 'react'
import { Minus, Plus, Scale, TrendingDown, TrendingUp } from 'lucide-react'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { updateDayLog, useBodyWeights } from '@/db/days'
import { bodyWeightSummary, stepWeight } from '@/domain/bodyWeight'
import { relativeDays, todayLocal } from '@/domain/dates'
import { formatNumber, parseDecimal } from '@/domain/units'
import { toast } from '@/stores/ui'

/** Tarjeta fija "Peso de hoy": último peso y tendencia; al tocarla se apunta en dos toques. */
export function BodyWeightCard() {
  const today = todayLocal()
  const points = useBodyWeights()
  const [open, setOpen] = useState(false)
  if (!points) return <div className="h-[76px] rounded-card bg-card" />

  const s = bodyWeightSummary(points, today)
  const shown = s.today ?? s.last?.value ?? null
  const change = s.change

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={
          s.today !== null
            ? `Peso de hoy: ${formatNumber(s.today, 1)} kg. Toca para editar`
            : 'Peso de hoy: sin apuntar. Toca para apuntarlo'
        }
        className="flex w-full items-center gap-3 rounded-card bg-card p-4 text-left active:bg-fill"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-fill text-ink-2">
          <Scale size={20} aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-footnote text-ink-2">Peso de hoy</span>
          <span className="tnum block text-title3 font-bold">
            {s.today !== null ? (
              `${formatNumber(s.today, 1)} kg`
            ) : (
              <span className="text-ink-2">Apuntar</span>
            )}
          </span>
          {s.today === null && s.last && (
            <span className="tnum block text-footnote text-ink-2">
              Último: {formatNumber(s.last.value, 1)} kg · {relativeDays(s.last.date, today)}
            </span>
          )}
        </span>
        {change && change.kg !== 0 && (
          <span className="tnum flex items-center gap-1 text-footnote font-semibold text-ink-2">
            {change.kg < 0 ? (
              <TrendingDown size={16} aria-hidden />
            ) : (
              <TrendingUp size={16} aria-hidden />
            )}
            {change.kg > 0 ? '+' : '−'}
            {formatNumber(Math.abs(change.kg), 1)} kg · {change.days} d
          </span>
        )}
      </button>

      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Peso de hoy"
        action={
          <button
            type="submit"
            form="today-weight"
            className="min-h-touch px-3 text-body font-semibold text-accent-ink"
          >
            Guardar
          </button>
        }
      >
        <WeightForm
          initial={shown}
          onSave={(kg) => {
            void updateDayLog(today, { bodyWeight: kg }).then(() => toast('Peso guardado'))
            setOpen(false)
          }}
        />
      </BottomSheet>
    </>
  )
}

const fmt = (n: number | null) => (n === null ? '' : formatNumber(n, 1))

/** Formulario: el último peso ya puesto, ±0,1 kg y opción de teclearlo. */
function WeightForm({ initial, onSave }: { initial: number | null; onSave: (kg: number) => void }) {
  const [text, setText] = useState(fmt(initial))
  const value = parseDecimal(text)
  const step = (d: number) => setText(fmt(stepWeight(value ?? initial ?? 0, d)))

  return (
    <form
      id="today-weight"
      className="pt-4 pb-2"
      onSubmit={(e) => {
        e.preventDefault()
        if (value === null || value <= 0) {
          toast('Escribe tu peso')
          return
        }
        onSave(Math.round(value * 10) / 10)
      }}
    >
      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => step(-0.1)}
          aria-label="Restar 0,1 kg"
          className="grid size-14 place-items-center rounded-full bg-card text-ink active:bg-fill"
        >
          <Minus size={22} />
        </button>
        <label className="flex items-baseline gap-1.5">
          <span className="sr-only">Peso corporal en kg</span>
          <input
            inputMode="decimal"
            autoComplete="off"
            value={text}
            placeholder="—"
            onChange={(e) => setText(e.target.value.replace(/[^0-9.,]/g, ''))}
            className="tnum w-32 bg-transparent text-center text-[44px] leading-none font-bold outline-none"
          />
          <span className="text-title3 text-ink-2">kg</span>
        </label>
        <button
          type="button"
          onClick={() => step(0.1)}
          aria-label="Sumar 0,1 kg"
          className="grid size-14 place-items-center rounded-full bg-card text-ink active:bg-fill"
        >
          <Plus size={22} />
        </button>
      </div>
      <p className="mt-4 text-center text-footnote text-ink-2">
        {initial !== null
          ? 'Ajusta con − y + o toca el número para escribirlo.'
          : 'Toca el número para escribir tu peso.'}
      </p>
    </form>
  )
}
