import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import type { Workout } from '@/db/schema'
import { activeSeconds, formatClock, isPaused } from '@/domain/timer'
import { useNow } from '@/lib/useNow'

/** Tarjeta destacada con el entreno en curso y su cronómetro. */
export function ActiveWorkoutCard({ workout }: { workout: Workout }) {
  const paused = isPaused(workout.pauses)
  const now = useNow(1000, !paused)
  const secs = activeSeconds(workout.startedAt, workout.pauses, now)
  return (
    <Link
      to="/entreno"
      className="flex items-center gap-4 rounded-card bg-accent p-4 text-on-accent active:opacity-90"
      aria-label={`Entreno en curso: ${workout.routineName}. Continuar`}
    >
      <span className="min-w-0 flex-1">
        <span className="block text-footnote font-semibold opacity-80">
          {paused ? 'Entreno en pausa' : 'Entreno en curso'}
        </span>
        <span className="block truncate text-title3 font-bold">{workout.routineName}</span>
        <span className="tnum block font-display text-title1 leading-tight font-bold">
          {formatClock(secs)}
        </span>
      </span>
      <span className="flex items-center gap-1 rounded-full bg-black/15 py-2 pr-2 pl-4 text-subhead font-bold">
        Continuar <ChevronRight size={18} />
      </span>
    </Link>
  )
}
