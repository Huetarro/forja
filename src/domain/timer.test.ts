import { describe, expect, it } from 'vitest'
import { activeSeconds, formatClock, formatDuration, isPaused } from './timer'

const T0 = 1_700_000_000_000

describe('cronómetro por marcas de tiempo', () => {
  it('sin pausas', () => {
    expect(activeSeconds(T0, [], T0 + 65_000)).toBe(65)
  })
  it('descuenta las pausas cerradas', () => {
    expect(activeSeconds(T0, [{ start: T0 + 10_000, end: T0 + 40_000 }], T0 + 100_000)).toBe(70)
  })
  it('una pausa activa congela el tiempo', () => {
    const pauses = [{ start: T0 + 60_000 }]
    expect(activeSeconds(T0, pauses, T0 + 60_000)).toBe(60)
    expect(activeSeconds(T0, pauses, T0 + 600_000)).toBe(60)
    expect(isPaused(pauses)).toBe(true)
  })
  it('respeta la hora de fin', () => {
    expect(activeSeconds(T0, [], T0 + 999_000, T0 + 30_000)).toBe(30)
  })
  it('formatos', () => {
    expect(formatClock(3725)).toBe('01:02:05')
    expect(formatClock(95, true)).toBe('1:35')
    expect(formatDuration(3900)).toBe('1 h 05 min')
    expect(formatDuration(2520)).toBe('42 min')
  })
})
