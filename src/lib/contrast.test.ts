import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { contrastRatio } from './contrast'

const css = readFileSync(new URL('../styles/tokens.css', import.meta.url), 'utf-8')
const AA = 4.5
const GRAPHIC = 3

describe('punto de cardio en el calendario', () => {
  it('los valores de tokens.css son los comprobados', () => {
    expect(css).toContain('--cardio: #dc514d')
    expect(css).toContain('--cardio: #f67972')
  })
  it('se ve sobre la tarjeta en claro y en oscuro', () => {
    expect(contrastRatio('#DC514D', '#FFFFFF')).toBeGreaterThanOrEqual(GRAPHIC)
    expect(contrastRatio('#F67972', '#1C1C1E')).toBeGreaterThanOrEqual(GRAPHIC)
  })
})

describe('contraste AA del azul de acción', () => {
  it('los valores de tokens.css son los comprobados', () => {
    expect(css).toContain('--btn: #0066cc')
    expect(css).toContain('--accent: #2997ff')
  })
  it('texto blanco sobre los botones', () => {
    expect(contrastRatio('#FFFFFF', '#0066CC')).toBeGreaterThanOrEqual(AA)
    expect(contrastRatio('#FFFFFF', '#0071E3')).toBeGreaterThanOrEqual(AA)
  })
  it('azul de texto sobre fondo y tarjeta', () => {
    expect(contrastRatio('#0066CC', '#F5F5F7')).toBeGreaterThanOrEqual(AA)
    expect(contrastRatio('#2997FF', '#000000')).toBeGreaterThanOrEqual(AA)
    expect(contrastRatio('#2997FF', '#1C1C1E')).toBeGreaterThanOrEqual(AA)
  })
  it('texto secundario y de marcador', () => {
    expect(contrastRatio('#6E6E73', '#FFFFFF')).toBeGreaterThanOrEqual(AA)
    expect(contrastRatio('#98989D', '#1C1C1E')).toBeGreaterThanOrEqual(AA)
  })
})
