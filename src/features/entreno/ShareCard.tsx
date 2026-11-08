import { forwardRef } from 'react'
import { Trophy } from 'lucide-react'
import type { SummaryData } from '@/db/summary'
import { capitalize, longDate } from '@/domain/dates'
import { RECORD_LABEL } from '@/domain/records'
import { formatDuration } from '@/domain/timer'
import { formatNumber } from '@/domain/units'
import { routineColor } from '@/lib/routineStyle'

/**
 * Tarjeta 9:16 para compartir (se captura a 1080×1920 con pixelRatio 3).
 * Usa colores fijos para que la imagen sea igual en tema claro y oscuro.
 */
export const ShareCard = forwardRef<HTMLDivElement, { data: SummaryData }>(function ShareCard(
  { data },
  ref,
) {
  const { workout, routine, summary } = data
  const color = routine ? routineColor(routine.color) : '#83868e'
  const stats = [
    { label: 'Duración', value: formatDuration(summary.durationSec) },
    { label: 'Volumen', value: `${formatNumber(Math.round(summary.volumeKg), 0)} kg` },
    { label: 'Series', value: String(summary.effectiveSets) },
    { label: 'Ejercicios', value: String(summary.exerciseCount) },
  ]
  return (
    <div
      ref={ref}
      style={{
        width: 360,
        height: 640,
        background: '#1d1d1f',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter Variable", "Segoe UI", sans-serif',
      }}
      className="relative flex flex-col overflow-hidden p-7 text-white"
    >
      <div className="flex items-center gap-2">
        <img
          src={`${import.meta.env.BASE_URL}pwa-192.png`}
          alt=""
          width={30}
          height={30}
          style={{ borderRadius: 8 }}
        />
        <span style={{ fontWeight: 600, fontSize: 17, letterSpacing: -0.2 }}>Forja</span>
      </div>

      <div className="mt-auto">
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
          {capitalize(longDate(workout.date))}
        </p>
        <h1
          style={{
            fontSize: 40,
            lineHeight: 1.05,
            fontWeight: 600,
            letterSpacing: -1,
            marginTop: 6,
          }}
        >
          {workout.routineName}
        </h1>
        <span
          style={{
            display: 'block',
            width: 56,
            height: 5,
            borderRadius: 3,
            background: color,
            marginTop: 14,
          }}
        />
      </div>

      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-5">
        {stats.map((s) => (
          <div key={s.label}>
            <div
              style={{
                fontSize: 30,
                fontWeight: 600,
                letterSpacing: -0.6,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {s.value}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', fontWeight: 600 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {summary.records.length > 0 && (
        <div
          className="mt-8 space-y-2"
          style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: 14 }}
        >
          {summary.records.slice(0, 3).map((r, i) => (
            <div key={i} className="flex items-center gap-2" style={{ fontSize: 14 }}>
              <Trophy size={16} color="#ffffff" />
              <span style={{ fontWeight: 600 }}>{r.exerciseName}</span>
              <span style={{ color: 'rgba(255,255,255,0.7)' }}>{RECORD_LABEL[r.kind]}</span>
            </div>
          ))}
          {summary.records.length > 3 && (
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
              y {summary.records.length - 3} récords más
            </div>
          )}
        </div>
      )}
      <div className="mb-2" />
    </div>
  )
})
