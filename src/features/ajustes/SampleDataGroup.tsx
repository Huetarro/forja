import { useLiveQuery } from 'dexie-react-hooks'
import { FlaskConical, Trash2 } from 'lucide-react'
import { Group } from '@/components/ui/Form'
import { clearSampleData, hasSampleData, loadSampleData } from '@/db/sample'
import { confirm, toast } from '@/stores/ui'

/** Cargar y borrar datos de ejemplo para probar las gráficas. */
export function SampleDataGroup() {
  const has = useLiveQuery(hasSampleData)
  return (
    <Group
      title="Datos de ejemplo"
      footer="12 semanas de entrenos, carreras y registro diario para ver cómo quedan las estadísticas. Se borran sin tocar tus datos."
    >
      {has ? (
        <button
          type="button"
          onClick={async () => {
            const ok = await confirm({
              title: '¿Borrar los datos de ejemplo?',
              text: 'Tus datos reales no se tocan.',
              confirmLabel: 'Borrar',
              destructive: true,
            })
            if (!ok) return
            await clearSampleData()
            toast('Datos de ejemplo borrados')
          }}
          className="flex min-h-12 w-full items-center gap-3 px-4 text-body text-danger"
        >
          <Trash2 size={20} /> Borrar datos de ejemplo
        </button>
      ) : (
        <button
          type="button"
          onClick={async () => {
            await loadSampleData()
            toast('Datos de ejemplo cargados')
          }}
          className="flex min-h-12 w-full items-center gap-3 px-4 text-body text-accent-ink"
        >
          <FlaskConical size={20} /> Cargar datos de ejemplo
        </button>
      )}
    </Group>
  )
}
