# FORJA — Actualización v3: arreglos urgentes + rediseño «Cuaderno»

Antes de nada, lee CLAUDE.md, docs/ESPECIFICACION.md y docs/CAMBIOS-V2.md. Guarda este documento como docs/CAMBIOS-V3.md y, al terminar, actualiza la especificación y CLAUDE.md con lo que haya cambiado.

Hay tres fases. La fase 1 es urgente y se publica sola. La fase 2 termina en una parada obligatoria para que Dani apruebe el diseño. La fase 3 solo empieza tras su visto bueno.

## REGLA Nº 1: NO SE PUEDE PERDER NINGÚN DATO

Dani usa la app a diario en su iPhone, y sus datos viven en IndexedDB en el móvil: entrenos, series, volumen, peso corporal, alimentación, suplementos, sueño, estiramientos, fotos, carreras y estadísticas.

- Todo cambio de esquema va en una nueva versión de Dexie con migración. Nunca borrar tablas ni campos con datos.
- Tests de migración desde una base con datos de la versión actual. No publiques hasta que pasen.
- El rediseño es solo visual: no toca la base de datos.

---

## FASE 1 — Arreglos (urgente: publicar en cuanto estén)

### 1.1 Bug grave: los campos de kg y reps se cierran tras cada número

Al tocar el campo de reps o kg de una serie se abre el teclado numérico. Pero al pulsar el primer número, el campo pierde el foco y el teclado se cierra. Para escribir "12" hay que tocar, poner "1", volver a tocar y poner "2". Lo mismo con los kg ("50").

- Encuentra la causa real antes de arreglarlo. Sospechosos habituales:
  - el valor se guarda en Dexie en cada pulsación, useLiveQuery vuelve a renderizar la lista y la fila o el input se desmonta;
  - keys inestables (que dependen del valor, del índice al reordenar o de un id nuevo en cada render);
  - componentes definidos dentro de otro componente;
  - el arreglo de la v2 que cierra el teclado al tocar fuera (un blur o un listener de toque que salta al teclear).
- Solución esperada:
  - El input mantiene su valor en estado local mientras se escribe.
  - Se guarda en la base de datos al salir del campo, al pulsar Intro o con un debounce, sin que la fila se vuelva a montar.
  - Keys estables.
  - Nada quita el foco mientras se teclea.
- Decimales: el teclado decimal del iPhone en español escribe coma. "52,5" tiene que guardarse como 52.5, y también debe aceptarse el punto.
- Revisa todos los campos numéricos de la app con el mismo patrón: cierre del entreno, carreras, peso de hoy, sueño, etc.
- Test de navegador obligatorio a 390×844, con pulsaciones reales tecla a tecla:
  - escribir "12" en reps, "50" y "52,5" en kg, y "2" + "0" en una bajada de dropset;
  - comprobar que el foco no se pierde entre teclas y que el valor guardado es el correcto.

### 1.2 Quitar el RIR

Dani no usa el RIR. Elimínalo de toda la interfaz: filas de series, selector, ajustes, estadísticas y exportación CSV.

- Los valores de RIR ya guardados se quedan en la base de datos sin tocar; simplemente no se muestran.
- Comprueba que ninguna regla ("Sube peso", estancamiento) dependa todavía del RIR.

### 1.3 Cardio al final de cada entreno

- En el entreno en curso, al final de la lista de ejercicios y antes de "Terminar", añade un bloque "Cardio" con un interruptor "He hecho cardio".
- Al activarlo aparecen dos campos:
  - **Tiempo** (minutos, teclado numérico);
  - **Inclinación** (%, teclado decimal, de 0 a 30, admite 0,5).
- Ambos van prerrellenados en gris con los valores de la última vez, igual que las series.
- Se guarda con el entreno (nuevo campo opcional, con migración).
- Dónde se ve:
  - en el resumen final del entreno;
  - en el detalle del entreno en el historial, donde también se puede editar;
  - en la hoja del día del calendario.
- En Estadísticas › Resumen, una tarjeta discreta con los minutos de cardio por semana.

### 1.4 Punto rojo de cardio en el calendario

- Los días con cardio muestran un punto rojo. Usa el Rojo, tono 4 (#DC514D), de la paleta de DESIGN.md, ajustado para que se vea bien en oscuro.
- Añádelo a la leyenda ("Cardio").
- Comprueba que el color de running no se confunde con el rojo.
- El mapa de calor anual sigue igual.

### Cierre de la fase 1

1. Build, lint, tests (incluidos migración y el test tecla a tecla), commit y push para publicar.
2. Dame un resumen corto y lo que debo comprobar en el iPhone.
3. Después pasa a la fase 2 sin esperar.

---

## FASE 2 — Preparar el rediseño y enseñar propuestas (termina en PARADA)

### 2.1 Skills de diseño

- En la carpeta `diseno/` hay `impeccable.zip` y `emil-design-eng.zip`. Ya deberían estar descomprimidas en `.claude/skills/impeccable` y `.claude/skills/emil-design-eng`.
- Comprueba que están y que puedes usarlas. Si no lo están, descomprímelas ahí y dime en una línea que tengo que cerrar y abrir Claude Code para que se carguen.
- Añade `.claude/skills/` y `diseno/*.zip` a `.gitignore`, para no subirlos al repositorio público.

### 2.2 El sistema de diseño

- `DESIGN.md` (en la raíz) es el sistema de diseño «Cuaderno» y manda sobre cualquier otra indicación de estilo de este proyecto.
- Sustituye a la sección 3 «Diseño» de la especificación: se acabó el acento naranja; el único color de acción es el azul del sistema.
- Léelo entero y aplícalo con las skills **impeccable** (modo «Operate») y **emil-design-eng**. También puedes seguir usando frontend-design, pero si alguna skill contradice DESIGN.md, manda DESIGN.md.
- Referencia DESIGN.md desde CLAUDE.md.

### 2.3 Adaptación a una app de iPhone

DESIGN.md está pensado para una herramienta web de escritorio. Esto es lo que hay que adaptar; propónmelo en las imágenes, no lo decidas en silencio:

1. **Navegación:** la app es de iPhone con 5 pestañas. Mi propuesta es mantener la barra inferior, hecha con los materiales del sistema: translúcida con `saturate(180%) blur(20px)`, iconos de trazo 1,8, la pestaña activa en azul y zonas de 44 px. La cabecera de cada pantalla sigue DESIGN.md (h1 de 32 px en móvil, acciones en pastilla).
2. **Hojas:** en el iPhone, las hojas suben desde abajo, con el aspecto de `.hoja` (radio, `--raised`, `--sombra-pop`) y la animación de DESIGN.md adaptada a una entrada desde abajo.
3. **Tipografía:** sin conexión no hay Google Fonts. Instala `@fontsource-variable/inter` e inclúyela en el build para los equipos que no son de Apple. En el iPhone se usa SF Pro con la clase `.apple`.
4. **Colores de contenido:** los colores de rutinas, running, cardio y categorías salen de la paleta 10 × 6 de DESIGN.md, nunca de la interfaz. Asigna a las rutinas actuales colores de la paleta, conservando en lo posible el que ya tenían.
5. **Iconos:** todos de trazo, 24×24, trazo 1,8, extremos redondeados, en azul o gris. Redibuja en ese estilo los iconos anatómicos de las rutinas (pecho, espalda, pierna, torso, abdomen) para que sean claramente reconocibles.
6. **Icono de la app:** rehazlo en el nuevo estilo, sin degradados: una mancuerna de trazo limpio. Mantén los tamaños de PWA.
7. **Gesto propio:** DESIGN.md pide un gesto característico hecho con sus materiales (en el Cuaderno es la regla de tiempo). Busca el equivalente para Forja. Una posibilidad es una `.pista` en el entreno con las series hechas y pendientes a escala de grises, o el volumen semanal por músculo; tú decides cuál encaja mejor.
8. **Gráficas (Recharts):** ejes, rejillas y tooltips en grises del sistema; las series de datos en la paleta de contenido; números tabulares.

### 2.4 Propuestas y PARADA

Antes de rediseñar, enséñame 3 imágenes de propuesta:

1. Inicio en claro.
2. Entreno en curso en claro, con una serie con dropset desplegado y el bloque de cardio.
3. La misma pantalla de entreno en oscuro.

Si dudas en algo importante (por ejemplo, la navegación), haz además una variante.

- Hazlas como capturas reales de la app con datos de ejemplo, a 390×844 y deviceScaleFactor 2.
- Guárdalas en la carpeta `propuestas/` (no la subas a git) y ábrelas en mi PC con `start propuestas\nombre.png` para que las vea.
- Explícame en pocas líneas qué has decidido en cada punto de la sección 2.3.
- **PARA y espera mi visto bueno.** No empieces la fase 3 hasta que te diga que sí o te pida cambios.

---

## FASE 3 — Rediseño completo (solo tras la aprobación)

- Aplica el sistema a TODAS las pantallas: primer uso, Inicio, rutinas, programas, biblioteca, ficha de ejercicio, entreno en curso, cierre y resumen, imagen para compartir, historial, calendario y hoja del día, Running, Estadísticas (todas las pestañas), Ajustes, avisos, estados vacíos, errores y la pantalla de "Añadir a pantalla de inicio".
- Copia los tokens y el CSS de la sección 6 de DESIGN.md y conéctalos con Tailwind para tener una sola fuente de verdad. Elimina los tokens antiguos (naranja, etc.).
- Movimiento según la sección 7 y calidad según la sección 8: todos los estados de cada elemento, contraste AA, 44 px, sin desplazamiento horizontal y sin nada de la lista de prohibidos.
- Textos en castellano llano, según la sección 10.
- No cambies funcionalidad ni datos, salvo lo que exija el diseño.
- Revisa en tandas, como dice DESIGN.md:
  1. Construye todo.
  2. Haz una ronda de capturas a 390×844 en claro y oscuro de todas las pantallas.
  3. Corrige todo de una vez.
  4. Confirma con una ronda más, como mucho.
- Repite los tests de la fase 1, incluido el de teclear tecla a tecla, porque el rediseño no puede romperlo.
- Build, lint, tests, commit y push para publicar.
- Al terminar:
  - un resumen corto;
  - lo que debo comprobar en el iPhone;
  - una línea con las skills que has usado.
