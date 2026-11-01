# Forja â€” guÃ­a del proyecto

App personal de gimnasio y running para iPhone (PWA instalada desde Safari). Interfaz en espaÃ±ol de EspaÃ±a. Usuario principal: Dani (no programa). EspecificaciÃ³n completa y vinculante: [docs/ESPECIFICACION.md](docs/ESPECIFICACION.md).

## Stack

Vite + React + TypeScript estricto Â· Tailwind CSS v4 (tokens en `src/styles/tokens.css`) Â· HashRouter Â· Dexie + dexie-react-hooks Â· Zustand (solo UI) Â· Recharts (lazy) Â· date-fns/es Â· lucide-react Â· motion Â· dnd-kit Â· vite-plugin-pwa Â· html-to-image Â· Vitest Â· ESLint + Prettier Â· Playwright.

## Comandos (PowerShell)

- `npm run dev` â€” servidor de desarrollo
- `npm run build` â€” build de producciÃ³n (incluye `tsc -b`)
- `npm run preview` â€” sirve el build en http://localhost:4173/forja/
- `npm run lint` Â· `npm run format`
- `npm run test` â€” tests unitarios (Vitest)
- `npm run icons` â€” regenera los PNG desde `public/icon.svg`

## Convenciones

- Sin `any`. Componentes pequeÃ±os. LÃ³gica de negocio en `src/domain/` como funciones puras con tests `*.test.ts` al lado.
- Datos solo en IndexedDB (`src/db/`). Migraciones Dexie versionadas: nunca borrar datos; aÃ±adir `version(n+1)` con `upgrade()`.
- Fechas locales `YYYY-MM-DD` (Europe/Madrid), semana lunes-domingo (`src/domain/dates.ts`).
- Reglas de "Sube peso" en un Ãºnico archivo: `src/domain/progressionRules.ts`.
- `base` de Vite = `/forja/`. La URL https://huetarro.github.io/forja/ no debe cambiar nunca.
- Despliegue: push a `main` â†’ GitHub Actions â†’ Pages.

## Fase actual

Fase 1 (Base) terminada: PWA, tokens y tema, icono, 5 pestañas, esquema Dexie v1 completo, instalación, bienvenida y despliegue. Siguiente: fase 2 (biblioteca de ejercicios, rutinas y programas).

Revisión visual: con `npm run preview` en marcha, `node scripts/screens.mjs [rutas]` deja capturas 390×844 claro/oscuro en `screens/`.
