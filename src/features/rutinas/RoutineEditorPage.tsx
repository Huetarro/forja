import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ListPlus, Pencil, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { NavBar, NavButton } from '@/components/ui/NavBar'
import { SortableList } from '@/components/ui/SortableList'
import { useExercises } from '@/db/library'
import { newId } from '@/db/db'
import {
  addExercisesToRoutine,
  removeRoutineExercise,
  saveRoutineExerciseLayout,
  updateRoutineExercise,
  useRoutine,
  useRoutineExercises,
  usePrograms,
} from '@/db/routines'
import { moveItem } from '@/domain/ordering'
import {
  isLinkedWithNext,
  linkWithNext,
  normalize,
  supersetPosition,
  unlinkFromNext,
} from '@/domain/supersets'
import { toast } from '@/stores/ui'
import { ExercisePickerSheet } from '@/features/ejercicios/ExercisePickerSheet'
import { RoutineBadge } from './RoutineBadge'
import { RoutineExerciseCard } from './RoutineExerciseCard'
import { RoutineMetaSheet } from './RoutineMetaSheet'

export default function RoutineEditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const routine = useRoutine(id)
  const items = useRoutineExercises(id)
  const exercises = useExercises(true)
  const programs = usePrograms(true)
  const [picking, setPicking] = useState(false)
  const [editingMeta, setEditingMeta] = useState(false)

  if (routine === null) return <NavBar />
  if (!routine || !items) return null

  const exById = new Map(exercises?.map((e) => [e.id, e]))
  const program = programs?.find((p) => p.id === routine.programId)

  const saveLayout = (list: typeof items, supersetIds?: Array<string | undefined>) => {
    const ids = supersetIds ?? normalize(list.map((i) => i.supersetId))
    void saveRoutineExerciseLayout(list.map((it, k) => ({ id: it.id, supersetId: ids[k] })))
  }

  const toggleSuperset = (i: number) => {
    const ids = isLinkedWithNext(items, i)
      ? unlinkFromNext(items, i, newId)
      : linkWithNext(items, i, newId)
    saveLayout(items, ids)
  }

  const remove = async (i: number) => {
    const it = items[i]
    if (!it) return
    const undo = await removeRoutineExercise(it.id)
    const rest = items.filter((_, k) => k !== i)
    saveLayout(rest)
    toast(`${exById.get(it.exerciseId)?.name ?? 'Ejercicio'} quitado`, undo)
  }

  return (
    <>
      <NavBar
        backLabel="Atrás"
        action={
          <NavButton onClick={() => navigate(`/rutinas/${routine.id}`, { replace: true })}>
            OK
          </NavButton>
        }
      />

      <button
        type="button"
        onClick={() => setEditingMeta(true)}
        className="mt-1 mb-6 flex w-full items-center gap-3 rounded-card bg-card p-3 text-left active:bg-fill"
      >
        <RoutineBadge color={routine.color} icon={routine.icon} size={48} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-title3 font-bold">{routine.name}</span>
          <span className="block truncate text-footnote text-ink-2">
            {program?.name ?? 'Sin programa'}
          </span>
        </span>
        <Pencil size={18} className="mr-1 text-ink-3" aria-label="Editar nombre, color e icono" />
      </button>

      <div className="mb-2 flex items-end justify-between px-1">
        <h2 className="text-title3 font-bold">Ejercicios</h2>
        {items.length > 1 && (
          <span className="text-footnote text-ink-2">Arrastra ⠿ para ordenar</span>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={ListPlus}
          title="Añade ejercicios"
          text="Elige de tu biblioteca o crea uno nuevo. Los kilos y repeticiones se apuntan al entrenar."
          action={<Button onClick={() => setPicking(true)}>Añadir ejercicios</Button>}
        />
      ) : (
        <>
          <SortableList
            items={items}
            getId={(it) => it.id}
            className="space-y-3"
            onReorder={(from, to) => saveLayout(moveItem(items, from, to))}
            renderItem={(it, handle, i) => (
              <RoutineExerciseCard
                item={it}
                exercise={exById.get(it.exerciseId)}
                handle={handle}
                position={supersetPosition(items, i)}
                linkedWithNext={isLinkedWithNext(items, i)}
                isLast={i === items.length - 1}
                onChange={(patch) => void updateRoutineExercise(it.id, patch)}
                onNotesChange={(notes) => void updateRoutineExercise(it.id, { notes })}
                onToggleSuperset={() => toggleSuperset(i)}
                onRemove={() => void remove(i)}
              />
            )}
          />
          <Button
            variant="secondary"
            block
            icon={<Plus size={18} />}
            className="mt-4"
            onClick={() => setPicking(true)}
          >
            Añadir ejercicios
          </Button>
        </>
      )}

      <ExercisePickerSheet
        open={picking}
        onClose={() => setPicking(false)}
        onPick={(ids) => void addExercisesToRoutine(routine.id, ids)}
      />
      <RoutineMetaSheet
        open={editingMeta}
        onClose={() => setEditingMeta(false)}
        routine={routine}
      />
    </>
  )
}
