import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { parseLocalDate } from '@/domain/dates'

/** Estilo común de ejes y rejilla de las gráficas (recesivos). */
export const AXIS_TICK = { fill: 'var(--ink-2)', fontSize: 12, fontVariantNumeric: 'tabular-nums' }
export const GRID_STROKE = 'var(--line)'

/** Colores de serie (validados en claro y oscuro con la skill dataviz). */
export const GYM = 'var(--chart-gym)'
export const RUN = 'var(--chart-run)'

export const fmtDay = (d: string) => format(parseLocalDate(d), 'd MMM', { locale: es })
