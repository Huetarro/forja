# Forja — guía del proyecto

App personal de gimnasio y running para iPhone (PWA instalada desde Safari). Interfaz en español de España. Usuario principal: Dani (no programa). Especificación completa y vinculante: [docs/ESPECIFICACION.md](docs/ESPECIFICACION.md).

## Stack

Vite + React + TypeScript estricto · Tailwind CSS v4 (tokens en `src/styles/tokens.css`) · HashRouter · Dexie + dexie-react-hooks · Zustand (solo UI) · Recharts (lazy) · date-fns/es · lucide-react · motion · dnd-kit · vite-plugin-pwa · html-to-image · Vitest · ESLint + Prettier · Playwright.

## Comandos (PowerShell)

- `npm run dev` — servidor de desarrollo
- `npm run build` — build de producción (incluye `tsc -b`)
- `npm run preview` — sirve el build en http://localhost:4173/forja/
- `npm run lint` · `npm run format`
- `npm run test` — tests unitarios (Vitest)
- `npm run test:e2e` — pruebas en navegador a 390×844 (Playwright, arranca `preview`)
- `npm run icons` — regenera los PNG desde `public/icon.svg`
- `node scripts/screens.mjs [rutas]` y `node scripts/screens-flow.mjs` — capturas claro/oscuro en `screens/` (con `preview` en marcha)

## Estructura

- `src/domain/` — funciones puras con tests `*.test.ts` al lado (fechas, unidades, cronómetro, superseries, rotación, búsqueda, tipos de serie…).
- `src/db/` — esquema (`schema.ts`), Dexie (`db.ts`) y repositorios con hooks `useLiveQuery` (`library.ts`, `routines.ts`, `workouts.ts`, `summary.ts`, `days.ts`, `settings.ts`).
- Entreno: `src/features/entreno/` (ActiveWorkoutPage, WorkoutExercises → ExerciseBlock → SetRow). El mismo editor sirve para entrenos pasados (`mode="edit"`). Unilaterales: cada serie planificada = dos filas (`side` izq/der) con el mismo `order`.
- `src/components/ui/` — piezas reutilizables (BottomSheet, Overlays con confirmación y avisos con Deshacer, SortableList, Form, NavBar…).
- `src/features/<pantalla>/` — cada pantalla se carga con `React.lazy` desde `src/app/App.tsx`.
- `src/stores/ui.ts` — Zustand: `toast(text, undo?)` y `confirm({...})`.

## Gráficas

- Recharts solo en componentes cargados con `React.lazy` (p. ej. `RunCharts.tsx`); piezas comunes en `src/components/charts/`.
- Colores de gráfica: tokens `--c-chart-run` y `--c-chart-gym` (validados con la skill dataviz en claro y oscuro). Un solo eje, sin leyenda si hay una serie, tooltip siempre y tabla `sr-only`.

## Convenciones

- Sin `any`. Componentes pequeños. Lógica de negocio en `src/domain/`.
- Todo `<button>` lleva `type` explícito (dentro de formularios, uno sin tipo envía el formulario).
- Formularios en hojas: el estado vive en un hijo de `BottomSheet` (se desmonta al cerrar y se reinicia solo); el botón de la cabecera usa `type="submit" form="<id>"`.
- Datos solo en IndexedDB. Migraciones Dexie versionadas: nunca borrar datos; añadir `version(n+1)` con `upgrade()`.
- Fechas locales `YYYY-MM-DD` (Europe/Madrid), semana lunes-domingo (`src/domain/dates.ts`).
- Reglas de "Sube peso" en un único archivo: `src/domain/progressionRules.ts`.
- Al editar archivos con tildes desde PowerShell, usar las herramientas de edición (no `Get-Content`/`Set-Content`, que rompen el UTF-8).
- `base` de Vite = `/forja/`. La URL https://huetarro.github.io/forja/ no debe cambiar nunca.
- Despliegue: push a `main` → GitHub Actions → Pages. Antes de subir, build limpio (borrar `node_modules/.tmp`).

## Fase actual

- Fase 1 (Base): terminada.
- Fase 2 (Biblioteca, rutinas y programas): terminada.
- Fase 3 (Entreno en curso, cierre, resumen, compartir, historial): terminada.
- Fase 4 (Calendario, registro diario, racha, mapa de calor): terminada.
- Fase 5 (Running): terminada.
- Siguiente: fase 6 (estadísticas, figura muscular, récords, calculadora 1RM).
