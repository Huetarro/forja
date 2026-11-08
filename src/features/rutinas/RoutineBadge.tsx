import { createElement } from 'react'
import { routineColor, routineIcon } from '@/lib/routineStyle'

/** Cuadrado redondeado con el color y el icono de la rutina. */
export function RoutineBadge({
  color,
  icon,
  size = 44,
}: {
  color: number
  icon: string
  size?: number
}) {
  return (
    <span
      className="grid shrink-0 place-items-center text-white"
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        background: routineColor(color),
      }}
      aria-hidden
    >
      {createElement(routineIcon(icon), { size: size * 0.5 })}
    </span>
  )
}
