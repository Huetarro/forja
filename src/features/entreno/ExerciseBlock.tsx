import { useState } from 'react'
import { Copy, Ellipsis, Link2, Plus, StickyNote, Trash2, TrendingUp, Unlink } from 'lucide-react'
import { BottomSheet } from '@/components/ui/BottomSheet'
import type { Exercise, WorkoutExercise, WorkoutSet } from '@/db/schema'
import { addSet, updateWorkoutExercise } from '@/db/workouts'
import { shouldSuggestIncrease } from '@/domain/progressionRules'
import { liveSetRecords } from '@/domain/records'
import type { SupersetPosition } from '@/domain/supersets'
import { cn } from '@/lib/cn'
import { SupersetBar } from '@/features/rutinas/RoutineExerciseCard'
import { SetRow, type PrevSet } from './SetRow'

interface Props {
  we: WorkoutExercise
  exercise: Exercise | undefined
  sets: WorkoutSet[]
  /** sesiones anteriores del ejercicio, la más reciente primero */
  history: WorkoutSet[][]
  position: SupersetPosition
  linkedWithNext: boolean
  isLast: boolean
  onSetCompleted: (set: WorkoutSet, records: ReturnType<typeof liveSetRecords>) => void
  onDeleteSet: (set: WorkoutSet) => void
  onToggleSuperset: () => void
  onRemove: () => void
}

/** Un ejercicio del entreno con sus series. */
export function ExerciseBlock({
  we,
  exercise,
  sets,
  history,
  position,
  linkedWithNext,
  isLast,
  onSetCompleted,
  onDeleteSet,
  onToggleSuperset,
  onRemove,
}: Props) {
  const [menu, setMenu] = useState(false)
  const [showNotes, setShowNotes] = useState(we.notes.length > 0)
  const unilateral = exercise?.unilateral ?? sets.some((s) => s.side)
  const unit = exercise?.unit ?? 'kg'
  const suggest = shouldSuggestIncrease(history)
  const last = history[0] ?? []

  // Serie "anterior" equivalente: misma posición entre las del mismo lado
  const prevFor = (s: WorkoutSet): PrevSet | undefined => {
    const mine = sets.filter((x) => x.side === s.side)
    const idx = mine.indexOf(s)
    const p = last.filter((x) => x.side === s.side)[idx]
    return p ? { weight: p.weight, reps: p.reps } : undefined
  }
  const numberFor = (s: WorkoutSet): number => {
    const mine = sets.filter((x) => x.side === s.side && x.type !== 'calentamiento')
    return mine.indexOf(s) + 1
  }

  return (
    <section className="relative" aria-label={exercise?.name ?? 'Ejercicio'}>
      {position !== 'none' && <SupersetBar position={position} />}
      <div className={cn('overflow-hidden rounded-card bg-card', position !== 'none' && 'ml-3')}>
        <header className="flex items-start gap-2 pt-3 pr-1 pl-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-title3 leading-tight font-bold">
              {exercise?.name ?? 'Ejercicio eliminado'}
            </h2>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <span className="rounded-full bg-fill px-2 py-0.5 text-caption font-semibold text-ink-2">
                {unit}
              </span>
              {unilateral && (
                <span className="rounded-full bg-fill px-2 py-0.5 text-caption font-semibold text-ink-2">
                  Unilateral
                </span>
              )}
              {suggest && (
                <span className="flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-caption font-bold text-success">
                  <TrendingUp size={13} aria-hidden /> Sube peso
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowNotes((v) => !v)}
            aria-label="Notas"
            aria-expanded={showNotes}
            className={cn(
              'grid size-11 place-items-center rounded-full',
              showNotes || exercise?.fixedNotes ? 'text-accent-ink' : 'text-ink-3',
            )}
          >
            <StickyNote size={20} />
          </button>
          <button
            type="button"
            onClick={() => setMenu(true)}
            aria-label={`Opciones de ${exercise?.name ?? 'ejercicio'}`}
            className="grid size-11 place-items-center rounded-full text-ink-2"
          >
            <Ellipsis size={22} />
          </button>
        </header>

        {showNotes && (
          <div className="space-y-2 px-4 pt-2">
            {exercise?.fixedNotes && (
              <p className="rounded-sm bg-accent-soft px-3 py-2 text-footnote whitespace-pre-line">
                <span className="font-semibold">Notas fijas: </span>
                {exercise.fixedNotes}
              </p>
            )}
            <input
              key={we.id}
              defaultValue={we.notes}
              onBlur={(e) => {
                if (e.target.value !== we.notes)
                  void updateWorkoutExercise(we.id, { notes: e.target.value.trim() })
              }}
              placeholder="Notas de hoy"
              aria-label="Notas del ejercicio en este entreno"
              maxLength={200}
              className="h-10 w-full rounded-sm bg-fill px-3 text-subhead outline-none"
            />
          </div>
        )}

        <div
          className="mt-2 grid grid-cols-[38px_minmax(0,1fr)_68px_54px_40px_44px] gap-1.5 px-3 pb-1 text-caption font-semibold text-ink-2"
          aria-hidden
        >
          <span className="text-center">Serie</span>
          <span>Anterior</span>
          <span className="text-center">{unit}</span>
          <span className="text-center">Reps</span>
          <span className="text-center">RIR</span>
          <span />
        </div>

        <div className="divide-y divide-sep/60">
          {sets.map((s, i) => (
            <SetRow
              key={s.id}
              set={s}
              number={numberFor(s)}
              prev={prevFor(s)}
              isRecord={s.completed && liveSetRecords(history, sets, i).length > 0}
              bodyweight={exercise?.equipment === 'Peso corporal'}
              onCompleted={(done) => {
                const updated = sets.map((x) => (x.id === done.id ? done : x))
                onSetCompleted(done, liveSetRecords(history, updated, i))
              }}
              onDelete={onDeleteSet}
            />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 p-3">
          <button
            type="button"
            onClick={() => void addSet(we.id, unilateral, false)}
            className="flex min-h-touch items-center justify-center gap-1.5 rounded-md bg-fill text-subhead font-semibold"
          >
            <Plus size={17} /> Serie
          </button>
          <button
            type="button"
            onClick={() => void addSet(we.id, unilateral, true)}
            disabled={sets.length === 0}
            className="flex min-h-touch items-center justify-center gap-1.5 rounded-md bg-fill text-subhead font-semibold disabled:opacity-40"
          >
            <Copy size={16} /> Duplicar última
          </button>
        </div>
      </div>

      <BottomSheet open={menu} onClose={() => setMenu(false)} title={exercise?.name ?? 'Ejercicio'}>
        <div className="divide-y divide-sep overflow-hidden rounded-card bg-card">
          {!isLast && (
            <MenuItem
              icon={linkedWithNext ? <Unlink size={20} /> : <Link2 size={20} />}
              onClick={() => {
                onToggleSuperset()
                setMenu(false)
              }}
            >
              {linkedWithNext ? 'Separar de la superserie' : 'Superserie con el siguiente'}
            </MenuItem>
          )}
          <MenuItem
            danger
            icon={<Trash2 size={20} />}
            onClick={() => {
              setMenu(false)
              onRemove()
            }}
          >
            Quitar del entreno
          </MenuItem>
        </div>
        <p className="mt-3 px-2 text-footnote text-ink-2">
          Para borrar una serie, deslízala hacia la izquierda.
        </p>
      </BottomSheet>
    </section>
  )
}

function MenuItem({
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
        danger ? 'text-danger' : 'text-ink',
      )}
    >
      {icon}
      {children}
    </button>
  )
}
