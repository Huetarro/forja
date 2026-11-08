import { describe, expect, it } from 'vitest'
import {
  cleanIncline,
  cleanMinutes,
  EMPTY_CARDIO,
  formatCardio,
  minutesPerWeek,
  resolveCardio,
} from './cardio'

describe('cardio', () => {
  it('limita la inclinación de 0 a 30 y admite medios', () => {
    expect(cleanIncline(0.5)).toBe(0.5)
    expect(cleanIncline(0)).toBe(0)
    expect(cleanIncline(35)).toBe(30)
    expect(cleanIncline(-2)).toBe(0)
    expect(cleanIncline(null)).toBeNull()
  })

  it('los minutos son enteros y 0 cuenta como vacío', () => {
    expect(cleanMinutes(20.4)).toBe(20)
    expect(cleanMinutes(0)).toBeNull()
    expect(cleanMinutes(null)).toBeNull()
  })

  it('acepta el valor de la última vez solo en lo que no se ha tocado', () => {
    const last = { minutes: 20, incline: 5.5 }
    expect(resolveCardio(EMPTY_CARDIO, last)).toEqual(last)
    expect(resolveCardio({ minutes: 30, incline: null }, last)).toEqual({
      minutes: 30,
      incline: 5.5,
    })
    expect(resolveCardio({ minutes: null, incline: 0 }, last).incline).toBe(0)
    expect(resolveCardio(EMPTY_CARDIO, null)).toEqual(EMPTY_CARDIO)
  })

  it('calcula la media semanal', () => {
    expect(minutesPerWeek(120, 28)).toBe(30)
    expect(minutesPerWeek(120, 0)).toBe(0)
  })

  it('formatea con coma decimal y sin datos', () => {
    expect(formatCardio({ minutes: 20, incline: 5.5 })).toBe('20 min · 5,5 %')
    expect(formatCardio({ minutes: 20, incline: 0 })).toBe('20 min · 0 %')
    expect(formatCardio(EMPTY_CARDIO)).toBe('Hecho')
  })
})
