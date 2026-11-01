import { useEffect, useState } from 'react'

/** Hora actual que se refresca cada `ms` y al volver a la app. */
export function useNow(ms = 1000, enabled = true): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!enabled) return
    const tick = () => setNow(Date.now())
    const id = setInterval(tick, ms)
    const onVis = () => document.visibilityState === 'visible' && tick()
    document.addEventListener('visibilitychange', onVis)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [ms, enabled])
  return now
}
