import { useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { BarChart3, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Group, Row } from '@/components/ui/Form'
import { NavBar, NavButton } from '@/components/ui/NavBar'
import { deleteWorkout, updateWorkout, useExerciseMap, useWorkout } from '@/db/workouts'
import { capitalize, longDate, todayLocal } from '@/domain/dates'
import { formatDuration } from '@/domain/timer'
import { confirm, toast } from '@/stores/ui'
import { formatCardio } from '@/domain/cardio'
import { CardioBlock } from '@/features/entreno/CardioBlock'
import { ClosingForm } from '@/features/entreno/ClosingForm'
import { WorkoutExercises } from '@/features/entreno/WorkoutExercises'
import { WorkoutSetsView } from './WorkoutSetsView'

/** Detalle de un entreno pasado, con modo edición (series, cierre, fecha y duración). */
export default function WorkoutDetailPage() {
  const { id } = useParams()
  const [params, setParams] = useSearchParams()
  const editing = params.get('editar') === '1'
  const bundle = useWorkout(id)
  const exercises = useExerciseMap()
  const navigate = useNavigate()

  if (bundle === null) return <NavBar backLabel="Historial" />
  if (!bundle || !exercises) return null
  const { workout } = bundle

  const setEditing = (v: boolean) => setParams(v ? { editar: '1' } : {}, { replace: true })

  const remove = async () => {
    const ok = await confirm({
      title: '¿Eliminar este entreno?',
      text: 'Se borrarán sus series y datos.',
      confirmLabel: 'Eliminar',
      destructive: true,
    })
    if (!ok) return
    const undo = await deleteWorkout(workout.id)
    navigate(-1)
    toast('Entreno eliminado', undo)
  }

  return (
    <>
      <NavBar
        backLabel="Atrás"
        action={
          <NavButton onClick={() => setEditing(!editing)}>{editing ? 'OK' : 'Editar'}</NavButton>
        }
      />
      <header className="pt-1 pb-5">
        <p className="text-footnote font-semibold text-ink-2">
          {capitalize(longDate(workout.date))}
        </p>
        <h1 className="font-display text-title1 font-bold tracking-tight">{workout.routineName}</h1>
        <p className="tnum text-subhead text-ink-2">{formatDuration(workout.activeSeconds)}</p>
      </header>

      {editing ? (
        <div className="space-y-6">
          <DateDurationEditor
            date={workout.date}
            seconds={workout.activeSeconds}
            onDate={(date) => void updateWorkout(workout.id, { date })}
            onSeconds={(activeSeconds) => void updateWorkout(workout.id, { activeSeconds })}
          />
          <section>
            <h2 className="mb-2 px-1 text-title3 font-bold">Series</h2>
            <p className="mb-3 px-1 text-footnote text-ink-2">
              Solo cuentan las series marcadas con ✓.
            </p>
            <WorkoutExercises bundle={bundle} exercises={exercises} mode="edit" />
          </section>
          <CardioBlock workout={workout} mode="edit" />
          <section>
            <h2 className="mb-2 px-1 text-title3 font-bold">Datos de cierre</h2>
            <ClosingForm
              id="edit-closing"
              initial={workout}
              onSubmit={(d) => {
                void updateWorkout(workout.id, d).then(() => toast('Datos guardados'))
              }}
            />
            <Button type="submit" form="edit-closing" block className="mt-4">
              Guardar datos de cierre
            </Button>
          </section>
          <Group>
            <button
              type="button"
              onClick={() => void remove()}
              className="flex min-h-12 w-full items-center gap-3 px-4 text-body text-danger"
            >
              <Trash2 size={20} /> Eliminar entreno
            </button>
          </Group>
        </div>
      ) : (
        <div className="space-y-6">
          <ClosingInfo workout={workout} />
          <WorkoutSetsView bundle={bundle} exercises={exercises} />
          <Link
            to={`/historial/${workout.id}/resumen`}
            className="flex min-h-12 items-center justify-center gap-2 rounded-md bg-fill text-body font-semibold"
          >
            <BarChart3 size={18} /> Resumen y compartir
          </Link>
        </div>
      )}
    </>
  )
}

function ClosingInfo({
  workout,
}: {
  workout: NonNullable<ReturnType<typeof useWorkout>>['workout']
}) {
  const items = [
    workout.avgHeartRate !== undefined && ['Pulsaciones', `${workout.avgHeartRate} ppm`],
    workout.calories !== undefined && ['Calorías', `${workout.calories} kcal`],
    workout.rating !== undefined && ['Valoración', `${workout.rating}/5`],
    workout.energy !== undefined && ['Energía', `${workout.energy}/5`],
    workout.cardio !== undefined && ['Cardio', formatCardio(workout.cardio)],
  ].filter((x): x is [string, string] => Array.isArray(x))
  if (items.length === 0 && !workout.notes) return null
  return (
    <div className="rounded-card bg-card p-4">
      {items.length > 0 && (
        <dl className="grid grid-cols-2 gap-3">
          {items.map(([k, v]) => (
            <div key={k}>
              <dt className="text-footnote text-ink-2">{k}</dt>
              <dd className="tnum text-body font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
      )}
      {workout.notes && <p className="mt-3 text-subhead whitespace-pre-line">{workout.notes}</p>}
    </div>
  )
}

/** Fecha y duración editables de un entreno pasado. */
export function DateDurationEditor({
  date,
  seconds,
  onDate,
  onSeconds,
}: {
  date: string
  seconds: number
  onDate: (d: string) => void
  onSeconds: (s: number) => void
}) {
  const [h, setH] = useState(String(Math.floor(seconds / 3600)))
  const [m, setM] = useState(String(Math.round((seconds % 3600) / 60)))
  const commit = (hh: string, mm: string) =>
    onSeconds((Number(hh) || 0) * 3600 + (Number(mm) || 0) * 60)
  return (
    <Group>
      <Row label="Fecha" htmlFor="w-date">
        <input
          id="w-date"
          type="date"
          value={date}
          max={todayLocal()}
          onChange={(e) => e.target.value && onDate(e.target.value)}
          className="bg-transparent text-right text-ink-2 outline-none"
        />
      </Row>
      <Row label="Duración">
        <span className="flex items-center gap-1.5 text-ink-2">
          <input
            aria-label="Horas"
            inputMode="numeric"
            pattern="[0-9]*"
            value={h}
            onChange={(e) => setH(e.target.value.replace(/\D/g, ''))}
            onBlur={() => commit(h, m)}
            className="tnum w-8 bg-transparent text-right font-semibold text-ink outline-none"
          />
          h
          <input
            aria-label="Minutos"
            inputMode="numeric"
            pattern="[0-9]*"
            value={m}
            onChange={(e) => setM(e.target.value.replace(/\D/g, '').slice(0, 2))}
            onBlur={() => commit(h, m)}
            className="tnum w-8 bg-transparent text-right font-semibold text-ink outline-none"
          />
          min
        </span>
      </Row>
    </Group>
  )
}
