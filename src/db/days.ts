/** Registro diario, suplementos, fotos y datos agregados para calendario e inicio. */
import { useLiveQuery } from 'dexie-react-hooks'
import { addDaysLocal, todayLocal, type LocalDate } from '@/domain/dates'
import { byOrder, nextOrder } from '@/domain/ordering'
import { computeStreak, type StreakResult } from '@/domain/streak'
import { totalVolumeKg } from '@/domain/summary'
import { db, newId } from './db'
import type { DayLog, ProgressPhoto, Run, Supplement, Workout } from './schema'

export function emptyDayLog(date: LocalDate): DayLog {
  return { date, rest: false, supplements: {}, nutrition: null, stretching: false, notes: '' }
}

export function useDayLog(date: LocalDate): DayLog | undefined {
  return useLiveQuery(async () => (await db.dayLogs.get(date)) ?? emptyDayLog(date), [date])
}

export async function updateDayLog(
  date: LocalDate,
  patch: Partial<Omit<DayLog, 'date'>>,
): Promise<void> {
  await db.transaction('rw', db.dayLogs, async () => {
    const current = (await db.dayLogs.get(date)) ?? emptyDayLog(date)
    await db.dayLogs.put({ ...current, ...patch, date })
  })
}

export async function toggleSupplement(date: LocalDate, id: string): Promise<void> {
  await db.transaction('rw', db.dayLogs, async () => {
    const current = (await db.dayLogs.get(date)) ?? emptyDayLog(date)
    await db.dayLogs.put({
      ...current,
      supplements: { ...current.supplements, [id]: !current.supplements[id] },
    })
  })
}

export async function setAllSupplements(
  date: LocalDate,
  ids: string[],
  value: boolean,
): Promise<void> {
  await db.transaction('rw', db.dayLogs, async () => {
    const current = (await db.dayLogs.get(date)) ?? emptyDayLog(date)
    const supplements = { ...current.supplements }
    for (const id of ids) supplements[id] = value
    await db.dayLogs.put({ ...current, supplements })
  })
}

/** ¿Están marcados todos los suplementos activos? */
export function allSupplementsTaken(log: DayLog | undefined, active: Supplement[]): boolean {
  return active.length > 0 && active.every((s) => log?.supplements[s.id] === true)
}

/* ---------- Suplementos ---------- */

export function useSupplements(includeInactive = false): Supplement[] | undefined {
  return useLiveQuery(async () => {
    const all = byOrder(await db.supplements.toArray())
    return includeInactive ? all : all.filter((s) => s.active)
  }, [includeInactive])
}

export async function addSupplement(name: string): Promise<void> {
  const order = nextOrder(await db.supplements.toArray())
  await db.supplements.add({ id: newId(), name: name.trim(), order, active: true })
}

export async function updateSupplement(
  id: string,
  patch: Partial<Omit<Supplement, 'id'>>,
): Promise<void> {
  await db.supplements.update(id, patch)
}

export async function reorderSupplements(ids: string[]): Promise<void> {
  await db.transaction('rw', db.supplements, async () => {
    await Promise.all(ids.map((id, order) => db.supplements.update(id, { order })))
  })
}

/* ---------- Fotos de progreso ---------- */

/** Reduce la imagen a 1600 px como máximo y la guarda en JPEG calidad 0,8. */
export async function compressImage(file: Blob, maxSide = 1600, quality = 0.8): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
  const w = Math.round(bitmap.width * scale)
  const h = Math.round(bitmap.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas no disponible')
  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close()
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('No se pudo comprimir'))),
      'image/jpeg',
      quality,
    ),
  )
}

export async function addPhoto(date: LocalDate, file: Blob): Promise<void> {
  const image = await compressImage(file)
  await db.photos.add({ id: newId(), date, image, note: '', createdAt: Date.now() })
}

export function usePhotos(date?: LocalDate): ProgressPhoto[] | undefined {
  return useLiveQuery(async () => {
    const list = date
      ? await db.photos.where('date').equals(date).toArray()
      : await db.photos.toArray()
    return list.sort((a, b) => a.date.localeCompare(b.date) || a.createdAt - b.createdAt)
  }, [date])
}

export async function deletePhoto(id: string): Promise<() => Promise<void>> {
  const p = await db.photos.get(id)
  await db.photos.delete(id)
  return async () => {
    if (p) await db.photos.put(p)
  }
}

/* ---------- Datos por rango de fechas ---------- */

export interface RangeData {
  workouts: Workout[]
  runs: Run[]
  logs: Map<LocalDate, DayLog>
  routineColors: Map<string, number>
  supplements: Supplement[]
}

export function useRangeData(from: LocalDate, to: LocalDate): RangeData | undefined {
  return useLiveQuery(async () => {
    const workouts = (
      await db.workouts.where('date').between(from, to, true, true).toArray()
    ).filter((w) => w.status === 'terminado')
    const runs = await db.runs.where('date').between(from, to, true, true).toArray()
    const logs = new Map(
      (await db.dayLogs.where('date').between(from, to, true, true).toArray()).map((l) => [
        l.date,
        l,
      ]),
    )
    const routineColors = new Map((await db.routines.toArray()).map((r) => [r.id, r.color]))
    const supplements = byOrder(await db.supplements.toArray()).filter((s) => s.active)
    return { workouts, runs, logs, routineColors, supplements }
  }, [from, to])
}

/** Racha semanal (entrenos terminados o carreras). */
export function useStreak(): StreakResult | undefined {
  return useLiveQuery(async () => {
    const dates: LocalDate[] = []
    await db.workouts
      .where('status')
      .equals('terminado')
      .each((w) => dates.push(w.date))
    await db.runs.each((r) => dates.push(r.date))
    return computeStreak(dates, todayLocal())
  })
}

export interface WeekTotals {
  seconds: number
  volumeKg: number
  km: number
}

/** Tiempo, volumen (kg) y km de una lista de entrenos y carreras. */
export async function totalsFor(workouts: Workout[], runs: Run[]): Promise<WeekTotals> {
  let volumeKg = 0
  for (const w of workouts) {
    const wes = await db.workoutExercises.where('workoutId').equals(w.id).toArray()
    const sets = await db.workoutSets.where('workoutId').equals(w.id).toArray()
    const items = await Promise.all(
      wes.map(async (we) => ({
        unit: (await db.exercises.get(we.exerciseId))?.unit ?? ('kg' as const),
        sets: sets.filter((s) => s.workoutExerciseId === we.id),
      })),
    )
    volumeKg += totalVolumeKg(items)
  }
  return {
    seconds:
      workouts.reduce((s, w) => s + w.activeSeconds, 0) +
      runs.reduce((s, r) => s + r.durationSec, 0),
    volumeKg,
    km: runs.reduce((s, r) => s + r.distanceKm, 0),
  }
}

export function useWeekTotals(from: LocalDate): WeekTotals | undefined {
  const to = addDaysLocal(from, 6)
  return useLiveQuery(async () => {
    const workouts = (
      await db.workouts.where('date').between(from, to, true, true).toArray()
    ).filter((w) => w.status === 'terminado')
    const runs = await db.runs.where('date').between(from, to, true, true).toArray()
    return totalsFor(workouts, runs)
  }, [from, to])
}

/** ¿Hay datos que merezca la pena respaldar? */
export function useHasData(): boolean | undefined {
  return useLiveQuery(async () => (await db.workouts.count()) + (await db.runs.count()) > 0)
}

/** Todos los pesos corporales apuntados en el registro diario. */
export function useBodyWeights(): Array<{ date: LocalDate; value: number }> | undefined {
  return useLiveQuery(async () => {
    const out: Array<{ date: LocalDate; value: number }> = []
    await db.dayLogs.each((l) => {
      if (l.bodyWeight !== undefined) out.push({ date: l.date, value: l.bodyWeight })
    })
    return out
  })
}
