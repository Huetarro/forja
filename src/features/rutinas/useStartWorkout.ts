import { toast } from '@/stores/ui'

/** Empieza un entreno a partir de una rutina. (El entreno en curso llega en la fase 3.) */
export function useStartWorkout(): (routineId: string) => Promise<void> {
  return async () => {
    toast('El entreno en curso llega en la próxima versión')
  }
}
