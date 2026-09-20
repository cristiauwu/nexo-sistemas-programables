// NEXO/scripts/simulations/motors.js
(function (N) {
  'use strict';
  if (!N) throw new Error('Carga el registro NEXO antes del laboratorio de motores.');
  N.Simulations = N.Simulations || {};
  var serial = 0;
  var mounts = new WeakMap();
  var STEP_SCALE = 0.1; // 1 s real = 0,1 s del modelo: máximo 2 pulsos visibles/s.
  var COMPARISON_SCALE = 0.01; // Giro didáctico a 1/100 de la velocidad calculada.
  function model() {
    if (!N.Models || !N.Models.motors) throw new Error('Carga scripts/models/motors.js antes del laboratorio.');
    return N.Models.motors;
  }
  function fmt(value, digits) {
    return new Intl.NumberFormat('es-ES', { maximumFractionDigits: digits === undefined ? 2 : digits }).format(value);
  }
  function slider(prefix, key, label, min, max, step, value, unit) {
    return '<div><label for="' + prefix + key + '">' + label + '</label> ' +
      '<output for="' + prefix + key + '" data-motor="' + key + '-value">' + fmt(value) + ' ' + unit + '</output>' +
      '<input id="' + prefix + key + '" data-motor-control="' + key + '" type="range" min="' + min + '" max="' + max + '" step="' + step + '" value="' + value + '"></div>';
  }
  function reading(key, label) {
    return '<div class="sensor-reading"><span>' + label + '</span><strong data-motor="' + key + '">—</strong></div>';
  }
  function coil(index, x, y, label) {
    return '<g><rect data-motor-coil="' + index + '" x="' + x + '" y="' + y + '" width="66" height="38" rx="8" fill="var(--surface)" stroke="var(--muted)" stroke-width="1"/>' +
      '<text x="' + (x + 33) + '" y="' + (y + 24) + '" text-anchor="middle" fill="currentColor" font-size="15">' + label + '</text></g>';
  }
  function motorSvg(prefix, type, title) {
    var ac = type === 'ac';
    return '<svg viewBox="0 0 330 260" role="img" aria-labelledby="' + prefix + type + '-svg-title ' + prefix + type + '-svg-desc" style="display:block;width:100%;color:var(--text)">' +
      '<title id="' + prefix + type + '-svg-title">' + title + '</title>' +
      '<desc id="' + prefix + type + '-svg-desc">Rotor con referencia angular. ' + (ac ? 'Flecha discontinua: campo giratorio. Vector inferior: velocidad síncrona, escala de cero a 1800 rpm.' : 'Dos bloques representan las escobillas. La flecha del rotor cambia de sentido con el puente H.') + ' Las vueltas acumuladas se muestran en texto para evitar confundir la orientación con el recorrido.</desc>' +
      '<circle cx="165" cy="112" r="86" fill="var(--surface)" stroke="var(--line)" stroke-width="3"/>' +
      '<path d="M165 22V35M255 112H242M165 202V189M75 112H88" fill="none" stroke="var(--muted)" stroke-width="2"/>' +
      (ac ? '<g data-motor="ac-field"><path d="M165 178V47M158 58L165 47L172 58" fill="none" stroke="var(--amber)" stroke-width="2" stroke-dasharray="5 4"/></g>' : '<path d="M91 101H109V123H91ZM221 101H239V123H221Z" fill="var(--surface)" stroke="var(--muted)" stroke-width="2"/>') +
      '<circle cx="165" cy="112" r="50" fill="none" stroke="var(--muted)"/>' +
      '<g data-motor="' + type + '-rotor"><path d="M165 147V71M158 82L165 71L172 82" fill="none" stroke="var(--cyan)" stroke-width="3"/><circle cx="165" cy="112" r="7" fill="var(--surface)" stroke="var(--cyan)" stroke-width="2"/></g>' +
      (ac ? '<path data-motor="ac-speed-vector" d="M45 225H245M237 220L245 225L237 230" fill="none" stroke="var(--amber)" stroke-width="2"/><text x="45" y="248" font-size="12" fill="currentColor" data-motor="ac-vector-label"></text>' : '<text x="165" y="232" text-anchor="middle" font-size="13" fill="currentColor" data-motor="dc-direction-label"></text>') + '</svg>';
  }

  N.Simulations.motorsMarkup = function () {
    var p = 'motor-' + (++serial) + '-';
    return `<div data-motors-lab>
      <section class="sensor-experiment" data-motor-bank="stepper" aria-labelledby="${p}stepper-title">
        <p class="sensor-eyebrow">BANCO 01 · POSICIÓN POR IMPULSOS</p>
        <h3 id="${p}stepper-title">Paso a paso: ordenar no es medir.</h3>
        <p>Un controlador excita las fases en secuencia A+ → B+ → A− → B−. Un pulso ordena un paso; invertir el sentido recorre la secuencia al revés.</p>
        <div class="experiment-grid">
          <div class="sensor-controls">
            <div><label for="${p}step-angle">Ángulo mecánico por paso</label><select id="${p}step-angle" data-motor-control="step-angle"><option value="1.8">1,8° · 200 pasos/vuelta</option><option value="7.5">7,5° · 48 pasos/vuelta</option></select><p class="sensor-note">Cambiar de motor reinicia su posición y su contador.</p></div>
            <div><label for="${p}step-direction">Sentido</label><select id="${p}step-direction" data-motor-control="step-direction"><option value="1">Horario · positivo</option><option value="-1">Antihorario · negativo</option></select></div>
            ${slider(p, 'step-frequency', 'Frecuencia ordenada', 1, 20, 1, 8, 'Hz')}
            <div><label for="${p}step-load">Carga simulada</label><select id="${p}step-load" data-motor-control="step-load"><option value="normal">Normal · no pierde pasos</option><option value="excessive">Excesiva · pierde cada tercer pulso</option></select></div>
            <div class="sensor-buttons"><button class="sensor-button" type="button" data-motor-action="pulse">Un pulso</button><button class="sensor-button" type="button" data-motor-action="step-play" aria-pressed="false">Reproducir</button><button class="sensor-button" type="button" data-motor-action="step-reset">Reiniciar</button></div>
            <p class="sensor-note">Escala temporal ralentizada ×0,1: 1 s real representa 0,1 s del modelo. A 20 Hz se ven 2 pulsos/s; las rpm calculadas corresponden a la frecuencia ordenada, no a la animación.</p>
            <p class="sensor-note" data-motor="step-play-state">Pausado · listo para un pulso manual.</p>
          </div>
          <div class="sensor-visual">
            <svg viewBox="0 0 390 330" role="img" aria-labelledby="${p}step-svg-title ${p}step-svg-desc" style="display:block;width:100%;color:var(--text)">
              <title id="${p}step-svg-title">Estrella de excitación y rotor paso a paso</title>
              <desc id="${p}step-svg-desc">Cuatro brazos etiquetados A+, B+, A− y B−. El borde más grueso indica excitación, sin destellos. Aguja sólida: posición estimada por el simulador; discontinua: posición ordenada. El esquema de fases es simbólico, no una conexión eléctrica en estrella ni un plano constructivo.</desc>
              <path d="M195 75V126M285 165H234M195 255V204M105 165H156" fill="none" stroke="var(--line)" stroke-width="12"/>
              ${coil(0, 162, 34, 'A+')}${coil(1, 286, 146, 'B+')}${coil(2, 162, 259, 'A−')}${coil(3, 38, 146, 'B−')}
              <circle cx="195" cy="165" r="83" fill="none" stroke="var(--line)"/>
              <circle cx="195" cy="165" r="53" fill="var(--surface)" stroke="var(--muted)"/>
              <g data-motor="step-command"><path d="M195 165V89M190 99L195 89L200 99" fill="none" stroke="var(--amber)" stroke-dasharray="5 4" stroke-width="2"/></g>
              <g data-motor="step-rotor"><path d="M195 194V110M188 123L195 110L202 123" fill="none" stroke="var(--cyan)" stroke-width="3"/></g>
              <circle cx="195" cy="165" r="7" fill="var(--surface)" stroke="var(--cyan)" stroke-width="2"/>
              <text x="195" y="320" text-anchor="middle" font-size="13" fill="currentColor" data-motor="step-phase-svg">Excitación A+ · referencia inicial</text>
            </svg>
            <p class="sensor-note">Aguja sólida: posición del rotor estimada por el simulador. Discontinua: posición ordenada. La disposición de bobinas es simbólica: un cambio de fase no implica un giro mecánico de 90°.</p>
            <div class="sensor-readouts">
              ${reading('pulses', 'Impulsos enviados')}${reading('steps', 'Pasos netos ordenados / simulados')}
              ${reading('ordered', 'Posición ordenada = estimación del controlador')}${reading('estimated', 'Posición del rotor · estimación del simulador')}
              ${reading('step-rpm', 'Rapidez nominal · f × ángulo / 6')}${reading('losses', 'Pasos perdidos · solo el simulador los conoce')}
            </div>
            <p class="sensor-result" data-motor="step-result"></p>
            <p class="sensor-note">Lazo abierto, sin encoder: el controlador cuenta órdenes y no detecta pérdidas. La posición del rotor aquí visible es información del simulador, no una medición disponible para el controlador. La regla de perder cada tercer pulso con carga excesiva es deliberadamente ficticia; no calcula par, aceleración, resonancias ni recuperación física.</p>
          </div>
        </div>
      </section>
      <section class="sensor-experiment" data-motor-bank="comparison" aria-labelledby="${p}comparison-title">
        <p class="sensor-eyebrow">BANCO 02 · GIRO CONTINUO</p><h3 id="${p}comparison-title">AC y DC: distinta alimentación, distinto control.</h3>
        <div class="sensor-grid" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr))">
          <article class="sensor-card">
            <h4>AC · inducción de jaula</h4>
            <div class="sensor-controls"><div><label for="${p}ac-type">Motor AC del modelo</label><select id="${p}ac-type"><option>Inducción de jaula · 4 polos</option></select></div>
              ${slider(p, 'ac-frequency', 'Frecuencia del VFD', 20, 60, 1, 50, 'Hz')}
              ${slider(p, 'ac-slip', 'Deslizamiento impuesto', 0, 8, 0.5, 3, '%')}
            </div>
            <p class="sensor-note">Alimentación AC trifásica a frecuencia variable; controlador: variador de frecuencia (VFD). El modelo no especifica tensión ni estrategia V/f.</p>
            ${motorSvg(p, 'ac', 'Motor AC de cuatro polos y campo giratorio')}
            <p class="sensor-note">Rotor: aguja sólida. Campo giratorio: flecha discontinua. Vector inferior: nₛ; longitud proporcional sobre escala fija 0…1800 rpm, no representa par.</p>
            <div class="sensor-readouts">${reading('ac-sync', 'Campo síncrono · nₛ')}${reading('ac-rpm', 'Rotor · n')}${reading('ac-turns', 'Vueltas acumuladas · rotor')}</div>
            <p class="sensor-result" data-motor="ac-formula"></p>
            <p class="sensor-note">nₛ = 120f/p; n = (1 − s)nₛ, con p = 4. Deslizamiento 0 % es un límite ideal: no representa producir par de inducción con carga. Aquí s es un ajuste, no una predicción a partir de la carga.</p>
          </article>
          <article class="sensor-card">
            <h4>DC · escobillas</h4>
            <div class="sensor-controls"><div><label for="${p}dc-type">Motor DC del modelo</label><select id="${p}dc-type"><option>DC con escobillas · referencia ideal sin carga</option></select></div>
              ${slider(p, 'dc-duty', 'Ciclo de trabajo PWM', 0, 100, 1, 50, '%')}
              <div><label for="${p}dc-direction">Polaridad mediante puente H</label><select id="${p}dc-direction" data-motor-control="dc-direction"><option value="1">Directa · horario</option><option value="-1">Invertida · antihorario</option></select></div>
            </div>
            <p class="sensor-note">Alimentación DC fija de 24 V; controlador: puente H para invertir polaridad y PWM para variar la tensión media ideal aplicada.</p>
            ${motorSvg(p, 'dc', 'Motor DC con escobillas y sentido reversible')}
            <div class="sensor-readouts">${reading('dc-voltage', 'Tensión media ideal')}${reading('dc-rpm', 'Velocidad con signo')}${reading('dc-turns', 'Vueltas netas acumuladas')}</div>
            <p class="sensor-result" data-motor="dc-formula"></p>
            <p class="sensor-note">Referencia ficticia: 1500 rpm a 24 V y 100 % PWM, sin carga. rpm = sentido × 1500 × duty/100. Sin fricción, inercia ni caídas eléctricas; 0 % implica velocidad cero en este modelo, no describe frenado ni rueda libre reales.</p>
          </article>
        </div>
        <div class="sensor-buttons"><button class="sensor-button" type="button" data-motor-action="sample">Avanzar 1 s del modelo</button><button class="sensor-button" type="button" data-motor-action="compare-play" aria-pressed="false">Demostrar ambos</button><button class="sensor-button" type="button" data-motor-action="compare-reset">Reiniciar comparación</button></div>
        <p class="sensor-result" data-motor="comparison-time"></p>
        <p class="sensor-note" data-motor="compare-play-state">Pausado · avance manual disponible.</p>
        <p class="sensor-note">Demostración a escala ×0,01: 1 s real representa 0,01 s del modelo. El avance manual integra 1 s completo y muestra la orientación final; esta puede repetirse tras vueltas enteras. Consulta las vueltas acumuladas, no deduzcas velocidad solo de la aguja. Cambiar un control actualiza velocidades sin mover el tiempo ni la posición.</p>
        <p class="sensor-note">Modelos ideales de velocidad estable: sin arranque, par ni consumo calculados. Comparar rpm no permite decidir cuál motor es más potente o eficiente. Invertir un motor real requiere una estrategia segura de desaceleración y conmutación.</p>
        <div class="sensor-controls experiment-grid">
          <div><label for="${p}case">Caso de aplicación</label><select id="${p}case" data-motor-control="case"><option value="fan">Ventilador · giro continuo</option><option value="indexed">Banda indexada · posición por incrementos</option></select></div>
          <div><label for="${p}approach">Enfoque que quieres evaluar</label><select id="${p}approach" data-motor-control="approach"><option value="ac">AC de inducción + VFD</option><option value="dc">DC + puente H / PWM</option><option value="stepper">Paso a paso + controlador de fases</option></select></div>
        </div>
        <p class="sensor-result" data-motor="application" role="status" aria-live="polite"></p>
      </section>
      <p class="sensor-note" data-motor="motion-note"></p>
      <p class="sensor-note" data-motor="announcement" role="status" aria-live="polite" aria-atomic="true"></p>
    </div>`;
  };

  N.Simulations.mountMotors = function (root) {
    if (!root || !root.querySelector) throw new TypeError('mountMotors requiere un elemento raíz.');
    var lab = root.matches && root.matches('[data-motors-lab]') ? root : root.querySelector('[data-motors-lab]');
    if (!lab) throw new Error('Inserta motorsMarkup() antes de montar el laboratorio.');
    if (mounts.has(lab)) mounts.get(lab)();
    var M = model();
    var nodes = {}, controls = {}, buttons = {};
    lab.querySelectorAll('[data-motor]').forEach(function (node) { nodes[node.dataset.motor] = node; });
    lab.querySelectorAll('[data-motor-control]').forEach(function (node) { controls[node.dataset.motorControl] = node; });
    lab.querySelectorAll('[data-motor-action]').forEach(function (node) { buttons[node.dataset.motorAction] = node; });
    var coils = lab.querySelectorAll('[data-motor-coil]');
    var state = M.createStepper();
    var comparison = M.createComparison();
    var running = { stepper: false, comparison: false };
    var visible = { stepper: true, comparison: true };
    var frame = null, previous = null, pulseTime = 0, disposed = false;
    var observer = null;
    var motion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    function text(key, content) { nodes[key].textContent = content; }
    function val(key) { return Number(controls[key].value); }
    function acOptions() { return { frequency: val('ac-frequency'), slipPercent: val('ac-slip') }; }
    function dcOptions() { return { duty: val('dc-duty'), direction: val('dc-direction') }; }
    function sliderOutput(key, unit) {
      var content = fmt(val(key)) + ' ' + unit;
      text(key + '-value', content);
      controls[key].setAttribute('aria-valuetext', content);
    }
    function settings() {
      Object.assign(state, M.stepperSettings({ stepAngle: val('step-angle'), frequency: val('step-frequency'), direction: val('step-direction'), load: controls['step-load'].value }));
    }
    function renderStepper() {
      var r = M.stepperReadout(state);
      sliderOutput('step-frequency', 'Hz');
      text('pulses', fmt(state.pulses, 0));
      text('steps', fmt(state.commandedSteps, 0) + ' / ' + fmt(state.simulatedSteps, 0));
      text('ordered', fmt(r.commandedAngle) + '°');
      text('estimated', fmt(r.simulatedAngle) + '°');
      text('step-rpm', fmt(r.rpm) + ' rpm');
      text('losses', fmt(state.lostSteps, 0));
      text('step-phase-svg', 'Excitación ' + r.phase + (state.pulses ? ' · pulso ' + state.pulses : ' · referencia inicial'));
      text('step-result', 'Error orden − rotor simulado: ' + fmt(r.errorAngle) + '°. ' + (state.lastLost ? 'Último pulso: el rotor no avanzó; la excitación sí cambió.' : state.pulses ? 'Último pulso: avance realizado en el modelo.' : 'Referencia inicial A+, posición 0°.'));
      nodes['step-command'].setAttribute('transform', 'rotate(' + M.angle(r.commandedAngle) + ' 195 165)');
      nodes['step-rotor'].setAttribute('transform', 'rotate(' + r.rotorAngle + ' 195 165)');
      coils.forEach(function (node) {
        var active = Number(node.dataset.motorCoil) === state.phase;
        // Solo borde y etiqueta: sin alternancia de relleno, opacidad ni destellos.
        node.setAttribute('stroke', active ? 'var(--cyan)' : 'var(--muted)');
        node.setAttribute('stroke-width', active ? '3' : '1');
      });
    }
    function renderComparison() {
      var ac = M.ac(acOptions()), dc = M.dc(dcOptions());
      sliderOutput('ac-frequency', 'Hz'); sliderOutput('ac-slip', '%'); sliderOutput('dc-duty', '%');
      text('ac-sync', fmt(ac.synchronousRpm) + ' rpm'); text('ac-rpm', fmt(ac.rpm) + ' rpm');
      text('ac-turns', fmt(comparison.acTurns, 3)); text('dc-turns', fmt(comparison.dcTurns, 3));
      text('dc-voltage', fmt(dc.averageVoltage) + ' V'); text('dc-rpm', fmt(dc.rpm) + ' rpm');
      text('ac-formula', '120 × ' + fmt(ac.frequency) + ' / 4 = ' + fmt(ac.synchronousRpm) + ' rpm; rotor = (1 − ' + fmt(ac.slipPercent / 100, 3) + ') × ' + fmt(ac.synchronousRpm) + ' = ' + fmt(ac.rpm) + ' rpm.');
      text('dc-formula', (dc.direction < 0 ? '−' : '+') + '1500 × ' + fmt(dc.duty) + ' / 100 = ' + fmt(dc.rpm) + ' rpm.');
      text('dc-direction-label', dc.rpm === 0 ? 'PWM 0 % · detenido en este modelo' : dc.direction < 0 ? 'Polaridad invertida · antihorario' : 'Polaridad directa · horario');
      text('ac-vector-label', 'nₛ = ' + fmt(ac.synchronousRpm) + ' rpm · escala 0…1800');
      var end = 45 + ac.synchronousRpm / 1800 * 240;
      nodes['ac-speed-vector'].setAttribute('d', 'M45 225H' + end + 'M' + (end - 8) + ' 220L' + end + ' 225L' + (end - 8) + ' 230');
      nodes['ac-rotor'].setAttribute('transform', 'rotate(' + M.angle(comparison.acTurns * 360) + ' 165 112)');
      nodes['ac-field'].setAttribute('transform', 'rotate(' + M.angle(comparison.fieldTurns * 360) + ' 165 112)');
      nodes['dc-rotor'].setAttribute('transform', 'rotate(' + M.angle(comparison.dcTurns * 360) + ' 165 112)');
      text('comparison-time', 'Tiempo acumulado del modelo: ' + fmt(comparison.time, 3) + ' s.');
    }
    function renderApplication() { text('application', M.application(controls.case.value, controls.approach.value)); }
    function motionNote() {
      text('motion-note', motion && motion.matches ? 'Movimiento reducido detectado: inicio manual. Puedes avanzar por pulso o por muestra; la reproducción solo comienza si la solicitas.' : 'Ambos bancos comienzan pausados. Ocultar la pestaña o sacar un banco del área visible pausa su reproducción; no se reanuda sola.');
    }
    function playButtons() {
      buttons['step-play'].textContent = running.stepper ? 'Pausar' : 'Reproducir';
      buttons['step-play'].setAttribute('aria-pressed', String(running.stepper));
      buttons['compare-play'].textContent = running.comparison ? 'Pausar ambos' : 'Demostrar ambos';
      buttons['compare-play'].setAttribute('aria-pressed', String(running.comparison));
    }
    function cancelIdleFrame() {
      if (!running.stepper && !running.comparison) {
        if (frame !== null) window.cancelAnimationFrame(frame);
        frame = null; previous = null;
      }
    }
    function pause(bank, reason) {
      running[bank] = false;
      if (bank === 'stepper') pulseTime = 0;
      text(bank === 'stepper' ? 'step-play-state' : 'compare-play-state', reason || 'Pausado · avance manual disponible.');
      playButtons(); cancelIdleFrame();
    }
    function tick(timestamp) {
      frame = null;
      if (disposed) return;
      if (document.hidden) { pause('stepper', 'Pausa: pestaña oculta.'); pause('comparison', 'Pausa: pestaña oculta.'); return; }
      // No recupera ráfagas de pasos tras bloqueo del hilo o pestaña inactiva.
      var dt = previous === null ? 0 : Math.min((timestamp - previous) / 1000, 0.1);
      previous = timestamp;
      if (running.stepper) {
        pulseTime += dt * STEP_SCALE;
        if (pulseTime >= 1 / state.frequency) {
          pulseTime %= 1 / state.frequency;
          M.pulse(state); renderStepper();
        }
      }
      if (running.comparison) {
        M.advanceComparison(comparison, dt * COMPARISON_SCALE, acOptions(), dcOptions());
        renderComparison();
      }
      if (running.stepper || running.comparison) frame = window.requestAnimationFrame(tick);
      else previous = null;
    }
    function toggle(bank) {
      if (running[bank]) { pause(bank); return; }
      if (document.hidden || !visible[bank]) {
        text('announcement', 'La reproducción requiere que la pestaña y el banco estén visibles.'); return;
      }
      running[bank] = true;
      text(bank === 'stepper' ? 'step-play-state' : 'compare-play-state', bank === 'stepper' ? 'Reproduciendo impulsos discretos a escala ×0,1.' : 'Demostración compartida a escala ×0,01.');
      playButtons();
      if (frame === null) { previous = null; frame = window.requestAnimationFrame(tick); }
    }
    function onInput(event) {
      var key = event.target.dataset.motorControl;
      if (!key) return;
      if (key.indexOf('step-') === 0) {
        settings();
        if (key === 'step-angle') {
          pause('stepper', 'Pausado: cambio de motor; referencia y contador reiniciados.');
          state = M.createStepper(state);
        }
        pulseTime = 0;
        renderStepper();
      } else if (key === 'case' || key === 'approach') renderApplication();
      else renderComparison();
    }
    function onClick(event) {
      var button = event.target.closest('[data-motor-action]');
      if (!button || !lab.contains(button)) return;
      switch (button.dataset.motorAction) {
        case 'pulse': pause('stepper'); M.pulse(state); renderStepper(); text('announcement', 'Pulso ' + state.pulses + ': ' + M.stepperReadout(state).phase + (state.lastLost ? '. Paso perdido en el simulador.' : '. Paso ejecutado.')); break;
        case 'step-play': toggle('stepper'); break;
        case 'step-reset': pause('stepper'); state = M.createStepper(state); renderStepper(); text('announcement', 'Paso a paso reiniciado en cero; se conservan los ajustes.'); break;
        case 'sample': pause('comparison'); M.advanceComparison(comparison, 1, acOptions(), dcOptions()); renderComparison(); text('announcement', 'Muestra de un segundo completada. Tiempo del modelo: ' + fmt(comparison.time, 3) + ' segundos.'); break;
        case 'compare-play': toggle('comparison'); break;
        case 'compare-reset': pause('comparison'); comparison = M.createComparison(); renderComparison(); text('announcement', 'Comparación reiniciada; se conservan los ajustes.'); break;
      }
    }
    function onVisibility() {
      if (document.hidden) {
        pause('stepper', 'Pausa automática: pestaña oculta; reanuda manualmente.');
        pause('comparison', 'Pausa automática: pestaña oculta; reanuda manualmente.');
      }
    }
    function onMotion() {
      motionNote();
      if (motion && motion.matches) { pause('stepper', 'Pausa: preferencia de movimiento reducido.'); pause('comparison', 'Pausa: preferencia de movimiento reducido.'); }
    }
    lab.addEventListener('input', onInput);
    lab.addEventListener('click', onClick);
    document.addEventListener('visibilitychange', onVisibility);
    if (motion) {
      if (motion.addEventListener) motion.addEventListener('change', onMotion);
      else if (motion.addListener) motion.addListener(onMotion);
    }
    if (window.IntersectionObserver) {
      observer = new window.IntersectionObserver(function (entries) {
        if (disposed) return;
        entries.forEach(function (entry) {
          var bank = entry.target.dataset.motorBank;
          visible[bank] = entry.isIntersecting;
          if (!entry.isIntersecting && running[bank]) pause(bank, 'Pausa automática: banco fuera de vista; reanuda manualmente.');
        });
      }, { threshold: 0 });
      lab.querySelectorAll('[data-motor-bank]').forEach(function (bank) { observer.observe(bank); });
    }
    function cleanup() {
      if (disposed) return;
      disposed = true;
      running.stepper = false; running.comparison = false;
      if (frame !== null) window.cancelAnimationFrame(frame);
      frame = null; previous = null;
      if (observer) observer.disconnect();
      lab.removeEventListener('input', onInput);
      lab.removeEventListener('click', onClick);
      document.removeEventListener('visibilitychange', onVisibility);
      if (motion) {
        if (motion.removeEventListener) motion.removeEventListener('change', onMotion);
        else if (motion.removeListener) motion.removeListener(onMotion);
      }
      playButtons();
      mounts.delete(lab);
    }
    settings(); renderStepper(); renderComparison(); renderApplication(); playButtons(); motionNote();
    mounts.set(lab, cleanup);
    return cleanup;
  };
}(window.NEXO));
