/** Estadísticas (funciones puras). */
import type { ExerciseMetric, Muscle, Side } from '@/db/schema'
import { addDaysLocal, daysBetween, weekStart, type LocalDate } from './dates'
import { epley } from './oneRm'
import { toKg, type WeightUnit } from './units'
import { isEffectiveSet, volume, type SetLike } from './volume'
import { sessionRecords, type SessionRecord } from './records'

/* ---------- Rangos ---------- */

export type RangeKey = '4s' | '3m' | '6m' | '1a' | 'todo'

export const RANGE_LABEL: Record<RangeKey, string> = {
  '4s': '4 sem',
  '3m': '3 meses',
  '6m': '6 meses',
  '1a': '1 año',
  todo: 'Todo',
}

const RANGE_DAYS: Record<Exclude<RangeKey, 'todo'>, number> = {
  '4s': 28,
  '3m': 91,
  '6m': 182,
  '1a': 364,
}

export interface RangeBounds {
  from: LocalDate
  to: LocalDate
  days: number
  /** periodo anterior del mismo tamaño (null en "Todo") */
  prev: { from: LocalDate; to: LocalDate } | null
}

export function rangeBounds(key: RangeKey, today: LocalDate, earliest?: LocalDate): RangeBounds {
  if (key === 'todo') {
    const from = earliest && earliest < today ? earliest : today
    return { from, to: today, days: daysBetween(from, today) + 1, prev: null }
  }
  const days = RANGE_DAYS[key]
  const from = addDaysLocal(today, -(days - 1))
  return {
    from,
    to: today,
    days,
    prev: { from: addDaysLocal(from, -days), to: addDaysLocal(from, -1) },
  }
}

export const inRange = (d: LocalDate, r: { from: LocalDate; to: LocalDate }) =>
  d >= r.from && d <= r.to

/* ---------- Datos de entrada normalizados ---------- */

export interface ExerciseInfo {
  id: string
  name: string
  unit: WeightUnit
  primaryMuscle: Muscle
  secondaryMuscles: Muscle[]
  unilateral: boolean
  /** v2: reps (por defecto) o segundos */
  metric?: ExerciseMetric
  /** v2: kg opcional (peso corporal) */
  noLoad?: boolean
}

/** El progreso se mide por reps o segundos (sin kg o por tiempo), no por 1RM. */
export function measuredByReps(e: Pick<ExerciseInfo, 'metric' | 'noLoad'>): boolean {
  return e.noLoad === true || e.metric === 'segundos'
}

export interface SessionData {
  workoutId: string
  date: LocalDate
  routineId: string
  activeSeconds: number
  avgHeartRate?: number
  calories?: number
  /** v2: sesión de descarga (no cuenta para el estancamiento) */
  deload?: boolean
  /** v3: minutos de cardio del entreno */
  cardioMinutes?: number
  exercises: Array<{ exerciseId: string; sets: SetLike[] }>
}

/* ---------- Resumen ---------- */

export interface OverviewStats {
  workouts: number
  workoutsPerWeek: number
  avgDurationSec: number
  totalSec: number
  volumeKg: number
  sets: number
  avgHeartRate: number | null
  avgCalories: number | null
  runs: number
}

export function overview(
  sessions: readonly SessionData[],
  exercises: ReadonlyMap<string, ExerciseInfo>,
  runCount: number,
  days: number,
): OverviewStats {
  let volumeKg = 0
  let sets = 0
  for (const s of sessions)
    for (const e of s.exercises) {
      const unit = exercises.get(e.exerciseId)?.unit ?? 'kg'
      volumeKg += toKg(volume(e.sets), unit)
      sets += e.sets.filter(isEffectiveSet).length
    }
  const totalSec = sessions.reduce((t, s) => t + s.activeSeconds, 0)
  const hr = sessions.filter((s) => s.avgHeartRate !== undefined)
  const kcal = sessions.filter((s) => s.calories !== undefined)
  return {
    workouts: sessions.length,
    workoutsPerWeek: days > 0 ? sessions.length / (days / 7) : 0,
    avgDurationSec: sessions.length ? totalSec / sessions.length : 0,
    totalSec,
    volumeKg,
    sets,
    avgHeartRate: hr.length ? hr.reduce((t, s) => t + (s.avgHeartRate ?? 0), 0) / hr.length : null,
    avgCalories: kcal.length ? kcal.reduce((t, s) => t + (s.calories ?? 0), 0) / kcal.length : null,
    runs: runCount,
  }
}

/** Serie semanal (lunes) entre dos fechas con un valor por semana. */
export function weeklySeries<T>(
  items: readonly T[],
  dateOf: (t: T) => LocalDate,
  valueOf: (t: T) => number,
  from: LocalDate,
  to: LocalDate,
): Array<{ week: LocalDate; value: number }> {
  const out: Array<{ week: LocalDate; value: number }> = []
  for (let w = weekStart(from); w <= to; w = addDaysLocal(w, 7)) out.push({ week: w, value: 0 })
  const idx = new Map(out.map((o, i) => [o.week, i]))
  for (const it of items) {
    const i = idx.get(weekStart(dateOf(it)))
    if (i !== undefined && out[i]) out[i].value += valueOf(it)
  }
  return out
}

/* ---------- Ejercicios ---------- */

export interface SessionMetrics {
  date: LocalDate
  workoutId: string
  side?: Side
  best1rm: number | null
  maxWeight: number
  /** v2: máximo de reps (o segundos) en una serie efectiva */
  maxReps: number
  volume: number
  bestSet: { weight: number; reps: number } | null
}

/** Métricas por sesión de un ejercicio (por lado si es unilateral), orden cronológico. */
export function exerciseSessions(
  sessions: readonly SessionData[],
  exerciseId: string,
  side?: Side,
): SessionMetrics[] {
  const out: SessionMetrics[] = []
  for (const s of [...sessions].sort((a, b) => a.date.localeCompare(b.date))) {
    const sets = s.exercises
      .filter((e) => e.exerciseId === exerciseId)
      .flatMap((e) => e.sets)
      .filter((x) => (side ? x.side === side : true))
    const eff = sets.filter(isEffectiveSet)
    if (eff.length === 0) continue
    let best1rm: number | null = null
    let bestSet: SessionMetrics['bestSet'] = null
    for (const x of eff) {
      const rm = epley(x.weight, x.reps)
      if (rm !== null && (best1rm === null || rm > best1rm)) {
        best1rm = rm
        bestSet = { weight: x.weight, reps: x.reps }
      }
    }
    out.push({
      date: s.date,
      workoutId: s.workoutId,
      side,
      best1rm,
      maxWeight: Math.max(...eff.map((x) => x.weight)),
      maxReps: Math.max(...eff.map((x) => x.reps)),
      volume: volume(sets),
      bestSet: bestSet ?? { weight: eff[0]?.weight ?? 0, reps: eff[0]?.reps ?? 0 },
    })
  }
  return out
}

export interface RecordsTable {
  maxWeight: { value: number; date: LocalDate } | null
  best1rm: { value: number; date: LocalDate } | null
  maxVolume: { value: number; date: LocalDate } | null
  /** v2: más reps (o segundos) en una serie */
  maxReps: { value: number; date: LocalDate } | null
  /** peso → más reps, ordenado por peso descendente */
  repsByWeight: Array<{ weight: number; reps: number; date: LocalDate }>
}

export function recordsTable(
  sessions: readonly SessionData[],
  exerciseId: string,
  side?: Side,
): RecordsTable {
  const t: RecordsTable = {
    maxWeight: null,
    best1rm: null,
    maxVolume: null,
    maxReps: null,
    repsByWeight: [],
  }
  const reps = new Map<number, { reps: number; date: LocalDate }>()
  for (const s of sessions) {
    const sets = s.exercises
      .filter((e) => e.exerciseId === exerciseId)
      .flatMap((e) => e.sets)
      .filter((x) => (side ? x.side === side : true))
    for (const x of sets) {
      if (!isEffectiveSet(x)) continue
      if (!t.maxWeight || x.weight > t.maxWeight.value)
        t.maxWeight = { value: x.weight, date: s.date }
      if (!t.maxReps || x.reps > t.maxReps.value) t.maxReps = { value: x.reps, date: s.date }
      const rm = epley(x.weight, x.reps)
      if (rm !== null && (!t.best1rm || rm > t.best1rm.value))
        t.best1rm = { value: rm, date: s.date }
      const prev = reps.get(x.weight)
      if (!prev || x.reps > prev.reps) reps.set(x.weight, { reps: x.reps, date: s.date })
    }
    const v = volume(sets)
    if (v > 0 && (!t.maxVolume || v > t.maxVolume.value)) t.maxVolume = { value: v, date: s.date }
  }
  t.repsByWeight = [...reps.entries()]
    .map(([weight, r]) => ({ weight, ...r }))
    .sort((a, b) => b.weight - a.weight)
  return t
}

export const STAGNATION = { sessions: 4, days: 21 }

/**
 * Estancamiento: el mejor 1RM estimado no mejora en las últimas 4 sesiones
 * y han pasado al menos 3 semanas desde que se logró.
 */
export function isStagnant(metrics: readonly SessionMetrics[]): boolean {
  const withRm = metrics.filter(
    (m): m is SessionMetrics & { best1rm: number } => m.best1rm !== null,
  )
  if (withRm.length < STAGNATION.sessions + 1) return false
  let bestIdx = 0
  withRm.forEach((m, i) => {
    if (m.best1rm > (withRm[bestIdx]?.best1rm ?? 0)) bestIdx = i
  })
  const after = withRm.length - 1 - bestIdx
  const best = withRm[bestIdx]
  const last = withRm[withRm.length - 1]
  if (!best || !last) return false
  return after >= STAGNATION.sessions && daysBetween(best.date, last.date) >= STAGNATION.days
}

/** Tendencia en % entre el primer y el último valor. */
export function trendPct(values: readonly number[]): number | null {
  const first = values[0]
  const last = values[values.length - 1]
  if (values.length < 2 || first === undefined || last === undefined || first === 0) return null
  return ((last - first) / first) * 100
}

/* ---------- Músculos ---------- */

export interface MuscleLoad {
  sets: number
  volumeKg: number
}

/** Series y volumen por grupo muscular (los secundarios cuentan como serie completa). */
export function muscleLoad(
  sessions: readonly SessionData[],
  exercises: ReadonlyMap<string, ExerciseInfo>,
): Map<Muscle, MuscleLoad> {
  const m = new Map<Muscle, MuscleLoad>()
  for (const s of sessions)
    for (const e of s.exercises) {
      const info = exercises.get(e.exerciseId)
      if (!info) continue
      const eff = e.sets.filter(isEffectiveSet)
      // En unilaterales, una serie Izq + Der cuenta como una serie para el músculo
      const setCount = info.unilateral ? Math.ceil(eff.length / 2) : eff.length
      const vol = toKg(volume(e.sets), info.unit)
      for (const muscle of new Set([info.primaryMuscle, ...info.secondaryMuscles])) {
        const cur = m.get(muscle) ?? { sets: 0, volumeKg: 0 }
        m.set(muscle, { sets: cur.sets + setCount, volumeKg: cur.volumeKg + vol })
      }
    }
  return m
}

/** Nivel 0-4 de color de un músculo según sus series semanales. */
export function muscleLevel(sets: number): number {
  if (sets <= 0) return 0
  if (sets < 6) return 1
  if (sets < 11) return 2
  if (sets < 16) return 3
  return 4
}

/* ---------- Cuerpo y hábitos ---------- */

/** Media móvil de 7 días (por fecha), solo en días con dato. */
export function movingAverage7(points: ReadonlyArray<{ date: LocalDate; value: number }>): Array<{
  date: LocalDate
  value: number
  avg: number
}> {
  const sorted = [...points].sort((a, b) => a.date.localeCompare(b.date))
  return sorted.map((p) => {
    const window = sorted.filter((q) => q.date <= p.date && daysBetween(q.date, p.date) < 7)
    return { ...p, avg: window.reduce((t, q) => t + q.value, 0) / window.length }
  })
}

export interface DayHabit {
  date: LocalDate
  allSupplements: boolean
  nutrition: 'bien' | 'mal' | null
  sleepHours?: number
  stretching: boolean
}

export interface HabitStats {
  supplementsPct: number
  nutritionPct: number
  avgSleep: number | null
  stretchingPct: number
}

/** Hábitos sobre todos los días del rango (los días sin registro cuentan como no hechos). */
export function habitStats(days: readonly DayHabit[], totalDays: number): HabitStats {
  const n = Math.max(1, totalDays)
  const sleep = days.filter((d) => d.sleepHours !== undefined)
  return {
    supplementsPct: (days.filter((d) => d.allSupplements).length / n) * 100,
    nutritionPct: (days.filter((d) => d.nutrition === 'bien').length / n) * 100,
    avgSleep: sleep.length
      ? sleep.reduce((t, d) => t + (d.sleepHours ?? 0), 0) / sleep.length
      : null,
    stretchingPct: (days.filter((d) => d.stretching).length / n) * 100,
  }
}

/* ---------- Récords recientes ---------- */

export interface RecentRecord extends SessionRecord {
  date: LocalDate
  workoutId: string
  exerciseId: string
}

/** Récords batidos en las sesiones del rango (comparando con todo lo anterior), más recientes primero. */
export function recentRecords(
  sessions: readonly SessionData[],
  range: { from: LocalDate; to: LocalDate },
): RecentRecord[] {
  const sorted = [...sessions].sort((a, b) => a.date.localeCompare(b.date))
  const history = new Map<string, SetLike[][]>()
  const out: RecentRecord[] = []
  for (const s of sorted) {
    for (const e of s.exercises) {
      const prev = history.get(e.exerciseId) ?? []
      if (inRange(s.date, range))
        for (const r of sessionRecords(prev, e.sets))
          out.push({ ...r, date: s.date, workoutId: s.workoutId, exerciseId: e.exerciseId })
      history.set(e.exerciseId, [...prev, e.sets])
    }
  }
  return out.reverse()
}
