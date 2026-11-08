import type { WorkoutExercise, WorkoutSet } from '@/db/schema'
import { isEffective } from '@/domain/setTypes'

/** Grises alternos por ejercicio, para ver dónde acaba cada uno. */
const TONES = ['var(--tono-1)', 'var(--tono-4)']

/** La pista del entreno: una casilla por serie, en su sitio. Hecha en gris; pendiente, hueco. */
export function WorkoutTrack({
  exercises,
  sets,
}: {
  exercises: WorkoutExercise[]
  sets: WorkoutSet[]
}) {
  const cells = exercises.flatMap((we, i) =>
    sets
      .filter((s) => s.workoutExerciseId === we.id && isEffective(s.type))
      .map((s) => ({ id: s.id, done: s.completed, tone: TONES[i % TONES.length] })),
  )
  if (cells.length === 0) return null
  const done = cells.filter((c) => c.done).length
  return (
    <div className="mt-2 flex items-center gap-2.5">
      <div
        className="pista min-w-0 flex-1"
        role="img"
        aria-label={`${done} de ${cells.length} series hechas`}
      >
        {cells.map((c) => (
          <span
            key={c.id}
            style={c.done ? ({ '--tono': c.tone } as React.CSSProperties) : undefined}
          />
        ))}
      </div>
      <span className="tnum shrink-0 text-footnote text-ink-2" aria-hidden>
        {done}/{cells.length}
      </span>
    </div>
  )
}
