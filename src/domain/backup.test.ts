import { describe, expect, it } from 'vitest'
import { validateBackup } from './backup'
import { cell, toCsv } from './csv'

const valid = {
  app: 'forja',
  version: 1,
  exportedAt: '2026-11-01T10:00:00Z',
  data: {
    exercises: [{ id: 'e', name: 'Press', primaryMuscle: 'Pecho', unit: 'kg' }],
    workouts: [{ id: 'w', routineId: 'r', date: '2026-11-01', startedAt: 1, pauses: [] }],
    runs: [{ id: 'r', date: '2026-11-01', distanceKm: 5, durationSec: 1500 }],
    settings: [{ id: 'app', userName: 'Dani' }],
  },
}

describe('validación de copias', () => {
  it('acepta una copia correcta y rellena tablas ausentes', () => {
    const r = validateBackup(valid)
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.counts).toEqual({ workouts: 1, runs: 1, exercises: 1, photos: 0 })
      expect(r.backup.data.photos).toEqual([])
    }
  })
  it('rechaza archivos que no son de Forja', () => {
    expect(validateBackup({ foo: 1 })).toMatchObject({ ok: false })
    expect(validateBackup(null)).toMatchObject({ ok: false })
    expect(validateBackup([1, 2])).toMatchObject({ ok: false })
  })
  it('rechaza versiones más nuevas', () => {
    const r = validateBackup({ ...valid, version: 99 })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toMatch(/más nueva/)
  })
  it('rechaza registros dañados', () => {
    expect(
      validateBackup({ ...valid, data: { ...valid.data, runs: [{ id: 'x' }] } }),
    ).toMatchObject({ ok: false })
    expect(validateBackup({ ...valid, data: { ...valid.data, workouts: 'nope' } })).toMatchObject({
      ok: false,
    })
    expect(
      validateBackup({
        ...valid,
        data: { ...valid.data, photos: [{ id: 'p', date: 'd', image: 'javascript:alert(1)' }] },
      }),
    ).toMatchObject({ ok: false })
  })
})

describe('CSV', () => {
  it('decimales con coma, booleanos y escapado', () => {
    expect(cell(82.5)).toBe('82,5')
    expect(cell(true)).toBe('sí')
    expect(cell(null)).toBe('')
    expect(cell('a;b')).toBe('"a;b"')
    expect(cell('dijo "hola"')).toBe('"dijo ""hola"""')
    expect(cell('línea\n2')).toBe('"línea\n2"')
  })
  it('tabla con BOM y separador ;', () => {
    expect(toCsv(['a', 'b'], [[1, 'x']])).toBe('﻿a;b\r\n1;x\r\n')
  })
})
