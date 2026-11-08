import type { Exercise, ExerciseMetric, WorkoutSet } from '@/db/schema'
import type { WorkoutBundle } from '@/db/workouts'
import { SET_TYPE_CHIP, SET_TYPE_SHORT } from '@/domain/setTypes'
import { supersetPosition } from '@/domain/supersets'
import { formatNumber } from '@/domain/units'
import { cn } from '@/lib/cn'
import { formatSetValue, metricOf } from '@/lib/exerciseMeta'
import { SupersetBar } from '@/features/rutinas/RoutineExerciseCard'

/** Vista de solo lectura de los ejercicios y series de un entreno. */
export function WorkoutSetsView({
  bundle,
  exercises,
}: {
  bundle: WorkoutBundle
  exercises: Map<string, Exercise>
}) {
  return (
    <ol className="space-y-2">
      {bundle.exercises.map((we, i) => {
        const ex = exercises.get(we.exerciseId)
        const sets = bundle.sets.filter((s) => s.workoutExerciseId === we.id && s.completed)
        const pos = supersetPosition(bundle.exercises, i)
        return (
          <li key={we.id} className="relative">
            {pos !== 'none' && <SupersetBar position={pos} />}
            <div className={cn('rounded-card bg-card px-4 py-3', pos !== 'none' && 'ml-3')}>
              <div className="text-body font-semibold">{ex?.name ?? 'Ejercicio eliminado'}</div>
              {we.notes && <p className="text-footnote text-ink-2">{we.notes}</p>}
              {sets.length === 0 ? (
                <p className="mt-1 text-footnote text-ink-3">Sin series hechas</p>
              ) : (
                <ul className="mt-1.5 space-y-1">
                  {sets.map((s) => (
                    <SetLine key={s.id} set={s} unit={ex?.unit ?? 'kg'} metric={metricOf(ex)} />
                  ))}
                </ul>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

function SetLine({ set, unit, metric }: { set: WorkoutSet; unit: string; metric: ExerciseMetric }) {
  const tag = SET_TYPE_SHORT[set.type]
  return (
    <li className="tnum flex flex-wrap items-baseline gap-x-2 text-subhead">
      {tag && (
        <span className={cn('rounded px-1.5 text-caption font-bold', SET_TYPE_CHIP[set.type])}>
          {tag}
        </span>
      )}
      {set.side && (
        <span className="text-footnote text-ink-2">{set.side === 'izq' ? 'Izq' : 'Der'}</span>
      )}
      <span className="font-semibold">
        {set.weight
          ? `${formatNumber(set.weight, 2)} ${unit} × ${set.reps ?? 0}${metric === 'segundos' ? ' s' : ''}`
          : formatSetValue(0, set.reps, metric)}
      </span>
      {set.drops.length > 0 && (
        <span className="text-footnote text-ink-2">
          {set.type === 'restpause' ? 'RP' : '→'}{' '}
          {set.drops.map((d) => `${formatNumber(d.weight ?? 0, 2)}×${d.reps ?? 0}`).join(' → ')}
        </span>
      )}
    </li>
  )
}
