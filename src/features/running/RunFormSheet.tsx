import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Chip, Group, Row, TextArea } from '@/components/ui/Form'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { createRun, deleteRun, updateRun } from '@/db/runs'
import type { Run, RunSurface, RunType } from '@/db/schema'
import { RUN_TYPES } from '@/lib/runTypes'
import { todayLocal } from '@/domain/dates'
import { formatPace, hmsToSeconds, paceSecPerKm, secondsToHms } from '@/domain/pace'
import { parseDecimal } from '@/domain/units'
import { Scale } from '@/features/entreno/ClosingForm'
import { confirm, toast } from '@/stores/ui'

const FORM_ID = 'run-form'

interface Props {
  open: boolean
  onClose: () => void
  run?: Run
  /** tipo ya puesto al registrar (p. ej. desde "Te toca hoy") */
  initialType?: RunType
}

/** Registrar o editar una carrera. */
export function RunFormSheet({ open, onClose, run, initialType }: Props) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={run ? 'Editar carrera' : 'Registrar carrera'}
      tall
      action={
        <button
          type="submit"
          form={FORM_ID}
          className="min-h-touch px-3 text-body font-semibold text-accent-ink"
        >
          Guardar
        </button>
      }
    >
      <RunForm run={run} initialType={initialType} onClose={onClose} />
    </BottomSheet>
  )
}

const str = (n: number | undefined) => (n === undefined ? '' : String(n).replace('.', ','))

function RunForm({
  run,
  initialType,
  onClose,
}: {
  run?: Run
  initialType?: RunType
  onClose: () => void
}) {
  const init = secondsToHms(run?.durationSec ?? 0)
  const [date, setDate] = useState(run?.date ?? todayLocal())
  const [km, setKm] = useState(str(run?.distanceKm))
  const [h, setH] = useState(init.h)
  const [m, setM] = useState(init.m)
  const [s, setS] = useState(init.s)
  const [hr, setHr] = useState(str(run?.avgHeartRate))
  const [kcal, setKcal] = useState(str(run?.calories))
  const [elev, setElev] = useState(str(run?.elevationM))
  const [type, setType] = useState<RunType>(run?.type ?? initialType ?? 'rodaje')
  const [surface, setSurface] = useState<RunSurface>(run?.surface ?? 'exterior')
  const [feeling, setFeeling] = useState<number | undefined>(run?.feeling)
  const [notes, setNotes] = useState(run?.notes ?? '')

  const distance = parseDecimal(km)
  const seconds = hmsToSeconds(h, m, s)
  const pace = distance ? paceSecPerKm(seconds, distance) : null
  const int = (v: string) => {
    const n = parseDecimal(v)
    return n === null ? undefined : Math.round(n)
  }

  const save = async () => {
    if (!distance || distance <= 0) return toast('Indica la distancia')
    if (seconds <= 0) return toast('Indica el tiempo')
    const data = {
      date,
      distanceKm: Math.round(distance * 100) / 100,
      durationSec: seconds,
      avgHeartRate: int(hr),
      calories: int(kcal),
      elevationM: int(elev),
      type,
      surface,
      feeling,
      notes: notes.trim(),
    }
    if (run) {
      await updateRun(run.id, data)
      toast('Carrera guardada')
    } else {
      await createRun(data)
      toast('Carrera registrada')
    }
    onClose()
  }

  const remove = async () => {
    if (!run) return
    const ok = await confirm({
      title: '¿Eliminar esta carrera?',
      confirmLabel: 'Eliminar',
      destructive: true,
    })
    if (!ok) return
    const undo = await deleteRun(run.id)
    onClose()
    toast('Carrera eliminada', undo)
  }

  return (
    <form
      id={FORM_ID}
      className="space-y-6 pt-2"
      onSubmit={(e) => {
        e.preventDefault()
        void save()
      }}
    >
      <div className="rounded-card bg-card px-4 py-4 text-center" aria-live="polite">
        <div className="tnum font-display text-large font-bold tracking-tight text-chart-run">
          {formatPace(pace, false)}
        </div>
        <div className="text-footnote text-ink-2">Ritmo (min/km)</div>
      </div>

      <Group>
        <Row label="Fecha" htmlFor="run-date">
          <input
            id="run-date"
            type="date"
            value={date}
            max={todayLocal()}
            onChange={(e) => e.target.value && setDate(e.target.value)}
            className="bg-transparent text-right text-ink-2 outline-none"
          />
        </Row>
        <Row label="Distancia" htmlFor="run-km">
          <span className="flex items-center gap-1.5 text-ink-2">
            <input
              id="run-km"
              inputMode="decimal"
              value={km}
              onChange={(e) => setKm(e.target.value.replace(/[^0-9.,]/g, ''))}
              placeholder="0,00"
              className="tnum w-20 bg-transparent text-right font-semibold text-ink outline-none"
            />
            km
          </span>
        </Row>
        <div className="flex min-h-12 items-center justify-between gap-3 px-4 py-1.5">
          <span className="text-body">Tiempo</span>
          <span className="tnum flex items-center gap-1 text-body font-semibold">
            <TimeWheel label="Horas" value={h} max={9} onChange={setH} />:
            <TimeWheel label="Minutos" value={m} max={59} onChange={setM} />:
            <TimeWheel label="Segundos" value={s} max={59} onChange={setS} />
          </span>
        </div>
      </Group>

      <section>
        <h3 className="mb-2 px-4 text-footnote font-medium text-ink-2">Tipo</h3>
        <div className="flex flex-wrap gap-2 px-1">
          {RUN_TYPES.map((t) => (
            <Chip key={t.value} selected={type === t.value} onClick={() => setType(t.value)}>
              {t.label}
            </Chip>
          ))}
        </div>
      </section>

      <SegmentedControl
        label="Superficie"
        value={surface}
        onChange={setSurface}
        options={[
          { value: 'exterior', label: 'Exterior' },
          { value: 'cinta', label: 'Cinta' },
        ]}
      />

      <Group>
        <NumRow id="run-hr" label="Pulsaciones medias" unit="ppm" value={hr} onChange={setHr} />
        <NumRow id="run-kcal" label="Calorías" unit="kcal" value={kcal} onChange={setKcal} />
        <NumRow id="run-elev" label="Desnivel" unit="m" value={elev} onChange={setElev} />
      </Group>

      <Scale label="Sensaciones" value={feeling} onChange={setFeeling} />

      <Group title="Notas">
        <TextArea
          aria-label="Notas de la carrera"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={1000}
          placeholder="Ruta, clima, molestias…"
        />
      </Group>

      {run && (
        <Group>
          <button
            type="button"
            onClick={() => void remove()}
            className="flex min-h-12 w-full items-center gap-3 px-4 text-body text-danger"
          >
            <Trash2 size={20} /> Eliminar carrera
          </button>
        </Group>
      )}
    </form>
  )
}

/** Selector nativo (en iOS, rueda) para horas, minutos o segundos. */
function TimeWheel({
  label,
  value,
  max,
  onChange,
}: {
  label: string
  value: number
  max: number
  onChange: (v: number) => void
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="h-10 appearance-none rounded-sm bg-fill px-2 text-center font-semibold outline-none"
    >
      {Array.from({ length: max + 1 }, (_, i) => (
        <option key={i} value={i}>
          {max > 9 ? String(i).padStart(2, '0') : i}
        </option>
      ))}
    </select>
  )
}

function NumRow({
  id,
  label,
  unit,
  value,
  onChange,
}: {
  id: string
  label: string
  unit: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <Row label={label} htmlFor={id}>
      <span className="flex items-center gap-1.5 text-ink-2">
        <input
          id={id}
          inputMode="numeric"
          pattern="[0-9]*"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
          placeholder="—"
          className="tnum w-16 bg-transparent text-right font-semibold text-ink outline-none"
        />
        {unit}
      </span>
    </Row>
  )
}
