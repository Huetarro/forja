import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { parseLocalDate } from '@/domain/dates'

/** Estilo común de ejes y rejilla de las gráficas (recesivos). */
export const AXIS_TICK = { fill: 'var(--c-ink-3)', fontSize: 11 }
export const GRID_STROKE = 'var(--c-sep)'

/** Colores de serie (validados en claro y oscuro con la skill dataviz). */
export const GYM = 'var(--c-chart-gym)'
export const RUN = 'var(--c-chart-run)'

export const fmtDay = (d: string) => format(parseLocalDate(d), 'd MMM', { locale: es })
