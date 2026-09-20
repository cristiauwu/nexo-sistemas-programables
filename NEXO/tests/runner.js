// tests/runner.js
(function (N) {
  'use strict';
  function run() {
    const results = [...N.runModelTests(), ...N.runContentTests()];
    const list = document.getElementById('results');
    list.replaceChildren();
    results.forEach((result) => {
      const li = document.createElement('li');
      li.style.marginBottom = '.7rem';
      li.textContent = `${result.passed ? 'CORRECTO' : 'FALLO'} — ${result.name}${result.message && !result.passed ? ': ' + result.message : ''}`;
      list.append(li);
    });
    document.getElementById('summary').textContent = `${results.filter((r) => r.passed).length} / ${results.length} pruebas correctas`;
  }
  document.getElementById('run-tests').addEventListener('click', run);
  document.getElementById('summary').textContent = 'Pruebas no ejecutadas. Inícialas manualmente si lo deseas.';
}(window.NEXO));
