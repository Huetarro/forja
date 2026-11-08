# PROYECTO FORJA — App personal de gimnasio y running para iPhone (PWA)

> **v2:** este documento incluye los cambios de [CAMBIOS-V2.md](CAMBIOS-V2.md) (resumen en la sección 14). Donde hay conflicto, manda la v2.

Vas a construir desde cero una app llamada **Forja**. El usuario principal es Dani, que no sabe programar. Se usará en un iPhone 12 Pro (iOS 27) instalada desde Safari como web app en la pantalla de inicio. Toda la interfaz en español de España. Debe ser bonita, profesional, minimalista, atractiva, muy fácil de usar y con todo muy organizado.

## 0. Cómo quiero que trabajes

1. Antes de escribir código, guarda este documento íntegro en `docs/ESPECIFICACION.md` y crea un `CLAUDE.md` con el resumen del proyecto, stack, comandos, convenciones y fase actual, que remita a la especificación. Actualízalo al acabar cada fase.
2. Usa la skill **frontend-design** en todas las decisiones de interfaz, y **theme-factory** si te ayuda con el sistema de color. Usa la skill **webapp-testing** (o Playwright) para revisar la app en un viewport de iPhone 12 Pro (390×844), en modo claro y oscuro, y corrige lo que veas mal.
3. Trabaja por fases (sección 13). Al terminar cada fase: `npm run build` sin errores, lint y tests en verde, commit con mensaje claro, push a GitHub y un resumen mío de 3-5 líneas con qué hay y cómo probarlo. Después sigue con la siguiente fase sin esperar, salvo que necesites una decisión mía.
4. Uso Windows con PowerShell. Cualquier paso manual explícamelo con instrucciones exactas y sencillas.
5. Si algo de esta especificación no es posible en una web app de iOS, dímelo y propón la mejor alternativa. No lo omitas en silencio.
6. Calidad: TypeScript estricto sin `any`, componentes pequeños, lógica de negocio (cálculos, estadísticas, sugerencias, rachas) en funciones puras separadas de la UI y cubiertas con tests (Vitest). ESLint y Prettier.

## 1. Stack

- Vite + React + TypeScript (versiones estables actuales).
- Tailwind CSS, con los tokens de diseño (colores, radios, espaciados, tipografía) definidos en un único sitio.
- React Router con HashRouter (evita errores 404 en GitHub Pages).
- Datos persistentes en IndexedDB con Dexie y dexie-react-hooks (useLiveQuery). Zustand para estado de UI.
- Gráficos con Recharts, cargados de forma diferida.
- date-fns con locale `es`; iconos lucide-react; animaciones con Motion (Framer Motion) usadas con moderación y respetando prefers-reduced-motion; arrastrar y soltar con dnd-kit (táctil).
- PWA con vite-plugin-pwa (Workbox): funciona 100 % sin conexión y se actualiza sola, mostrando "Nueva versión disponible · Actualizar".
- Imagen para compartir: html-to-image + Web Share API (con descarga como alternativa).
- Sin backend, sin cuentas, sin analítica, sin servicios de pago.
- Despliegue en GitHub Pages con GitHub Actions. Ajusta `base` de Vite a la ruta del repositorio.

## 2. Requisitos iPhone (PWA)

- Manifest: name y short_name "Forja", display standalone, orientación vertical, theme y background color, iconos 192/512 y maskable, apple-touch-icon 180×180, meta apple-mobile-web-app-capable y status bar black-translucent.
- viewport-fit=cover y márgenes con env(safe-area-inset-*) para el notch y la barra de inicio.
- Sensación nativa: inputs con font-size ≥ 16 px (sin zoom), sin resaltado al tocar, sin selección de texto en botones, transiciones suaves entre pantallas, hojas inferiores (bottom sheets) para formularios cortos.
- Teclados: `inputMode="decimal"` para pesos y km; `inputMode="numeric"` para reps, pulsaciones y calorías.
- Llamar a `navigator.storage.persist()` al arrancar.
- Code-splitting por pantalla y carga inicial rápida.
- Si la app se abre en Safari sin estar instalada (no standalone), mostrar una pantalla breve que explique cómo añadirla a la pantalla de inicio.
- No usar Wake Lock (la pantalla no debe mantenerse encendida).

## 3. Diseño

- Estilo minimalista y profesional inspirado en Apple Fitness y en iOS nativo: limpio, mucho aire, jerarquía tipográfica clara, tarjetas con esquinas de 16-20 px, sin sombras pesadas.
- Tipografía del sistema (-apple-system / SF Pro). Números con `font-variant-numeric: tabular-nums` (cronómetro, kg, reps).
- Tema automático según el iPhone, con opción en Ajustes de forzar claro u oscuro. Oscuro: fondo negro #000 y tarjetas gris muy oscuro. Claro: fondo #F2F2F7 y tarjetas blancas.
- Acento: naranja "forja" (en torno a #FF6A1A), ajustado para contraste AA en ambos temas.
- Rutinas con color (paleta de 8-10 colores armónicos) e icono (selección de iconos de gimnasio de lucide).
- Icono de la app: mancuerna geométrica simple en blanco y naranja sobre fondo oscuro con un degradado sutil. Diséñalo en SVG y genera los PNG necesarios.
- Barra inferior con 5 pestañas: Inicio, Calendario, Estadísticas, Running, Ajustes.
- Microinteracciones: animación sutil al marcar una serie, celebración breve al terminar un entreno y al batir un récord.
- Estados vacíos cuidados, con un texto que invite a la acción.
- Áreas táctiles ≥ 44 px, contraste AA, etiquetas accesibles.
- Confirmación antes de eliminar y opción de "Deshacer" con un aviso temporal cuando sea posible.

## 4. Modelo de datos (orientativo; mejóralo si lo ves necesario)

- **Program** (carpeta de rutinas): id, nombre, orden, archivado.
- **Routine**: id, programId opcional, nombre, color, icono, notas, orden, archivada, creadaEn.
- **Exercise** (biblioteca): id, nombre, músculoPrincipal, músculosSecundarios[], material, unilateral, unidad ('kg' | 'lb'), notasFijas, archivado.
- **RoutineExercise**: id, routineId, exerciseId, orden, notas, superserieId opcional, series[] con el tipo de cada serie.
- **Workout**: id, routineId, nombre de la rutina copiado, fecha local (YYYY-MM-DD), inicio, fin, pausas[], duraciónActivaSeg, estado ('en_curso' | 'terminado'), pulsacionesMedias, calorías, valoración 1-5, energía 1-5, notas.
- **WorkoutExercise**: id, workoutId, exerciseId, orden, notas, superserieId opcional.
- **WorkoutSet**: id, workoutExerciseId, orden, tipo ('calentamiento' | 'normal' | 'dropset' | 'negativa' | 'restpause'), peso, reps (o segundos en ejercicios por tiempo), rir opcional, completada, lado opcional ('izq' | 'der'), bajadas[] con { peso, reps } para dropsets y mini-series de rest-pause.
- **v2**: Exercise + métrica ('reps' | 'segundos') y peso opcional; RoutineExercise/WorkoutExercise + objetivo {min, max}, descanso, bajadas/mini-series predefinidas por serie, NEG y PAUSA (detalle); Routine + estiramientos; Workout + descarga y estiramientos hechos; Settings + plan semanal, lista de estiramientos, semana de descarga y marcas de la carga del plan; tabla `snapshots` con la copia interna previa a la v2.
- **Run**: id, fecha, distanciaKm, duraciónSeg, pulsacionesMedias, calorías, desnivelM, tipo ('rodaje' | 'series' | 'tirada_larga' | 'competicion' | 'otro'), superficie ('exterior' | 'cinta'), sensaciones 1-5, notas. El ritmo se calcula, no se guarda.
- **DayLog** (uno por fecha): descanso, suplementos { suplementoId: boolean }, alimentación ('bien' | 'mal' | null), horasSueño, estiramientos, pesoCorporal, notas.
- **Supplement**: id, nombre, orden, activo. Precargados: Creatina, Omega 3, Vitamina D, Multivitamínico, Magnesio.
- **ProgressPhoto**: id, fecha, imagen (comprimida a unos 1600 px, JPEG calidad 0,8), nota.
- **Settings**: nombre del usuario, tema, unidad por defecto para ejercicios nuevos, temporizador de descanso { visible: false, segundos: 90 }, fecha de la última copia.
- Migraciones de Dexie versionadas: ninguna actualización de la app puede borrar datos.

## 5. Pantallas y funciones

### 5.1 Primer uso
- Pantalla de bienvenida breve: nombre del usuario (por defecto "Dani"; la app la usarán también otras personas desde el mismo enlace) y tema.

### 5.2 Inicio
- Saludo "Hola, Dani" y fecha de hoy.
- Si hay un entreno en curso: tarjeta destacada con el cronómetro y botón "Continuar".
- Tarjeta "Te toca hoy" según el **plan semanal por días** (v2, sustituye a la rotación): rutina con "Empezar", carrera con su objetivo y "Registrar carrera" con el tipo ya puesto, o descanso.
- Tarjeta fija "Peso de hoy" (v2) y tarjeta "Semana de descarga" con "X semanas desde la última descarga" (destacada desde la semana 6).
- Resumen de la semana (lunes a domingo): puntos por día (gym, running, descanso), tiempo total, volumen y km.
- Racha actual.
- Checks de hoy: suplementos (chips que se tocan), alimentación bien/mal y estiramientos.
- Rutinas agrupadas por programa, cada una con color, icono, número de ejercicios y "hace X días". Al tocarla se abre su detalle con el botón "Empezar entreno".
- Botón para crear rutina y acceso rápido "Registrar carrera".
- Aviso discreto si la última copia de seguridad tiene más de 14 días.

### 5.3 Rutinas y programas
- Crear, editar, duplicar, archivar, restaurar y eliminar rutinas (nombre, color, icono, notas, programa).
- Programas o carpetas: crear, renombrar, reordenar y archivar.
- Reordenar rutinas y ejercicios arrastrando (táctil).
- Añadir ejercicios desde la biblioteca con buscador, o crear uno nuevo sin salir de la rutina.
- Por ejercicio: número de series, tipo de cada serie (normal, calentamiento, dropset, negativa), notas y opción de agruparlo en superserie con el siguiente.
- v2: por ejercicio se define el objetivo (rango de reps o de segundos) y el descanso, las bajadas de cada dropset (DS, DS x2…) y las mini-series de cada rest-pause, NEG (todas las series en negativa) y PAUSA con detalle. Los kg se apuntan al entrenar.
- Las rutinas archivadas conservan todo su historial.

### 5.4 Biblioteca de ejercicios
- No hay ejercicios precargados: los crea el usuario.
- Campos: nombre, músculo principal, secundarios (selección múltiple), material (barra, mancuernas, máquina, polea, peso corporal, multipower, otro), unilateral sí/no, unidad kg o lb (depende de la máquina), notas fijas (asiento, agarre, ajustes).
- Grupos musculares: Pecho, Espalda, Dorsal, Trapecio, Hombro anterior, Hombro lateral, Hombro posterior, Bíceps, Tríceps, Antebrazo, Cuádriceps, Isquiotibiales, Glúteo, Aductores, Gemelo, Abdomen.
- En mancuernas se apunta el peso total.
- Buscar y filtrar por músculo y material.
- Ficha de ejercicio: historial de sesiones, récords y gráficas.

### 5.5 Entreno en curso (la pantalla más importante)
- Al empezar desde una rutina se crea el entreno y arranca el cronómetro.
- Cronómetro grande (hh:mm:ss) con pausar/reanudar. Se calcula con marcas de tiempo, así sigue siendo correcto aunque se bloquee el móvil o se cierre la app. El tiempo pausado no cuenta.
- Cada cambio se guarda al instante. Si la app se cierra, al abrirla se recupera el entreno exactamente donde estaba.
- Cada serie es una fila: tipo, kg, reps y check (v3: sin RIR; los valores ya guardados se conservan sin mostrarse).
  - Al lado, "Anterior: 80 kg × 8": la misma serie en la última sesión de ese ejercicio, en cualquier rutina.
  - Kg y reps prerrellenados en gris con los valores anteriores. Si se marca el check sin tocarlos, se aceptan esos valores.
  - Unidad del ejercicio visible (kg o lb).
  - Ejercicios unilaterales: cada serie se desdobla en Izq y Der.
  - Tipo de serie con un chip que se toca: Normal, Calentamiento (C), Dropset (D), Rest-pause (RP), Negativa (N).
  - v2: los dropsets y rest-pause de la rutina aparecen ya desplegados; el rest-pause muestra mini-series ("descansa 15 s") con el peso de la serie por defecto. Chips DS, DS x2, RP, NEG y PAUSA que abren la leyenda; nota "1-2 reps en reserva, salvo la última con técnica (al fallo)".
  - Dropset: al marcarlo, la fila se despliega con animación y muestra las bajadas (peso y reps de cada una), con botón "+ bajada" sin límite y opción de eliminar bajadas.
  - Check grande para marcar la serie hecha; la fila cambia de estilo.
  - Añadir serie, duplicar la última y eliminar deslizando.
- Notas del ejercicio en este entreno y acceso a sus notas fijas.
- Superseries: ejercicios agrupados con una barra lateral de color.
- Distintivo "Sube peso" en el ejercicio cuando se cumpla la regla de la sección 7, sin indicar cuántos kg.
- v3: bloque "Cardio" al final de la lista con el interruptor "He hecho cardio", tiempo (min) e inclinación (0-30 %, admite 0,5), prerrellenados en gris con la última vez.
- Todo modificable en directo: añadir, quitar y reordenar ejercicios; añadir y quitar series; cambiar tipos.
- Temporizador de descanso OCULTO por defecto. Si se activa en Ajustes: arranca al marcar una serie, duración por defecto y por ejercicio, botones ±15 s y aviso visual y sonoro con la app abierta.
- Botón "Terminar":
  1. Si hay series sin marcar, preguntar si descartarlas.
  2. Si la estructura cambió respecto a la rutina (ejercicios, orden, número o tipo de series), preguntar: "¿Actualizar la rutina con estos cambios?" con las opciones "Actualizar rutina" y "Solo este entreno".
  3. Formulario de cierre rápido, todo opcional: pulsaciones medias (ppm), calorías (kcal), valoración 1-5, energía 1-5 y notas. (v2: el peso corporal sale del cierre; se apunta en Inicio o en el día del calendario.)
  4. Resumen: duración, ejercicios, series efectivas, volumen, récords batidos (con celebración) y comparación con la vez anterior de esa rutina (duración y volumen en %). Botón "Compartir" que genera una imagen bonita en formato historia (9:16) y abre el menú de compartir de iOS.
- Cancelar entreno, con confirmación.
- No existe entreno libre: siempre se parte de una rutina.

### 5.6 Historial
- Lista de entrenos pasados, accesible desde el calendario y desde las fichas de rutina y ejercicio.
- Editar cualquier entreno pasado: series, datos de cierre, fecha y duración.
- Añadir un entreno olvidado con fecha anterior a partir de una rutina, con duración introducida a mano.
- Eliminar entrenos.

### 5.7 Running
- Registrar carrera: fecha, distancia en km (2 decimales), tiempo hh:mm:ss con un selector cómodo, ritmo calculado en directo (min:ss /km), pulsaciones medias, calorías, desnivel (m), tipo (Rodaje, Series, Tirada larga, Competición, Otro), superficie (Exterior o Cinta), sensaciones 1-5 y notas.
- Puede haber running y gimnasio el mismo día.
- Lista de carreras con distancia, tiempo y ritmo.
- Estadísticas: km por semana y por mes (barras), evolución del ritmo (línea con el eje invertido, más rápido arriba), ritmo frente a pulsaciones, récords (carrera más larga, mejor ritmo en carreras de 5 km o más y de 10 km o más, semana y mes con más km) y totales del año (km, carreras y tiempo).

### 5.8 Calendario
- Vista mensual con la semana empezando en lunes; se desliza entre meses.
- Cada día muestra: gimnasio (color de la rutina), running (otro color), descanso (gris) y puntos pequeños de suplementos completos y alimentación bien. Leyenda clara.
- Al tocar un día se abre la hoja del día:
  - Entrenos y carreras de ese día, con acceso a su detalle.
  - Marcar como día de descanso.
  - Suplementos: un check por cada uno y "Marcar todos".
  - Alimentación: Bien o Mal.
  - Horas de sueño (decimales, por ejemplo 7,5).
  - Estiramientos sí/no.
  - Peso corporal (kg).
  - Fotos de progreso desde cámara o galería.
  - Notas.
- Se pueden rellenar días pasados.
- Mapa de calor anual tipo GitHub con intensidad según actividad; al tocar una celda se abre el día.

### 5.9 Estadísticas
Pestañas internas: Resumen, Ejercicios, Músculos, Cuerpo, Hábitos. Selector de rango: 4 semanas, 3 meses, 6 meses, 1 año, Todo. Cada indicador compara con el periodo anterior del mismo tamaño (± %).
- **Resumen**: entrenos por semana, duración media, tiempo total, volumen total, series totales, pulsaciones medias y calorías por entreno (gráficas), racha actual y mejor racha, reparto gimnasio/running y récords recientes.
- **Ejercicios**: lista con minigráfica y tendencia. Detalle con 1RM estimado (métrica principal), peso máximo, volumen por sesión y mejor serie; tabla de récords (máximo peso, mejor 1RM estimado, más reps con cada peso, mayor volumen en una sesión); historial; aviso de estancamiento.
- **Músculos**: series semanales y volumen semanal por grupo muscular, con su evolución. Figura del cuerpo de frente y de espalda (SVG propio) que colorea cada músculo según las series de la semana; al tocar un músculo se filtran sus datos.
- **Cuerpo**: peso corporal (línea con media móvil de 7 días) y comparador de fotos de progreso (dos fechas lado a lado).
- **Hábitos**: % de días con todos los suplementos, % de días con alimentación bien, media de horas de sueño y % de días con estiramientos, con su evolución.
- **Calculadora de 1RM**: peso y reps dan el 1RM estimado y una tabla de porcentajes del 50 al 100 %.

### 5.10 Ajustes
- Nombre, tema (Automático, Claro, Oscuro) y unidad por defecto (kg o lb).
- Temporizador de descanso: mostrar sí/no (no por defecto) y duración por defecto.
- Suplementos: añadir, renombrar, reordenar y desactivar.
- Rutinas y programas archivados.
- Copia de seguridad: exportar todo (JSON con las fotos incluidas), importar (con validación y confirmación) y exportar a CSV (entrenos con series, carreras y registro diario). Usar el menú de compartir de iOS para guardar en Archivos o iCloud Drive.
- Cargar datos de ejemplo para probar las gráficas, y borrarlos después.
- Borrar todos los datos, con doble confirmación.
- Versión de la app.

## 6. Reglas de entrenamiento

- Series efectivas: normal, dropset y negativa. El calentamiento no cuenta en estadísticas ni récords.
- Dropset y rest-pause: cuentan como 1 serie. El volumen y los récords usan solo la primera parte; las bajadas y mini-series se guardan y se muestran, pero no suman volumen.
- v2: ejercicios con peso opcional o por tiempo: sin kg no suman volumen y el progreso y los récords se miden en reps o segundos.
- Negativa: cuenta como serie normal y se marca visualmente.
- Unidades: cada ejercicio va en kg o en lb, y sus gráficas y récords se muestran en su unidad. Los totales que mezclan ejercicios (volumen total y por músculo) se calculan en kg (1 lb = 0,45359237 kg). Si se cambia la unidad de un ejercicio con historial, preguntar si convertir los registros o solo cambiar la etiqueta.
- Los músculos secundarios cuentan como serie completa en series y volumen por grupo muscular.
- Unilaterales: el volumen suma ambos lados; récords y 1RM por lado; gráficas con dos líneas (Izq y Der).
- Semana de lunes a domingo. Fechas en hora local (Europe/Madrid), guardadas como YYYY-MM-DD.

## 7. Cálculos (funciones puras con tests)

- Volumen = suma de peso × reps de las series efectivas (en dropsets, solo la primera).
- 1RM estimado (Epley) = peso × (1 + reps / 30), usando series de 1 a 12 reps.
- Racha: semanas seguidas con al menos un entreno o carrera. La semana en curso no rompe la racha hasta que termina.
- Sugerencia "Sube peso" (v2): aparece cuando en la última sesión (que no sea de descarga) todas las series efectivas llegaron al tope del rango objetivo; en ejercicios sin kg dice "Tope alcanzado". Regla en un único archivo fácil de ajustar.
- Estancamiento: aviso si el mejor 1RM estimado no mejora en las últimas 4 sesiones y al menos 3 semanas (sin contar sesiones de descarga).
- Récords: nuevo máximo de peso, de 1RM estimado, de reps con un peso dado y de volumen en una sesión. Se detectan al marcar la serie.
- Ritmo = tiempo / km, en formato m:ss /km.
- Duración del entreno = tiempo activo, sin pausas.

## 8. Fuera de alcance

No incluir: calculadora de discos, objetivos semanales, recordatorios o notificaciones, bloqueo con Face ID, plantillas de programas (salvo el plan semanal de Dani de la v2), imágenes de ejercicios, entreno libre sin rutina, mantener la pantalla encendida, ni medidas corporales distintas del peso.

## 9. Datos

- Todo se guarda en el móvil (IndexedDB). Sin servidor.
- Las actualizaciones nunca borran datos. La URL de publicación no debe cambiar nunca, porque los datos van ligados a ella.
- Validar los archivos de copia antes de importarlos.

## 10. Pruebas

- Tests unitarios de: volumen, 1RM, dropsets, conversión lb/kg, unilaterales, rachas, sugerencia de subir peso, estancamiento, récords y ritmo.
- Pruebas en navegador a 390×844 de estos flujos: crear ejercicio, crear rutina, entreno completo con dropset, negativa, unilateral y superserie, cerrar y recuperar un entreno en curso, terminar con datos de cierre, registrar carrera, rellenar un día del calendario, exportar e importar una copia.
- Comprobar que es instalable y que funciona sin conexión tras la primera carga.

## 11. Publicación

- Crea un repositorio público llamado `forja` en mi cuenta de GitHub con `gh` (ya tengo la sesión iniciada; si no, guíame con `gh auth login`).
- Workflow de GitHub Actions que construye y publica en GitHub Pages en cada push a main. Activa Pages con origen "GitHub Actions" usando `gh api` si es posible; si no, dime exactamente dónde hacer clic.
- Dame la URL final (https://USUARIO.github.io/forja/) y comprueba que carga.
- README en español: qué es, cómo instalarla en el iPhone, cómo actualizarla y cómo hacer copias de seguridad.

## 12. Para compartir

Cualquier persona podrá instalarla desde el mismo enlace; sus datos quedan en su propio móvil. Por eso el nombre del saludo se pide en el primer uso.

## 13. Fases

1. Base: proyecto, PWA, sistema de diseño (tokens, tema, icono), navegación con las 5 pestañas, base de datos, primer uso y primera publicación en GitHub Pages.
2. Biblioteca de ejercicios, rutinas y programas.
3. Entreno en curso completo, cierre, resumen, imagen para compartir e historial con edición.
4. Calendario, registro diario (suplementos, alimentación, sueño, estiramientos, peso, fotos), racha y mapa de calor.
5. Running.
6. Estadísticas completas, figura muscular, récords y calculadora de 1RM.
7. Ajustes, copias de seguridad, CSV, datos de ejemplo, pulido visual final, pruebas completas y publicación final.

Empieza ahora por la fase 1.
## 14. Actualización v2 (resumen)

Detalle completo en [CAMBIOS-V2.md](CAMBIOS-V2.md).

- **Datos**: Dexie `version(2)`; antes de migrar se guarda una copia interna completa (tabla `snapshots`), restaurable desde Ajustes durante 30 días y borrada después. Copias JSON versión 2 (se aceptan las de la v1). Tests de migración y de carga del plan.
- **Plan semanal de Dani**: se carga una sola vez al abrir la v2 en un móvil con datos de la v1 (idempotente, marcado en Settings); reutiliza ejercicios por nombre normalizado y sinónimos; archiva las rutinas anteriores. En instalaciones nuevas: Ajustes → Plan semanal → "Cargar plan semanal".
- **Plan por días**: Ajustes → Plan semanal (rutina, carrera o descanso por día). Miércoles "Carrera zona 2 · 30-40 min" y sábado "Tirada larga zona 2 · 45-60 min".
- **Técnicas**: objetivo y descanso por ejercicio (en superseries, tras la pareja), DS con bajadas predefinidas, rest-pause, NEG, PAUSA, leyenda al tocar los chips.
- **Ejercicios por tiempo y peso opcional**: "Por lado" = unilateral.
- **Estiramientos** al final de la rutina de core, con check y temporizador opcional de 45 s; al completarlos se marca "estiramientos" en el día. Lista editable.
- **Semana de descarga**: mitad de series (redondeando hacia arriba), todas normales y sin técnicas; sesiones marcadas, fuera del estancamiento y de "Sube peso".
- **Running**: km de esta semana, de la anterior y máximo recomendado (+10 %).
- **Teclado**: ningún campo recibe el foco solo; las hojas se cierran tocando fuera, deslizando o con "Hecho" y ocultan el teclado; tocar fuera de un campo lo cierra.

## 15. Actualización v3 (resumen)

Detalle completo en [CAMBIOS-V3.md](CAMBIOS-V3.md).

- **Datos**: Dexie `version(3)` con el campo opcional `Workout.cardio`; copias JSON versión 3 (se aceptan las anteriores).
- **Teclado**: los campos de kg y reps mantienen el foco mientras se escribe; guardan con un pequeño retardo y, al momento, al salir del campo o pasar a segundo plano.
- **RIR**: fuera de la interfaz y del CSV; los valores guardados se conservan en la base y en la copia JSON.
- **Cardio**: se ve en el resumen, el historial (editable), la hoja del día, el calendario (punto rojo) y Estadísticas › Resumen (minutos por semana).
