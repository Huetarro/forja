import { Footprints } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'

export default function RunningPage() {
  return (
    <>
      <PageHeader title="Running" />
      <EmptyState
        icon={Footprints}
        title="Registra tu primera carrera"
        text="Apunta distancia y tiempo, y Forja calcula tu ritmo y tus kilómetros de cada semana."
      />
    </>
  )
}
