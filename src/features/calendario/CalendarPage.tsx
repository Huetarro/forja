import { useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, History } from 'lucide-react'
import { useRangeData } from '@/db/days'
import { monthGrid } from '@/domain/calendar'
import { capitalize, parseLocalDate, todayLocal, type LocalDate } from '@/domain/dates'
import { CalendarLegend, MonthGrid } from './MonthGrid'
import { DaySheet } from './DaySheet'
import { YearHeatmap } from './YearHeatmap'

export default function CalendarPage() {
  const today = todayLocal()
  const t = parseLocalDate(today)
  const [ym, setYm] = useState({ y: t.getFullYear(), m: t.getMonth() })
  const [openDay, setOpenDay] = useState<LocalDate | null>(null)

  const weeks = monthGrid(ym.y, ym.m)
  const from = weeks[0]?.[0]?.date ?? today
  const to = weeks[weeks.length - 1]?.[6]?.date ?? today
  const data = useRangeData(from, to)

  const shift = (dir: 1 | -1) =>
    setYm(({ y, m }) => {
      const n = m + dir
      return n < 0 ? { y: y - 1, m: 11 } : n > 11 ? { y: y + 1, m: 0 } : { y, m: n }
    })
  const isCurrent = ym.y === t.getFullYear() && ym.m === t.getMonth()

  return (
    <>
      <header className="flex items-end justify-between pt-4 pb-4">
        <h1 className="font-display text-large font-bold tracking-tight">Calendario</h1>
        <Link
          to="/historial"
          className="flex min-h-touch items-center gap-1.5 text-body font-medium text-accent-ink"
        >
          <History size={19} aria-hidden /> Historial
        </Link>
      </header>

      <div className="mb-2 flex items-center justify-between px-1">
        <h2 className="text-title3 font-bold" aria-live="polite">
          {capitalize(format(new Date(ym.y, ym.m, 1), 'MMMM yyyy', { locale: es }))}
        </h2>
        <div className="flex items-center">
          {!isCurrent && (
            <button
              type="button"
              onClick={() => setYm({ y: t.getFullYear(), m: t.getMonth() })}
              className="min-h-touch px-2 text-subhead font-semibold text-accent-ink"
            >
              Hoy
            </button>
          )}
          <button
            type="button"
            onClick={() => shift(-1)}
            aria-label="Mes anterior"
            className="grid size-11 place-items-center text-accent-ink"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            type="button"
            onClick={() => shift(1)}
            aria-label="Mes siguiente"
            className="grid size-11 place-items-center text-accent-ink"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {data ? (
        <MonthGrid weeks={weeks} data={data} today={today} onDay={setOpenDay} onSwipe={shift} />
      ) : (
        <div className="h-[380px] rounded-card bg-card" />
      )}
      <CalendarLegend />

      <div className="mt-6">
        <YearHeatmap today={today} onDay={setOpenDay} />
      </div>

      <DaySheet date={openDay} onClose={() => setOpenDay(null)} />
    </>
  )
}
