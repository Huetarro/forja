import { useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, TrendingDown, TrendingUp } from 'lucide-react'
import type { TrainingData } from '@/db/stats'
import {
  exerciseSessions,
  inRange,
  measuredByReps,
  trendPct,
  type RangeBounds,
} from '@/domain/stats'
import { formatNumber } from '@/domain/units'
import { cn } from '@/lib/cn'
import { Sparkline } from './charts'
import ExerciseStats from './ExerciseStats'

export default function ExercisesTab({
  data,
  bounds,
}: {
  data: TrainingData
  bounds: RangeBounds
}) {
  const [params, setParams] = useSearchParams()
  const selected = params.get('ej')
  const cur = data.sessions.filter((s) => inRange(s.date, bounds))
  const select = (id: string | null) => {
    const next = Object.fromEntries(params)
    if (id) next.ej = id
    else delete next.ej
    setParams(next, { replace: true })
  }

  const info = selected ? data.exercises.get(selected) : undefined
  if (info) {
    return (
      <div>
        <button
          type="button"
          onClick={() => select(null)}
          className="mb-2 flex min-h-touch items-center text-body text-accent-ink"
        >
          <ChevronLeft size={22} aria-hidden /> Ejercicios
        </button>
        <h2 className="mb-3 px-1 font-display text-title1 font-bold tracking-tight">{info.name}</h2>
        <ExerciseStats exercise={info} sessions={cur} allSessions={data.sessions} />
      </div>
    )
  }

  const rows = [...data.exercises.values()]
    .map((e) => {
      const m = exerciseSessions(cur, e.id, e.unilateral ? 'izq' : undefined)
      const byReps = measuredByReps(e)
      const rms = m
        .map((x) => (byReps ? x.maxReps : x.best1rm))
        .filter((v): v is number => v !== null)
      return { e, rms, byReps, sessions: m.length }
    })
    .filter((r) => r.sessions > 0)
    .sort((a, b) => b.sessions - a.sessions || a.e.name.localeCompare(b.e.name, 'es'))

  if (rows.length === 0)
    return (
      <p className="rounded-card bg-card px-4 py-4 text-subhead text-ink-2">
        No hay ejercicios entrenados en este periodo.
      </p>
    )

  return (
    <ul className="divide-y divide-sep overflow-hidden rounded-card bg-card">
      {rows.map(({ e, rms, byReps, sessions }) => {
        const t = trendPct(rms)
        const last = rms[rms.length - 1]
        return (
          <li key={e.id}>
            <button
              type="button"
              onClick={() => select(e.id)}
              className="flex min-h-16 w-full items-center gap-3 px-4 py-2 text-left active:bg-fill"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-body font-semibold">{e.name}</span>
                <span className="tnum block text-footnote text-ink-2">
                  {sessions} {sessions === 1 ? 'sesión' : 'sesiones'}
                  {last !== undefined
                    ? byReps
                      ? ` · máx. ${formatNumber(last, 0)} ${e.metric === 'segundos' ? 's' : 'reps'}`
                      : ` · 1RM ${formatNumber(last, 1)} ${e.unit}`
                    : ''}
                  {e.unilateral ? ' · Izq' : ''}
                </span>
              </span>
              <Sparkline values={rms} />
              <span
                className={cn(
                  'tnum flex w-14 items-center justify-end gap-0.5 text-footnote font-semibold',
                  t !== null && t > 0 ? 'text-success' : 'text-ink-2',
                )}
                aria-label={t === null ? 'Sin tendencia' : `Tendencia ${formatNumber(t, 0)} %`}
              >
                {t !== null &&
                  (t >= 0 ? (
                    <TrendingUp size={14} aria-hidden />
                  ) : (
                    <TrendingDown size={14} aria-hidden />
                  ))}
                {t === null ? '—' : `${formatNumber(Math.abs(t), 0)} %`}
              </span>
              <ChevronRight size={18} className="text-ink-2" aria-hidden />
            </button>
          </li>
        )
      })}
    </ul>
  )
}
