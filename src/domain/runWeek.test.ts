import { describe, expect, it } from 'vitest'
import { runWeekComparison } from './runWeek'

describe('km semanales', () => {
  it('esta semana, la anterior y +10 %', () => {
    const runs = [
      { date: '2026-10-27', distanceKm: 6 },
      { date: '2026-10-31', distanceKm: 12 },
      { date: '2026-11-04', distanceKm: 6.5 },
      { date: '2026-10-20', distanceKm: 30 },
    ]
    expect(runWeekComparison(runs, '2026-11-07')).toEqual({
      thisWeek: 6.5,
      lastWeek: 18,
      maxRecommended: 19.8,
    })
  })
  it('sin semana anterior no hay máximo', () => {
    expect(runWeekComparison([], '2026-11-07').maxRecommended).toBeNull()
  })
})
