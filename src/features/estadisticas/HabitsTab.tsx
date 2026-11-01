import { useState } from 'react'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import type { TrainingData } from '@/db/stats'
import { addDaysLocal, daysBetween, todayLocal, weekStart } from '@/domain/dates'
import { habitStats, inRange, type DayHabit, type RangeBounds } from '@/domain/stats'
import { formatNumber } from '@/domain/units'
import { BarsCard } from './charts'
import { SectionTitle, StatTile, TileGrid } from './StatTile'

type HabitKey = 'supl' | 'comida' | 'sueno' | 'estir'

export default function HabitsTab({ data, bounds }: { data: TrainingData; bounds: RangeBounds }) {
  const [habit, setHabit] = useState<HabitKey>('supl')
  const today = todayLocal()
  const days: DayHabit[] = data.logs.map((l) => ({
    date: l.date,
    allSupplements: data.allSupplementsOn(l),
    nutrition: l.nutrition,
    sleepHours: l.sleepHours,
    stretching: l.stretching,
  }))
  const within = (r: { from: string; to: string }) => days.filter((d) => inRange(d.date, r))
  const cur = habitStats(within(bounds), bounds.days)
  const prev = bounds.prev ? habitStats(within(bounds.prev), bounds.days) : null

  // Evolución semanal del hábito elegido
  const weeks: Array<{ x: string; y: number }> = []
  for (let w = weekStart(bounds.from); w <= bounds.to; w = addDaysLocal(w, 7)) {
    const end = addDaysLocal(w, 6) > today ? today : addDaysLocal(w, 6)
    const n = daysBetween(w, end) + 1
    const h = habitStats(within({ from: w, to: end }), n)
    const y =
      habit === 'supl'
        ? h.supplementsPct
        : habit === 'comida'
          ? h.nutritionPct
          : habit === 'estir'
            ? h.stretchingPct
            : (h.avgSleep ?? 0)
    weeks.push({ x: w, y: Math.round(y * 10) / 10 })
  }
  const pct = (v: number) => `${formatNumber(v, 0)} %`

  return (
    <div>
      <TileGrid>
        <StatTile
          label="Días con todos los suplementos"
          value={pct(cur.supplementsPct)}
          current={cur.supplementsPct}
          previous={prev?.supplementsPct}
        />
        <StatTile
          label="Días comiendo bien"
          value={pct(cur.nutritionPct)}
          current={cur.nutritionPct}
          previous={prev?.nutritionPct}
        />
        <StatTile
          label="Sueño medio"
          value={cur.avgSleep === null ? '—' : `${formatNumber(cur.avgSleep, 1)} h`}
          current={cur.avgSleep}
          previous={prev?.avgSleep}
        />
        <StatTile
          label="Días con estiramientos"
          value={pct(cur.stretchingPct)}
          current={cur.stretchingPct}
          previous={prev?.stretchingPct}
        />
      </TileGrid>

      <SectionTitle>Evolución</SectionTitle>
      <div className="mb-3">
        <SegmentedControl
          label="Hábito"
          value={habit}
          onChange={setHabit}
          options={[
            { value: 'supl', label: 'Suplem.' },
            { value: 'comida', label: 'Comida' },
            { value: 'sueno', label: 'Sueño' },
            { value: 'estir', label: 'Estirar' },
          ]}
        />
      </div>
      <BarsCard
        title={
          habit === 'supl'
            ? 'Días con todos los suplementos'
            : habit === 'comida'
              ? 'Días comiendo bien'
              : habit === 'sueno'
                ? 'Horas de sueño (media)'
                : 'Días con estiramientos'
        }
        note="Por semana"
        data={weeks}
        format={habit === 'sueno' ? (v) => `${formatNumber(v, 1)} h` : pct}
        valueLabel={habit === 'sueno' ? 'Horas' : 'Porcentaje'}
      />
    </div>
  )
}
