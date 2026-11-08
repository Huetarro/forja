import { Fragment, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Camera, ChevronRight, Dumbbell, Footprints, HeartPulse, X } from 'lucide-react'
import { BlobImage } from '@/components/ui/BlobImage'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Group, Row, Switch, TextArea } from '@/components/ui/Form'
import {
  addPhoto,
  deletePhoto,
  updateDayLog,
  useDayLog,
  usePhotos,
  useRangeData,
  useSupplements,
} from '@/db/days'
import { formatCardio } from '@/domain/cardio'
import { capitalize, longDate, type LocalDate } from '@/domain/dates'
import { formatDuration } from '@/domain/timer'
import { formatNumber } from '@/domain/units'
import { routineColor } from '@/lib/routineStyle'
import { toast } from '@/stores/ui'
import { DecimalField, NutritionToggle, RestSegment, SupplementChips } from './DayFields'

/** Hoja de un día: actividad y registro diario. */
export function DaySheet({ date, onClose }: { date: LocalDate | null; onClose: () => void }) {
  return (
    <BottomSheet
      open={date !== null}
      onClose={onClose}
      title={date ? capitalize(longDate(date)) : ''}
      tall
    >
      {date && <DayContent date={date} />}
    </BottomSheet>
  )
}

function DayContent({ date }: { date: LocalDate }) {
  const log = useDayLog(date)
  const supplements = useSupplements()
  const range = useRangeData(date, date)
  const photos = usePhotos(date)
  const fileRef = useRef<HTMLInputElement>(null)
  if (!log || !supplements || !range || !photos) return null

  const onFiles = async (files: FileList | null) => {
    if (!files) return
    try {
      for (const f of Array.from(files)) await addPhoto(date, f)
      toast(files.length === 1 ? 'Foto añadida' : 'Fotos añadidas')
    } catch {
      toast('No se pudo guardar la foto')
    }
  }

  return (
    <div className="space-y-6 pt-2" key={date}>
      {(range.workouts.length > 0 || range.runs.length > 0) && (
        <Group title="Actividad">
          {range.workouts.map((w) => (
            <Fragment key={w.id}>
              <Link
                to={`/historial/${w.id}`}
                className="flex min-h-12 items-center gap-3 px-4 active:bg-fill"
              >
                <span
                  className="grid size-7 place-items-center rounded-md text-white"
                  style={{ background: routineColor(range.routineColors.get(w.routineId) ?? 10) }}
                >
                  <Dumbbell size={15} aria-hidden />
                </span>
                <span className="flex-1 truncate text-body">{w.routineName}</span>
                <span className="tnum text-footnote text-ink-2">
                  {formatDuration(w.activeSeconds)}
                </span>
                <ChevronRight size={18} className="text-ink-2" aria-hidden />
              </Link>
              {w.cardio && (
                <div className="flex min-h-12 items-center gap-3 px-4">
                  <span className="grid size-7 place-items-center rounded-md bg-fill text-cardio">
                    <HeartPulse size={15} aria-hidden />
                  </span>
                  <span className="flex-1 truncate text-body">Cardio</span>
                  <span className="tnum text-footnote text-ink-2">{formatCardio(w.cardio)}</span>
                </div>
              )}
            </Fragment>
          ))}
          {range.runs.map((r) => (
            <Link
              key={r.id}
              to={`/running/${r.id}`}
              className="flex min-h-12 items-center gap-3 px-4 active:bg-fill"
            >
              <span className="grid size-7 place-items-center rounded-md bg-run text-white">
                <Footprints size={15} aria-hidden />
              </span>
              <span className="flex-1 truncate text-body">Carrera</span>
              <span className="tnum text-footnote text-ink-2">
                {formatNumber(r.distanceKm, 2)} km
              </span>
              <ChevronRight size={18} className="text-ink-2" aria-hidden />
            </Link>
          ))}
        </Group>
      )}

      <RestSegment date={date} log={log} />

      <section>
        <h3 className="mb-2 px-4 text-footnote font-medium text-ink-2">Suplementos</h3>
        {supplements.length === 0 ? (
          <p className="px-4 text-subhead text-ink-2">
            No tienes suplementos activos. Añádelos en Ajustes.
          </p>
        ) : (
          <SupplementChips date={date} log={log} supplements={supplements} showAll />
        )}
      </section>

      <section>
        <h3 className="mb-2 px-4 text-footnote font-medium text-ink-2">Alimentación</h3>
        <NutritionToggle date={date} log={log} />
      </section>

      <Group>
        <Row label="Horas de sueño" htmlFor="day-sleep">
          <DecimalField
            key={`sleep-${date}`}
            id="day-sleep"
            label="Horas de sueño"
            unit="h"
            value={log.sleepHours}
            onSave={(sleepHours) => void updateDayLog(date, { sleepHours })}
          />
        </Row>
        <Row label="Estiramientos">
          <Switch
            label="Estiramientos"
            checked={log.stretching}
            onChange={(stretching) => void updateDayLog(date, { stretching })}
          />
        </Row>
        <Row label="Peso corporal" htmlFor="day-weight">
          <DecimalField
            key={`bw-${date}`}
            id="day-weight"
            label="Peso corporal"
            unit="kg"
            value={log.bodyWeight}
            onSave={(bodyWeight) => void updateDayLog(date, { bodyWeight })}
          />
        </Row>
      </Group>

      <section>
        <h3 className="mb-2 px-4 text-footnote font-medium text-ink-2">Fotos de progreso</h3>
        <div className="grid grid-cols-3 gap-2">
          {photos.map((p) => (
            <div key={p.id} className="relative aspect-[3/4] overflow-hidden rounded-md bg-fill">
              <BlobImage
                blob={p.image}
                alt={`Foto del ${longDate(date)}`}
                className="size-full object-cover"
              />
              <button
                type="button"
                onClick={async () => {
                  const undo = await deletePhoto(p.id)
                  toast('Foto eliminada', undo)
                }}
                aria-label="Eliminar foto"
                className="absolute top-1 right-1 grid size-8 place-items-center rounded-full bg-black/55 text-white"
              >
                <X size={16} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex aspect-[3/4] flex-col items-center justify-center gap-1 rounded-md bg-fill text-footnote font-semibold text-accent-ink"
          >
            <Camera size={24} aria-hidden />
            Añadir foto
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          aria-label="Elegir fotos"
          onChange={(e) => {
            void onFiles(e.target.files)
            e.target.value = ''
          }}
        />
      </section>

      <Group title="Notas">
        <TextArea
          key={`notes-${date}`}
          aria-label="Notas del día"
          placeholder="Cómo te has sentido, molestias…"
          defaultValue={log.notes}
          onBlur={(e) =>
            e.target.value !== log.notes &&
            void updateDayLog(date, { notes: e.target.value.trim() })
          }
          maxLength={1000}
        />
      </Group>
    </div>
  )
}
