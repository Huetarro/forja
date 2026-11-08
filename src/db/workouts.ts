/** Repositorio de entrenos: empezar, series, pausas, terminar, historial. */
import { useLiveQuery } from 'dexie-react-hooks'
import { EMPTY_CARDIO, resolveCardio, type CardioValues } from '@/domain/cardio'
import { parseLocalDate, todayLocal } from '@/domain/dates'
import { byOrder, nextOrder } from '@/domain/ordering'
import { normalize } from '@/domain/supersets'
import type { StructureItem } from '@/domain/routineDiff'
import type { HistorySession } from '@/domain/progressionRules'
import { DEFAULT_EXTRAS, hasExtras } from '@/domain/setTypes'
import { plannedSets, plannedTypes, type PlannedSet } from '@/domain/workoutPlan'
import { activeSeconds, isPaused } from '@/domain/timer'
import { db, newId } from './db'
import type { Drop, Exercise, SetType, Side, Workout, WorkoutExercise, WorkoutSet } from './schema'

/* ---------- Lecturas ---------- */

export interface WorkoutBundle {
  workout: Workout
  exercises: WorkoutExercise[]
  sets: WorkoutSet[]
}

export async function loadWorkout(id: string): Promise<WorkoutBundle | null> {
  const workout = await db.workouts.get(id)
  if (!workout) return null
  const exercises = byOrder(await db.workoutExercises.where('workoutId').equals(id).toArray())
  const sets = sortSets(await db.workoutSets.where('workoutId').equals(id).toArray())
  return { workout, exercises, sets }
}

export function useWorkout(id: string | undefined): WorkoutBundle | null | undefined {
  return useLiveQuery(async () => (id ? loadWorkout(id) : null), [id])
}

/** Orden de las series: por orden y, en unilaterales, Izq antes que Der. */
export function sortSets<T extends { order: number; side?: Side }>(sets: T[]): T[] {
  const sideRank = (s?: Side) => (s === 'der' ? 1 : 0)
  return sets.slice().sort((a, b) => a.order - b.order || sideRank(a.side) - sideRank(b.side))
}

export function useActiveWorkout(): Workout | null | undefined {
  return useLiveQuery(
    async () => (await db.workouts.where('status').equals('en_curso').first()) ?? null,
  )
}

export function useFinishedWorkouts(routineId?: string): Workout[] | undefined {
  return useLiveQuery(async () => {
    const all = await db.workouts.where('status').equals('terminado').toArray()
    return all
      .filter((w) => !routineId || w.routineId === routineId)
      .sort((a, b) => b.date.localeCompare(a.date) || b.startedAt - a.startedAt)
  }, [routineId])
}

/**
 * Sesiones anteriores de un ejercicio (la más reciente primero), excluyendo un entreno.
 * Solo entrenos terminados y anteriores a `before` (marca de inicio).
 */
export async function previousSessions(
  exerciseId: string,
  excludeWorkoutId: string,
  before: number,
): Promise<Array<{ workout: Workout; sets: WorkoutSet[]; notes: string }>> {
  const wes = await db.workoutExercises.where('exerciseId').equals(exerciseId).toArray()
  const out: Array<{ workout: Workout; sets: WorkoutSet[]; notes: string }> = []
  for (const we of wes) {
    if (we.workoutId === excludeWorkoutId) continue
    const w = await db.workouts.get(we.workoutId)
    if (!w || w.status !== 'terminado' || w.startedAt >= before) continue
    const sets = sortSets(await db.workoutSets.where('workoutExerciseId').equals(we.id).toArray())
    out.push({ workout: w, sets, notes: we.notes })
  }
  return out.sort(
    (a, b) =>
      b.workout.date.localeCompare(a.workout.date) || b.workout.startedAt - a.workout.startedAt,
  )
}

/** Historial (sesiones anteriores, la más reciente primero) de cada ejercicio de un entreno. */
export function useHistoryFor(
  workout: Workout | undefined,
  exerciseIds: string[],
): Map<string, Array<HistorySession<WorkoutSet>>> | undefined {
  const key = exerciseIds.join(',')
  return useLiveQuery(async () => {
    const m = new Map<string, Array<HistorySession<WorkoutSet>>>()
    if (!workout) return m
    for (const exId of new Set(exerciseIds)) {
      const prev = await previousSessions(exId, workout.id, workout.startedAt)
      m.set(
        exId,
        prev.map((p) => ({ sets: p.sets, deload: p.workout.deload === true })),
      )
    }
    return m
  }, [workout?.id, workout?.startedAt, key])
}

/* ---------- Empezar ---------- */

const emptyDrops = (n: number): Drop[] =>
  Array.from({ length: n }, () => ({ weight: null, reps: null }))

function setsFor(
  workoutId: string,
  weId: string,
  planned: readonly PlannedSet[],
  unilateral: boolean,
): WorkoutSet[] {
  const out: WorkoutSet[] = []
  planned.forEach(({ type, extras }, order) => {
    const sides: Array<Side | undefined> = unilateral ? ['izq', 'der'] : [undefined]
    for (const side of sides) {
      out.push({
        id: newId(),
        workoutId,
        workoutExerciseId: weId,
        order,
        type,
        weight: null,
        reps: null,
        completed: false,
        side,
        drops: hasExtras(type) ? emptyDrops(extras) : [],
      })
    }
  })
  return out
}

/** Crea un entreno a partir de una rutina. Devuelve su id. */
export async function startWorkout(
  routineId: string,
  opts: { status?: Workout['status']; date?: string; durationSec?: number; deload?: boolean } = {},
): Promise<string> {
  return db.transaction(
    'rw',
    [
      db.routines,
      db.routineExercises,
      db.exercises,
      db.workouts,
      db.workoutExercises,
      db.workoutSets,
      db.settings,
    ],
    async () => {
      const routine = await db.routines.get(routineId)
      if (!routine) throw new Error('Rutina no encontrada')
      const items = byOrder(
        await db.routineExercises.where('routineId').equals(routineId).toArray(),
      )
      const deload = opts.deload ?? (await db.settings.get('app'))?.deload?.active === true
      const id = newId()
      const finished = opts.status === 'terminado'
      // Un entreno pasado se fecha a mediodía de su día para ordenarlo bien en el historial
      const now =
        finished && opts.date ? parseLocalDate(opts.date).getTime() + 12 * 3600_000 : Date.now()
      await db.workouts.add({
        id,
        routineId,
        routineName: routine.name,
        date: opts.date ?? todayLocal(),
        startedAt: finished ? now - (opts.durationSec ?? 0) * 1000 : now,
        endedAt: finished ? now : undefined,
        pauses: [],
        activeSeconds: opts.durationSec ?? 0,
        status: opts.status ?? 'en_curso',
        notes: '',
        ...(deload ? { deload: true } : {}),
      })
      const supersetMap = new Map<string, string>()
      for (const [order, it] of items.entries()) {
        const ex = await db.exercises.get(it.exerciseId)
        const weId = newId()
        let supersetId: string | undefined
        if (it.supersetId) {
          supersetId = supersetMap.get(it.supersetId) ?? newId()
          supersetMap.set(it.supersetId, supersetId)
        }
        await db.workoutExercises.add({
          id: weId,
          workoutId: id,
          exerciseId: it.exerciseId,
          order,
          notes: it.notes,
          supersetId,
          // Copia del plan: el historial no cambia si luego se edita la rutina
          target: it.target,
          restSec: it.restSec,
          // En la descarga no hay técnicas
          negative: deload ? undefined : it.negative,
          pause: deload ? undefined : it.pause,
        })
        await db.workoutSets.bulkAdd(
          setsFor(id, weId, plannedSets(it, deload), ex?.unilateral ?? false),
        )
      }
      return id
    },
  )
}

/* ---------- Cronómetro ---------- */

export async function togglePause(workoutId: string): Promise<void> {
  const w = await db.workouts.get(workoutId)
  if (!w) return
  const now = Date.now()
  const pauses = w.pauses.slice()
  if (isPaused(pauses)) {
    const last = pauses[pauses.length - 1]
    if (last) pauses[pauses.length - 1] = { ...last, end: now }
  } else pauses.push({ start: now })
  await db.workouts.update(workoutId, {
    pauses,
    activeSeconds: activeSeconds(w.startedAt, pauses, now),
  })
}

/* ---------- Series ---------- */

export async function updateSet(id: string, patch: Partial<Omit<WorkoutSet, 'id'>>): Promise<void> {
  await db.workoutSets.update(id, patch)
}

/** Cambia el tipo de una serie (y de su pareja del otro lado en unilaterales). */
export async function setSetType(set: WorkoutSet, type: SetType): Promise<void> {
  await db.transaction('rw', db.workoutSets, async () => {
    const siblings = await db.workoutSets
      .where('workoutExerciseId')
      .equals(set.workoutExerciseId)
      .toArray()
    const targets = siblings.filter((s) => s.order === set.order)
    await Promise.all(
      targets.map((s) =>
        db.workoutSets.update(s.id, {
          type,
          drops: hasExtras(type)
            ? s.drops.length
              ? s.drops
              : emptyDrops(DEFAULT_EXTRAS[type] ?? 1)
            : [],
        }),
      ),
    )
  })
}

/** Añade una serie (o una pareja Izq/Der) al final; si `copyLast`, copia peso y reps. */
export async function addSet(weId: string, unilateral: boolean, copyLast: boolean): Promise<void> {
  await db.transaction('rw', db.workoutSets, async () => {
    const sets = sortSets(await db.workoutSets.where('workoutExerciseId').equals(weId).toArray())
    const last = sets[sets.length - 1]
    const order = nextOrder(sets)
    const workoutId = last?.workoutId ?? (await db.workoutExercises.get(weId))?.workoutId ?? ''
    const sides: Array<Side | undefined> = unilateral ? ['izq', 'der'] : [undefined]
    for (const side of sides) {
      const src = sets.filter((s) => s.side === side).pop()
      await db.workoutSets.add({
        id: newId(),
        workoutId,
        workoutExerciseId: weId,
        order,
        type: src?.type === 'calentamiento' ? 'normal' : (src?.type ?? 'normal'),
        weight: copyLast ? (src?.weight ?? null) : null,
        reps: copyLast ? (src?.reps ?? null) : null,
        completed: false,
        side,
        drops:
          src && hasExtras(src.type)
            ? copyLast
              ? src.drops.map((d) => ({ ...d }))
              : emptyDrops(src.drops.length || (DEFAULT_EXTRAS[src.type] ?? 1))
            : [],
      })
    }
  })
}

export async function deleteSet(id: string): Promise<() => Promise<void>> {
  const s = await db.workoutSets.get(id)
  await db.workoutSets.delete(id)
  return async () => {
    if (s) await db.workoutSets.put(s)
  }
}

export async function setDrops(id: string, drops: Drop[]): Promise<void> {
  await db.workoutSets.update(id, { drops })
}

/** Cambia una bajada sobre el valor actual, para que un guardado no pise otra casilla. */
export async function updateDrop(id: string, index: number, patch: Partial<Drop>): Promise<void> {
  await db.transaction('rw', db.workoutSets, async () => {
    const set = await db.workoutSets.get(id)
    if (!set || index >= set.drops.length) return
    await db.workoutSets.update(id, {
      drops: set.drops.map((d, i) => (i === index ? { ...d, ...patch } : d)),
    })
  })
}

/* ---------- Ejercicios del entreno ---------- */

export async function addExercisesToWorkout(
  workoutId: string,
  exerciseIds: string[],
): Promise<void> {
  await db.transaction('rw', db.workoutExercises, db.workoutSets, db.exercises, async () => {
    const existing = await db.workoutExercises.where('workoutId').equals(workoutId).toArray()
    let order = nextOrder(existing)
    for (const exerciseId of exerciseIds) {
      const ex = await db.exercises.get(exerciseId)
      const weId = newId()
      await db.workoutExercises.add({ id: weId, workoutId, exerciseId, order: order++, notes: '' })
      await db.workoutSets.bulkAdd(
        setsFor(
          workoutId,
          weId,
          plannedSets({ sets: ['normal', 'normal', 'normal'] }),
          ex?.unilateral ?? false,
        ),
      )
    }
  })
}

export async function removeWorkoutExercise(weId: string): Promise<() => Promise<void>> {
  const we = await db.workoutExercises.get(weId)
  const sets = await db.workoutSets.where('workoutExerciseId').equals(weId).toArray()
  await db.transaction('rw', db.workoutExercises, db.workoutSets, async () => {
    await db.workoutSets.bulkDelete(sets.map((s) => s.id))
    await db.workoutExercises.delete(weId)
  })
  return async () => {
    await db.transaction('rw', db.workoutExercises, db.workoutSets, async () => {
      if (we) await db.workoutExercises.put(we)
      await db.workoutSets.bulkPut(sets)
    })
  }
}

export async function updateWorkoutExercise(
  weId: string,
  patch: Partial<Pick<WorkoutExercise, 'notes' | 'supersetId'>>,
): Promise<void> {
  await db.workoutExercises.update(weId, patch)
}

export async function saveWorkoutExerciseLayout(
  items: Array<{ id: string; supersetId?: string }>,
): Promise<void> {
  const ids = normalize(items.map((i) => i.supersetId))
  await db.transaction('rw', db.workoutExercises, async () => {
    await Promise.all(
      items.map((it, order) =>
        db.workoutExercises.update(it.id, { order, supersetId: ids[order] }),
      ),
    )
  })
}

/* ---------- Terminar / cancelar ---------- */

export async function discardIncompleteSets(workoutId: string): Promise<void> {
  const sets = await db.workoutSets.where('workoutId').equals(workoutId).toArray()
  await db.workoutSets.bulkDelete(sets.filter((s) => !s.completed).map((s) => s.id))
}

/** Estructura del entreno en formato comparable con la rutina. */
export function workoutStructure(b: WorkoutBundle): StructureItem[] {
  return b.exercises.map((we) => {
    const sets = b.sets.filter((s) => s.workoutExerciseId === we.id)
    const firstSide = sets.find((s) => s.side)?.side
    const mine = sortSets(sets).filter((s) => !firstSide || s.side === firstSide)
    return {
      exerciseId: we.exerciseId,
      sets: mine.map((s) => s.type),
      extras: mine.map((s) => (hasExtras(s.type) ? s.drops.length : 0)),
      supersetId: we.supersetId,
    }
  })
}

export async function routineStructure(routineId: string): Promise<StructureItem[]> {
  const items = byOrder(await db.routineExercises.where('routineId').equals(routineId).toArray())
  return items.map((it) => ({
    exerciseId: it.exerciseId,
    sets: plannedTypes(it),
    supersetId: it.supersetId,
  }))
}

/** Reescribe la rutina con la estructura del entreno (conserva las notas por ejercicio). */
export async function updateRoutineFromWorkout(b: WorkoutBundle): Promise<void> {
  const routineId = b.workout.routineId
  await db.transaction('rw', db.routineExercises, async () => {
    const old = await db.routineExercises.where('routineId').equals(routineId).toArray()
    const oldByExercise = new Map(old.map((o) => [o.exerciseId, o]))
    await db.routineExercises.bulkDelete(old.map((o) => o.id))
    const struct = workoutStructure(b)
    await db.routineExercises.bulkAdd(
      struct.map((it, order) => {
        const prev = oldByExercise.get(it.exerciseId)
        // Con NEG en el ejercicio, las negativas vuelven a ser series normales del plan
        const sets: SetType[] = it.sets.length
          ? it.sets.map((t) => (prev?.negative && t === 'negativa' ? 'normal' : t))
          : ['normal']
        const extras = [...(it.extras ?? [])]
        return {
          id: newId(),
          routineId,
          exerciseId: it.exerciseId,
          order,
          notes: prev?.notes ?? '',
          supersetId: it.supersetId,
          sets,
          ...(extras.some((n) => n > 0) ? { extras } : {}),
          target: prev?.target,
          restSec: prev?.restSec,
          negative: prev?.negative,
          pause: prev?.pause,
        }
      }),
    )
  })
}

export interface ClosingData {
  avgHeartRate?: number
  calories?: number
  rating?: number
  energy?: number
  notes: string
}

/** Último cardio apuntado en un entreno terminado anterior a `before`. */
async function lastCardioBefore(before: number): Promise<CardioValues | null> {
  const done = await db.workouts.where('status').equals('terminado').toArray()
  const latest = done
    .filter((w) => w.cardio && w.startedAt < before)
    .sort((a, b) => b.startedAt - a.startedAt)[0]
  return latest?.cardio ?? null
}

export function useLastCardio(workout: Workout): CardioValues | null | undefined {
  return useLiveQuery(() => lastCardioBefore(workout.startedAt), [workout.startedAt])
}

/** Cambia un dato del cardio sobre el valor actual. */
export async function patchCardio(workoutId: string, patch: Partial<CardioValues>): Promise<void> {
  await db.transaction('rw', db.workouts, async () => {
    const w = await db.workouts.get(workoutId)
    if (!w) return
    await db.workouts.update(workoutId, { cardio: { ...EMPTY_CARDIO, ...w.cardio, ...patch } })
  })
}

/** Cierra el entreno: guarda la duración activa y los datos de cierre. */
export async function finishWorkout(workoutId: string, data: ClosingData): Promise<void> {
  await db.transaction('rw', db.workouts, async () => {
    const w = await db.workouts.get(workoutId)
    if (!w) return
    const now = Date.now()
    const pauses = w.pauses.map((p) => (p.end === undefined ? { ...p, end: now } : p))
    // Los campos de cardio sin tocar aceptan los valores de la última vez
    const cardio = w.cardio
      ? resolveCardio(w.cardio, await lastCardioBefore(w.startedAt))
      : undefined
    await db.workouts.update(workoutId, {
      ...data,
      ...(cardio ? { cardio } : {}),
      status: 'terminado',
      endedAt: now,
      pauses,
      activeSeconds: activeSeconds(w.startedAt, pauses, now),
    })
  })
}

export async function updateWorkout(
  workoutId: string,
  patch: Partial<
    Pick<
      Workout,
      | 'date'
      | 'activeSeconds'
      | 'avgHeartRate'
      | 'calories'
      | 'rating'
      | 'energy'
      | 'notes'
      | 'cardio'
    >
  >,
): Promise<void> {
  // Al cambiar la fecha se mueve también la marca de inicio (mediodía) para mantener el orden
  const extra = patch.date
    ? { startedAt: parseLocalDate(patch.date).getTime() + 12 * 3600_000 }
    : {}
  await db.workouts.update(workoutId, { ...patch, ...extra })
}

/** Borra un entreno con todas sus series. Devuelve un deshacer. */
export async function deleteWorkout(workoutId: string): Promise<() => Promise<void>> {
  const b = await loadWorkout(workoutId)
  await db.transaction('rw', db.workouts, db.workoutExercises, db.workoutSets, async () => {
    await db.workoutSets.where('workoutId').equals(workoutId).delete()
    await db.workoutExercises.where('workoutId').equals(workoutId).delete()
    await db.workouts.delete(workoutId)
  })
  return async () => {
    if (!b) return
    await db.transaction('rw', db.workouts, db.workoutExercises, db.workoutSets, async () => {
      await db.workouts.put(b.workout)
      await db.workoutExercises.bulkPut(b.exercises)
      await db.workoutSets.bulkPut(b.sets)
    })
  }
}

/** Ejercicios de la biblioteca por id (incluye archivados). */
export function useExerciseMap(): Map<string, Exercise> | undefined {
  return useLiveQuery(async () => new Map((await db.exercises.toArray()).map((e) => [e.id, e])))
}

/** Todas las sesiones terminadas de un ejercicio (la más reciente primero). */
export function useExerciseSessions(
  exerciseId: string | undefined,
): Array<{ workout: Workout; sets: WorkoutSet[]; notes: string }> | undefined {
  return useLiveQuery(
    async () => (exerciseId ? previousSessions(exerciseId, '', Number.MAX_SAFE_INTEGER) : []),
    [exerciseId],
  )
}
