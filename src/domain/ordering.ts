/** Mueve un elemento de `from` a `to` (como arrayMove de dnd-kit), sin mutar. */
export function moveItem<T>(list: readonly T[], from: number, to: number): T[] {
  const copy = list.slice()
  const [item] = copy.splice(from, 1)
  if (item === undefined) return copy
  copy.splice(to, 0, item)
  return copy
}

/** Siguiente valor de orden para añadir al final. */
export function nextOrder(items: ReadonlyArray<{ order: number }>): number {
  return items.reduce((max, i) => Math.max(max, i.order), -1) + 1
}

/** Ordena por `order` sin mutar. */
export function byOrder<T extends { order: number }>(items: readonly T[]): T[] {
  return items.slice().sort((a, b) => a.order - b.order)
}
