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
  strokeWidth = 1.8,
  children,
  ...rest
}: AnatomyIconProps & { children: ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
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
      <path d="M4 6c2.5-1.5 5-1.5 8 .5 3-2 5.5-2 8-.5" />
      <path d="M4 6c-1 3-.8 6 .6 7.6 2.2 2 5.6 1.6 7.4-1.1 1.8 2.7 5.2 3.1 7.4 1.1 1.4-1.6 1.6-4.6.6-7.6" />
      <path d="M12 6.5v6" />
      <path d="M8.5 18.5c2.3 1 4.7 1 7 0" />
    </Svg>
  )
}

/** Tirón: espalda en V con trapecio, dorsales y columna. */
export function BackIcon(props: AnatomyIconProps) {
  return (
    <Svg {...props}>
      <path d="M8 4c-1.5 1-3.5 1.5-5 2.5.5 3 2 5.5 4.5 7.5L9 21h6l1.5-7c2.5-2 4-4.5 4.5-7.5-1.5-1-3.5-1.5-5-2.5" />
      <path d="M8 4c1 1.2 2.4 2 4 2s3-.8 4-2" />
      <path d="M12 6v15" />
    </Svg>
  )
}

/** Pierna: de perfil, con el cuádriceps marcado, rodilla, gemelo y pie. */
export function LegIcon(props: AnatomyIconProps) {
  return (
    <Svg {...props}>
      <path d="M7.5 2c-.6 3.4-.4 6.6.8 9.6.6 1.6.4 3 0 4.6-.4 1.6-.3 3 .2 5.8h9c.4-1-.6-1.8-2-2.2l-2.8-.8c-.4-1.8-.2-3.6.4-5.4.8-2.4 1.6-4.6 1.6-7 0-1.8-.3-3.4-.8-4.6" />
      <path d="M10 12.5c1 .6 2 .6 3 0" />
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
