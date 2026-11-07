import { describe, expect, it } from 'vitest'
import { deloadSetCount, plannedSets, plannedTypes } from './workoutPlan'

describe('series al empezar el entreno', () => {
  it('dropset con bajadas y rest-pause con mini-series predefinidas', () => {
    expect(
      plannedSets({ sets: ['normal', 'normal', 'dropset', 'restpause'], extras: [0, 0, 2, 0] }),
    ).toEqual([
      { type: 'normal', extras: 0 },
      { type: 'normal', extras: 0 },
      { type: 'dropset', extras: 2 },
      { type: 'restpause', extras: 2 },
    ])
  })
  it('NEG en el ejercicio: todas las series normales son negativas', () => {
    expect(plannedTypes({ sets: ['calentamiento', 'normal', 'normal'], negative: true })).toEqual([
      'calentamiento',
      'negativa',
      'negativa',
    ])
  })
  it('descarga: mitad de series redondeando hacia arriba, todas normales', () => {
    expect(deloadSetCount(['normal', 'normal', 'normal', 'dropset'])).toBe(2)
    expect(deloadSetCount(['normal', 'normal', 'dropset'])).toBe(2)
    expect(deloadSetCount(['calentamiento', 'normal', 'normal'])).toBe(1)
    expect(
      plannedSets(
        { sets: ['normal', 'normal', 'dropset'], extras: [0, 0, 2], negative: true },
        true,
      ),
    ).toEqual([
      { type: 'normal', extras: 0 },
      { type: 'normal', extras: 0 },
    ])
  })
})
