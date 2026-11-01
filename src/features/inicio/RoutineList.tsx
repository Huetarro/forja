import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { SortableList } from '@/components/ui/SortableList'
import { reorderRoutines } from '@/db/routines'
import type { Program, Routine } from '@/db/schema'
import { relativeDays, todayLocal } from '@/domain/dates'
import { moveItem } from '@/domain/ordering'
import { RoutineBadge } from '@/features/rutinas/RoutineBadge'

interface Props {
  routines: Routine[]
  programs: Program[]
  counts: Map<string, number>
  lastDates: Map<string, string>
}

interface GroupData {
  key: string
  title?: string
  routines: Routine[]
}

/** Rutinas agrupadas por programa, con modo "Ordenar" (arrastrar). */
export function RoutineList({ routines, programs, counts, lastDates }: Props) {
  const [sorting, setSorting] = useState(false)
  const today = todayLocal()

  const groups: GroupData[] = [
    ...programs.map((p) => ({
      key: p.id,
      title: p.name,
      routines: routines.filter((r) => r.programId === p.id),
    })),
    {
      key: 'none',
      title: programs.length ? 'Sin programa' : undefined,
      routines: routines.filter((r) => !r.programId || !programs.some((p) => p.id === r.programId)),
    },
  ].filter((g) => g.routines.length > 0)

  const reorderInGroup = (key: string, from: number, to: number) => {
    const all = groups.flatMap((g) => (g.key === key ? moveItem(g.routines, from, to) : g.routines))
    void reorderRoutines(all.map((r) => r.id))
  }

  const meta = (r: Routine) => {
    const n = counts.get(r.id) ?? 0
    const last = lastDates.get(r.id)
    return [`${n} ${n === 1 ? 'ejercicio' : 'ejercicios'}`, last ? relativeDays(last, today) : null]
      .filter(Boolean)
      .join(' · ')
  }

  return (
    <section>
      <div className="mb-2 flex items-end justify-between px-1">
        <h2 className="text-title3 font-bold">Rutinas</h2>
        {routines.length > 1 && (
          <button
            type="button"
            onClick={() => setSorting((s) => !s)}
            className="min-h-touch px-1 text-body font-medium text-accent-ink"
          >
            {sorting ? 'Hecho' : 'Ordenar'}
          </button>
        )}
      </div>

      <div className="space-y-5">
        {groups.map((g) => (
          <div key={g.key}>
            {g.title && (
              <h3 className="mb-1.5 px-1 text-footnote font-semibold text-ink-2">{g.title}</h3>
            )}
            {sorting ? (
              <SortableList
                items={g.routines}
                getId={(r) => r.id}
                className="divide-y divide-sep overflow-hidden rounded-card bg-card"
                onReorder={(from, to) => reorderInGroup(g.key, from, to)}
                renderItem={(r, handle) => (
                  <div className="flex min-h-16 items-center gap-3 bg-card pr-4">
                    {handle}
                    <RoutineBadge color={r.color} icon={r.icon} size={36} />
                    <span className="truncate text-body font-semibold">{r.name}</span>
                  </div>
                )}
              />
            ) : (
              <ul className="divide-y divide-sep overflow-hidden rounded-card bg-card">
                {g.routines.map((r) => (
                  <li key={r.id}>
                    <Link
                      to={`/rutinas/${r.id}`}
                      className="flex min-h-16 items-center gap-3 px-4 py-2.5 active:bg-fill"
                    >
                      <RoutineBadge color={r.color} icon={r.icon} size={40} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-body font-semibold">{r.name}</span>
                        <span className="tnum block truncate text-footnote text-ink-2">
                          {meta(r)}
                        </span>
                      </span>
                      <ChevronRight size={18} className="shrink-0 text-ink-3" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
