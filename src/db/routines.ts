/** Repositorio de programas, rutinas y sus ejercicios. */
import { useLiveQuery } from 'dexie-react-hooks'
import { byOrder, nextOrder } from '@/domain/ordering'
import { db, newId } from './db'
import type { Program, Routine, RoutineExercise, SetType } from './schema'

export const DEFAULT_SETS: SetType[] = ['normal', 'normal', 'normal']

/* ---------- Programas ---------- */

export function usePrograms(includeArchived = false): Program[] | undefined {
  return useLiveQuery(async () => {
    const all = byOrder(await db.programs.toArray())
    return includeArchived ? all : all.filter((p) => !p.archived)
  }, [includeArchived])
}

export async function createProgram(name: string): Promise<string> {
  const id = newId()
  const order = nextOrder(await db.programs.toArray())
  await db.programs.add({ id, name: name.trim(), order, archived: false })
  return id
}

export async function renameProgram(id: string, name: string): Promise<void> {
  await db.programs.update(id, { name: name.trim() })
}

export async function setProgramArchived(id: string, archived: boolean): Promise<void> {
  await db.programs.update(id, { archived })
}

export async function reorderPrograms(ids: string[]): Promise<void> {
  await db.transaction('rw', db.programs, async () => {
    await Promise.all(ids.map((id, order) => db.programs.update(id, { order })))
  })
}

/* ---------- Rutinas ---------- */

export type RoutineInput = Pick<Routine, 'name' | 'color' | 'icon' | 'notes' | 'programId'>

export function useRoutines(includeArchived = false): Routine[] | undefined {
  return useLiveQuery(async () => {
    const all = byOrder(await db.routines.toArray())
    return includeArchived ? all : all.filter((r) => !r.archived)
  }, [includeArchived])
}

export function useRoutine(id: string | undefined): Routine | undefined | null {
  return useLiveQuery(async () => (id ? ((await db.routines.get(id)) ?? null) : null), [id])
}

export async function createRoutine(input: RoutineInput): Promise<string> {
  const id = newId()
  const order = nextOrder(await db.routines.toArray())
  await db.routines.add({
    ...input,
    name: input.name.trim(),
    id,
    order,
    archived: false,
    createdAt: Date.now(),
  })
  return id
}

export async function updateRoutine(id: string, patch: Partial<RoutineInput>): Promise<void> {
  await db.routines.update(id, patch)
}

export async function setRoutineArchived(id: string, archived: boolean): Promise<void> {
  await db.routines.update(id, { archived })
}

export async function reorderRoutines(ids: string[]): Promise<void> {
  await db.transaction('rw', db.routines, async () => {
    await Promise.all(ids.map((id, order) => db.routines.update(id, { order })))
  })
}

/** Duplica una rutina con todos sus ejercicios. Devuelve el id de la copia. */
export async function duplicateRoutine(id: string): Promise<string | undefined> {
  return db.transaction('rw', db.routines, db.routineExercises, async () => {
    const r = await db.routines.get(id)
    if (!r) return undefined
    const copyId = newId()
    await db.routines.add({
      ...r,
      id: copyId,
      name: `${r.name} (copia)`,
      order: nextOrder(await db.routines.toArray()),
      archived: false,
      createdAt: Date.now(),
      isSample: undefined,
    })
    const items = await db.routineExercises.where('routineId').equals(id).toArray()
    const supersetMap = new Map<string, string>()
    await db.routineExercises.bulkAdd(
      items.map((it) => {
        let supersetId: string | undefined
        if (it.supersetId) {
          supersetId = supersetMap.get(it.supersetId) ?? newId()
          supersetMap.set(it.supersetId, supersetId)
        }
        return { ...it, id: newId(), routineId: copyId, supersetId, isSample: undefined }
      }),
    )
    return copyId
  })
}

/** Elimina la rutina (el historial de entrenos se conserva). Devuelve un deshacer. */
export async function deleteRoutine(id: string): Promise<() => Promise<void>> {
  const r = await db.routines.get(id)
  const items = await db.routineExercises.where('routineId').equals(id).toArray()
  await db.transaction('rw', db.routines, db.routineExercises, async () => {
    await db.routineExercises.bulkDelete(items.map((i) => i.id))
    await db.routines.delete(id)
  })
  return async () => {
    await db.transaction('rw', db.routines, db.routineExercises, async () => {
      if (r) await db.routines.put(r)
      await db.routineExercises.bulkPut(items)
    })
  }
}

/* ---------- Ejercicios de una rutina ---------- */

export function useRoutineExercises(routineId: string | undefined): RoutineExercise[] | undefined {
  return useLiveQuery(async () => {
    if (!routineId) return []
    return byOrder(await db.routineExercises.where('routineId').equals(routineId).toArray())
  }, [routineId])
}

/** Número de ejercicios por rutina. */
export function useRoutineExerciseCounts(): Map<string, number> | undefined {
  return useLiveQuery(async () => {
    const m = new Map<string, number>()
    await db.routineExercises.each((re) => m.set(re.routineId, (m.get(re.routineId) ?? 0) + 1))
    return m
  })
}

export async function addExercisesToRoutine(
  routineId: string,
  exerciseIds: string[],
): Promise<void> {
  const existing = await db.routineExercises.where('routineId').equals(routineId).toArray()
  let order = nextOrder(existing)
  await db.routineExercises.bulkAdd(
    exerciseIds.map((exerciseId) => ({
      id: newId(),
      routineId,
      exerciseId,
      order: order++,
      notes: '',
      sets: [...DEFAULT_SETS],
    })),
  )
}

export async function updateRoutineExercise(
  id: string,
  patch: Partial<
    Pick<
      RoutineExercise,
      'notes' | 'sets' | 'supersetId' | 'extras' | 'target' | 'restSec' | 'negative' | 'pause'
    >
  >,
): Promise<void> {
  await db.routineExercises.update(id, patch)
}

export async function removeRoutineExercise(id: string): Promise<() => Promise<void>> {
  const item = await db.routineExercises.get(id)
  await db.routineExercises.delete(id)
  return async () => {
    if (item) await db.routineExercises.put(item)
  }
}

/** Guarda orden y superseries de una lista ya ordenada. */
export async function saveRoutineExerciseLayout(
  items: Array<{ id: string; supersetId?: string }>,
): Promise<void> {
  await db.transaction('rw', db.routineExercises, async () => {
    await Promise.all(
      items.map((it, order) =>
        db.routineExercises.update(it.id, { order, supersetId: it.supersetId }),
      ),
    )
  })
}

/** Fecha del último entreno terminado de cada rutina. */
export function useLastWorkoutDates(): Map<string, string> | undefined {
  return useLiveQuery(async () => {
    const m = new Map<string, string>()
    await db.workouts
      .where('status')
      .equals('terminado')
      .each((w) => {
        const prev = m.get(w.routineId)
        if (!prev || w.date > prev) m.set(w.routineId, w.date)
      })
    return m
  })
}

/** Id de la rutina del último entreno terminado (para la rotación). */
export function useLastRoutineId(): string | undefined | null {
  return useLiveQuery(async () => {
    const all = await db.workouts.where('status').equals('terminado').toArray()
    all.sort((a, b) => b.date.localeCompare(a.date) || b.startedAt - a.startedAt)
    return all[0]?.routineId ?? null
  })
}
