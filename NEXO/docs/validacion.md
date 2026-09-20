# Validación: qué se comprobó y qué no

Este documento existe para que nadie tenga que confiar en una afirmación sin evidencia.
Distingue tres categorías: **comprobado de forma automática**, **revisado a mano en el código** y
**pendiente de revisión visual humana**. Si una fila dice «pendiente», es que nadie la ha verificado todavía.

---

## 1. Comprobado de forma automática

Las pruebas se ejecutan en dos lugares distintos.

### 1.1 Pruebas que puedes repetir sin instalar nada

Abre `tests/index.html` con doble clic. No requiere terminal, ni red, ni instalación.
Pulsa el botón para lanzar las pruebas: verás cada aserción con su resultado.

Cubre dos bloques:

- **Modelo térmico y modelos físicos** (`tests/model-tests.js`): determinismo, histéresis con memoria
  en los extremos exactos de la banda, imposibilidad de enfriar por debajo del ambiente sin aporte,
  equivalencia entre un paso de un segundo y diez subpasos, normalización de entradas no finitas
  sin propagar `NaN`, y que pausar no avanza la física.
- **Registro y contenido** (`tests/content-tests.js`): identificadores únicos de módulo, rutas seguras,
  todo estado con etiqueta definida, todo módulo no futuro con contenido, presencia de los 20 puntos
  de Tema I en el mapa de cobertura, y coherencia entre el estado declarado de cada módulo y la realidad.

### 1.2 Auditoría de aplicación con DOM sintético

Archivo: `.verification/audit-app.mjs`. **No forma parte del ZIP entregado**: es herramienta interna.
Se ejecuta desde la carpeta que contiene a `NEXO/` con `bun .verification/audit-app.mjs`.

Última ejecución: **184 comprobaciones, 184 correctas, 0 fallos, 0 errores de ejecución.**

Qué verifica exactamente:

| Grupo | Comprobación |
|---|---|
| Recursos | Los 48 archivos referenciados por `index.html` existen en disco y son rutas relativas |
| Sintaxis | Los 34 archivos JavaScript compilan sin error de sintaxis |
| Modelos | Las aserciones de `model-tests.js` y `content-tests.js` descritas arriba |
| Rutas | Se recorren `inicio`, `sensores`, `actuadores`, `integracion`, `microcontroladores`, `programacion` y una ruta inexistente |
| Estructura | Un solo `h1` por ruta, título de documento descriptivo, identificadores únicos en todo el documento |
| Accesibilidad | Cada `label[for]` apunta a un elemento real; cada `aria-labelledby` y `aria-describedby` resuelve; ningún control ni botón queda sin nombre accesible |
| SVG | Toda referencia `url(#id)` resuelve a un elemento presente |
| Robustez | Se mueve **cada** `select` por todas sus opciones y **cada** deslizador a su mínimo y máximo, y se comprueba que no aparece `NaN` ni `undefined` visible |
| Evaluación | Se responden las 15 preguntas de Tema I, se verifica la puntuación y el resumen de 15 entradas, y que se puede reiniciar |
| Regla didáctica | En Actuadores, dar una orden sin alimentación no produce acción |
| Fugas | Tras ciclar las rutas tres veces y salir, no queda ningún `requestAnimationFrame` vivo |

**Límite honesto de esta auditoría:** usa un DOM sintético (`happy-dom`), no un navegador real.
No renderiza, no calcula estilo aplicado, no mide contraste real, no detecta desbordes ni solapamientos.
Verifica estructura, semántica y lógica; **no verifica apariencia**. Esa carencia la cubre 1.3.

### 1.3 Auditoría visual en navegador real

Archivo: `.verification/audit-visual.mjs`. **Tampoco forma parte del ZIP.** Renderiza el sitio en
Chromium con `puppeteer-core` y mide píxeles de verdad, que es justo lo que 1.2 no puede hacer.

Recorre **las 4 rutas en 3 anchos** (360, 768 y 1440 px) = 12 estados. En cada uno abre todos los
`<details>` para medir también el contenido plegado, y comprueba:

| Qué mide | Criterio |
|---|---|
| Contraste real del texto | Compone el color sobre el fondo **realmente pintado**, subiendo por los ancestros hasta hallar una capa opaca. Exige 4.5:1 en texto normal y 3:1 en texto grande |
| Contraste del borde de los controles | 3:1 (WCAG 1.4.11). Excluye los deshabilitados, que la norma exime |
| Desborde horizontal | Ningún elemento sobresale del viewport; ignora los que viven dentro de un contenedor con desplazamiento propio |
| Foco visible | Enfoca cada control alcanzable y confirma que su aspecto cambia. Excluye los deshabilitados y los que están dentro de un `<details>` cerrado, que el navegador no enfoca |
| Consola | Cualquier error o advertencia durante la carga y el montaje |

Última ejecución: **0 fallos de contraste, 0 desbordes, 0 fallos de foco, 0 mensajes en consola.**

Dos defectos reales aparecieron gracias a esta pasada, invisibles para las 184 comprobaciones de 1.2:

- El borde del botón de etapa activo en la portada usaba `--accent`, que mide **2.998:1** sobre el
  papel. Por debajo del 3:1 exigido, por tres milésimas. Corregido a `--accent-strong`.
- Los números grandes de módulo (`.module-index`) quedan en torno a **2.07:1**. Se midieron con
  captura de pantalla real porque su fondo es un degradado. Se conservan: son `aria-hidden="true"`,
  decoración pura, y el dato no se pierde porque el número también está en el texto de la tarjeta.
  La auditoría los declara como exentos en lugar de omitirlos en silencio.

**Límite honesto de esta auditoría:** mide un solo motor (Chromium) y no juzga estética, jerarquía
visual ni si un texto se entiende. Tampoco sustituye a un lector de pantalla real.

---

## 2. Revisado a mano en el código

- **Ejecución sin red.** No hay `fetch`, ni `import`, ni `<script type="module">`, ni CDN, ni fuentes remotas,
  ni peticiones a ningún dominio. Todas las rutas de recurso empiezan por `./`.
- **Tipografía local.** Solo familias presentes en el sistema, con lista de reserva.
- **Separación de capas.** La física vive en `scripts/models/`, la vista y la interacción en
  `scripts/simulations/`, el contenido en `content/`. Un modelo no toca el DOM.
- **Limpieza de montajes.** Cada `mountX(root)` devuelve una función `cleanup()`; el enrutador las acumula
  y las invoca al cambiar de ruta. Esto es lo que verifica la comprobación de fugas.
- **Correcciones de contenido aplicadas tras auditoría técnica:**
  - `N.Models.signals` rechazaba mal las entradas no finitas: un `NaN` se propagaba a tensión y corriente,
    y un umbral `NaN` producía una detección falsa. Ahora lanza `TypeError` ante entradas no finitas
    y acota el umbral al rango válido.
  - Una válvula 2/2 con retorno por resorte estaba descrita como de «dos posiciones estables», lo que
    sugiere biestabilidad. Corregido: es **monoestable**, el resorte la mantiene cerrada sin energizar.
  - Tres encabezados de los bancos ópticos compartían identificador con los `<title>` de sus SVG.
    Corregido con sufijos distintos; sin IDs duplicados en ninguna ruta.
- **Degradados SVG sin literales de color.** Durante un tiempo las rampas de los dibujos repetían
  valores hexadecimales a mano, bajo la creencia de que `stop-color` no aceptaba `var()`. **Esa
  creencia era falsa y se comprobó midiendo**, no suponiendo: Chromium y Gecko resuelven ambos
  `var()` y `color-mix()` dentro de `stop-color`. Las rampas ahora derivan de `tokens.css`
  (`--metal-1…6`, `--sage-light`, `--lens-1…4`) y **no queda ni un literal de color en `scripts/`**.
  Verificado repintando la paleta en caliente en un navegador real: los 22 stops de la portada
  cambian con ella. Antes no se habrían movido. Los cuatro pasos calculados con `color-mix()`
  declaran antes un valor plano de reserva, así que en un motor antiguo pierden matiz pero
  nunca caen a negro.
- **Código muerto retirado.** Cuando `editorial-home.js` pasó a generar la portada, dejó de
  ejecutarse `N.ui.home()`, y con ella todo el marcado `.hero*`, `.signal-preview` y
  `.principles-grid`. Se comprobó selector por selector, buscando cada clase en `scripts/`,
  `content/` e `index.html`, y cruzando el resultado con las 6 rutas del sitio más una
  inexistente. Resultado: **`layout.css` pasó de 131 a 61 líneas** (54 selectores y un bloque
  `@media` vacío), se eliminó `N.ui.home` de `ui.js` (49 → 31 líneas), el manejador
  `[data-detect]` huérfano de `app.js`, y 9 selectores de `print.css`, que además se
  reescribieron para apuntar al marcado editorial actual. Ninguna regla se borró por parecer
  muerta: se exigió que la clase no apareciera en ningún archivo generador. `.empty-state`
  parecía muerta probando solo 4 rutas y se conservó al aparecer en las rutas previstas y en
  el 404. Tras el recorte, 184/184 comprobaciones y auditoría visual en cero.
- **Empaquetado del ZIP corregido.** `Compress-Archive` de PowerShell 5.1 escribe las rutas
  internas con `\` en lugar de `/`, contra la especificación ZIP. Windows lo abre igual, pero
  otros descompresores producen un solo archivo con barras en el nombre, y eso rompería el
  requisito innegociable en cuanto el profesor usara otra herramienta. Se detectó al inspeccionar
  el ZIP en vez de darlo por bueno. Ahora se construye con `.verification/zip.ps1`, y se verifica
  extrayéndolo a una carpeta limpia y comparándola con el original: **59 entradas, 0 con `\`,
  0 fuera de `NEXO/`, 0 de `.verification`, contenido idéntico**.
- **Publicación en HTTP comprobada, no supuesta.** Antes de subir a Vercel se sirvió `NEXO/`
  por HTTP en local y se recorrieron las **6 rutas** con navegador real, escuchando la consola
  y **todas las respuestas de red**: 0 errores, 0 advertencias y **0 respuestas 4xx o 5xx**.
  Importa porque `file://` es permisivo con las mayúsculas del nombre de archivo y un servidor
  Linux no lo es: un `Styles/` mal escrito funcionaría en tu equipo y daría 404 publicado.
  También se verificó que no hay rutas absolutas (`/styles/…`), que romperían en un subdirectorio.

---

## 3. Pendiente de revisión visual humana

Esta lista **se ha reducido**: las filas 1, 2, 3 y 6 ya están medidas en navegador real (ver 1.3).
Lo que sigue abajo es lo que una máquina no puede juzgar por mí, y sigue sin verificar.

| # | Qué revisar | Cómo | Estado |
|---|---|---|---|
| 1 | Contraste real de texto y bordes | — | **Medido** en Chromium, 12 estados. 0 fallos |
| 2 | Que nada desborde horizontalmente | — | **Medido** a 360, 768 y 1440 px. 0 desbordes |
| 3 | Móvil, tableta y escritorio | — | **Medido** en los 3 anchos, sin errores |
| 4 | Navegación solo con teclado | Recorrer cada ruta con `Tab` y confirmar que el **orden** es lógico | Parcial: se midió que el foco **se ve**; el orden y el recorrido completo no |
| 5 | `prefers-reduced-motion` | Activar la reducción de movimiento en el sistema y confirmar que nada se anima | Pendiente |
| 6 | Consola limpia | — | **Medido**: 0 errores y 0 advertencias en las 12 combinaciones |
| 7 | Apertura desde ZIP | Descomprimir en una carpeta nueva y abrir `index.html` con doble clic, sin red | Pendiente: hazlo tú, es la prueba que más importa |
| 8 | Impresión | Vista previa de impresión de cada ruta | Pendiente, y ahora **prioritario**: `print.css` se reescribió para el marcado editorial actual y nadie ha visto el resultado en papel |
| 9 | Lector de pantalla | Recorrer un banco y confirmar que las lecturas se anuncian | Pendiente |
| 10 | ¿Se entiende? | Leer una ficha completa y decidir si un compañero la entendería sin explicación | Pendiente: ninguna herramienta juzga esto |

Los pasos 7 y 10 son los que más importan ahora: el resto de lo automatizable ya está automatizado.

---

## 4. Cómo repetir la auditoría automática

Requiere una herramienta que **no** forma parte de la entrega y **no** necesita el profesor:

```
bun .verification/audit-app.mjs      # estructura, semántica y lógica (DOM sintético)
bun .verification/audit-visual.mjs   # contraste, desbordes y foco (navegador real)
powershell -File .verification/zip.ps1   # empaqueta el ZIP con rutas correctas
```

Ambas se ejecutan desde la carpeta que contiene `NEXO/` y escriben su detalle en
`.verification/audit-results.json` y `.verification/audit-visual.json`.
La primera termina con código de salida distinto de cero si una comprobación falla.
La segunda necesita Chrome instalado; si está en otra ruta, cámbiala en la constante `CHROME`.

El profesor **no necesita nada de esto**: le basta con descomprimir y abrir `index.html`.
