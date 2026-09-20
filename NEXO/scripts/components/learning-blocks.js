// scripts/components/learning-blocks.js
(function (N) {
  'use strict';
  const e = N.ui.escape;
  N.ui.learningIntro = function (module, index) {
    const guide = N.content.learningGuide[module]?.[index];
    if (!guide) return '';
    return `<div class="learning-intro"><p class="learning-summary">${e(guide.summary)}</p>${guide.steps.length ? `<div class="learning-steps"><span class="eyebrow">PRUÉBALO ASÍ</span><ol>${guide.steps.map((step) => `<li>${e(step)}</li>`).join('')}</ol></div>` : ''}<p class="learning-takeaway"><span aria-hidden="true">↳</span> ${e(guide.takeaway)}</p></div>`;
  };
  N.ui.technicalDetails = function (paragraphs) {
    return `<details class="technical-details"><summary>Entender el detalle técnico <span aria-hidden="true">＋</span></summary><div class="sensor-reading-text">${paragraphs.map((p) => `<p>${e(p)}</p>`).join('')}</div></details>`;
  };
  N.ui.glossaryMarkup = function () {
    return `<details class="technical-details glossary"><summary>Diccionario rápido: palabras que encontrarás <span aria-hidden="true">＋</span></summary><dl>${N.content.glossary.map(([term, meaning]) => `<div><dt>${e(term)}</dt><dd>${e(meaning)}</dd></div>`).join('')}</dl></details>`;
  };
}(window.NEXO));
