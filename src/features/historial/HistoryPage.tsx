import { Link, useSearchParams } from 'react-router-dom'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronRight, History } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { NavBar } from '@/components/ui/NavBar'
import { useRoutines } from '@/db/routines'
import { useFinishedWorkouts } from '@/db/workouts'
import { capitalize, parseLocalDate } from '@/domain/dates'
import { formatDuration } from '@/domain/timer'
import { routineColor } from '@/lib/routineStyle'

/** Lista de entrenos pasados, agrupados por mes. `?rutina=<id>` filtra por rutina. */
export default function HistoryPage() {
  const [params] = useSearchParams()
  const routineId = params.get('rutina') ?? undefined
  const workouts = useFinishedWorkouts(routineId)
  const routines = useRoutines(true)
  if (!workouts || !routines) return null
  const colorOf = new Map(routines.map((r) => [r.id, r.color]))
  const title = routineId
    ? (workouts[0]?.routineName ?? routines.find((r) => r.id === routineId)?.name ?? 'Historial')
    : 'Historial'

  const groups = new Map<string, typeof workouts>()
  for (const w of workouts) {
    const key = w.date.slice(0, 7)
    groups.set(key, [...(groups.get(key) ?? []), w])
  }

  return (
    <>
      <NavBar />
      <h1 className="pt-1 pb-4 font-display text-large font-bold tracking-tight">{title}</h1>
      {workouts.length === 0 ? (
        <EmptyState
          icon={History}
          title="Sin entrenos todavía"
          text="Cuando termines un entreno aparecerá aquí, y podrás revisarlo o corregirlo cuando quieras."
        />
      ) : (
        <div className="space-y-6">
          {[...groups.entries()].map(([month, list]) => (
            <section key={month}>
              <h2 className="mb-1.5 px-1 text-footnote font-semibold text-ink-2">
                {capitalize(format(parseLocalDate(`${month}-01`), 'MMMM yyyy', { locale: es }))}
              </h2>
              <ul className="divide-y divide-sep overflow-hidden rounded-card bg-card">
                {list.map((w) => (
                  <li key={w.id}>
                    <Link
                      to={`/historial/${w.id}`}
                      className="flex min-h-14 items-center gap-3 px-4 py-2 active:bg-fill"
                    >
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ background: routineColor(colorOf.get(w.routineId) ?? 10) }}
                        aria-hidden
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-body font-medium">
                          {w.routineName}
                        </span>
                        <span className="tnum block text-footnote text-ink-2">
                          {capitalize(format(parseLocalDate(w.date), 'EEEE d', { locale: es }))} ·{' '}
                          {formatDuration(w.activeSeconds)}
                        </span>
                      </span>
                      <ChevronRight size={18} className="text-ink-3" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  )
}
