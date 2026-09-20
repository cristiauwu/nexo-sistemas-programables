<!-- docs/checklist-entrega.md -->
# Lista final antes de entregar

Esta lista es **tuya** y ninguna casilla está marcada: nadie la ha ejecutado en tu equipo.

Parte del trabajo ya se midió en un navegador real (contraste, desbordes, foco y consola, en 4 rutas
× 3 anchos; ver `docs/validacion.md` §1.3). Esos bloques se marcan abajo como **ya medido**, y ahí
tu tarea es solo confirmar a ojo lo que una máquina no juzga. El resto no lo ha visto nadie.

Tiempo estimado: unos 21 minutos.

---

## Bloque A — El requisito innegociable (5 min)

Es lo primero que probará el profesor. Si algo falla aquí, nada más importa.

- [ ] Comprimir la carpeta `NEXO` y **extraerla en otra ubicación** (por ejemplo, el Escritorio).
- [ ] **Desconectar internet.**
- [ ] Abrir `index.html` con **doble clic**, sin terminal, sin servidor.
- [ ] La portada carga y su simulación se mueve.
- [ ] Probar en un segundo navegador (Chrome y Firefox, o Edge).

---

## Bloque B — Consola limpia (2 min)

**Ya medido:** 0 errores y 0 advertencias al cargar y montar las 4 rutas. Confírmalo en tu equipo,
que es donde importa.

- [ ] Abrir la consola del navegador con `F12`.
- [ ] Recorrer Inicio → Sensores → Actuadores → Integración.
- [ ] **Cero errores en rojo.** Las advertencias amarillas de `file://` sobre almacenamiento son normales.
- [ ] Usar el botón Atrás del navegador y comprobar que la ruta vuelve correctamente.

---

## Bloque C — Colorimetría clara (3 min)

**Ya medido en Chromium:** contraste de todos los textos y bordes de control, en 4 rutas × 3 anchos,
con los desplegables abiertos. 0 fallos. Lo que queda es el juicio visual que ninguna herramienta da.

- [ ] Los dibujos SVG no tienen zonas que desaparezcan sobre el papel claro.
- [ ] El naranja se usa como bloque de color, no como texto pequeño sobre papel.
- [ ] Nada se ve «lavado» o sin jerarquía: se distingue de un vistazo qué es título y qué es apoyo.

---

## Bloque D — Responsive (2 min)

**Ya medido:** sin desbordes horizontales a 360, 768 ni 1440 px en ninguna ruta.

- [ ] A **768 px**: los bancos se reorganizan sin solaparse ni dejar huecos raros.
- [ ] A **1440 px**: el contenido no queda perdido en una franja estrecha.
- [ ] Zoom del navegador al **200 %**: sigue siendo usable (esto **no** está medido).

---

## Bloque E — Interactividad que enseña (5 min)

Las tres pruebas que demuestran que el sitio enseña, no decora:

- [ ] **Sensores:** mover el nivel de 0 a 100 % y ver que la salida analógica cambia gradualmente
      mientras la discreta cambia de golpe en el umbral.
- [ ] **Actuadores:** ordenar una acción y **retirar la alimentación**. Debe aparecer el mensaje
      de que falta alimentación y **no** debe ocurrir la acción.
- [ ] **Integración:** hacer una predicción, ejecutar el caso y comparar lazo cerrado con abierto.
- [ ] Completar las 15 preguntas de Sensores, leer una explicación y reiniciar la evaluación.

---

## Bloque F — Accesibilidad (3 min)

**Ya medido:** todos los controles alcanzables muestran un cambio visible al recibir el foco.
Lo que falta es el **orden** del recorrido, que sí exige criterio humano.

- [ ] Recorrer una ruta completa **solo con `Tab`**: el orden sigue la lectura, sin saltos raros.
- [ ] Manejar un deslizador con las flechas del teclado.
- [ ] Cerrar el diálogo de ayuda con `Escape`.
- [ ] Activar la **reducción de movimiento** del sistema operativo y confirmar que nada se anima.

---

## Bloque G — Impresión (1 min, nuevo)

`styles/print.css` apuntaba a un marcado de portada que ya no existe. Se reescribió para el
actual, pero **nadie lo ha visto en papel**. Si no vas a imprimir, puedes saltarte el bloque.

- [ ] `Ctrl + P` en Inicio: el titular cabe en la página y no sale la banda negra a sangre.
- [ ] `Ctrl + P` en Sensores: el índice lateral no aparece y las fichas no se parten a la mitad.

---

## Bloque H — Empaquetado final

- [ ] Las pruebas de `tests/index.html` pasan al abrirlo con doble clic.
- [ ] El ZIP contiene la carpeta `NEXO` completa: `index.html`, `styles/`, `scripts/`, `content/`, `tests/`, `docs/`, `LEEME.md`.
      **Ya medido:** 59 entradas, todas bajo `NEXO/`, rutas con `/`, contenido idéntico al original tras extraer.
- [ ] El ZIP **no** contiene la carpeta `.verification` (es herramienta interna, no parte de la entrega). **Ya medido:** 0 entradas.
- [ ] Nombre del ZIP: `ApellidoNombrePaginaSistemasProgramablesT2.zip`
- [ ] Nombre del PDF: `ApellidoNombrePaginaSistemasProgramablesT2.pdf`
- [ ] Ambos nombres sin espacios ni acentos, con tu apellido y nombre reales.
- [ ] El PDF sigue `docs/guion-reporte.md` y sus 8 capturas son legibles.

---

## Si encuentras un fallo

Anótalo con la ruta, el ancho de ventana y el navegador. Eso basta para corregirlo.
No des por buena una casilla que no ejecutaste: el valor de esta lista es que dice la verdad.
