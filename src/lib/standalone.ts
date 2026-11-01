const SKIP_KEY = 'forja-skip-install'

/** ¿Se está ejecutando como app instalada en la pantalla de inicio? */
export function isStandalone(): boolean {
  const nav = navigator as Navigator & { standalone?: boolean }
  return nav.standalone === true || window.matchMedia?.('(display-mode: standalone)').matches
}

export function installScreenSkipped(): boolean {
  try {
    return localStorage.getItem(SKIP_KEY) === '1'
  } catch {
    return false
  }
}

export function skipInstallScreen(): void {
  try {
    localStorage.setItem(SKIP_KEY, '1')
  } catch {
    // sin almacenamiento local: solo se salta en esta sesión
  }
}
