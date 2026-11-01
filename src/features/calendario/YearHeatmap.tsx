import { useEffect, useRef } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useRangeData } from '@/db/days'
import { activityLevel, heatmapColumns } from '@/domain/calendar'
import { longDate, parseLocalDate, type LocalDate } from '@/domain/dates'
import { cn } from '@/lib/cn'
import { marksFor } from './dayMarks'

const LEVEL_CLASS = ['bg-fill', 'bg-accent/25', 'bg-accent/50', 'bg-accent/75', 'bg-accent']

/** Mapa de calor del último año (tipo GitHub). Tocar una celda abre el día. */
export function YearHeatmap({ today, onDay }: { today: LocalDate; onDay: (d: LocalDate) => void }) {
  const cols = heatmapColumns(today)
  const first = cols[0]?.[0] ?? today
  const data = useRangeData(first, today)
  const scroller = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scroller.current
    if (el) el.scrollLeft = el.scrollWidth
  }, [data])

  if (!data) return <div className="h-[132px]" />

  const active = cols.flat().filter((d) => d && activityLevel(marksFor(data, d)) >= 2).length
  return (
    <section className="rounded-card bg-card p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-body font-semibold">Último año</h2>
        <span className="tnum text-footnote text-ink-2">{active} días activos</span>
      </div>
      <div ref={scroller} className="-mx-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
        <div className="flex gap-[3px]" style={{ width: cols.length * 14 }}>
          {cols.map((col, ci) => {
            const firstDay = col[0]
            const showMonth = firstDay && Number(firstDay.slice(8)) <= 7
            return (
              <div key={ci} className="flex flex-col gap-[3px]">
                <span className="h-3 text-[9px] leading-3 whitespace-nowrap text-ink-3" aria-hidden>
                  {showMonth ? format(parseLocalDate(firstDay), 'MMM', { locale: es }) : ''}
                </span>
                {col.map((d, di) =>
                  d ? (
                    <button
                      type="button"
                      key={d}
                      onClick={() => onDay(d)}
                      aria-label={longDate(d)}
                      className={cn(
                        'size-[11px] rounded-[3px]',
                        LEVEL_CLASS[activityLevel(marksFor(data, d))],
                        d === today && 'ring-1 ring-ink',
                      )}
                    />
                  ) : (
                    <span key={`e${di}`} className="size-[11px]" />
                  ),
                )}
              </div>
            )
          })}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-end gap-1 text-caption text-ink-3" aria-hidden>
        Menos
        {LEVEL_CLASS.map((c) => (
          <span key={c} className={cn('size-[11px] rounded-[3px]', c)} />
        ))}
        Más
      </div>
    </section>
  )
}
