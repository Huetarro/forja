import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Archive,
  ArchiveRestore,
  CalendarPlus,
  Copy,
  History,
  Pencil,
  Play,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Group } from '@/components/ui/Form'
import { NavBar, NavButton } from '@/components/ui/NavBar'
import { useExercises } from '@/db/library'
import {
  deleteRoutine,
  duplicateRoutine,
  setRoutineArchived,
  useLastWorkoutDates,
  usePrograms,
  useRoutine,
  useRoutineExercises,
} from '@/db/routines'
import { relativeDays, todayLocal } from '@/domain/dates'
import { setsSummary } from '@/domain/setTypes'
import { planLine, techniqueChips } from '@/domain/techniques'
import { metricOf } from '@/lib/exerciseMeta'
import { TechniqueChips } from './TechniqueChips'
import { supersetPosition } from '@/domain/supersets'
import { cn } from '@/lib/cn'
import { confirm, toast } from '@/stores/ui'
import { RoutineBadge } from './RoutineBadge'
import { SupersetBar } from './RoutineExerciseCard'
import { useStartWorkout } from './useStartWorkout'
import { PastWorkoutSheet } from './PastWorkoutSheet'

export default function RoutineDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const routine = useRoutine(id)
  const items = useRoutineExercises(id)
  const exercises = useExercises(true)
  const programs = usePrograms(true)
  const lastDates = useLastWorkoutDates()
  const start = useStartWorkout()
  const [pastOpen, setPastOpen] = useState(false)

  if (routine === null) {
    return (
      <>
        <NavBar backLabel="Inicio" />
        <EmptyState
          icon={Trash2}
          title="Esta rutina ya no existe"
          text="Puede que la hayas eliminado."
        />
      </>
    )
  }
  if (!routine || !items) return null

  const exById = new Map(exercises?.map((e) => [e.id, e]))
  const program = programs?.find((p) => p.id === routine.programId)
  const last = lastDates?.get(routine.id)

  const duplicate = async () => {
    const copyId = await duplicateRoutine(routine.id)
    if (copyId) {
      toast('Rutina duplicada')
      navigate(`/rutinas/${copyId}/editar`)
    }
  }

  const toggleArchive = async () => {
    const archived = !routine.archived
    await setRoutineArchived(routine.id, archived)
    toast(archived ? 'Rutina archivada' : 'Rutina restaurada', () =>
      setRoutineArchived(routine.id, !archived),
    )
    if (archived) navigate('/', { replace: true })
  }

  const remove = async () => {
    const ok = await confirm({
      title: `¿Eliminar “${routine.name}”?`,
      text: 'Los entrenos que ya hiciste con ella se conservan en tu historial.',
      confirmLabel: 'Eliminar',
      destructive: true,
    })
    if (!ok) return
    const undo = await deleteRoutine(routine.id)
    navigate('/', { replace: true })
    toast('Rutina eliminada', undo)
  }

  return (
    <>
      <NavBar
        backLabel="Inicio"
        action={
          <NavButton onClick={() => navigate(`/rutinas/${routine.id}/editar`)}>Editar</NavButton>
        }
      />

      <header className="flex items-center gap-4 pt-2 pb-5">
        <RoutineBadge color={routine.color} icon={routine.icon} size={60} />
        <div className="min-w-0">
          <h1 className="truncate font-display text-title1 font-bold tracking-tight">
            {routine.name}
          </h1>
          <p className="text-subhead text-ink-2">
            {[
              program?.name,
              last ? `Última vez ${relativeDays(last, todayLocal())}` : 'Sin entrenos aún',
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>
      </header>

      {routine.archived && (
        <p className="mb-4 rounded-md bg-fill px-4 py-3 text-subhead text-ink-2">
          Rutina archivada. Su historial se conserva.
        </p>
      )}

      {items.length > 0 && !routine.archived && (
        <Button size="lg" block icon={<Play size={20} />} onClick={() => void start(routine.id)}>
          Empezar entreno
        </Button>
      )}

      {routine.notes && (
        <p className="mt-5 rounded-card bg-card px-4 py-3 text-subhead whitespace-pre-line text-ink-2">
          {routine.notes}
        </p>
      )}

      <h2 className="mt-6 mb-2 px-1 text-title3 font-bold">
        {items.length} {items.length === 1 ? 'ejercicio' : 'ejercicios'}
      </h2>
      {items.length === 0 ? (
        <EmptyState
          icon={Pencil}
          title="Rutina vacía"
          text="Añade sus ejercicios para poder empezar a entrenar con ella."
          action={
            <Button onClick={() => navigate(`/rutinas/${routine.id}/editar`)}>
              Añadir ejercicios
            </Button>
          }
        />
      ) : (
        <ol className="space-y-2">
          {items.map((it, i) => {
            const pos = supersetPosition(items, i)
            const ex = exById.get(it.exerciseId)
            return (
              <li key={it.id} className="relative">
                {pos !== 'none' && <SupersetBar position={pos} />}
                <div className={cn('rounded-card bg-card px-4 py-3', pos !== 'none' && 'ml-3')}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="truncate text-body font-semibold">
                      {ex?.name ?? 'Ejercicio eliminado'}
                    </span>
                    <span className="tnum shrink-0 text-footnote text-ink-2">
                      {setsSummary(it.sets)}
                    </span>
                  </div>
                  <PlanInfo line={planLine(it, metricOf(ex), pos)} chips={techniqueChips(it)} />
                  {it.notes && <p className="mt-0.5 text-footnote text-ink-2">{it.notes}</p>}
                </div>
              </li>
            )
          })}
        </ol>
      )}

      <Group className="mt-8">
        <MenuRow
          icon={<History size={20} />}
          onClick={() => navigate(`/historial?rutina=${routine.id}`)}
        >
          Historial de la rutina
        </MenuRow>
        {items.length > 0 && (
          <MenuRow icon={<CalendarPlus size={20} />} onClick={() => setPastOpen(true)}>
            Añadir entreno pasado
          </MenuRow>
        )}
        <MenuRow icon={<Copy size={20} />} onClick={() => void duplicate()}>
          Duplicar rutina
        </MenuRow>
        <MenuRow
          icon={routine.archived ? <ArchiveRestore size={20} /> : <Archive size={20} />}
          onClick={() => void toggleArchive()}
        >
          {routine.archived ? 'Restaurar rutina' : 'Archivar rutina'}
        </MenuRow>
        <MenuRow icon={<Trash2 size={20} />} onClick={() => void remove()} danger>
          Eliminar rutina
        </MenuRow>
      </Group>
      <PastWorkoutSheet open={pastOpen} onClose={() => setPastOpen(false)} routineId={routine.id} />
    </>
  )
}

function MenuRow({
  icon,
  onClick,
  children,
  danger,
}: {
  icon: React.ReactNode
  onClick: () => void
  children: React.ReactNode
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex min-h-12 w-full items-center gap-3 px-4 text-body active:bg-fill',
        danger ? 'text-danger' : 'text-accent-ink',
      )}
    >
      {icon}
      {children}
    </button>
  )
}

/** "6-10 reps · desc. 2:30" y chips de técnica. */
function PlanInfo({ line, chips }: { line: string; chips: ReturnType<typeof techniqueChips> }) {
  if (!line && chips.length === 0) return null
  return (
    <div className="mt-1 flex flex-wrap items-center gap-1.5">
      {line && <span className="tnum mr-1 text-footnote text-ink-2">{line}</span>}
      <TechniqueChips chips={chips} />
    </div>
  )
}
