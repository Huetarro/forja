import { Link } from 'react-router-dom'
import { Archive, ArchiveRestore, ChevronRight } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { Group } from '@/components/ui/Form'
import { NavBar } from '@/components/ui/NavBar'
import { setProgramArchived, setRoutineArchived, usePrograms, useRoutines } from '@/db/routines'
import { toast } from '@/stores/ui'
import { RoutineBadge } from './RoutineBadge'

/** Rutinas y programas archivados (conservan todo su historial). */
export default function ArchivedPage() {
  const routines = useRoutines(true)?.filter((r) => r.archived)
  const programs = usePrograms(true)?.filter((p) => p.archived)
  if (!routines || !programs) return null

  return (
    <>
      <NavBar />
      <h1 className="pt-1 pb-4 font-display text-large font-bold tracking-tight">Archivados</h1>

      {routines.length === 0 && programs.length === 0 && (
        <EmptyState
          icon={Archive}
          title="Nada archivado"
          text="Cuando archives una rutina o un programa aparecerá aquí, con su historial intacto."
        />
      )}

      <div className="space-y-6">
        {routines.length > 0 && (
          <Group title="Rutinas">
            {routines.map((r) => (
              <Link
                key={r.id}
                to={`/rutinas/${r.id}`}
                className="flex min-h-14 items-center gap-3 px-4 py-2 active:bg-fill"
              >
                <RoutineBadge color={r.color} icon={r.icon} size={34} />
                <span className="min-w-0 flex-1 truncate text-body">{r.name}</span>
                <ChevronRight size={18} className="text-ink-3" aria-hidden />
              </Link>
            ))}
          </Group>
        )}
        {programs.length > 0 && (
          <Group title="Programas">
            {programs.map((p) => (
              <div key={p.id} className="flex min-h-12 items-center gap-3 pl-4">
                <span className="min-w-0 flex-1 truncate text-body">{p.name}</span>
                <button
                  type="button"
                  onClick={() => {
                    void setProgramArchived(p.id, false)
                    toast(`“${p.name}” restaurado`)
                  }}
                  className="flex min-h-touch items-center gap-1.5 px-4 text-subhead font-semibold text-accent-ink"
                >
                  <ArchiveRestore size={18} /> Restaurar
                </button>
              </div>
            ))}
          </Group>
        )}
        {routines.length > 0 && (
          <Group>
            <button
              type="button"
              onClick={() => {
                const ids = routines.map((r) => r.id)
                void Promise.all(ids.map((id) => setRoutineArchived(id, false)))
                toast('Rutinas restauradas', () =>
                  Promise.all(ids.map((id) => setRoutineArchived(id, true))).then(() => undefined),
                )
              }}
              className="flex min-h-12 w-full items-center gap-3 px-4 text-body text-accent-ink"
            >
              <ArchiveRestore size={20} /> Restaurar todas las rutinas
            </button>
          </Group>
        )}
      </div>
    </>
  )
}
