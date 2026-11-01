import { describe, expect, it } from 'vitest'
import { filterExercises, normalizeText } from './search'

const list = [
  {
    name: 'Press banca',
    primaryMuscle: 'Pecho',
    secondaryMuscles: ['Tríceps'],
    equipment: 'Barra',
  },
  { name: 'Curl bíceps', primaryMuscle: 'Bíceps', secondaryMuscles: [], equipment: 'Mancuernas' },
  {
    name: 'Fondos',
    primaryMuscle: 'Tríceps',
    secondaryMuscles: ['Pecho'],
    equipment: 'Peso corporal',
  },
]

describe('buscador de ejercicios', () => {
  it('ignora tildes y mayúsculas', () => {
    expect(normalizeText('Bíceps')).toBe('biceps')
    expect(filterExercises(list, { query: 'biceps' }).map((e) => e.name)).toEqual(['Curl bíceps'])
  })
  it('todas las palabras deben aparecer', () => {
    expect(filterExercises(list, { query: 'press barra' })).toHaveLength(1)
    expect(filterExercises(list, { query: 'press mancuernas' })).toHaveLength(0)
  })
  it('filtra por músculo principal o secundario', () => {
    expect(filterExercises(list, { query: '', muscle: 'Pecho' }).map((e) => e.name)).toEqual([
      'Press banca',
      'Fondos',
    ])
  })
  it('filtra por material', () => {
    expect(filterExercises(list, { query: '', equipment: 'Mancuernas' })).toHaveLength(1)
  })
})
