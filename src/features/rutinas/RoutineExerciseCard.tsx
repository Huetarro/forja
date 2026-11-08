import type { ReactNode } from 'react'
import { Link2, Minus, Plus, Trash2, Unlink } from 'lucide-react'
import type { Exercise, RoutineExercise } from '@/db/schema'
import type { SupersetPosition } from '@/domain/supersets'
import { SET_TYPE_CHIP, SET_TYPE_LABEL, SET_TYPE_SHORT, nextSetType } from '@/domain/setTypes'
import { cn } from '@/lib/cn'
import { metricOf } from '@/lib/exerciseMeta'
import { RoutinePlanFields, type PlanPatch } from './RoutinePlanFields'

interface Props {
  item: RoutineExercise
  exercise: Exercise | undefined
  handle: ReactNode
  position: SupersetPosition
  linkedWithNext: boolean
  isLast: boolean
  onChange: (patch: PlanPatch) => void
  onNotesChange: (notes: string) => void
  onToggleSuperset: () => void
  onRemove: () => void
}

/** Tarjeta de un ejercicio dentro del editor de rutina. */
export function RoutineExerciseCard({
  item,
  exercise,
  handle,
  position,
  linkedWithNext,
  isLast,
  onChange,
  onNotesChange,
  onToggleSuperset,
  onRemove,
}: Props) {
  const sets = item.sets
  let normalCount = 0
  const setExtrasLen = (n: number) => (item.extras ? { extras: item.extras.slice(0, n) } : {})

  return (
    <div className={cn('relative', position !== 'none' && position !== 'end' && 'pb-0')}>
      {position !== 'none' && <SupersetBar position={position} />}
      <div className={cn('rounded-card bg-card', position !== 'none' && 'ml-3')}>
        <div className="flex items-center gap-1 pr-1 pl-0.5">
          {handle}
          <div className="min-w-0 flex-1 py-2">
            <div className="truncate text-body font-semibold">
              {exercise?.name ?? 'Ejercicio eliminado'}
            </div>
            {exercise && (
              <div className="truncate text-footnote text-ink-2">
                {exercise.primaryMuscle}
                {exercise.unilateral ? ' · Unilateral' : ''}
                {exercise.unit === 'lb' ? ' · lb' : ''}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Quitar ${exercise?.name ?? 'ejercicio'}`}
            className="grid min-h-touch min-w-touch place-items-center text-ink-2 active:text-danger"
          >
            <Trash2 size={19} />
          </button>
        </div>

        <div className="px-4 pb-3">
          <div className="mb-1.5 text-footnote text-ink-2">Series · toca para cambiar el tipo</div>
          <div className="flex flex-wrap items-center gap-2">
            {sets.map((t, i) => {
              if (t !== 'calentamiento') normalCount++
              const label = t === 'normal' ? String(normalCount) : SET_TYPE_SHORT[t]
              return (
                <button
                  type="button"
                  key={i}
                  onClick={() =>
                    onChange({ sets: sets.map((s, k) => (k === i ? nextSetType(s) : s)) })
                  }
                  aria-label={`Serie ${i + 1}: ${SET_TYPE_LABEL[t]}. Toca para cambiar`}
                  className={cn(
                    'tnum grid size-10 place-items-center rounded-full font-bold transition-colors',
                    t === 'restpause' ? 'text-footnote' : 'text-subhead',
                    SET_TYPE_CHIP[t],
                  )}
                >
                  {label}
                </button>
              )
            })}
            <div className="ml-auto flex items-center gap-1">
              <StepButton
                label="Quitar serie"
                disabled={sets.length <= 1}
                onClick={() =>
                  onChange({ sets: sets.slice(0, -1), ...setExtrasLen(sets.length - 1) })
                }
              >
                <Minus size={18} />
              </StepButton>
              <StepButton
                label="Añadir serie"
                onClick={() => onChange({ sets: [...sets, 'normal'] })}
              >
                <Plus size={18} />
              </StepButton>
            </div>
          </div>

          <RoutinePlanFields
            item={item}
            metric={metricOf(exercise)}
            position={position}
            onChange={onChange}
          />

          <input
            key={item.id}
            defaultValue={item.notes}
            onBlur={(e) => e.target.value !== item.notes && onNotesChange(e.target.value.trim())}
            placeholder="Notas del ejercicio en esta rutina"
            aria-label="Notas del ejercicio"
            maxLength={200}
            className="mt-3 h-10 w-full rounded-md bg-fill px-3 text-subhead outline-none placeholder:text-ink-2"
          />
        </div>

        {!isLast && (
          <button
            type="button"
            onClick={onToggleSuperset}
            className={cn(
              'flex min-h-touch w-full items-center gap-2 border-t border-sep px-4 text-subhead',
              linkedWithNext ? 'font-semibold text-accent-ink' : 'text-ink-2',
            )}
          >
            {linkedWithNext ? <Unlink size={17} /> : <Link2 size={17} />}
            {linkedWithNext ? 'Separar de la superserie' : 'Superserie con el siguiente'}
          </button>
        )}
      </div>
    </div>
  )
}

function StepButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="grid size-10 place-items-center rounded-full bg-fill text-ink active:bg-fill-strong disabled:opacity-30"
    >
      {children}
    </button>
  )
}

/** Barra lateral de color que une los ejercicios de una superserie. */
export function SupersetBar({ position }: { position: SupersetPosition }) {
  return (
    <span
      aria-hidden
      className={cn(
        'absolute left-0 w-0.5 bg-fill-strong',
        position === 'start' && 'top-4 -bottom-3 rounded-t-full',
        position === 'middle' && '-top-3 -bottom-3',
        position === 'end' && '-top-3 bottom-4 rounded-b-full',
      )}
    />
  )
}
