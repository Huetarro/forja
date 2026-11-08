import { Link } from 'react-router-dom'
import { Flame, Trophy } from 'lucide-react'
import { GYM, RUN } from '@/components/charts/chartTheme'
import type { TrainingData } from '@/db/stats'
import { minutesPerWeek } from '@/domain/cardio'
import { capitalize, longDate, todayLocal } from '@/domain/dates'
import { RECORD_LABEL } from '@/domain/records'
import { computeStreak } from '@/domain/streak'
import {
  inRange,
  overview,
  recentRecords,
  weeklySeries,
  type RangeBounds,
  type SessionData,
} from '@/domain/stats'
import { formatDuration } from '@/domain/timer'
import { formatNumber, toKg } from '@/domain/units'
import { volume } from '@/domain/volume'
import { BarsCard, LinesCard } from './charts'
import { SectionTitle, StatTile, TileGrid } from './StatTile'

export default function OverviewTab({ data, bounds }: { data: TrainingData; bounds: RangeBounds }) {
  const prevR = bounds.prev
  const cur = data.sessions.filter((s) => inRange(s.date, bounds))
  const prev = prevR ? data.sessions.filter((s) => inRange(s.date, prevR)) : null
  const runsCur = data.runs.filter((r) => inRange(r.date, bounds))
  const runsPrev = prevR ? data.runs.filter((r) => inRange(r.date, prevR)) : null
  const o = overview(cur, data.exercises, runsCur.length, bounds.days)
  const p = prev ? overview(prev, data.exercises, runsPrev?.length ?? 0, bounds.days) : null
  const streak = computeStreak(
    [...data.sessions.map((s) => s.date), ...data.runs.map((r) => r.date)],
    todayLocal(),
  )

  const sessionVolume = (s: SessionData) =>
    s.exercises.reduce(
      (t, e) => t + toKg(volume(e.sets), data.exercises.get(e.exerciseId)?.unit ?? 'kg'),
      0,
    )
  const perWeek = weeklySeries(
    cur,
    (s) => s.date,
    () => 1,
    bounds.from,
    bounds.to,
  )
  const volWeek = weeklySeries(cur, (s) => s.date, sessionVolume, bounds.from, bounds.to)
  const hr = cur
    .filter((s) => s.avgHeartRate !== undefined)
    .map((s) => ({ x: s.date, hr: s.avgHeartRate ?? null }))
  const kcal = cur
    .filter((s) => s.calories !== undefined)
    .map((s) => ({ x: s.date, kcal: s.calories ?? null }))
  const records = recentRecords(data.sessions, bounds).slice(0, 8)
  const total = o.workouts + o.runs
  const cardioTotal = (list: SessionData[]) => list.reduce((t, s) => t + (s.cardioMinutes ?? 0), 0)
  const cardioWeek = minutesPerWeek(cardioTotal(cur), bounds.days)
  const cardioPrevWeek = prev ? minutesPerWeek(cardioTotal(prev), bounds.days) : null

  return (
    <div>
      <TileGrid>
        <StatTile
          label="Entrenos por semana"
          value={formatNumber(o.workoutsPerWeek, 1)}
          current={o.workoutsPerWeek}
          previous={p?.workoutsPerWeek}
        />
        <StatTile
          label="Duración media"
          value={o.workouts ? formatDuration(o.avgDurationSec) : '—'}
          current={o.avgDurationSec || null}
          previous={p?.avgDurationSec || null}
          goodUp={false}
        />
        <StatTile
          label="Tiempo total"
          value={formatDuration(o.totalSec)}
          current={o.totalSec}
          previous={p?.totalSec}
        />
        <StatTile
          label="Volumen total"
          value={`${formatNumber(Math.round(o.volumeKg), 0)} kg`}
          current={o.volumeKg}
          previous={p?.volumeKg}
        />
        <StatTile
          label="Series totales"
          value={String(o.sets)}
          current={o.sets}
          previous={p?.sets}
        />
        <StatTile
          label="Pulsaciones medias"
          value={o.avgHeartRate ? `${Math.round(o.avgHeartRate)} ppm` : '—'}
          current={o.avgHeartRate}
          previous={p?.avgHeartRate}
          goodUp={false}
        />
        <StatTile
          label="Calorías por entreno"
          value={o.avgCalories ? `${Math.round(o.avgCalories)} kcal` : '—'}
          current={o.avgCalories}
          previous={p?.avgCalories}
          goodUp={false}
        />
        <div className="rounded-card bg-card p-3.5">
          <div className="text-footnote text-ink-2">Racha</div>
          <div className="tnum mt-0.5 flex items-center gap-1 font-display text-title2 font-bold">
            <Flame size={20} className="text-ink-2" aria-hidden /> {streak.current} sem
          </div>
          <div className="tnum text-footnote text-ink-2">Mejor: {streak.best} sem</div>
        </div>
      </TileGrid>

      <div className="mt-3">
        <StatTile
          label="Cardio por semana"
          value={`${Math.round(cardioWeek)} min`}
          current={cardioWeek}
          previous={cardioPrevWeek}
          goodUp={false}
        />
      </div>

      {total > 0 && (
        <section className="mt-3 rounded-card bg-card p-4" aria-label="Reparto gimnasio y running">
          <h2 className="mb-3 text-body font-semibold">Reparto</h2>
          <div className="flex h-3 gap-[2px] overflow-hidden rounded-full" aria-hidden>
            {o.workouts > 0 && (
              <span style={{ width: `${(o.workouts / total) * 100}%`, background: GYM }} />
            )}
            {o.runs > 0 && (
              <span style={{ width: `${(o.runs / total) * 100}%`, background: RUN }} />
            )}
          </div>
          <div className="mt-2 flex justify-between text-footnote">
            <span className="flex items-center gap-1.5 text-ink-2">
              <span className="size-2 rounded-full" style={{ background: GYM }} aria-hidden />
              Gimnasio <b className="tnum text-ink">{o.workouts}</b>
            </span>
            <span className="flex items-center gap-1.5 text-ink-2">
              <span className="size-2 rounded-full" style={{ background: RUN }} aria-hidden />
              Running <b className="tnum text-ink">{o.runs}</b>
            </span>
          </div>
        </section>
      )}

      <SectionTitle>Evolución</SectionTitle>
      <div className="space-y-3">
        <BarsCard
          title="Entrenos por semana"
          data={perWeek.map((w) => ({ x: w.week, y: w.value }))}
          format={(v) => String(v)}
          valueLabel="Entrenos"
        />
        <BarsCard
          title="Volumen por semana"
          note="En kg"
          data={volWeek.map((w) => ({ x: w.week, y: Math.round(w.value) }))}
          format={(v) => `${formatNumber(v, 0)} kg`}
          valueLabel="Volumen"
        />
        {hr.length >= 2 && (
          <LinesCard
            title="Pulsaciones medias"
            note="Por entreno"
            data={hr}
            series={[{ key: 'hr', name: 'Pulsaciones', color: GYM }]}
            format={(v) => `${Math.round(v)} ppm`}
          />
        )}
        {kcal.length >= 2 && (
          <LinesCard
            title="Calorías"
            note="Por entreno"
            data={kcal}
            series={[{ key: 'kcal', name: 'Calorías', color: GYM }]}
            format={(v) => `${Math.round(v)} kcal`}
          />
        )}
      </div>

      <SectionTitle>Récords recientes</SectionTitle>
      {records.length === 0 ? (
        <p className="rounded-card bg-card px-4 py-4 text-subhead text-ink-2">
          Ningún récord en este periodo.
        </p>
      ) : (
        <ul className="divide-y divide-sep overflow-hidden rounded-card bg-card">
          {records.map((r, i) => {
            const ex = data.exercises.get(r.exerciseId)
            return (
              <li key={i}>
                <Link
                  to={`/historial/${r.workoutId}`}
                  className="flex items-center gap-3 px-4 py-3 active:bg-fill"
                >
                  <Trophy size={18} className="shrink-0 text-ink-2" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-body font-semibold">
                      {ex?.name ?? 'Ejercicio'}
                      {r.side ? ` (${r.side === 'izq' ? 'Izq' : 'Der'})` : ''}
                    </span>
                    <span className="block text-footnote text-ink-2">
                      {RECORD_LABEL[r.kind]} · {capitalize(longDate(r.date))}
                    </span>
                  </span>
                  <span className="tnum shrink-0 font-bold">
                    {r.kind === 'reps'
                      ? `${r.value} × ${formatNumber(r.weight ?? 0, 2)}`
                      : `${formatNumber(r.value, r.kind === 'volumen' ? 0 : 1)} ${ex?.unit ?? 'kg'}`}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
