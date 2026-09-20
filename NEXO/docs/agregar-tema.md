<!-- docs/agregar-tema.md -->
# Agregar el Tema III paso a paso

El sitio está construido para crecer. Agregar Tema III (Microcontroladores) **no requiere tocar**
la navegación, la portada ni el enrutador: el registro de módulos genera menús y tarjetas solo.

Sigue los pasos en orden. Cada uno indica el archivo exacto y qué escribir.

---

## Paso 1 — Crear el archivo de contenido

Crea `content/tema-03.js`. Copia esta plantilla y rellena los textos:

```js
// content/tema-03.js
(function (N) {
  'use strict';
  N.content.microcontroladores = {
    title: 'Una decisión\ncabe en un chip.',
    subtitle: 'Frase corta que explica qué gana el estudiante al recorrer el tema.',
    objectives: [
      'Primer objetivo en infinitivo.',
      'Segundo objetivo.',
      'Tercer objetivo.'
    ],
    sections: [
      {
        title: 'Título de la sección',
        tags: ['Punto oficial 1', 'Punto oficial 2'],
        paragraphs: [
          'Párrafo explicativo en lenguaje claro.',
          'Segundo párrafo.'
        ]
      }
    ],
    note: 'Una línea que resume qué se hace en esta página.',
    source: 'Antología de Sistemas Programables · Unidad 3.'
  };
}(window.NEXO));
```

Reglas del contenido:

- `title` admite `\n` para partir el titular en dos líneas.
- `tags` son los puntos del temario oficial que cubre la sección. Alimentan la tabla de cobertura.
- Una sección usa `paragraphs` (lista) **o** `text` (cadena), no ambos.

---

## Paso 2 — Cargar el archivo

En `index.html`, añade la etiqueta **después** de los demás `content/` y **antes** del enrutador:

```html
<script defer src="./content/tema-03.js"></script>
```

La carga es explícita a propósito: no hay descubrimiento automático de archivos porque `fetch`
no funciona al abrir con `file://`. Si olvidas este paso, el módulo aparece sin contenido.

---

## Paso 3 — Activar el módulo en el registro

En `scripts/config/modules.js` la entrada ya existe. Cámbiala así:

```js
{ id: 'microcontroladores', label: 'Microcontroladores', code: '04', chapter: 'TEMA III',
  status: 'available', accent: 'cyan', symbol: 'sensor',
  description: 'La inteligencia dentro del sistema.',
  preview: 'Entradas / lógica / salidas' },
```

| Campo | Antes | Ahora | Efecto |
|---|---|---|---|
| `status` | `'planned'` | `'available'` o `'building'` | Deja de mostrarse como «Próximamente» |
| `accent` | `'muted'` | `'cyan'`, `'amber'` o `'lime'` | Color de la familia en tarjetas y encabezados |
| `symbol` | — | nombre de un símbolo existente | Dibujo de la tarjeta en Inicio |
| `preview` | — | tres palabras | Línea corta bajo la tarjeta |

No edites la barra de navegación ni la portada: ambas se generan desde esta lista.

---

## Paso 4 — Actualizar la prueba de coherencia

En `tests/content-tests.js` hay una aserción que fija cuántos temas quedan previstos:

```js
test('Tema III y IV permanecen previstos', N.modules.filter((m) => m.status === 'planned').length === 2);
```

Al activar Tema III debe pasar a `=== 1`. Si no lo actualizas la prueba falla, que es exactamente
lo que debe ocurrir: el proyecto se niega a mentir sobre su propio estado.

Añade también una aserción de cobertura, siguiendo el patrón existente:

```js
test('Los puntos de Tema III están en el mapa',
  N.content.microcontroladores.sections.reduce((sum, s) => sum + s.tags.length, 0) === 12);
```

Sustituye `12` por el número real de puntos del temario oficial.

---

## Paso 5 — Documentar la cobertura

Añade una sección en `docs/cobertura-temario.md` con la misma estructura que Tema I y II:
número, punto oficial, dónde está y si es interactivo.

---

## Paso 6 — Comprobar

Abre `index.html` con doble clic y verifica:

- [ ] «Microcontroladores» ya no dice «Próximamente» en la navegación.
- [ ] Su tarjeta aparece en Inicio con color y dibujo.
- [ ] La ruta `#/microcontroladores` muestra el contenido nuevo.
- [ ] `tests/index.html` pasa todas las pruebas.

---

## Si además quieres una simulación nueva

El texto no requiere código. Una experiencia interactiva sí, y el patrón es estricto porque
es lo que evita fugas de memoria al navegar.

**1. La física va aparte, en `scripts/models/`.** Un modelo es una función pura: recibe un estado
y devuelve el siguiente. **No toca el DOM.** Así se puede probar sin navegador.

```js
// scripts/models/mi-modelo.js
(function (N) {
  'use strict';
  N.Models.miModelo = {
    step(state, dt) {
      // Valida entradas: nunca dejes que un NaN se propague a la pantalla.
      if (!Number.isFinite(dt)) throw new TypeError('dt debe ser finito');
      return { ...state, valor: state.valor + dt };
    }
  };
}(window.NEXO));
```

**2. La vista va en `scripts/simulations/`,** con dos funciones y un contrato fijo:

```js
// scripts/simulations/mi-banco.js
(function (N) {
  'use strict';
  var serial = 0;

  // Devuelve una cadena HTML. Todos los IDs llevan prefijo único.
  N.Simulations.miBancoMarkup = function () {
    var id = 'banco-' + (++serial) + '-';
    return '<section class="sensor-experiment" data-banco="' + id + '">' +
             '<h3 id="' + id + 'titulo">Título del banco</h3>' +
             '<label for="' + id + 'ctrl">Nombre del control</label>' +
             '<input id="' + id + 'ctrl" type="range" min="0" max="100" value="50">' +
           '</section>';
  };

  // Recibe el nodo ya insertado. DEVUELVE una función de limpieza.
  N.Simulations.mountMiBanco = function (root) {
    var control = root.querySelector('input[type="range"]');
    var frame = 0;

    function onInput() { /* actualizar lecturas */ }
    control.addEventListener('input', onInput);

    function loop() { frame = requestAnimationFrame(loop); }
    frame = requestAnimationFrame(loop);

    return function cleanup() {
      control.removeEventListener('input', onInput);
      cancelAnimationFrame(frame);
    };
  };
}(window.NEXO));
```

**Reglas que no son opcionales:**

| Regla | Por qué |
|---|---|
| Prefija **todos** los IDs con el contador `serial` | Dos instancias del mismo banco romperían `label[for]` y `aria-labelledby` |
| Busca siempre desde `root`, nunca desde `document` | Un banco no debe alcanzar elementos de otro |
| `cleanup()` retira **cada** listener y cancela **cada** RAF | Sin esto el sitio se ralentiza al navegar entre rutas |
| Todo `input` y `select` necesita `label[for]` o `aria-label` | La auditoría rechaza controles sin nombre accesible |
| Un `<title>` de SVG no puede compartir ID con un encabezado | Ya ocurrió una vez; la auditoría ahora lo detecta |
| Usa solo variables de `styles/tokens.css` | Un literal de color rompe el tema al cambiar la paleta |

**3. Conecta el montaje** en el enrutador, después de insertar el HTML, y añade su `cleanup`
al arreglo `cleanups`. El enrutador invoca todas las limpiezas al cambiar de ruta.

**4. Estilos:** reutiliza `.sensor-experiment`, `.experiment-grid` y `.sensor-controls`.

---

## Límites conocidos de la versión actual

- La carga de contenido es explícita en `index.html`: no hay descubrimiento automático de archivos,
  porque cualquier carga dinámica rompería la ejecución con `file://`.
- Agregar texto reutiliza el renderizador existente. Agregar una física nueva requiere código nuevo.
- Los temas futuros se muestran como estados honestos, nunca como enlaces a lecciones inexistentes.
