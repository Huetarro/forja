import { allSupplementsTaken, type RangeData } from '@/db/days'
import type { DayActivity } from '@/domain/calendar'
import type { LocalDate } from '@/domain/dates'

export interface DayMarks extends DayActivity {
  /** colores (índice de paleta) de las rutinas entrenadas ese día */
  gymColors: number[]
  /** algún entreno de ese día incluyó cardio */
  cardio: boolean
}

/** Resume lo que pasó un día a partir de los datos del rango. */
export function marksFor(data: RangeData, date: LocalDate): DayMarks {
  const workouts = data.workouts.filter((w) => w.date === date)
  const log = data.logs.get(date)
  return {
    workouts: workouts.length,
    runs: data.runs.filter((r) => r.date === date).length,
    rest: log?.rest === true,
    allSupplements: allSupplementsTaken(log, data.supplements),
    nutritionGood: log?.nutrition === 'bien',
    gymColors: workouts.map((w) => data.routineColors.get(w.routineId) ?? 10),
    cardio: workouts.some((w) => w.cardio !== undefined),
  }
}
