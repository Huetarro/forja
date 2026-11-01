/** Quita tildes y pasa a minúsculas para buscar ("bíceps" = "biceps"). */
export function normalizeText(s: string): string {
  return s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
}

export interface FilterableExercise {
  name: string
  primaryMuscle: string
  secondaryMuscles: readonly string[]
  equipment: string
}

export interface ExerciseFilter {
  query: string
  muscle?: string
  equipment?: string
}

/** Filtra por texto (todas las palabras), músculo (principal o secundario) y material. */
export function filterExercises<T extends FilterableExercise>(
  list: readonly T[],
  f: ExerciseFilter,
): T[] {
  const words = normalizeText(f.query).split(/\s+/).filter(Boolean)
  return list.filter((e) => {
    if (f.muscle && e.primaryMuscle !== f.muscle && !e.secondaryMuscles.includes(f.muscle))
      return false
    if (f.equipment && e.equipment !== f.equipment) return false
    if (words.length === 0) return true
    const hay = normalizeText(`${e.name} ${e.primaryMuscle} ${e.equipment}`)
    return words.every((w) => hay.includes(w))
  })
}
