import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { contrastRatio } from './contrast'

const css = readFileSync(new URL('../styles/tokens.css', import.meta.url), 'utf-8')
const AA = 4.5

describe('punto de cardio en el calendario', () => {
  const GRAPHIC = 3
  it('los valores de tokens.css son los comprobados', () => {
    expect(css).toContain('--c-cardio: #dc514d')
    expect(css).toContain('--c-cardio: #f67972')
  })
  it('se ve sobre la tarjeta en claro y en oscuro', () => {
    expect(contrastRatio('#DC514D', '#FFFFFF')).toBeGreaterThanOrEqual(GRAPHIC)
    expect(contrastRatio('#F67972', '#1C1C1E')).toBeGreaterThanOrEqual(GRAPHIC)
  })
})

describe('contraste AA del acento', () => {
  it('los valores de tokens.css son los comprobados', () => {
    expect(css).toContain('--c-accent: #ff6a1a')
    expect(css).toContain('--c-accent-ink: #c2410c')
    expect(css).toContain('--c-accent-ink: #ff7a33')
  })
  it('texto negro sobre el naranja forja', () => {
    expect(contrastRatio('#FF6A1A', '#000000')).toBeGreaterThanOrEqual(AA)
  })
  it('naranja de texto en tema claro (fondo y tarjeta)', () => {
    expect(contrastRatio('#C2410C', '#F2F2F7')).toBeGreaterThanOrEqual(AA)
    expect(contrastRatio('#C2410C', '#FFFFFF')).toBeGreaterThanOrEqual(AA)
  })
  it('naranja de texto en tema oscuro (fondo y tarjeta)', () => {
    expect(contrastRatio('#FF7A33', '#000000')).toBeGreaterThanOrEqual(AA)
    expect(contrastRatio('#FF7A33', '#1C1C1E')).toBeGreaterThanOrEqual(AA)
  })
})
