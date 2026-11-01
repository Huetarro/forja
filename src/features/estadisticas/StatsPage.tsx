import { BarChart3 } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'

export default function StatsPage() {
  return (
    <>
      <PageHeader title="Estadísticas" />
      <EmptyState
        icon={BarChart3}
        title="Aún no hay datos"
        text="Termina tu primer entreno para ver tu progreso, tus récords y el trabajo de cada músculo."
      />
    </>
  )
}
