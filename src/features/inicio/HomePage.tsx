import { useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Archive, Dumbbell, FolderOpen, Plus, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'
import {
  useLastRoutineId,
  useLastWorkoutDates,
  usePrograms,
  useRoutineExerciseCounts,
  useRoutines,
} from '@/db/routines'
import { useSettings } from '@/db/settings'
import { capitalize, longDate, todayLocal } from '@/domain/dates'
import { suggestNextRoutine } from '@/domain/rotation'
import { ProgramsSheet } from '@/features/rutinas/ProgramsSheet'
import { RoutineMetaSheet } from '@/features/rutinas/RoutineMetaSheet'
import { NextRoutineCard } from './NextRoutineCard'
import { ActiveWorkoutCard } from './ActiveWorkoutCard'
import { BackupWarning } from './BackupWarning'
import { TodayChecks } from './TodayChecks'
import { WeekCard } from './WeekCard'
import { useActiveWorkout } from '@/db/workouts'
import { RoutineList } from './RoutineList'

export default function HomePage() {
  const navigate = useNavigate()
  const settings = useSettings()
  const routines = useRoutines()
  const programs = usePrograms(true)
  const counts = useRoutineExerciseCounts()
  const lastDates = useLastWorkoutDates()
  const lastRoutineId = useLastRoutineId()
  const active = useActiveWorkout()
  const [creating, setCreating] = useState(false)
  const [managingPrograms, setManagingPrograms] = useState(false)

  const loaded = routines && programs && counts && lastDates && lastRoutineId !== undefined
  const activePrograms = programs?.filter((p) => !p.archived) ?? []
  const visibleRoutines =
    routines?.filter((r) => !r.programId || activePrograms.some((p) => p.id === r.programId)) ?? []
  const suggestedId = loaded
    ? suggestNextRoutine(visibleRoutines, programs, lastRoutineId ?? undefined)
    : undefined
  const suggested = visibleRoutines.find((r) => r.id === suggestedId)

  return (
    <>
      <PageHeader
        subtitle={capitalize(longDate(todayLocal()))}
        title={`Hola, ${settings?.userName ?? ''}`}
      />

      {loaded && (
        <div className="space-y-7">
          {active && <ActiveWorkoutCard workout={active} />}

          {suggested && !active && (
            <NextRoutineCard routine={suggested} exerciseCount={counts.get(suggested.id) ?? 0} />
          )}

          <WeekCard />
          <TodayChecks />

          {visibleRoutines.length === 0 ? (
            <EmptyState
              icon={Dumbbell}
              title="Crea tu primera rutina"
              text="Monta tus rutinas con los ejercicios que haces y empieza a apuntar cada serie."
              action={<Button onClick={() => setCreating(true)}>Crear rutina</Button>}
            />
          ) : (
            <RoutineList
              routines={visibleRoutines}
              programs={activePrograms}
              counts={counts}
              lastDates={lastDates}
            />
          )}

          <BackupWarning />

          <div className="grid grid-cols-2 gap-3">
            <QuickAction icon={Plus} onClick={() => setCreating(true)}>
              Nueva rutina
            </QuickAction>
            <QuickAction icon={Dumbbell} to="/ejercicios">
              Ejercicios
            </QuickAction>
            <QuickAction icon={FolderOpen} onClick={() => setManagingPrograms(true)}>
              Programas
            </QuickAction>
            <QuickAction icon={Archive} to="/archivados">
              Archivados
            </QuickAction>
          </div>
        </div>
      )}

      <RoutineMetaSheet
        open={creating}
        onClose={() => setCreating(false)}
        onCreated={(id) => navigate(`/rutinas/${id}/editar`)}
      />
      <ProgramsSheet open={managingPrograms} onClose={() => setManagingPrograms(false)} />
    </>
  )
}

function QuickAction({
  icon: Icon,
  children,
  to,
  onClick,
}: {
  icon: LucideIcon
  children: ReactNode
  to?: string
  onClick?: () => void
}) {
  const cls =
    'flex min-h-14 items-center gap-2.5 rounded-card bg-card px-4 text-body font-medium active:bg-fill'
  const content = (
    <>
      <Icon size={20} className="text-accent-ink" aria-hidden />
      {children}
    </>
  )
  return to ? (
    <Link to={to} className={cls}>
      {content}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={cls}>
      {content}
    </button>
  )
}
