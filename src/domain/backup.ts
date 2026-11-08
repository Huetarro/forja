/** Formato y validación de las copias de seguridad (funciones puras). */

export const BACKUP_APP = 'forja'
/** 3: añade `cardio` a los entrenos (opcional; las copias v1 y v2 se siguen aceptando). */
export const BACKUP_VERSION = 3

export const BACKUP_TABLES = [
  'programs',
  'routines',
  'exercises',
  'routineExercises',
  'workouts',
  'workoutExercises',
  'workoutSets',
  'runs',
  'dayLogs',
  'supplements',
  'photos',
  'settings',
] as const
export type BackupTable = (typeof BACKUP_TABLES)[number]

export interface BackupFile {
  app: typeof BACKUP_APP
  version: number
  exportedAt: string
  data: Record<BackupTable, unknown[]>
}

export type ValidationResult =
  | {
      ok: true
      backup: BackupFile
      counts: { workouts: number; runs: number; exercises: number; photos: number }
    }
  | { ok: false; error: string }

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)
const str = (o: Record<string, unknown>, k: string) => typeof o[k] === 'string'
const num = (o: Record<string, unknown>, k: string) =>
  typeof o[k] === 'number' && Number.isFinite(o[k])

/** Campos mínimos que debe tener cada registro para importarlo sin romper la app. */
const REQUIRED: Partial<Record<BackupTable, (o: Record<string, unknown>) => boolean>> = {
  programs: (o) => str(o, 'id') && str(o, 'name'),
  routines: (o) => str(o, 'id') && str(o, 'name'),
  exercises: (o) =>
    str(o, 'id') &&
    str(o, 'name') &&
    str(o, 'primaryMuscle') &&
    (o.unit === 'kg' || o.unit === 'lb'),
  routineExercises: (o) =>
    str(o, 'id') && str(o, 'routineId') && str(o, 'exerciseId') && Array.isArray(o.sets),
  workouts: (o) =>
    str(o, 'id') &&
    str(o, 'routineId') &&
    str(o, 'date') &&
    num(o, 'startedAt') &&
    Array.isArray(o.pauses),
  workoutExercises: (o) => str(o, 'id') && str(o, 'workoutId') && str(o, 'exerciseId'),
  workoutSets: (o) =>
    str(o, 'id') &&
    str(o, 'workoutId') &&
    str(o, 'workoutExerciseId') &&
    str(o, 'type') &&
    Array.isArray(o.drops),
  runs: (o) => str(o, 'id') && str(o, 'date') && num(o, 'distanceKm') && num(o, 'durationSec'),
  dayLogs: (o) => str(o, 'date') && isObj(o.supplements),
  supplements: (o) => str(o, 'id') && str(o, 'name'),
  photos: (o) =>
    str(o, 'id') &&
    str(o, 'date') &&
    typeof o.image === 'string' &&
    o.image.startsWith('data:image/'),
  settings: (o) => o.id === 'app' && str(o, 'userName'),
}

/** Comprueba que un JSON es una copia de Forja válida antes de importarla. */
export function validateBackup(json: unknown): ValidationResult {
  if (!isObj(json) || json.app !== BACKUP_APP)
    return { ok: false, error: 'El archivo no es una copia de seguridad de Forja.' }
  if (typeof json.version !== 'number' || json.version > BACKUP_VERSION)
    return {
      ok: false,
      error:
        'La copia es de una versión más nueva de Forja. Actualiza la app e inténtalo de nuevo.',
    }
  if (!isObj(json.data)) return { ok: false, error: 'La copia está vacía o dañada.' }
  const data = json.data
  for (const t of BACKUP_TABLES) {
    const rows = data[t]
    if (rows === undefined) continue
    if (!Array.isArray(rows)) return { ok: false, error: `La copia está dañada (${t}).` }
    const check = REQUIRED[t]
    for (const r of rows)
      if (!isObj(r) || (check && !check(r)))
        return { ok: false, error: `La copia tiene registros no válidos (${t}).` }
  }
  const normalized = Object.fromEntries(
    BACKUP_TABLES.map((t) => [t, Array.isArray(data[t]) ? data[t] : []]),
  ) as Record<BackupTable, unknown[]>
  return {
    ok: true,
    backup: {
      app: BACKUP_APP,
      version: json.version,
      exportedAt: typeof json.exportedAt === 'string' ? json.exportedAt : '',
      data: normalized,
    },
    counts: {
      workouts: normalized.workouts.length,
      runs: normalized.runs.length,
      exercises: normalized.exercises.length,
      photos: normalized.photos.length,
    },
  }
}
