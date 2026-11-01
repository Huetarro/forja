import { describe, expect, it } from 'vitest'
import { suggestNextRoutine } from './rotation'

const programs = [
  { id: 'p1', order: 0, archived: false },
  { id: 'p2', order: 1, archived: false },
]
const r = (id: string, programId: string | undefined, order: number, archived = false) => ({
  id,
  programId,
  order,
  archived,
})
const routines = [r('A', 'p1', 0), r('B', 'p1', 1), r('C', 'p1', 2), r('X', 'p2', 0)]

describe('rotación "Te toca hoy"', () => {
  it('sin historial: la primera del primer programa', () => {
    expect(suggestNextRoutine(routines, programs, undefined)).toBe('A')
  })
  it('la siguiente tras la última realizada', () => {
    expect(suggestNextRoutine(routines, programs, 'A')).toBe('B')
    expect(suggestNextRoutine(routines, programs, 'B')).toBe('C')
  })
  it('vuelve al principio del programa', () => {
    expect(suggestNextRoutine(routines, programs, 'C')).toBe('A')
  })
  it('se salta las archivadas', () => {
    const list = [r('A', 'p1', 0), r('B', 'p1', 1, true), r('C', 'p1', 2)]
    expect(suggestNextRoutine(list, programs, 'A')).toBe('C')
  })
  it('si la última está archivada, sigue por su posición', () => {
    const list = [r('A', 'p1', 0), r('B', 'p1', 1, true), r('C', 'p1', 2)]
    expect(suggestNextRoutine(list, programs, 'B')).toBe('C')
  })
  it('sin rutinas activas', () => {
    expect(suggestNextRoutine([], programs, undefined)).toBeUndefined()
  })
})
