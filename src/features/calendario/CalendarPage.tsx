import { CalendarDays } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'

export default function CalendarPage() {
  return (
    <>
      <PageHeader title="Calendario" />
      <EmptyState
        icon={CalendarDays}
        title="Tu mes, de un vistazo"
        text="Aquí verás cada entreno, carrera y día de descanso, y podrás apuntar sueño, suplementos y peso."
      />
    </>
  )
}
