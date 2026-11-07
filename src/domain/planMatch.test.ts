import { describe, expect, it } from 'vitest'
import { findExercise, normalizeName } from './planMatch'

const lib = (name: string, extra: Partial<{ archived: boolean; sessions: number }> = {}) => ({
  id: name,
  name,
  archived: false,
  sessions: 0,
  ...extra,
})

describe('nombres de ejercicios', () => {
  it('sin mayúsculas, tildes, espacios sobrantes ni palabras vacías', () => {
    expect(normalizeName('  Jalón  al PECHO ')).toBe('jalon pecho')
    expect(normalizeName('Jalón pecho')).toBe('jalon pecho')
    expect(normalizeName('Extensión de tríceps en polea sobre la cabeza')).toBe(
      normalizeName('Extensión tríceps polea sobre cabeza'),
    )
  })
  it('sinónimos obvios', () => {
    expect(normalizeName('Press inclinado multipower')).toBe(
      normalizeName('Press inclinado en Smith'),
    )
    expect(normalizeName('Gemelos')).toBe(normalizeName('Gemelo'))
    expect(normalizeName('Facepull')).toBe(normalizeName('Face pull'))
  })
  it('ejercicios distintos siguen siendo distintos', () => {
    expect(normalizeName('Jalón al pecho')).not.toBe(normalizeName('Jalón al pecho agarre neutro'))
    expect(normalizeName('Elevaciones laterales')).not.toBe(
      normalizeName('Elevaciones laterales en polea'),
    )
  })
  it('elige el no archivado y con más historial', () => {
    const library = [
      lib('Jalón pecho', { archived: true, sessions: 9 }),
      lib('jalon al pecho', { sessions: 1 }),
      lib('JALÓN AL PECHO', { sessions: 4 }),
      lib('Jalón al pecho agarre neutro', { sessions: 20 }),
    ]
    expect(findExercise(library, 'Jalón al pecho')?.id).toBe('JALÓN AL PECHO')
  })
  it('usa alias y no encuentra si no existe', () => {
    expect(
      findExercise([lib('Curl femoral sentado')], 'Femoral sentado', ['Curl femoral sentado'])?.id,
    ).toBe('Curl femoral sentado')
    expect(findExercise([lib('Press banca')], 'Prensa')).toBeUndefined()
  })
})
