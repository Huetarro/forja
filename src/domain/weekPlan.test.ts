import { describe, expect, it } from 'vitest'
import { hasWeekPlan, planForDate, weekdayOf } from './weekPlan'

describe('plan semanal', () => {
  it('día de la semana de lunes (1) a domingo (7)', () => {
    expect(weekdayOf('2026-11-02')).toBe(1) // lunes
    expect(weekdayOf('2026-11-04')).toBe(3)
    expect(weekdayOf('2026-11-08')).toBe(7) // domingo
  })
  it('lo que toca hoy según el día', () => {
    const plan = {
      1: { kind: 'rutina' as const, routineId: 'empuje' },
      3: {
        kind: 'carrera' as const,
        runType: 'rodaje' as const,
        label: 'Carrera zona 2 · 30-40 min',
      },
      7: { kind: 'descanso' as const },
    }
    expect(planForDate(plan, '2026-11-09')).toEqual({ kind: 'rutina', routineId: 'empuje' })
    expect(planForDate(plan, '2026-11-11')).toMatchObject({ kind: 'carrera', runType: 'rodaje' })
    expect(planForDate(plan, '2026-11-08')).toEqual({ kind: 'descanso' })
    expect(planForDate(plan, '2026-11-10')).toBeNull()
    expect(planForDate(undefined, '2026-11-10')).toBeNull()
    expect(hasWeekPlan(plan)).toBe(true)
    expect(hasWeekPlan({})).toBe(false)
  })
})
