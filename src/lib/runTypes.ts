import type { RunType } from '@/db/schema'

export const RUN_TYPES: Array<{ value: RunType; label: string }> = [
  { value: 'rodaje', label: 'Rodaje' },
  { value: 'series', label: 'Series' },
  { value: 'tirada_larga', label: 'Tirada larga' },
  { value: 'competicion', label: 'Competición' },
  { value: 'otro', label: 'Otro' },
]
