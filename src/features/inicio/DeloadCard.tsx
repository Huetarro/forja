import { BatteryLow } from 'lucide-react'
import { Switch } from '@/components/ui/Form'
import { setDeload, useLastDeloadDate } from '@/db/plan'
import { useSettings } from '@/db/settings'
import { todayLocal } from '@/domain/dates'
import { DELOAD_HIGHLIGHT_WEEKS, deloadText, weeksSinceDeload } from '@/domain/deload'
import { cn } from '@/lib/cn'

/** Semana de descarga: interruptor y "X semanas desde la última descarga" (sin avisos). */
export function DeloadCard() {
  const settings = useSettings()
  const last = useLastDeloadDate()
  if (!settings || last === undefined) return null
  const active = settings.deload?.active === true
  const weeks = weeksSinceDeload(last ?? undefined, settings.planStartDate, todayLocal())
  if (!active && weeks === null) return null
  const highlight = !active && weeks !== null && weeks >= DELOAD_HIGHLIGHT_WEEKS

  return (
    <section
      aria-label="Semana de descarga"
      className={cn(
        'flex items-center gap-3 rounded-card px-4 py-3',
        highlight ? 'bg-warm-soft' : 'bg-card',
      )}
    >
      <BatteryLow
        size={20}
        className={cn('shrink-0', highlight ? 'text-warm' : 'text-ink-2')}
        aria-hidden
      />
      <span className="min-w-0 flex-1">
        <span className="block text-subhead font-semibold">
          {active ? 'Semana de descarga activa' : 'Semana de descarga'}
        </span>
        <span className={cn('block text-footnote', highlight ? 'text-ink' : 'text-ink-2')}>
          {active
            ? 'Mitad de series y sin técnicas.'
            : weeks !== null
              ? deloadText(weeks, last !== null)
              : ''}
        </span>
      </span>
      <Switch label="Semana de descarga" checked={active} onChange={(v) => void setDeload(v)} />
    </section>
  )
}
