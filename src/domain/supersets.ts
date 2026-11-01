/**
 * Superseries: ejercicios consecutivos con el mismo `supersetId`.
 * Las funciones reciben la lista YA ordenada y devuelven los nuevos supersetId por posición.
 */
export interface SupersetItem {
  supersetId?: string
}

/** ¿El elemento i está agrupado con el siguiente? */
export function isLinkedWithNext(items: readonly SupersetItem[], i: number): boolean {
  const a = items[i]?.supersetId
  return a !== undefined && a === items[i + 1]?.supersetId
}

/**
 * Agrupa el elemento i con el siguiente. Si alguno ya pertenece a una superserie,
 * se reutiliza ese id para que la superserie crezca (A+B, luego B+C → A+B+C).
 */
export function linkWithNext(
  items: readonly SupersetItem[],
  i: number,
  makeId: () => string,
): Array<string | undefined> {
  const ids = items.map((it) => it.supersetId)
  if (i < 0 || i >= items.length - 1) return ids
  const id = ids[i] ?? ids[i + 1] ?? makeId()
  const old = ids[i + 1]
  ids[i] = id
  ids[i + 1] = id
  // si el siguiente ya tenía otro grupo, se fusiona entero
  if (old && old !== id) for (let k = 0; k < ids.length; k++) if (ids[k] === old) ids[k] = id
  return normalize(ids)
}

/** Separa el elemento i del siguiente (rompe la superserie por ese punto). */
export function unlinkFromNext(
  items: readonly SupersetItem[],
  i: number,
  makeId: () => string,
): Array<string | undefined> {
  const ids = items.map((it) => it.supersetId)
  if (!isLinkedWithNext(items, i)) return ids
  const tailId = makeId()
  const old = ids[i]
  for (let k = i + 1; k < ids.length && ids[k] === old; k++) ids[k] = tailId
  return normalize(ids)
}

/** Quita ids de grupos con un solo miembro o no consecutivos. */
export function normalize(ids: Array<string | undefined>): Array<string | undefined> {
  return ids.map((id, k) => {
    if (id === undefined) return undefined
    const prev = ids[k - 1]
    const next = ids[k + 1]
    return prev === id || next === id ? id : undefined
  })
}

/** Posición dentro de la superserie, para dibujar la barra lateral. */
export type SupersetPosition = 'none' | 'start' | 'middle' | 'end'

export function supersetPosition(items: readonly SupersetItem[], i: number): SupersetPosition {
  const id = items[i]?.supersetId
  if (id === undefined) return 'none'
  const prev = items[i - 1]?.supersetId === id
  const next = items[i + 1]?.supersetId === id
  if (prev && next) return 'middle'
  if (next) return 'start'
  if (prev) return 'end'
  return 'none'
}
