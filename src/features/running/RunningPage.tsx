import { lazy, Suspense } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Footprints, Plus, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'
import { useRuns } from '@/db/runs'
import type { Run, RunType } from '@/db/schema'
import { capitalize, parseLocalDate, todayLocal } from '@/domain/dates'
import { formatPace, paceSecPerKm, runRecords, yearTotals } from '@/domain/pace'
import { formatClock, formatDuration } from '@/domain/timer'
import { formatNumber } from '@/domain/units'
import { RunFormSheet } from './RunFormSheet'
import { RUN_TYPES } from '@/lib/runTypes'
import { runWeekComparison } from '@/domain/runWeek'
import { cn } from '@/lib/cn'

const RunCharts = lazy(() => import('./RunCharts'))

export default function RunningPage() {
  const runs = useRuns()
  const { id } = useParams()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const creating = params.get('nueva') === '1'
  const tipo = params.get('tipo')
  const initialType = RUN_TYPES.some((t) => t.value === tipo) ? (tipo as RunType) : undefined
  const editing = id ? runs?.find((r) => r.id === id) : undefined

  const close = () => {
    if (id) navigate('/running', { replace: true })
    else setParams({}, { replace: true })
  }

  if (!runs) return null
  const year = Number(todayLocal().slice(0, 4))
  const totals = yearTotals(runs, year)
  const rec = runRecords(runs)

  return (
    <>
      <PageHeader
        title="Running"
        action={
          <button
            type="button"
            onClick={() => setParams({ nueva: '1' })}
            aria-label="Registrar carrera"
            className="mb-1 grid size-11 place-items-center rounded-full bg-accent text-on-accent"
          >
            <Plus size={24} />
          </button>
        }
      />

      {runs.length === 0 ? (
        <EmptyState
          icon={Footprints}
          title="Registra tu primera carrera"
          text="Apunta distancia y tiempo, y Forja calcula tu ritmo y tus kilómetros de cada semana."
          action={<Button onClick={() => setParams({ nueva: '1' })}>Registrar carrera</Button>}
        />
      ) : (
        <div className="space-y-6">
          <WeekKmCard runs={runs} />

          <section className="rounded-card bg-card p-4" aria-label={`Totales de ${year}`}>
            <h2 className="text-body font-semibold">{year}</h2>
            <dl className="mt-2 grid grid-cols-3 gap-2">
              <Stat label="Kilómetros" value={formatNumber(totals.km, 1)} />
              <Stat label="Carreras" value={String(totals.count)} />
              <Stat label="Tiempo" value={formatDuration(totals.seconds)} />
            </dl>
          </section>

          <Suspense fallback={<div className="h-[280px] rounded-card bg-card" />}>
            <RunCharts runs={runs} />
          </Suspense>

          <section>
            <h2 className="mb-2 flex items-center gap-2 px-1 text-title3 font-bold">
              <Trophy size={19} className="text-accent-ink" aria-hidden /> Récords
            </h2>
            <ul className="divide-y divide-sep overflow-hidden rounded-card bg-card">
              <RecordRow
                label="Carrera más larga"
                run={rec.longest}
                value={(r) => `${formatNumber(r.distanceKm, 2)} km`}
              />
              <RecordRow
                label="Mejor ritmo (5 km o más)"
                run={rec.bestPace5k}
                value={(r) => formatPace(paceSecPerKm(r.durationSec, r.distanceKm))}
              />
              <RecordRow
                label="Mejor ritmo (10 km o más)"
                run={rec.bestPace10k}
                value={(r) => formatPace(paceSecPerKm(r.durationSec, r.distanceKm))}
              />
              <li className="flex items-center justify-between gap-3 px-4 py-3">
                <span>
                  <span className="block text-body">Semana con más km</span>
                  {rec.bestWeek && (
                    <span className="block text-footnote text-ink-2">
                      Semana del{' '}
                      {format(parseLocalDate(rec.bestWeek.week), "d 'de' MMMM yyyy", {
                        locale: es,
                      })}
                    </span>
                  )}
                </span>
                <span className="tnum font-bold">
                  {rec.bestWeek ? `${formatNumber(rec.bestWeek.km, 1)} km` : '—'}
                </span>
              </li>
              <li className="flex items-center justify-between gap-3 px-4 py-3">
                <span>
                  <span className="block text-body">Mes con más km</span>
                  {rec.bestMonth && (
                    <span className="block text-footnote text-ink-2">
                      {capitalize(
                        format(parseLocalDate(`${rec.bestMonth.month}-01`), 'MMMM yyyy', {
                          locale: es,
                        }),
                      )}
                    </span>
                  )}
                </span>
                <span className="tnum font-bold">
                  {rec.bestMonth ? `${formatNumber(rec.bestMonth.km, 1)} km` : '—'}
                </span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 px-1 text-title3 font-bold">Carreras</h2>
            <ul className="divide-y divide-sep overflow-hidden rounded-card bg-card">
              {runs.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => navigate(`/running/${r.id}`)}
                    className="flex min-h-14 w-full items-center gap-3 px-4 py-2 text-left active:bg-fill"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="tnum block text-body font-semibold">
                        {formatNumber(r.distanceKm, 2)} km
                      </span>
                      <span className="block truncate text-footnote text-ink-2">
                        {capitalize(format(parseLocalDate(r.date), 'EEE d MMM', { locale: es }))} ·{' '}
                        {RUN_TYPES.find((t) => t.value === r.type)?.label}
                        {r.surface === 'cinta' ? ' · Cinta' : ''}
                      </span>
                    </span>
                    <span className="tnum text-right">
                      <span className="block text-subhead font-semibold">
                        {formatClock(r.durationSec, true)}
                      </span>
                      <span className="block text-footnote text-ink-2">
                        {formatPace(paceSecPerKm(r.durationSec, r.distanceKm))}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}

      <RunFormSheet
        open={creating || editing !== undefined}
        onClose={close}
        run={editing}
        initialType={initialType}
        key={editing?.id ?? `new-${initialType ?? ''}`}
      />
    </>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-caption text-ink-2">{label}</dt>
      <dd className="tnum text-title3 font-bold">{value}</dd>
    </div>
  )
}

function RecordRow({ label, run, value }: { label: string; run?: Run; value: (r: Run) => string }) {
  return (
    <li className="flex items-center justify-between gap-3 px-4 py-3">
      <span>
        <span className="block text-body">{label}</span>
        {run && (
          <span className="block text-footnote text-ink-2">
            {capitalize(format(parseLocalDate(run.date), "d 'de' MMMM yyyy", { locale: es }))}
          </span>
        )}
      </span>
      <span className="tnum font-bold">{run ? value(run) : '—'}</span>
    </li>
  )
}

/** Km de esta semana frente a la anterior y el máximo recomendado (+10 %). */
function WeekKmCard({ runs }: { runs: Run[] }) {
  const c = runWeekComparison(runs, todayLocal())
  const over = c.maxRecommended !== null && c.thisWeek > c.maxRecommended
  const pct = c.maxRecommended ? Math.min(1, c.thisWeek / c.maxRecommended) : 0
  return (
    <section className="rounded-card bg-card p-4" aria-label="Kilómetros de esta semana">
      <h2 className="text-body font-semibold">Esta semana</h2>
      <dl className="mt-2 grid grid-cols-3 gap-2">
        <Stat label="Esta semana" value={`${formatNumber(c.thisWeek, 1)} km`} />
        <Stat label="Anterior" value={`${formatNumber(c.lastWeek, 1)} km`} />
        <Stat
          label="Máx. recomendado"
          value={c.maxRecommended === null ? '—' : `${formatNumber(c.maxRecommended, 1)} km`}
        />
      </dl>
      {c.maxRecommended !== null && (
        <div className="mt-3">
          <div className="h-2 overflow-hidden rounded-full bg-fill" aria-hidden>
            <div
              className={cn('h-full rounded-full', over ? 'bg-warm' : 'bg-chart-run')}
              style={{ width: `${pct * 100}%` }}
            />
          </div>
          <p className={cn('mt-1.5 text-footnote', over ? 'text-warm' : 'text-ink-2')}>
            {over
              ? 'Has pasado el +10 % sobre la semana anterior.'
              : `Te quedan ${formatNumber(Math.max(0, c.maxRecommended - c.thisWeek), 1)} km hasta el +10 %.`}
          </p>
        </div>
      )}
    </section>
  )
}
