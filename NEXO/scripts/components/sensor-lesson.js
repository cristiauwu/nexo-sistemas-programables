// scripts/components/sensor-lesson.js
(function (N) {
  'use strict';
  N.ui.sensorLesson = function () {
    const data = N.content.sensores, e = N.ui.escape;
    const experiments = [
      () => `<div id="signals-bank">${N.Simulations.signalsMarkup()}</div>`,
      () => `<div id="optics-bank">${N.Simulations.opticsMarkup()}</div>`,
      () => `<div id="physics-bank">${N.Simulations.physicsMarkup()}</div>`,
      () => `<div id="sensor-assessment">${N.ui.assessmentMarkup()}</div>`
    ];
    return `<section class="lesson-hero section-shell accent-cyan"><a class="back-link" href="#/inicio">← Volver al inicio</a><div class="lesson-hero-grid"><div><p class="eyebrow">TEMA I / LABORATORIO DE SENSORES</p><h1 tabindex="-1">${e(data.title).replace(/\n/g, '<br>')}</h1><p class="lesson-subtitle">${e(data.subtitle)}</p><div class="sensor-header-tags"><span>20 puntos del temario</span><span>6 bancos interactivos</span><span>15 casos de evaluación</span></div></div><div class="lesson-art">${N.ui.symbol('sensor')}<span class="eyebrow">MAGNITUD → TRANSDUCCIÓN → SEÑAL</span></div></div><p class="sensor-release-note">Aprende a tu ritmo: cambia una variable, observa el resultado y explica qué pasó.</p></section>
    <div class="sensor-lesson-layout section-shell"><aside class="lesson-sidebar"><p class="eyebrow">RECORRIDO / TEMA I</p><nav aria-label="Secciones de sensores">${data.sections.map((section, i) => `<button class="section-link" type="button" data-jump="sensor-section-${i}"><span>0${i + 1}</span>${e(section.title)}</button>`).join('')}</nav><p class="sidebar-note">El indicador señala la sección visible, no una calificación.</p><button class="text-button" type="button" data-jump="sensor-section-3">Ir a la evaluación ↗</button></aside><div class="lesson-content"><section class="sensor-objectives"><p class="eyebrow">ANTES DE EXPERIMENTAR</p><h2>Predice. Cambia. Explica.</h2><ul class="objectives">${data.objectives.map((objective) => `<li>${e(objective)}</li>`).join('')}</ul><p class="sensor-note">Los bancos son modelos educativos. Sus alcances, curvas y reglas no sustituyen hojas de datos, calibración o selección de equipos reales.</p></section>${data.sections.map((section, i) => `<section id="sensor-section-${i}" class="lesson-section" aria-labelledby="sensor-section-title-${i}"><p class="eyebrow">EXPLORACIÓN / 0${i + 1}</p><h2 id="sensor-section-title-${i}" tabindex="-1">${e(section.title)}</h2><div class="topic-tags">${section.tags.map((tag) => `<span>${e(tag)}</span>`).join('')}</div>${N.ui.learningIntro('sensores', i)}${section.challenge ? `<div class="sensor-challenge"><span class="eyebrow">ANTES DE MOVER UN CONTROL</span><p>${e(section.challenge)}</p></div>` : ''}${experiments[i]()}${N.ui.technicalDetails(section.paragraphs)}</section>`).join('')}${N.ui.glossaryMarkup()}<p class="source-note">${e(data.source)}</p><a class="button button-primary" href="#/inicio/experimento">Conectar la medida con una acción ↗</a></div></div>`;
  };
  N.ui.mountSensorLesson = function (root) {
    const cleanups = [
      N.Simulations.mountSignals(root.querySelector('#signals-bank')),
      N.Simulations.mountOptics(root.querySelector('#optics-bank')),
      N.Simulations.mountPhysics(root.querySelector('#physics-bank')),
      N.ui.mountAssessment(root.querySelector('#sensor-assessment'), N.content.sensorQuiz)
    ];
    return () => cleanups.forEach((cleanup) => { if (typeof cleanup === 'function') cleanup(); });
  };
}(window.NEXO));
