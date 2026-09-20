// NEXO/scripts/simulations/automation-loop.js
(function (NEXO) {
  'use strict';
  if (!NEXO) throw new Error('Carga el registro NEXO antes de la simulación.');
  NEXO.Simulations = NEXO.Simulations || {};
  var serial = 0;
  var mounts = new WeakMap();

  NEXO.Simulations.thermalMarkup = function () {
    var id = 'thermal-' + (++serial) + '-';
    return `<section class="thermal-lab" aria-labelledby="${id}title">
      <header class="thermal-header">
        <div><p class="thermal-eyebrow">LAB / 02 · SISTEMAS DE CONTROL</p><h2 id="${id}title">El equilibrio se controla.</h2>
          <p>Una cámara, un sensor y una decisión. Explora el lazo térmico.</p></div>
        <span class="thermal-tag">MODELO DIDÁCTICO · NO HARDWARE</span>
      </header>
      <div class="thermal-layout">
        <section class="thermal-scene" aria-label="Cámara térmica y señales del sistema">
          <div class="thermal-scene-top"><span>01 / CÁMARA TÉRMICA</span><span data-role="run-status">EN MARCHA</span></div>
          <div class="thermal-reactor">
            <svg viewBox="0 0 640 390" role="img" aria-labelledby="${id}diagram-title ${id}diagram-desc">
              <title id="${id}diagram-title">Cámara térmica con sensor y ventilación</title>
              <desc id="${id}diagram-desc">Dibujo técnico sobre fondo claro. Por la izquierda entran tres flechas de calor con el porcentaje de entrada actual. En el centro, la cámara circular muestra la temperatura medida en grados Celsius y el sensor T01. A la derecha, el ventilador M01 dentro de su caja de potencia: sus aspas giran solo cuando está encendido. Una línea discontinua cierra el lazo desde el sensor hasta la etapa de potencia. Los valores y el estado del ventilador se repiten como texto debajo del dibujo.</desc>
              <defs>
                <!-- Rampas derivadas de tokens.css, sin literales.
                     chamber: del blanco al papel por el borde.
                     metal: carcasa, del papel claro a la salvia. -->
                <radialGradient id="${id}chamber"><stop stop-color="var(--metal-1)"/><stop offset=".62" stop-color="var(--surface)"/><stop offset="1" stop-color="var(--metal-2)"/></radialGradient>
                <linearGradient id="${id}metal" x2="1" y2="1"><stop stop-color="var(--metal-2)"/><stop offset=".45" stop-color="var(--band-sage)"/><stop offset="1" stop-color="var(--sage-light)"/></linearGradient>
                <marker id="${id}arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L8 4L0 8Z" fill="context-stroke"/></marker>
              </defs>
              <rect width="640" height="390" rx="16" fill="var(--stage)"/>
              <g class="thermal-construction" fill="none"><path d="M36 190H609M275 23V365"/><circle cx="275" cy="190" r="160"/><path d="M125 40H148M125 40V63M425 40H402M425 40V63M125 340H148M125 340V317M425 340H402M425 340V317"/></g>
              <circle cx="275" cy="190" r="140" fill="url(#${id}metal)" stroke="var(--text)" stroke-width="1.4"/>
              <circle cx="275" cy="190" r="128" fill="url(#${id}chamber)" stroke="var(--text)" stroke-width="3"/>
              <circle class="thermal-ring" cx="275" cy="190" r="116" fill="none" stroke-dasharray="2 12"/>
              <g fill="var(--surface-raised)" stroke="var(--text)" stroke-width="1.4"><circle cx="275" cy="57" r="4.5"/><circle cx="408" cy="190" r="4.5"/><circle cx="275" cy="323" r="4.5"/><circle cx="142" cy="190" r="4.5"/></g>
              <g class="thermal-heat-lines" fill="none" stroke-linecap="round" marker-end="url(#${id}arrow)"><path d="M34 170H121"/><path d="M48 190H121"/><path d="M34 210H121"/></g>
              <g class="thermal-svg-label"><text x="34" y="144">ENTRADA</text><text x="34" y="240" data-role="diagram-heat">45 %</text><text x="275" y="128" text-anchor="middle">SENSOR / T01</text></g>
              <text class="thermal-svg-temp" x="275" y="201" text-anchor="middle" data-role="diagram-temp">32,0</text>
              <text class="thermal-svg-unit" x="275" y="232" text-anchor="middle">°C · TEMPERATURA</text>
              <path class="thermal-sensor" d="M242 265H308M275 265V300" fill="none" stroke-linecap="round"/>
              <path class="thermal-air" d="M422 170H455M422 210H455M551 170H602M551 210H602" stroke-linecap="round" marker-end="url(#${id}arrow)"/>
              <rect x="458" y="143" width="90" height="94" rx="15" fill="var(--surface)" stroke="var(--text)" stroke-width="1.6"/>
              <circle cx="503" cy="190" r="36" fill="var(--surface-raised)" stroke="var(--line-strong)" stroke-dasharray="3 6"/>
              <g class="thermal-fan" data-role="fan-rotor" fill="var(--surface-raised)" stroke="var(--text)" stroke-width="1.4" stroke-linejoin="round"><path d="M503 187C465 178 477 149 490 161C501 170 506 180 503 187Z"/><path d="M506 190C515 152 544 164 532 177C523 188 513 193 506 190Z"/><path d="M503 193C541 202 529 231 516 219C505 210 500 200 503 193Z"/><path d="M500 190C491 228 462 216 474 203C483 192 493 187 500 190Z"/></g>
              <circle cx="503" cy="190" r="8" fill="var(--accent)" stroke="var(--text)" stroke-width="2.5"/>
              <text class="thermal-svg-label" x="503" y="263" text-anchor="middle">VENTILADOR / M01</text>
              <path class="thermal-signal-path" d="M275 326V357H503V285" fill="none" marker-end="url(#${id}arrow)"/>
              <text class="thermal-svg-small" x="383" y="379" text-anchor="middle">MEDICIÓN → LÓGICA → POTENCIA</text>
            </svg>
          </div>
          <div class="thermal-readings">
            <div><span>Valor medido</span><strong><span data-role="temperature">32,0</span><small> °C</small></strong></div>
            <div><span>Ventilador</span><strong class="thermal-fan-state" data-role="fan-state">○ APAGADO</strong></div>
            <div><span>Tiempo simulado</span><strong><span data-role="time">0,0</span><small> s</small></strong></div>
          </div>
          <ol class="thermal-chain" aria-label="Etapas del control">
            <li><span>01 / SENSOR</span><b data-role="sensor-value">32,0 °C</b><small>Medición de la cámara</small></li>
            <li><span>02 / LÓGICA</span><b data-role="logic-state">Lazo cerrado</b><small data-role="logic-detail">Banda de memoria: 33–35 °C</small></li>
            <li><span>03 / POTENCIA</span><b data-role="power-state">Orden 0 · salida 0 %</b><small>Interruptor ideal → motor</small></li>
          </ol>
        </section>
        <aside class="thermal-controls" aria-labelledby="${id}controls-title">
          <p class="thermal-eyebrow">02 / MESA DE CONTROL</p><h3 id="${id}controls-title">Ajusta. Observa. Comprende.</h3>
          <div class="thermal-control"><div class="thermal-label-row"><label for="${id}heat">Entrada de calor</label><output for="${id}heat" data-role="heat-value" aria-live="off">45 %</output></div>
            <input id="${id}heat" data-role="heat" type="range" min="0" max="100" step="1" value="45" aria-describedby="${id}heat-help"><p id="${id}heat-help">0–100 % · entrada didáctica, no vatios.</p></div>
          <div class="thermal-control"><div class="thermal-label-row"><label for="${id}threshold">Umbral de encendido</label><output for="${id}threshold" data-role="threshold-value" aria-live="off">35 °C</output></div>
            <input id="${id}threshold" data-role="threshold" type="range" min="28" max="50" step="1" value="35" aria-describedby="${id}threshold-help"><p id="${id}threshold-help">28–50 °C · histéresis fija de 2 °C.</p></div>
          <div class="thermal-control"><label for="${id}mode">Modo de control</label><select id="${id}mode" data-role="mode"><option value="closed">Lazo cerrado · automático</option><option value="open">Lazo abierto · manual</option></select></div>
          <div class="thermal-manual" data-role="manual-wrap" hidden><input id="${id}manual" data-role="manual" type="checkbox"><label for="${id}manual">Encender ventilador manualmente</label></div>
          <div class="thermal-rule"><span>REGLA ACTIVA</span><p data-role="rule">Enciende si T &gt; 35 °C. Apaga si T &lt; 33 °C. Entre ambos límites conserva su estado.</p></div>
          <div class="thermal-actions"><button type="button" data-role="pause" aria-pressed="false">Pausar</button><button type="button" data-role="step" disabled>Avanzar 1 s</button><button type="button" data-role="reset">Reiniciar</button></div>
          <p class="thermal-control-note">Ambiente: 22 °C. La etapa de potencia es binaria: 0 % o 100 %. No equivale a la entrada de calor.</p>
        </aside>
      </div>
      <section class="thermal-history" aria-labelledby="${id}history-title">
        <div class="thermal-history-heading"><div><p class="thermal-eyebrow">03 / RESPUESTA EN EL TIEMPO</p><h3 id="${id}history-title">La memoria del sistema</h3></div><span>Ventana móvil · 60 s</span></div>
        <div class="thermal-legend"><span><i class="thermal-key-temp"></i>Temperatura (°C)</span><span><i class="thermal-key-on"></i>Encendido · umbral actual</span><span><i class="thermal-key-off"></i>Apagado · umbral − 2 °C</span></div>
        <p class="thermal-chart-help" id="${id}chart-help">Tiempo simulado en segundos. Explora con el puntero o enfoca el gráfico y usa ← →, Inicio y Fin. Referencias de umbral actuales; en manual no gobiernan el motor.</p>
        <svg class="thermal-chart" data-role="chart" viewBox="0 0 960 240" tabindex="0" role="group" aria-labelledby="${id}history-title" aria-describedby="${id}chart-help ${id}tooltip">
          <g class="thermal-grid" data-role="grid"></g>
          <path class="thermal-threshold-line" data-role="on-line"/><path class="thermal-off-line" data-role="off-line"/>
          <path class="thermal-trace" data-role="trace"/>
          <circle class="thermal-endpoint" data-role="endpoint" r="4"/>
          <text class="thermal-chart-label" data-role="end-label" text-anchor="end"></text>
          <text class="thermal-chart-label" data-role="on-label" x="804"></text><text class="thermal-chart-label" data-role="off-label" x="804"></text>
          <g data-role="crosshair" visibility="hidden"><path class="thermal-crosshair" data-role="cross-line"/><circle class="thermal-hover-point" data-role="cross-dot" r="4"/></g>
          <g class="thermal-axis"><text x="16" y="16">°C</text><text data-role="start-label" x="48" y="229">0 s</text><text data-role="mid-label" x="420" y="229" text-anchor="middle">30 s</text><text data-role="stop-label" x="792" y="229" text-anchor="end">60 s</text></g>
        </svg>
        <p class="thermal-tooltip" id="${id}tooltip" data-role="tooltip">32,0 °C · 0,0 s · ventilador apagado</p>
        <details data-role="table-details"><summary>Ver historial como tabla · muestras cada 1 s y lectura actual</summary><div class="thermal-table-wrap"><table><caption>Últimos 60 segundos de tiempo simulado</caption><thead><tr><th scope="col">Tiempo (s)</th><th scope="col">Temperatura (°C)</th><th scope="col">Ventilador</th></tr></thead><tbody data-role="table-body"></tbody></table></div></details>
      </section>
      <footer class="thermal-footnote">SIMULACIÓN LOCAL / Modelo de primer orden con pérdidas al ambiente y enfriamiento forzado. La temperatura nunca baja del ambiente. Un umbral alto puede no alcanzarse con poca entrada de calor.</footer>
      <p class="thermal-sr-only" data-role="announcer" role="status" aria-live="polite" aria-atomic="true"></p>
    </section>`;
  };

  NEXO.Simulations.mountThermal = function (root) {
    if (!root || !root.querySelector) throw new TypeError('mountThermal requiere un elemento raíz.');
    if (mounts.has(root)) mounts.get(root)();
    var lab = root.matches('.thermal-lab') ? root : root.querySelector('.thermal-lab');
    if (!lab) throw new Error('Inserta thermalMarkup() en root antes de montar.');
    var model = NEXO.Models && NEXO.Models.thermal;
    if (!model) throw new Error('Carga scripts/models/control.js antes de montar.');
    var nodes = {};
    lab.querySelectorAll('[data-role]').forEach(function (node) { nodes[node.dataset.role] = node; });
    var state = model.create();
    var paused = false;
    var disposed = false;
    var raf = null;
    var last = null;
    var accumulator = 0;
    var history = [];
    var samples = [];
    var selectedTime = null;
    var chartStart = 0;
    var chartMin = 20;
    var chartMax = 60;
    var subscriptions = [];
    var initialConnection = root.isConnected;
    var fmt = new Intl.NumberFormat('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    function text(key, value) { nodes[key].textContent = value; }
    function listen(node, event, callback) {
      node.addEventListener(event, callback);
      subscriptions.push(function () { node.removeEventListener(event, callback); });
    }
    function sample() { return { time: state.time, temp: state.temp, fan: state.fan }; }
    function remember() {
      if (!history.length || state.time >= history[history.length - 1].time + 1 - 1e-7) history.push(sample());
      history = history.filter(function (p) { return p.time >= state.time - 60; });
    }
    function announce(oldFan, oldMode) {
      var messages = [];
      if (oldMode !== state.mode) messages.push(state.mode === 'closed' ? 'Modo automático: lazo cerrado.' : 'Modo manual: lazo abierto.');
      if (oldFan !== state.fan) messages.push('Ventilador ' + (state.fan ? 'encendido.' : 'apagado.'));
      if (messages.length) text('announcer', messages.join(' '));
    }
    function advance() {
      var fan = state.fan;
      model.step(state, 0.1);
      remember();
      announce(fan, state.mode);
    }
    function x(t) { return 48 + (t - chartStart) / 60 * 744; }
    function y(t) { return 198 - (t - chartMin) / (chartMax - chartMin) * 172; }
    function tooltip() {
      var point = samples[samples.length - 1];
      if (selectedTime !== null) point = samples.reduce(function (best, p) {
        return Math.abs(p.time - selectedTime) < Math.abs(best.time - selectedTime) ? p : best;
      }, samples[0]);
      nodes.crosshair.hidden = selectedTime === null;
      nodes.crosshair.setAttribute('visibility', selectedTime === null ? 'hidden' : 'visible');
      nodes['cross-line'].setAttribute('d', 'M' + x(point.time) + ' 26V198');
      nodes['cross-dot'].setAttribute('cx', x(point.time));
      nodes['cross-dot'].setAttribute('cy', y(point.temp));
      text('tooltip', fmt.format(point.temp) + ' °C · ' + fmt.format(point.time) + ' s · ventilador ' + (point.fan ? 'encendido' : 'apagado'));
    }
    function table() {
      if (!nodes['table-details'].open) return;
      var fragment = document.createDocumentFragment();
      samples.forEach(function (p) {
        var row = document.createElement('tr');
        [fmt.format(p.time), fmt.format(p.temp), p.fan ? 'Encendido' : 'Apagado'].forEach(function (value) {
          var cell = document.createElement('td');
          cell.textContent = value;
          row.appendChild(cell);
        });
        fragment.appendChild(row);
      });
      nodes['table-body'].replaceChildren(fragment);
    }
    function chart() {
      samples = history.slice();
      if (samples[samples.length - 1].time < state.time) samples.push(sample());
      chartStart = Math.max(0, state.time - 60);
      chartMin = Math.min(20, state.ambient);
      chartMax = Math.max(60, Math.ceil(Math.max.apply(null, samples.map(function (p) { return p.temp; })) / 10) * 10);
      var grid = '';
      for (var i = 0; i <= 4; i++) {
        var value = chartMin + (chartMax - chartMin) * i / 4;
        var yy = y(value);
        grid += '<path d="M48 ' + yy + 'H792"/><text x="38" y="' + (yy + 4) + '" text-anchor="end">' + Math.round(value) + '</text>';
      }
      nodes.grid.innerHTML = grid; // All interpolated values are internal numbers.
      nodes.trace.setAttribute('d', samples.map(function (p, index) { return (index ? 'L' : 'M') + x(p.time).toFixed(2) + ' ' + y(p.temp).toFixed(2); }).join(' '));
      nodes['on-line'].setAttribute('d', 'M48 ' + y(state.threshold) + 'H792');
      nodes['off-line'].setAttribute('d', 'M48 ' + y(state.threshold - 2) + 'H792');
      nodes['on-label'].setAttribute('y', y(state.threshold) - 8);
      nodes['off-label'].setAttribute('y', y(state.threshold - 2) + 15);
      text('on-label', 'ON > ' + state.threshold + ' °C');
      text('off-label', 'OFF < ' + (state.threshold - 2) + ' °C');
      nodes.endpoint.setAttribute('cx', x(state.time));
      nodes.endpoint.setAttribute('cy', y(state.temp));
      nodes['end-label'].setAttribute('x', Math.max(125, x(state.time) - 10));
      nodes['end-label'].setAttribute('y', Math.max(20, y(state.temp) - 12));
      text('end-label', fmt.format(state.temp) + ' °C');
      text('start-label', fmt.format(chartStart) + ' s');
      text('mid-label', fmt.format(chartStart + 30) + ' s');
      text('stop-label', fmt.format(chartStart + 60) + ' s');
      tooltip();
      table();
    }
    function syncControls() {
      nodes.heat.value = state.heat;
      nodes.threshold.value = state.threshold;
      nodes.mode.value = state.mode;
      nodes.manual.checked = state.manualFan;
    }
    function render() {
      var frozen = paused || document.hidden;
      lab.classList.toggle('is-fan-on', state.fan);
      lab.classList.toggle('is-paused', frozen);
      lab.classList.toggle('is-open-loop', state.mode === 'open');
      text('temperature', fmt.format(state.temp));
      text('diagram-temp', fmt.format(state.temp));
      text('diagram-heat', state.heat + ' %');
      text('heat-value', state.heat + ' %');
      text('threshold-value', state.threshold + ' °C');
      nodes.heat.setAttribute('aria-valuetext', state.heat + ' por ciento');
      nodes.threshold.setAttribute('aria-valuetext', state.threshold + ' grados Celsius');
      text('time', fmt.format(state.time));
      text('sensor-value', fmt.format(state.temp) + ' °C');
      text('fan-state', state.fan ? '● ENCENDIDO' : '○ APAGADO');
      text('logic-state', state.mode === 'closed' ? 'Lazo cerrado' : 'Lazo abierto');
      text('logic-detail', state.mode === 'closed' ? 'Memoria: ' + (state.threshold - 2) + '–' + state.threshold + ' °C' : 'Orden manual · sensor informativo');
      text('power-state', state.fan ? 'Orden 1 · salida 100 %' : 'Orden 0 · salida 0 %');
      text('rule', state.mode === 'closed' ? 'Enciende si T > ' + state.threshold + ' °C. Apaga si T < ' + (state.threshold - 2) + ' °C. Entre ambos límites conserva su estado.' : 'El mando manual decide la salida. La temperatura se mide, pero no modifica la orden al ventilador.');
      nodes['manual-wrap'].hidden = state.mode !== 'open';
      nodes.manual.disabled = state.mode !== 'open';
      text('run-status', document.hidden ? 'PAUSA · PESTAÑA OCULTA' : paused ? 'EN PAUSA' : 'EN MARCHA');
      text('pause', paused ? 'Reanudar' : 'Pausar');
      nodes.pause.setAttribute('aria-pressed', String(paused));
      nodes.step.disabled = !paused || document.hidden;
      chart();
    }
    function cancelFrame() {
      if (raf !== null) window.cancelAnimationFrame(raf);
      raf = null;
      last = null;
      accumulator = 0;
    }
    function schedule() {
      if (!disposed && !paused && !document.hidden && raf === null) raf = window.requestAnimationFrame(frame);
    }
    function frame(now) {
      raf = null;
      if (disposed) return;
      if (root.isConnected) initialConnection = true;
      else if (initialConnection) { cleanup(); return; }
      if (paused || document.hidden) { cancelFrame(); return; }
      if (last === null) last = now;
      accumulator += Math.min(0.25, Math.max(0, (now - last) / 1000));
      last = now;
      var changed = false;
      while (accumulator + 1e-9 >= 0.1) {
        advance();
        accumulator = Math.max(0, accumulator - 0.1);
        changed = true;
      }
      if (changed) render();
      schedule();
    }
    function updateControl() {
      var oldFan = state.fan;
      var oldMode = state.mode;
      state.heat = Number(nodes.heat.value);
      state.threshold = Number(nodes.threshold.value);
      state.mode = nodes.mode.value;
      state.manualFan = nodes.manual.checked;
      model.step(state, 0);
      if (history[history.length - 1].time === state.time) history[history.length - 1] = sample();
      announce(oldFan, oldMode);
      render();
    }
    listen(nodes.heat, 'input', updateControl);
    listen(nodes.threshold, 'input', updateControl);
    listen(nodes.mode, 'change', updateControl);
    listen(nodes.manual, 'change', updateControl);
    listen(nodes.pause, 'click', function () { paused = !paused; cancelFrame(); render(); schedule(); });
    listen(nodes.step, 'click', function () {
      if (!paused || document.hidden) return;
      for (var i = 0; i < 10; i++) advance();
      render();
    });
    listen(nodes.reset, 'click', function () {
      var oldFan = state.fan;
      var oldMode = state.mode;
      cancelFrame();
      state = model.create();
      paused = false;
      selectedTime = null;
      history = [sample()];
      syncControls();
      announce(oldFan, oldMode);
      render();
      schedule();
    });
    listen(nodes.chart, 'pointermove', function (event) {
      var matrix = nodes.chart.getScreenCTM();
      if (!matrix) return;
      var point = nodes.chart.createSVGPoint();
      point.x = event.clientX;
      point.y = event.clientY;
      var local = point.matrixTransform(matrix.inverse());
      selectedTime = chartStart + Math.max(0, Math.min(1, (local.x - 48) / 744)) * 60;
      tooltip();
    });
    listen(nodes.chart, 'pointerleave', function () { if (document.activeElement !== nodes.chart) { selectedTime = null; tooltip(); } });
    listen(nodes.chart, 'focus', function () { selectedTime = state.time; tooltip(); });
    listen(nodes.chart, 'blur', function () { selectedTime = null; tooltip(); });
    listen(nodes.chart, 'keydown', function (event) {
      if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].indexOf(event.key) < 0) return;
      event.preventDefault();
      var index = samples.length - 1;
      if (selectedTime !== null) samples.forEach(function (p, i) { if (Math.abs(p.time - selectedTime) < Math.abs(samples[index].time - selectedTime)) index = i; });
      if (event.key === 'Home') index = 0;
      else if (event.key === 'End') index = samples.length - 1;
      else index = Math.max(0, Math.min(samples.length - 1, index + (event.key === 'ArrowLeft' ? -1 : 1)));
      selectedTime = samples[index].time;
      tooltip();
    });
    listen(nodes['table-details'], 'toggle', table);
    function visibility() {
      cancelFrame();
      if (initialConnection && !root.isConnected) { cleanup(); return; }
      render();
      schedule();
    }
    document.addEventListener('visibilitychange', visibility);
    function cleanup() {
      if (disposed) return;
      disposed = true;
      cancelFrame();
      lab.classList.add('is-paused');
      subscriptions.forEach(function (remove) { remove(); });
      subscriptions = [];
      document.removeEventListener('visibilitychange', visibility);
      mounts.delete(root);
    }
    history = [sample()];
    syncControls();
    render();
    mounts.set(root, cleanup);
    schedule();
    return cleanup;
  };
}(window.NEXO));
