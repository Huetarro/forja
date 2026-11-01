import { Link } from 'react-router-dom'
import { Play } from 'lucide-react'
import type { Routine } from '@/db/schema'
import { routineColor } from '@/lib/routineStyle'
import { RoutineBadge } from '@/features/rutinas/RoutineBadge'
import { useStartWorkout } from '@/features/rutinas/useStartWorkout'

/** Tarjeta "Te toca hoy" con la rutina sugerida por la rotación. */
export function NextRoutineCard({
  routine,
  exerciseCount,
}: {
  routine: Routine
  exerciseCount: number
}) {
  const start = useStartWorkout()
  return (
    <section className="relative overflow-hidden rounded-card bg-card p-4" aria-label="Te toca hoy">
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-1.5"
        style={{ background: routineColor(routine.color) }}
      />
      <p className="text-footnote font-semibold text-ink-2">Te toca hoy</p>
      <Link to={`/rutinas/${routine.id}`} className="mt-2 flex items-center gap-3">
        <RoutineBadge color={routine.color} icon={routine.icon} size={48} />
        <span className="min-w-0">
          <span className="block truncate text-title2 font-bold tracking-tight">
            {routine.name}
          </span>
          <span className="tnum block text-footnote text-ink-2">
            {exerciseCount} {exerciseCount === 1 ? 'ejercicio' : 'ejercicios'}
          </span>
        </span>
      </Link>
      <button
        type="button"
        onClick={() => void start(routine.id)}
        disabled={exerciseCount === 0}
        className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-accent text-body font-semibold text-on-accent active:opacity-80 disabled:opacity-40"
      >
        <Play size={18} fill="currentColor" aria-hidden />
        Empezar
      </button>
    </section>
  )
}
