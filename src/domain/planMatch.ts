/**
 * Comparación de nombres de ejercicios para reutilizar los de la biblioteca al cargar el plan:
 * sin mayúsculas, tildes, signos ni espacios sobrantes, sin palabras vacías y con sinónimos
 * obvios. La comparación final es EXACTA, para no mezclar ejercicios distintos
 * ("Jalón al pecho" ≠ "Jalón al pecho agarre neutro").
 */

const STOPWORDS = new Set(['a', 'al', 'de', 'del', 'el', 'la', 'las', 'los', 'en', 'con', 'y'])

/** Palabras equivalentes (tras quitar tildes). */
const WORD_SYNONYMS: Record<string, string> = {
  multipower: 'smith',
  gemelos: 'gemelo',
  facepull: 'face pull',
  facepulls: 'face pull',
  pulls: 'pull',
  deadbug: 'dead bug',
  aductores: 'aductor',
  extensiones: 'extension',
  elevaciones: 'elevacion',
  laterales: 'lateral',
  aperturas: 'apertura',
  cruces: 'cruce',
  poleas: 'polea',
  piernas: 'pierna',
  mancuernas: 'mancuerna',
  cuadriceps: 'cuadriceps',
}

export function normalizeName(name: string): string {
  const words = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter((w) => w && !STOPWORDS.has(w))
    .map((w) => WORD_SYNONYMS[w] ?? w)
  return words.join(' ').split(' ').filter(Boolean).join(' ')
}

export interface LibraryEntry {
  id: string
  name: string
  archived: boolean
  /** número de sesiones con este ejercicio */
  sessions: number
}

/**
 * Busca en la biblioteca un ejercicio con el mismo nombre normalizado (o un alias).
 * Si hay varios: primero los no archivados y, entre ellos, el que más historial tenga.
 */
export function findExercise(
  library: readonly LibraryEntry[],
  name: string,
  aliases: readonly string[] = [],
): LibraryEntry | undefined {
  const keys = new Set([name, ...aliases].map(normalizeName))
  return library
    .filter((e) => keys.has(normalizeName(e.name)))
    .sort((a, b) => Number(a.archived) - Number(b.archived) || b.sessions - a.sessions)[0]
}
