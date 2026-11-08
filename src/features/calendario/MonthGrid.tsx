import { motion, useReducedMotion } from 'motion/react'
import type { RangeData } from '@/db/days'
import type { GridDay } from '@/domain/calendar'
import { cn } from '@/lib/cn'
import { routineColor } from '@/lib/routineStyle'
import { marksFor } from './dayMarks'

const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const WEEKDAY_NAMES = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']

interface Props {
  weeks: GridDay[][]
  data: RangeData
  today: string
  onDay: (date: string) => void
  onSwipe: (dir: 1 | -1) => void
}

/** Cuadrícula mensual (lunes primero). Desliza a los lados para cambiar de mes. */
export function MonthGrid({ weeks, data, today, onDay, onSwipe }: Props) {
  const reduce = useReducedMotion()
  return (
    <div className="rounded-card bg-card px-2 pt-2 pb-3">
      <div className="grid grid-cols-7 pb-1" aria-hidden>
        {WEEKDAYS.map((d) => (
          <span key={d} className="text-center text-caption font-semibold text-ink-3">
            {d}
          </span>
        ))}
      </div>
      <motion.div
        drag={reduce ? false : 'x'}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.25}
        dragSnapToOrigin
        dragDirectionLock
        onDragEnd={(_, info) => {
          if (info.offset.x < -60) onSwipe(1)
          else if (info.offset.x > 60) onSwipe(-1)
        }}
        className="touch-pan-y"
        role="grid"
      >
        {weeks.map((week) => (
          <div key={week[0]?.date} className="grid grid-cols-7" role="row">
            {week.map((d, i) => {
              const m = marksFor(data, d.date)
              const isToday = d.date === today
              const dayNum = Number(d.date.slice(8))
              const label = [
                `${WEEKDAY_NAMES[i]} ${dayNum}`,
                m.workouts ? `${m.workouts} entreno${m.workouts > 1 ? 's' : ''}` : null,
                m.cardio ? 'cardio' : null,
                m.runs ? `${m.runs} carrera${m.runs > 1 ? 's' : ''}` : null,
                m.rest ? 'descanso' : null,
                m.allSupplements ? 'suplementos completos' : null,
                m.nutritionGood ? 'alimentación bien' : null,
              ]
                .filter(Boolean)
                .join(', ')
              return (
                <button
                  type="button"
                  role="gridcell"
                  key={d.date}
                  onClick={() => onDay(d.date)}
                  aria-label={label}
                  className={cn(
                    'flex min-h-[58px] flex-col items-center gap-[3px] rounded-md pt-1 active:bg-fill',
                    !d.inMonth && 'opacity-35',
                  )}
                >
                  <span
                    className={cn(
                      'tnum grid size-7 place-items-center rounded-full text-subhead',
                      isToday ? 'bg-accent font-bold text-on-accent' : 'font-medium',
                    )}
                  >
                    {dayNum}
                  </span>
                  <span className="flex h-1 gap-[2px]" aria-hidden>
                    {m.gymColors.slice(0, 2).map((c, k) => (
                      <span
                        key={k}
                        className="h-1 w-3 rounded-full"
                        style={{ background: routineColor(c) }}
                      />
                    ))}
                    {m.runs > 0 && <span className="h-1 w-3 rounded-full bg-run" />}
                    {m.rest && m.workouts === 0 && m.runs === 0 && (
                      <span className="h-1 w-3 rounded-full bg-rest" />
                    )}
                  </span>
                  <span className="flex h-1.5 gap-[3px]" aria-hidden>
                    {m.cardio && <span className="size-1.5 rounded-full bg-cardio" />}
                    {m.allSupplements && <span className="size-1.5 rounded-full bg-success" />}
                    {m.nutritionGood && <span className="size-1.5 rounded-full bg-warm" />}
                  </span>
                </button>
              )
            })}
          </div>
        ))}
      </motion.div>
    </div>
  )
}

/** Leyenda del calendario. */
export function CalendarLegend() {
  const items = [
    {
      el: <span className="h-1 w-4 rounded-full bg-accent" />,
      label: 'Gimnasio (color de la rutina)',
    },
    { el: <span className="h-1 w-4 rounded-full bg-run" />, label: 'Running' },
    { el: <span className="h-1 w-4 rounded-full bg-rest" />, label: 'Descanso' },
    { el: <span className="size-1.5 rounded-full bg-cardio" />, label: 'Cardio' },
    { el: <span className="size-1.5 rounded-full bg-success" />, label: 'Suplementos completos' },
    { el: <span className="size-1.5 rounded-full bg-warm" />, label: 'Alimentación bien' },
  ]
  return (
    <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 px-2">
      {items.map((it) => (
        <li key={it.label} className="flex items-center gap-2 text-footnote text-ink-2">
          <span className="flex w-4 justify-center" aria-hidden>
            {it.el}
          </span>
          {it.label}
        </li>
      ))}
    </ul>
  )
}
