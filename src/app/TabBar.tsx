import { NavLink } from 'react-router-dom'
import { BarChart3, CalendarDays, Footprints, House, Settings, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'

const TABS: Array<{ to: string; label: string; icon: LucideIcon }> = [
  { to: '/', label: 'Inicio', icon: House },
  { to: '/calendario', label: 'Calendario', icon: CalendarDays },
  { to: '/estadisticas', label: 'Estadísticas', icon: BarChart3 },
  { to: '/running', label: 'Running', icon: Footprints },
  { to: '/ajustes', label: 'Ajustes', icon: Settings },
]

export function TabBar() {
  return (
    <nav
      aria-label="Navegación principal"
      className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-sep bg-tabbar backdrop-blur-xl backdrop-saturate-150"
    >
      <ul className="mx-auto flex max-w-xl">
        {TABS.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex min-h-[50px] flex-col items-center justify-center gap-0.5 pt-1.5 text-[10px] font-medium tracking-tight transition-colors',
                  isActive ? 'text-accent-ink' : 'text-ink-3',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={24} strokeWidth={isActive ? 2.3 : 1.9} aria-hidden />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
