import { useState } from 'react'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Chip, Group, Row, Switch, TextArea, TextInput } from '@/components/ui/Form'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { Select } from '@/components/ui/Select'
import {
  changeExerciseUnit,
  createExercise,
  exerciseHasHistory,
  updateExercise,
  type ExerciseInput,
} from '@/db/library'
import {
  EQUIPMENT,
  MUSCLES,
  type Equipment,
  type Exercise,
  type ExerciseMetric,
  type Muscle,
} from '@/db/schema'
import { useSettings } from '@/db/settings'
import type { WeightUnit } from '@/domain/units'
import { confirm, toast } from '@/stores/ui'

interface Props {
  open: boolean
  onClose: () => void
  /** Si se pasa, edita; si no, crea. */
  exercise?: Exercise
  onCreated?: (id: string) => void
  initialName?: string
}

const FORM_ID = 'exercise-form'

/** Hoja para crear o editar un ejercicio. El formulario se reinicia cada vez que se abre. */
export function ExerciseFormSheet({ open, onClose, exercise, onCreated, initialName }: Props) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={exercise ? 'Editar ejercicio' : 'Nuevo ejercicio'}
      tall
      action={
        <button
          type="submit"
          form={FORM_ID}
          className="min-h-touch px-3 text-body font-semibold text-accent-ink"
        >
          {exercise ? 'Guardar' : 'Crear'}
        </button>
      }
    >
      <ExerciseForm
        exercise={exercise}
        onClose={onClose}
        onCreated={onCreated}
        initialName={initialName}
      />
    </BottomSheet>
  )
}

function ExerciseForm({ onClose, exercise, onCreated, initialName }: Omit<Props, 'open'>) {
  const settings = useSettings()
  const [name, setName] = useState(exercise?.name ?? initialName ?? '')
  const [primary, setPrimary] = useState<Muscle>(exercise?.primaryMuscle ?? 'Pecho')
  const [secondary, setSecondary] = useState<Muscle[]>(exercise?.secondaryMuscles ?? [])
  const [equipment, setEquipment] = useState<Equipment>(exercise?.equipment ?? 'Barra')
  const [unilateral, setUnilateral] = useState(exercise?.unilateral ?? false)
  const [metric, setMetric] = useState<ExerciseMetric>(exercise?.metric ?? 'reps')
  const [optionalLoad, setOptionalLoad] = useState(exercise?.optionalLoad ?? false)
  // null = sin elegir: se usa la del ejercicio o la unidad por defecto de Ajustes (que puede cargar después)
  const [chosenUnit, setUnit] = useState<WeightUnit | null>(null)
  const unit: WeightUnit = chosenUnit ?? exercise?.unit ?? settings?.defaultUnit ?? 'kg'
  const [fixedNotes, setFixedNotes] = useState(exercise?.fixedNotes ?? '')
  const [rest, setRest] = useState(exercise?.restSeconds ? String(exercise.restSeconds) : '')

  const toggleSecondary = (m: Muscle) =>
    setSecondary((s) => (s.includes(m) ? s.filter((x) => x !== m) : [...s, m]))

  const save = async () => {
    if (!name.trim()) return
    const restSeconds = rest ? Math.max(0, Math.round(Number(rest))) || undefined : undefined
    const data: Omit<ExerciseInput, 'unit'> = {
      name: name.trim(),
      primaryMuscle: primary,
      secondaryMuscles: secondary.filter((m) => m !== primary),
      equipment,
      unilateral,
      fixedNotes: fixedNotes.trim(),
      restSeconds,
      metric: metric === 'segundos' ? 'segundos' : undefined,
      optionalLoad: optionalLoad || undefined,
    }
    if (exercise) {
      await updateExercise(exercise.id, data)
      if (unit !== exercise.unit) {
        let convert = false
        if (await exerciseHasHistory(exercise.id)) {
          convert = await confirm({
            title: `¿Convertir los registros a ${unit}?`,
            text: '“Convertir” recalcula los pesos ya guardados. “Solo etiqueta” deja los números como están y cambia la unidad.',
            confirmLabel: 'Convertir',
            cancelLabel: 'Solo etiqueta',
          })
        }
        await changeExerciseUnit(exercise.id, unit, convert)
      }
      toast('Ejercicio guardado')
    } else {
      const id = await createExercise({ ...data, unit })
      if (onCreated) onCreated(id)
      else toast('Ejercicio creado')
    }
    onClose()
  }

  return (
    <form
      id={FORM_ID}
      onSubmit={(e) => {
        e.preventDefault()
        void save()
      }}
      className="space-y-6 pt-2"
    >
      <Group>
        <TextInput
          aria-label="Nombre del ejercicio"
          required
          placeholder="Nombre (p. ej. Press banca)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          enterKeyHint="done"
          maxLength={60}
        />
      </Group>

      <Group>
        <Row label="Músculo principal" htmlFor="ex-primary">
          <Select
            id="ex-primary"
            value={primary}
            onChange={(e) => setPrimary(e.target.value as Muscle)}
          >
            {MUSCLES.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </Select>
        </Row>
        <Row label="Material" htmlFor="ex-equipment">
          <Select
            id="ex-equipment"
            value={equipment}
            onChange={(e) => setEquipment(e.target.value as Equipment)}
          >
            {EQUIPMENT.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </Select>
        </Row>
        <Row label="Unilateral">
          <Switch label="Unilateral" checked={unilateral} onChange={setUnilateral} />
        </Row>
        <Row label="Peso opcional">
          <Switch label="Peso opcional" checked={optionalLoad} onChange={setOptionalLoad} />
        </Row>
        <div className="px-4 py-2.5">
          <SegmentedControl
            label="Se mide en"
            value={metric}
            onChange={setMetric}
            options={[
              { value: 'reps', label: 'Repeticiones' },
              { value: 'segundos', label: 'Segundos' },
            ]}
          />
        </div>
        <div className="px-4 py-2.5">
          <SegmentedControl
            label="Unidad"
            value={unit}
            onChange={setUnit}
            options={[
              { value: 'kg', label: 'Kilos (kg)' },
              { value: 'lb', label: 'Libras (lb)' },
            ]}
          />
        </div>
      </Group>

      <section>
        <h3 className="mb-2 px-4 text-footnote font-medium text-ink-2">Músculos secundarios</h3>
        <div className="flex flex-wrap gap-2 px-1">
          {MUSCLES.filter((m) => m !== primary).map((m) => (
            <Chip key={m} selected={secondary.includes(m)} onClick={() => toggleSecondary(m)}>
              {m}
            </Chip>
          ))}
        </div>
      </section>

      <Group
        title="Notas fijas"
        footer={
          equipment === 'Mancuernas'
            ? 'En mancuernas se apunta el peso total de las dos.'
            : 'Ajustes que se repiten siempre: asiento, agarre, posición…'
        }
      >
        <TextArea
          aria-label="Notas fijas"
          placeholder="Asiento en el 4, agarre prono…"
          value={fixedNotes}
          onChange={(e) => setFixedNotes(e.target.value)}
          maxLength={300}
        />
      </Group>

      {settings?.restTimer.visible && (
        <Group footer={`Vacío = el de Ajustes (${settings.restTimer.seconds} s).`}>
          <Row label="Descanso propio (s)" htmlFor="ex-rest">
            <input
              id="ex-rest"
              inputMode="numeric"
              pattern="[0-9]*"
              value={rest}
              onChange={(e) => setRest(e.target.value.replace(/\D/g, ''))}
              placeholder={String(settings.restTimer.seconds)}
              className="tnum w-20 bg-transparent text-right outline-none"
            />
          </Row>
        </Group>
      )}
    </form>
  )
}
