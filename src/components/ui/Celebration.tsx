import { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, useReducedMotion } from 'motion/react'

const COLORS = ['#ff6a1a', '#ff9f0a', '#ffd60a', '#ffffff', '#ff8a4c']

/** Lluvia breve de chispas (al terminar un entreno o batir un récord). */
export function Celebration({ burst = 28, onDone }: { burst?: number; onDone?: () => void }) {
  const reduce = useReducedMotion()
  const [parts] = useState(() => makeParts(burst))
  if (reduce) return null
  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[70] overflow-hidden" aria-hidden>
      <div className="absolute bottom-1/3 left-1/2">
        {parts.map((p, i) => (
          <motion.span
            key={p.id}
            className="absolute block"
            style={{
              width: p.size,
              height: p.round ? p.size : p.size * 0.45,
              background: p.color,
              borderRadius: p.round ? 999 : 2,
            }}
            initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
            animate={{ x: p.x, y: [0, p.y, p.y + 420], opacity: [1, 1, 0], rotate: p.r }}
            transition={{ duration: 1.6, delay: p.delay, ease: [0.2, 0.7, 0.4, 1] }}
            onAnimationComplete={i === 0 ? onDone : undefined}
          />
        ))}
      </div>
    </div>,
    document.body,
  )
}

function makeParts(burst: number) {
  return Array.from({ length: burst }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 340,
    y: -(160 + Math.random() * 260),
    r: Math.random() * 540 - 270,
    size: 6 + Math.random() * 7,
    color: COLORS[i % COLORS.length] ?? '#ff6a1a',
    delay: Math.random() * 0.12,
    round: Math.random() > 0.5,
  }))
}
