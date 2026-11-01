import { describe, expect, it } from 'vitest'
import { activityLevel, heatmapColumns, monthGrid } from './calendar'
import { computeStreak } from './streak'

// 2026-11-04 es miércoles; semanas: 26-oct, 19-oct, 12-oct…
describe('racha semanal', () => {
  it('sin actividad', () => {
    expect(computeStreak([], '2026-11-04')).toEqual({ current: 0, best: 0 })
  })
  it('cuenta semanas seguidas incluida la actual', () => {
    expect(computeStreak(['2026-11-02', '2026-10-28', '2026-10-20'], '2026-11-04').current).toBe(3)
  })
  it('la semana en curso sin actividad no rompe la racha', () => {
    expect(computeStreak(['2026-10-28', '2026-10-20'], '2026-11-04').current).toBe(2)
  })
  it('una semana vacía anterior sí la rompe', () => {
    expect(computeStreak(['2026-10-20', '2026-10-13'], '2026-11-04').current).toBe(0)
  })
  it('varias actividades en la misma semana cuentan una vez', () => {
    expect(computeStreak(['2026-11-02', '2026-11-03', '2026-11-04'], '2026-11-04').current).toBe(1)
  })
  it('mejor racha histórica', () => {
    const dates = ['2026-09-01', '2026-09-08', '2026-09-15', '2026-09-22', '2026-10-28']
    expect(computeStreak(dates, '2026-11-04')).toEqual({ current: 1, best: 4 })
  })
  it('cruza el cambio de año', () => {
    expect(computeStreak(['2025-12-30', '2026-01-05'], '2026-01-07').current).toBe(2)
  })
})

describe('calendario', () => {
  it('noviembre 2026 empieza en lunes 26 de octubre', () => {
    const g = monthGrid(2026, 10)
    expect(g[0]?.[0]).toEqual({ date: '2026-10-26', inMonth: false })
    expect(g[0]?.[6]).toEqual({ date: '2026-11-01', inMonth: true })
    expect(g.flat().filter((d) => d.inMonth)).toHaveLength(30)
    expect(g.every((w) => w.length === 7)).toBe(true)
  })
  it('intensidad del mapa de calor', () => {
    const base = { workouts: 0, runs: 0, rest: false, allSupplements: false, nutritionGood: false }
    expect(activityLevel(base)).toBe(0)
    expect(activityLevel({ ...base, allSupplements: true })).toBe(1)
    expect(activityLevel({ ...base, workouts: 1 })).toBe(2)
    expect(activityLevel({ ...base, workouts: 1, allSupplements: true, nutritionGood: true })).toBe(
      3,
    )
    expect(activityLevel({ ...base, workouts: 1, runs: 1 })).toBe(4)
  })
  it('columnas del mapa de calor terminan hoy', () => {
    const cols = heatmapColumns('2026-11-04', 3)
    expect(cols).toHaveLength(3)
    expect(cols[2]?.[2]).toBe('2026-11-04')
    expect(cols[2]?.[3]).toBeNull()
    expect(cols[0]?.[0]).toBe('2026-10-19')
  })
})
