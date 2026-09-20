// scripts/components/actuator-lesson.js
(function (N) {
  'use strict';
  const families = [
    { name: 'Eléctrico', source: 'Fuente eléctrica', converter: 'Driver + motor', output: 'Giro o traslación con transmisión', example: 'Robot, alimentador o mesa', trade: 'Control electrónico flexible. Precisión y mantenimiento dependen de motor, transmisión y realimentación.' },
    { name: 'Mecánico', source: 'Movimiento de entrada', converter: 'Husillo / engranajes', output: 'Movimiento transformado', example: 'Elevación o posicionamiento', trade: 'Transmite energía, no la crea. Holgura, rigidez, eficiencia y autobloqueo dependen del mecanismo.' },
    { name: 'Neumático', source: 'Aire comprimido', converter: 'Válvula + cilindro', output: 'Fuerza y desplazamiento', example: 'Expulsión o sujeción de piezas', trade: 'Rápido en maniobras simples; compresibilidad, ruido y preparación del aire importan. No es intrínsecamente seguro en todo ambiente.' },
    { name: 'Hidráulico', source: 'Fluido presurizado', converter: 'Válvula + cilindro / motor', output: 'Fuerza o par elevados', example: 'Prensa o maquinaria de carga', trade: 'Alta densidad de fuerza. Necesita suministro, filtración y cuidado de fugas y energía acumulada.' }
  ];
  function familyMarkup() {
    return `<article class="sensor-experiment"><p class="sensor-eyebrow">CLASIFICACIÓN / SIGUE LA ENERGÍA</p><h3>No todas las acciones nacen igual.</h3><div class="sensor-buttons" aria-label="Familias de actuadores">${families.map((f, i) => `<button type="button" class="sensor-button" data-family="${i}" aria-pressed="${i === 0}">${f.name}</button>`).join('')}</div><div class="family-chain" data-family-chain></div><p class="sensor-result" data-family-detail role="status"></p><p class="sensor-note">La rúbrica agrupa «mecánicos o neumáticos». Se distinguen aquí el mecanismo de transmisión y la fuente de energía para evitar confundirlos.</p></article>`;
  }
  N.ui.actuatorLesson = function () {
    const data = N.content.actuadores, e = N.ui.escape;
    const labs = [familyMarkup, () => `<div id="electric-bank">${N.Simulations.electricMarkup()}</div>`, () => `<div id="motors-bank">${N.Simulations.motorsMarkup()}</div>`, () => `<div id="mechanics-bank">${N.Simulations.mechanicsMarkup()}</div>`, () => `<div id="industry-bank">${N.Simulations.industryMarkup()}</div>`];
    return `<div class="actuators-theme"><section class="lesson-hero section-shell accent-amber"><a class="back-link" href="#/inicio">← Volver al inicio</a><div class="lesson-hero-grid"><div><p class="eyebrow">TEMA II / ACTUADORES</p><h1 tabindex="-1">${e(data.title).replace(/\n/g, '<br>')}</h1><p class="lesson-subtitle">${e(data.subtitle)}</p><div class="sensor-header-tags"><span>7 dispositivos eléctricos</span><span>Impulsos → movimiento</span><span>Presión × área → fuerza</span></div></div><div class="lesson-art">${N.ui.symbol('actuator')}<span class="eyebrow">ORDEN → POTENCIA → ACCIÓN</span></div></div><p class="sensor-release-note">${e(data.note)}</p></section><div class="sensor-lesson-layout section-shell"><aside class="lesson-sidebar"><p class="eyebrow">RECORRIDO / TEMA II</p><nav aria-label="Secciones de actuadores">${data.sections.map((s, i) => `<button class="section-link" type="button" data-jump="actuator-section-${i}"><span>0${i + 1}</span>${e(s.title)}</button>`).join('')}</nav><p class="sidebar-note">Explora un dispositivo, comprende su efecto y elige dónde usarlo.</p><a class="text-button" href="#/sensores">Volver a Sensores ↗</a></aside><div class="lesson-content"><section><p class="eyebrow">ANTES DE ENERGIZAR</p><h2>¿De dónde sale la acción?</h2><ul class="objectives">${data.objectives.map((o) => `<li>${e(o)}</li>`).join('')}</ul><p class="sensor-note">Modelos educativos sin conexión a hardware. No son instrucciones de cableado, dimensionamiento o seguridad industrial.</p></section>${data.sections.map((s, i) => `<section class="lesson-section" id="actuator-section-${i}" aria-labelledby="actuator-title-${i}"><p class="eyebrow">EXPLORACIÓN / 0${i + 1}</p><h2 id="actuator-title-${i}" tabindex="-1">${e(s.title)}</h2>${N.ui.learningIntro('actuadores', i)}${labs[i]()}${N.ui.technicalDetails(s.paragraphs)}</section>`).join('')}${N.ui.glossaryMarkup()}<p class="source-note">${e(data.source)}</p><a class="button button-primary" href="#/inicio/experimento">Volver al sistema completo de Inicio ↗</a></div></div></div>`;
  };
  N.ui.mountActuatorLesson = function (root) {
    const e = N.ui.escape;
    function setFamily(index) {
      const f = families[index];
      root.querySelectorAll('[data-family]').forEach((button) => button.setAttribute('aria-pressed', String(Number(button.dataset.family) === index)));
      root.querySelector('[data-family-chain]').innerHTML = [f.source, f.converter, f.output].map((label, i) => `<div><span class="eyebrow">0${i + 1} / ${['ENTRADA', 'CONVERSIÓN', 'SALIDA'][i]}</span><strong>${e(label)}</strong></div>`).join('');
      root.querySelector('[data-family-detail]').textContent = `${f.trade} Ejemplo: ${f.example}.`;
    }
    function familyClick(event) { const button = event.target.closest('[data-family]'); if (button) setFamily(Number(button.dataset.family)); }
    root.addEventListener('click', familyClick); setFamily(0);
    const cleanups = [N.Simulations.mountElectric(root.querySelector('#electric-bank')), N.Simulations.mountMotors(root.querySelector('#motors-bank')), N.Simulations.mountMechanics(root.querySelector('#mechanics-bank')), N.Simulations.mountIndustry(root.querySelector('#industry-bank'))];
    return () => { root.removeEventListener('click', familyClick); cleanups.forEach((cleanup) => { if (typeof cleanup === 'function') cleanup(); }); };
  };
}(window.NEXO));
