import type { CardioValues } from '@/domain/cardio'
import type { LocalDate } from '@/domain/dates'
import type { Pause } from '@/domain/timer'
import type { WeightUnit } from '@/domain/units'

export type Id = string

export const MUSCLES = [
  'Pecho',
  'Espalda',
  'Dorsal',
  'Trapecio',
  'Hombro anterior',
  'Hombro lateral',
  'Hombro posterior',
  'Bíceps',
  'Tríceps',
  'Antebrazo',
  'Cuádriceps',
  'Isquiotibiales',
  'Glúteo',
  'Aductores',
  'Gemelo',
  'Abdomen',
] as const
export type Muscle = (typeof MUSCLES)[number]

export const EQUIPMENT = [
  'Barra',
  'Mancuernas',
  'Máquina',
  'Polea',
  'Peso corporal',
  'Multipower',
  'Otro',
] as const
export type Equipment = (typeof EQUIPMENT)[number]

export type SetType = 'normal' | 'calentamiento' | 'dropset' | 'negativa' | 'restpause'
export type Side = 'izq' | 'der'

/** Campo común: marca los registros creados con "Cargar datos de ejemplo". */
interface Sample {
  isSample?: boolean
}

export interface Program extends Sample {
  id: Id
  name: string
  order: number
  archived: boolean
}

export interface Routine extends Sample {
  id: Id
  programId?: Id
  name: string
  /** índice 1-10 de la paleta de rutinas */
  color: number
  /** nombre del icono de lucide */
  icon: string
  notes: string
  order: number
  archived: boolean
  createdAt: number
  /** v2: la rutina termina con la lista de estiramientos */
  stretches?: boolean
}

export interface Exercise extends Sample {
  id: Id
  name: string
  primaryMuscle: Muscle
  secondaryMuscles: Muscle[]
  equipment: Equipment
  unilateral: boolean
  unit: WeightUnit
  fixedNotes: string
  /** descanso propio en segundos (si no, el de Ajustes) */
  restSeconds?: number
  /** v2: se mide en reps (por defecto) o en segundos (los segundos se guardan en `reps`) */
  metric?: ExerciseMetric
  /** v2: el kg es opcional (peso corporal como carga); sin kg se guarda 0 y no suma volumen */
  optionalLoad?: boolean
  archived: boolean
  createdAt: number
}

export type ExerciseMetric = 'reps' | 'segundos'

/** v2: objetivo de la rutina (rango de reps o de segundos según el ejercicio). */
export interface TargetRange {
  min: number
  max: number
}

/** v2: objetivo, descanso y técnicas de un ejercicio dentro de una rutina. */
export interface ExercisePlan {
  target?: TargetRange
  /** descanso en segundos; en superseries, el del último de la pareja se hace tras la pareja */
  restSec?: number
  /** NEG: todas las series en negativa */
  negative?: boolean
  /** PAUSA: detalle (p. ej. "abajo 2 s, estirado"); cadena vacía = pausa sin detalle */
  pause?: string
}

export interface RoutineExercise extends Sample, ExercisePlan {
  id: Id
  routineId: Id
  exerciseId: Id
  order: number
  notes: string
  supersetId?: string
  /** tipo de cada serie planificada */
  sets: SetType[]
  /** v2: alineado con `sets`; bajadas (dropset) o mini-series (rest-pause) predefinidas */
  extras?: number[]
}

export type WorkoutStatus = 'en_curso' | 'terminado'

export interface Workout extends Sample {
  id: Id
  routineId: Id
  routineName: string
  date: LocalDate
  startedAt: number
  endedAt?: number
  pauses: Pause[]
  activeSeconds: number
  status: WorkoutStatus
  avgHeartRate?: number
  calories?: number
  rating?: number
  energy?: number
  notes: string
  /** v2: sesión de la semana de descarga */
  deload?: boolean
  /** v2: estiramientos marcados en este entreno */
  stretchesDone?: string[]
  /** v3: cardio al final del entreno (ausente si no se hizo) */
  cardio?: CardioValues
}

export interface WorkoutExercise extends Sample, ExercisePlan {
  id: Id
  workoutId: Id
  exerciseId: Id
  order: number
  notes: string
  supersetId?: string
}

export interface Drop {
  weight: number | null
  reps: number | null
}

export interface WorkoutSet extends Sample {
  id: Id
  workoutExerciseId: Id
  /** desnormalizado para consultas rápidas */
  workoutId: Id
  order: number
  type: SetType
  weight: number | null
  reps: number | null
  rir?: number
  completed: boolean
  side?: Side
  drops: Drop[]
}

export type RunType = 'rodaje' | 'series' | 'tirada_larga' | 'competicion' | 'otro'
export type RunSurface = 'exterior' | 'cinta'

export interface Run extends Sample {
  id: Id
  date: LocalDate
  distanceKm: number
  durationSec: number
  avgHeartRate?: number
  calories?: number
  elevationM?: number
  type: RunType
  surface: RunSurface
  feeling?: number
  notes: string
  createdAt: number
}

export interface DayLog extends Sample {
  /** clave primaria: la fecha */
  date: LocalDate
  rest: boolean
  supplements: Record<Id, boolean>
  nutrition: 'bien' | 'mal' | null
  sleepHours?: number
  stretching: boolean
  bodyWeight?: number
  notes: string
}

export interface Supplement {
  id: Id
  name: string
  order: number
  active: boolean
}

export interface ProgressPhoto extends Sample {
  id: Id
  date: LocalDate
  image: Blob
  note: string
  createdAt: number
}

export type ThemePref = 'auto' | 'light' | 'dark'

/** v2: qué toca cada día de la semana. */
export type DayPlan =
  | { kind: 'rutina'; routineId: Id }
  | { kind: 'carrera'; runType: RunType; label: string }
  | { kind: 'descanso' }

/** 1 = lunes … 7 = domingo */
export type Weekday = 1 | 2 | 3 | 4 | 5 | 6 | 7
export type WeekPlan = Partial<Record<Weekday, DayPlan>>

export interface Settings {
  /** siempre 'app' */
  id: 'app'
  userName: string
  theme: ThemePref
  defaultUnit: WeightUnit
  restTimer: { visible: boolean; seconds: number }
  lastBackupAt?: number
  onboarded: boolean
  /** v2: plan por días de la semana (sustituye a la rotación) */
  weekPlan?: WeekPlan
  /** v2: lista de estiramientos de la rutina de core */
  stretchList?: string[]
  /** v2: semana de descarga activa (y desde cuándo) */
  deload?: { active: boolean; since?: LocalDate }
  /** v2: la base venía de la v1 y falta cargar el plan semanal */
  planV2Pending?: boolean
  planV2LoadedAt?: number
  /** v2: fecha de inicio del plan (para contar semanas sin descarga) */
  planStartDate?: LocalDate
  /** v2: cuándo se guardó la copia interna previa a la v2 */
  preV2SnapshotAt?: number
  /** v2.1: iconos anatómicos aplicados a las rutinas del plan */
  routineIconsV2At?: number
}

/** v2: copia interna de todos los datos (tabla `snapshots`). */
export interface Snapshot {
  id: string
  createdAt: number
  data: Record<string, unknown[]>
}

export const DEFAULT_SETTINGS: Settings = {
  id: 'app',
  userName: 'Dani',
  theme: 'auto',
  defaultUnit: 'kg',
  restTimer: { visible: false, seconds: 90 },
  onboarded: false,
}

export const DEFAULT_SUPPLEMENTS = [
  'Creatina',
  'Omega 3',
  'Vitamina D',
  'Multivitamínico',
  'Magnesio',
]
