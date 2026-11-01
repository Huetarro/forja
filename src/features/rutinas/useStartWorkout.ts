import { useNavigate } from 'react-router-dom'
import { db } from '@/db/db'
import { startWorkout } from '@/db/workouts'
import { confirm } from '@/stores/ui'

/** Empieza un entreno a partir de una rutina (o lleva al que ya está en curso). */
export function useStartWorkout(): (routineId: string) => Promise<void> {
  const navigate = useNavigate()
  return async (routineId) => {
    const active = await db.workouts.where('status').equals('en_curso').first()
    if (active) {
      const go = await confirm({
        title: 'Ya tienes un entreno en curso',
        text: `“${active.routineName}” sigue abierto. Termínalo o cancélalo antes de empezar otro.`,
        confirmLabel: 'Ir al entreno',
      })
      if (go) navigate('/entreno')
      return
    }
    await startWorkout(routineId)
    navigate('/entreno')
  }
}
