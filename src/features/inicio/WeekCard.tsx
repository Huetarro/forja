import { Flame } from 'lucide-react'
import { useRangeData, useStreak, useWeekTotals } from '@/db/days'
import { addDaysLocal, todayLocal, weekDays, weekStart } from '@/domain/dates'
import { formatDuration } from '@/domain/timer'
import { formatNumber } from '@/domain/units'
import { cn } from '@/lib/cn'
import { routineColor } from '@/lib/routineStyle'
import { marksFor } from '@/features/calendario/dayMarks'

const LETTERS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

/** Semana de lunes a domingo: puntos por día, totales y racha. */
export function WeekCard() {
  const today = todayLocal()
  const from = weekStart(today)
  const days = weekDays(today)
  const data = useRangeData(from, addDaysLocal(from, 6))
  const totals = useWeekTotals(from)
  const streak = useStreak()
  if (!data || !totals || !streak) return <div className="h-[168px] rounded-card bg-card" />

  return (
    <section className="rounded-card bg-card p-4" aria-label="Esta semana">
      <div className="flex items-center justify-between">
        <h2 className="text-body font-semibold">Esta semana</h2>
        <span
          className={cn(
            'flex items-center gap-1 rounded-full px-2.5 py-1 text-footnote font-bold',
            streak.current > 0 ? 'bg-accent-soft text-accent-ink' : 'bg-fill text-ink-2',
          )}
          aria-label={`Racha: ${streak.current} ${streak.current === 1 ? 'semana' : 'semanas'}`}
        >
          <Flame size={15} aria-hidden fill={streak.current > 0 ? 'currentColor' : 'none'} />
          <span className="tnum">
            {streak.current} {streak.current === 1 ? 'semana' : 'semanas'}
          </span>
        </span>
      </div>

      <ol className="mt-3 grid grid-cols-7 gap-1">
        {days.map((d, i) => {
          const m = marksFor(data, d)
          const color =
            m.gymColors[0] !== undefined
              ? routineColor(m.gymColors[0])
              : m.runs > 0
                ? 'var(--c-run)'
                : m.rest
                  ? 'var(--c-rest)'
                  : undefined
          return (
            <li key={d} className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  'text-caption font-semibold',
                  d === today ? 'text-accent-ink' : 'text-ink-3',
                )}
              >
                {LETTERS[i]}
              </span>
              <span
                className={cn(
                  'relative grid size-8 place-items-center rounded-full',
                  !color && (d > today ? 'border border-dashed border-sep' : 'bg-fill'),
                )}
                style={color ? { background: color } : undefined}
                aria-label={[
                  d,
                  m.workouts ? 'gimnasio' : null,
                  m.runs ? 'running' : null,
                  m.rest ? 'descanso' : null,
                ]
                  .filter(Boolean)
                  .join(', ')}
              >
                {m.workouts > 0 && m.runs > 0 && (
                  <span className="absolute -right-0.5 -bottom-0.5 size-3 rounded-full border-2 border-card bg-run" />
                )}
              </span>
            </li>
          )
        })}
      </ol>

      <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-sep pt-3">
        <Stat label="Tiempo" value={totals.seconds ? formatDuration(totals.seconds) : '0 min'} />
        <Stat label="Volumen" value={`${formatNumber(Math.round(totals.volumeKg), 0)} kg`} />
        <Stat label="Running" value={`${formatNumber(totals.km, 1)} km`} />
      </dl>
    </section>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-caption text-ink-2">{label}</dt>
      <dd className="tnum text-body font-bold">{value}</dd>
    </div>
  )
}
