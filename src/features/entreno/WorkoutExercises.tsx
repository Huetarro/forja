import { useState } from 'react'
import { ArrowUpDown, Plus } from 'lucide-react'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Button } from '@/components/ui/Button'
import { Celebration } from '@/components/ui/Celebration'
import { SortableList } from '@/components/ui/SortableList'
import { newId } from '@/db/db'
import type { Exercise, WorkoutSet } from '@/db/schema'
import { useSettings } from '@/db/settings'
import {
  addExercisesToWorkout,
  deleteSet,
  removeWorkoutExercise,
  saveWorkoutExerciseLayout,
  useHistoryFor,
  type WorkoutBundle,
} from '@/db/workouts'
import { moveItem } from '@/domain/ordering'
import { RECORD_LABEL, type RecordKind } from '@/domain/records'
import {
  isLinkedWithNext,
  linkWithNext,
  supersetPosition,
  unlinkFromNext,
} from '@/domain/supersets'
import { ExercisePickerSheet } from '@/features/ejercicios/ExercisePickerSheet'
import { useRestTimer } from '@/stores/restTimer'
import { toast } from '@/stores/ui'
import { ExerciseBlock } from './ExerciseBlock'

interface Props {
  bundle: WorkoutBundle
  exercises: Map<string, Exercise>
  /** 'live': entreno en curso (récords en directo y descanso); 'edit': entreno pasado */
  mode: 'live' | 'edit'
}

/** Lista editable de ejercicios y series de un entreno. */
export function WorkoutExercises({ bundle, exercises, mode }: Props) {
  const settings = useSettings()
  const startRest = useRestTimer((s) => s.start)
  const history = useHistoryFor(
    bundle.workout,
    bundle.exercises.map((e) => e.exerciseId),
  )
  const [picking, setPicking] = useState(false)
  const [sorting, setSorting] = useState(false)
  const [celebrate, setCelebrate] = useState(0)
  const items = bundle.exercises

  if (!history) return null

  const onSetCompleted = (set: WorkoutSet, records: RecordKind[], exercise?: Exercise) => {
    if (mode !== 'live') return
    if (records.length) {
      setCelebrate((c) => c + 1)
      toast(`¡Récord! ${records.map((r) => RECORD_LABEL[r]).join(' · ')}`)
    }
    if (settings?.restTimer.visible && set.type !== 'calentamiento') {
      startRest(exercise?.restSeconds ?? settings.restTimer.seconds)
    }
  }

  const onDeleteSet = async (set: WorkoutSet) => {
    const undo = await deleteSet(set.id)
    toast('Serie eliminada', undo)
  }

  const toggleSuperset = (i: number) => {
    const ids = isLinkedWithNext(items, i)
      ? unlinkFromNext(items, i, newId)
      : linkWithNext(items, i, newId)
    void saveWorkoutExerciseLayout(items.map((it, k) => ({ id: it.id, supersetId: ids[k] })))
  }

  const remove = async (i: number) => {
    const it = items[i]
    if (!it) return
    const undo = await removeWorkoutExercise(it.id)
    await saveWorkoutExerciseLayout(items.filter((_, k) => k !== i))
    toast(`${exercises.get(it.exerciseId)?.name ?? 'Ejercicio'} quitado`, undo)
  }

  return (
    <>
      <div className="space-y-4">
        {items.map((we, i) => {
          const ex = exercises.get(we.exerciseId)
          return (
            <ExerciseBlock
              key={we.id}
              we={we}
              exercise={ex}
              sets={bundle.sets.filter((s) => s.workoutExerciseId === we.id)}
              history={history.get(we.exerciseId) ?? []}
              position={supersetPosition(items, i)}
              linkedWithNext={isLinkedWithNext(items, i)}
              isLast={i === items.length - 1}
              onSetCompleted={(s, r) => onSetCompleted(s, r, ex)}
              onDeleteSet={(s) => void onDeleteSet(s)}
              onToggleSuperset={() => toggleSuperset(i)}
              onRemove={() => void remove(i)}
            />
          )
        })}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Button variant="secondary" icon={<Plus size={18} />} onClick={() => setPicking(true)}>
          Ejercicio
        </Button>
        <Button
          variant="secondary"
          icon={<ArrowUpDown size={18} />}
          onClick={() => setSorting(true)}
          disabled={items.length < 2}
        >
          Reordenar
        </Button>
      </div>

      <ExercisePickerSheet
        open={picking}
        onClose={() => setPicking(false)}
        onPick={(ids) => void addExercisesToWorkout(bundle.workout.id, ids)}
      />

      <BottomSheet open={sorting} onClose={() => setSorting(false)} title="Reordenar ejercicios">
        <SortableList
          items={items}
          getId={(it) => it.id}
          className="divide-y divide-sep overflow-hidden rounded-card bg-card"
          onReorder={(from, to) => void saveWorkoutExerciseLayout(moveItem(items, from, to))}
          renderItem={(it, handle) => (
            <div className="flex min-h-12 items-center bg-card pr-4">
              {handle}
              <span className="truncate text-body">
                {exercises.get(it.exerciseId)?.name ?? 'Ejercicio'}
              </span>
            </div>
          )}
        />
      </BottomSheet>

      {celebrate > 0 && <Celebration key={celebrate} burst={18} />}
    </>
  )
}
