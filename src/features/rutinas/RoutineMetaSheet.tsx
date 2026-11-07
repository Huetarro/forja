import { useState } from 'react'
import { Check } from 'lucide-react'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Group, Row, TextArea, TextInput } from '@/components/ui/Form'
import { Select } from '@/components/ui/Select'
import { createRoutine, updateRoutine, usePrograms } from '@/db/routines'
import type { Routine } from '@/db/schema'
import { cn } from '@/lib/cn'
import {
  ROUTINE_COLOR_COUNT,
  ROUTINE_ICON_LABEL,
  ROUTINE_ICONS,
  routineColor,
} from '@/lib/routineStyle'
import { toast } from '@/stores/ui'

interface Props {
  open: boolean
  onClose: () => void
  routine?: Routine
  onCreated?: (id: string) => void
  defaultProgramId?: string
}

const FORM_ID = 'routine-meta-form'

/** Crear o editar nombre, programa, color, icono y notas de una rutina. */
export function RoutineMetaSheet({ open, onClose, routine, onCreated, defaultProgramId }: Props) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={routine ? 'Editar rutina' : 'Nueva rutina'}
      tall
      action={
        <button
          type="submit"
          form={FORM_ID}
          className="min-h-touch px-3 text-body font-semibold text-accent-ink"
        >
          {routine ? 'Guardar' : 'Crear'}
        </button>
      }
    >
      <RoutineMetaForm
        routine={routine}
        onClose={onClose}
        onCreated={onCreated}
        defaultProgramId={defaultProgramId}
      />
    </BottomSheet>
  )
}

function RoutineMetaForm({ routine, onClose, onCreated, defaultProgramId }: Omit<Props, 'open'>) {
  const programs = usePrograms()
  const [name, setName] = useState(routine?.name ?? '')
  const [programId, setProgramId] = useState(routine?.programId ?? defaultProgramId ?? '')
  const [color, setColor] = useState(routine?.color ?? 1)
  const [icon, setIcon] = useState(routine?.icon ?? 'dumbbell')
  const [notes, setNotes] = useState(routine?.notes ?? '')

  const save = async () => {
    if (!name.trim()) return
    const data = {
      name: name.trim(),
      programId: programId || undefined,
      color,
      icon,
      notes: notes.trim(),
    }
    if (routine) {
      await updateRoutine(routine.id, data)
      toast('Rutina guardada')
    } else {
      const id = await createRoutine(data)
      onCreated?.(id)
    }
    onClose()
  }

  return (
    <form
      id={FORM_ID}
      className="space-y-6 pt-2"
      onSubmit={(e) => {
        e.preventDefault()
        void save()
      }}
    >
      <Group>
        <TextInput
          aria-label="Nombre de la rutina"
          required
          placeholder="Nombre (p. ej. Torso A)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          enterKeyHint="done"
          maxLength={40}
        />
        <Row label="Programa" htmlFor="routine-program">
          <Select
            id="routine-program"
            value={programId}
            onChange={(e) => setProgramId(e.target.value)}
          >
            <option value="">Sin programa</option>
            {programs?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </Row>
      </Group>

      <section>
        <h3 className="mb-2 px-4 text-footnote font-medium text-ink-2">Color</h3>
        <div
          className="grid grid-cols-5 gap-3 rounded-card bg-card p-4"
          role="radiogroup"
          aria-label="Color"
        >
          {Array.from({ length: ROUTINE_COLOR_COUNT }, (_, i) => i + 1).map((c) => (
            <button
              type="button"
              key={c}
              role="radio"
              aria-checked={color === c}
              aria-label={`Color ${c}`}
              onClick={() => setColor(c)}
              className={cn(
                'grid aspect-square place-items-center rounded-full text-white transition-transform',
                color === c && 'scale-110 ring-2 ring-ink ring-offset-2 ring-offset-card',
              )}
              style={{ background: routineColor(c) }}
            >
              {color === c && <Check size={18} strokeWidth={3} />}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-2 px-4 text-footnote font-medium text-ink-2">Icono</h3>
        <div
          className="grid grid-cols-6 gap-2 rounded-card bg-card p-3"
          role="radiogroup"
          aria-label="Icono"
        >
          {Object.entries(ROUTINE_ICONS).map(([key, Icon]) => (
            <button
              type="button"
              key={key}
              role="radio"
              aria-checked={icon === key}
              aria-label={ROUTINE_ICON_LABEL[key] ?? key}
              onClick={() => setIcon(key)}
              className={cn(
                'grid aspect-square place-items-center rounded-md transition-colors',
                icon === key ? 'text-white' : 'bg-fill text-ink-2',
              )}
              style={icon === key ? { background: routineColor(color) } : undefined}
            >
              <Icon size={22} />
            </button>
          ))}
        </div>
      </section>

      <Group title="Notas">
        <TextArea
          aria-label="Notas de la rutina"
          placeholder="Objetivo, calentamiento, recordatorios…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={500}
        />
      </Group>
    </form>
  )
}
