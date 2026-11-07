# FORJA — Actualización v2

Antes de nada, lee CLAUDE.md y docs/ESPECIFICACION.md. Este documento añade y cambia cosas de esa especificación. Guárdalo como docs/CAMBIOS-V2.md y, al terminar, actualiza la especificación y CLAUDE.md con lo que haya cambiado.

## REGLA Nº 1: NO SE PUEDE PERDER NINGÚN DATO

Dani lleva una semana usando la app en su iPhone. Sus datos viven en IndexedDB en el móvil: entrenos, series, volumen, peso corporal, alimentación, suplementos, sueño, estiramientos, fotos, carreras y estadísticas. Nada de eso puede perderse.

- Todo cambio de esquema va en una nueva versión de Dexie con una migración que conserve y transforme los datos. Nunca borrar tablas, vaciar la base ni recrearla.
- Antes de migrar, la app guarda automáticamente una copia interna de todos los datos en IndexedDB. En Ajustes aparece "Restaurar copia anterior a la v2" durante 30 días.
- Tests de migración: base con datos de la versión actual (entrenos, series con dropsets, pesos, fotos, registro diario, carreras) → actualizar → comprobar que todo sigue intacto.
- No publiques hasta que esos tests pasen.

## 1. Cargar el plan de entrenamiento en la app

Las rutinas deben aparecer ya creadas en el iPhone de Dani al actualizar. Como sus datos están en el móvil, hazlo con una carga de datos de un solo uso que se ejecute al abrir la nueva versión:

- Idempotente: se marca en Settings que el plan v2 está cargado y no se vuelve a insertar.
- Reutiliza los ejercicios que ya existan en la biblioteca, comparando nombres sin mayúsculas, tildes ni espacios sobrantes y con sinónimos obvios (por ejemplo "Jalón al pecho" = "Jalón pecho"). Solo crea los que falten, para conservar su historial.
- Crea un programa "Plan semanal" con estas rutinas. Las rutinas que Dani ya tenía se archivan (no se borran) con su historial intacto.
- Asigna a los ejercicios nuevos músculo principal, secundarios, material, unilateral y unidad kg razonables. Dani los podrá editar.
- Ejercicios compartidos entre días = el mismo ejercicio, con el mismo historial: Press inclinado en Smith (lunes y viernes), Remo Gironda (martes y viernes), Aperturas en polea (lunes y viernes), Curl en máquina (martes y viernes) y Extensión de tríceps en polea sobre la cabeza (lunes y viernes).
- Son ejercicios distintos: "Jalón al pecho" y "Jalón al pecho agarre neutro"; "Elevaciones laterales" (mancuernas) y "Elevaciones laterales en polea".
- Añade un test que cargue el plan sobre una base con datos y compruebe el resultado.

El plan, tal como lo escribió Dani:

LEYENDA
DS = Dropset: al fallo, bajas un 20-30% del peso y sigues sin descanso hasta el fallo
DS x2 = Dos bajadas de peso seguidas
RP = Rest-pause: al fallo, descansas 15 s y sacas reps extra; repítelo 2 veces
NEG = Negativa lenta: bajada de 3-4 s en todas las reps
PAUSA = 1-2 s apretando en la contracción
Todas las series: 1-2 reps en reserva, salvo la última con técnica (al fallo)

LUNES – EMPUJE
1. Press en máquina – 4x6-10 – desc. 2:30
2. Press inclinado en Smith – 3x8-10 – desc. 2:00 – NEG
3. Aperturas en polea – 3x12-15 – desc. 1:30 – última serie DS
4. Elevaciones laterales – 4x12-15 – desc. 1:00 – última serie DS x2
5. Extensión tríceps polea abajo – 3x10-12 – desc. 1:30 – última serie RP
6. Extensión tríceps polea sobre cabeza – 3x10-12 – desc. 1:30

MARTES – TIRÓN
1. Jalón al pecho – 4x8-10 – desc. 2:00 – NEG
2. Remo Gironda – 3x8-12 – desc. 2:00 – PAUSA
3. Remo en T – 3x8-10 – desc. 2:00
4. Face pull – 3x12-15 – desc. 1:00 – PAUSA
5. Curl en máquina – 3x10-12 – desc. 1:30 – última serie DS
6. Curl martillo – 3x10-12 – desc. 1:30

MIÉRCOLES – CARRERA
30-40 min en zona 2 (ritmo conversacional)

JUEVES – PIERNA
1. Prensa – 4x8-12 – desc. 2:30 – NEG
2. Extensión de cuádriceps – 3x12-15 – desc. 1:30 – última serie DS x2
3. Femoral sentado – 3x10-12 – desc. 1:30 – NEG
4. Femoral tumbado – 3x10-12 – desc. 1:30 – última serie RP
5. Aductor en máquina – 2x12-15 – desc. 1:00
6. Gemelo – 3x10-15 – desc. 1:00 – PAUSA abajo 2 s (estirado)

VIERNES – TORSO COMPLETO
1. Press inclinado en Smith – 3x8-10 – desc. 2:00
2. Remo Gironda – 3x10-12 – desc. 2:00
3. Aperturas en polea – 2x12-15 – desc. 1:30 – última serie DS
4. Jalón al pecho agarre neutro – 2x10-12 – desc. 1:30
5. Elevaciones laterales en polea – 3x12-15 – desc. 1:00 – última serie DS
6. SUPERSERIE: Curl en máquina + Extensión tríceps sobre cabeza – 3x10-12 – desc. 1:30 tras la pareja

SÁBADO – TIRADA LARGA
45-60 min en zona 2 (sube máx. 10% de km por semana)

DOMINGO – CORE + ESTIRAMIENTOS
1. Rueda abdominal – 3x8-10 – desc. 1:00
2. Elevación de piernas colgado – 3x10-12 – desc. 1:00
3. Crunch en polea alta – 3x12-15 – desc. 1:00 – última serie DS
4. Pallof press – 3x12 por lado – desc. 0:45
5. Plancha lateral – 2x30-45 s por lado – desc. 0:45
6. Dead bug – 2x10 por lado – desc. 0:45
Estiramientos (45 s cada uno): flexor de cadera, isquios, paloma, gemelo, cuádriceps, pecho en puerta, dorsal colgado, rotaciones torácicas

PROGRESIÓN
Cuando completes el tope de reps en todas las series, sube peso.
Cada 6-8 semanas: semana de descarga (mitad de series, sin técnicas).

## 2. Funciones nuevas que necesita este plan

1. **Objetivo y descanso por ejercicio en la rutina.** Rango de reps (ej. 6-10) o de segundos (ej. 30-45 s) y descanso (ej. 2:30), editables. Se ven en la rutina y en el entreno de forma discreta, por ejemplo "6-10 reps · desc. 2:30". En superseries, el descanso va después de la pareja.
2. **Dropset con bajadas predefinidas.** En la rutina se define qué serie es dropset y cuántas bajadas tiene: DS = 1 bajada, DS x2 = 2. Al entrenar, esas bajadas aparecen ya desplegadas; se pueden añadir más.
3. **Nuevo tipo de serie: Rest-pause (RP).** Al marcarlo se despliegan mini-series (2 por defecto) con reps y peso (igual al de la serie por defecto), con la indicación "descansa 15 s". Cuenta como 1 serie; el volumen y los récords usan solo la primera parte, igual que el dropset.
4. **Negativa (NEG).** Si aplica al ejercicio entero, todas sus series van marcadas como negativa.
5. **Pausa (PAUSA).** Técnica a nivel de ejercicio, visible como chip con su detalle (por ejemplo "pausa abajo 2 s, estirado").
6. **Leyenda dentro de la app.** Al tocar cualquier chip (DS, DS x2, RP, NEG, PAUSA) se abre una hoja breve con su explicación tal como está en la leyenda. Mostrar también, de forma discreta en el entreno: "1-2 reps en reserva, salvo la última con técnica (al fallo)".
7. **Ejercicios por tiempo.** Tipo de registro "segundos" en lugar de reps (plancha lateral). Gráficas y récords en segundos.
8. **"Por lado".** Los ejercicios con "por lado" son unilaterales (Izq y Der).
9. **Peso corporal como carga.** En rueda abdominal, elevación de piernas, plancha y dead bug, el kg es opcional. Si no hay kg, el progreso y los récords se miden por reps o segundos y no suman volumen.
10. **Nueva regla "Sube peso"** (sustituye a la anterior). Aparece cuando en la última sesión todas las series efectivas llegaron al tope del rango. En ejercicios sin kg, el aviso dice "Tope alcanzado".
11. **Plan semanal por días** (sustituye a la rotación). Cada día de la semana tiene una rutina, una carrera o descanso, editable en Ajustes → Plan semanal. "Te toca hoy" en Inicio usa el día de la semana. Miércoles: "Carrera zona 2 · 30-40 min". Sábado: "Tirada larga zona 2 · 45-60 min". Esos días la tarjeta muestra el objetivo y el botón "Registrar carrera" con el tipo ya puesto (Rodaje o Tirada larga).
12. **Estiramientos del domingo.** La rutina de core termina con una lista de estiramientos con check y un temporizador opcional de 45 s cada uno: flexor de cadera, isquios, paloma, gemelo, cuádriceps, pecho en puerta, dorsal colgado y rotaciones torácicas. Al completarla, se marca solo "estiramientos" en el registro del día. Lista editable.
13. **Semana de descarga.** Interruptor "Semana de descarga". Mientras está activo, los entrenos usan la mitad de series (redondeando hacia arriba) y todas normales, sin técnicas. Esas sesiones quedan marcadas como descarga y no cuentan para el estancamiento ni para "Sube peso". Inicio muestra con discreción "X semanas desde la última descarga" y lo destaca a partir de la semana 6. Sin notificaciones.
14. **Running.** En la pestaña Running, km de esta semana frente a la anterior y el máximo recomendado (+10 % sobre la semana anterior).

## 3. Peso corporal

- Quitar el peso corporal del formulario de cierre del entreno.
- Inicio: tarjeta fija "Peso de hoy" con el último peso y su tendencia. Al tocarla se apunta el de hoy en dos toques. Si ya hay peso hoy, se ve y se puede editar.
- Se sigue pudiendo apuntar desde el día del calendario.
- Todos los pesos guardados se conservan. Si alguno se guardó solo dentro de un entreno, migrarlo al registro de ese día.

## 4. El teclado se abre solo

Ahora, al abrir muchas hojas o pantallas, un campo recibe el foco automáticamente y se abre el teclado del iPhone, que Dani tiene que bajar para poder seguir. Corrígelo en toda la app:

- Elimina todos los autoFocus y llamadas automáticas a .focus() (busca en todo el código). El teclado solo se abre cuando Dani toca un campo.
- Las hojas inferiores se cierran tocando fuera, deslizando hacia abajo o con un botón "Hecho", y al cerrarse ocultan el teclado.
- Tocar fuera de un campo cierra el teclado.
- Revisa todas las pantallas en el navegador a 390×844 para confirmar que ninguna abre el teclado sola.

## 5. Cómo trabajar

1. Haz un plan y luego impleméntalo en fases pequeñas.
2. En cada fase: build sin errores, lint y tests en verde (incluidos los de migración), commit y push para publicar.
3. Revisa con la skill webapp-testing a 390×844, en claro y oscuro, los flujos: actualizar desde una base con datos de la v1, hacer un entreno del lunes con DS x2 y RP, uno del viernes con la superserie, el domingo con plancha lateral por tiempo y estiramientos, apuntar el peso de hoy desde Inicio y activar la semana de descarga.
4. Al acabar, dame un resumen corto y una lista de lo que Dani debe comprobar en su iPhone después de actualizar.