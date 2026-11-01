import { useEffect } from 'react'
import type { ThemePref } from '@/db/schema'

const STORAGE_KEY = 'forja-theme'

function systemPrefersDark(): boolean {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

/** Aplica el tema elegido a <html> y a la barra de estado. */
export function applyTheme(pref: ThemePref): void {
  const root = document.documentElement
  if (pref === 'auto') delete root.dataset.theme
  else root.dataset.theme = pref
  try {
    localStorage.setItem(STORAGE_KEY, pref)
  } catch {
    // almacenamiento local no disponible
  }
  const dark = pref === 'dark' || (pref === 'auto' && systemPrefersDark())
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', dark ? '#000000' : '#F2F2F7')
}

export function useApplyTheme(pref: ThemePref | undefined): void {
  useEffect(() => {
    if (!pref) return
    applyTheme(pref)
    if (pref !== 'auto') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => applyTheme('auto')
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [pref])
}
