import { describe, expect, it } from 'vitest'
import {
  formatPace,
  hmsToSeconds,
  kmByMonth,
  kmByWeek,
  paceSecPerKm,
  runRecords,
  secondsToHms,
  yearTotals,
} from './pace'

const run = (date: string, km: number, sec: number) => ({ date, distanceKm: km, durationSec: sec })

describe('ritmo', () => {
  it('tiempo / km en m:ss /km', () => {
    expect(formatPace(paceSecPerKm(1500, 5))).toBe('5:00 /km')
    expect(formatPace(paceSecPerKm(hmsToSeconds(0, 51, 12), 10))).toBe('5:07 /km')
  })
  it('redondea sin dar 60 segundos', () => {
    expect(formatPace(359.8)).toBe('6:00 /km')
  })
  it('sin distancia no hay ritmo', () => {
    expect(paceSecPerKm(600, 0)).toBeNull()
    expect(formatPace(null)).toBe('—')
  })
  it('hh:mm:ss ida y vuelta', () => {
    expect(secondsToHms(hmsToSeconds(1, 2, 3))).toEqual({ h: 1, m: 2, s: 3 })
  })
})

describe('estadísticas de running', () => {
  const runs = [
    run('2026-10-26', 5, 1500), // 5:00
    run('2026-10-28', 10.5, 3360), // 5:20
    run('2026-11-02', 12, 3900), // 5:25
    run('2026-09-10', 4, 1100), // 4:35 pero < 5 km
    run('2025-12-31', 21.1, 7000),
  ]
  it('km por semana, de la más antigua a la actual', () => {
    const w = kmByWeek(runs, '2026-11-04', 3)
    expect(w.map((x) => x.km)).toEqual([0, 15.5, 12])
    expect(w[2]?.week).toBe('2026-11-02')
  })
  it('km por mes', () => {
    const m = kmByMonth(runs, '2026-11-04', 3)
    expect(m).toEqual([
      { month: '2026-09', km: 4 },
      { month: '2026-10', km: 15.5 },
      { month: '2026-11', km: 12 },
    ])
  })
  it('récords', () => {
    const r = runRecords(runs)
    expect(r.longest?.distanceKm).toBe(21.1)
    expect(r.bestPace5k?.date).toBe('2026-10-26')
    expect(r.bestPace10k?.date).toBe('2026-10-28')
    expect(r.bestWeek).toEqual({ week: '2025-12-29', km: 21.1 })
    expect(r.bestMonth?.km).toBe(21.1)
  })
  it('totales del año', () => {
    expect(yearTotals(runs, 2026)).toEqual({ km: 31.5, count: 4, seconds: 9860 })
  })
})

describe('eje de ritmo', () => {
  it('marcas redondas que cubren los datos', async () => {
    const { paceTicks } = await import('./pace')
    expect(paceTicks([298, 336])).toEqual({ domain: [285, 345], ticks: [285, 300, 315, 330, 345] })
    expect(paceTicks([290, 400]).ticks).toEqual([270, 300, 330, 360, 390, 420])
  })
})
