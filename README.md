# NEXO — Percibe. Decide. Actúa.

Sitio educativo interactivo de **Sistemas Programables** · Ingeniería en Sistemas Computacionales.
Base académica: antología del Instituto Tecnológico Superior de Uruapan.

El contenido, la documentación y la guía de uso viven en [`NEXO/LEEME.md`](NEXO/LEEME.md).

---

## Dos formas de verlo

**En línea:** el sitio se publica desde este repositorio con Vercel.

**Sin internet:** descarga el repositorio, extrae y abre `NEXO/index.html` con doble clic.
No requiere instalar nada, ni terminal, ni servidor. Ese es el requisito de la entrega, y se
mantiene intacto: el hosting es un extra, no una dependencia.

---

## Por qué no hay build

HTML, CSS, JavaScript clásico y SVG dibujado a mano. Sin framework, sin empaquetador, sin CDN,
sin API remota, sin fuentes descargadas. Todas las rutas de recurso son relativas y el enrutado
usa fragmentos (`#/sensores`), así que **el mismo árbol de archivos funciona igual desde
`file://` que desde un dominio**, sin ninguna regla de servidor.

`vercel.json` solo declara que la raíz pública es `NEXO/` y que no hay nada que compilar.

---

## Estructura

| Ruta | Función |
|---|---|
| `NEXO/` | El sitio completo. Es también el contenido exacto del ZIP de entrega |
| `NEXO/docs/` | Cobertura del temario, validación, guion del reporte y lista de verificación |
| `NEXO/tests/` | Pruebas repetibles; se abren con doble clic, sin instalar nada |
| `vercel.json` | Publica `NEXO/` como raíz, sin build |

El detalle de la arquitectura por capas está en `NEXO/LEEME.md`.

---

## Estado verificado

- **184/184** comprobaciones de estructura, semántica y lógica sobre DOM sintético.
- **0 fallos** de contraste, desbordes, foco visible y consola, medidos en navegador real
  en 4 rutas × 3 anchos (360, 768 y 1440 px).

Qué está medido, con qué método y qué sigue sin comprobar: [`NEXO/docs/validacion.md`](NEXO/docs/validacion.md).
Las herramientas de auditoría no se versionan aquí: son internas y no forman parte de la entrega.
