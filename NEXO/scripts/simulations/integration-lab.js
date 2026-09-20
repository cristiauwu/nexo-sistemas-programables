// Integration arena: fixed 0.1 s model ticks; rendering never supplies physics time.
(function (N) {
  'use strict';
  const M = N.Models.integration;
  const e = N.ui.escape;
  const names = { temperature: 'Temperatura / ventilador', metal: 'Metal / banda', pressure: 'Presión / alivio' };
  const f = (value, digits) => value.toLocaleString('es', { minimumFractionDigits: digits, maximumFractionDigits: digits });
  N.Simulations = N.Simulations || {};
  function markup() {
    return `<article class="integration-lab sensor-experiment" data-integration-lab>
      <header><p class="sensor-eyebrow">ARENA DE INTEGRACIÓN / 01–03</p><h3>De la medida a la respuesta.</h3><p>Elige un proceso. Predice, da un paso y sigue la señal.</p></header>
      <div class="integration-case-picker" role="group" aria-label="Caso de integración">${Object.keys(names).map((id) => `<button type="button" class="sensor-button" data-integration-case="${id}" aria-pressed="${id === 'temperature'}">${names[id]}</button>`).join('')}</div>
      <h4 data-integration-title></h4><p class="sensor-lead" data-integration-short></p>
      <div class="integration-arena" data-integration-arena></div>
      <p class="integration-loop-status" data-integration-loop></p>
      <ol class="integration-chain" aria-label="Medida, decisión, potencia y respuesta"><li><span>01 / SENSOR</span><strong data-integration-measure></strong><small data-integration-electrical></small></li><li><span>02 / CONTROLADOR</span><strong data-integration-command></strong><small data-integration-rule></small></li><li><span>03 / POTENCIA</span><strong data-integration-power></strong><small>La señal informa; la fuente aporta energía.</small></li><li><span>04 / ACTUADOR</span><strong data-integration-response></strong><small data-integration-trend></small></li></ol>
      <div class="integration-controls">
        <label>Lazo de control<select data-integration-control="mode"><option value="closed">Cerrado · decide la medida</option><option value="open">Abierto · decide mi orden</option></select></label>
        <label><span data-integration-source-label>Aporte de calor</span><input type="range" min="0" max="100" step="5" value="65" data-integration-control="source"><output data-integration-source-output>65 %</output></label>
        <label data-integration-analog>Umbral de activación<input type="range" min="28" max="50" step="1" value="35" data-integration-control="threshold"><output data-integration-threshold-output></output></label>
        <label data-integration-analog>Histéresis<input type="range" min="0" max="8" step="1" value="2" data-integration-control="hysteresis"><output data-integration-hysteresis-output></output></label>
        <label data-integration-material hidden>Material de la pieza<select data-integration-control="material"><option value="metal">Metal</option><option value="plastic">Plástico</option></select></label>
        <label class="integration-manual"><input type="checkbox" data-integration-control="manualCommand" disabled><span data-integration-manual-label>Orden manual: encender ventilador</span><small>Disponible en lazo abierto. No depende del sensor.</small></label>
      </div>
      <div class="sensor-buttons integration-transport"><button type="button" class="sensor-button" data-integration-action="toggle">Iniciar</button><button type="button" class="sensor-button" data-integration-action="step">Paso +0,1 s</button><button type="button" class="sensor-button" data-integration-action="reset">Reiniciar caso</button><span data-integration-clock>0,0 s · En pausa</span></div>
      <p class="sensor-note" data-integration-notice role="status">Comienza en pausa. Puedes avanzar paso a paso.</p>
      <p class="integration-prediction" data-integration-prediction></p>
      <details class="integration-details"><summary>Qué representa este modelo</summary><p data-integration-detail></p><p>La decisión usa la medida actual. Cada paso integra 0,1 s y vuelve a medir. No se modelan fallos, ruido ni retardos del sensor. Son simulaciones educativas, no un controlador para equipos reales.</p></details>
      <details class="integration-history" data-integration-history><summary>Historial accesible · últimos 120 pasos (hasta 12 s)</summary><p>Una fila por paso físico; la orden corresponde a la decisión tras volver a medir. Cambiar un control en pausa no añade tiempo.</p><div class="integration-table-scroll" role="region" aria-label="Historial del proceso" tabindex="0"><table><caption data-integration-caption></caption><thead><tr><th scope="col">Tiempo (s)</th><th scope="col">Medida</th><th scope="col">Señal</th><th scope="col">Lazo</th><th scope="col">Orden</th><th scope="col">Respuesta</th><th scope="col">Regla aplicada</th></tr></thead><tbody data-integration-history-body></tbody></table></div></details>
    </article>`;
  }
  function arena(id) {
    const process = id === 'temperature' ? `<rect x="92" y="180" width="250" height="120" rx="18" class="ig-metal"/><path d="M122 278v-46m22 46v-64m22 64v-46" class="ig-heat"/><text x="113" y="205">CÁMARA / 22 °C AMBIENTE</text><text x="203" y="253" class="ig-value" data-ig-value></text><circle cx="450" cy="237" r="55" class="ig-metal"/><g data-ig-rotor><path d="M450 235c-48-58 20-73 5-12c72-19 55 49 0 21c-6 73-68 30-13-4Z" class="ig-blade"/></g><circle cx="450" cy="237" r="9" class="ig-hub"/><path d="M396 254H350m46-32h-46" class="ig-flow" data-ig-flow/><text x="392" y="320">VENTILADOR DC</text><path d="M305 180v-30h-79v-20" class="ig-wire"/><circle cx="305" cy="188" r="7" class="ig-sensor"/>` : id === 'metal' ? `<rect x="75" y="249" width="680" height="37" rx="18" class="ig-metal"/><path d="M99 267H731" class="ig-belt" data-ig-belt/><circle cx="98" cy="267" r="12" class="ig-hub"/><circle cx="732" cy="267" r="12" class="ig-hub"/><path d="M117 286v29m596-29v29" class="ig-frame"/><g data-ig-box><rect x="0" y="204" width="49.76" height="43" rx="4" class="ig-box"/><text x="25" y="231" text-anchor="middle" data-ig-material>M</text></g><rect x="488" y="179" width="24" height="28" rx="4" class="ig-sensor"/><path d="M500 207v40" class="ig-detection" data-ig-detection/><text x="477" y="163">INDUCTIVO FIJO</text><text x="102" y="337">CAJA 60 mm / ESTACIÓN 500–520 mm</text><text x="545" y="320" class="ig-value" data-ig-value></text><path d="M500 179v-39H226v-10" class="ig-wire"/>` : `<path d="M79 245h80m165 0h173m60 0h102" class="ig-pipe"/><rect x="159" y="171" width="165" height="139" rx="36" class="ig-metal"/><path d="M177 288H305" class="ig-fluid" data-ig-pressure-bar/><text x="192" y="197">DEPÓSITO</text><text x="183" y="246" class="ig-value" data-ig-value></text><text x="86" y="337">APORTE</text><path d="M87 245h60" class="ig-flow ig-feed" data-ig-feed/><path d="M484 220l37 25-37 25Zm73 0-36 25 36 25Z" class="ig-valve"/><rect x="506" y="188" width="30" height="25" rx="4" class="ig-sensor"/><path d="M521 213v32" class="ig-frame" data-ig-valve/><path d="M568 245h92" class="ig-flow" data-ig-flow/><text x="477" y="300">ALIVIO</text><text x="590" y="337">SALIDA 101 kPa</text><path d="M253 171v-29h-27v-12" class="ig-wire"/><circle cx="253" cy="175" r="7" class="ig-sensor"/>`;
    return `<svg viewBox="0 0 840 405" role="img" aria-label="Proceso, sensor, controlador, potencia y actuador" class="integration-process-svg"><title>${e(names[id])}: recorrido físico de la señal</title><defs><!-- Rampa de metal en clave clara, derivada de tokens.css. --><linearGradient id="integration-metal-gradient" x2="0.1" y2="1"><stop stop-color="var(--metal-1)"/><stop offset=".45" stop-color="var(--metal-3)"/><stop offset="1" stop-color="var(--metal-5)"/></linearGradient></defs><rect x="1" y="1" width="838" height="403" rx="20" class="ig-panel"/><text x="25" y="32" class="ig-overline">PROCESO REALIMENTADO / MODELO DIDÁCTICO</text><g class="ig-block"><rect x="146" y="64" width="160" height="66" rx="9"/><text x="166" y="88">01 SENSOR</text><text x="166" y="112" data-ig-signal></text><rect x="340" y="64" width="160" height="66" rx="9"/><text x="360" y="88">02 CONTROLADOR</text><text x="360" y="112" data-ig-command></text><rect x="540" y="64" width="160" height="66" rx="9"/><text x="560" y="88">03 DRIVER / 24 V</text><text x="560" y="112" data-ig-power></text></g><path d="M306 97h34m160 0h40" class="ig-signal" data-ig-signal-path/><path d="M700 99h85v258H65V148h80" class="ig-feedback" data-ig-feedback/><text x="190" y="384" data-ig-loop></text>${process}</svg>`;
  }
  function mount(root) {
    let state = M.create('temperature');
    let running = false, disposed = false, visible = true, raf = 0, last = null, accumulator = 0;
    const q = (selector) => root.querySelector(selector);
    const set = (name, text) => { const node = q('[data-integration-' + name + ']'); if (node) node.textContent = text; };
    const svgSet = (name, text) => { const node = q('[data-ig-' + name + ']'); if (node) node.textContent = text; };
    function table() {
      if (!q('[data-integration-history]').open) return;
      set('caption', names[state.caseId] + ' · datos de simulación, no de hardware');
      q('[data-integration-history-body]').innerHTML = state.history.map((row) => `<tr><td>${f(row.time, 1)}</td><td>${f(row.value, 2)} ${e(row.unit)}</td><td>${f(row.electrical, 2)} ${e(row.electricalUnit)}</td><td>${row.mode === 'closed' ? 'Cerrado' : 'Abierto'}</td><td>${row.command ? 'ON / 1' : 'OFF / 0'}</td><td>${e(row.response)}</td><td>${e(row.rule)}</td></tr>`).join('');
    }
    function controls() {
      const metal = state.caseId === 'metal', pressure = state.caseId === 'pressure';
      root.querySelectorAll('[data-integration-analog]').forEach((node) => { node.hidden = metal; });
      q('[data-integration-material]').hidden = !metal;
      const threshold = q('[data-integration-control="threshold"]');
      threshold.min = pressure ? 160 : 28; threshold.max = pressure ? 300 : 50;
      const hysteresis = q('[data-integration-control="hysteresis"]');
      hysteresis.max = pressure ? 40 : 8;
      root.querySelectorAll('[data-integration-control]').forEach((node) => {
        const key = node.dataset.integrationControl;
        if (node.type === 'checkbox') node.checked = state[key]; else node.value = state[key];
      });
      q('[data-integration-control="manualCommand"]').disabled = state.mode !== 'open';
      set('source-label', metal ? 'Consigna de velocidad' : pressure ? 'Aporte de aire' : 'Aporte de calor');
      set('source-output', f(state.source, 0) + ' %');
      set('threshold-output', f(state.threshold, 0) + (pressure ? ' kPa abs' : ' °C'));
      set('hysteresis-output', f(state.hysteresis, 0) + (pressure ? ' kPa' : ' °C de diferencia'));
      set('manual-label', 'Orden manual: ' + (metal ? 'mover banda' : pressure ? 'abrir alivio' : 'encender ventilador'));
    }
    function render() {
      const s = state, sensor = s.sensor, metal = s.caseId === 'metal';
      root.dataset.running = String(running && visible && !document.hidden);
      root.dataset.command = String(s.command);
      set('measure', f(sensor.value, metal ? 1 : 2) + ' ' + sensor.unit + (metal ? ' · posición simulada' : ''));
      set('electrical', f(sensor.electrical, 2) + ' ' + sensor.electricalUnit + (metal ? ' · presencia ' + (sensor.detected ? '1' : '0') : ' · señal del sensor'));
      set('command', (s.command ? 'ON / 1' : 'OFF / 0') + ' · ' + (s.mode === 'closed' ? 'automático' : 'manual'));
      set('rule', s.rule); set('power', s.actuator.power); set('response', s.actuator.label);
      const previous = s.history.length > 1 ? s.history[s.history.length - 2] : null;
      const delta = previous ? sensor.value - previous.value : 0;
      set('trend', (Math.abs(delta) < 0.0001 ? 'Sin cambio en el último paso.' : delta > 0 ? 'La medida aumentó en el último paso.' : 'La medida disminuyó en el último paso.') + (metal ? ' Vueltas completas del circuito: ' + s.passes + '.' : ''));
      set('loop', s.mode === 'closed' ? 'LAZO CERRADO · la medida modifica la orden y la acción vuelve al proceso.' : 'LAZO ABIERTO · puedes medir, pero la orden manual ignora esa medida.');
      set('clock', f(s.time, 1) + ' s · ' + (!running ? 'En pausa' : !visible || document.hidden ? 'Suspendido fuera de vista' : 'En marcha'));
      q('[data-integration-action="toggle"]').textContent = running ? 'Pausar' : 'Iniciar';
      q('[data-integration-action="toggle"]').setAttribute('aria-pressed', String(running));
      q('[data-integration-action="step"]').disabled = running;
      svgSet('value', f(sensor.value, metal ? 0 : 1) + ' ' + sensor.unit);
      svgSet('signal', f(sensor.electrical, metal ? 0 : 2) + ' ' + sensor.electricalUnit);
      svgSet('command', s.command ? 'ORDEN 1 / ON' : 'ORDEN 0 / OFF');
      svgSet('power', s.command ? 'SALIDA ACTIVA' : 'SALIDA INACTIVA');
      svgSet('loop', s.mode === 'closed' ? 'RETORNO A LA MEDIDA → DECISIÓN AUTOMÁTICA' : 'RETORNO IGNORADO → DECISIÓN MANUAL');
      q('[data-ig-feedback]').setAttribute('class', 'ig-feedback' + (s.mode === 'open' ? ' ig-feedback-open' : ''));
      q('[data-ig-feedback]').style.strokeDashoffset = String(-s.time * 22);
      q('[data-ig-signal-path]').style.strokeDashoffset = String(-s.time * 25);
      const rotor = q('[data-ig-rotor]'); if (rotor) rotor.setAttribute('transform', 'rotate(' + (s.turns * 360 % 360) + ' 450 237)');
      const box = q('[data-ig-box]'); if (box) {
        box.setAttribute('transform', 'translate(' + (75 + s.position * 680 / 820) + ' 0)');
        box.dataset.material = s.material;
        svgSet('material', s.material === 'metal' ? 'MET' : 'PLAS');
        q('[data-ig-detection]').style.opacity = sensor.detected ? '1' : '.25';
        q('[data-ig-belt]').style.strokeDashoffset = String(-s.turns * 2);
      }
      root.querySelectorAll('[data-ig-flow]').forEach((node) => { node.style.opacity = s.actuator.active ? '1' : '.12'; node.style.strokeDashoffset = String(-s.time * 35); });
      const feed = q('[data-ig-feed]'); if (feed) { feed.style.opacity = s.source ? '1' : '.12'; feed.style.strokeDashoffset = String(-s.time * s.source / 2); }
      const pressureBar = q('[data-ig-pressure-bar]'); if (pressureBar) pressureBar.setAttribute('d', 'M177 288H' + (177 + (s.absolute - 101) / 299 * 128));
      q('.integration-process-svg').setAttribute('aria-label', names[s.caseId] + '. ' + f(sensor.value, 1) + ' ' + sensor.unit + '. ' + s.rule + ' ' + s.actuator.label);
      table();
    }
    function stopFrame() { if (raf) cancelAnimationFrame(raf); raf = 0; last = null; accumulator = 0; }
    function frame(now) {
      raf = 0;
      if (disposed || !running || !visible || document.hidden) { last = null; accumulator = 0; return; }
      if (last !== null) accumulator += Math.min(0.25, Math.max(0, (now - last) / 1000));
      last = now;
      let changed = false;
      while (accumulator >= 0.1 - 1e-9) { state = M.step(state, 0.1); accumulator -= 0.1; changed = true; }
      if (changed) render();
      raf = requestAnimationFrame(frame);
    }
    function syncFrame() {
      stopFrame();
      if (!disposed && running && visible && !document.hidden) raf = requestAnimationFrame(frame);
      render();
    }
    function loadCase(id) {
      if (!Object.prototype.hasOwnProperty.call(names, id)) return;
      running = false; stopFrame(); state = M.create(id);
      const data = N.content.integracion.cases[id];
      ['title', 'short', 'prediction', 'detail'].forEach((key) => set(key, data[key]));
      q('[data-integration-arena]').innerHTML = arena(id);
      root.querySelectorAll('[data-integration-case]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.integrationCase === id)));
      controls(); render();
      set('notice', 'Caso cargado en pausa. Formula tu predicción antes de iniciar.');
    }
    function click(event) {
      const caseButton = event.target.closest('[data-integration-case]');
      if (caseButton) { loadCase(caseButton.dataset.integrationCase); return; }
      const button = event.target.closest('[data-integration-action]'); if (!button) return;
      const action = button.dataset.integrationAction;
      if (action === 'toggle') { running = !running; syncFrame(); set('notice', running ? 'Simulación iniciada. Se suspende si ocultas la página o sales del banco.' : 'Simulación en pausa. Puedes revisar el historial o avanzar un paso.'); }
      if (action === 'step' && !running) { state = M.step(state, 0.1); render(); set('notice', 'Paso completado: ' + f(state.time, 1) + ' segundos. ' + state.rule); }
      if (action === 'reset') loadCase(state.caseId);
    }
    function change(event) {
      const node = event.target.closest('[data-integration-control]'); if (!node) return;
      const key = node.dataset.integrationControl;
      const value = node.type === 'checkbox' ? node.checked : node.type === 'range' ? Number(node.value) : node.value;
      state = M.configure(state, { [key]: value }); controls(); render();
    }
    function visibility() { syncFrame(); }
    function externalCase(event) { loadCase(event.detail); }
    root.addEventListener('click', click); root.addEventListener('input', change);
    root.addEventListener('integration:load', externalCase);
    q('[data-integration-history]').addEventListener('toggle', table);
    document.addEventListener('visibilitychange', visibility);
    const observer = typeof IntersectionObserver === 'function' ? new IntersectionObserver((entries) => {
      if (disposed) return;
      const entry = entries[entries.length - 1];
      if (entry && visible !== entry.isIntersecting) { visible = entry.isIntersecting; syncFrame(); }
    }, { threshold: 0 }) : null;
    if (observer) observer.observe(root);
    loadCase('temperature');
    return function cleanup() {
      if (disposed) return;
      disposed = true; running = false; stopFrame();
      if (observer) observer.disconnect();
      root.removeEventListener('click', click); root.removeEventListener('input', change);
      root.removeEventListener('integration:load', externalCase);
      q('[data-integration-history]').removeEventListener('toggle', table);
      document.removeEventListener('visibilitychange', visibility);
    };
  }
  N.Simulations.integrationMarkup = markup;
  N.Simulations.mountIntegration = mount;
})(window.NEXO);
