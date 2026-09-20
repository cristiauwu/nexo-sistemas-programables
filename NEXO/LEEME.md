<!-- LEEME.md -->
# NEXO — Percibe. Decide. Actúa.

Sistemas Programables · Ingeniería en Sistemas Computacionales
Base académica: antología del Instituto Tecnológico Superior de Uruapan.

---

## Cómo abrirlo (30 segundos, sin instalar nada)

1. **Extrae el ZIP completo.** No abras el HTML desde la vista comprimida de Windows.
2. Abre `NEXO/index.html` con **doble clic**.
3. Listo.

No necesitas terminal, ni servidor, ni cuenta, ni internet. Todo el código y los dibujos están
dentro de la carpeta. Funciona en Edge, Chrome, Firefox y Safari actualizados.

Si ya tenías abierta una versión anterior, recarga con `Ctrl + F5`.

Las letras son fuentes del sistema operativo, así que el aspecto varía muy ligeramente entre equipos.
Es intencional: incluir tipografías externas exigiría descargarlas, y eso rompería el uso sin internet.

---

## Qué contiene

| Ruta | Contenido |
|---|---|
| `#/inicio` | Portada con un lazo de control completo funcionando |
| `#/sensores` | **Tema I** — los 20 puntos, 6 bancos interactivos y 15 preguntas |
| `#/actuadores` | **Tema II** — 7 dispositivos, mecánica, hidráulica, criterios y 11 aplicaciones |
| `#/integracion` | Tres casos que conectan sensor, controlador y actuador |
| `#/microcontroladores` | **Tema III** — previsto, con objetivos declarados y sin contenido inventado |
| `#/programacion` | **Tema IV** — previsto |

La correspondencia punto por punto con el temario oficial está en `docs/cobertura-temario.md`.

---

## Qué puedes hacer que un documento no permite

El criterio del proyecto es que **la interactividad debe enseñar, no decorar**. Tres ejemplos:

- **Confundir umbral con medida es normal.** En Sensores puedes mover el nivel del depósito y ver
  que la salida analógica cambia poco a poco mientras la discreta salta de golpe. Detectar un
  límite no es lo mismo que medir un valor.
- **Confundir mando con energía es el error más común del Tema II.** En Actuadores puedes ordenar
  una acción y **retirar la alimentación**: la orden sigue dada, y no pasa nada. El sitio te deja
  provocar el fallo en lugar de advertírtelo en un párrafo.
- **Un lazo abierto no corrige.** En la portada y en Integración puedes comparar lazo cerrado y
  abierto con el mismo calor, y ver la histéresis evitando que el ventilador oscile en el límite.

Todos los bancos se manejan con controles normales del navegador: deslizadores, casillas y listas.
No hay que arrastrar nada con el ratón, y todo funciona con teclado.

---

## Estado real de esta entrega

Sé concreto sobre qué está comprobado y qué no.

**Comprobado sobre el código:** 184 verificaciones, todas correctas. Incluye que los 48 recursos
existen, que los 34 archivos JavaScript compilan, que ninguna ruta tiene IDs duplicados o etiquetas
rotas, que cada deslizador y cada lista se pueden mover a sus extremos sin producir `NaN`, que la
evaluación completa funciona, y que no quedan animaciones vivas al cambiar de ruta.

**Comprobado en un navegador real:** el sitio se renderizó en Chromium en las 4 rutas × 3 anchos
(360, 768 y 1440 px), con todos los desplegables abiertos. Resultado: **0 fallos de contraste,
0 desbordes horizontales, 0 controles sin foco visible y 0 errores en consola.** Esta pasada
encontró y corrigió un defecto que las 184 verificaciones no podían ver: el borde de un botón de
la portada medía 2.998:1, tres milésimas por debajo del mínimo exigido.

**Sigue sin comprobar:** el movimiento reducido, la impresión, el recorrido completo con lector de
pantalla y —lo más importante— **si los textos se entienden**. Eso último no lo decide ninguna
herramienta. Están listados sin marcar en `docs/checklist-entrega.md`.

**Limpieza reciente:** al rehacerse la portada quedó código que ya no se ejecutaba. Se retiró tras
comprobar clase por clase que no aparecía en ningún archivo generador: `layout.css` bajó de 131 a
61 líneas, `ui.js` de 49 a 31, y `print.css` se reescribió para el marcado actual. Las 184
verificaciones y la auditoría visual siguen en cero tras el recorte.

Detalle completo, con el método y los límites de cada medición, en `docs/validacion.md`.

---

## Repetir las pruebas tú mismo

Abre `tests/index.html` con doble clic y pulsa el botón. Verás cada comprobación con su resultado.
Tampoco requiere instalación.

---

## Publicar en línea (opcional)

Sube el contenido de `NEXO/` a cualquier hosting estático, con `index.html` en la raíz.
Las rutas usan fragmentos (`#/sensores`), así que no hace falta ninguna regla de servidor.

---

## Organización del código

La separación es deliberada: **contenido, estructura, estilo y lógica viven en capas distintas**,
para que agregar Tema III no obligue a tocar lo ya hecho.

| Ruta | Función |
|---|---|
| `index.html` | Entrada única: orden de estilos y scripts, navegación y diálogo de ayuda |
| `styles/tokens.css` | **Única fuente de color, tipografía y espaciado.** Ni las hojas ni los SVG escriben literales: los degradados también derivan de aquí |
| `styles/base.css` | Base semántica, foco visible |
| `styles/layout.css` | Rejilla, navegación y responsive |
| `styles/components.css` | Botones, tarjetas y controles |
| `styles/editorial.css` | Capa de acabado editorial de la portada y los encabezados |
| `styles/simulations.css` | Laboratorio térmico de Inicio |
| `styles/sensors.css` · `actuators.css` · `industry.css` · `integration.css` | Bancos de cada tema |
| `styles/learning.css` | Bloques didácticos y glosario |
| `styles/motion.css` · `print.css` | Movimiento reducido e impresión |
| `content/*.js` | Todos los textos, objetivos, preguntas y casos. **Editar aquí no toca código** |
| `scripts/config/modules.js` | Registro único de módulos: genera navegación y tarjetas |
| `scripts/core/*.js` | Espacio de nombres, enrutador, preferencias de movimiento, almacenamiento |
| `scripts/models/*.js` | **Física pura.** No tocan el DOM, por eso se pueden probar sin navegador |
| `scripts/simulations/*.js` | Vistas e interacción de cada banco |
| `scripts/components/*.js` | Portada, lecciones, evaluación y bloques reutilizables |
| `tests/` | Pruebas repetibles de modelos y contenido |
| `docs/` | Cobertura, validación, guion de reporte, cómo agregar un tema y lista final |

Cada simulación sigue el mismo contrato: `xMarkup()` devuelve HTML y `mountX(root)` devuelve una
función de limpieza. El enrutador acumula esas limpiezas y las ejecuta al cambiar de página; por eso
el sitio no se ralentiza al navegar.

---

## Tecnología y límites honestos

HTML, CSS, JavaScript clásico y SVG dibujado a mano. Sin framework, sin build, sin CDN, sin API
remota, sin fuentes descargadas. Es la decisión que garantiza que funcione con doble clic.

**Los modelos son didácticos, no especificaciones.** Cada banco declara sus simplificaciones en su
propio texto. Concretamente:

- Las distancias de los modelos ópticos y de proximidad están normalizadas: **no** son alcances de
  sensores comerciales.
- El PTC es conceptual; el termopar usa interpolación orientativa.
- La parada de la banda es instantánea: no se modela inercia, frenado ni retardo.
- El límite de presión del depósito es didáctico y **no representa una protección real**.
- Una electroválvula de demostración **no** sustituye una válvula de seguridad certificada.
- El selector de actuadores es una guía con reglas visibles, **no** un cálculo de dimensionamiento.
- La evaluación es ayuda de estudio: no es una calificación oficial ni una certificación.

No usar nada de esto para calibración, diseño de seguridad, instalaciones reales ni selección de
equipos sin las hojas de datos del fabricante.

El zumbador está silenciado por omisión: la muestra dura un cuarto de segundo y exige una acción
explícita. El esquema de mando y potencia es conceptual, no una guía de cableado.

---

## Ampliar a Tema III

El procedimiento exacto, con plantillas listas para copiar, está en `docs/agregar-tema.md`.
Resumen: crear `content/tema-03.js`, añadir una etiqueta `<script defer>`, cambiar un `status` en el
registro y actualizar una aserción de las pruebas. La navegación se actualiza sola.
