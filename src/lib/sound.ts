/**
 * Pitido del temporizador de descanso con Web Audio.
 * iOS solo permite sonar tras un toque del usuario: `unlockAudio` se llama en el primer toque.
 */
let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (ctx) return ctx
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  ctx = new Ctor()
  return ctx
}

export function unlockAudio(): void {
  const c = getCtx()
  if (c && c.state === 'suspended') void c.resume()
}

/** Tres pitidos cortos. */
export function beep(): void {
  const c = getCtx()
  if (!c) return
  const t0 = c.currentTime
  for (let i = 0; i < 3; i++) {
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.type = 'sine'
    osc.frequency.value = i === 2 ? 1320 : 880
    const t = t0 + i * 0.22
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(0.4, t + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18)
    osc.connect(gain).connect(c.destination)
    osc.start(t)
    osc.stop(t + 0.2)
  }
}
