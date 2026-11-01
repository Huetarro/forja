import {
  Activity,
  Anvil,
  BicepsFlexed,
  Crown,
  Dumbbell,
  Flame,
  Hammer,
  HeartPulse,
  Medal,
  Mountain,
  Rocket,
  Shield,
  Swords,
  Target,
  Trophy,
  Weight,
  Zap,
  type LucideIcon,
} from 'lucide-react'

/** 10 colores de rutina (definidos en tokens.css como --routine-N). */
export const ROUTINE_COLOR_COUNT = 10

export function routineColor(index: number): string {
  const i = ((Math.max(1, index) - 1) % ROUTINE_COLOR_COUNT) + 1
  return `var(--routine-${i})`
}

export const ROUTINE_ICONS: Record<string, LucideIcon> = {
  dumbbell: Dumbbell,
  biceps: BicepsFlexed,
  weight: Weight,
  flame: Flame,
  zap: Zap,
  anvil: Anvil,
  hammer: Hammer,
  mountain: Mountain,
  target: Target,
  activity: Activity,
  heart: HeartPulse,
  trophy: Trophy,
  medal: Medal,
  crown: Crown,
  swords: Swords,
  shield: Shield,
  rocket: Rocket,
}

export function routineIcon(name: string): LucideIcon {
  return ROUTINE_ICONS[name] ?? Dumbbell
}

export const ROUTINE_ICON_LABEL: Record<string, string> = {
  dumbbell: 'Mancuerna',
  biceps: 'Bíceps',
  weight: 'Pesa',
  flame: 'Llama',
  zap: 'Rayo',
  anvil: 'Yunque',
  hammer: 'Martillo',
  mountain: 'Montaña',
  target: 'Diana',
  activity: 'Pulso',
  heart: 'Corazón',
  trophy: 'Trofeo',
  medal: 'Medalla',
  crown: 'Corona',
  swords: 'Espadas',
  shield: 'Escudo',
  rocket: 'Cohete',
}
