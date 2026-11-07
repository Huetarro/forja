import { AlertTriangle, Trophy } from 'lucide-react'
import { GYM, RUN } from '@/components/charts/chartTheme'
import type { Side } from '@/db/schema'
import { capitalize, longDate } from '@/domain/dates'
import {
  exerciseSessions,
  isStagnant,
  measuredByReps,
  recordsTable,
  type ExerciseInfo,
  type SessionData,
  type SessionMetrics,
} from '@/domain/stats'
import { formatNumber } from '@/domain/units'
import { BarsCard, LinesCard } from './charts'

interface Props {
  exercise: ExerciseInfo
  /** sesiones del periodo (gráficas) */
  sessions: SessionData[]
  /** todas las sesiones (récords y estancamiento) */
  allSessions: SessionData[]
}

const SIDES: Array<{ side: Side; name: string; color: string }> = [
  { side: 'izq', name: 'Izq', color: GYM },
  { side: 'der', name: 'Der', color: RUN },
]

/** Gráficas, récords y aviso de estancamiento de un ejercicio. */
export default function ExerciseStats({ exercise, sessions, allSessions }: Props) {
  const u = exercise.unit
  const fmtW = (v: number) => `${formatNumber(v, 1)} ${u}`
  const sides = exercise.unilateral ? SIDES : null
  const byReps = measuredByReps(exercise)
  const secs = exercise.metric === 'segundos'
  const repUnit = secs ? 's' : 'reps'
  const fmtR = (v: number) => `${formatNumber(v, 0)} ${repUnit}`
  const fmtSet = (w: number, r: number) =>
    w > 0 ? `${formatNumber(w, 2)} ${u} × ${r}${secs ? ' s' : ''}` : fmtR(r)
  // La descarga no cuenta para el estancamiento
  const regular = allSessions.filter((x) => !x.deload)

  // Combina métricas por fecha (una o dos series)
  const merge = (pick: (m: SessionMetrics) => number | null) => {
    const rows = new Map<string, Record<string, string | number | null>>()
    const add = (list: SessionMetrics[], key: string) =>
      list.forEach((m) => {
        const row = rows.get(m.workoutId) ?? { x: m.date }
        row[key] = pick(m)
        rows.set(m.workoutId, row)
      })
    if (sides) sides.forEach((s) => add(exerciseSessions(sessions, exercise.id, s.side), s.side))
    else add(exerciseSessions(sessions, exercise.id), 'v')
    return [...rows.values()].sort((a, b) => String(a.x).localeCompare(String(b.x)))
  }
  const series = sides
    ? sides.map((s) => ({ key: s.side, name: s.name, color: s.color }))
    : [{ key: 'v', name: '', color: GYM }]
  const named = (n: string) => (sides ? series : series.map((s) => ({ ...s, name: n })))

  const rmData = merge((m) => (m.best1rm === null ? null : Math.round(m.best1rm * 10) / 10))
  const maxData = merge((m) => m.maxWeight)
  const repsData = merge((m) => m.maxReps)
  const volMetrics = exerciseSessions(sessions, exercise.id)
  const stagnant =
    !byReps &&
    (sides
      ? sides.some((s) => isStagnant(exerciseSessions(regular, exercise.id, s.side)))
      : isStagnant(exerciseSessions(regular, exercise.id)))
  const tables = sides
    ? sides.map((s) => ({
        title: `Récords · ${s.name}`,
        t: recordsTable(allSessions, exercise.id, s.side),
      }))
    : [{ title: 'Récords', t: recordsTable(allSessions, exercise.id) }]

  if (repsData.length === 0 && tables.every((x) => !x.t.maxReps))
    return (
      <p className="rounded-card bg-card px-4 py-4 text-subhead text-ink-2">
        Sin series en este periodo.
      </p>
    )

  return (
    <div className="space-y-3">
      {stagnant && (
        <div className="flex gap-3 rounded-card bg-warm-soft px-4 py-3" role="status">
          <AlertTriangle size={20} className="mt-0.5 shrink-0 text-warm" aria-hidden />
          <p className="text-subhead">
            <b>Posible estancamiento.</b> Tu mejor 1RM estimado no mejora en las últimas 4 sesiones
            (más de 3 semanas). Prueba a variar reps, descanso o ejercicio.
          </p>
        </div>
      )}

      {byReps && repsData.length > 0 && (
        <LinesCard
          title={secs ? 'Máximo de segundos' : 'Máximo de reps'}
          note={`Mejor serie de cada sesión, en ${secs ? 'segundos' : 'repeticiones'}`}
          data={repsData}
          series={named(secs ? 'Segundos' : 'Reps')}
          format={fmtR}
        />
      )}

      {!byReps && rmData.length > 0 && (
        <>
          <LinesCard
            title="1RM estimado"
            note={`Mejor serie de cada sesión (Epley), en ${u}`}
            data={rmData}
            series={named('1RM')}
            format={fmtW}
          />
          <LinesCard
            title="Peso máximo"
            note={`Por sesión, en ${u}`}
            data={maxData}
            series={named('Peso máximo')}
            format={fmtW}
            height={150}
          />
          <BarsCard
            title="Volumen por sesión"
            note={`En ${u}${sides ? ', ambos lados' : ''}`}
            data={volMetrics.map((m) => ({ x: m.date, y: Math.round(m.volume) }))}
            format={(v) => `${formatNumber(v, 0)} ${u}`}
            valueLabel="Volumen"
          />
          <section className="rounded-card bg-card p-4">
            <h2 className="mb-2 text-body font-semibold">Mejor serie de cada sesión</h2>
            <ul className="space-y-1">
              {volMetrics
                .slice(-6)
                .reverse()
                .map((m) => (
                  <li key={m.workoutId} className="tnum flex justify-between text-subhead">
                    <span className="text-ink-2">{capitalize(longDate(m.date))}</span>
                    <span className="font-semibold">
                      {m.bestSet ? fmtSet(m.bestSet.weight, m.bestSet.reps) : '—'}
                    </span>
                  </li>
                ))}
            </ul>
          </section>
        </>
      )}

      {tables.map(({ title, t }) => (
        <section key={title} className="rounded-card bg-card p-4">
          <h2 className="mb-2 flex items-center gap-2 text-body font-semibold">
            <Trophy size={17} className="text-accent-ink" aria-hidden /> {title}
          </h2>
          <dl className="grid grid-cols-3 gap-2 border-b border-sep pb-3">
            {byReps && (
              <Rec
                label={secs ? 'Más segundos' : 'Más reps'}
                value={t.maxReps ? fmtR(t.maxReps.value) : '—'}
              />
            )}
            <Rec label="Peso máximo" value={t.maxWeight ? fmtW(t.maxWeight.value) : '—'} />
            {!byReps && <Rec label="Mejor 1RM" value={t.best1rm ? fmtW(t.best1rm.value) : '—'} />}
            <Rec
              label="Volumen sesión"
              value={t.maxVolume ? `${formatNumber(t.maxVolume.value, 0)} ${u}` : '—'}
            />
          </dl>
          {t.repsByWeight.length > 0 && (
            <table className="mt-2 w-full text-subhead">
              <caption className="mb-1 text-left text-footnote text-ink-2">
                {secs ? 'Más segundos con cada peso' : 'Más reps con cada peso'}
              </caption>
              <tbody className="tnum">
                {t.repsByWeight.slice(0, 8).map((r) => (
                  <tr key={r.weight}>
                    <td className="py-0.5">
                      {formatNumber(r.weight, 2)} {u}
                    </td>
                    <td className="py-0.5 text-right font-semibold">{fmtR(r.reps)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      ))}
    </div>
  )
}

function Rec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-caption text-ink-2">{label}</dt>
      <dd className="tnum text-subhead font-bold">{value}</dd>
    </div>
  )
}
