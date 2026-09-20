<!-- docs/cobertura-temario.md -->
# Cobertura del temario oficial — Tema I y Tema II

Documento único de correspondencia entre el temario oficial y lo implementado.

Cómo leer las columnas:

- **Dónde** es la ruta y la sección concreta donde el punto está tratado.
- **Cómo se aprende** distingue si el punto es solo texto o si además hay una simulación que se puede manipular.
- Un punto marcado como **interactivo** significa que existe un control que cambia el resultado,
  no solo una ilustración.

---

## Tema I — Sensores (20 puntos oficiales)

Ruta: `index.html#/sensores` · Contenido: `content/tema-01.js`

| N.º | Punto oficial | Dónde | Cómo se aprende |
|---|---|---|---|
| 1 | Concepto de sensor | De la magnitud a la señal | Texto + banco de nivel: se ve la transducción en vivo |
| 2 | Detección discreta y analógica | De la magnitud a la señal | **Interactivo**: nivel, umbral, NO/NC, salida 0–10 V y 4–20 mA |
| 3 | Sensores ópticos | Luz, detección y materiales | **Interactivo**: banco óptico con anatomía seleccionable |
| 4 | Fuente o emisor | Anatomía del sensor óptico | **Interactivo**: seleccionar la pieza explica LED/IR/láser y modulación |
| 5 | Receptor | Anatomía del sensor óptico | **Interactivo**: fotodiodo y fototransistor, luz a corriente |
| 6 | Lentes | Anatomía del sensor óptico | **Interactivo**: dirección del haz y campo de visión |
| 7 | Circuito de salida | Anatomía del sensor óptico | **Interactivo**: comparación con umbral, NPN/PNP, NO/NC |
| 8 | Barrera | Modos de detección óptica | **Interactivo**: emisor y receptor enfrentados |
| 9 | Reflexivo | Modos de detección óptica | **Interactivo**: reflector, objeto brillante y su fallo típico |
| 10 | Difuso o proximidad | Modos de detección óptica | **Interactivo**: acabado y distancia del objeto |
| 11 | Sensores de proximidad | Banco de proximidad | **Interactivo**: campo sin contacto, distancia, histéresis |
| 12 | Capacitivo | Banco de proximidad | **Interactivo**: material, pared aislante, sensibilidad, humedad |
| 13 | Inductivo | Banco de proximidad | **Interactivo**: metales, Foucault, diferencia acero/aluminio |
| 14 | Infrarrojo | Banco de proximidad | **Interactivo**: IR activo, y distinción explícita frente a PIR térmico |
| 15 | Sensores de temperatura | Temperatura y presión | **Interactivo**: cuatro curvas simultáneas comparables |
| 16 | Termistor | Temperatura y presión | **Interactivo**: sensibilidad y no linealidad visibles en la curva |
| 17 | NTC y PTC | Temperatura y presión | **Interactivo**: beta de la NTC, PTC conceptual, aviso fuera de rango |
| 18 | RTD | Temperatura y presión | **Interactivo**: Pt100, 100 Ω a 0 °C, Callendar–Van Dusen |
| 19 | Termopar | Temperatura y presión | **Interactivo**: tipo K, Seebeck, junta fría |
| 20 | Presión | Temperatura y presión | **Interactivo**: membrana, referencia absoluta/manométrica/diferencial, alarma |

**Cierre:** 15 preguntas con explicación, resumen de cada caso y reintento (`Comprueba tu criterio`).
No emite calificación oficial. El resultado vive solo durante la visita.

---

## Tema II — Actuadores

Ruta: `index.html#/actuadores` · Contenido: `content/tema-02.js`, `content/industrial-cases.js`

### Fundamento y clasificación

| Punto oficial | Dónde | Cómo se aprende |
|---|---|---|
| Concepto de actuador | De la orden a la energía | Texto + cadena energética dibujada |
| Conversión de energía | De la orden a la energía | **Interactivo**: seguir la energía de entrada a efecto |
| Controlador y etapa de potencia | Banco eléctrico | **Interactivo**: se puede mantener la orden y retirar la alimentación |
| Clasificación por fuente | Siete formas de actuar | **Interactivo**: eléctrico, mecánico, neumático, hidráulico |

### Dispositivos eléctricos (7 fichas)

| Dispositivo | Cómo se aprende |
|---|---|
| Motor DC | Ficha + comparación AC/DC: escobillas, PWM, inversión de giro |
| Motor AC | Ficha + comparación: inducción, frecuencia, polos, deslizamiento |
| Motor paso a paso | **Interactivo**: pulso único, fases, dirección, frecuencia, pérdida de pasos |
| Válvula solenoide | **Interactivo**: despiece con secuencia causal bobina → campo → émbolo → paso |
| Motobomba | Ficha centrífuga: energía al líquido y límites del circuito |
| Piloto luminoso | **Interactivo**: estado ON/OFF visual acompañado siempre de texto |
| Zumbador | **Interactivo**: indicación visual; el audio solo suena si se pide |

### Mecánica e hidráulica

| Punto oficial | Dónde | Cómo se aprende |
|---|---|---|
| Actuadores mecánicos | Movimiento, presión y flujo | **Interactivo**: husillo-tuerca y piñón-cremallera, giro a traslación |
| Actuadores hidráulicos | Movimiento, presión y flujo | **Interactivo**: presión, área, fuerza y caudal por separado |
| Cilindro de simple efecto | Movimiento, presión y flujo | **Interactivo**: avance por presión, retorno por resorte de capacidad finita |
| Cilindro de doble efecto | Movimiento, presión y flujo | **Interactivo**: área anular de retorno frente al área de avance |
| Hidráulico rotativo | Movimiento, presión y flujo | **Interactivo**: desplazamiento volumétrico, caudal y par |

### Criterios de selección (7 criterios)

Sección `Elegir para un trabajo real`. Cada criterio incluye pregunta guía, explicación y regla de decisión:
potencia, controlabilidad, peso/volumen, precisión, velocidad, mantenimiento y costo total.

**Interactivo:** el selector descarta candidatos por fuente de energía incompatible y explica
por qué unas alternativas encajan mejor. Las puntuaciones son didácticas, no dimensionamiento.

### Aplicaciones industriales (11 estaciones)

| # | Estación | Verbo | Actuador recomendado en el ejemplo |
|---|---|---|---|
| 1 | Bandas transportadoras | TRANSPORTAR | Motor AC con variador |
| 2 | Robots | COORDINAR | Servomotor con encoder |
| 3 | Bombeo | TRANSFERIR | Motobomba |
| 4 | Control de líquidos | ADMITIR | Electroválvula |
| 5 | Electroválvulas | CONMUTAR | Solenoide 2/2 monoestable |
| 6 | Alarmas | AVISAR | Zumbador y piloto, complementarios |
| 7 | Ventiladores | VENTILAR | Motor AC, o DC pequeño |
| 8 | Extractores | EXTRAER | Motor AC con variador |
| 9 | Mezcladoras | MEZCLAR | Motor AC con reductor |
| 10 | Posicionamiento | UBICAR | Paso a paso, o servo si hay que verificar |
| 11 | Procesos automatizados | EMPUJAR | Cilindro neumático, hidráulico si la carga es alta |

Cada estación explica **cómo funciona**, una **aplicación concreta**, **por qué** encaja el recomendado
y **por qué se descartan** las otras opciones.

---

## Integración Tema I + Tema II

Ruta: `index.html#/integracion` · Contenido: `content/integration.js`

| Caso | Cadena | Qué se aprende al manipularlo |
|---|---|---|
| Cámara térmica | NTC → controlador → ventilador | Histéresis, lazo cerrado frente a abierto, equilibrio térmico |
| Banda de inspección | Inductivo → motor DC | Detección de presencia metálica detiene el avance; el plástico no |
| Depósito presurizado | Transmisor 4–20 mA → electroválvula | Abrir alivia, pero no detiene el aporte |

Cada caso pide una **predicción antes de responder**. Se cierra con 10 preguntas de integración.

---

## Lo que NO cubre esta entrega

Declarado con claridad para no aparentar más de lo que hay:

- **Tema III (Microcontroladores)** y **Tema IV (Programación de microcontroladores)** aparecen
  en la navegación como **previstos**, con sus objetivos declarados y sin contenido inventado.
- Ningún modelo sustituye una hoja de datos, un cálculo de dimensionamiento ni una norma de seguridad.
  Cada banco declara sus simplificaciones en su propio texto.
- La evaluación es una ayuda de estudio. No es una calificación oficial ni una certificación.
