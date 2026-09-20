// NEXO/scripts/simulations/sensor-physics.js
(function (N) {
  'use strict';
  if (!N) throw new Error('Carga el registro NEXO antes de los experimentos físicos.');
  N.Simulations = N.Simulations || {};
  var serial = 0;
  var mounts = new WeakMap();
  function model() {
    if (!N.Models || !N.Models.sensorPhysics) throw new Error('Carga scripts/models/sensor-physics.js antes del laboratorio.');
    return N.Models.sensorPhysics;
  }
  function fmt(value, digits) {
    return new Intl.NumberFormat('es-ES', { maximumFractionDigits: digits === undefined ? 2 : digits }).format(value);
  }
  function range(id, key, label, min, max, value, unit, help) {
    return '<div><label for="' + id + '">' + label + '</label> ' +
      '<output for="' + id + '" data-physics="' + key + '-value">' + fmt(value) + ' ' + unit + '</output>' +
      '<input id="' + id + '" data-control="' + key + '" type="range" min="' + min + '" max="' + max +
      '" step="1" value="' + value + '" aria-describedby="' + id + '-help">' +
      '<p class="sensor-note" id="' + id + '-help">' + help + '</p></div>';
  }
  function thermalCard(sensor, prefix) {
    var id = prefix + sensor.id;
    return `<article class="sensor-card" data-thermal-card="${sensor.id}" aria-labelledby="${id}-title">
      <p class="sensor-eyebrow">${sensor.min} a ${sensor.max} °C · ${sensor.unit}</p>
      <h4 id="${id}-title">${sensor.name}</h4><p>${sensor.principle}</p>
      <div class="sensor-reading"><span>Lectura del modelo</span><strong data-reading>—</strong></div>
      <p class="sensor-result" data-range-status>Dentro del rango didáctico</p>
      <svg data-thermal-chart="${sensor.id}" viewBox="0 0 340 218" role="group" tabindex="0"
        aria-labelledby="${id}-chart-title" aria-describedby="${id}-chart-help ${id}-cursor" style="display:block;width:100%;color:var(--text)">
        <title id="${id}-chart-title">${sensor.name}: ${sensor.unit} frente a temperatura en °C</title>
        <g data-chart-grid fill="none" stroke="var(--line)"></g>
        <path d="M64 28V174H318" fill="none" stroke="var(--muted)"/>
        <g data-chart-labels fill="currentColor" font-size="11"></g>
        <path data-curve fill="none" stroke="var(--cyan)" stroke-width="2"/>
        <circle data-marker r="5" fill="var(--cyan)" stroke="var(--surface)" stroke-width="2"/>
        <g data-crosshair visibility="hidden"><path data-cross-line fill="none" stroke="var(--muted)" stroke-dasharray="3 4"/>
          <circle data-cross-dot r="4" fill="var(--surface)" stroke="var(--cyan)" stroke-width="2"/></g>
        <text x="64" y="16" fill="currentColor" font-size="11">${sensor.unit} · escala lineal</text>
        <text x="318" y="211" text-anchor="end" fill="currentColor" font-size="11">Temperatura (°C)</text>
      </svg>
      <p class="sensor-note" id="${id}-chart-help">Punto sólido: temperatura seleccionada. Explora la curva con el puntero o enfoca el gráfico y usa ← →, Inicio y Fin.</p>
      <p class="sensor-note" id="${id}-cursor" data-cursor>Explora para consultar un punto.</p>
      <p class="sensor-note" data-compensation${sensor.id === 'k' ? '' : ' hidden'}></p>
      <details class="sensor-details"><summary>Modelo y cinco puntos de referencia</summary><p class="sensor-note">${sensor.note}</p>
        <table class="sensor-table"><caption>${sensor.name} · valores orientativos; misma referencia que el gráfico</caption>
        <thead><tr><th scope="col">T (°C)</th><th scope="col">Lectura (${sensor.unit})</th></tr></thead><tbody data-points></tbody></table>
      </details>
    </article>`;
  }
  N.Simulations.physicsMarkup = function () {
    var number = ++serial;
    var temp = 'temp-' + number + '-';
    var press = 'press-' + number + '-';
    return `<div data-physics-lab>
      <section class="sensor-experiment" aria-labelledby="${temp}title" data-temperature-experiment>
        <p class="sensor-eyebrow">EXPERIMENTO · TEMPERATURA</p><h3 id="${temp}title">Una temperatura, cuatro respuestas.</h3>
        <p>Compara resistencia y tensión sin confundir sus unidades. Los límites pertenecen a estos modelos didácticos, no a todos los componentes comerciales.</p>
        <div class="sensor-controls experiment-grid">
          ${range(temp + 'source', 'temperature', 'Temperatura de la unión o del cuerpo sensor', -200, 1100, 25, '°C', '−200 a 1100 °C. Cada tarjeta solo calcula dentro de su propio rango; no extrapola.')}
          ${range(temp + 'reference', 'cold', 'Unión de referencia del termopar', 0, 50, 25, '°C', '0 a 50 °C. Solo modifica la tensión del termopar, no las resistencias.')}
        </div>
        <div class="sensor-grid" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,270px),1fr))">
          ${model().sensors.map(function (sensor) { return thermalCard(sensor, temp); }).join('')}
        </div>
        <p class="sensor-note">Cada gráfico tiene su propia escala vertical. Una misma altura no significa una misma respuesta. La tensión del termopar puede ser negativa cuando la unión caliente está más fría que la referencia.</p>
        <p data-physics="temperature-summary" role="status" aria-live="polite" aria-atomic="true"></p>
      </section>
      <section class="sensor-experiment" aria-labelledby="${press}title" data-pressure-experiment>
        <p class="sensor-eyebrow">EXPERIMENTO · PRESIÓN</p><h3 id="${press}title">La referencia cambia la medida.</h3>
        <p>Presión medida = presión absoluta de entrada − presión de referencia. La membrana responde a esa diferencia; la electrónica convierte la deformación en una señal.</p>
        <div class="experiment-grid">
          <div class="sensor-controls">
            ${range(press + 'absolute', 'absolute', 'Presión absoluta de entrada · Pabs', 0, 400, 150, 'kPa', '0 a 400 kPa absolutos: nunca se permite una presión absoluta negativa.')}
            ${range(press + 'atmosphere', 'atmosphere', 'Presión atmosférica · Patm', 80, 110, 101, 'kPa', '80 a 110 kPa absolutos. Es la referencia en modo manométrico.')}
            ${range(press + 'secondary', 'secondary', 'Segunda cámara · P2', 0, 200, 100, 'kPa', '0 a 200 kPa absolutos. Es la referencia en modo diferencial.')}
            <div><label for="${press}mode">Tipo de presión medida</label><select id="${press}mode" data-control="pressure-mode">
              <option value="absolute">Absoluta · referencia al vacío ideal (0 kPa)</option>
              <option value="gauge">Manométrica · referencia atmosférica</option>
              <option value="differential">Diferencial · referencia P2</option></select></div>
            <div><label for="${press}transducer">Conversión de la membrana</label><select id="${press}transducer" data-control="transducer">
              <option value="piezoresistive">Piezorresistiva · cambio de resistencia</option>
              <option value="capacitive">Capacitiva · cambio de capacitancia</option></select></div>
            ${range(press + 'threshold', 'threshold', 'Umbral de alarma sobre la presión medida', -200, 400, 100, 'kPa', 'Activa si Pmed ≥ umbral; sin histéresis. La referencia seleccionada también cambia la decisión.')}
          </div>
          <div class="sensor-visual">
            <svg viewBox="0 0 480 290" role="img" aria-labelledby="${press}diagram-title ${press}diagram-description" style="display:block;width:100%;color:var(--text)">
              <title id="${press}diagram-title">Membrana entre la entrada y la referencia</title>
              <desc id="${press}diagram-description">La membrana se curva hacia la derecha con presión medida positiva, queda plana a cero y se curva a la izquierda con presión medida negativa. La deformación se exagera para mostrar el signo.</desc>
              <rect x="24" y="45" width="432" height="180" rx="12" fill="var(--surface)" stroke="var(--line)"/>
              <path d="M240 48V222" stroke="var(--muted)" stroke-dasharray="4 5"/>
              <path data-physics="membrane" d="M240 48Q240 135 240 222" fill="none" stroke="var(--cyan)" stroke-width="5"/>
              <g data-physics="capacitor-plate" visibility="hidden"><path d="M315 75V195" stroke="var(--amber)" stroke-width="5"/>
                <text x="330" y="149" fill="currentColor" font-size="11">Placa fija</text></g>
              <text x="45" y="29" fill="currentColor" font-size="13">ENTRADA · Pabs</text>
              <text x="435" y="29" text-anchor="end" fill="currentColor" font-size="13">REFERENCIA</text>
              <text x="48" y="120" data-physics="diagram-absolute" fill="currentColor" font-size="17"></text>
              <text x="432" y="90" text-anchor="end" data-physics="diagram-reference" fill="currentColor" font-size="17"></text>
              <text x="240" y="248" text-anchor="middle" fill="currentColor" font-size="13">Membrana · línea discontinua = reposo</text>
              <text x="240" y="274" text-anchor="middle" data-physics="deflection" fill="currentColor" font-size="12"></text>
            </svg>
            <p class="sensor-result" data-physics="pressure-formula"></p>
            <div class="sensor-readouts">
              <div class="sensor-reading"><span>Presión medida</span><strong data-physics="measured"></strong></div>
              <div class="sensor-reading"><span>Transducción normalizada</span><strong data-physics="transduction"></strong></div>
              <div class="sensor-reading"><span>Salida analógica</span><strong data-physics="current"></strong></div>
            </div>
            <p class="sensor-note" data-physics="transduction-note"></p>
            <p class="sensor-note" data-physics="signal-note"></p>
            <p class="sensor-result" data-physics="saturation"></p>
            <p class="sensor-note" data-physics="vacuum"></p>
            <div class="sensor-result" role="status" aria-live="polite" aria-atomic="true" data-physics="alarm"></div>
            <p class="sensor-note">Modelo normalizado, no sensor real: no define dimensiones, material, capacitancia en faradios ni resistencia nominal. La deformación visual está exagerada y no representa milímetros.</p>
            <details class="sensor-details"><summary>Transferencia e integración futura</summary>
              <p class="sensor-note">I = 4 + 16 · limitar((Pmed − mínimo)/(máximo − mínimo), 0, 1) mA. Absoluta: 0…400 kPa; manométrica y diferencial: −200…400 kPa. Alcanzar un extremo es válido; sobrepasarlo satura. El dominio de los controles está contenido en esos rangos.</p>
              <p class="sensor-note">La salida lógica representa una orden, no una carga accionada: 1 si Pmed ≥ umbral; 0 en caso contrario. Puede alimentar un controlador futuro; aquí no se conecta hardware.</p>
              <p class="sensor-note">API pura: NEXO.Models.sensorPhysics.pressure(estado).integration. Evento local con propagación: <code>nexo:pressure-change</code>; <code>detail</code> contiene measuredKpa, referenceKpa, mode, currentMa, alarm, digitalOutput y saturated. No usa comunicación de red.</p>
            </details>
          </div>
        </div>
      </section>
    </div>`;
  };

  N.Simulations.mountPhysics = function (root) {
    if (!root || !root.querySelector) throw new TypeError('mountPhysics requiere un elemento raíz.');
    var lab = root.matches && root.matches('[data-physics-lab]') ? root : root.querySelector('[data-physics-lab]');
    if (!lab) throw new Error('Inserta physicsMarkup() antes de montar el laboratorio.');
    if (mounts.has(lab)) mounts.get(lab)();
    var physics = model();
    var nodes = {};
    var controls = {};
    var cards = {};
    var scales = {};
    var selection = {};
    var disposed = false;
    lab.querySelectorAll('[data-physics]').forEach(function (node) { nodes[node.dataset.physics] = node; });
    lab.querySelectorAll('[data-control]').forEach(function (node) { controls[node.dataset.control] = node; });
    lab.querySelectorAll('[data-thermal-card]').forEach(function (node) { cards[node.dataset.thermalCard] = node; });
    function text(key, value) { nodes[key].textContent = value; }
    function value(key) { return Number(controls[key].value); }
    function syncOutput(key, unit) {
      text(key + '-value', fmt(value(key)) + ' ' + unit);
      controls[key].setAttribute('aria-valuetext', fmt(value(key)) + ' ' + unit);
    }
    function cursor(id) {
      var card = cards[id];
      var group = card.querySelector('[data-crosshair]');
      var selected = selection[id];
      group.setAttribute('visibility', selected === undefined ? 'hidden' : 'visible');
      if (selected === undefined) {
        card.querySelector('[data-cursor]').textContent = 'Explora para consultar un punto.';
        return;
      }
      var result = physics.temperature(id, selected, value('cold'));
      var scale = scales[id];
      var x = scale.x(selected);
      var y = scale.y(result.value);
      card.querySelector('[data-cross-line]').setAttribute('d', 'M' + x + ' 28V174');
      card.querySelector('[data-cross-dot]').setAttribute('cx', x);
      card.querySelector('[data-cross-dot]').setAttribute('cy', y);
      card.querySelector('[data-cursor]').textContent = 'Consulta de curva: ' + fmt(selected, 1) + ' °C → ' + fmt(result.value, 3) + ' ' + result.unit + '.';
    }
    function renderTemperature() {
      syncOutput('temperature', '°C');
      syncOutput('cold', '°C');
      var unavailable = [];
      physics.sensors.forEach(function (sensor) {
        var card = cards[sensor.id];
        var reading = physics.temperature(sensor.id, value('temperature'), value('cold'));
        var samples = physics.temperatureCurve(sensor.id, value('cold'), 121);
        var ys = samples.map(function (point) { return point.value; });
        var minY = Math.min(0, Math.min.apply(null, ys));
        var maxY = Math.max.apply(null, ys);
        var span = maxY - minY || 1;
        var scale = {
          x: function (temperature) { return 64 + (temperature - sensor.min) / (sensor.max - sensor.min) * 254; },
          y: function (readingValue) { return 174 - (readingValue - minY) / span * 146; }
        };
        scales[sensor.id] = scale;
        card.querySelector('[data-reading]').textContent = reading.inRange ? fmt(reading.value, 3) + ' ' + sensor.unit : 'Fuera de rango / no extrapolar';
        card.querySelector('[data-range-status]').textContent = reading.inRange ? 'Dentro del rango didáctico' : 'Sin lectura: el modelo no es válido a esta temperatura.';
        card.classList.toggle('is-out-of-range', !reading.inRange);
        if (!reading.inRange) unavailable.push(sensor.name);
        card.querySelector('[data-curve]').setAttribute('d', samples.map(function (point, index) {
          return (index ? 'L' : 'M') + scale.x(point.temperature).toFixed(2) + ' ' + scale.y(point.value).toFixed(2);
        }).join(' '));
        var grid = '';
        var labels = '';
        for (var i = 0; i <= 2; i++) {
          var yy = minY + span * i / 2;
          grid += '<path d="M64 ' + scale.y(yy) + 'H318"/>';
          labels += '<text x="56" y="' + (scale.y(yy) + 4) + '" text-anchor="end">' + fmt(yy, 1) + '</text>';
          var xx = sensor.min + (sensor.max - sensor.min) * i / 2;
          labels += '<text x="' + scale.x(xx) + '" y="193" text-anchor="' + (i === 0 ? 'start' : i === 2 ? 'end' : 'middle') + '">' + fmt(xx, 1) + '</text>';
        }
        card.querySelector('[data-chart-grid]').innerHTML = grid;
        card.querySelector('[data-chart-labels]').innerHTML = labels;
        var marker = card.querySelector('[data-marker]');
        marker.setAttribute('visibility', reading.inRange ? 'visible' : 'hidden');
        if (reading.inRange) {
          marker.setAttribute('cx', scale.x(reading.temperature));
          marker.setAttribute('cy', scale.y(reading.value));
        }
        if (sensor.id === 'k') card.querySelector('[data-compensation]').textContent = reading.inRange ?
          'V = E(T) − E(Tref) = ' + fmt(reading.value, 3) + ' mV. Referencia: ' + fmt(reading.reference, 1) +
          ' °C → E(Tref) = ' + fmt(reading.referenceMv, 3) + ' mV. Compensada: V + E(Tref) = ' + fmt(reading.compensatedMv, 3) + ' mV (referida a 0 °C).' :
          'Fuera de rango / no extrapolar: no se calcula tensión ni compensación.';
        card.querySelector('[data-points]').innerHTML = sensor.points.map(function (degrees) {
          return '<tr><th scope="row">' + fmt(degrees) + '</th><td>' + fmt(physics.temperature(sensor.id, degrees, value('cold')).value, 3) + '</td></tr>';
        }).join('');
        cursor(sensor.id);
      });
      text('temperature-summary', 'Temperatura: ' + fmt(value('temperature')) + ' °C. ' +
        (unavailable.length ? 'Fuera de rango, sin lectura: ' + unavailable.join(', ') + '.' : 'Los cuatro sensores están dentro de su rango didáctico.'));
    }
    function renderPressure() {
      ['absolute', 'atmosphere', 'secondary', 'threshold'].forEach(function (key) { syncOutput(key, 'kPa'); });
      var result = physics.pressure({ absolute: value('absolute'), atmosphere: value('atmosphere'),
        secondary: value('secondary'), threshold: value('threshold'), mode: controls['pressure-mode'].value,
        transducer: controls.transducer.value });
      var names = { absolute: 'Absoluta', gauge: 'Manométrica', differential: 'Diferencial' };
      var references = { absolute: 'vacío ideal', gauge: 'atmósfera', differential: 'segunda cámara P2' };
      text('measured', fmt(result.measured) + ' kPa · ' + names[result.mode].toLowerCase());
      text('pressure-formula', names[result.mode] + ': ' + fmt(result.absolute) + ' − ' + fmt(result.reference) + ' = ' + fmt(result.measured) + ' kPa. Referencia: ' + references[result.mode] + '.');
      text('diagram-absolute', fmt(result.absolute) + ' kPa');
      text('diagram-reference', fmt(result.reference) + ' kPa');
      // La curvatura cuadrática dobla el desplazamiento del control para obtener el deseado en el centro.
      var deflection = result.normalizedDeflection * 26.25;
      nodes.membrane.setAttribute('d', 'M240 48Q' + (240 + 2 * deflection) + ' 135 240 222');
      text('deflection', result.measured === 0 ? 'Sin diferencia: membrana en reposo' :
        (result.measured > 0 ? 'Deformación positiva → referencia' : 'Deformación negativa → entrada'));
      var capacitive = result.transducer === 'capacitive';
      nodes['capacitor-plate'].setAttribute('visibility', capacitive ? 'visible' : 'hidden');
      text('transduction', capacitive ? 'C/C₀ = ' + fmt(result.capacitanceRatio, 3) :
        'ΔR/R₀ = ' + (result.deltaResistanceRatio > 0 ? '+' : '') + fmt(result.deltaResistanceRatio * 100, 2) + ' %');
      text('transduction-note', capacitive ?
        'Capacitivo normalizado: d/d₀ = 1 − 0,35·(Pmed/400) = ' + fmt(result.gapRatio, 3) + '; C/C₀ = d₀/d. Presión positiva: menor separación, mayor capacitancia.' :
        'Piezorresistivo normalizado: ΔR/R₀ = 0,08·(Pmed/400). R/R₀ = ' + fmt(result.resistanceRatio, 3) + '. El signo elegido ilustra un elemento del puente; depende de su orientación en un sensor real.');
      text('current', fmt(result.currentMa, 2) + ' mA');
      text('signal-note', 'Rango seleccionado: ' + result.signalMin + ' a ' + result.signalMax + ' kPa → 4 a 20 mA; acondicionamiento ideal con linealización de la transducción. No es la salida directa del elemento sensible.');
      text('saturation', result.saturation === 'ninguna' ? 'Sin saturación: presión dentro del rango de señal.' :
        'Saturación ' + result.saturation + ': salida limitada a ' + fmt(result.currentMa) + ' mA; la presión medida se conserva.');
      text('vacuum', result.gaugeVacuum ?
        'Vacío manométrico: Pabs < Patm (' + fmt(result.absolute - result.atmosphere) + ' kPa manométricos). La presión absoluta sigue siendo ' + fmt(result.absolute) + ' kPa, nunca negativa.' :
        'Pabs ≥ Patm: no hay vacío manométrico. Una diferencia negativa frente a P2 tampoco significa presión absoluta negativa.');
      text('alarm', 'Alarma ' + (result.alarm ? 'ACTIVA' : 'INACTIVA') + ' · salida lógica ' + result.output +
        '. Pmed ' + fmt(result.measured) + ' kPa ' + (result.alarm ? '≥' : '<') + ' umbral ' + fmt(result.threshold) + ' kPa.');
      nodes.alarm.dataset.active = String(result.alarm);
      // Punto de integración explícito; el laboratorio no ejecuta actuadores ni crea escuchas globales.
      lab.dispatchEvent(new CustomEvent('nexo:pressure-change', { bubbles: true, detail: result.integration }));
    }
    function handleControl(event) {
      var control = event.target.closest('[data-control]');
      if (!control || !lab.contains(control) || disposed) return;
      // Range usa input; select usa change. Evita emitir dos veces al soltar el control.
      if (control.tagName === 'SELECT' ? event.type !== 'change' : event.type !== 'input') return;
      if (control.dataset.control === 'temperature' || control.dataset.control === 'cold') renderTemperature();
      else renderPressure();
    }
    function chartFrom(event) { return event.target.closest && event.target.closest('[data-thermal-chart]'); }
    function pointer(event) {
      var chart = chartFrom(event);
      if (!chart || !lab.contains(chart) || disposed) return;
      var matrix = chart.getScreenCTM();
      if (!matrix) return;
      var point = chart.createSVGPoint();
      point.x = event.clientX;
      point.y = event.clientY;
      var local = point.matrixTransform(matrix.inverse());
      var sensor = physics.sensors.filter(function (item) { return item.id === chart.dataset.thermalChart; })[0];
      selection[sensor.id] = sensor.min + Math.max(0, Math.min(1, (local.x - 64) / 254)) * (sensor.max - sensor.min);
      cursor(sensor.id);
    }
    function leave(event) {
      var chart = chartFrom(event);
      if (!chart || (event.relatedTarget && chart.contains(event.relatedTarget)) || document.activeElement === chart) return;
      delete selection[chart.dataset.thermalChart];
      cursor(chart.dataset.thermalChart);
    }
    function focus(event) {
      var chart = chartFrom(event);
      if (!chart) return;
      var sensor = physics.sensors.filter(function (item) { return item.id === chart.dataset.thermalChart; })[0];
      selection[sensor.id] = Math.max(sensor.min, Math.min(sensor.max, value('temperature')));
      cursor(sensor.id);
    }
    function blur(event) {
      var chart = chartFrom(event);
      if (!chart) return;
      delete selection[chart.dataset.thermalChart];
      cursor(chart.dataset.thermalChart);
    }
    function keyboard(event) {
      var chart = chartFrom(event);
      if (!chart || ['ArrowLeft', 'ArrowRight', 'Home', 'End'].indexOf(event.key) === -1) return;
      event.preventDefault();
      var sensor = physics.sensors.filter(function (item) { return item.id === chart.dataset.thermalChart; })[0];
      var current = selection[sensor.id] === undefined ? sensor.min : selection[sensor.id];
      selection[sensor.id] = event.key === 'Home' ? sensor.min : event.key === 'End' ? sensor.max :
        Math.max(sensor.min, Math.min(sensor.max, current + (event.key === 'ArrowRight' ? 1 : -1) * (sensor.max - sensor.min) / 100));
      cursor(sensor.id);
    }
    var listeners = [['input', handleControl], ['change', handleControl], ['pointermove', pointer],
      ['pointerout', leave], ['focusin', focus], ['focusout', blur], ['keydown', keyboard]];
    listeners.forEach(function (entry) { lab.addEventListener(entry[0], entry[1]); });
    function cleanup() {
      if (disposed) return;
      disposed = true;
      listeners.forEach(function (entry) { lab.removeEventListener(entry[0], entry[1]); });
      mounts.delete(lab);
    }
    mounts.set(lab, cleanup);
    renderTemperature();
    renderPressure();
    return cleanup;
  };
}(window.NEXO));
