// Full integration lesson; shared assessment owns question navigation and feedback.
(function (N) {
  'use strict';
  const e = N.ui.escape;
  function builderMarkup() {
    return `<article class="integration-builder sensor-experiment"><p class="sensor-eyebrow">CONSTRUCTOR / UNA ACCIÓN CON SENTIDO</p><h3>Une componentes del mismo proceso.</h3><p>Elige sensor, actuador y regla. La explicación señala qué conexión funciona y cuál no.</p><div class="integration-builder-controls"><label>Sensor<select data-integration-build="sensor"><option value="temperature">NTC · temperatura</option><option value="metal">Inductivo · presencia de metal</option><option value="pressure">Transmisor · presión absoluta</option></select></label><label>Actuador<select data-integration-build="actuator"><option value="fan">Ventilador de cámara</option><option value="conveyor">Motor de banda</option><option value="valve">Válvula de alivio</option></select></label><label>Regla<select data-integration-build="rule"><option value="cool">Enfriar al superar el umbral</option><option value="stop">Detener al detectar metal</option><option value="relieve">Aliviar al superar el umbral</option></select></label></div><p class="integration-builder-result" data-integration-build-feedback role="status"></p><button type="button" class="sensor-button" data-integration-build-load>Cargar combinación en el banco</button><p class="sensor-note">La compatibilidad corresponde a estos tres procesos. En otra máquina una válvula podría refrigerar; aquí solo descarga el depósito.</p></article>`;
  }
  N.ui.integrationLesson = function () {
    const data = N.content.integracion;
    return `<div class="integration-theme"><section class="lesson-hero section-shell"><a class="back-link" href="#/inicio">← Volver al inicio</a><p class="eyebrow">TEMA II / INTEGRACIÓN · FASE 8</p><h1 tabindex="-1">${e(data.title).replace(/\n/g, '<br>')}</h1><p class="lesson-subtitle">${e(data.subtitle)}</p><div class="sensor-header-tags"><span>3 procesos reales en un modelo</span><span>Medida → decisión → potencia → acción</span><span>Lazo abierto / cerrado</span></div><p class="sensor-release-note">${e(data.note)}</p></section><div class="section-shell integration-lesson-content"><nav class="integration-section-nav" aria-label="Secciones de integración"><a href="#integration-process" data-integration-jump="integration-process">01 / Experimenta</a><a href="#integration-build" data-integration-jump="integration-build">02 / Construye</a><a href="#integration-assessment" data-integration-jump="integration-assessment">03 / Comprueba</a></nav><section class="lesson-section" id="integration-process" aria-labelledby="integration-process-title"><p class="eyebrow">01 / LA CADENA COMPLETA</p><h2 id="integration-process-title" tabindex="-1">${e(data.sections[0].title)}</h2><p class="sensor-lead">${e(data.sections[0].text)}</p><ul class="objectives">${data.objectives.map((item) => `<li>${e(item)}</li>`).join('')}</ul>${N.Simulations.integrationMarkup()}</section><section class="lesson-section" id="integration-build" aria-labelledby="integration-build-title"><p class="eyebrow">02 / SELECCIÓN RAZONADA</p><h2 id="integration-build-title" tabindex="-1">${e(data.sections[1].title)}</h2><p>${e(data.sections[1].text)}</p>${builderMarkup()}</section><section class="lesson-section" id="integration-assessment" aria-labelledby="integration-assessment-title"><p class="eyebrow">03 / EVALUACIÓN FINAL · 10 CASOS</p><h2 id="integration-assessment-title" tabindex="-1">${e(data.sections[2].title)}</h2><p>${e(data.sections[2].text)}</p><div data-integration-assessment>${N.ui.assessmentMarkup()}</div></section><p class="source-note">${e(data.source)}</p><div class="sensor-buttons"><a class="text-button" href="#/sensores">Repasar sensores ↗</a><a class="text-button" href="#/actuadores">Repasar actuadores ↗</a></div></div></div>`;
  };
  N.ui.mountIntegrationLesson = function (root) {
    const bank = root.querySelector('[data-integration-lab]');
    const disposeBank = N.Simulations.mountIntegration(bank);
    const disposeAssessment = N.ui.mountAssessment(root.querySelector('[data-integration-assessment]'), N.content.integracion.questions);
    const read = (key) => root.querySelector('[data-integration-build="' + key + '"]').value;
    function updateBuilder() {
      const result = N.Models.integration.compatibility(read('sensor'), read('actuator'), read('rule'));
      root.querySelector('[data-integration-build-feedback]').textContent = (result.compatible ? 'Compatible. ' : 'Revisa la conexión. ') + result.reason;
      root.querySelector('[data-integration-build-load]').disabled = !result.compatible;
      return result;
    }
    function change(event) { if (event.target.matches('[data-integration-build]')) updateBuilder(); }
    function moveTo(node) {
      const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      node.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
      const target = node.querySelector('h2, h3');
      if (target) { target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }); }
    }
    function click(event) {
      const jump = event.target.closest('[data-integration-jump]');
      if (jump) { event.preventDefault(); moveTo(root.querySelector('#' + jump.dataset.integrationJump)); }
      if (event.target.closest('[data-integration-build-load]')) {
        const result = updateBuilder();
        if (!result.compatible) return;
        bank.dispatchEvent(new CustomEvent('integration:load', { detail: result.caseId }));
        moveTo(bank);
      }
    }
    root.addEventListener('change', change); root.addEventListener('click', click); updateBuilder();
    return function () { disposeBank(); disposeAssessment(); root.removeEventListener('change', change); root.removeEventListener('click', click); };
  };
})(window.NEXO);
