import { useState } from 'react'
import { Check, Dumbbell, Plus } from 'lucide-react'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { useExercises } from '@/db/library'
import { cn } from '@/lib/cn'
import { ExerciseBrowser } from './ExerciseBrowser'
import { exerciseMeta } from '@/lib/exerciseMeta'
import { ExerciseFormSheet } from './ExerciseFormSheet'

interface Props {
  open: boolean
  onClose: () => void
  onPick: (exerciseIds: string[]) => void
  title?: string
}

/** Hoja para elegir ejercicios de la biblioteca (o crear uno sin salir). */
export function ExercisePickerSheet({ open, onClose, onPick, title = 'Añadir ejercicios' }: Props) {
  const [selected, setSelected] = useState<string[]>([])

  const close = () => {
    setSelected([])
    onClose()
  }
  const confirmPick = () => {
    if (selected.length) onPick(selected)
    close()
  }

  return (
    <BottomSheet
      open={open}
      onClose={close}
      title={title}
      tall
      action={
        <button
          type="button"
          onClick={confirmPick}
          disabled={selected.length === 0}
          className="tnum min-h-touch px-3 text-body font-semibold text-accent-ink disabled:opacity-40"
        >
          Añadir{selected.length ? ` (${selected.length})` : ''}
        </button>
      }
    >
      <PickerBody selected={selected} setSelected={setSelected} />
    </BottomSheet>
  )
}

function PickerBody({
  selected,
  setSelected,
}: {
  selected: string[]
  setSelected: (fn: (s: string[]) => string[]) => void
}) {
  const exercises = useExercises()
  const [creating, setCreating] = useState(false)
  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))

  return (
    <div className="pt-2">
      <Button
        variant="secondary"
        block
        icon={<Plus size={18} />}
        onClick={() => setCreating(true)}
        className="mb-4"
      >
        Nuevo ejercicio
      </Button>

      {exercises && exercises.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="Aún no tienes ejercicios"
          text="Crea el primero con el botón de arriba y quedará guardado en tu biblioteca."
        />
      ) : (
        exercises && (
          <ExerciseBrowser
            exercises={exercises}
            renderItem={(e) => {
              const on = selected.includes(e.id)
              return (
                <button
                  type="button"
                  onClick={() => toggle(e.id)}
                  aria-pressed={on}
                  className="flex min-h-14 w-full items-center gap-3 px-4 py-2 text-left active:bg-fill"
                >
                  <span
                    className={cn(
                      'grid size-6 shrink-0 place-items-center rounded-full border-2 transition-colors',
                      on ? 'border-accent bg-accent text-on-accent' : 'border-ink-3',
                    )}
                  >
                    {on && <Check size={14} strokeWidth={3} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-body font-medium">{e.name}</span>
                    <span className="block truncate text-footnote text-ink-2">
                      {exerciseMeta(e)}
                    </span>
                  </span>
                </button>
              )
            }}
            renderEmpty={(q) => (
              <EmptyState
                icon={Dumbbell}
                title="Sin resultados"
                text={
                  q ? `No tienes “${q}”. Créalo con “Nuevo ejercicio”.` : 'Prueba con otro filtro.'
                }
              />
            )}
          />
        )
      )}

      <ExerciseFormSheet
        open={creating}
        onClose={() => setCreating(false)}
        onCreated={(id) => setSelected((s) => [...s, id])}
      />
    </div>
  )
}
