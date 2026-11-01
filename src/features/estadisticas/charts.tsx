/** Gráficas reutilizables de Estadísticas (Recharts; solo se cargan con las pestañas). */
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartCard, TooltipBox } from '@/components/charts/chartKit'
import { AXIS_TICK, GRID_STROKE, GYM, fmtDay } from '@/components/charts/chartTheme'

interface Point {
  x: string
  y: number
}

/** Barras de una sola serie (p. ej. por semana). */
export function BarsCard({
  title,
  note,
  data,
  format: fmt,
  color = GYM,
  xLabel = fmtDay,
  valueLabel,
}: {
  title: string
  note?: string
  data: Point[]
  format: (v: number) => string
  color?: string
  xLabel?: (x: string) => string
  valueLabel: string
}) {
  return (
    <ChartCard
      title={title}
      note={note}
      table={{ head: ['Fecha', valueLabel], rows: data.map((d) => [xLabel(d.x), fmt(d.y)]) }}
    >
      <ResponsiveContainer width="100%" height={170}>
        <BarChart
          data={data}
          margin={{ top: 6, right: 0, left: -14, bottom: 0 }}
          barCategoryGap="22%"
        >
          <CartesianGrid vertical={false} stroke={GRID_STROKE} />
          <XAxis
            dataKey="x"
            tickFormatter={xLabel}
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            minTickGap={12}
          />
          <YAxis
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            width={44}
            tickFormatter={(v: number) => compact(v)}
          />
          <Tooltip
            cursor={{ fill: 'var(--c-fill)' }}
            content={({ active, payload }) => {
              const p = payload?.[0]?.payload as Point | undefined
              return active && p ? (
                <TooltipBox
                  title={xLabel(p.x)}
                  rows={[{ label: valueLabel, value: fmt(p.y), color }]}
                />
              ) : null
            }}
          />
          <Bar dataKey="y" fill={color} radius={[4, 4, 0, 0]} maxBarSize={22} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

export interface LineSeries {
  key: string
  name: string
  color: string
  dashed?: boolean
}

/** Líneas (una o dos series) con eje X de fechas. */
export function LinesCard({
  title,
  note,
  data,
  series,
  format: fmt,
  height = 180,
  domain,
}: {
  title: string
  note?: string
  data: Array<Record<string, string | number | null>>
  series: LineSeries[]
  format: (v: number) => string
  height?: number
  domain?: [number | string, number | string]
}) {
  return (
    <ChartCard
      title={title}
      note={note}
      table={{
        head: ['Fecha', ...series.map((s) => s.name)],
        rows: data.map((d) => [
          fmtDay(String(d.x)),
          ...series.map((s) => (typeof d[s.key] === 'number' ? fmt(d[s.key] as number) : '—')),
        ]),
      }}
    >
      {series.length > 1 && (
        <ul className="mb-2 flex flex-wrap gap-x-4 gap-y-1" aria-hidden>
          {series.map((s) => (
            <li key={s.key} className="flex items-center gap-1.5 text-footnote text-ink-2">
              <span
                className="h-0.5 w-4 rounded-full"
                style={{ background: s.color, opacity: s.dashed ? 0.6 : 1 }}
              />
              {s.name}
            </li>
          ))}
        </ul>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 6, right: 8, left: -14, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={GRID_STROKE} />
          <XAxis
            dataKey="x"
            tickFormatter={fmtDay}
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            minTickGap={24}
          />
          <YAxis
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            width={44}
            domain={domain ?? ['auto', 'auto']}
            tickFormatter={(v: number) => compact(v)}
          />
          <Tooltip
            cursor={{ stroke: 'var(--c-ink-3)', strokeWidth: 1 }}
            content={({ active, payload }) => {
              const p = payload?.[0]?.payload as Record<string, string | number | null> | undefined
              if (!active || !p) return null
              return (
                <TooltipBox
                  title={fmtDay(String(p.x))}
                  rows={series
                    .filter((s) => typeof p[s.key] === 'number')
                    .map((s) => ({
                      label: s.name,
                      value: fmt(p[s.key] as number),
                      color: s.color,
                    }))}
                />
              )
            }}
          />
          {series.map((s) => (
            <Line
              key={s.key}
              type="linear"
              dataKey={s.key}
              name={s.name}
              stroke={s.color}
              strokeWidth={2}
              strokeDasharray={s.dashed ? '5 4' : undefined}
              strokeOpacity={s.dashed ? 0.75 : 1}
              connectNulls
              dot={
                s.dashed || data.length > 12
                  ? false
                  : { r: 4, fill: s.color, stroke: 'var(--c-card)', strokeWidth: 2 }
              }
              activeDot={{ r: 6 }}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

/** Minigráfica (sin ejes) para listas. */
export function Sparkline({ values, color = GYM }: { values: number[]; color?: string }) {
  if (values.length < 2) return <span className="block h-7 w-16" aria-hidden />
  const data = values.map((y, i) => ({ i, y }))
  return (
    <span className="block h-7 w-16" aria-hidden>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 3, right: 3, left: 3, bottom: 3 }}>
          <YAxis hide domain={['dataMin', 'dataMax']} />
          <Line
            type="linear"
            dataKey="y"
            stroke={color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </span>
  )
}

function compact(v: number): string {
  if (Math.abs(v) >= 10000) return `${Math.round(v / 1000)}k`
  if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(1).replace('.', ',')}k`
  return String(Math.round(v * 10) / 10).replace('.', ',')
}
