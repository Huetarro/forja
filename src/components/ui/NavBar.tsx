import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

interface Props {
  title?: string
  backLabel?: string
  action?: ReactNode
}

/** Barra superior de pantallas secundarias: "‹ Atrás", título y acción. */
export function NavBar({ title, backLabel = 'Atrás', action }: Props) {
  const navigate = useNavigate()
  const goBack = () => {
    // Si se entró directamente (sin historial), vuelve a Inicio
    if (window.history.state && (window.history.state as { idx?: number }).idx) navigate(-1)
    else navigate('/')
  }
  return (
    <div className="sticky top-0 z-20 -mx-4 grid grid-cols-[1fr_auto_1fr] items-center bg-bg/90 px-1 pt-1 backdrop-blur-xl">
      <button
        type="button"
        onClick={goBack}
        className="flex min-h-touch items-center justify-self-start pr-2 text-body text-accent-ink"
      >
        <ChevronLeft size={26} strokeWidth={2.2} aria-hidden className="-mr-0.5" />
        {backLabel}
      </button>
      <span className="max-w-[45vw] truncate text-body font-semibold">{title}</span>
      <div className="flex justify-self-end">{action}</div>
    </div>
  )
}

/** Botón de texto o icono para la barra superior. */
export function NavButton({
  onClick,
  children,
  label,
}: {
  onClick: () => void
  children: ReactNode
  label?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid min-h-touch min-w-touch place-items-center px-3 text-body font-semibold text-accent-ink"
    >
      {children}
    </button>
  )
}
