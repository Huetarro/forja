import { updateDayLog, useDayLog, useSupplements } from '@/db/days'
import { todayLocal } from '@/domain/dates'
import { Switch } from '@/components/ui/Form'
import { NutritionToggle, SupplementChips } from '@/features/calendario/DayFields'

/** Checks rápidos de hoy: suplementos, alimentación y estiramientos. */
export function TodayChecks() {
  const today = todayLocal()
  const log = useDayLog(today)
  const supplements = useSupplements()
  if (!log || !supplements) return <div className="h-[200px] rounded-card bg-card" />

  return (
    <section className="space-y-4 rounded-card bg-card p-4" aria-label="Hoy">
      <h2 className="text-body font-semibold">Hoy</h2>
      {supplements.length > 0 && (
        <div>
          <h3 className="mb-2 text-footnote text-ink-2">Suplementos</h3>
          <SupplementChips date={today} log={log} supplements={supplements} />
        </div>
      )}
      <div>
        <h3 className="mb-2 text-footnote text-ink-2">Alimentación</h3>
        <NutritionToggle date={today} log={log} />
      </div>
      <div className="flex items-center justify-between border-t border-sep pt-3">
        <span className="text-body">Estiramientos</span>
        <Switch
          label="Estiramientos"
          checked={log.stretching}
          onChange={(stretching) => void updateDayLog(today, { stretching })}
        />
      </div>
    </section>
  )
}
