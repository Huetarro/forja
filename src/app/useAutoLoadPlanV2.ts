import { useEffect } from 'react'
import { loadPlanV2 } from '@/db/planV2'
import type { Settings } from '@/db/schema'
import { toast } from '@/stores/ui'

let started = false

/**
 * Carga de un solo uso del plan semanal al abrir la v2 en un móvil que ya tenía datos de
 * la v1. Es idempotente (se marca en Settings), así que repetirla no inserta nada.
 */
export function useAutoLoadPlanV2(settings: Settings | undefined): void {
  const pending = !!settings?.onboarded && !!settings.planV2Pending && !settings.planV2LoadedAt
  useEffect(() => {
    if (!pending || started) return
    started = true
    void loadPlanV2()
      .then((r) => {
        if (r.loaded) toast('Tu plan semanal ya está en la app')
      })
      .catch(() => toast('No se pudo cargar el plan semanal. Se intentará de nuevo.'))
      .finally(() => {
        started = false
      })
  }, [pending])
}
