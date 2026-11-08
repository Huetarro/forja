import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Group, Row } from '@/components/ui/Form'
import { startWorkout } from '@/db/workouts'
import { addDaysLocal, todayLocal } from '@/domain/dates'

const FORM_ID = 'past-workout-form'

/** Añadir un entreno olvidado con fecha anterior a partir de una rutina. */
export function PastWorkoutSheet({
  open,
  onClose,
  routineId,
}: {
  open: boolean
  onClose: () => void
  routineId: string
}) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Entreno pasado"
      action={
        <button
          type="submit"
          form={FORM_ID}
          className="min-h-touch px-3 text-body font-semibold text-accent-ink"
        >
          Crear
        </button>
      }
    >
      <PastWorkoutForm routineId={routineId} onClose={onClose} />
    </BottomSheet>
  )
}

function PastWorkoutForm({ routineId, onClose }: { routineId: string; onClose: () => void }) {
  const navigate = useNavigate()
  const [date, setDate] = useState(addDaysLocal(todayLocal(), -1))
  const [h, setH] = useState('1')
  const [m, setM] = useState('0')

  return (
    <form
      id={FORM_ID}
      className="space-y-4 pt-2"
      onSubmit={(e) => {
        e.preventDefault()
        const durationSec = (Number(h) || 0) * 3600 + (Number(m) || 0) * 60
        void startWorkout(routineId, { status: 'terminado', date, durationSec }).then((id) => {
          onClose()
          navigate(`/historial/${id}?editar=1`)
        })
      }}
    >
      <p className="px-1 text-subhead text-ink-2">
        Se crea con los ejercicios de la rutina. Después apunta los kilos y reps y marca cada serie
        como hechas.
      </p>
      <Group>
        <Row label="Fecha" htmlFor="past-date">
          <input
            id="past-date"
            type="date"
            required
            value={date}
            max={todayLocal()}
            onChange={(e) => setDate(e.target.value)}
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
              className="tnum w-8 bg-transparent text-right font-semibold text-ink outline-none"
            />
            h
            <input
              aria-label="Minutos"
              inputMode="numeric"
              pattern="[0-9]*"
              value={m}
              onChange={(e) => setM(e.target.value.replace(/\D/g, '').slice(0, 2))}
              className="tnum w-8 bg-transparent text-right font-semibold text-ink outline-none"
            />
            min
          </span>
        </Row>
      </Group>
    </form>
  )
}
