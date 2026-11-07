import { describe, expect, it } from 'vitest'
import { bodyWeightSummary, stepWeight } from './bodyWeight'

describe('peso corporal', () => {
  it('sin datos', () => {
    expect(bodyWeightSummary([], '2026-11-07')).toEqual({ today: null, last: null, change: null })
  })
  it('último peso, peso de hoy y tendencia frente a hace 7 días o más', () => {
    const s = bodyWeightSummary(
      [
        { date: '2026-11-07', value: 79.6 },
        { date: '2026-10-30', value: 80.3 },
        { date: '2026-10-31', value: 80.1 },
        { date: '2026-11-03', value: 79.9 },
      ],
      '2026-11-07',
    )
    expect(s.today).toBe(79.6)
    expect(s.last).toEqual({ date: '2026-11-07', value: 79.6 })
    expect(s.change).toEqual({ kg: -0.5, days: 7 })
  })
  it('sin peso hoy: muestra el último y no hay tendencia si falta referencia', () => {
    const s = bodyWeightSummary([{ date: '2026-11-05', value: 80 }], '2026-11-07')
    expect(s.today).toBeNull()
    expect(s.last?.value).toBe(80)
    expect(s.change).toBeNull()
  })
  it('ignora pesos con fecha futura', () => {
    expect(bodyWeightSummary([{ date: '2026-11-09', value: 80 }], '2026-11-07').last).toBeNull()
  })
  it('pasos de 0,1 kg exactos', () => {
    expect(stepWeight(79.9, 0.1)).toBe(80)
    expect(stepWeight(80, -0.1)).toBe(79.9)
  })
})
