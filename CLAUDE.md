# Forja — guía del proyecto

App personal de gimnasio y running para iPhone (PWA instalada desde Safari). Interfaz en español de España. Usuario principal: Dani (no programa). Especificación completa y vinculante: [docs/ESPECIFICACION.md](docs/ESPECIFICACION.md), con los cambios de la v2 en [docs/CAMBIOS-V2.md](docs/CAMBIOS-V2.md).

## Stack

Vite + React + TypeScript estricto · Tailwind CSS v4 (tokens en `src/styles/tokens.css`) · HashRouter · Dexie + dexie-react-hooks · Zustand (solo UI) · Recharts (lazy) · date-fns/es · lucide-react · motion · dnd-kit · vite-plugin-pwa · html-to-image · Vitest · ESLint + Prettier · Playwright.

## Comandos (PowerShell)

- `npm run dev` — servidor de desarrollo
- `npm run build` — build de producción (incluye `tsc -b`)
- `npm run preview` — sirve el build en http://localhost:4173/forja/
- `npm run lint` · `npm run format`
- `npm run test` — tests unitarios (Vitest)
- `npm run test:e2e` — pruebas en navegador a 390×844 (Playwright, arranca `preview`)
- `npm run check` — comprobación completa antes de publicar (formato, lint, tests, build, e2e); se detiene al primer fallo
- `npm run icons` — regenera los PNG desde `public/icon.svg`
- `node scripts/screens.mjs [rutas]` y `node scripts/screens-flow.mjs` — capturas claro/oscuro en `screens/` (con `preview` en marcha)

## Estructura

- `src/domain/` — funciones puras con tests `*.test.ts` al lado (fechas, unidades, cronómetro, superseries, búsqueda, tipos de serie, técnicas, plan semanal, descarga, km semanales, emparejado de nombres…).
- `src/db/` — esquema (`schema.ts`), Dexie (`db.ts`) y repositorios con hooks `useLiveQuery` (`library.ts`, `routines.ts`, `workouts.ts`, `summary.ts`, `days.ts`, `runs.ts`, `stats.ts`, `sample.ts`, `settings.ts`, `plan.ts`, `planV2.ts`, `snapshot.ts`).
- Migraciones: `db.ts` tiene `V1_STORES` (no tocar) y `version(2)` con copia interna previa (`snapshots`). Tests: `src/db/migration.test.ts` y `src/db/planV2.test.ts` (fake-indexeddb, datos de `v1Fixture.ts`); e2e `e2e/migracion.spec.ts` crea una base v1 real (`e2e/v1db.ts`). Cualquier `version(3)` necesita su propio test de migración.
- Plan v2: `planV2.ts` (datos + `loadPlanV2()` idempotente, `settings.planV2LoadedAt`); se lanza al arrancar con `src/app/useAutoLoadPlanV2.ts` si `planV2Pending`.
- Técnicas: rutina → `RoutineExercise` (`target`, `restSec`, `extras`, `negative`, `pause`); al empezar se copian al `WorkoutExercise` y `domain/workoutPlan.ts` crea las series (bajadas/mini-series en `drops`, descarga = mitad de series normales). Leyenda en `domain/techniques.ts`.
- Estadísticas: `useTrainingData()` carga todo normalizado (`SessionData`) y las pestañas calculan con `src/domain/stats.ts`.
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
- Reglas de "Sube peso" en un único archivo: `src/domain/progressionRules.ts` (v2: tope del rango; "Tope alcanzado" sin kg; ignora la descarga).
- Nada de `autoFocus` ni `.focus()` automáticos: el teclado solo se abre al tocar un campo (`src/lib/keyboard.ts`).
- En scripts de comprobación, no encadenar `npm run check | tail` con `&&`: la tubería oculta el fallo. Publicar solo si `npm run check` sale con código 0.
- Al editar archivos con tildes desde PowerShell, usar las herramientas de edición (no `Get-Content`/`Set-Content`, que rompen el UTF-8).
- `base` de Vite = `/forja/`. La URL https://huetarro.github.io/forja/ no debe cambiar nunca.
- Despliegue: push a `main` → GitHub Actions → Pages. Antes de subir, build limpio (borrar `node_modules/.tmp`).

## Fase actual

- Fase 1 (Base): terminada.
- Fase 2 (Biblioteca, rutinas y programas): terminada.
- Fase 3 (Entreno en curso, cierre, resumen, compartir, historial): terminada.
- Fase 4 (Calendario, registro diario, racha, mapa de calor): terminada.
- Fase 5 (Running): terminada.
- Fase 6 (Estadísticas, figura muscular, récords, calculadora 1RM): terminada.
- Fase 7 (Ajustes, copias JSON/CSV, datos de ejemplo, borrar todo, pulido y pruebas finales): terminada.

- v2 (CAMBIOS-V2): terminada. Versión 2.0.0.

Formato de copia: `src/domain/backup.ts` (`BACKUP_VERSION` = 2, acepta 1); si cambia el esquema de Dexie, subir la versión de copia y aceptar las anteriores al importar.
