import { Group, Row, Switch } from '@/components/ui/Form'
import type { Workout } from '@/db/schema'
import { patchCardio, updateWorkout, useLastCardio } from '@/db/workouts'
import {
  cleanIncline,
  cleanMinutes,
  EMPTY_CARDIO,
  MAX_INCLINE,
  resolveCardio,
} from '@/domain/cardio'
import { NumberField } from './NumberField'

interface Props {
  workout: Workout
  /** 'live': los campos sin tocar se aceptan al terminar; 'edit': entreno ya cerrado */
  mode: 'live' | 'edit'
}

/** Cardio al final del entreno: interruptor, tiempo e inclinación. */
export function CardioBlock({ workout, mode }: Props) {
  const last = useLastCardio(workout)
  const cardio = workout.cardio

  const toggle = (on: boolean) => {
    if (!on) {
      void updateWorkout(workout.id, { cardio: undefined })
      return
    }
    // En un entreno ya cerrado no hay un "Terminar" que acepte los valores anteriores
    const initial = mode === 'edit' ? resolveCardio(EMPTY_CARDIO, last) : EMPTY_CARDIO
    void updateWorkout(workout.id, { cardio: initial })
  }

  return (
    <Group title="Cardio">
      <Row label="He hecho cardio">
        <Switch label="He hecho cardio" checked={cardio !== undefined} onChange={toggle} />
      </Row>
      {cardio && (
        <>
          <Row label="Tiempo">
            <span className="flex w-24 items-center gap-1.5 text-ink-2">
              <NumberField
                label="Tiempo de cardio en minutos"
                value={cardio.minutes}
                placeholder={last?.minutes ?? null}
                onCommit={(v) => void patchCardio(workout.id, { minutes: cleanMinutes(v) })}
              />
              min
            </span>
          </Row>
          <Row label="Inclinación">
            <span className="flex w-24 items-center gap-1.5 text-ink-2">
              <NumberField
                decimal
                max={MAX_INCLINE}
                label="Inclinación del cardio en porcentaje"
                value={cardio.incline}
                placeholder={last?.incline ?? null}
                onCommit={(v) => void patchCardio(workout.id, { incline: cleanIncline(v) })}
              />
              %
            </span>
          </Row>
        </>
      )}
    </Group>
  )
}
