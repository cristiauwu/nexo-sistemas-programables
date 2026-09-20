// scripts/components/ui.js
(function (N) {
  'use strict';
  const escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  N.ui.escape = escape;
  N.ui.symbol = function (type, className = '') {
    const drawings = {
      sensor: '<circle cx="100" cy="100" r="68"/><circle cx="100" cy="100" r="46"/><circle cx="100" cy="100" r="22"/><path d="M100 8v30m0 124v30M8 100h30m124 0h30M35 35l21 21m88 88 21 21M35 165l21-21m88-88 21-21"/><circle cx="100" cy="100" r="5" fill="currentColor"/>',
      actuator: '<path d="m100 16 73 42v84l-73 42-73-42V58Z"/><path d="m27 58 73 42 73-42M100 100v84M63 37l73 42v41l-36 21-37-21V79l74-42"/><path d="m63 79 37 21 36-21M100 100v41"/>',
      loop: '<circle cx="100" cy="100" r="64" stroke-dasharray="110 24"/><path d="m146 37 18 18-25 3M53 164l-18-18 25-3"/><rect x="75" y="75" width="50" height="50" rx="3"/><path d="M100 54v21m0 50v21M54 100h21m50 0h21"/>'
    };
    return `<svg class="technical-symbol ${escape(className)}" viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">${drawings[type] || drawings.loop}</svg>`;
  };
  N.ui.moduleCard = function (module) {
    return `<a class="module-card accent-${escape(module.accent)}" href="#/${escape(module.id)}">
      <div class="card-top"><span class="eyebrow">${escape(module.chapter)}</span><span class="status-pill">${escape(N.statusLabels[module.status])}</span></div>
      <div class="module-art">${N.ui.symbol(module.symbol)}<span class="module-index" aria-hidden="true">${escape(module.code)}</span></div>
      <div class="module-card-body"><h3>${escape(module.label)}<span aria-hidden="true">↗</span></h3><p>${escape(module.description)}</p><span class="card-caption">${escape(module.preview)}</span></div>
    </a>`;
  };
  N.ui.lesson = function (module) {
    const data = N.content[module.id];
    if (!data) return N.ui.planned(module);
    return `<section class="lesson-hero section-shell accent-${escape(module.accent)}"><a class="back-link" href="#/inicio">← Volver al inicio</a><div class="lesson-hero-grid"><div><p class="eyebrow">${escape(module.chapter)} / ${escape(N.statusLabels[module.status])}</p><h1 tabindex="-1">${escape(data.title).replace(/\n/g, '<br>')}</h1><p class="lesson-subtitle">${escape(data.subtitle)}</p></div><div class="lesson-art">${N.ui.symbol(module.symbol)}<span class="eyebrow">MÓDULO / ${escape(module.code)}</span></div></div><div class="construction-note"><span class="eyebrow">ESTADO REAL DEL MÓDULO</span><p>${escape(data.note)}</p></div></section>
    <div class="lesson-layout section-shell"><aside class="lesson-sidebar"><p class="eyebrow">EN ESTE MÓDULO</p><nav aria-label="Secciones del módulo">${data.sections.map((section, i) => `<button type="button" class="section-link" data-jump="section-${i}"><span>0${i + 1}</span>${escape(section.title)}</button>`).join('')}</nav><span class="sidebar-note">Mapa previsto · Sin progreso académico registrado</span></aside><div class="lesson-content"><section aria-labelledby="objectives-title"><p class="eyebrow">LO QUE APRENDERÁS</p><h2 id="objectives-title">Objetivos del recorrido</h2><ul class="objectives">${data.objectives.map((objective) => `<li>${escape(objective)}</li>`).join('')}</ul></section>${data.sections.map((section, i) => `<section class="lesson-section" id="section-${i}" aria-labelledby="section-title-${i}"><span class="eyebrow">SECCIÓN / 0${i + 1}</span><h2 id="section-title-${i}" tabindex="-1">${escape(section.title)}</h2><p>${escape(section.text)}</p>${section.tags ? `<div class="topic-tags">${section.tags.map((tag) => `<span>${escape(tag)}</span>`).join('')}</div>` : ''}<p class="section-pending">Contenido y experiencia interactiva en preparación.</p></section>`).join('')}<p class="source-note">Fuente de referencia: ${escape(data.source)}</p><a class="button button-primary" href="#/inicio/experimento">Probar el laboratorio de Inicio <span aria-hidden="true">↗</span></a></div></div>`;
  };
  N.ui.planned = function (module) {
    return `<section class="empty-state section-shell"><p class="eyebrow">${escape(module.chapter)} / PRÓXIMAMENTE</p><h1 tabindex="-1">${escape(module.label)}</h1><p>${escape(module.description)}</p><p>Este módulo se incorporará en una siguiente etapa del semestre. No tiene contenido evaluable todavía.</p><a class="button button-primary" href="#/inicio">Volver al laboratorio ↗</a></section>`;
  };
  N.ui.notFound = () => '<section class="empty-state section-shell"><p class="eyebrow">RUTA NO ENCONTRADA / 404</p><h1 tabindex="-1">Esta conexión<br>no existe.</h1><p>El contenido puede haberse movido o la dirección estar incompleta.</p><a class="button button-primary" href="#/inicio">Volver al inicio ↗</a></section>';
}(window.NEXO));
