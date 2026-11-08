import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Dumbbell, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { NavBar, NavButton } from '@/components/ui/NavBar'
import { useExercises } from '@/db/library'
import { ExerciseBrowser } from './ExerciseBrowser'
import { exerciseMeta } from '@/lib/exerciseMeta'
import { ExerciseFormSheet } from './ExerciseFormSheet'

export default function ExercisesPage() {
  const exercises = useExercises()
  const [creating, setCreating] = useState(false)

  return (
    <>
      <NavBar
        backLabel="Inicio"
        action={
          <NavButton onClick={() => setCreating(true)} label="Nuevo ejercicio">
            <Plus size={24} />
          </NavButton>
        }
      />
      <h1 className="pt-1 pb-4 font-display text-large font-bold tracking-tight">Ejercicios</h1>

      {exercises && exercises.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="Tu biblioteca está vacía"
          text="Crea los ejercicios que haces en tu gimnasio, con su músculo, material y ajustes de la máquina."
          action={<Button onClick={() => setCreating(true)}>Crear ejercicio</Button>}
        />
      ) : (
        exercises && (
          <ExerciseBrowser
            exercises={exercises}
            renderItem={(e) => (
              <Link
                to={`/ejercicios/${e.id}`}
                className="flex min-h-14 items-center gap-3 px-4 py-2 active:bg-fill"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-body font-medium">{e.name}</div>
                  <div className="truncate text-footnote text-ink-2">{exerciseMeta(e)}</div>
                </div>
                <ChevronRight size={18} className="text-ink-2" aria-hidden />
              </Link>
            )}
            renderEmpty={(q) => (
              <EmptyState
                icon={Dumbbell}
                title="Sin resultados"
                text={
                  q ? `No hay ningún ejercicio que coincida con “${q}”.` : 'Prueba con otro filtro.'
                }
                action={<Button onClick={() => setCreating(true)}>Crear ejercicio</Button>}
              />
            )}
          />
        )
      )}

      <ExerciseFormSheet open={creating} onClose={() => setCreating(false)} />
    </>
  )
}
