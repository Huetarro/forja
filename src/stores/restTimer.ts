import { create } from 'zustand'

/** Temporizador de descanso (solo si está activado en Ajustes). Se guarda por marcas de tiempo. */
interface RestTimerState {
  endsAt: number | null
  total: number
  start: (seconds: number) => void
  add: (seconds: number) => void
  stop: () => void
}

const KEY = 'forja-rest'

function persist(endsAt: number | null, total: number) {
  try {
    if (endsAt) localStorage.setItem(KEY, JSON.stringify({ endsAt, total }))
    else localStorage.removeItem(KEY)
  } catch {
    // sin almacenamiento local
  }
}

function restore(): { endsAt: number | null; total: number } {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const v = JSON.parse(raw) as { endsAt: number; total: number }
      if (v.endsAt > Date.now()) return v
    }
  } catch {
    // ignorar
  }
  return { endsAt: null, total: 0 }
}

export const useRestTimer = create<RestTimerState>((set, get) => ({
  ...restore(),
  start: (seconds) => {
    const endsAt = Date.now() + seconds * 1000
    persist(endsAt, seconds)
    set({ endsAt, total: seconds })
  },
  add: (seconds) => {
    const { endsAt, total } = get()
    if (!endsAt) return
    const next = Math.max(Date.now(), endsAt + seconds * 1000)
    const nt = Math.max(1, total + seconds)
    persist(next, nt)
    set({ endsAt: next, total: nt })
  },
  stop: () => {
    persist(null, 0)
    set({ endsAt: null, total: 0 })
  },
}))
