/** Repositorio de la biblioteca de ejercicios. */
import { useLiveQuery } from 'dexie-react-hooks'
import { convertWeight, round2, type WeightUnit } from '@/domain/units'
import { db, newId } from './db'
import type { Exercise } from './schema'

export type ExerciseInput = Omit<Exercise, 'id' | 'archived' | 'createdAt'>

export function useExercises(includeArchived = false): Exercise[] | undefined {
  return useLiveQuery(async () => {
    const all = await db.exercises.toArray()
    return all
      .filter((e) => includeArchived || !e.archived)
      .sort((a, b) => a.name.localeCompare(b.name, 'es'))
  }, [includeArchived])
}

export function useExercise(id: string | undefined): Exercise | undefined {
  return useLiveQuery(async () => (id ? db.exercises.get(id) : undefined), [id])
}

export async function createExercise(input: ExerciseInput): Promise<string> {
  const id = newId()
  await db.exercises.add({ ...input, id, archived: false, createdAt: Date.now() })
  return id
}

export async function updateExercise(id: string, patch: Partial<ExerciseInput>): Promise<void> {
  await db.exercises.update(id, patch)
}

export async function setExerciseArchived(id: string, archived: boolean): Promise<void> {
  await db.exercises.update(id, { archived })
}

/** ¿Tiene series registradas en algún entreno? */
export async function exerciseHasHistory(id: string): Promise<boolean> {
  return (await db.workoutExercises.where('exerciseId').equals(id).count()) > 0
}

/** ¿Lo usa alguna rutina? */
export async function exerciseInRoutines(id: string): Promise<number> {
  return db.routineExercises.where('exerciseId').equals(id).count()
}

/**
 * Cambia la unidad de un ejercicio. Si `convert`, convierte también los pesos
 * guardados (series y bajadas); si no, solo cambia la etiqueta.
 */
export async function changeExerciseUnit(
  id: string,
  unit: WeightUnit,
  convert: boolean,
): Promise<void> {
  await db.transaction('rw', db.exercises, db.workoutExercises, db.workoutSets, async () => {
    const ex = await db.exercises.get(id)
    if (!ex || ex.unit === unit) return
    if (convert) {
      const wes = await db.workoutExercises.where('exerciseId').equals(id).toArray()
      for (const we of wes) {
        const sets = await db.workoutSets.where('workoutExerciseId').equals(we.id).toArray()
        for (const s of sets) {
          const c = (w: number | null) =>
            w === null ? null : round2(convertWeight(w, ex.unit, unit))
          await db.workoutSets.update(s.id, {
            weight: c(s.weight),
            drops: s.drops.map((d) => ({ ...d, weight: c(d.weight) })),
          })
        }
      }
    }
    await db.exercises.update(id, { unit })
  })
}

/** Elimina un ejercicio sin historial (lo quita también de las rutinas). Devuelve un deshacer. */
export async function deleteExercise(id: string): Promise<() => Promise<void>> {
  const ex = await db.exercises.get(id)
  const res = await db.routineExercises.where('exerciseId').equals(id).toArray()
  await db.transaction('rw', db.exercises, db.routineExercises, async () => {
    await db.routineExercises.bulkDelete(res.map((r) => r.id))
    await db.exercises.delete(id)
  })
  return async () => {
    await db.transaction('rw', db.exercises, db.routineExercises, async () => {
      if (ex) await db.exercises.put(ex)
      await db.routineExercises.bulkPut(res)
    })
  }
}
