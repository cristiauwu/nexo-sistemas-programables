// scripts/components/assessment.js
(function (N) {
  'use strict';
  N.ui.assessmentMarkup = () => `<div class="sensor-experiment assessment"><p class="sensor-eyebrow">EVALUACIÓN / CRITERIO ANTES QUE MEMORIA</p><div data-quiz-body></div></div>`;
  N.ui.mountAssessment = function (root, questions) {
    const e = N.ui.escape;
    const body = root.querySelector('[data-quiz-body]');
    let index = 0;
    let answers = Array(questions.length).fill(null);
    let answered = false;
    function render() {
      if (index === questions.length) {
        const correct = answers.filter((answer, i) => answer === questions[i].answer).length;
        body.innerHTML = `<h3 tabindex="-1">Recorrido terminado</h3><p class="quiz-score">${correct}<span> / ${questions.length}</span></p><p>Respuestas correctas en este intento. Revisa el razonamiento, especialmente donde tu predicción fue distinta.</p><ol class="quiz-review">${questions.map((question, i) => `<li><strong>${answers[i] === question.answer ? 'Correcta' : 'Para repasar'}: ${e(question.question)}</strong><p>Tu elección: ${e(question.options[answers[i]])}. Respuesta esperada: ${e(question.options[question.answer])}.</p><p>${e(question.why)}</p></li>`).join('')}</ol><button class="sensor-button" type="button" data-quiz-restart>Comenzar otro intento</button><p class="sensor-note">Este intento permanece solo mientras estés en esta página. No se envían datos ni se asigna una calificación oficial.</p>`;
        body.querySelector('h3').focus(); return;
      }
      const question = questions[index];
      answered = false;
      body.innerHTML = `<p class="eyebrow">PREGUNTA ${index + 1} DE ${questions.length}</p><form data-quiz-form><fieldset><legend tabindex="-1">${e(question.question)}</legend>${question.options.map((option, i) => `<label class="quiz-option" for="quiz-option-${i}"><input id="quiz-option-${i}" type="radio" name="quiz-answer" value="${i}" required><span>${e(option)}</span></label>`).join('')}</fieldset><button class="sensor-button" type="submit">Comprobar respuesta</button></form><div data-quiz-feedback role="status" aria-live="polite"></div><button class="sensor-button" type="button" data-quiz-next hidden>${index === questions.length - 1 ? 'Ver resultado' : 'Siguiente caso →'}</button>`;
    }
    function submit(event) {
      if (!event.target.matches('[data-quiz-form]')) return;
      event.preventDefault(); if (answered) return;
      const chosen = body.querySelector('input[name="quiz-answer"]:checked');
      if (!chosen) { body.querySelector('[data-quiz-feedback]').textContent = 'Selecciona una respuesta antes de comprobar.'; return; }
      const question = questions[index];
      answers[index] = Number(chosen.value); answered = true;
      body.querySelectorAll('input').forEach((input) => { input.disabled = true; });
      body.querySelector('button[type="submit"]').disabled = true;
      body.querySelector('[data-quiz-feedback]').innerHTML = `<div class="sensor-result"><strong>${answers[index] === question.answer ? 'Correcto.' : 'Revisa tu razonamiento.'}</strong><p>${e(question.why)}</p></div>`;
      body.querySelector('[data-quiz-next]').hidden = false;
    }
    function click(event) {
      if (event.target.closest('[data-quiz-next]') && answered) { index++; render(); body.querySelector('legend')?.focus(); }
      if (event.target.closest('[data-quiz-restart]')) { index = 0; answers = Array(questions.length).fill(null); render(); body.querySelector('legend').focus(); }
    }
    root.addEventListener('submit', submit); root.addEventListener('click', click); render();
    return () => { root.removeEventListener('submit', submit); root.removeEventListener('click', click); };
  };
}(window.NEXO));
