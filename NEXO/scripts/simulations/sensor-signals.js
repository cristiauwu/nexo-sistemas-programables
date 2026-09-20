// scripts/simulations/sensor-signals.js
(function (N) {
  'use strict';
  N.Models.signals = function (percent, threshold, inverted) {
    if (!Number.isFinite(percent) || !Number.isFinite(threshold)) throw new TypeError('Nivel y umbral deben ser números finitos.');
    const fraction = Math.max(0, Math.min(100, percent)) / 100;
    const detected = fraction * 100 >= Math.max(0, Math.min(100, threshold));
    return { voltage: fraction * 10, current: 4 + fraction * 16, detected, digital: Number(inverted ? !detected : detected) };
  };
  N.Simulations.signalsMarkup = function () {
    return `<article class="sensor-experiment"><p class="sensor-eyebrow">BANCO 01 / DOS FORMAS DE INFORMAR</p><h3>Una magnitud. Dos respuestas.</h3><div class="experiment-grid"><div class="sensor-visual"><svg viewBox="0 0 600 300" role="img" aria-labelledby="signal-title signal-desc"><title id="signal-title">Depósito y salidas discreta y analógica</title><desc id="signal-desc">El nivel cambia con el control. Los valores exactos se presentan en las lecturas inferiores.</desc><defs><clipPath id="signal-tank-clip"><rect x="42" y="35" width="158" height="220" rx="8"/></clipPath></defs><rect x="40" y="33" width="162" height="224" rx="10" fill="none" stroke="var(--muted)" stroke-width="2"/><rect data-signal="water" x="42" y="145" width="158" height="110" fill="var(--cyan)" opacity=".45" clip-path="url(#signal-tank-clip)"/><path data-signal="threshold-line" d="M30 123H215" stroke="var(--amber)" stroke-dasharray="5 4"/><text x="120" y="285" text-anchor="middle" fill="var(--text)" font-size="14">NIVEL / 0–100 %</text><path d="M205 150H260M260 150V80H300M260 150V215H300" fill="none" stroke="var(--muted)"/><rect x="300" y="40" width="265" height="90" rx="5" fill="var(--surface)" stroke="var(--line)"/><text x="320" y="65" fill="var(--muted)" font-size="13">DISCRETA / LÓGICA</text><text data-signal="digital-svg" x="320" y="108" fill="var(--accent)" font-size="35">0</text><rect x="300" y="170" width="265" height="90" rx="5" fill="var(--surface)" stroke="var(--line)"/><text x="320" y="195" fill="var(--muted)" font-size="13">ANALÓGICA / TRANSMISOR</text><rect x="320" y="220" width="220" height="14" fill="var(--line)"/><rect data-signal="analog-bar" x="320" y="220" width="110" height="14" fill="var(--cyan)"/></svg><div class="sensor-readouts"><div class="sensor-reading">Salida discreta<strong data-signal="digital">0</strong></div><div class="sensor-reading">Salida 0–10 V<strong data-signal="voltage">5,00 V</strong></div><div class="sensor-reading">Salida 4–20 mA<strong data-signal="current">12,00 mA</strong></div></div></div><div class="sensor-controls"><label for="signal-level">Nivel del depósito <output id="signal-level-value">50 %</output></label><input id="signal-level" data-signal="level" type="range" min="0" max="100" value="50" step="1"><label for="signal-threshold">Umbral de presencia / límite <output id="signal-threshold-value">60 %</output></label><input id="signal-threshold" data-signal="threshold" type="range" min="1" max="99" value="60"><label for="signal-polarity">Lógica de salida</label><select id="signal-polarity" data-signal="polarity"><option value="no">NO: 1 al alcanzar el umbral</option><option value="nc">NC: 0 al alcanzar el umbral</option></select><p class="sensor-result" data-signal="explanation" role="status"></p><button class="sensor-button" data-signal-reset type="button">Reiniciar comparación</button><p class="sensor-note">Modelo lineal ideal, sin ruido ni histéresis. El circuito normaliza el nivel al rango. El 1 es lógico: no representa necesariamente 1 V. Cambiar NO/NC no cambia la salida analógica.</p></div></div><details class="sensor-details"><summary>Ver relaciones y criterios de selección</summary><p>V = 10 × nivel / 100. I = 4 + 16 × nivel / 100. La salida discreta NO es 1 cuando nivel ≥ umbral.</p><div class="sensor-grid"><div><h4>Discreta</h4><p>Útil en conteo, finales de carrera o alarmas. Simple, pero pierde el valor exacto.</p></div><div><h4>Analógica</h4><p>Útil para regulación y tendencias. Necesita conversión de escala, calibración y tratamiento del ruido.</p></div><div><h4>Cero vivo</h4><p>0 % → 4 mA; 50 % → 12 mA; 100 % → 20 mA. Una medida válida mínima no equivale a corriente nula.</p></div></div></details></article>`;
  };
  N.Simulations.mountSignals = function (root) {
    const q = (key) => root.querySelector(`[data-signal="${key}"]`);
    const format = (number) => number.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    function render() {
      const level = Number(q('level').value), threshold = Number(q('threshold').value), inverted = q('polarity').value === 'nc';
      const state = N.Models.signals(level, threshold, inverted);
      root.querySelector('#signal-level-value').textContent = `${level} %`;
      root.querySelector('#signal-threshold-value').textContent = `${threshold} %`;
      q('level').setAttribute('aria-valuetext', `${level} por ciento`);
      q('threshold').setAttribute('aria-valuetext', `${threshold} por ciento`);
      q('water').setAttribute('y', 255 - level * 2.2); q('water').setAttribute('height', level * 2.2);
      q('threshold-line').setAttribute('d', `M30 ${255 - threshold * 2.2}H215`);
      q('analog-bar').setAttribute('width', level * 2.2);
      q('digital').textContent = state.digital; q('digital-svg').textContent = state.digital;
      q('voltage').textContent = `${format(state.voltage)} V`; q('current').textContent = `${format(state.current)} mA`;
      q('explanation').textContent = `${level} % ${state.detected ? 'alcanza o supera' : 'está por debajo de'} ${threshold} %. La condición es ${state.detected ? 'verdadera' : 'falsa'}; con lógica ${inverted ? 'NC' : 'NO'}, la salida es ${state.digital}.`;
    }
    function reset(event) { if (!event.target.closest('[data-signal-reset]')) return; q('level').value = 50; q('threshold').value = 60; q('polarity').value = 'no'; render(); }
    root.addEventListener('input', render); root.addEventListener('change', render); root.addEventListener('click', reset); render();
    return () => { root.removeEventListener('input', render); root.removeEventListener('change', render); root.removeEventListener('click', reset); };
  };
}(window.NEXO));
