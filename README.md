# Forja

App personal para apuntar entrenos de gimnasio y carreras, pensada para iPhone. Funciona sin conexión, no tiene cuentas ni publicidad y todos los datos se guardan solo en tu móvil.

**Enlace:** https://huetarro.github.io/forja/

## Instalarla en el iPhone

1. Abre el enlace de arriba en **Safari** (tiene que ser Safari).
2. Toca el botón **Compartir** (el cuadrado con la flecha hacia arriba, abajo en el centro).
3. Elige **Añadir a pantalla de inicio** y pulsa **Añadir**.
4. Abre Forja desde su icono, como cualquier otra app.

> Importante: usa siempre la app instalada. Lo que apuntes en una pestaña de Safari se guarda aparte y no aparecerá en la app.

Cualquier persona puede instalarla desde el mismo enlace. Cada una tiene sus datos en su propio móvil, y el nombre del saludo se elige al abrirla por primera vez.

## Qué hace

- **Rutinas y programas** con tus propios ejercicios (músculo, material, kg o lb, unilateral, notas fijas), superseries y tipos de serie (normal, calentamiento, dropset, negativa).
- **Entreno en curso** con cronómetro, la serie anterior a la vista, aviso de "Sube peso", récords, temporizador de descanso opcional y resumen final con imagen para compartir.
- **Calendario** con registro diario: descanso, suplementos, alimentación, sueño, estiramientos, peso, fotos y notas; racha semanal y mapa de calor.
- **Running** con ritmo, récords y gráficas.
- **Estadísticas** de ejercicios (1RM estimado, récords, estancamiento), músculos (figura del cuerpo), peso y hábitos, y calculadora de 1RM.

## Actualizarla

No tienes que hacer nada. Cuando haya una versión nueva, al abrir la app aparecerá arriba el aviso **“Nueva versión disponible · Actualizar”**. Tócalo y listo. Tus datos se conservan.

## Copias de seguridad

Tus datos viven solo en el móvil. Si borras la app o cambias de iPhone, se pierden salvo que tengas una copia. iOS también puede borrar los datos de una web app que lleva semanas sin abrirse.

- **Hacer una copia:** Ajustes → Copia de seguridad → **Exportar copia**. Se abre el menú de compartir: elige **Guardar en Archivos** (por ejemplo, en iCloud Drive). La copia incluye las fotos.
- **Recuperarla:** Ajustes → Copia de seguridad → **Importar copia** y elige el archivo. Antes de sustituir nada te pide confirmación.
- **Hoja de cálculo:** **Exportar a CSV** genera tres archivos (entrenos con series, carreras y registro diario).
- La app te avisa en Inicio si llevas más de 14 días sin hacer una copia.

## Limitaciones de iPhone

- El temporizador de descanso solo avisa (con sonido y en pantalla) mientras la app está abierta; iOS no permite avisos con la app cerrada ni vibración desde una web app.
- La orientación vertical no siempre se puede forzar; si giras el móvil, la app sigue funcionando.

## Para desarrolladores

```powershell
npm install
npm run dev        # desarrollo
npm run test       # tests unitarios
npm run test:e2e   # pruebas en navegador (390×844)
npm run check      # todo lo anterior + formato, lint y build; se para al primer fallo
```

Cada push a `main` se publica automáticamente en GitHub Pages. La especificación completa está en [docs/ESPECIFICACION.md](docs/ESPECIFICACION.md) y la guía técnica en [CLAUDE.md](CLAUDE.md).
