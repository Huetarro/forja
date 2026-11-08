import type { Muscle } from '@/db/schema'
import { muscleLevel } from '@/domain/stats'

/** Figura del cuerpo de frente y de espalda (SVG propio). Cada músculo se colorea según sus series. */

type Shape =
  | { kind: 'ellipse'; cx: number; cy: number; rx: number; ry: number; rot?: number }
  | { kind: 'path'; d: string }
  | { kind: 'rect'; x: number; y: number; w: number; h: number; r: number }

/** Duplica una forma al lado contrario (eje x = 60). */
function mirror(s: Shape): Shape {
  if (s.kind === 'ellipse') return { ...s, cx: 120 - s.cx, rot: s.rot ? -s.rot : undefined }
  if (s.kind === 'rect') return { ...s, x: 120 - s.x - s.w }
  return {
    kind: 'path',
    d: s.d.replace(
      /(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g,
      (_, x: string, y: string) => `${120 - Number(x)},${y}`,
    ),
  }
}
const both = (s: Shape): Shape[] => [s, mirror(s)]

const FRONT: Partial<Record<Muscle, Shape[]>> = {
  'Hombro lateral': both({ kind: 'ellipse', cx: 32, cy: 53, rx: 5, ry: 9, rot: 12 }),
  'Hombro anterior': both({ kind: 'ellipse', cx: 40, cy: 50, rx: 6.5, ry: 8 }),
  Pecho: both({ kind: 'path', d: 'M59,45 L45,45 Q38,49 40,60 Q47,69 59,65 Z' }),
  Bíceps: both({ kind: 'ellipse', cx: 34, cy: 76, rx: 5.5, ry: 12, rot: 8 }),
  Antebrazo: both({ kind: 'ellipse', cx: 29.5, cy: 104, rx: 5, ry: 13, rot: 10 }),
  Abdomen: [{ kind: 'rect', x: 50, y: 68, w: 20, h: 40, r: 7 }],
  Cuádriceps: both({ kind: 'ellipse', cx: 48.5, cy: 152, rx: 9, ry: 26, rot: 4 }),
  Aductores: both({ kind: 'ellipse', cx: 57.2, cy: 141, rx: 2.8, ry: 14 }),
}

const BACK: Partial<Record<Muscle, Shape[]>> = {
  Trapecio: [{ kind: 'path', d: 'M60,31 L76,45 L60,72 L44,45 Z' }],
  'Hombro lateral': both({ kind: 'ellipse', cx: 32, cy: 53, rx: 5, ry: 9, rot: 12 }),
  'Hombro posterior': both({ kind: 'ellipse', cx: 40, cy: 50, rx: 6.5, ry: 8 }),
  Dorsal: both({ kind: 'path', d: 'M47,57 Q37,63 43,92 L56,99 L56,73 Z' }),
  Espalda: [{ kind: 'rect', x: 53.5, y: 74, w: 13, h: 34, r: 5 }],
  Tríceps: both({ kind: 'ellipse', cx: 34, cy: 75, rx: 5.5, ry: 12, rot: 8 }),
  Antebrazo: both({ kind: 'ellipse', cx: 29.5, cy: 104, rx: 5, ry: 13, rot: 10 }),
  Glúteo: both({ kind: 'ellipse', cx: 51, cy: 119, rx: 10, ry: 10 }),
  Isquiotibiales: both({ kind: 'ellipse', cx: 50, cy: 153, rx: 8.5, ry: 22, rot: 3 }),
  Gemelo: both({ kind: 'ellipse', cx: 49.5, cy: 202, rx: 6.5, ry: 16 }),
}

/** Partes neutras (cabeza, manos, rodillas, piernas, pies). */
const NEUTRAL_FRONT: Shape[] = [
  { kind: 'ellipse', cx: 60, cy: 18, rx: 10, ry: 12 },
  { kind: 'rect', x: 55, y: 29, w: 10, h: 9, r: 3 },
  ...both({ kind: 'ellipse', cx: 27.5, cy: 123, rx: 4, ry: 5 }),
  ...both({ kind: 'path', d: 'M42,110 Q60,104 60,112 L60,124 L42,128 Z' }),
  ...both({ kind: 'ellipse', cx: 49.5, cy: 182, rx: 6, ry: 5 }),
  ...both({ kind: 'ellipse', cx: 49.5, cy: 207, rx: 6, ry: 20 }),
  ...both({ kind: 'ellipse', cx: 49, cy: 233, rx: 6, ry: 4 }),
]
const NEUTRAL_BACK: Shape[] = [
  { kind: 'ellipse', cx: 60, cy: 18, rx: 10, ry: 12 },
  ...both({ kind: 'ellipse', cx: 27.5, cy: 123, rx: 4, ry: 5 }),
  ...both({ kind: 'ellipse', cx: 49.5, cy: 179, rx: 6, ry: 4 }),
  ...both({ kind: 'ellipse', cx: 49.5, cy: 223, rx: 5, ry: 7 }),
  ...both({ kind: 'ellipse', cx: 49, cy: 234, rx: 6, ry: 3.5 }),
]

const LEVEL_OPACITY = [0, 0.3, 0.55, 0.8, 1]

function ShapeEl({ s, ...rest }: { s: Shape } & React.SVGProps<SVGElement>) {
  const common = rest as React.SVGProps<SVGEllipseElement & SVGPathElement & SVGRectElement>
  if (s.kind === 'ellipse')
    return (
      <ellipse
        cx={s.cx}
        cy={s.cy}
        rx={s.rx}
        ry={s.ry}
        transform={s.rot ? `rotate(${s.rot} ${s.cx} ${s.cy})` : undefined}
        {...common}
      />
    )
  if (s.kind === 'rect')
    return <rect x={s.x} y={s.y} width={s.w} height={s.h} rx={s.r} {...common} />
  return <path d={s.d} {...common} />
}

interface Props {
  sets: Map<Muscle, number>
  selected: Muscle | null
  onSelect: (m: Muscle) => void
}

export function BodyFigure({ sets, selected, onSelect }: Props) {
  const view = (title: string, map: Partial<Record<Muscle, Shape[]>>, neutral: Shape[]) => (
    <figure className="flex flex-1 flex-col items-center">
      <svg
        viewBox="0 0 120 242"
        className="h-auto w-full max-w-[170px]"
        role="group"
        aria-label={`Cuerpo, ${title}`}
      >
        {neutral.map((s, i) => (
          <ShapeEl key={i} s={s} fill="var(--fill-2)" />
        ))}
        {(Object.entries(map) as Array<[Muscle, Shape[]]>).map(([muscle, shapes]) => {
          const n = sets.get(muscle) ?? 0
          const level = muscleLevel(n)
          const isSel = selected === muscle
          return (
            <g
              key={muscle}
              role="button"
              tabIndex={0}
              aria-label={`${muscle}: ${n} ${n === 1 ? 'serie' : 'series'} esta semana`}
              aria-pressed={isSel}
              onClick={() => onSelect(muscle)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(muscle)}
              className="cursor-pointer outline-none"
            >
              {shapes.map((s, i) => (
                <ShapeEl key={`b${i}`} s={s} fill="var(--fill-2)" />
              ))}
              {shapes.map((s, i) => (
                <ShapeEl
                  key={i}
                  s={s}
                  fill="var(--chart-gym)"
                  fillOpacity={LEVEL_OPACITY[level]}
                  stroke={isSel ? 'var(--ink)' : 'var(--surface)'}
                  strokeWidth={isSel ? 1.6 : 1}
                />
              ))}
            </g>
          )
        })}
      </svg>
      <figcaption className="mt-1 text-footnote text-ink-2">{title}</figcaption>
    </figure>
  )

  return (
    <div>
      <div className="flex gap-2">
        {view('Frente', FRONT, NEUTRAL_FRONT)}
        {view('Espalda', BACK, NEUTRAL_BACK)}
      </div>
      <div
        className="mt-3 flex items-center justify-center gap-1.5 text-caption text-ink-2"
        aria-hidden
      >
        0
        {LEVEL_OPACITY.map((o, i) => (
          <span key={i} className="h-2.5 w-6 rounded-sm bg-fill-strong">
            <span className="block size-full rounded-sm bg-chart-gym" style={{ opacity: o }} />
          </span>
        ))}
        16+ series
      </div>
    </div>
  )
}
