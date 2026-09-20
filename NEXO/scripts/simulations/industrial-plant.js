// scripts/simulations/industrial-plant.js — SVG original y controles locales, sin red.
(function (N) {
  'use strict';
  let nextId = 0;
  const mounts = new WeakMap();
  const choices = {
    precision: [['basic', 'Básica: giro o dos estados'], ['indexed', 'Incrementos sin verificar llegada'], ['verified', 'Posición medida y corregida']],
    load: [['light', 'Ligera / tarea no mecánica'], ['medium', 'Media'], ['heavy', 'Alta']],
    budget: [['low', 'Bajo'], ['medium', 'Medio'], ['high', 'Alto']],
    speed: [['slow', 'Lenta'], ['normal', 'Moderada'], ['fast', 'Rápida']]
  };
  const sourceNames = { ac: 'Red AC compatible', dc: '24 V DC', air: 'Aire comprimido preparado', hydraulic: 'Central hidráulica operativa' };
  function machine(type, prefix) {
    const metal = `url(#${prefix}-metal)`;
    const motor = `<rect x="33" y="24" width="58" height="43" rx="12" fill="${metal}"/><path d="M45 29v33m10-33v33m10-33v33m10-33v33" class="industry-fin"/><path d="M90 46h27" class="industry-shaft"/>`;
    const fan = `<circle cx="89" cy="46" r="34" fill="${metal}"/><circle cx="89" cy="46" r="27" fill="var(--surface)" stroke="var(--text)" stroke-width="1.5"/><path d="M89 46C48 11 93 6 89 46C134 23 136 65 89 46C90 96 43 72 89 46Z" fill="${metal}"/><circle cx="89" cy="46" r="7" fill="var(--accent)" stroke="var(--text)" stroke-width="1.2"/><circle cx="89" cy="46" r="30" class="industry-flow"/>`;
    const tank = `<path d="M48 21Q87 4 126 21V66Q87 88 48 66Z" fill="${metal}"/><ellipse cx="87" cy="21" rx="39" ry="10" fill="var(--band-sage)" stroke="var(--text)" stroke-width="1.5"/><path d="M61 50Q88 58 114 50V64Q88 78 61 64Z" fill="var(--cyan)" opacity=".28"/>`;
    const drawings = {
      belt: `<rect x="19" y="41" width="150" height="29" rx="14" fill="${metal}"/><rect x="25" y="46" width="138" height="18" rx="9" fill="var(--surface)" stroke="var(--text)" stroke-width="1.5"/><path d="M30 55H158" class="industry-flow"/><path d="M39 70v13m111-13v13" class="industry-shaft"/><path d="M68 40V19h33v21" fill="var(--band-sage)" stroke="var(--text)" stroke-width="1.5"/>`,
      robot: `<path d="M42 82h110M65 79V57l34-29 35 11 18-18" class="industry-arm"/><circle cx="66" cy="57" r="9" fill="${metal}"/><circle cx="99" cy="28" r="9" fill="${metal}"/><path d="M143 15l16 9 8-11m-16 10 7 12" class="industry-flow"/>`,
      pump: `${motor}<path d="M118 22v-9h41m-41 54v17H19" class="industry-pipe"/><circle cx="117" cy="45" r="25" fill="${metal}"/><circle cx="117" cy="45" r="14" fill="var(--accent)" stroke="var(--text)" stroke-width="1.5"/><path d="M108 45h18M118 14h37" class="industry-flow"/>`,
      tank: `${tank}<path d="M18 14h19q10 0 10 10m79 42h33V39" class="industry-pipe"/><path d="M20 14h24M130 66h28" class="industry-flow"/><path d="M138 14v37" class="industry-shaft"/>`,
      valve: `<path d="M17 57H170" class="industry-pipe"/><rect x="70" y="42" width="43" height="31" rx="5" fill="${metal}"/><path d="M79 19h25v23H79Z" fill="var(--band-sage)" stroke="var(--text)" stroke-width="1.5"/><path d="M84 21v17m7-17v17m7-17v17" class="industry-fin"/><path d="M23 57h137" class="industry-flow"/>`,
      alarm: `<rect x="38" y="14" width="109" height="67" rx="12" fill="${metal}"/><circle cx="67" cy="39" r="13" fill="var(--accent)" stroke="var(--text)" stroke-width="1.5"/><path d="M92 46h13l16-14v31l-16-13H92Z" fill="var(--text)"/><path d="M128 34q14 13 0 27" class="industry-flow"/><path d="M55 65h25" class="industry-fin"/>`,
      fan: fan,
      extractor: `<path d="M22 20h42m-42 53h42m54-53h47v-9m-47 62h47v13" class="industry-pipe"/>${fan}<path d="M19 46h27m87 0h37" class="industry-flow"/>`,
      mixer: `${tank}<rect x="73" y="1" width="28" height="18" rx="4" fill="${metal}"/><path d="M87 17v49m-24-9 47 10m-47 0 47-10" class="industry-shaft"/><path d="M59 45q28-13 57 0" class="industry-flow"/>`,
      position: `<path d="M22 68h143M32 36h126" class="industry-shaft"/><path d="M23 54h142" class="industry-flow"/><rect x="69" y="30" width="52" height="43" rx="5" fill="${metal}"/><path d="M78 38h34m-34 7h34" class="industry-fin"/><rect x="16" y="43" width="21" height="23" rx="5" fill="var(--band-sage)" stroke="var(--text)" stroke-width="1.5"/>`,
      process: `<rect x="22" y="32" width="67" height="35" rx="9" fill="${metal}"/><path d="M89 50h48m0-16v33" class="industry-shaft"/><path d="M27 30V14h44v16" class="industry-flow"/><rect x="142" y="35" width="24" height="31" rx="3" fill="var(--band-sage)" stroke="var(--text)" stroke-width="1.5"/><path d="M17 80h152" class="industry-fin"/>`
    };
    return drawings[type] || motor;
  }
  function plant(prefix) {
    const e = N.ui.escape;
    return `<svg viewBox="0 0 900 600" aria-hidden="true" focusable="false" class="industry-map"><defs><!-- Rampa de metal en clave clara: blanco → papel → gris cálido, con un salto de brillo
        en .49/.53 que da el reflejo. Los pasos --metal-* se derivan de la paleta en tokens.css. --><linearGradient id="${prefix}-metal" x1="0" y1="0" x2="0.8" y2="1"><stop stop-color="var(--metal-1)"/><stop offset=".24" stop-color="var(--metal-2)"/><stop offset=".49" stop-color="var(--metal-4)"/><stop offset=".53" stop-color="var(--surface)"/><stop offset="1" stop-color="var(--metal-5)"/></linearGradient></defs><path d="M35 100H865Q885 100 885 190V220Q885 250 860 250H40Q15 250 15 300V380Q15 400 45 400H865" class="industry-trunk"/>${N.content.industrialCases.map((item, i) => {
      const x = 27 + i % 4 * 222, y = 19 + Math.floor(i / 4) * 191;
      return `<g transform="translate(${x} ${y})" data-industry-node="${e(item.id)}" class="industry-station"><rect width="200" height="163" rx="22" class="industry-station-card"/><text x="15" y="24" class="industry-station-index">${String(i + 1).padStart(2, '0')} / ${e(item.tag)}</text><g transform="translate(6 35)">${machine(item.drawing, prefix)}</g><circle cx="17" cy="145" r="4" class="industry-node-light"/><text x="29" y="149" class="industry-station-label">${e(item.name)}</text></g>`;
    }).join('')}<text x="698" y="466" class="industry-map-note">UNA PLANTA.</text><text x="698" y="490" class="industry-map-note">ONCE DECISIONES.</text><text x="698" y="521" class="industry-station-index">ESQUEMA CONCEPTUAL</text></svg>`;
  }
  N.Simulations.industryMarkup = function () {
    const e = N.ui.escape, prefix = 'industry-' + (++nextId);
    const labels = { precision: 'Precisión / tipo de control', load: 'Carga relativa del ejemplo', budget: 'Presupuesto relativo del conjunto', speed: 'Velocidad / rapidez relativa' };
    return `<article class="sensor-experiment industry-lab" data-industry-root aria-labelledby="${prefix}-title"><header><p class="sensor-eyebrow">PLANTA VIVA / DECIDIR CON CRITERIO</p><h3 id="${prefix}-title">Una tarea. No cualquier actuador.</h3><p>Explora once estaciones y cambia las condiciones. El dibujo es conceptual: no representa conexiones reales, tiempos ni una secuencia de producción.</p></header><details class="industry-criteria"><summary>Los siete criterios: qué mirar y qué comparar</summary><div class="industry-criteria-grid">${N.content.industrialCriteria.map((criterion, i) => `<section><span class="sensor-eyebrow">0${i + 1}</span><h4>${e(criterion.name)}</h4><p><strong>${e(criterion.question)}</strong></p><p>${e(criterion.explanation)}</p><p>${e(criterion.decision)}</p></section>`).join('')}</div></details><div class="industry-plant"><div class="industry-plant-toolbar"><p class="sensor-eyebrow">MAPA / SOLO SE MUEVE LA ESTACIÓN ACTIVA</p><button class="sensor-button" type="button" data-industry-pause aria-pressed="false">Pausar animación</button></div>${plant(prefix)}<p class="sensor-note">Selecciona una estación en el dibujo o con estos botones equivalentes. La animación suave es decorativa; con movimiento reducido permanece quieta.</p><div class="industry-station-buttons" aria-label="Estaciones de la planta">${N.content.industrialCases.map((item, i) => `<button type="button" data-industry-case="${e(item.id)}" aria-pressed="${i === 0}" aria-controls="${prefix}-detail"><span>${String(i + 1).padStart(2, '0')}</span>${e(item.name)}</button>`).join('')}</div></div><section class="industry-case-detail" id="${prefix}-detail" data-industry-detail></section><section class="industry-selector" aria-labelledby="${prefix}-selector"><p class="sensor-eyebrow">RETO / SELECCIÓN EXPLICABLE</p><h3 id="${prefix}-selector">Selecciona el actuador correcto</h3><p>Al cambiar de caso se cargan condiciones iniciales sugeridas; tus fuentes disponibles se conservan. Puedes modificar cualquier condición. Ninguna selección garantiza un equipo real adecuado.</p><div class="industry-form"><label class="industry-case-field">Caso industrial<select data-industry-scenario>${N.content.industrialCases.map((item) => `<option value="${e(item.id)}">${e(item.name)}</option>`).join('')}</select></label>${Object.keys(choices).map((key) => `<label>${labels[key]}<select data-industry-constraint="${key}">${choices[key].map(([value, label]) => `<option value="${value}">${e(label)}</option>`).join('')}</select></label>`).join('')}<fieldset class="industry-sources"><legend>Disponibilidad de alimentación — filtro obligatorio</legend>${Object.keys(sourceNames).map((id) => `<label><input type="checkbox" data-industry-source="${id}" ${['ac', 'dc'].includes(id) ? 'checked' : ''}> ${sourceNames[id]}</label>`).join('')}<p>Marca solo la infraestructura que ya existe. No añadimos fuentes ni convertidores automáticamente. Neumática e hidráulica requieren además 24 V DC para la válvula de mando del ejemplo.</p></fieldset></div><p class="sensor-note">Clases cualitativas, no valores de kg, rpm ni dinero. Para bombeo, válvulas y avisos usa «Ligera / tarea no mecánica»: una carga alta no equivale a presión alta.</p><p class="industry-status" data-industry-status role="status" aria-live="polite" aria-atomic="true"></p><div data-industry-results></div></section></article>`;
  };
  N.Simulations.mountIndustry = function (root) {
    const host = root.matches('[data-industry-root]') ? root : root.querySelector('[data-industry-root]');
    if (!host) return function () {};
    if (mounts.has(host)) mounts.get(host)();
    const e = N.ui.escape, q = (name) => host.querySelector('[data-industry-' + name + ']');
    let currentId = N.content.industrialCases[0].id, paused = false, disposed = false;
    function paintActive() {
      host.querySelectorAll('[data-industry-node]').forEach((node) => {
        const active = node.dataset.industryNode === currentId;
        node.classList.toggle('is-active', active);
        node.classList.toggle('animate', active && !paused && !disposed);
      });
      host.querySelectorAll('[data-industry-case]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.industryCase === currentId)));
      q('pause').setAttribute('aria-pressed', String(paused));
      q('pause').textContent = paused ? 'Reanudar animación' : 'Pausar animación';
    }
    function constraints() {
      const input = { supplies: Array.from(host.querySelectorAll('[data-industry-source]:checked'), (node) => node.dataset.industrySource) };
      host.querySelectorAll('[data-industry-constraint]').forEach((node) => { input[node.dataset.industryConstraint] = node.value; });
      return input;
    }
    function renderResults() {
      const result = N.Models.selection.recommend(currentId, constraints());
      const best = result.recommendation;
      q('status').textContent = best ? 'Opción educativa preferida: ' + best.name + '. ' + result.ranked.length + ' opción(es) compatibles en este catálogo.' : 'Sin opción compatible. No se recomienda ningún actuador con las condiciones actuales.';
      const compare = result.ranked.slice(0, 3);
      q('results').innerHTML = `<div class="industry-verdict"><h4>${best ? e(best.name) : 'No forzar una recomendación'}</h4><p>${best ? 'Primero se comprobó la fuente; después, tarea, precisión, carga, rapidez y presupuesto. Solo entonces se ordenaron las opciones compatibles.' : 'Revisa los descartes: puede faltar una fuente o sobrar una exigencia. Cambia únicamente condiciones que tu tarea pueda aceptar. También puede ser necesario un equipo fuera de este catálogo.'}</p>${best ? `<ul>${best.reasons.map((reason) => `<li>${e(reason)}</li>`).join('')}</ul><p><strong>Supuesto del conjunto:</strong> ${e(best.assumption)}</p>` : ''}</div>${compare.length ? `<details class="industry-comparison" open><summary>Comparar decisiones con los siete criterios</summary><div class="industry-table-scroll" role="region" aria-label="Comparación de opciones compatibles" tabindex="0"><table><caption>Conjuntos compatibles del ejemplo; no son especificaciones de fabricante.</caption><thead><tr><th scope="col">Criterio</th>${compare.map((item) => `<th scope="col">${e(item.name)}</th>`).join('')}</tr></thead><tbody>${N.content.industrialCriteria.map((criterion, index) => `<tr><th scope="row">${e(criterion.name)}</th>${compare.map((item) => `<td>${e(item.traits[index])}</td>`).join('')}</tr>`).join('')}</tbody></table></div></details>` : ''}<details><summary>Cómo se ordenan las opciones compatibles (${result.ranked.length})</summary><p>Afinidad con esta tarea (1–5) × 10 + margen de costo (presupuesto − costo, ambos 1–3) × 2. No se puntúan candidatos descartados. Los puntos son una regla pedagógica, no eficiencia ni porcentaje de seguridad.</p>${result.ranked.length ? `<ol>${result.ranked.map((item, i) => `<li><strong>${e(item.name)} · ${item.score} puntos educativos</strong><p>${e(item.breakdown.join(' '))}</p><p>${e(item.assumption)}</p>${i ? '<p>Compatible, pero queda detrás por la regla de puntos o el desempate por identificador; no significa que sea inferior en todo.</p>' : ''}</li>`).join('')}</ol>` : '<p>No hay candidatos a los que asignar puntos.</p>'}</details><details><summary>Por qué se descartan las otras alternativas (${result.rejected.length})</summary><ul class="industry-rejections">${result.rejected.map((item) => `<li><strong>${e(item.name)}</strong><ul>${item.reasons.map((reason) => `<li>${e(reason)}</li>`).join('')}</ul></li>`).join('')}</ul></details><details><summary>Paso a paso frente a servo: no confundir ordenar con medir</summary><p>El paso a paso del ejemplo divide el giro en incrementos. Sin encoder cuenta órdenes, no confirma el movimiento: una carga o aceleración excesiva puede causar pasos perdidos. Una referencia inicial tampoco verifica cada llegada.</p><p>El servo añade un encoder (sensor de posición) y un lazo que corrige el error medido. Es una opción para posición verificada y movimientos rápidos, con más costo y ajuste. No elimina holguras, saturación ni límites mecánicos.</p><p>Este catálogo usa paso a paso DC y servo AC. Existen servos DC y pasos a paso con realimentación, pero no se presuponen aquí para saltarse una fuente ausente.</p></details><details><summary>Supuestos y límites: leer antes de trasladarlo a una máquina</summary><ul>${result.assumptions.map((text) => `<li>${e(text)}</li>`).join('')}</ul><p>Un diseño real debe dimensionarse y validarse con documentación del fabricante, protecciones y análisis de la tarea. Este selector no autoriza operar equipos.</p></details>`;
    }
    function selectCase(id) {
      const item = N.content.industrialCases.find((entry) => entry.id === id);
      if (!item) return;
      currentId = id;
      q('scenario').value = id;
      host.querySelectorAll('[data-industry-constraint]').forEach((node) => { node.value = item.defaults[node.dataset.industryConstraint]; });
      q('detail').innerHTML = `<p class="sensor-eyebrow">ESTACIÓN SELECCIONADA / ${e(item.tag)}</p><h3>${e(item.name)}</h3><p>${e(item.application)}</p><details open><summary>Cómo funciona y por qué elegirlo</summary><p>${e(item.works)}</p><p>${e(item.why)}</p></details><details><summary>Por qué otros no resuelven esta misma tarea</summary><p>${e(item.others)}</p></details>`;
      paintActive(); renderResults();
    }
    function click(event) {
      if (disposed || !event.target.closest) return;
      const station = event.target.closest('[data-industry-case], [data-industry-node]');
      if (station && host.contains(station)) selectCase(station.dataset.industryCase || station.dataset.industryNode);
      if (event.target.closest('[data-industry-pause]')) { paused = !paused; paintActive(); }
    }
    function change(event) {
      if (disposed) return;
      if (event.target.matches('[data-industry-scenario]')) selectCase(event.target.value);
      else if (event.target.matches('[data-industry-constraint], [data-industry-source]')) renderResults();
    }
    function cleanup() {
      if (disposed) return;
      disposed = true;
      host.removeEventListener('click', click); host.removeEventListener('change', change);
      host.querySelectorAll('.industry-station.animate').forEach((node) => node.classList.remove('animate'));
      mounts.delete(host);
    }
    host.addEventListener('click', click); host.addEventListener('change', change);
    selectCase(currentId); mounts.set(host, cleanup);
    return cleanup;
  };
}(window.NEXO));
