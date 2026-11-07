import { describe, expect, it } from 'vitest'
import {
  extrasAt,
  formatRest,
  formatTarget,
  LEGEND,
  parseRest,
  parseTarget,
  planLine,
  techniqueChips,
} from './techniques'

describe('técnicas', () => {
  it('chips de DS, DS x2, RP, NEG y PAUSA con su leyenda', () => {
    const chips = techniqueChips({
      sets: ['normal', 'normal', 'dropset'],
      extras: [0, 0, 2],
      negative: true,
      pause: 'abajo 2 s, estirado',
    })
    expect(chips.map((c) => c.label)).toEqual(['DS x2', 'NEG', 'PAUSA'])
    expect(chips[0]?.legend).toContain(LEGEND.DSx2)
    expect(chips[2]?.detail).toBe('abajo 2 s, estirado')
    expect(techniqueChips({ sets: ['normal', 'restpause'] }).map((c) => c.label)).toEqual(['RP'])
    expect(techniqueChips({ sets: ['dropset'] })[0]).toMatchObject({
      label: 'DS',
      legend: LEGEND.DS,
    })
  })
  it('sin técnicas no hay chips; la pausa sin detalle sale igual', () => {
    expect(techniqueChips({ sets: ['normal', 'normal'] })).toEqual([])
    expect(techniqueChips({ sets: ['normal'], pause: '' })[0]?.detail).toBeUndefined()
  })
  it('bajadas y mini-series predefinidas por defecto', () => {
    const plan = { sets: ['normal', 'dropset', 'restpause'] as const }
    expect(extrasAt({ sets: [...plan.sets] }, 0)).toBe(0)
    expect(extrasAt({ sets: [...plan.sets] }, 1)).toBe(1)
    expect(extrasAt({ sets: [...plan.sets] }, 2)).toBe(2)
    expect(extrasAt({ sets: [...plan.sets], extras: [0, 2, 3] }, 1)).toBe(2)
  })
})

describe('objetivo y descanso', () => {
  it('formatea y lee el descanso', () => {
    expect(formatRest(150)).toBe('2:30')
    expect(formatRest(45)).toBe('0:45')
    expect(parseRest('2:30')).toBe(150)
    expect(parseRest('90')).toBe(90)
    expect(parseRest('')).toBeUndefined()
    expect(parseRest('2:75')).toBeUndefined()
  })
  it('formatea y lee el rango', () => {
    expect(formatTarget({ min: 6, max: 10 })).toBe('6-10 reps')
    expect(formatTarget({ min: 30, max: 45 }, 'segundos')).toBe('30-45 s')
    expect(formatTarget({ min: 12, max: 12 })).toBe('12 reps')
    expect(parseTarget('6-10')).toEqual({ min: 6, max: 10 })
    expect(parseTarget(' 12 ')).toEqual({ min: 12, max: 12 })
    expect(parseTarget('10-6')).toEqual({ min: 6, max: 10 })
    expect(parseTarget('abc')).toBeUndefined()
  })
  it('línea discreta del ejercicio', () => {
    expect(planLine({ target: { min: 6, max: 10 }, restSec: 150 })).toBe('6-10 reps · desc. 2:30')
    expect(planLine({ target: { min: 10, max: 12 }, restSec: 90 }, 'reps', true)).toBe(
      '10-12 reps · desc. 1:30 tras la pareja',
    )
    expect(planLine({ target: { min: 30, max: 45 } }, 'segundos')).toBe('30-45 s')
    expect(planLine({})).toBe('')
  })
})
