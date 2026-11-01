import { useState } from 'react'
import { Camera } from 'lucide-react'
import { GYM } from '@/components/charts/chartTheme'
import { BlobImage } from '@/components/ui/BlobImage'
import { Select } from '@/components/ui/Select'
import { usePhotos } from '@/db/days'
import type { TrainingData } from '@/db/stats'
import { capitalize, longDate } from '@/domain/dates'
import { inRange, movingAverage7, type RangeBounds } from '@/domain/stats'
import { formatNumber } from '@/domain/units'
import { LinesCard } from './charts'
import { SectionTitle, StatTile, TileGrid } from './StatTile'

export default function BodyTab({ data, bounds }: { data: TrainingData; bounds: RangeBounds }) {
  const points = data.logs
    .filter((l) => l.bodyWeight !== undefined && inRange(l.date, bounds))
    .map((l) => ({ date: l.date, value: l.bodyWeight ?? 0 }))
  const ma = movingAverage7(points)
  const first = ma[0]
  const last = ma[ma.length - 1]

  return (
    <div>
      {ma.length === 0 ? (
        <p className="rounded-card bg-card px-4 py-4 text-subhead text-ink-2">
          Apunta tu peso en el calendario o al terminar un entreno para ver su evolución.
        </p>
      ) : (
        <>
          <TileGrid>
            <StatTile label="Último peso" value={`${formatNumber(last?.value ?? 0, 1)} kg`} />
            <StatTile
              label="Cambio en el periodo"
              value={`${last && first && last.avg - first.avg > 0 ? '+' : ''}${formatNumber((last?.avg ?? 0) - (first?.avg ?? 0), 1)} kg`}
            />
          </TileGrid>
          <div className="mt-3">
            <LinesCard
              title="Peso corporal"
              note="Con media móvil de 7 días"
              data={ma.map((p) => ({
                x: p.date,
                peso: p.value,
                media: Math.round(p.avg * 10) / 10,
              }))}
              series={[
                { key: 'peso', name: 'Peso', color: GYM },
                { key: 'media', name: 'Media 7 días', color: 'var(--c-ink-2)', dashed: true },
              ]}
              format={(v) => `${formatNumber(v, 1)} kg`}
              domain={['dataMin - 1', 'dataMax + 1']}
            />
          </div>
        </>
      )}

      <SectionTitle>Fotos de progreso</SectionTitle>
      <PhotoCompare />
    </div>
  )
}

/** Comparador de fotos: dos fechas lado a lado. */
function PhotoCompare() {
  const photos = usePhotos()
  const [a, setA] = useState<string | null>(null)
  const [b, setB] = useState<string | null>(null)
  if (!photos) return null
  if (photos.length === 0)
    return (
      <div className="flex items-center gap-3 rounded-card bg-card px-4 py-4 text-subhead text-ink-2">
        <Camera size={20} className="text-accent-ink" aria-hidden />
        Añade fotos desde el calendario (toca un día) para compararlas aquí.
      </div>
    )
  const left = photos.find((p) => p.id === a) ?? photos[0]
  const right = photos.find((p) => p.id === b) ?? photos[photos.length - 1]
  const option = (p: (typeof photos)[number]) => (
    <option key={p.id} value={p.id}>
      {capitalize(longDate(p.date))}
    </option>
  )
  return (
    <div className="grid grid-cols-2 gap-2">
      {[
        { photo: left, set: setA, label: 'Foto de la izquierda' },
        { photo: right, set: setB, label: 'Foto de la derecha' },
      ].map(({ photo, set, label }) => (
        <div key={label} className="overflow-hidden rounded-card bg-card">
          <div className="aspect-[3/4] bg-fill">
            {photo && (
              <BlobImage
                blob={photo.image}
                alt={`Foto del ${longDate(photo.date)}`}
                className="size-full object-cover"
              />
            )}
          </div>
          <div className="px-1 py-1">
            <Select
              aria-label={label}
              value={photo?.id}
              onChange={(e) => set(e.target.value)}
              className="max-w-full text-footnote"
            >
              {photos.map(option)}
            </Select>
          </div>
        </div>
      ))}
    </div>
  )
}
