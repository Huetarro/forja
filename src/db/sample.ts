/**
 * Datos de ejemplo para probar las gráficas. Todo lo creado lleva `isSample: true`
 * para poder borrarlo después sin tocar los datos reales.
 */
import { addDaysLocal, todayLocal, weekStart } from '@/domain/dates'
import { db, newId } from './db'
import type {
  DayLog,
  Exercise,
  Muscle,
  Routine,
  RoutineExercise,
  Run,
  SetType,
  Workout,
  WorkoutExercise,
  WorkoutSet,
} from './schema'

/** Generador pseudoaleatorio con semilla (resultados repetibles). */
function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

interface ExSpec {
  name: string
  primary: Muscle
  secondary: Muscle[]
  equipment: Exercise['equipment']
  unit?: 'kg' | 'lb'
  unilateral?: boolean
  start: number
  step: number
  reps: number
}

const EXERCISES: ExSpec[] = [
  {
    name: 'Press banca',
    primary: 'Pecho',
    secondary: ['Tríceps', 'Hombro anterior'],
    equipment: 'Barra',
    start: 70,
    step: 2.5,
    reps: 8,
  },
  {
    name: 'Remo con barra',
    primary: 'Espalda',
    secondary: ['Dorsal', 'Bíceps'],
    equipment: 'Barra',
    start: 60,
    step: 2.5,
    reps: 10,
  },
  {
    name: 'Press militar',
    primary: 'Hombro anterior',
    secondary: ['Hombro lateral', 'Tríceps'],
    equipment: 'Mancuernas',
    start: 28,
    step: 2,
    reps: 10,
  },
  {
    name: 'Jalón al pecho',
    primary: 'Dorsal',
    secondary: ['Bíceps'],
    equipment: 'Polea',
    unit: 'lb',
    start: 120,
    step: 5,
    reps: 10,
  },
  {
    name: 'Sentadilla',
    primary: 'Cuádriceps',
    secondary: ['Glúteo', 'Aductores'],
    equipment: 'Barra',
    start: 90,
    step: 5,
    reps: 6,
  },
  {
    name: 'Peso muerto rumano',
    primary: 'Isquiotibiales',
    secondary: ['Glúteo', 'Espalda'],
    equipment: 'Barra',
    start: 80,
    step: 5,
    reps: 8,
  },
  {
    name: 'Curl concentrado',
    primary: 'Bíceps',
    secondary: ['Antebrazo'],
    equipment: 'Mancuernas',
    unilateral: true,
    start: 12,
    step: 1,
    reps: 12,
  },
  {
    name: 'Elevación de gemelos',
    primary: 'Gemelo',
    secondary: [],
    equipment: 'Máquina',
    start: 60,
    step: 5,
    reps: 15,
  },
]

export async function loadSampleData(): Promise<void> {
  const rand = rng(42)
  const today = todayLocal()
  const sample = { isSample: true as const }
  const now = Date.now()

  const exercises: Exercise[] = EXERCISES.map((e) => ({
    id: newId(),
    name: e.name,
    primaryMuscle: e.primary,
    secondaryMuscles: e.secondary,
    equipment: e.equipment,
    unilateral: e.unilateral ?? false,
    unit: e.unit ?? 'kg',
    fixedNotes: '',
    archived: false,
    createdAt: now,
    ...sample,
  }))
  const programId = newId()
  const routineA: Routine = {
    id: newId(),
    programId,
    name: 'Torso (ejemplo)',
    color: 6,
    icon: 'dumbbell',
    notes: '',
    order: 900,
    archived: false,
    createdAt: now,
    ...sample,
  }
  const routineB: Routine = {
    id: newId(),
    programId,
    name: 'Pierna (ejemplo)',
    color: 9,
    icon: 'mountain',
    notes: '',
    order: 901,
    archived: false,
    createdAt: now,
    ...sample,
  }
  const plan: Array<[Routine, number[]]> = [
    [routineA, [0, 1, 2, 3, 6]],
    [routineB, [4, 5, 7]],
  ]
  const routineExercises: RoutineExercise[] = plan.flatMap(([r, idxs]) =>
    idxs.map((i, order) => ({
      id: newId(),
      routineId: r.id,
      exerciseId: exercises[i]?.id ?? '',
      order,
      notes: '',
      sets: ['calentamiento', 'normal', 'normal', 'normal'] as SetType[],
      ...sample,
    })),
  )

  const workouts: Workout[] = []
  const wes: WorkoutExercise[] = []
  const sets: WorkoutSet[] = []
  const runs: Run[] = []
  const logs: DayLog[] = []
  const startWeek = addDaysLocal(weekStart(today), -7 * 11)
  let workoutIndex = 0

  for (let w = 0; w < 12; w++) {
    const monday = addDaysLocal(startWeek, w * 7)
    for (const dayOffset of [0, 2, 4]) {
      const date = addDaysLocal(monday, dayOffset)
      if (date > today) continue
      const entry = plan[workoutIndex++ % plan.length]
      if (!entry) continue
      const [routine, idxs] = entry
      const startedAt = new Date(`${date}T18:00:00`).getTime()
      const dur = 3000 + Math.round(rand() * 1500)
      const wid = newId()
      workouts.push({
        id: wid,
        routineId: routine.id,
        routineName: routine.name,
        date,
        startedAt,
        endedAt: startedAt + dur * 1000,
        pauses: [],
        activeSeconds: dur,
        status: 'terminado',
        avgHeartRate: 115 + Math.round(rand() * 20),
        calories: 300 + Math.round(rand() * 200),
        rating: 3 + Math.round(rand() * 2),
        energy: 3 + Math.round(rand() * 2),
        notes: '',
        ...sample,
      })
      idxs.forEach((i, order) => {
        const spec = EXERCISES[i]
        const ex = exercises[i]
        if (!spec || !ex) return
        const weId = newId()
        wes.push({ id: weId, workoutId: wid, exerciseId: ex.id, order, notes: '', ...sample })
        // progresión con algún estancamiento en el press banca
        const progress = i === 0 ? Math.min(w, 6) : w
        const top = spec.start + Math.floor(progress / 2) * spec.step
        const types: SetType[] = [
          'calentamiento',
          'normal',
          'normal',
          w % 3 === 2 && i === 1 ? 'dropset' : 'normal',
        ]
        types.forEach((type, so) => {
          for (const side of spec.unilateral ? (['izq', 'der'] as const) : [undefined]) {
            const weight = type === 'calentamiento' ? Math.round(top * 0.5) : top
            const reps =
              type === 'calentamiento'
                ? 12
                : Math.max(
                    3,
                    spec.reps - so + 1 + Math.round(rand() * 2) - (side === 'der' ? 1 : 0),
                  )
            sets.push({
              id: newId(),
              workoutId: wid,
              workoutExerciseId: weId,
              order: so,
              type,
              weight,
              reps,
              rir: type === 'calentamiento' ? undefined : Math.round(rand() * 3),
              completed: true,
              side,
              drops: type === 'dropset' ? [{ weight: Math.round(top * 0.7), reps: 8 }] : [],
              ...sample,
            })
          }
        })
      })
    }
    // carreras: martes y sábado
    for (const [k, dayOffset] of [1, 5].entries()) {
      const date = addDaysLocal(monday, dayOffset)
      if (date > today) continue
      const km =
        k === 0 ? 5 + Math.round(rand() * 30) / 10 : 8 + w * 0.5 + Math.round(rand() * 20) / 10
      const pace = 330 - w * 2 + Math.round(rand() * 25)
      runs.push({
        id: newId(),
        date,
        distanceKm: Math.round(km * 100) / 100,
        durationSec: Math.round(km * pace),
        avgHeartRate: 140 + Math.round(rand() * 20),
        calories: Math.round(km * 65),
        elevationM: Math.round(rand() * 80),
        type: k === 0 ? 'rodaje' : 'tirada_larga',
        surface: rand() > 0.8 ? 'cinta' : 'exterior',
        feeling: 3 + Math.round(rand() * 2),
        notes: '',
        createdAt: now,
        ...sample,
      })
    }
  }

  const supplements = await db.supplements.toArray()
  for (let d = 0; d < 84; d++) {
    const date = addDaysLocal(startWeek, d)
    if (date > today) break
    if (await db.dayLogs.get(date)) continue // no pisar días reales
    logs.push({
      date,
      rest: [3, 6].includes(d % 7),
      supplements: Object.fromEntries(supplements.map((s) => [s.id, rand() > 0.2])),
      nutrition: rand() > 0.25 ? 'bien' : 'mal',
      sleepHours: Math.round((6 + rand() * 2.5) * 2) / 2,
      stretching: rand() > 0.5,
      bodyWeight: Math.round((80 - d * 0.03 + (rand() - 0.5) * 0.8) * 10) / 10,
      notes: '',
      ...sample,
    })
  }

  await db.transaction(
    'rw',
    [
      db.programs,
      db.routines,
      db.exercises,
      db.routineExercises,
      db.workouts,
      db.workoutExercises,
      db.workoutSets,
      db.runs,
      db.dayLogs,
    ],
    async () => {
      await db.programs.add({
        id: programId,
        name: 'Ejemplo',
        order: 900,
        archived: false,
        ...sample,
      })
      await db.exercises.bulkAdd(exercises)
      await db.routines.bulkAdd([routineA, routineB])
      await db.routineExercises.bulkAdd(routineExercises)
      await db.workouts.bulkAdd(workouts)
      await db.workoutExercises.bulkAdd(wes)
      await db.workoutSets.bulkAdd(sets)
      await db.runs.bulkAdd(runs)
      await db.dayLogs.bulkAdd(logs)
    },
  )
}

/** Borra solo lo creado como ejemplo. */
export async function clearSampleData(): Promise<void> {
  const isSample = (r: { isSample?: boolean }) => r.isSample === true
  await db.transaction(
    'rw',
    [
      db.programs,
      db.routines,
      db.exercises,
      db.routineExercises,
      db.workouts,
      db.workoutExercises,
      db.workoutSets,
      db.runs,
      db.dayLogs,
      db.photos,
    ],
    async () => {
      await db.workoutSets.filter(isSample).delete()
      await db.workoutExercises.filter(isSample).delete()
      await db.workouts.filter(isSample).delete()
      await db.routineExercises.filter(isSample).delete()
      await db.routines.filter(isSample).delete()
      await db.programs.filter(isSample).delete()
      await db.exercises.filter(isSample).delete()
      await db.runs.filter(isSample).delete()
      await db.dayLogs.filter(isSample).delete()
      await db.photos.filter(isSample).delete()
    },
  )
}

export async function hasSampleData(): Promise<boolean> {
  return (await db.workouts.filter((w) => w.isSample === true).count()) > 0
}
