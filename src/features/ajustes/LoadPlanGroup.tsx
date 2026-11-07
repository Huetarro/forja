import { useState } from 'react'
import { ListPlus } from 'lucide-react'
import { Group } from '@/components/ui/Form'
import { loadPlanV2 } from '@/db/planV2'
import { useSettings } from '@/db/settings'
import { confirm, toast } from '@/stores/ui'

/** "Cargar plan semanal" para instalaciones nuevas (en el iPhone de Dani se carga solo). */
export function LoadPlanGroup() {
  const settings = useSettings()
  const [busy, setBusy] = useState(false)
  if (!settings || settings.planV2LoadedAt) return null

  const load = async () => {
    const ok = await confirm({
      title: '¿Cargar el plan semanal?',
      text: 'Se crean las rutinas Empuje, Tirón, Pierna, Torso completo y Core + estiramientos, reutilizando los ejercicios que ya tengas. Tus rutinas actuales se archivan (no se borran).',
      confirmLabel: 'Cargar plan',
    })
    if (!ok) return
    setBusy(true)
    try {
      const r = await loadPlanV2()
      toast(r.loaded ? 'Plan semanal cargado' : 'El plan ya estaba cargado')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Group footer="Plan de 5 días de gimnasio, 2 de carrera y estiramientos del domingo.">
      <button
        type="button"
        onClick={() => void load()}
        disabled={busy}
        className="flex min-h-12 w-full items-center gap-3 px-4 text-body text-accent-ink active:bg-fill disabled:opacity-50"
      >
        <ListPlus size={20} /> Cargar plan semanal
      </button>
    </Group>
  )
}
