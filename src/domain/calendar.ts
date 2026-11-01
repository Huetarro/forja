import { addDaysLocal, toLocalDate, weekStart, type LocalDate } from './dates'

export interface GridDay {
  date: LocalDate
  inMonth: boolean
}

/** Cuadrícula de un mes (semanas de lunes a domingo). `month` va de 0 a 11. */
export function monthGrid(year: number, month: number): GridDay[][] {
  const first = toLocalDate(new Date(year, month, 1))
  const last = toLocalDate(new Date(year, month + 1, 0))
  const weeks: GridDay[][] = []
  let cursor = weekStart(first)
  while (cursor <= last) {
    const week: GridDay[] = []
    for (let i = 0; i < 7; i++) {
      const date = addDaysLocal(cursor, i)
      week.push({ date, inMonth: date >= first && date <= last })
    }
    weeks.push(week)
    cursor = addDaysLocal(cursor, 7)
  }
  return weeks
}

export interface DayActivity {
  workouts: number
  runs: number
  rest: boolean
  allSupplements: boolean
  nutritionGood: boolean
}

/** Intensidad 0-4 para el mapa de calor anual. */
export function activityLevel(a: DayActivity): number {
  const sport = a.workouts * 2 + a.runs * 2
  const habits = (a.allSupplements ? 0.5 : 0) + (a.nutritionGood ? 0.5 : 0)
  const score = sport + habits
  if (score === 0) return 0
  if (sport === 0) return 1
  if (score < 2.5) return 2
  if (score < 4) return 3
  return 4
}

/**
 * Semanas (columnas, de lunes a domingo) de las últimas `weeks` semanas hasta hoy.
 * Los días futuros de la semana actual se devuelven como null.
 */
export function heatmapColumns(today: LocalDate, weeks = 53): Array<Array<LocalDate | null>> {
  const start = addDaysLocal(weekStart(today), -7 * (weeks - 1))
  return Array.from({ length: weeks }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const date = addDaysLocal(start, w * 7 + d)
      return date > today ? null : date
    }),
  )
}
