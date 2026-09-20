<!-- docs/guion-reporte.md -->
# Guion para armar el reporte PDF

Documento de trabajo **para ti**, no para el profesor. No lo incluyas en el PDF.

Archivo final: `ApellidoNombrePaginaSistemasProgramablesT2.pdf`
(sustituye `ApellidoNombre` por los tuyos, sin espacios ni acentos).

Orden sugerido: **10 secciones, 8 capturas**. Cada bloque dice qué fotografiar y qué escribir debajo.

---

## 1. Portada

Sin captura.

- Nombre completo, número de control, carrera, materia, tema, fecha.
- Título del trabajo: *Sitio web interactivo de Sistemas Programables — Tema II: Actuadores*.
- Menciona que es **acumulativo**: incluye Tema I y la integración de ambos.

---

## 2. Introducción (media página)

Sin captura.

Responde tres cosas, con tus palabras:

- Qué es el sitio: una página que **se abre con doble clic**, sin instalar nada y sin internet.
- Por qué se hizo así: para que cualquiera pueda ejecutarlo en cualquier computadora.
- Qué lo diferencia de un documento: aquí **se manipulan** los sistemas, no solo se leen.

Frase útil: *«La interactividad no es decorativa: cada control existe porque enseña algo que un texto no puede mostrar.»*

---

## 3. Captura 1 — Portada del sitio

**Cómo tomarla:** abre `index.html`, ruta `#/inicio`, ventana maximizada, sin desplazar.

**Qué escribir:** describe el lazo de control que se ve en la portada (sensor → controlador →
potencia → ventilador → proceso) y menciona que la portada **ya es una simulación**, no una imagen.

---

## 4. Captura 2 — Lazo cerrado frente a lazo abierto

**Cómo tomarla:** en la portada, sube la carga térmica, deja correr la simulación y captura el
gráfico cuando se note la diferencia entre lazo cerrado y abierto.

**Qué escribir:** explica la histéresis con tus palabras: por qué el ventilador no se enciende y
apaga constantemente cerca del umbral, y por qué el lazo abierto no corrige.

---

## 5. Captura 3 — Tema I, banco de sensores ópticos

**Cómo tomarla:** ruta `#/sensores`, sección de sensores ópticos, con una pieza seleccionada
(emisor, receptor, lente o circuito de salida) para que se vea la explicación desplegada.

**Qué escribir:** enumera las cuatro partes del sensor óptico y los tres modos de detección
(barrera, reflexivo, difuso). Añade una limitación real: por ejemplo, que un reflexivo puede
fallar con un objeto muy brillante.

---

## 6. Captura 4 — Tema I, curvas de temperatura

**Cómo tomarla:** ruta `#/sensores`, banco de temperatura, con las cuatro curvas visibles.
Mejor si mueves la temperatura hasta que aparezca un aviso de fuera de rango.

**Qué escribir:** compara NTC, PTC, RTD y termopar en una frase cada uno. Cierra explicando
por qué **ninguno sirve para todo**: cada tecnología tiene rango, linealidad y costo distintos.

---

## 7. Captura 5 — Tema II, orden sin alimentación

**Cómo tomarla:** ruta `#/actuadores`, banco eléctrico. Selecciona un dispositivo, **ordena la
acción** y después **desmarca la alimentación de potencia**. Captura el mensaje que aparece.

**Qué escribir:** ésta es la captura más importante del Tema II. Explica que **la señal de mando
y la energía son cosas distintas**: un controlador ordena, pero no alimenta. Es el concepto que
más se confunde y el sitio lo demuestra dejándote provocar el fallo.

---

## 8. Captura 6 — Tema II, motor paso a paso

**Cómo tomarla:** ruta `#/actuadores`, banco del paso a paso. Envía pulsos, aumenta la carga
hasta provocar **pérdida de pasos** y captura ese estado.

**Qué escribir:** explica la relación impulsos → ángulo → posición, y por qué **ordenar un paso no
garantiza que ocurra**. Menciona que sin realimentación el controlador no se entera del error.

---

## 9. Captura 7 — Selector de actuador y aplicaciones

**Cómo tomarla:** ruta `#/actuadores`, sección de selección. Elige una estación (por ejemplo
*Posicionamiento*), ajusta las necesidades y captura la recomendación **con su justificación**.

**Qué escribir:** lista los siete criterios de selección. Explica una decisión concreta: por qué
en esa estación gana el actuador recomendado y **por qué se descartan** los otros. Añade que el
selector es una guía didáctica, no un cálculo de dimensionamiento.

---

## 10. Captura 8 — Integración

**Cómo tomarla:** ruta `#/integracion`, uno de los tres casos, después de haber hecho tu predicción.

**Qué escribir:** describe la cadena completa sensor → controlador → driver → actuador → proceso,
y cierra con la idea del curso: **en lazo cerrado, el efecto de la acción se vuelve a medir**.

---

## 11. Conclusiones (media página)

Sin captura. Escribe con honestidad, no con adjetivos. Sugerencias:

- Qué entendiste al **manipular** que no habías entendido leyendo.
- Una limitación reconocida del proyecto (los modelos son ideales y lo declaran).
- Qué añadirías: Tema III y IV están previstos y la estructura ya admite agregarlos.

---

## 12. Referencias

- Antología de Sistemas Programables, unidades 1 y 2.
- Indica que los modelos físicos son **simplificaciones didácticas propias**, no datos de fabricante.

---

## Antes de exportar el PDF

- [ ] Las 8 capturas son legibles a tamaño real, no recortes borrosos.
- [ ] Cada captura tiene pie de figura numerado.
- [ ] No queda texto de relleno ni instrucciones de este guion.
- [ ] El nombre del archivo sigue el formato pedido.
- [ ] El ZIP se llama igual que el PDF, con extensión `.zip`.
