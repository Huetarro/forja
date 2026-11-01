# Forja

App personal para apuntar entrenos de gimnasio y carreras, pensada para iPhone. Funciona sin conexión, no tiene cuentas ni publicidad y todos los datos se guardan solo en tu móvil.

**Enlace:** https://huetarro.github.io/forja/

## Instalarla en el iPhone

1. Abre el enlace de arriba en **Safari** (tiene que ser Safari).
2. Toca el botón **Compartir** (el cuadrado con la flecha hacia arriba, abajo en el centro).
3. Elige **Añadir a pantalla de inicio** y pulsa **Añadir**.
4. Abre Forja desde su icono, como cualquier otra app.

> Importante: usa siempre la app instalada. Lo que apuntes en una pestaña de Safari se guarda aparte y no aparecerá en la app.

Cualquier persona puede instalarla desde el mismo enlace. Cada una tiene sus datos en su propio móvil.

## Actualizarla

No tienes que hacer nada. Cuando haya una versión nueva, al abrir la app aparecerá arriba el aviso **“Nueva versión disponible · Actualizar”**. Tócalo y listo. Tus datos se conservan.

## Copias de seguridad

Tus datos viven solo en el móvil. Si borras la app o cambias de iPhone, se pierden salvo que tengas una copia.

- **Hacer una copia:** Ajustes → Copia de seguridad → Exportar. Se abre el menú de compartir: elige **Guardar en Archivos** (por ejemplo en iCloud Drive).
- **Recuperarla:** Ajustes → Copia de seguridad → Importar, y elige el archivo.
- La app te avisará si llevas más de 14 días sin hacer una copia.

## Para desarrolladores

```powershell
npm install
npm run dev        # desarrollo
npm run test       # tests unitarios
npm run test:e2e   # pruebas en navegador (390×844)
npm run build      # build de producción
```

Cada push a `main` se publica automáticamente en GitHub Pages. La especificación completa está en [docs/ESPECIFICACION.md](docs/ESPECIFICACION.md).
