import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartCard, TooltipBox } from '@/components/charts/chartKit'
import { AXIS_TICK, GRID_STROKE } from '@/components/charts/chartTheme'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import type { Run } from '@/db/schema'
import { parseLocalDate, todayLocal } from '@/domain/dates'
import { formatPace, kmByMonth, kmByWeek, paceSecPerKm, paceTicks } from '@/domain/pace'
import { formatNumber } from '@/domain/units'

const RUN = 'var(--c-chart-run)'
const fmtDay = (d: string) => format(parseLocalDate(d), 'd MMM', { locale: es })

/** Gráficas de running (carga diferida). */
export default function RunCharts({ runs }: { runs: Run[] }) {
  const [period, setPeriod] = useState<'semanas' | 'meses'>('semanas')
  const today = todayLocal()
  const bars =
    period === 'semanas'
      ? kmByWeek(runs, today, 12).map((w) => ({
          label: fmtDay(w.week),
          full: `Semana del ${fmtDay(w.week)}`,
          km: w.km,
        }))
      : kmByMonth(runs, today, 12).map((m) => {
          const d = parseLocalDate(`${m.month}-01`)
          return {
            label: format(d, 'MMM', { locale: es }),
            full: format(d, 'MMMM yyyy', { locale: es }),
            km: m.km,
          }
        })

  const paceData = runs
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((r) => ({
      date: r.date,
      pace: paceSecPerKm(r.durationSec, r.distanceKm),
      km: r.distanceKm,
      hr: r.avgHeartRate,
    }))
    .filter((p): p is typeof p & { pace: number } => p.pace !== null)
  const paceAxis = paceTicks(paceData.map((p) => p.pace))
  const hrAxis = paceTicks(paceData.filter((p) => p.hr !== undefined).map((p) => p.pace))
  const hrData = paceData.filter((p): p is typeof p & { hr: number } => p.hr !== undefined)

  return (
    <div className="space-y-4">
      <ChartCard
        title="Kilómetros"
        note={period === 'semanas' ? 'Últimas 12 semanas' : 'Últimos 12 meses'}
        table={{ head: ['Periodo', 'km'], rows: bars.map((b) => [b.full, formatNumber(b.km, 1)]) }}
      >
        <div className="mb-3">
          <SegmentedControl
            label="Periodo"
            value={period}
            onChange={setPeriod}
            options={[
              { value: 'semanas', label: 'Semanas' },
              { value: 'meses', label: 'Meses' },
            ]}
          />
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart
            data={bars}
            margin={{ top: 6, right: 0, left: -18, bottom: 0 }}
            barCategoryGap="22%"
          >
            <CartesianGrid vertical={false} stroke={GRID_STROKE} />
            <XAxis
              dataKey="label"
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={8}
            />
            <YAxis
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              width={44}
            />
            <Tooltip
              cursor={{ fill: 'var(--c-fill)' }}
              content={({ active, payload }) => {
                const p = payload?.[0]?.payload as (typeof bars)[number] | undefined
                return active && p ? (
                  <TooltipBox
                    title={p.full}
                    rows={[
                      { label: 'Distancia', value: `${formatNumber(p.km, 1)} km`, color: RUN },
                    ]}
                  />
                ) : null
              }}
            />
            <Bar dataKey="km" fill={RUN} radius={[4, 4, 0, 0]} maxBarSize={22} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {paceData.length >= 2 && (
        <ChartCard
          title="Evolución del ritmo"
          note="Más rápido, más arriba"
          table={{
            head: ['Fecha', 'Ritmo', 'km'],
            rows: paceData.map((p) => [p.date, formatPace(p.pace), formatNumber(p.km, 2)]),
          }}
        >
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={paceData} margin={{ top: 6, right: 8, left: -10, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={GRID_STROKE} />
              <XAxis
                dataKey="date"
                tickFormatter={fmtDay}
                tick={AXIS_TICK}
                tickLine={false}
                axisLine={false}
                minTickGap={24}
              />
              <YAxis
                reversed
                domain={paceAxis.domain}
                ticks={paceAxis.ticks}
                tickFormatter={(v: number) => formatPace(v, false)}
                tick={AXIS_TICK}
                tickLine={false}
                axisLine={false}
                width={44}
              />
              <Tooltip
                cursor={{ stroke: 'var(--c-ink-3)', strokeWidth: 1 }}
                content={({ active, payload }) => {
                  const p = payload?.[0]?.payload as (typeof paceData)[number] | undefined
                  return active && p ? (
                    <TooltipBox
                      title={fmtDay(p.date)}
                      rows={[
                        { label: 'Ritmo', value: formatPace(p.pace), color: RUN },
                        { label: 'Distancia', value: `${formatNumber(p.km, 2)} km` },
                      ]}
                    />
                  ) : null
                }}
              />
              <Line
                type="linear"
                dataKey="pace"
                stroke={RUN}
                strokeWidth={2}
                dot={{ r: 4, fill: RUN, stroke: 'var(--c-card)', strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {hrData.length >= 2 && (
        <ChartCard
          title="Ritmo frente a pulsaciones"
          note="Cada punto es una carrera"
          table={{
            head: ['Fecha', 'Ritmo', 'ppm'],
            rows: hrData.map((p) => [p.date, formatPace(p.pace), String(p.hr)]),
          }}
        >
          <ResponsiveContainer width="100%" height={200}>
            <ScatterChart margin={{ top: 6, right: 8, left: -10, bottom: 0 }}>
              <CartesianGrid stroke={GRID_STROKE} />
              <XAxis
                type="number"
                dataKey="hr"
                name="Pulsaciones"
                unit=" ppm"
                domain={['dataMin - 5', 'dataMax + 5']}
                tick={AXIS_TICK}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="number"
                dataKey="pace"
                reversed
                domain={hrAxis.domain}
                ticks={hrAxis.ticks}
                tickFormatter={(v: number) => formatPace(v, false)}
                tick={AXIS_TICK}
                tickLine={false}
                axisLine={false}
                width={44}
              />
              <Tooltip
                content={({ active, payload }) => {
                  const p = payload?.[0]?.payload as (typeof hrData)[number] | undefined
                  return active && p ? (
                    <TooltipBox
                      title={fmtDay(p.date)}
                      rows={[
                        { label: 'Ritmo', value: formatPace(p.pace), color: RUN },
                        { label: 'Pulsaciones', value: `${p.hr} ppm` },
                      ]}
                    />
                  ) : null
                }}
              />
              <Scatter data={hrData} fill={RUN} stroke="var(--c-card)" strokeWidth={2} />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </div>
  )
}
