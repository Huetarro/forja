# Estilo «Cuaderno»: sistema de diseño

Todo lo que diseñes o programes en esta conversación tiene que seguir este sistema visual al pie de la letra: apps, herramientas web, páginas, artefactos y prototipos. Es el sistema de la app «Cuaderno de clases», que lleva el lenguaje de apple.com a una herramienta de trabajo. Se basa en un fondo gris pergamino, superficies blancas agrupadas como en iOS, un único azul para todo lo que se pulsa y casi ninguna sombra.

El estilo está cerrado. Trátalo como el brief y el DESIGN.md del proyecto. No lo cambies por gusto ni añadas colores de marca, degradados u otra tipografía. Si una skill te sugiere otra cosa, manda este texto. Si trabajas con archivos, guárdalo como DESIGN.md del proyecto.

## 1. Primero, las skills

El estilo se hizo con dos skills de diseño. Comprueba si las tienes en tu lista de skills:

- **impeccable**, de Paul Bakaus (licencia Apache 2.0). Te hace trabajar como un director de diseño.
  - En una app usa el modo «Operate»: la tarea va antes que la expresión y los controles son los estándar.
  - Pone un suelo de calidad: contraste, estados, foco y textos.
  - Trae una lista de tics de las interfaces hechas por IA que hay que evitar.
  - Fija el método: construir entero, revisar una vez y parar.
- **emil-design-eng**, de Emil Kowalski (licencia MIT). Decide cuándo y cómo se anima: curvas propias, duraciones cortas, botones que encogen un poco al pulsarlos y nada que aparezca de la nada.

Si te falta alguna, avísame antes de empezar y explícame cómo instalarla:

1. En Claude (web o escritorio), activa Ajustes › Capacidades › «Ejecución de código y creación de archivos». En la versión nueva se llama «Crear y editar archivos».
2. Ve a Personalizar › Skills (Customize › Skills), pulsa «+» › «Crear skill» › «Subir una skill» y sube el ZIP de cada una sin descomprimirlo.
3. Quien te ha pasado este prompt puede darte los ZIP listos para subir: impeccable.zip y emil-design-eng.zip. Las fuentes originales son:
   - impeccable: github.com/pbakaus/impeccable (impeccable.style). En Claude Code se instala con `/plugin marketplace add pbakaus/impeccable`.
   - emil-design-eng: emilkowal.ski/skill (github.com/emilkowalski/skill). En Claude Code se instala con `npx skills add emilkowalski/skill`.
4. En las cuentas de empresa, puede que un administrador tenga que permitir las skills propias.

Si no puedo instalarlas ahora, no te pares: aplica el resumen de sus reglas de las secciones 7 y 8 y avísame en una línea. Es normal que impeccable diga que no puede cargar su contexto, porque la versión para subir no trae su lanzador. En ese caso, usa este texto como su PRODUCT.md y DESIGN.md.

No uses la skill «apple-ui-skills» del repositorio ihlamury/design-skills. Se sacó automáticamente de apple.com y sus valores están equivocados: un azul #155BD0 que Apple no usa, texto gris #808080 y cuerpo de 27px.

## 2. De dónde sale: la investigación sobre el diseño de Apple

La referencia es el DESIGN.md de Apple de la colección awesome-design-md, de VoltAgent (getdesign.md/apple/design-md). Es un análisis no oficial de la web de Apple. Si tienes acceso a internet puedes leerlo, pero donde no coincida con este texto, manda este texto. De él tomamos:

- Un solo color de acción:
  - #0066cc para todo lo que se pulsa;
  - #0071e3 para el anillo de foco;
  - #2997ff sobre fondo oscuro.
- Texto casi negro #1d1d1f sobre gris pergamino #f5f5f7, y nunca negro puro sobre blanco.
- La fuente es SF Pro. Fuera de Apple usamos Inter, que es su sustituta más fiel.
- El cuerpo va a 17px con un interlineado de 1,47. El tracking es más negativo cuanto más grande es el texto.
- Los titulares van en semibold (600).
- Los botones tienen forma de pastilla.
- No hay sombras en tarjetas, botones ni texto. Apple solo pone sombra a sus fotos de producto; aquí la reservamos para lo que flota.
- No hay degradados decorativos.
- Las barras fijas son translúcidas y van desenfocadas con `saturate(180%) blur(20px)`.
- Hay mucho aire, una rejilla de 8px y zonas táctiles de 44px.
- Nuestras escalas parten de las suyas: radios de 5, 8, 11 y 18px más la pastilla, y espacios de 4, 8, 12, 17, 24, 32, 48 y 80px.

Lo que no sirve tal cual es que el archivo describe una web de marketing, con fotos de producto, titulares enormes y bandas claras y oscuras a sangre. Le faltan formularios, errores, estados al pasar el ratón y el modo oscuro de una app. Para una herramienta lo completamos con patrones de iOS y macOS:

- grupos blancos sobre gris;
- rellenos translúcidos del sistema;
- menús que se iluminan en azul;
- los colores oscuros del sistema.

También revisamos la skill raintree-technology/apple-hig-skills, pero es para apps nativas de iOS y macOS, no para la web.

## 3. Qué hace que se reconozca

- Fondo pergamino y superficies blancas sin borde ni sombra. La jerarquía se marca con el espacio, el tamaño y el peso, no con cajas.
- Las listas son grupos blancos como los de iOS: radio de 14px, filas de al menos 56px y separadores finos que empiezan después del icono.
- Solo es azul lo que se pulsa: botones principales, enlaces, iconos de acción, foco y selección.
- Todo lo que se pulsa es una pastilla: botones, controles segmentados, buscadores, chips y avisos. Los botones de icono son círculos.
- Los rellenos translúcidos de iOS, como `rgba(118,118,128,.12)`, se usan en botones secundarios, chips, pistas y estados al pasar el ratón.
- Solo tiene sombra lo que flota: menús, hojas, avisos, la barra flotante y lo que se arrastra.
- La barra superior es fija, mide 52px y es translúcida con desenfoque. La navegación es un control segmentado.
- Tamaños de letra:
  - 17px para leer;
  - 14px para los controles;
  - 12px para etiquetas y datos.
  Las etiquetas van en gris y encima de su campo.
- Los campos aparecen solo cuando hacen falta. Los títulos se editan en su sitio y no tienen borde hasta que pasas el ratón. Los detalles se despliegan debajo de su fila.
- La interfaz es gris y azul. El color de los contenidos (categorías, etiquetas, marcas) sale de una paleta fija de 10 familias × 6 tonos (sección 5).
- Las marcas en el texto parecen pasadas con subrayador: son translúcidas y tienen los extremos redondeados de forma irregular.
- Lo nuevo aparece y destella en azul suave. Lo que se borra se desvanece, y el aviso ofrece «Deshacer».
- Los iconos son de trazo, dibujados en 24×24, con trazo de 1,8 y extremos redondeados. Se muestran a 16–20px, en azul o en gris. No se usan emojis ni iconos de colores.
- El modo oscuro es automático y usa los colores de sistema de Apple. Se respeta «reducir movimiento».
- Lo que pinta el navegador también lleva el estilo: el color de selección, el cursor de texto, la barra de desplazamiento, el anillo de foco, el subrayado de los enlaces y los números tabulares.
- Cada herramienta tiene un gesto propio hecho con estos mismos materiales. En el Cuaderno es la regla de tiempo: una pista de 32px con los bloques a escala en grises, del negro al gris claro, y el exceso rayado en rojo. Busca el equivalente para lo que construyas.

## 4. Tipografía y composición

| Uso | Tamaño | Peso | Interlineado | Tracking |
|---|---|---|---|---|
| Titular de bienvenida | 56px | 600 | 1,07 | −0,035em |
| h1 de cada pantalla | 40px (32 en móvil) | 600 | 1,1 | −0,03em |
| h2 | 28px | 600 | 1,14 | −0,022em |
| h3 y título de hoja | 21px | 600 | 1,19 | −0,016em |
| Texto | 17px | 400 | 1,47 | −0,022em |
| Controles y notas | 14px | 400 (600 en datos) | 1,2–1,4 | −0,016em |
| Etiquetas y metadatos | 12px | 400 o 600 | 1,25 | −0,01em |

- Los títulos van siempre en 600, nunca en 500 ni en 700. La negrita dentro de un texto va en 650.
- Las cifras llevan `font-variant-numeric: tabular-nums`.
- Los títulos llevan `text-wrap: balance` y los párrafos, `pretty`. Las líneas no pasan de 62 a 75 caracteres.
- La letra es Inter variable con eje óptico, cargada de Google Fonts y con `font-optical-sizing: auto`:
  `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap">`
  Si el archivo tiene que funcionar sin conexión, incrusta en base64 los woff2 de @fontsource-variable/inter (inter-latin-opsz-normal e inter-latin-opsz-italic).
- En Mac, iPhone e iPad se usa la letra del sistema (SF Pro). Para ello, añade esto en el `<head>`: `<script>if(/Mac|iPhone|iPad|iPod/.test(navigator.platform||'')||/Mac OS X/.test(navigator.userAgent))document.documentElement.classList.add('apple')</script>`
- Composición:
  - el contenedor mide 1320px como máximo, con márgenes de 24px (16px por debajo de 760px) y 40px arriba;
  - en la cabecera de cada pantalla, el h1 va a la izquierda y las acciones (pastillas) a la derecha, alineadas abajo, con 40px hasta el contenido;
  - las migas de pan van encima del título, en gris de 14px y con los enlaces en azul;
  - entre secciones hay 40–56px, entre tarjetas 12px y dentro de una bandeja 6px;
  - los ajustes van en una columna de 720px como máximo, y cada sección lleva un h2 de 21px, una nota gris y un grupo;
  - las rejillas usan `repeat(auto-fill, minmax(min(100%,300px),1fr))`;
  - las fichas de detalle tienen una columna de datos fija de 360px y el contenido al lado.

## 5. El color de los contenidos

Son diez familias de seis tonos, del más claro (1) al más oscuro (6). Se generan en OKLCH con la misma luminosidad en cada paso, para que todas las familias pesen lo mismo a la vista:

- L (luminosidad): .90, .82, .72, .62, .52 y .42.
- C (croma): .065, .115, .155, .175, .16 y .13. En el gris es siempre .012.
- h (tono):

| Familia | h |
|---|---|
| Rojo | 25 |
| Naranja | 50 |
| Ámbar | 80 |
| Verde | 145 |
| Turquesa | 190 |
| Azul | 250 |
| Índigo | 278 |
| Morado | 308 |
| Rosa | 352 |
| Gris | 265 |

| Familia | 1 | 2 | 3 | 4 | 5 | 6 |
|---|---|---|---|---|---|---|
| Rojo | #FED2CD | #FEABA4 | #F67972 | #DC514D | #B33736 | #862726 |
| Naranja | #FED4BD | #FEAF82 | #F08440 | #D06203 | #A44C03 | #7B3702 |
| Ámbar | #F5DAAE | #EBBC69 | #D59801 | #AE7C06 | #896105 | #654702 |
| Verde | #C4EAC4 | #94D896 | #5EBD64 | #2AA03A | #097F23 | #045E17 |
| Turquesa | #ACECE7 | #58DCD5 | #0CBDB6 | #009A94 | #097974 | #025956 |
| Azul | #C6E1FE | #96C9FF | #51A9FF | #0289EA | #036BB9 | #014F8A |
| Índigo | #D6DCFE | #B6BFFE | #9099FF | #7076EC | #575AC2 | #3F4192 |
| Morado | #EAD4FF | #D9B0FE | #C088EF | #A363D6 | #8349AE | #613482 |
| Rosa | #FECFE2 | #FEA5CC | #EC78AF | #D15091 | #A93772 | #7E2754 |
| Gris | #DADEE6 | #C0C4CC | #A1A5AC | #83868E | #656970 | #4A4D54 |

- La paleta es solo para los contenidos (categorías, etiquetas y tipos de marca), nunca para la interfaz.
- El tono por defecto es el 4. El selector es una rejilla de 10 × 6 círculos de 26px.
- Sobre un color, el texto es #1d1d1f si la luminancia relativa del color pasa de 0,205; si no, es blanco.
- El chip de categoría lleva de fondo el color al 16 % sobre la superficie y de texto el mismo tono con L ≤ .45. En oscuro, el fondo va al 26 % y el texto con L ≥ .84.
- El subrayador usa el color al 48 %. En oscuro, con L ≤ .58 y al 62 %.

## 6. El sistema en CSS (cópialo tal cual)

```css
/* ── Tokens ── */
:root{
  color-scheme:light;
  --bg:#f5f5f7; --surface:#ffffff; --surface-2:#fafafc; --raised:#ffffff; --tray:#e8e8ed;
  --fill:rgba(118,118,128,.12); --fill-2:rgba(118,118,128,.2); --thumb:#ffffff;
  --ink:#1d1d1f; --ink-2:#6e6e73; --line:rgba(0,0,0,.08); --line-2:rgba(0,0,0,.16);
  --accent:#0066cc; --btn:#0066cc; --btn-hover:#0077ed; --focus:#0071e3; --accent-soft:rgba(0,113,227,.12);
  --danger:#d70015; --danger-soft:rgba(215,0,21,.08); --ok:#1d8a3b; --ok-soft:rgba(29,138,59,.1);
  --bar:rgba(245,245,247,.8); --hud:rgba(255,255,255,.9); --sel:rgba(0,113,227,.22);
  --sombra-pop:0 12px 32px rgba(0,0,0,.14),0 2px 8px rgba(0,0,0,.06),0 0 0 .5px rgba(0,0,0,.06);
  --sombra-lift:0 18px 40px rgba(0,0,0,.18),0 3px 10px rgba(0,0,0,.08);
  /* Grises de bloque, del más marcado al más suave. Tinta encima: var(--bg) en 1-4 y var(--ink) en 5-8 */
  --tono-1:#1d1d1f; --tono-2:#3a3a3c; --tono-3:#4f4f53; --tono-4:#6e6e73;
  --tono-5:#8e8e93; --tono-6:#aeaeb2; --tono-7:#c7c7cc; --tono-8:#dcdce1;
  --font:"Inter","Segoe UI",system-ui,sans-serif; --font-display:var(--font);
  --r-sm:8px; --r-md:12px; --r-lista:14px; --r-lg:18px; --r-bandeja:22px;
  --gutter:24px; --ease:cubic-bezier(.23,1,.32,1);
}
:root.apple{
  --font:-apple-system,BlinkMacSystemFont,"SF Pro Text",system-ui,sans-serif;
  --font-display:-apple-system,BlinkMacSystemFont,"SF Pro Display",system-ui,sans-serif;
}
/* Oscuro automático. Si hay selector de tema (o es un artefacto de Claude), repite este bloque en :root[data-theme="dark"] */
@media (prefers-color-scheme:dark){ :root:not([data-theme="light"]){
  color-scheme:dark;
  --bg:#000000; --surface:#1c1c1e; --surface-2:#232325; --raised:#2c2c2e; --tray:#141416;
  --fill:rgba(118,118,128,.24); --fill-2:rgba(118,118,128,.36); --thumb:#636366;
  --ink:#f5f5f7; --ink-2:#98989d; --line:rgba(255,255,255,.1); --line-2:rgba(255,255,255,.2);
  --accent:#2997ff; --btn:#0071e3; --btn-hover:#0a84ff; --focus:#0a84ff; --accent-soft:rgba(10,132,255,.24);
  --danger:#ff453a; --danger-soft:rgba(255,69,58,.16); --ok:#30d158; --ok-soft:rgba(48,209,88,.16);
  --bar:rgba(22,22,23,.8); --hud:rgba(44,44,46,.92); --sel:rgba(10,132,255,.4);
  --sombra-pop:0 12px 32px rgba(0,0,0,.6),0 0 0 .5px rgba(255,255,255,.12);
  --sombra-lift:0 18px 40px rgba(0,0,0,.7),0 0 0 .5px rgba(255,255,255,.14);
  --tono-1:#f5f5f7; --tono-2:#d1d1d6; --tono-3:#aeaeb2; --tono-4:#8e8e93;
  --tono-5:#6e6e73; --tono-6:#545458; --tono-7:#3a3a3c; --tono-8:#2c2c2e;
}}

/* ── Base ── */
*,*::before,*::after{box-sizing:border-box}
html{background:var(--bg);scrollbar-color:var(--fill-2) transparent;-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--ink);font:400 17px/1.47 var(--font);letter-spacing:-.022em;
  font-optical-sizing:auto;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;caret-color:var(--accent)}
button,input,select,textarea{font:inherit;color:inherit;letter-spacing:inherit}
button{cursor:pointer;-webkit-tap-highlight-color:transparent}
::selection{background:var(--sel)}
::placeholder{color:var(--ink-2);opacity:1}
:focus-visible{outline:2px solid var(--focus);outline-offset:2px}
h1,h2,h3,p{margin:0}
h1,h2,h3{font-family:var(--font-display);font-weight:600;text-wrap:balance}
h1{font-size:40px;line-height:1.1;letter-spacing:-.03em}
h2{font-size:28px;line-height:1.14;letter-spacing:-.022em}
h3{font-size:21px;line-height:1.19;letter-spacing:-.016em}
p{text-wrap:pretty}
a{color:var(--accent);text-underline-offset:3px;text-decoration-thickness:1px}
.num{font-variant-numeric:tabular-nums}
.nota{font-size:14px;letter-spacing:-.016em;color:var(--ink-2)}
.ico{width:18px;height:18px;flex:none;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.app{max-width:1320px;margin:0 auto;padding:40px var(--gutter) 120px;overflow-x:clip}
@media (max-width:760px){ :root{--gutter:16px} h1{font-size:32px} }

/* ── Barra superior y control segmentado ── */
.barra{position:sticky;top:0;z-index:30;background:var(--bar);-webkit-backdrop-filter:saturate(180%) blur(20px);backdrop-filter:saturate(180%) blur(20px);border-bottom:1px solid var(--line)}
.barra-in{max-width:1320px;margin:0 auto;height:52px;padding:0 var(--gutter);display:flex;align-items:center;gap:20px}
.logo{display:inline-flex;align-items:center;gap:8px;margin-right:auto;font:600 17px/1 var(--font-display);letter-spacing:-.022em}
.logo .ico{width:22px;height:22px;color:var(--accent)}
.segmentos{display:inline-flex;gap:2px;padding:2px;border-radius:999px;background:var(--fill)}
.segmentos button{border:0;background:none;font-size:14px;letter-spacing:-.016em;padding:5px 16px;border-radius:999px;transition:background-color .2s ease,box-shadow .2s ease,transform .16s var(--ease)}
.segmentos button:hover{background:var(--fill)}
.segmentos button[aria-current="page"],.segmentos button[aria-pressed="true"]{background:var(--thumb);box-shadow:0 1px 3px rgba(0,0,0,.12),0 0 0 .5px rgba(0,0,0,.04)}
.segmentos button:active{transform:scale(.97)}

/* ── Botones ── */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:36px;padding:0 16px;border:0;border-radius:999px;font-size:14px;line-height:1.2;letter-spacing:-.016em;white-space:nowrap;text-decoration:none;user-select:none;transition:transform .16s var(--ease),background-color .2s ease,color .2s ease}
.btn:active{transform:scale(.97)}
.btn .ico{width:16px;height:16px}
.btn-primario{background:var(--btn);color:#fff}
.btn-primario:hover{background:var(--btn-hover)}
.btn-gris{background:var(--fill);color:var(--ink)}
.btn-gris:hover{background:var(--fill-2)}
.btn-texto{background:none;color:var(--accent);min-height:32px;padding:0 10px}
.btn-texto:hover{background:var(--accent-soft)}
.btn-peligro{background:var(--danger);color:#fff}
.btn-grande{min-height:44px;padding:0 24px;font-size:17px;letter-spacing:-.022em}
.btn-icono{display:inline-grid;place-items:center;width:32px;height:32px;padding:0;border:0;border-radius:50%;background:none;color:var(--ink-2);transition:background-color .15s ease,color .15s ease,transform .16s var(--ease)}
.btn-icono:hover{background:var(--fill);color:var(--ink)}
.btn-icono:active{transform:scale(.92)}
/* «Añadir…» al final de una lista */
.btn-linea{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;height:48px;border-radius:var(--r-lista);border:1.5px dashed var(--line-2);background:transparent;color:var(--accent);font-size:14px;transition:background-color .15s ease,border-color .15s ease}
.btn-linea:hover{background:var(--accent-soft);border-color:transparent}

/* ── Campos ── */
.campo{display:flex;flex-direction:column;gap:6px;min-width:0}
.campo > .eti{font-size:12px;letter-spacing:-.01em;color:var(--ink-2)}
.entrada,.area{width:100%;border:1px solid var(--line-2);border-radius:var(--r-md);background:var(--surface);font-size:17px;transition:border-color .15s ease,box-shadow .15s ease}
.entrada{height:40px;padding:0 12px}
.area{min-height:88px;padding:10px 12px;line-height:1.47;resize:vertical}
.entrada:focus,.area:focus{outline:none;border-color:var(--focus);box-shadow:0 0 0 4px var(--accent-soft)}
select.entrada{appearance:none;padding-right:34px;cursor:pointer;background:var(--surface) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2386868b' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M7 10l5 5 5-5'/%3E%3C/svg%3E") right 10px center/16px no-repeat}
/* Títulos y nombres que se editan en su sitio: sin borde hasta pasar el ratón */
.en-linea{border:0;background:transparent;padding:0 8px;margin:0 -8px;border-radius:10px;font:inherit;letter-spacing:inherit;color:var(--ink);transition:background-color .15s ease,box-shadow .15s ease}
.en-linea:hover{background:var(--fill)}
.en-linea:focus{outline:none;background:var(--surface);box-shadow:0 0 0 4px var(--accent-soft),inset 0 0 0 1px var(--focus)}
.buscar{position:relative}
.buscar .ico{position:absolute;left:12px;top:50%;width:16px;height:16px;color:var(--ink-2);transform:translateY(-50%);pointer-events:none}
.buscar input{width:100%;height:36px;padding:0 14px 0 36px;border:0;border-radius:999px;background:var(--fill);font-size:14px}
.buscar input:focus{outline:none;background:var(--surface);box-shadow:0 0 0 4px var(--accent-soft),inset 0 0 0 1px var(--focus)}
.check{display:flex;align-items:flex-start;gap:10px;font-size:14px}
.check input{width:18px;height:18px;margin:1px 0 0;accent-color:var(--btn)}

/* ── Superficies ── */
.grupo{list-style:none;margin:0;padding:0;background:var(--surface);border-radius:var(--r-lista);overflow:hidden}
.grupo > li{position:relative;display:flex;align-items:center;gap:12px;min-height:56px;padding:8px 10px 8px 16px}
.grupo > li + li::before{content:"";position:absolute;top:0;left:56px;right:0;height:1px;background:var(--line)}
.grupo > li > .ico{width:20px;height:20px;margin:0 4px;color:var(--accent)}
.grupo small{display:block;font-size:12px;letter-spacing:-.01em;color:var(--ink-2)}
.tarjeta{background:var(--surface);border-radius:var(--r-lg);padding:20px;transition:transform .16s var(--ease),box-shadow .2s ease}
button.tarjeta{width:100%;border:0;text-align:left}
button.tarjeta:hover{box-shadow:0 0 0 1px var(--line-2)}
button.tarjeta:active{transform:scale(.985)}
.bandeja{padding:14px 12px 10px;border-radius:var(--r-bandeja);background:var(--tray)}
.bandeja-lista{display:flex;flex-direction:column;gap:6px}
.bandeja-lista > *{border-radius:var(--r-md);background:var(--surface)}
.detalle{display:flex;flex-direction:column;gap:16px;padding:16px 18px 14px;background:var(--surface-2);border-top:1px solid var(--line);animation:abre .26s var(--ease) both}
.vacio{display:flex;flex-direction:column;align-items:flex-start;gap:14px;padding:28px;border-radius:var(--r-lg);background:var(--surface)}
.vacio p{max-width:60ch;color:var(--ink-2)}

/* ── Chips, círculos, números y barras ── */
.chip{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 12px;border-radius:999px;background:var(--fill);font-size:14px;letter-spacing:-.016em}
.chip-color{display:inline-block;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:600;letter-spacing:-.01em;white-space:nowrap;background:color-mix(in srgb,var(--c) 16%,var(--surface));color:var(--ink)}
.punto{display:inline-block;width:10px;height:10px;border-radius:50%;flex:none;background:var(--c)}
.circulo{display:inline-grid;place-items:center;flex:none;width:34px;height:34px;padding:0;border:0;border-radius:50%;background:var(--fill);color:var(--ink-2);transition:background-color .15s ease,color .15s ease,transform .16s var(--ease)}
.circulo .ico{width:17px;height:17px}
.circulo:hover{background:var(--fill-2);color:var(--ink)}
.circulo:active{transform:scale(.92)}
.circulo.activo{background:var(--accent-soft);color:var(--accent)}
.numero{display:inline-grid;place-items:center;flex:none;width:26px;height:26px;border-radius:50%;background:var(--fill);color:var(--ink-2);font:600 12px/1 var(--font);letter-spacing:-.01em}
/* Pista de proporciones (la regla de tiempo): cada tramo con style="flex-basis:40%;--tono:var(--tono-3);--tono-t:var(--bg)" */
.pista{display:flex;height:32px;border-radius:10px;background:var(--fill);overflow:hidden}
.pista > span{flex:none;display:flex;align-items:center;min-width:0;padding:0 8px;overflow:hidden;background:var(--tono,var(--tono-1));color:var(--tono-t,var(--bg));font:600 12px/1 var(--font);letter-spacing:-.01em;white-space:nowrap;box-shadow:inset -2px 0 0 var(--surface)}
.pista > .hueco{flex:1;justify-content:center;background:none;color:var(--ink-2);font-weight:400;box-shadow:none}
.progreso{height:6px;border-radius:999px;background:var(--fill);overflow:hidden}
.progreso > i{display:block;height:100%;border-radius:inherit;background:var(--btn);transform:scaleX(var(--p,0));transform-origin:0 50%;transition:transform .3s linear}

/* ── Subrayador: las marcas en el texto (style="--c:#D15091") ── */
mark.subrayado{--hl:color-mix(in srgb,var(--c) 42%,transparent);
  color:inherit;background:linear-gradient(var(--hl),var(--hl)) 0 0/100% 100% no-repeat;
  border-radius:.48em .3em .52em .34em;padding:.04em .12em .06em;margin:0 -.12em;
  -webkit-box-decoration-break:clone;box-decoration-break:clone}
mark.subrayado.nueva{animation:trazo .6s var(--ease) both}
@supports (color:oklch(from red l c h)){
  mark.subrayado{--hl:oklch(from var(--c) l c h / .48)}
  .chip-color{color:oklch(from var(--c) min(l, .45) c h)}
  @media (prefers-color-scheme:dark){
    :root:not([data-theme="light"]) mark.subrayado{--hl:oklch(from var(--c) min(l, .58) c h / .62)}
    :root:not([data-theme="light"]) .chip-color{background:color-mix(in srgb,var(--c) 26%,var(--surface));color:oklch(from var(--c) max(l, .84) calc(c * .8) h)}
  }
}

/* ── Lo que flota: hojas, menús, avisos, barra flotante y etiquetas ── */
.velo{position:fixed;inset:0;z-index:60;display:grid;place-items:center;padding:24px;background:rgba(0,0,0,.3);animation:velo .2s ease both}
.hoja{width:min(100%,460px);max-height:calc(100vh - 48px);overflow:auto;display:flex;flex-direction:column;gap:16px;padding:24px;border-radius:var(--r-lg);background:var(--raised);box-shadow:var(--sombra-pop);animation:hoja .3s var(--ease) both}
.hoja h2{font-size:21px;line-height:1.19;letter-spacing:-.016em}
.hoja > p{font-size:14px;letter-spacing:-.016em;color:var(--ink-2)}
.hoja-acciones{display:flex;justify-content:flex-end;gap:8px;margin-top:8px} /* «Cancelar» en gris y la acción en azul, a la derecha */
.menu{position:fixed;z-index:65;min-width:220px;padding:5px;border-radius:12px;background:var(--raised);box-shadow:var(--sombra-pop);display:flex;flex-direction:column;transform-origin:var(--origen,top right);animation:menu .18s var(--ease) both}
.menu button{display:flex;align-items:center;gap:10px;width:100%;border:0;background:none;padding:7px 12px 7px 10px;border-radius:7px;font-size:14px;letter-spacing:-.016em;text-align:left}
.menu button .ico{width:16px;height:16px;color:var(--ink-2)}
.menu button:hover,.menu button:focus-visible{outline:none;background:var(--btn);color:#fff}
.menu button:hover .ico,.menu button:focus-visible .ico{color:#fff}
.menu hr{border:0;height:1px;background:var(--line);margin:4px 8px}
.avisos{position:fixed;left:50%;bottom:24px;z-index:70;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:8px;pointer-events:none}
.aviso{pointer-events:auto;display:flex;align-items:center;gap:8px;max-width:min(92vw,560px);min-height:40px;padding:6px 6px 6px 18px;border-radius:999px;background:var(--hud);-webkit-backdrop-filter:saturate(180%) blur(20px);backdrop-filter:saturate(180%) blur(20px);box-shadow:var(--sombra-pop);font-size:14px;letter-spacing:-.016em;animation:aviso .34s var(--ease) both}
.aviso.solo{padding-right:18px}
.aviso .ico{width:16px;height:16px;color:var(--ok)}
.aviso button{border:0;background:none;color:var(--accent);font-weight:600;padding:6px 14px;border-radius:999px}
.aviso button:hover{background:var(--accent-soft)}
.aviso.sale{animation:aviso-sale .18s ease both}
.hud{position:fixed;left:50%;bottom:20px;z-index:40;transform:translateX(-50%);display:flex;flex-wrap:wrap;align-items:center;gap:6px 8px;max-width:calc(100vw - 32px);padding:7px 8px 7px 16px;border-radius:24px;background:var(--hud);-webkit-backdrop-filter:saturate(180%) blur(20px);backdrop-filter:saturate(180%) blur(20px);box-shadow:var(--sombra-pop);font-size:14px;animation:sube .28s var(--ease) both}
[data-tip]{position:relative}
[data-tip]::after{content:none;position:absolute;z-index:5;left:50%;bottom:calc(100% + 7px);transform:translateX(-50%);padding:5px 9px;border-radius:7px;background:var(--ink);color:var(--bg);font:500 12px/1.25 var(--font);letter-spacing:-.01em;white-space:nowrap;pointer-events:none}
@media (hover:hover){ [data-tip]:hover::after{content:attr(data-tip);animation:tip .14s ease .35s both} }
[data-tip]:focus-visible::after{content:attr(data-tip)}

/* ── Movimiento y feedback: lo nuevo aparece y destella; lo que se borra se desvanece ── */
@keyframes velo{from{opacity:0}}
@keyframes hoja{from{opacity:0;transform:translateY(8px) scale(.97)}}
@keyframes menu{from{opacity:0;transform:scale(.96)}}
@keyframes aviso{from{opacity:0;transform:translateY(12px) scale(.97)}}
@keyframes aviso-sale{to{opacity:0;transform:translateY(6px) scale(.98)}}
@keyframes sube{from{opacity:0;transform:translate(-50%,10px) scale(.98)}}
@keyframes abre{from{opacity:0;transform:translateY(-6px)}}
@keyframes trazo{from{background-size:0% 100%}}
@keyframes tip{from{opacity:0;translate:0 3px}}
@keyframes aparece{from{opacity:0;transform:translateY(-6px) scale(.985)}}
@keyframes destello{0%,25%{background-color:var(--accent-soft)}to{background-color:transparent}}
@keyframes anillo{0%,30%{box-shadow:0 0 0 4px var(--accent-soft),0 0 0 1px var(--focus)}to{box-shadow:0 0 0 4px transparent,0 0 0 1px transparent}}
@keyframes salir{to{opacity:0;transform:scale(.98)}}
.nuevo{animation:aparece .45s var(--ease) both}
.destello{animation:destello 1.6s ease-out both}            /* filas */
.anillo{animation:anillo 1.6s ease-out both}                /* tarjetas, grupos y bloques */
.nuevo.destello{animation:aparece .45s var(--ease) both,destello 1.6s ease-out both}
.nuevo.anillo{animation:aparece .45s var(--ease) both,anillo 1.6s ease-out both}
.saliendo{animation:salir .17s linear forwards;pointer-events:none}
@keyframes apenas{from{opacity:0}}
@media (prefers-reduced-motion:reduce){
  .nuevo,.hoja,.velo,.aviso,.menu,.hud,.detalle{animation-name:apenas!important}
  .btn:active,.btn-icono:active,.circulo:active,.segmentos button:active,button.tarjeta:active{transform:none}
  mark.subrayado.nueva{animation:none}
}
```

## 7. Movimiento (emil-design-eng)

- Curvas:
  - `cubic-bezier(.23,1,.32,1)` para entrar, pulsar y desplegar;
  - `ease` para el color y el fondo al pasar el ratón;
  - `linear` para las barras de progreso y las salidas cortas.
  Nunca uses `ease-in`.
- Duraciones:
  - pulsación: 160ms;
  - pasar el ratón: 150–200ms;
  - menús: 180ms;
  - hojas: 300ms;
  - avisos: 340ms al entrar y 180ms al salir.
  Lo que responde a una acción tarda menos de 300ms. Pueden durar más, porque no hacen esperar a nadie, los avisos (340ms), la entrada de lo nuevo (450ms), el trazo del subrayador (600ms) y los destellos (1,6s).
- Al pulsar, todo encoge un poco: `scale(.97)` en los botones, `.92` en los círculos e iconos y `.985` en las tarjetas.
- Nada aparece desde `scale(0)`. Los elementos entran con opacidad 0, desde `.96–.97` y desplazados unos píxeles.
- Los menús crecen desde su botón (`transform-origin`). Las hojas crecen desde el centro.
- Solo se animan `transform` y `opacity`, más el fondo en los destellos. En lo que se puede interrumpir, mejor transiciones que keyframes.
- No se anima nada de lo que se hace con el teclado ni de lo que se repite cien veces al día.
- Con «reducir movimiento», solo hay fundidos y nada encoge.

## 8. Calidad (impeccable)

- Es una herramienta, así que el modo es «Operate»: quien la usa sabe dónde está todo antes de fijarse en el estilo. Los controles son los de siempre (botones, pestañas, campos, selects, tablas) y no van disfrazados.
- Cada elemento tiene todos sus estados: al pasar el ratón, con foco, pulsado, desactivado, cargando, vacío y con error. Pruébalos con contenido real, nunca con lorem ipsum.
- Mínimos que hay que cumplir:
  - contraste de 4,5:1 en el texto y de 3:1 en el texto grande;
  - zonas táctiles de 44px en el móvil;
  - todo se puede usar con el teclado;
  - nunca aparece desplazamiento horizontal;
  - la composición se adapta por debajo de 760px.
- Prohibido:
  - tarjetas dentro de tarjetas;
  - rejillas de tarjetas iguales con icono, título y texto como estructura de la página;
  - antetítulos sobre los títulos;
  - secciones numeradas 01/02/03;
  - texto con degradado;
  - desenfoques decorativos (solo van en la barra, los avisos y la barra flotante);
  - bordes de color de más de 1px en un solo lado;
  - sombras duras;
  - emojis o símbolos Unicode como iconos;
  - ventanas modales para lo que no necesita interrumpir.
- Revisa en tandas:
  1. Construye la pieza entera.
  2. Haz una ronda de capturas en escritorio y en móvil, en claro y en oscuro.
  3. Corrige todo de una vez.
  4. Confirma con una ronda más, como mucho, y para.

## 9. Si te pido una presentación

Usa el mismo lenguaje, a 1920 × 1080 (en el tipo Slides de Claude o en PowerPoint si te lo pido).

- Base:
  - fondo #f5f5f7, texto #1d1d1f y texto secundario #6e6e73;
  - márgenes de 128px;
  - Segoe UI si va a PowerPoint (viene con Windows) e Inter en web o PDF.
- Tamaños:
  - título de portada: 120px en 600, con interlineado 1,04 y tracking −0,032em;
  - títulos: 72px en 600, con 1,08 y −0,022em;
  - texto: 32px con 1,35;
  - pies y chips: 24px.
- Agrupación: tarjetas blancas con radio de 40px y bandejas #e8e8ed con radio de 48px. Las listas van como tarjetas numeradas o filas, nunca con viñetas de plantilla.
- Una idea por diapositiva, y cada tipo con su fondo:
  - las preguntas, a sangre en azul #0071e3 con texto blanco;
  - las citas, en una tarjeta crema #fbf0de con el autor debajo;
  - los vídeos, en negro;
  - los descansos, en #4a4d54;
  - los separadores de bloque, en #1d1d1f con el número grande.
- Puede ir un antetítulo corto en gris sobre el título (por ejemplo, «Ejercicio»). En las diapositivas sí sirve; es la única excepción a la sección 8.
- Las palabras clave llevan el subrayador: una pastilla con radios asimétricos (`21px 13px 23px 15px`) y un color de la paleta al 48 %.
- El pie va a 64px del borde inferior: el número del bloque en una pastilla de 24px en 600 (radio 9) y su título al lado.
- Sin sombras, sin degradados y sin plantillas. La transición es un fundido.
- El guion del ponente va en las notas, no en la diapositiva.

## 10. Cómo trabajar conmigo

- Si es algo nuevo o un rediseño grande, enséñame antes dos o tres imágenes de propuesta y espera mi visto bueno. Por ejemplo: la pantalla principal, una variante y el modo oscuro.
- Escribe los textos de la interfaz en castellano llano:
  - los botones, con verbo («Guardar», «Generar presentación»);
  - las etiquetas, cortas y con mayúscula solo al principio;
  - las ayudas, en gris de 14px;
  - los errores, diciendo qué ha pasado y cómo se arregla;
  - sin exclamaciones ni tecnicismos.
- Si algo de este sistema no encaja con lo que te pido, pregúntame antes de cambiarlo.
- Al terminar, dime en una línea qué skills has usado.
