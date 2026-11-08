import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { Switch } from '@/components/ui/Form'
import { Select } from '@/components/ui/Select'
import type { ExerciseMetric, RoutineExercise } from '@/db/schema'
import { hasExtras, SET_TYPE_LABEL } from '@/domain/setTypes'
import type { SupersetPosition } from '@/domain/supersets'
import { extrasAt, formatRest } from '@/domain/techniques'

export type PlanPatch = Partial<
  Pick<RoutineExercise, 'sets' | 'extras' | 'target' | 'restSec' | 'negative' | 'pause'>
>

interface Props {
  item: RoutineExercise
  metric: ExerciseMetric
  position: SupersetPosition
  onChange: (patch: PlanPatch) => void
}

const REST_OPTIONS = Array.from({ length: 20 }, (_, i) => (i + 1) * 15)

/** Objetivo (rango), descanso, bajadas/mini-series predefinidas, NEG y PAUSA. */
export function RoutinePlanFields({ item, metric, position, onChange }: Props) {
  const unit = metric === 'segundos' ? 's' : 'reps'
  const inPairNotLast = position === 'start' || position === 'middle'
  // Rango pendiente: combina bien mínimo y máximo aunque la base tarde en devolverlos
  const [t, setT] = useState(item.target)
  const [propT, setPropT] = useState(item.target)
  if (item.target?.min !== propT?.min || item.target?.max !== propT?.max) {
    setPropT(item.target)
    setT(item.target)
  }

  const setTarget = (min: number | null, max: number | null) => {
    if (min === null && max === null) {
      setT(undefined)
      return onChange({ target: undefined })
    }
    const a = min ?? max ?? 1
    const b = max ?? min ?? a
    const target = { min: Math.min(a, b), max: Math.max(a, b) }
    setT(target)
    onChange({ target })
  }

  const setExtras = (i: number, n: number) => {
    const extras = item.sets.map((_, k) => (k === i ? n : extrasAt(item, k)))
    onChange({ extras })
  }

  return (
    <div className="mt-3 space-y-2.5 rounded-md bg-fill/60 p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-subhead">Objetivo</span>
        <span className="flex items-center gap-1.5 text-subhead text-ink-2">
          <RangeInput
            label="Objetivo mínimo"
            value={t?.min ?? null}
            onCommit={(v) => setTarget(v, t?.max ?? null)}
          />
          –
          <RangeInput
            label="Objetivo máximo"
            value={t?.max ?? null}
            onCommit={(v) => setTarget(t?.min ?? null, v)}
          />
          {unit}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-subhead">Descanso</span>
        {inPairNotLast ? (
          <span className="text-footnote text-ink-2">tras la pareja (en el último)</span>
        ) : (
          <Select
            aria-label="Descanso"
            value={item.restSec ?? ''}
            onChange={(e) =>
              onChange({ restSec: e.target.value ? Number(e.target.value) : undefined })
            }
          >
            <option value="">Sin indicar</option>
            {REST_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {formatRest(s)}
                {position === 'end' ? ' tras la pareja' : ''}
              </option>
            ))}
          </Select>
        )}
      </div>

      {item.sets.map((type, i) =>
        hasExtras(type) ? (
          <div key={i} className="flex items-center justify-between gap-2">
            <span className="text-subhead">
              Serie {i + 1} · {SET_TYPE_LABEL[type]}
            </span>
            <Stepper
              label={type === 'dropset' ? 'bajadas' : 'mini-series'}
              value={extrasAt(item, i)}
              onChange={(n) => setExtras(i, n)}
            />
          </div>
        ) : null,
      )}

      <div className="flex items-center justify-between gap-2">
        <span className="text-subhead">
          Negativa (NEG) <span className="text-ink-2">· todas las series</span>
        </span>
        <Switch
          label="Negativa en todas las series"
          checked={item.negative === true}
          onChange={(negative) => onChange({ negative: negative || undefined })}
        />
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-subhead">Pausa (PAUSA)</span>
        <Switch
          label="Pausa"
          checked={item.pause !== undefined}
          onChange={(on) => onChange({ pause: on ? '' : undefined })}
        />
      </div>
      {item.pause !== undefined && (
        <input
          key={`pause-${item.id}`}
          defaultValue={item.pause}
          onBlur={(e) => {
            const v = e.target.value.trim()
            if (v !== item.pause) onChange({ pause: v })
          }}
          placeholder="Detalle (p. ej. abajo 2 s, estirado)"
          aria-label="Detalle de la pausa"
          maxLength={60}
          className="h-10 w-full rounded-md bg-card px-3 text-subhead outline-none placeholder:text-ink-2"
        />
      )}
    </div>
  )
}

function RangeInput({
  label,
  value,
  onCommit,
}: {
  label: string
  value: number | null
  onCommit: (v: number | null) => void
}) {
  const [text, setText] = useState(value === null ? '' : String(value))
  const [last, setLast] = useState(value)
  const [focused, setFocused] = useState(false)
  // Si el valor cambia desde fuera (y no se está escribiendo aquí), se sincroniza
  if (value !== last && !focused) {
    setLast(value)
    setText(value === null ? '' : String(value))
  }
  return (
    <input
      aria-label={label}
      inputMode="numeric"
      pattern="[0-9]*"
      autoComplete="off"
      value={text}
      placeholder="—"
      onFocus={() => setFocused(true)}
      onChange={(e) => setText(e.target.value.replace(/\D/g, '').slice(0, 3))}
      onBlur={() => {
        setFocused(false)
        const v = text ? Number(text) : null
        const next = v && v > 0 ? v : null
        setLast(next)
        if (next !== value) onCommit(next)
      }}
      className="tnum h-9 w-12 rounded-md bg-card text-center text-body font-semibold text-ink outline-none"
    />
  )
}

function Stepper({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (n: number) => void
}) {
  return (
    <span className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
        aria-label={`Quitar ${label}`}
        className="grid size-8 place-items-center rounded-full bg-card disabled:opacity-30"
      >
        <Minus size={16} />
      </button>
      <span className="tnum min-w-20 text-center text-subhead">
        {value} {value === 1 ? label.replace(/s$/, '') : label}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(5, value + 1))}
        aria-label={`Añadir ${label}`}
        className="grid size-8 place-items-center rounded-full bg-card"
      >
        <Plus size={16} />
      </button>
    </span>
  )
}
