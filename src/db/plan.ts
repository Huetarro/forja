/** Plan semanal, semana de descarga y estiramientos. */
import { useLiveQuery } from 'dexie-react-hooks'
import { todayLocal, type LocalDate } from '@/domain/dates'
import { db } from './db'
import { DEFAULT_SETTINGS, type DayPlan, type WeekPlan, type Weekday } from './schema'
import { updateDayLog } from './days'
import { updateSettings } from './settings'

export const DEFAULT_STRETCHES = [
  'Flexor de cadera',
  'Isquios',
  'Paloma',
  'Gemelo',
  'Cuádriceps',
  'Pecho en puerta',
  'Dorsal colgado',
  'Rotaciones torácicas',
]

/** Segundos de cada estiramiento con el temporizador opcional. */
export const STRETCH_SECONDS = 45

export async function setDayPlan(day: Weekday, plan: DayPlan | null): Promise<void> {
  const s = (await db.settings.get('app')) ?? DEFAULT_SETTINGS
  const weekPlan = Object.fromEntries(
    Object.entries({ ...s.weekPlan, [day]: plan }).filter(([, v]) => v !== null),
  ) as WeekPlan
  await updateSettings({ weekPlan })
}

/** Activa o desactiva la semana de descarga. */
export async function setDeload(active: boolean): Promise<void> {
  await updateSettings({
    deload: active ? { active: true, since: todayLocal() } : { active: false },
  })
}

/** Fecha del último entreno de descarga (o undefined si no hubo). */
export function useLastDeloadDate(): LocalDate | undefined | null {
  return useLiveQuery(async () => {
    let last: LocalDate | undefined
    await db.workouts
      .where('status')
      .equals('terminado')
      .each((w) => {
        if (w.deload && (!last || w.date > last)) last = w.date
      })
    return last ?? null
  })
}

export async function setStretchList(list: string[]): Promise<void> {
  await updateSettings({ stretchList: list.map((s) => s.trim()).filter(Boolean) })
}

/** Marca un estiramiento del entreno; si están todos, se marca "estiramientos" en el día. */
export async function toggleStretch(
  workoutId: string,
  name: string,
  all: readonly string[],
  /** true/false fuerza el estado; sin indicar, alterna */
  force?: boolean,
): Promise<boolean> {
  const w = await db.workouts.get(workoutId)
  if (!w) return false
  const done = new Set(w.stretchesDone ?? [])
  const on = force ?? !done.has(name)
  if (on) done.add(name)
  else done.delete(name)
  const list = all.filter((s) => done.has(s))
  await db.workouts.update(workoutId, { stretchesDone: list })
  const complete = all.length > 0 && all.every((s) => done.has(s))
  if (complete) await updateDayLog(w.date, { stretching: true })
  return complete
}
