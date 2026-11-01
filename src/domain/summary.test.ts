import { describe, expect, it } from 'vitest'
import { summarizeWorkout } from './summary'
import type { SetLike } from './volume'

const s = (weight: number, reps: number, extra: Partial<SetLike> = {}): SetLike => ({
  type: 'normal',
  weight,
  reps,
  completed: true,
  ...extra,
})

describe('resumen del entreno', () => {
  const items = [
    {
      exerciseId: 'a',
      name: 'Press banca',
      unit: 'kg' as const,
      sets: [s(40, 10, { type: 'calentamiento' }), s(80, 9), s(80, 8)],
      history: [[s(80, 8), s(80, 7)]],
    },
    {
      exerciseId: 'b',
      name: 'Curl máquina',
      unit: 'lb' as const,
      sets: [s(50, 10)],
      history: [],
    },
    {
      exerciseId: 'c',
      name: 'Sin hacer',
      unit: 'kg' as const,
      sets: [s(10, 10, { completed: false })],
      history: [],
    },
  ]

  it('cuenta ejercicios hechos, series efectivas y volumen en kg', () => {
    const r = summarizeWorkout(items, 3600)
    expect(r.exerciseCount).toBe(2)
    expect(r.effectiveSets).toBe(3)
    expect(r.volumeKg).toBeCloseTo(1360 + 500 * 0.45359237, 6)
  })
  it('incluye los récords batidos', () => {
    const r = summarizeWorkout(items, 3600)
    expect(r.records.map((x) => `${x.exerciseName}:${x.kind}`)).toEqual([
      'Press banca:1rm',
      'Press banca:reps',
      'Press banca:volumen',
    ])
  })
  it('compara con la vez anterior en %', () => {
    const r = summarizeWorkout(items, 3300, { durationSec: 3000, volumeKg: 1000 })
    expect(r.durationPct).toBeCloseTo(10)
    expect(r.volumePct).toBeGreaterThan(50)
  })
})
