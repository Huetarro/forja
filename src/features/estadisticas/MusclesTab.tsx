import { useState } from 'react'
import { GYM } from '@/components/charts/chartTheme'
import { MUSCLES, type Muscle } from '@/db/schema'
import type { TrainingData } from '@/db/stats'
import { addDaysLocal, todayLocal, weekStart } from '@/domain/dates'
import { inRange, muscleLoad, type RangeBounds } from '@/domain/stats'
import { formatNumber } from '@/domain/units'
import { cn } from '@/lib/cn'
import { BodyFigure } from './BodyFigure'
import { BarsCard } from './charts'
import { SectionTitle } from './StatTile'

export default function MusclesTab({ data, bounds }: { data: TrainingData; bounds: RangeBounds }) {
  const today = todayLocal()
  const thisWeek = { from: weekStart(today), to: addDaysLocal(weekStart(today), 6) }
  const weekLoad = muscleLoad(
    data.sessions.filter((s) => inRange(s.date, thisWeek)),
    data.exercises,
  )
  const weekSets = new Map<Muscle, number>(MUSCLES.map((m) => [m, weekLoad.get(m)?.sets ?? 0]))

  const rangeSessions = data.sessions.filter((s) => inRange(s.date, bounds))
  const rangeLoad = muscleLoad(rangeSessions, data.exercises)
  const weeks = Math.max(1, bounds.days / 7)
  const ranked = MUSCLES.map((m) => ({
    m,
    sets: (rangeLoad.get(m)?.sets ?? 0) / weeks,
    vol: (rangeLoad.get(m)?.volumeKg ?? 0) / weeks,
  })).sort((a, b) => b.sets - a.sets)

  const [selected, setSelected] = useState<Muscle | null>(null)
  const focus = selected ?? ranked[0]?.m ?? 'Pecho'

  // Evolución semanal del músculo elegido
  const weeksList: string[] = []
  for (let w = weekStart(bounds.from); w <= bounds.to; w = addDaysLocal(w, 7)) weeksList.push(w)
  const evo = weeksList.map((w) => {
    const l = muscleLoad(
      rangeSessions.filter((s) => inRange(s.date, { from: w, to: addDaysLocal(w, 6) })),
      data.exercises,
    ).get(focus)
    return { x: w, sets: l?.sets ?? 0, vol: Math.round(l?.volumeKg ?? 0) }
  })

  return (
    <div>
      <section className="rounded-card bg-card p-4">
        <h2 className="text-body font-semibold">Esta semana</h2>
        <p className="mb-3 text-footnote text-ink-2">
          Series efectivas por músculo. Toca uno para ver sus datos.
        </p>
        <BodyFigure
          sets={weekSets}
          selected={selected}
          onSelect={(m) => setSelected(m === selected ? null : m)}
        />
      </section>

      <SectionTitle>{focus}</SectionTitle>
      <div className="space-y-3">
        <BarsCard
          title="Series por semana"
          data={evo.map((e) => ({ x: e.x, y: e.sets }))}
          format={(v) => `${v} series`}
          valueLabel="Series"
          color={GYM}
        />
        <BarsCard
          title="Volumen por semana"
          note="En kg"
          data={evo.map((e) => ({ x: e.x, y: e.vol }))}
          format={(v) => `${formatNumber(v, 0)} kg`}
          valueLabel="Volumen"
          color={GYM}
        />
      </div>

      <SectionTitle>Media semanal del periodo</SectionTitle>
      <ul className="divide-y divide-sep overflow-hidden rounded-card bg-card">
        {ranked.map(({ m, sets, vol }) => (
          <li key={m}>
            <button
              type="button"
              onClick={() => setSelected(m)}
              aria-pressed={focus === m}
              className={cn(
                'grid w-full grid-cols-[1fr_auto_auto] items-center gap-3 px-4 py-2.5 text-left active:bg-fill',
                focus === m && 'bg-accent-soft',
              )}
            >
              <span className="text-body">{m}</span>
              <span className="tnum text-subhead font-semibold">
                {formatNumber(sets, 1)} series
              </span>
              <span className="tnum w-20 text-right text-footnote text-ink-2">
                {formatNumber(Math.round(vol), 0)} kg
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
