import { addDaysLocal, weekStart, type LocalDate } from './dates'

/** Ritmo en segundos por km (null si no hay distancia). */
export function paceSecPerKm(durationSec: number, km: number): number | null {
  if (!(km > 0) || !(durationSec > 0)) return null
  return durationSec / km
}

/** "5:07 /km" (o "—" si no hay ritmo). */
export function formatPace(secPerKm: number | null, withUnit = true): string {
  if (secPerKm === null || !Number.isFinite(secPerKm)) return '—'
  let m = Math.floor(secPerKm / 60)
  let s = Math.round(secPerKm - m * 60)
  if (s === 60) {
    m += 1
    s = 0
  }
  return `${m}:${String(s).padStart(2, '0')}${withUnit ? ' /km' : ''}`
}

/** Segundos a partir de horas, minutos y segundos. */
export function hmsToSeconds(h: number, m: number, s: number): number {
  return h * 3600 + m * 60 + s
}

export function secondsToHms(total: number): { h: number; m: number; s: number } {
  const t = Math.max(0, Math.round(total))
  return { h: Math.floor(t / 3600), m: Math.floor((t % 3600) / 60), s: t % 60 }
}

export interface RunLike {
  date: LocalDate
  distanceKm: number
  durationSec: number
  avgHeartRate?: number
}

/** Kilómetros por semana (lunes) de las últimas `weeks` semanas, de la más antigua a la actual. */
export function kmByWeek(
  runs: readonly RunLike[],
  today: LocalDate,
  weeks = 12,
): Array<{ week: LocalDate; km: number }> {
  const current = weekStart(today)
  const out = Array.from({ length: weeks }, (_, i) => ({
    week: addDaysLocal(current, -7 * (weeks - 1 - i)),
    km: 0,
  }))
  const index = new Map(out.map((o, i) => [o.week, i]))
  for (const r of runs) {
    const i = index.get(weekStart(r.date))
    if (i !== undefined && out[i]) out[i].km += r.distanceKm
  }
  return out
}

/** Kilómetros por mes (YYYY-MM) de los últimos `months` meses. */
export function kmByMonth(
  runs: readonly RunLike[],
  today: LocalDate,
  months = 12,
): Array<{ month: string; km: number }> {
  const [y, m] = today.split('-').map(Number) as [number, number]
  const out = Array.from({ length: months }, (_, i) => {
    const d = new Date(y, m - 1 - (months - 1 - i), 1)
    return { month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, km: 0 }
  })
  const index = new Map(out.map((o, i) => [o.month, i]))
  for (const r of runs) {
    const i = index.get(r.date.slice(0, 7))
    if (i !== undefined && out[i]) out[i].km += r.distanceKm
  }
  return out
}

export interface RunRecords<T extends RunLike> {
  longest?: T
  bestPace5k?: T
  bestPace10k?: T
  bestWeek?: { week: LocalDate; km: number }
  bestMonth?: { month: string; km: number }
}

/** Récords: carrera más larga, mejor ritmo (≥5 km y ≥10 km), semana y mes con más km. */
export function runRecords<T extends RunLike>(runs: readonly T[]): RunRecords<T> {
  const rec: RunRecords<T> = {}
  const pace = (r: T) => paceSecPerKm(r.durationSec, r.distanceKm) ?? Infinity
  const weeks = new Map<LocalDate, number>()
  const months = new Map<string, number>()
  for (const r of runs) {
    if (!rec.longest || r.distanceKm > rec.longest.distanceKm) rec.longest = r
    if (r.distanceKm >= 5 && (!rec.bestPace5k || pace(r) < pace(rec.bestPace5k))) rec.bestPace5k = r
    if (r.distanceKm >= 10 && (!rec.bestPace10k || pace(r) < pace(rec.bestPace10k)))
      rec.bestPace10k = r
    const w = weekStart(r.date)
    weeks.set(w, (weeks.get(w) ?? 0) + r.distanceKm)
    const mo = r.date.slice(0, 7)
    months.set(mo, (months.get(mo) ?? 0) + r.distanceKm)
  }
  for (const [week, km] of weeks)
    if (!rec.bestWeek || km > rec.bestWeek.km) rec.bestWeek = { week, km }
  for (const [month, km] of months)
    if (!rec.bestMonth || km > rec.bestMonth.km) rec.bestMonth = { month, km }
  return rec
}

/** Totales de un año: km, número de carreras y tiempo. */
export function yearTotals(
  runs: readonly RunLike[],
  year: number,
): { km: number; count: number; seconds: number } {
  const list = runs.filter((r) => r.date.startsWith(`${year}-`))
  return {
    km: list.reduce((s, r) => s + r.distanceKm, 0),
    count: list.length,
    seconds: list.reduce((s, r) => s + r.durationSec, 0),
  }
}

/** Marcas "redondas" para un eje de ritmo (cada 15, 30 o 60 s). */
export function paceTicks(values: readonly number[]): {
  domain: [number, number]
  ticks: number[]
} {
  if (values.length === 0) return { domain: [240, 420], ticks: [240, 300, 360, 420] }
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min
  const step = range <= 60 ? 15 : range <= 180 ? 30 : 60
  const lo = Math.floor(min / step) * step
  const hi = Math.max(lo + step, Math.ceil(max / step) * step)
  const ticks: number[] = []
  for (let t = lo; t <= hi; t += step) ticks.push(t)
  return { domain: [lo, hi], ticks }
}
