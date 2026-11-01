import type { Exercise } from '@/db/schema'

/** Texto secundario de un ejercicio: "Pecho · Barra · lb · Unilateral" */
export function exerciseMeta(e: Exercise): string {
  return [
    e.primaryMuscle,
    e.equipment,
    e.unit === 'lb' ? 'lb' : null,
    e.unilateral ? 'Unilateral' : null,
  ]
    .filter(Boolean)
    .join(' · ')
}
