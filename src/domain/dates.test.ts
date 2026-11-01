import { describe, expect, it } from 'vitest'
import { addDaysLocal, daysBetween, longDate, relativeDays, weekDays, weekStart } from './dates'

describe('fechas locales', () => {
  it('la semana empieza en lunes', () => {
    expect(weekStart('2026-11-01')).toBe('2026-10-26') // domingo → lunes anterior
    expect(weekStart('2026-11-02')).toBe('2026-11-02') // lunes
  })
  it('weekDays devuelve de lunes a domingo', () => {
    const d = weekDays('2026-11-04')
    expect(d).toHaveLength(7)
    expect(d[0]).toBe('2026-11-02')
    expect(d[6]).toBe('2026-11-08')
  })
  it('suma días cruzando el cambio de hora', () => {
    expect(addDaysLocal('2026-10-24', 2)).toBe('2026-10-26')
    expect(daysBetween('2026-10-24', '2026-10-26')).toBe(2)
  })
  it('texto relativo', () => {
    expect(relativeDays('2026-11-01', '2026-11-01')).toBe('hoy')
    expect(relativeDays('2026-10-31', '2026-11-01')).toBe('ayer')
    expect(relativeDays('2026-10-25', '2026-11-01')).toBe('hace 7 días')
  })
  it('fecha larga en español', () => {
    expect(longDate('2026-11-01')).toBe('domingo, 1 de noviembre')
  })
})
