import { describe, expect, it } from 'vitest'
import { deloadText, weeksSinceDeload } from './deload'

describe('semanas desde la última descarga', () => {
  it('cuenta semanas de lunes a domingo', () => {
    expect(weeksSinceDeload('2026-11-02', undefined, '2026-11-08')).toBe(0)
    expect(weeksSinceDeload('2026-11-02', undefined, '2026-11-09')).toBe(1)
    expect(weeksSinceDeload('2026-09-21', undefined, '2026-11-07')).toBe(6)
  })
  it('sin descargas, desde el inicio del plan', () => {
    expect(weeksSinceDeload(undefined, '2026-10-26', '2026-11-07')).toBe(1)
    expect(weeksSinceDeload(undefined, undefined, '2026-11-07')).toBeNull()
  })
  it('texto', () => {
    expect(deloadText(1)).toBe('1 semana desde la última descarga')
    expect(deloadText(7)).toBe('7 semanas desde la última descarga')
    expect(deloadText(0, false)).toBe('Plan empezado esta semana')
    expect(deloadText(2, false)).toBe('2 semanas desde el inicio del plan, sin descarga')
  })
})
