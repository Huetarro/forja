import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Archive, ArchiveRestore, History, Trash2 } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { Group } from '@/components/ui/Form'
import { NavBar, NavButton } from '@/components/ui/NavBar'
import {
  deleteExercise,
  exerciseHasHistory,
  exerciseInRoutines,
  setExerciseArchived,
  useExercise,
} from '@/db/library'
import { confirm, toast } from '@/stores/ui'
import { ExerciseFormSheet } from './ExerciseFormSheet'
import { exerciseMeta } from '@/lib/exerciseMeta'

export default function ExerciseDetailPage() {
  const { id } = useParams()
  const exercise = useExercise(id)
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)

  if (!exercise) return <NavBar backLabel="Ejercicios" />

  const remove = async () => {
    if (await exerciseHasHistory(exercise.id)) {
      const ok = await confirm({
        title: 'Este ejercicio tiene historial',
        text: 'Para no perder tus registros, se archivará: dejará de salir en la biblioteca, pero sus datos se conservan.',
        confirmLabel: 'Archivar',
      })
      if (ok) {
        await setExerciseArchived(exercise.id, true)
        toast('Ejercicio archivado', () => setExerciseArchived(exercise.id, false))
      }
      return
    }
    const uses = await exerciseInRoutines(exercise.id)
    const ok = await confirm({
      title: `¿Eliminar “${exercise.name}”?`,
      text:
        uses > 0
          ? `También se quitará de ${uses} ${uses === 1 ? 'rutina' : 'rutinas'}.`
          : undefined,
      confirmLabel: 'Eliminar',
      destructive: true,
    })
    if (!ok) return
    const undo = await deleteExercise(exercise.id)
    navigate(-1)
    toast('Ejercicio eliminado', undo)
  }

  const toggleArchive = async () => {
    const archived = !exercise.archived
    await setExerciseArchived(exercise.id, archived)
    toast(archived ? 'Ejercicio archivado' : 'Ejercicio restaurado', () =>
      setExerciseArchived(exercise.id, !archived),
    )
  }

  return (
    <>
      <NavBar
        backLabel="Ejercicios"
        action={<NavButton onClick={() => setEditing(true)}>Editar</NavButton>}
      />
      <header className="pt-1 pb-5">
        <h1 className="font-display text-title1 font-bold tracking-tight">{exercise.name}</h1>
        <p className="mt-1 text-subhead text-ink-2">{exerciseMeta(exercise)}</p>
        {exercise.archived && (
          <p className="mt-2 inline-block rounded-full bg-fill px-2.5 py-0.5 text-footnote text-ink-2">
            Archivado
          </p>
        )}
      </header>

      <div className="space-y-6">
        {exercise.secondaryMuscles.length > 0 && (
          <Group title="Músculos secundarios">
            <p className="px-4 py-3 text-body">{exercise.secondaryMuscles.join(', ')}</p>
          </Group>
        )}
        {exercise.fixedNotes && (
          <Group title="Notas fijas">
            <p className="px-4 py-3 text-body whitespace-pre-line">{exercise.fixedNotes}</p>
          </Group>
        )}

        <section>
          <h2 className="mb-2 px-1 text-title3 font-bold">Historial</h2>
          <EmptyState
            icon={History}
            title="Aún no lo has entrenado"
            text="Cuando lo hagas en un entreno, aquí verás cada sesión, tus récords y sus gráficas."
          />
        </section>

        <Group>
          <button
            type="button"
            onClick={() => void toggleArchive()}
            className="flex min-h-12 w-full items-center gap-3 px-4 text-body text-accent-ink"
          >
            {exercise.archived ? <ArchiveRestore size={20} /> : <Archive size={20} />}
            {exercise.archived ? 'Restaurar ejercicio' : 'Archivar ejercicio'}
          </button>
          <button
            type="button"
            onClick={() => void remove()}
            className="flex min-h-12 w-full items-center gap-3 px-4 text-body text-danger"
          >
            <Trash2 size={20} />
            Eliminar ejercicio
          </button>
        </Group>
      </div>

      <ExerciseFormSheet open={editing} onClose={() => setEditing(false)} exercise={exercise} />
    </>
  )
}
