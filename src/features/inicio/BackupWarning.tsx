import { Link } from 'react-router-dom'
import { ChevronRight, ShieldAlert } from 'lucide-react'
import { useHasData } from '@/db/days'
import { useSettings } from '@/db/settings'
import { useNow } from '@/lib/useNow'

const DAYS_14 = 14 * 24 * 3600 * 1000

/** Aviso discreto si la última copia tiene más de 14 días (o no hay ninguna). */
export function BackupWarning() {
  const settings = useSettings()
  const hasData = useHasData()
  const now = useNow(60_000)
  if (!settings || !hasData) return null
  const last = settings.lastBackupAt
  if (last && now - last < DAYS_14) return null
  const days = last ? Math.floor((now - last) / 86_400_000) : null
  return (
    <Link
      to="/ajustes#copia"
      className="flex items-center gap-3 rounded-card bg-card px-4 py-3 active:bg-fill"
    >
      <ShieldAlert size={20} className="shrink-0 text-ink-2" aria-hidden />
      <span className="flex-1 text-subhead">
        {days === null
          ? 'Aún no has hecho ninguna copia de seguridad.'
          : `Tu última copia es de hace ${days} días.`}{' '}
        <span className="font-semibold text-accent-ink">Hacer copia</span>
      </span>
      <ChevronRight size={18} className="text-ink-2" aria-hidden />
    </Link>
  )
}
