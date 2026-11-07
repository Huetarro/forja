import { useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Share, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Celebration } from '@/components/ui/Celebration'
import { NavBar } from '@/components/ui/NavBar'
import { useSummary } from '@/db/summary'
import { capitalize, longDate } from '@/domain/dates'
import { RECORD_LABEL, type SessionRecord } from '@/domain/records'
import { formatDuration } from '@/domain/timer'
import { formatNumber, type WeightUnit } from '@/domain/units'
import { cn } from '@/lib/cn'
import { shareOrDownload } from '@/lib/share'
import { toast } from '@/stores/ui'
import { ShareCard } from './ShareCard'

export default function SummaryPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const data = useSummary(id)
  const cardRef = useRef<HTMLDivElement>(null)
  const [sharing, setSharing] = useState(false)
  const celebrate = (location.state as { celebrate?: boolean } | null)?.celebrate === true

  if (data === null) return <NavBar backLabel="Inicio" />
  if (!data) return null
  const { workout, summary } = data

  const share = async () => {
    if (!cardRef.current) return
    setSharing(true)
    try {
      const { toBlob } = await import('html-to-image')
      const blob = await toBlob(cardRef.current, { pixelRatio: 3, cacheBust: true })
      if (!blob) throw new Error('sin imagen')
      const file = new File([blob], `forja-${workout.date}.png`, { type: 'image/png' })
      const r = await shareOrDownload(file, `Entreno ${workout.routineName}`)
      if (r === 'downloaded') toast('Imagen descargada')
    } catch {
      toast('No se pudo crear la imagen')
    } finally {
      setSharing(false)
    }
  }

  const tiles = [
    {
      label: 'Duración',
      value: formatDuration(summary.durationSec),
      pct: summary.durationPct,
      good: false,
    },
    {
      label: 'Volumen',
      value: `${formatNumber(Math.round(summary.volumeKg), 0)} kg`,
      pct: summary.volumePct,
      good: true,
    },
    { label: 'Series efectivas', value: String(summary.effectiveSets) },
    { label: 'Ejercicios', value: String(summary.exerciseCount) },
  ]

  return (
    <>
      <NavBar backLabel="Inicio" />
      <header className="pt-1 pb-5">
        <p className="text-footnote font-semibold text-ink-2">
          {capitalize(longDate(workout.date))}
        </p>
        <h1 className="font-display text-large font-bold tracking-tight">
          {celebrate ? '¡Entreno terminado!' : workout.routineName}
        </h1>
        {celebrate && <p className="text-subhead text-ink-2">{workout.routineName}</p>}
      </header>

      <div className="grid grid-cols-2 gap-3">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-card bg-card p-4">
            <div className="tnum font-display text-title1 font-bold tracking-tight">{t.value}</div>
            <div className="mt-0.5 text-footnote text-ink-2">{t.label}</div>
            {t.pct !== undefined && t.pct !== null && <Delta pct={t.pct} good={t.good === true} />}
          </div>
        ))}
      </div>
      {summary.durationPct !== null && (
        <p className="mt-2 px-1 text-footnote text-ink-2">
          Porcentajes frente a la vez anterior de esta rutina.
        </p>
      )}

      {summary.records.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 flex items-center gap-2 px-1 text-title3 font-bold">
            <Trophy size={20} className="text-accent-ink" aria-hidden />
            {summary.records.length === 1
              ? 'Récord batido'
              : `${summary.records.length} récords batidos`}
          </h2>
          <ul className="divide-y divide-sep overflow-hidden rounded-card bg-card">
            {summary.records.map((r, i) => (
              <li key={i} className="flex items-center justify-between gap-3 px-4 py-3">
                <span className="min-w-0">
                  <span className="block truncate text-body font-semibold">
                    {r.exerciseName}
                    {r.side ? ` (${r.side === 'izq' ? 'Izq' : 'Der'})` : ''}
                  </span>
                  <span className="block text-footnote text-ink-2">{RECORD_LABEL[r.kind]}</span>
                </span>
                <span className="tnum shrink-0 text-body font-bold text-accent-ink">
                  {recordValue(r, r.unit, r.seconds)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-8 space-y-3">
        <Button
          size="lg"
          block
          icon={<Share size={20} />}
          onClick={() => void share()}
          disabled={sharing}
        >
          {sharing ? 'Creando imagen…' : 'Compartir'}
        </Button>
        <Button
          variant="secondary"
          size="lg"
          block
          onClick={() => navigate('/', { replace: true })}
        >
          Listo
        </Button>
      </div>

      {/* Tarjeta fuera de la vista para generar la imagen */}
      <div className="pointer-events-none fixed top-0 -left-[2000px]" aria-hidden>
        <ShareCard ref={cardRef} data={data} />
      </div>

      {celebrate && <Celebration burst={summary.records.length ? 44 : 28} />}
    </>
  )
}

function Delta({ pct, good }: { pct: number; good: boolean }) {
  const up = pct >= 0
  return (
    <div
      className={cn(
        'tnum mt-1 text-footnote font-semibold',
        good && up ? 'text-success' : 'text-ink-2',
      )}
    >
      {up ? '+' : '−'}
      {formatNumber(Math.abs(pct), 0)} %
    </div>
  )
}

function recordValue(r: SessionRecord, unit: WeightUnit, seconds?: boolean): string {
  const what = seconds ? 's' : 'reps'
  if (r.kind === 'reps')
    return r.weight
      ? `${r.value} ${what} × ${formatNumber(r.weight, 2)} ${unit}`
      : `${r.value} ${what}`
  return `${formatNumber(r.value, r.kind === 'volumen' ? 0 : 1)} ${unit}`
}
