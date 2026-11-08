import { describe, expect, it } from 'vitest'
import { convertWeight, formatNumber, parseDecimal, round2, toKg } from './units'

describe('unidades', () => {
  it('lb → kg con el factor exacto', () => {
    expect(toKg(100, 'lb')).toBeCloseTo(45.359237, 6)
    expect(toKg(80, 'kg')).toBe(80)
  })
  it('conversión de ida y vuelta', () => {
    expect(round2(convertWeight(convertWeight(50, 'kg', 'lb'), 'lb', 'kg'))).toBe(50)
    expect(round2(convertWeight(45.359237, 'kg', 'lb'))).toBe(100)
  })
  it('formato español', () => {
    expect(formatNumber(82.5)).toBe('82,5')
  })
  it('acepta coma y punto', () => {
    expect(parseDecimal('82,5')).toBe(82.5)
    expect(parseDecimal('7.5')).toBe(7.5)
    expect(parseDecimal('52,5')).toBe(52.5)
    expect(parseDecimal('52,')).toBe(52)
    expect(parseDecimal('')).toBeNull()
    expect(parseDecimal('abc')).toBeNull()
  })
})
