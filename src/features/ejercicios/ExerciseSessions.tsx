import { Link } from 'react-router-dom'
import { History } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Exercise } from '@/db/schema'
import { useExerciseSessions } from '@/db/workouts'
import { capitalize, longDate } from '@/domain/dates'
import { bestOneRm } from '@/domain/oneRm'
import { formatNumber } from '@/domain/units'
import { isEffectiveSet } from '@/domain/volume'

/** Historial de sesiones de un ejercicio (más reciente primero). */
export function ExerciseSessions({ exercise }: { exercise: Exercise }) {
  const sessions = useExerciseSessions(exercise.id)
  if (!sessions) return null
  if (sessions.length === 0)
    return (
      <EmptyState
        icon={History}
        title="Aún no lo has entrenado"
        text="Cuando lo hagas en un entreno, aquí verás cada sesión, tus récords y sus gráficas."
      />
    )
  return (
    <ul className="divide-y divide-sep overflow-hidden rounded-card bg-card">
      {sessions.map(({ workout, sets }) => {
        const eff = sets.filter(isEffectiveSet)
        const rm = bestOneRm(sets)
        return (
          <li key={workout.id}>
            <Link to={`/historial/${workout.id}`} className="block px-4 py-3 active:bg-fill">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-subhead font-semibold">
                  {capitalize(longDate(workout.date))}
                </span>
                {rm !== null && (
                  <span className="tnum text-footnote text-ink-2">
                    1RM {formatNumber(rm, 1)} {exercise.unit}
                  </span>
                )}
              </div>
              <div className="text-footnote text-ink-2">{workout.routineName}</div>
              <div className="tnum mt-1 text-subhead">
                {eff.length === 0
                  ? '—'
                  : eff
                      .map(
                        (s) =>
                          `${s.side ? (s.side === 'izq' ? 'I ' : 'D ') : ''}${formatNumber(s.weight ?? 0, 2)}×${s.reps ?? 0}`,
                      )
                      .join('  ·  ')}
              </div>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
