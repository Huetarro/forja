import { Link } from 'react-router-dom'
import { CalendarDays, Coffee, Footprints, Play } from 'lucide-react'
import type { DayPlan, Routine, RunType } from '@/db/schema'
import { RUN_TYPES } from '@/lib/runTypes'
import { RoutineBadge } from '@/features/rutinas/RoutineBadge'
import { useStartWorkout } from '@/features/rutinas/useStartWorkout'

/** Tarjeta "Te toca hoy" según el plan semanal: rutina, carrera o descanso. */
export function TodayCard({
  plan,
  routine,
  exerciseCount,
}: {
  plan: DayPlan | null
  routine: Routine | undefined
  exerciseCount: number
}) {
  if (plan?.kind === 'rutina' && routine)
    return <NextRoutineCard routine={routine} exerciseCount={exerciseCount} />
  if (plan?.kind === 'carrera') return <RunDayCard label={plan.label} runType={plan.runType} />
  if (plan?.kind === 'descanso')
    return (
      <Shell>
        <div className="mt-2 flex items-center gap-3">
          <Icon>
            <Coffee size={22} aria-hidden />
          </Icon>
          <span className="text-title2 font-bold tracking-tight">Descanso</span>
        </div>
      </Shell>
    )
  return (
    <Shell>
      <Link to="/ajustes/plan" className="mt-2 flex items-center gap-3">
        <Icon>
          <CalendarDays size={22} aria-hidden />
        </Icon>
        <span className="min-w-0">
          <span className="block text-body font-semibold">
            {plan?.kind === 'rutina' ? 'La rutina de hoy ya no existe' : 'Nada planificado hoy'}
          </span>
          <span className="block text-footnote text-accent-ink">Ajustar el plan semanal</span>
        </span>
      </Link>
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-card bg-card p-4" aria-label="Te toca hoy">
      <p className="text-footnote text-ink-2">Te toca hoy</p>
      {children}
    </section>
  )
}

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <span className="grid size-12 shrink-0 place-items-center rounded-[14px] bg-fill text-ink-2">
      {children}
    </span>
  )
}

function RunDayCard({ label, runType }: { label: string; runType: RunType }) {
  const typeLabel = RUN_TYPES.find((t) => t.value === runType)?.label ?? 'Carrera'
  return (
    <Shell>
      <div className="mt-2 flex items-center gap-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-[14px] bg-chart-run text-white">
          <Footprints size={24} aria-hidden />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-title2 font-bold tracking-tight">{label}</span>
          <span className="block text-footnote text-ink-2">{typeLabel}</span>
        </span>
      </div>
      <Link
        to={`/running?nueva=1&tipo=${runType}`}
        className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-accent text-body text-on-accent transition-transform duration-150 ease-ios active:scale-[.97]"
      >
        <Footprints size={18} aria-hidden />
        Registrar carrera
      </Link>
    </Shell>
  )
}

/** Rutina del día con el botón "Empezar". */
export function NextRoutineCard({
  routine,
  exerciseCount,
}: {
  routine: Routine
  exerciseCount: number
}) {
  const start = useStartWorkout()
  return (
    <Shell>
      <Link to={`/rutinas/${routine.id}`} className="mt-2 flex items-center gap-3">
        <RoutineBadge color={routine.color} icon={routine.icon} size={48} />
        <span className="min-w-0">
          <span className="block truncate text-title2 font-bold tracking-tight">
            {routine.name}
          </span>
          <span className="tnum block text-footnote text-ink-2">
            {exerciseCount} {exerciseCount === 1 ? 'ejercicio' : 'ejercicios'}
          </span>
        </span>
      </Link>
      <button
        type="button"
        onClick={() => void start(routine.id)}
        disabled={exerciseCount === 0}
        className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-accent text-body text-on-accent transition-transform duration-150 ease-ios active:scale-[.97] disabled:opacity-40"
      >
        <Play size={18} aria-hidden />
        Empezar
      </button>
    </Shell>
  )
}
