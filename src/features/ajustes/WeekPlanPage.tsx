import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Group } from '@/components/ui/Form'
import { NavBar } from '@/components/ui/NavBar'
import { PageHeader } from '@/components/ui/PageHeader'
import { Select } from '@/components/ui/Select'
import { DEFAULT_STRETCHES, setDayPlan, setStretchList, STRETCH_SECONDS } from '@/db/plan'
import { useRoutines } from '@/db/routines'
import type { DayPlan, Routine, RunType, Weekday } from '@/db/schema'
import { updateSettings, useSettings } from '@/db/settings'
import { WEEKDAY_LABEL, WEEKDAYS } from '@/domain/weekPlan'
import { RUN_TYPES } from '@/lib/runTypes'

const RUN_DEFAULT_LABEL: Partial<Record<RunType, string>> = {
  rodaje: 'Carrera zona 2 · 30-40 min',
  tirada_larga: 'Tirada larga zona 2 · 45-60 min',
}

/** Valor del selector: '' sin plan · 'descanso' · 'r:<id>' rutina · 'c:<tipo>' carrera. */
function encode(p: DayPlan | undefined): string {
  if (!p) return ''
  if (p.kind === 'descanso') return 'descanso'
  if (p.kind === 'rutina') return `r:${p.routineId}`
  return `c:${p.runType}`
}

function decode(v: string, prev: DayPlan | undefined): DayPlan | null {
  if (!v) return null
  if (v === 'descanso') return { kind: 'descanso' }
  if (v.startsWith('r:')) return { kind: 'rutina', routineId: v.slice(2) }
  const runType = v.slice(2) as RunType
  const label =
    prev?.kind === 'carrera' && prev.runType === runType
      ? prev.label
      : (RUN_DEFAULT_LABEL[runType] ??
        RUN_TYPES.find((t) => t.value === runType)?.label ??
        'Carrera')
  return { kind: 'carrera', runType, label }
}

/** Ajustes → Plan semanal: qué toca cada día y la lista de estiramientos. */
export default function WeekPlanPage() {
  const settings = useSettings()
  const routines = useRoutines()
  if (!settings || !routines) return <NavBar title="Plan semanal" />
  const plan = settings.weekPlan ?? {}

  return (
    <>
      <NavBar backLabel="Ajustes" />
      <PageHeader title="Plan semanal" />
      <div className="space-y-6">
        <Group footer="“Te toca hoy” en Inicio usa el día de la semana.">
          {WEEKDAYS.map((d) => (
            <DayRow key={d} day={d} plan={plan[d]} routines={routines} />
          ))}
        </Group>

        <StretchesEditor list={settings.stretchList ?? DEFAULT_STRETCHES} />
      </div>
    </>
  )
}

function DayRow({
  day,
  plan,
  routines,
}: {
  day: Weekday
  plan: DayPlan | undefined
  routines: Routine[]
}) {
  const missing = plan?.kind === 'rutina' && !routines.some((r) => r.id === plan.routineId)
  return (
    <div className="px-4 py-1.5">
      <div className="flex min-h-11 items-center justify-between gap-3">
        <span className="text-body">{WEEKDAY_LABEL[day]}</span>
        <Select
          aria-label={`Plan del ${WEEKDAY_LABEL[day].toLowerCase()}`}
          value={missing ? '' : encode(plan)}
          onChange={(e) => void setDayPlan(day, decode(e.target.value, plan))}
        >
          <option value="">Sin plan</option>
          <option value="descanso">Descanso</option>
          <optgroup label="Rutinas">
            {routines.map((r) => (
              <option key={r.id} value={`r:${r.id}`}>
                {r.name}
              </option>
            ))}
          </optgroup>
          <optgroup label="Carrera">
            {RUN_TYPES.map((t) => (
              <option key={t.value} value={`c:${t.value}`}>
                {t.label}
              </option>
            ))}
          </optgroup>
        </Select>
      </div>
      {plan?.kind === 'carrera' && (
        <input
          key={`${day}-${plan.runType}`}
          defaultValue={plan.label}
          aria-label={`Objetivo de la carrera del ${WEEKDAY_LABEL[day].toLowerCase()}`}
          maxLength={50}
          onBlur={(e) => {
            const label = e.target.value.trim()
            if (label && label !== plan.label) void setDayPlan(day, { ...plan, label })
          }}
          className="mb-1 h-10 w-full rounded-sm bg-fill px-3 text-subhead outline-none"
        />
      )}
    </div>
  )
}

function StretchesEditor({ list }: { list: string[] }) {
  const [draft, setDraft] = useState('')
  const add = () => {
    const v = draft.trim()
    if (!v) return
    void setStretchList([...list, v])
    setDraft('')
  }
  return (
    <Group
      title="Estiramientos"
      footer={`Aparecen al final de la rutina de core, con temporizador opcional de ${STRETCH_SECONDS} s. Al completarlos se marca “estiramientos” en el día.`}
    >
      {list.map((name, i) => (
        <div key={`${i}-${name}`} className="flex min-h-11 items-center gap-2 pr-1 pl-4">
          <input
            defaultValue={name}
            aria-label={`Estiramiento ${name}`}
            maxLength={40}
            onBlur={(e) => {
              const v = e.target.value.trim()
              if (v && v !== name) void setStretchList(list.map((x, k) => (k === i ? v : x)))
            }}
            className="min-h-11 flex-1 bg-transparent text-body outline-none"
          />
          <button
            type="button"
            onClick={() => void setStretchList(list.filter((_, k) => k !== i))}
            aria-label={`Quitar ${name}`}
            className="grid size-11 place-items-center text-ink-3 active:text-danger"
          >
            <X size={18} />
          </button>
        </div>
      ))}
      <form
        className="flex min-h-11 items-center gap-2 pr-1 pl-4"
        onSubmit={(e) => {
          e.preventDefault()
          add()
        }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Nuevo estiramiento"
          aria-label="Nuevo estiramiento"
          enterKeyHint="done"
          maxLength={40}
          className="min-h-11 flex-1 bg-transparent text-body outline-none placeholder:text-ink-3"
        />
        <button
          type="submit"
          aria-label="Añadir estiramiento"
          className="grid size-11 place-items-center text-accent-ink"
        >
          <Plus size={20} />
        </button>
      </form>
      {list.length === 0 && (
        <button
          type="button"
          onClick={() => void updateSettings({ stretchList: DEFAULT_STRETCHES })}
          className="min-h-11 w-full px-4 text-left text-body text-accent-ink"
        >
          Restaurar la lista por defecto
        </button>
      )}
    </Group>
  )
}
