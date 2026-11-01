import { describe, expect, it } from 'vitest'
import {
  exerciseSessions,
  habitStats,
  isStagnant,
  movingAverage7,
  muscleLevel,
  muscleLoad,
  overview,
  rangeBounds,
  recordsTable,
  trendPct,
  weeklySeries,
  type ExerciseInfo,
  type SessionData,
  type SessionMetrics,
} from './stats'
import type { SetLike } from './volume'

const s = (weight: number, reps: number, extra: Partial<SetLike> = {}): SetLike => ({
  type: 'normal',
  weight,
  reps,
  completed: true,
  ...extra,
})

const exercises = new Map<string, ExerciseInfo>([
  [
    'press',
    {
      id: 'press',
      name: 'Press',
      unit: 'kg',
      primaryMuscle: 'Pecho',
      secondaryMuscles: ['Tríceps', 'Hombro anterior'],
      unilateral: false,
    },
  ],
  [
    'curl',
    {
      id: 'curl',
      name: 'Curl',
      unit: 'lb',
      primaryMuscle: 'Bíceps',
      secondaryMuscles: [],
      unilateral: true,
    },
  ],
])

const session = (
  date: string,
  ex: SessionData['exercises'],
  extra: Partial<SessionData> = {},
): SessionData => ({
  workoutId: date,
  date,
  routineId: 'r',
  activeSeconds: 3600,
  exercises: ex,
  ...extra,
})

describe('rangos', () => {
  it('4 semanas y periodo anterior del mismo tamaño', () => {
    const r = rangeBounds('4s', '2026-11-28')
    expect(r).toMatchObject({ from: '2026-11-01', to: '2026-11-28', days: 28 })
    expect(r.prev).toEqual({ from: '2026-10-04', to: '2026-10-31' })
  })
  it('"Todo" empieza en el primer dato y no compara', () => {
    expect(rangeBounds('todo', '2026-11-28', '2026-01-01')).toMatchObject({
      from: '2026-01-01',
      prev: null,
    })
  })
})

describe('resumen', () => {
  it('cuenta entrenos, volumen en kg, series y medias', () => {
    const list = [
      session(
        '2026-11-02',
        [{ exerciseId: 'press', sets: [s(100, 5), s(40, 10, { type: 'calentamiento' })] }],
        { avgHeartRate: 120, calories: 400 },
      ),
      session(
        '2026-11-04',
        [{ exerciseId: 'curl', sets: [s(20, 10, { side: 'izq' }), s(20, 10, { side: 'der' })] }],
        { avgHeartRate: 140 },
      ),
    ]
    const o = overview(list, exercises, 1, 14)
    expect(o.workouts).toBe(2)
    expect(o.workoutsPerWeek).toBe(1)
    expect(o.sets).toBe(3)
    expect(o.volumeKg).toBeCloseTo(500 + 400 * 0.45359237, 6)
    expect(o.avgHeartRate).toBe(130)
    expect(o.avgCalories).toBe(400)
  })
  it('serie semanal', () => {
    const w = weeklySeries(
      [
        { d: '2026-11-03', v: 2 },
        { d: '2026-11-05', v: 1 },
      ],
      (x) => x.d,
      (x) => x.v,
      '2026-10-26',
      '2026-11-08',
    )
    expect(w).toEqual([
      { week: '2026-10-26', value: 0 },
      { week: '2026-11-02', value: 3 },
    ])
  })
})

describe('ejercicios', () => {
  const list = [
    session('2026-10-01', [{ exerciseId: 'press', sets: [s(80, 8), s(80, 6)] }]),
    session('2026-10-08', [{ exerciseId: 'press', sets: [s(85, 5), s(70, 12)] }]),
  ]
  it('métricas por sesión: 1RM, peso máximo, volumen y mejor serie', () => {
    const m = exerciseSessions(list, 'press')
    expect(m).toHaveLength(2)
    expect(m[0]?.best1rm).toBeCloseTo(101.333, 2)
    expect(m[1]?.maxWeight).toBe(85)
    expect(m[1]?.volume).toBe(85 * 5 + 70 * 12)
    expect(m[1]?.bestSet).toEqual({ weight: 85, reps: 5 }) // 99,2 frente a 98 (70×12)
  })
  it('tabla de récords', () => {
    const t = recordsTable(list, 'press')
    expect(t.maxWeight).toEqual({ value: 85, date: '2026-10-08' })
    expect(t.maxVolume?.value).toBe(1265)
    expect(t.repsByWeight.map((r) => [r.weight, r.reps])).toEqual([
      [85, 5],
      [80, 8],
      [70, 12],
    ])
  })
  it('unilateral: métricas por lado', () => {
    const l = [
      session('2026-10-01', [
        { exerciseId: 'curl', sets: [s(20, 10, { side: 'izq' }), s(22, 8, { side: 'der' })] },
      ]),
    ]
    expect(exerciseSessions(l, 'curl', 'izq')[0]?.maxWeight).toBe(20)
    expect(exerciseSessions(l, 'curl', 'der')[0]?.maxWeight).toBe(22)
  })
  it('tendencia', () => {
    expect(trendPct([100, 110])).toBeCloseTo(10)
    expect(trendPct([100])).toBeNull()
  })
})

describe('estancamiento', () => {
  const m = (date: string, rm: number): SessionMetrics => ({
    date,
    workoutId: date,
    best1rm: rm,
    maxWeight: 0,
    volume: 0,
    bestSet: null,
  })
  it('sin mejora en 4 sesiones y 3 semanas', () => {
    expect(
      isStagnant([
        m('2026-09-01', 100),
        m('2026-09-08', 99),
        m('2026-09-15', 100),
        m('2026-09-22', 98),
        m('2026-09-29', 99),
      ]),
    ).toBe(true)
  })
  it('no si ha mejorado', () => {
    expect(
      isStagnant([
        m('2026-09-01', 100),
        m('2026-09-08', 99),
        m('2026-09-15', 100),
        m('2026-09-22', 98),
        m('2026-09-29', 101),
      ]),
    ).toBe(false)
  })
  it('no si no han pasado 3 semanas', () => {
    expect(
      isStagnant([
        m('2026-09-01', 100),
        m('2026-09-03', 99),
        m('2026-09-05', 99),
        m('2026-09-07', 98),
        m('2026-09-09', 99),
      ]),
    ).toBe(false)
  })
  it('no con pocas sesiones', () => {
    expect(isStagnant([m('2026-09-01', 100), m('2026-10-01', 90)])).toBe(false)
  })
})

describe('músculos', () => {
  it('los secundarios cuentan como serie completa y el volumen va en kg', () => {
    const l = [session('2026-11-02', [{ exerciseId: 'press', sets: [s(100, 5), s(100, 5)] }])]
    const load = muscleLoad(l, exercises)
    expect(load.get('Pecho')).toEqual({ sets: 2, volumeKg: 1000 })
    expect(load.get('Tríceps')).toEqual({ sets: 2, volumeKg: 1000 })
    expect(load.get('Hombro anterior')?.sets).toBe(2)
  })
  it('unilateral: Izq + Der = 1 serie', () => {
    const l = [
      session('2026-11-02', [
        { exerciseId: 'curl', sets: [s(20, 10, { side: 'izq' }), s(20, 10, { side: 'der' })] },
      ]),
    ]
    expect(muscleLoad(l, exercises).get('Bíceps')?.sets).toBe(1)
  })
  it('niveles de color', () => {
    expect([0, 3, 8, 12, 20].map(muscleLevel)).toEqual([0, 1, 2, 3, 4])
  })
})

describe('cuerpo y hábitos', () => {
  it('media móvil de 7 días', () => {
    const r = movingAverage7([
      { date: '2026-11-01', value: 80 },
      { date: '2026-11-03', value: 79 },
      { date: '2026-11-10', value: 78 },
    ])
    expect(r[1]?.avg).toBeCloseTo(79.5)
    expect(r[2]?.avg).toBe(78)
  })
  it('porcentajes sobre todos los días del rango', () => {
    const h = habitStats(
      [
        { date: 'a', allSupplements: true, nutrition: 'bien', sleepHours: 8, stretching: true },
        { date: 'b', allSupplements: false, nutrition: 'mal', sleepHours: 6, stretching: false },
      ],
      4,
    )
    expect(h).toEqual({ supplementsPct: 25, nutritionPct: 25, avgSleep: 7, stretchingPct: 25 })
  })
})

describe('récords recientes', () => {
  it('solo los del rango y frente a todo lo anterior', async () => {
    const { recentRecords } = await import('./stats')
    const l = [
      session('2026-09-01', [{ exerciseId: 'press', sets: [s(80, 8)] }]),
      session('2026-10-01', [{ exerciseId: 'press', sets: [s(90, 5)] }]),
      session('2026-11-01', [{ exerciseId: 'press', sets: [s(95, 3)] }]),
    ]
    const r = recentRecords(l, { from: '2026-10-15', to: '2026-11-30' })
    expect(r.every((x) => x.date === '2026-11-01')).toBe(true)
    expect(r.map((x) => x.kind)).toContain('peso')
  })
})
