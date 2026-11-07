import { describe, expect, it } from 'vitest'
import { bestOneRm, epley, percentTable } from './oneRm'
import { progressionBadge } from './progressionRules'
import { bestsFromSessions, liveSetRecords, sessionRecords, setRecords } from './records'
import { percentChange, structureChanged } from './routineDiff'
import { effectiveSetCount, volume, volumeKg, type SetLike } from './volume'

const s = (weight: number | null, reps: number | null, extra: Partial<SetLike> = {}): SetLike => ({
  type: 'normal',
  weight,
  reps,
  completed: true,
  drops: [],
  ...extra,
})

describe('volumen', () => {
  it('suma peso × reps de las series efectivas', () => {
    expect(volume([s(80, 8), s(80, 6)])).toBe(1120)
  })
  it('el calentamiento y las series sin marcar no cuentan', () => {
    expect(
      volume([s(40, 10, { type: 'calentamiento' }), s(80, 8), s(90, 5, { completed: false })]),
    ).toBe(640)
    expect(effectiveSetCount([s(40, 10, { type: 'calentamiento' }), s(80, 8)])).toBe(1)
  })
  it('dropset: cuenta como 1 serie y solo la primera suma volumen', () => {
    const drop = s(60, 10, {
      type: 'dropset',
      drops: [
        { weight: 40, reps: 8 },
        { weight: 20, reps: 10 },
      ],
    })
    expect(volume([drop])).toBe(600)
    expect(effectiveSetCount([drop])).toBe(1)
  })
  it('negativa cuenta como serie normal', () => {
    expect(volume([s(50, 5, { type: 'negativa' })])).toBe(250)
  })
  it('unilateral: el volumen suma ambos lados', () => {
    expect(volume([s(20, 10, { side: 'izq' }), s(20, 10, { side: 'der' })])).toBe(400)
  })
  it('volumen en kg para ejercicios en lb', () => {
    expect(volumeKg([s(100, 10)], 'lb')).toBeCloseTo(453.59237, 4)
  })
})

describe('1RM estimado (Epley)', () => {
  it('fórmula peso × (1 + reps/30)', () => {
    expect(epley(100, 10)).toBeCloseTo(133.333, 3)
    expect(epley(100, 1)).toBeCloseTo(103.333, 3)
  })
  it('solo con 1 a 12 reps', () => {
    expect(epley(100, 13)).toBeNull()
    expect(epley(100, 0)).toBeNull()
    expect(bestOneRm([s(100, 15), s(90, 5)])).toBeCloseTo(105, 6)
  })
  it('tabla de porcentajes de 50 a 100', () => {
    const t = percentTable(200)
    expect(t[0]).toEqual({ pct: 100, weight: 200 })
    expect(t[t.length - 1]).toEqual({ pct: 50, weight: 100 })
    expect(t).toHaveLength(11)
  })
})

describe('récords', () => {
  const history = [[s(80, 8), s(80, 7)], [s(85, 5)]]
  it('sin historial no hay récords', () => {
    expect(bestsFromSessions([])).toBeNull()
    expect(setRecords(null, s(100, 10))).toEqual([])
  })
  it('peso máximo, 1RM y reps con un peso', () => {
    const b = bestsFromSessions(history)
    expect(setRecords(b, s(90, 3))).toEqual(['peso'])
    expect(setRecords(b, s(80, 10))).toEqual(['1rm', 'reps'])
    expect(setRecords(b, s(80, 8))).toEqual([])
  })
  it('el calentamiento no bate récords', () => {
    expect(setRecords(bestsFromSessions(history), s(200, 1, { type: 'calentamiento' }))).toEqual([])
  })
  it('dropset: solo cuenta la primera serie', () => {
    const b = bestsFromSessions(history)
    const drop = s(70, 8, { type: 'dropset', drops: [{ weight: 200, reps: 20 }] })
    expect(setRecords(b, drop)).toEqual([])
  })
  it('en directo no se repite el aviso en la misma sesión', () => {
    const current = [s(90, 3), s(90, 3)]
    expect(liveSetRecords(history, current, 0)).toContain('peso')
    expect(liveSetRecords(history, current, 1)).not.toContain('peso')
  })
  it('récord de volumen en una sesión al superarlo', () => {
    const current = [s(80, 8), s(80, 8)]
    expect(liveSetRecords(history, current, 0)).not.toContain('volumen')
    expect(liveSetRecords(history, current, 1)).toContain('volumen')
  })
  it('unilaterales: récords por lado', () => {
    const h = [[s(20, 10, { side: 'izq' }), s(22, 10, { side: 'der' })]]
    const cur = [s(22, 10, { side: 'izq' }), s(22, 10, { side: 'der' })]
    const recs = sessionRecords(h, cur)
    expect(recs.filter((r) => r.kind === 'peso').map((r) => r.side)).toEqual(['izq'])
  })
  it('resumen de sesión', () => {
    const recs = sessionRecords(history, [s(90, 3), s(80, 9)])
    expect(recs.map((r) => r.kind).sort()).toEqual(['1rm', 'peso', 'reps'].sort())
  })
})

describe('"Sube peso" (v2: tope del rango)', () => {
  const t = { min: 6, max: 10 }
  const sess = (sets: SetLike[], deload = false) => ({ sets, deload })
  it('todas las series efectivas llegan al tope', () => {
    expect(progressionBadge([sess([s(80, 10), s(80, 11)])], t)).toBe('sube_peso')
  })
  it('no si alguna se queda corta', () => {
    expect(progressionBadge([sess([s(80, 10), s(80, 9)])], t)).toBeNull()
  })
  it('ignora calentamientos y series sin marcar', () => {
    expect(
      progressionBadge(
        [sess([s(40, 5, { type: 'calentamiento' }), s(80, 10), s(80, 4, { completed: false })])],
        t,
      ),
    ).toBe('sube_peso')
  })
  it('usa la última sesión que no es de descarga', () => {
    expect(progressionBadge([sess([s(40, 6)], true), sess([s(80, 10)])], t)).toBe('sube_peso')
    expect(progressionBadge([sess([s(40, 12)], true), sess([s(80, 8)])], t)).toBeNull()
  })
  it('sin rango objetivo o sin historial no hay aviso', () => {
    expect(progressionBadge([sess([s(80, 10)])], undefined)).toBeNull()
    expect(progressionBadge([], t)).toBeNull()
  })
  it('unilateral: los dos lados deben llegar', () => {
    const l = [s(20, 10, { side: 'izq' }), s(20, 9, { side: 'der' })]
    expect(progressionBadge([sess(l)], t)).toBeNull()
    const ok = [s(20, 10, { side: 'izq' }), s(20, 10, { side: 'der' })]
    expect(progressionBadge([sess(ok)], t)).toBe('sube_peso')
  })
  it('ejercicios sin kg o por tiempo: "Tope alcanzado"', () => {
    expect(progressionBadge([sess([s(0, 45), s(0, 46)])], { min: 30, max: 45 }, true)).toBe('tope')
    // Si se usó lastre, sí es "Sube peso"
    expect(progressionBadge([sess([s(5, 45)])], { min: 30, max: 45 }, true)).toBe('sube_peso')
  })
})

describe('cambios de estructura', () => {
  const base = [
    { exerciseId: 'a', sets: ['normal', 'normal'] as const },
    { exerciseId: 'b', sets: ['normal'] as const },
  ]
  it('igual', () => {
    expect(
      structureChanged(
        base,
        base.map((x) => ({ ...x })),
      ),
    ).toBe(false)
  })
  it('detecta orden, número y tipo de series', () => {
    expect(structureChanged(base, [base[1]!, base[0]!])).toBe(true)
    expect(
      structureChanged(base, [base[0]!, { exerciseId: 'b', sets: ['normal', 'normal'] }]),
    ).toBe(true)
    expect(structureChanged(base, [base[0]!, { exerciseId: 'b', sets: ['dropset'] }])).toBe(true)
  })
  it('detecta superseries, sin importar el id', () => {
    const a = base.map((x) => ({ ...x, supersetId: 'x' }))
    const b = base.map((x) => ({ ...x, supersetId: 'y' }))
    expect(structureChanged(a, b)).toBe(false)
    expect(structureChanged(base, a)).toBe(true)
  })
  it('% de cambio', () => {
    expect(percentChange(110, 100)).toBeCloseTo(10)
    expect(percentChange(5, 0)).toBeNull()
  })
})
