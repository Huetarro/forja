import { lazy, Suspense, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BarChart3, Calculator } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'
import { useTrainingData } from '@/db/stats'
import { todayLocal } from '@/domain/dates'
import { RANGE_LABEL, rangeBounds, type RangeKey } from '@/domain/stats'
import { cn } from '@/lib/cn'
import { OneRmSheet } from './OneRmSheet'

const OverviewTab = lazy(() => import('./OverviewTab'))
const ExercisesTab = lazy(() => import('./ExercisesTab'))
const MusclesTab = lazy(() => import('./MusclesTab'))
const BodyTab = lazy(() => import('./BodyTab'))
const HabitsTab = lazy(() => import('./HabitsTab'))

const TABS = [
  { key: 'resumen', label: 'Resumen' },
  { key: 'ejercicios', label: 'Ejercicios' },
  { key: 'musculos', label: 'Músculos' },
  { key: 'cuerpo', label: 'Cuerpo' },
  { key: 'habitos', label: 'Hábitos' },
] as const
type TabKey = (typeof TABS)[number]['key']

const RANGES: RangeKey[] = ['4s', '3m', '6m', '1a', 'todo']

export default function StatsPage() {
  const data = useTrainingData()
  const [params, setParams] = useSearchParams()
  const tab = (TABS.find((t) => t.key === params.get('tab'))?.key ?? 'resumen') as TabKey
  const range = (RANGES.find((r) => r === params.get('rango')) ?? '3m') as RangeKey
  const [calc, setCalc] = useState(false)

  const set = (patch: Record<string, string>) =>
    setParams({ ...Object.fromEntries(params), ...patch }, { replace: true })

  const header = (
    <PageHeader
      title="Estadísticas"
      action={
        <button
          type="button"
          onClick={() => setCalc(true)}
          aria-label="Calculadora de 1RM"
          className="mb-1 flex min-h-touch items-center gap-1.5 rounded-full bg-fill px-3.5 text-subhead font-semibold"
        >
          <Calculator size={18} aria-hidden /> 1RM
        </button>
      }
    />
  )

  if (!data) return header
  const empty = data.sessions.length === 0 && data.runs.length === 0 && data.logs.length === 0
  const bounds = rangeBounds(range, todayLocal(), data.earliest)

  return (
    <>
      {header}
      <div className="sticky top-0 z-10 -mx-4 space-y-2 bg-tabbar px-4 pt-1 pb-3 backdrop-blur-[20px] backdrop-saturate-[1.8]">
        <div
          role="tablist"
          aria-label="Secciones"
          className="-mx-4 flex gap-1.5 overflow-x-auto px-4 [scrollbar-width:none]"
        >
          {TABS.map((t) => (
            <button
              type="button"
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => set({ tab: t.key })}
              className={cn(
                'min-h-9 shrink-0 rounded-full px-4 text-subhead transition-colors',
                tab === t.key ? 'bg-accent text-on-accent' : 'bg-fill text-ink',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div role="radiogroup" aria-label="Periodo" className="flex rounded-full bg-fill p-0.5">
          {RANGES.map((r) => (
            <button
              type="button"
              key={r}
              role="radio"
              aria-checked={range === r}
              onClick={() => set({ rango: r })}
              className={cn(
                'min-h-8 flex-1 rounded-full text-footnote',
                range === r
                  ? 'bg-segment text-ink shadow-[0_1px_3px_rgba(0,0,0,0.12)]'
                  : 'text-ink-2',
              )}
            >
              {RANGE_LABEL[r]}
            </button>
          ))}
        </div>
      </div>

      {empty ? (
        <EmptyState
          icon={BarChart3}
          title="Aún no hay datos"
          text="Termina tu primer entreno o registra una carrera para ver tu progreso, tus récords y el trabajo de cada músculo."
        />
      ) : (
        <Suspense fallback={<div className="h-[420px] rounded-card bg-card" />}>
          {tab === 'resumen' && <OverviewTab data={data} bounds={bounds} />}
          {tab === 'ejercicios' && <ExercisesTab data={data} bounds={bounds} />}
          {tab === 'musculos' && <MusclesTab data={data} bounds={bounds} />}
          {tab === 'cuerpo' && <BodyTab data={data} bounds={bounds} />}
          {tab === 'habitos' && <HabitsTab data={data} bounds={bounds} />}
        </Suspense>
      )}

      <OneRmSheet open={calc} onClose={() => setCalc(false)} />
    </>
  )
}
