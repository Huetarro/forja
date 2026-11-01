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

export type SetType = 'normal' | 'calentamiento' | 'dropset' | 'negativa'
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
  archived: boolean
  createdAt: number
}

export interface RoutineExercise extends Sample {
  id: Id
  routineId: Id
  exerciseId: Id
  order: number
  notes: string
  supersetId?: string
  /** tipo de cada serie planificada */
  sets: SetType[]
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
}

export interface WorkoutExercise extends Sample {
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

export interface Settings {
  /** siempre 'app' */
  id: 'app'
  userName: string
  theme: ThemePref
  defaultUnit: WeightUnit
  restTimer: { visible: boolean; seconds: number }
  lastBackupAt?: number
  onboarded: boolean
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
