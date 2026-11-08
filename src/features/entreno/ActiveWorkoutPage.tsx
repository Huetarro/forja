import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Pause, Play } from 'lucide-react'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { db } from '@/db/db'
import type { WorkoutExercise, WorkoutSet } from '@/db/schema'
import {
  discardIncompleteSets,
  finishWorkout,
  routineStructure,
  togglePause,
  updateRoutineFromWorkout,
  useActiveWorkout,
  useExerciseMap,
  useWorkout,
  workoutStructure,
  type ClosingData,
} from '@/db/workouts'
import { structureChanged } from '@/domain/routineDiff'
import { activeSeconds, formatClock, isPaused } from '@/domain/timer'
import { cn } from '@/lib/cn'
import { unlockAudio } from '@/lib/sound'
import { useNow } from '@/lib/useNow'
import { useRestTimer } from '@/stores/restTimer'
import { confirm, toast } from '@/stores/ui'
import { CardioBlock } from './CardioBlock'
import { ClosingForm } from './ClosingForm'
import { WorkoutTrack } from './WorkoutTrack'
import { RestTimerBar } from './RestTimerBar'
import { WorkoutExercises } from './WorkoutExercises'
import { StretchList } from './StretchList'
import { useRoutine } from '@/db/routines'

interface FinishPlan {
  discard: boolean
  updateRoutine: boolean
}

export default function ActiveWorkoutPage() {
  const active = useActiveWorkout()
  const bundle = useWorkout(active?.id)
  const exercises = useExerciseMap()
  const routine = useRoutine(active?.routineId)
  const navigate = useNavigate()
  const stopRest = useRestTimer((s) => s.stop)
  const [plan, setPlan] = useState<FinishPlan | null>(null)

  // iOS: el audio solo se puede activar tras un toque
  useEffect(() => {
    const unlock = () => unlockAudio()
    document.addEventListener('pointerdown', unlock, { once: true })
    return () => document.removeEventListener('pointerdown', unlock)
  }, [])

  if (active === null) return <Navigate to="/" replace />
  if (!active || !bundle || !exercises) return null
  const { workout, sets } = bundle

  const startFinish = async () => {
    const pending = sets.filter((s) => !s.completed).length
    let discard = false
    if (pending > 0) {
      discard = await confirm({
        title: `${pending} ${pending === 1 ? 'serie sin marcar' : 'series sin marcar'}`,
        text: 'Si terminas ahora, se descartarán.',
        confirmLabel: 'Descartar y terminar',
        cancelLabel: 'Seguir',
      })
      if (!discard) return
    }
    let updateRoutine = false
    const routineExists = await db.routines.get(workout.routineId)
    if (
      routineExists &&
      !workout.deload &&
      structureChanged(await routineStructure(workout.routineId), workoutStructure(bundle))
    ) {
      updateRoutine = await confirm({
        title: '¿Actualizar la rutina con estos cambios?',
        text: 'Has cambiado ejercicios, orden o series respecto a la rutina.',
        confirmLabel: 'Actualizar rutina',
        cancelLabel: 'Solo este entreno',
      })
    }
    setPlan({ discard, updateRoutine })
  }

  const complete = async (data: ClosingData) => {
    if (!plan) return
    if (plan.updateRoutine) {
      await updateRoutineFromWorkout(bundle)
      toast('Rutina actualizada')
    }
    if (plan.discard) await discardIncompleteSets(workout.id)
    await finishWorkout(workout.id, data)
    stopRest()
    setPlan(null)
    navigate(`/historial/${workout.id}/resumen`, { replace: true, state: { celebrate: true } })
  }

  const cancel = async () => {
    const ok = await confirm({
      title: '¿Cancelar el entreno?',
      text: 'Se borrará todo lo apuntado en este entreno.',
      confirmLabel: 'Cancelar entreno',
      cancelLabel: 'Seguir',
      destructive: true,
    })
    if (!ok) return
    await db.transaction('rw', db.workouts, db.workoutExercises, db.workoutSets, async () => {
      await db.workoutSets.where('workoutId').equals(workout.id).delete()
      await db.workoutExercises.where('workoutId').equals(workout.id).delete()
      await db.workouts.delete(workout.id)
    })
    stopRest()
    navigate('/', { replace: true })
    toast('Entreno cancelado')
  }

  return (
    <div className="pt-safe min-h-dvh">
      <WorkoutHeader
        name={workout.deload ? `${workout.routineName} · Descarga` : workout.routineName}
        startedAt={workout.startedAt}
        pauses={workout.pauses}
        exercises={bundle.exercises}
        sets={sets}
        onTogglePause={() => void togglePause(workout.id)}
        onFinish={() => void startFinish()}
      />

      <main className="px-safe mx-auto max-w-xl pt-2 pb-[calc(96px+env(safe-area-inset-bottom))]">
        <WorkoutExercises bundle={bundle} exercises={exercises} mode="live" />
        <div className="mt-6">
          <CardioBlock workout={workout} mode="live" />
        </div>
        {routine?.stretches && <StretchList workout={workout} />}
        <button
          type="button"
          onClick={() => void cancel()}
          className="mt-8 min-h-touch w-full rounded-full text-body text-danger"
        >
          Cancelar entreno
        </button>
      </main>

      <RestTimerBar />

      <BottomSheet
        open={plan !== null}
        onClose={() => setPlan(null)}
        title="Terminar entreno"
        tall
        action={
          <button
            type="submit"
            form="closing-form"
            className="min-h-touch px-3 text-body font-semibold text-accent-ink"
          >
            Guardar
          </button>
        }
      >
        <ClosingForm id="closing-form" onSubmit={(d) => void complete(d)} />
      </BottomSheet>
    </div>
  )
}

function WorkoutHeader({
  name,
  startedAt,
  pauses,
  exercises,
  sets,
  onTogglePause,
  onFinish,
}: {
  name: string
  startedAt: number
  pauses: Parameters<typeof activeSeconds>[1]
  exercises: WorkoutExercise[]
  sets: WorkoutSet[]
  onTogglePause: () => void
  onFinish: () => void
}) {
  const paused = isPaused(pauses)
  const now = useNow(1000, !paused)
  const secs = activeSeconds(startedAt, pauses, now)
  return (
    <header className="px-safe sticky top-0 z-20 border-b border-sep bg-tabbar pt-2 pb-3 backdrop-blur-[20px] backdrop-saturate-[1.8]">
      <div className="mx-auto max-w-xl">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-footnote text-ink-2">{name}</p>
            <span
              role="timer"
              aria-label={`Tiempo activo ${formatClock(secs)}${paused ? ', en pausa' : ''}`}
              className={cn(
                'tnum block font-display text-large font-bold tracking-tight',
                paused && 'text-ink-2',
              )}
            >
              {formatClock(secs)}
            </span>
            {paused && <span className="text-footnote text-ink-2">En pausa</span>}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onTogglePause}
              aria-label={paused ? 'Reanudar' : 'Pausar'}
              className={cn(
                'grid size-11 place-items-center rounded-full transition-transform duration-150 ease-ios active:scale-[.92]',
                paused ? 'bg-accent-soft text-accent-ink' : 'bg-fill text-ink-2',
              )}
            >
              {paused ? <Play size={18} /> : <Pause size={18} />}
            </button>
            <button
              type="button"
              onClick={onFinish}
              className="min-h-11 rounded-full bg-accent px-5 text-subhead text-on-accent transition-transform duration-150 ease-ios active:scale-[.97]"
            >
              Terminar
            </button>
          </div>
        </div>
        <WorkoutTrack exercises={exercises} sets={sets} />
      </div>
    </header>
  )
}
