import { Dumbbell } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'
import { useSettings } from '@/db/settings'
import { capitalize, longDate, todayLocal } from '@/domain/dates'

export default function HomePage() {
  const settings = useSettings()
  const name = settings?.userName ?? ''
  return (
    <>
      <PageHeader subtitle={capitalize(longDate(todayLocal()))} title={`Hola, ${name}`} />
      <EmptyState
        icon={Dumbbell}
        title="Crea tu primera rutina"
        text="Monta tus rutinas con los ejercicios que haces y empieza a apuntar cada serie."
      />
    </>
  )
}
