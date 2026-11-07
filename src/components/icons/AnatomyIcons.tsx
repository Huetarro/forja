/**
 * Iconos anatómicos propios de las rutinas (24×24, trazo con currentColor, sin relleno).
 * Mismo lenguaje que lucide: trazo redondeado y formas simples para leerse a 20-24 px.
 */
import type { ReactNode, SVGProps } from 'react'

export interface AnatomyIconProps extends Omit<SVGProps<SVGSVGElement>, 'ref'> {
  size?: number | string
  strokeWidth?: number | string
}

function Svg({
  size = 24,
  strokeWidth = 2,
  children,
  ...rest
}: AnatomyIconProps & { children: ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="1 1 22 22"
      fill="none"
      stroke="currentColor"
      // Algo más fino y más grande que lucide: estos iconos tienen más detalle
      strokeWidth={Number(strokeWidth) * 0.92}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...rest}
    >
      {children}
    </svg>
  )
}

/** Empuje: tronco superior con hombros y los pectorales marcados. */
export function ChestIcon(props: AnatomyIconProps) {
  return (
    <Svg {...props}>
      <path d="M9 3.5c1.6 1.4 4.4 1.4 6 0" />
      <path d="M9 3.5c-2.5.4-5 1-6 3-.6 1.5-.4 3.5 0 5.5" />
      <path d="M15 3.5c2.5.4 5 1 6 3 .6 1.5.4 3.5 0 5.5" />
      <path d="M6 9c.2 4 .8 8 1.6 12M18 9c-.2 4-.8 8-1.6 12" />
      <path d="M6 9.5c.6 3.6 4 4.6 6 2.4 2 2.2 5.4 1.2 6-2.4" />
      <path d="M12 7.5v4.4" />
    </Svg>
  )
}

/** Tirón: espalda en V con trapecio, dorsales y columna. */
export function BackIcon(props: AnatomyIconProps) {
  return (
    <Svg {...props}>
      <path d="M10 3c-1 1.5-3.5 2-5.5 2.8C3 6.4 2.8 8.3 3.4 10" />
      <path d="M14 3c1 1.5 3.5 2 5.5 2.8 1.5.6 1.7 2.5 1.1 4.2" />
      <path d="M5.8 8.5c.9 3.6 2.4 6.5 3 12h6.4c.6-5.5 2.1-8.4 3-12" />
      <path d="M12 6.5V19" />
    </Svg>
  )
}

/** Pierna: de perfil, con el cuádriceps marcado, rodilla, gemelo y pie. */
export function LegIcon(props: AnatomyIconProps) {
  return (
    <Svg {...props}>
      <path d="M9.5 2.5c2.8 2.7 3.7 6.7 2.7 10.1-.4 1.4-.3 2.6 0 3.8.4 1.6.1 3-.2 4 2 .2 4.2.4 5.5 1H8" />
      <path d="M5.5 2.5c-.5 4 .1 7.5 1.7 10.3.6 1.2.2 2.2-.6 3.6-.8 1.6-.2 3.6 1.4 5.2" />
      <path d="M9.6 6c.8 2.4.9 4.4.3 6.2" />
    </Svg>
  )
}

/** Torso completo: busto con cabeza, hombros, pecho y abdomen. */
export function TorsoIcon(props: AnatomyIconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="4.5" r="2.2" />
      <path d="M7 9.2c-.4 3.8 0 7.8.8 11.8h8.4c.8-4 1.2-8 .8-11.8-2-.6-8-.6-10 0Z" />
      <path d="M7 9.2c-1.8.4-2.8 1.6-3 3.6V17" />
      <path d="M17 9.2c1.8.4 2.8 1.6 3 3.6V17" />
      <path d="M8.6 12.2c1.4 1 2.8.9 3.4 0 .6.9 2 1 3.4 0" />
      <path d="M12 12.2V18" />
    </Svg>
  )
}

/** Core: abdomen marcado (seis bloques) y oblicuos. */
export function AbsIcon(props: AnatomyIconProps) {
  return (
    <Svg {...props}>
      <path d="M4 3.5c-.5 6.4.5 12.4 3.2 17.5" />
      <path d="M20 3.5c.5 6.4-.5 12.4-3.2 17.5" />
      <rect x="6.5" y="3" width="4.6" height="4.8" rx="1.8" />
      <rect x="12.9" y="3" width="4.6" height="4.8" rx="1.8" />
      <rect x="6.5" y="9.6" width="4.6" height="4.8" rx="1.8" />
      <rect x="12.9" y="9.6" width="4.6" height="4.8" rx="1.8" />
      <rect x="7" y="16.2" width="4.1" height="4.8" rx="1.8" />
      <rect x="12.9" y="16.2" width="4.1" height="4.8" rx="1.8" />
    </Svg>
  )
}
