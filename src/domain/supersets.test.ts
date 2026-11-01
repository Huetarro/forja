import { describe, expect, it } from 'vitest'
import { linkWithNext, normalize, supersetPosition, unlinkFromNext } from './supersets'
import { moveItem, nextOrder } from './ordering'

const gen = () => {
  let n = 0
  return () => `s${++n}`
}
const items = (ids: Array<string | undefined>) => ids.map((supersetId) => ({ supersetId }))

describe('superseries', () => {
  it('agrupa con el siguiente', () => {
    expect(linkWithNext(items([undefined, undefined, undefined]), 0, gen())).toEqual([
      's1',
      's1',
      undefined,
    ])
  })
  it('crece una superserie existente', () => {
    expect(linkWithNext(items(['a', 'a', undefined]), 1, gen())).toEqual(['a', 'a', 'a'])
  })
  it('separa por un punto', () => {
    expect(unlinkFromNext(items(['a', 'a', 'a']), 0, gen())).toEqual([undefined, 's1', 's1'])
    expect(unlinkFromNext(items(['a', 'a']), 0, gen())).toEqual([undefined, undefined])
  })
  it('normaliza grupos sueltos', () => {
    expect(normalize(['a', undefined, 'a'])).toEqual([undefined, undefined, undefined])
  })
  it('posición para la barra lateral', () => {
    const l = items(['a', 'a', 'a', undefined])
    expect([0, 1, 2, 3].map((i) => supersetPosition(l, i))).toEqual([
      'start',
      'middle',
      'end',
      'none',
    ])
  })
})

describe('orden', () => {
  it('mueve elementos', () => {
    expect(moveItem(['a', 'b', 'c'], 0, 2)).toEqual(['b', 'c', 'a'])
    expect(moveItem(['a', 'b', 'c'], 2, 0)).toEqual(['c', 'a', 'b'])
  })
  it('siguiente orden', () => {
    expect(nextOrder([])).toBe(0)
    expect(nextOrder([{ order: 3 }, { order: 1 }])).toBe(4)
  })
})
