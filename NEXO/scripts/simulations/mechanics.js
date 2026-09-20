// NEXO/scripts/simulations/mechanics.js — Tres bancos manuales; sin reloj ni animación autónoma.
(function (N) {
  'use strict';
  if (!N) throw new Error('Carga el registro NEXO antes de los bancos mecánicos.');
  N.Simulations = N.Simulations || {};
  var serial = 0;
  var mounts = new WeakMap();
  function fmt(value, digits) {
    return new Intl.NumberFormat('es-ES', { maximumFractionDigits: digits === undefined ? 2 : digits }).format(value);
  }
  function range(prefix, key, label, min, max, step, value, unit) {
    var id = prefix + key;
    return '<div><label for="' + id + '">' + label + '</label> <output for="' + id + '" data-mechanics="' + key + '-value">' + fmt(value) + ' ' + unit + '</output>' +
      '<input id="' + id + '" type="range" data-mechanics-control="' + key + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + value + '"></div>';
  }
  function reading(key, label) {
    return '<div class="sensor-reading"><span>' + label + '</span><strong data-mechanics="' + key + '">—</strong></div>';
  }
  function button(action, label) {
    return '<button type="button" class="sensor-button" data-mechanics-action="' + action + '">' + label + '</button>';
  }
  N.Simulations.mechanicsMarkup = function () {
    var p = 'mechanics-' + (++serial) + '-';
    return `<div data-mechanics-lab>
      <style>
        [data-mechanics-lab] svg { display:block;width:100%;height:auto;color:var(--text); }
        [data-mechanics-lab] svg text { font-family:inherit; }
        [data-mechanics-lab] .mechanics-motion { transition:transform 600ms ease; }
        [data-mechanics-lab] .mechanics-row { display:flex;flex-wrap:wrap;gap:.75rem;align-items:center; }
        [data-mechanics-lab] [hidden] { display:none !important; }
        @media (prefers-reduced-motion:reduce) { [data-mechanics-lab] .mechanics-motion { transition:none; } }
      </style>
      <section class="sensor-experiment" aria-labelledby="${p}transform-title">
        <p class="sensor-eyebrow">BANCO 1 · TRANSMISIÓN MECÁNICA</p>
        <h3 id="${p}transform-title">De vueltas a desplazamiento.</h3>
        <p>Gira un husillo o un piñón para trasladar una carga. Compara cuánto avanza el mecanismo por cada vuelta.</p>
        <div class="experiment-grid"><div class="sensor-controls">
          <div><label for="${p}transmission">Mecanismo</label><select id="${p}transmission" data-mechanics-control="transmission"><option value="screw">Husillo y tuerca</option><option value="rack">Piñón y cremallera</option></select></div>
          ${range(p, 'turns', 'Vueltas acumuladas', 0, 10, 0.05, 0, 'vueltas')}
          <div data-mechanics="pitch-group">${range(p, 'pitch', 'Paso del husillo', 2, 10, 0.5, 5, 'mm/vuelta')}</div>
          <div data-mechanics="radius-group" hidden>${range(p, 'radius', 'Radio primitivo del piñón', 10, 40, 1, 20, 'mm')}</div>
          <div class="sensor-buttons">${button('back', 'Retroceder ½ vuelta')}${button('forward', 'Avanzar ½ vuelta')}${button('transform-reset', 'Reiniciar vueltas')}</div>
          <p class="sensor-note">El recorrido dibujado se normaliza a diez vueltas del ajuste actual. Las lecturas dan la distancia real del modelo; los tamaños del dibujo no están a escala.</p>
        </div><div class="sensor-visual">
          <svg viewBox="0 0 520 305" role="img" aria-labelledby="${p}transform-svg ${p}transform-desc">
            <title id="${p}transform-svg">Giro de entrada y posición de la carga</title><desc id="${p}transform-desc" data-mechanics="transform-description">Husillo en reposo; la carga está al inicio.</desc>
            <g fill="none" stroke="var(--line)" stroke-width="2"><path d="M65 232H477M65 227V237M477 227V237"/></g>
            <text x="65" y="257" font-size="14" fill="currentColor">0 mm</text><text data-mechanics="travel-end" x="477" y="257" text-anchor="end" font-size="14" fill="currentColor"></text>
            <g data-mechanics="screw-drawing"><path d="M65 175H477" stroke="var(--muted)" stroke-width="14"/>
              <path d="M80 166l9 18m15-18 9 18m15-18 9 18m15-18 9 18m15-18 9 18m15-18 9 18m15-18 9 18m15-18 9 18m15-18 9 18m15-18 9 18m15-18 9 18m15-18 9 18m15-18 9 18m15-18 9 18m15-18 9 18m15-18 9 18" stroke="var(--text)" stroke-width="2"/>
              <text x="305" y="135" text-anchor="middle" font-size="14" fill="currentColor">Husillo roscado · tuerca solidaria a la carga</text></g>
            <g data-mechanics="rack-drawing" hidden><path d="M65 175H477" stroke="var(--muted)" stroke-width="10"/>
              <path d="M65 165h412" stroke="var(--text)" stroke-width="12" stroke-dasharray="5 8"/>
              <text x="305" y="135" text-anchor="middle" font-size="14" fill="currentColor">Cremallera → traslación</text></g>
            <g transform="translate(77 72)"><circle r="36" fill="none" stroke="var(--muted)" stroke-width="3"/>
              <g data-mechanics="input-rotation" class="mechanics-motion"><path d="M0 0L0-31M0-31l-6 9m6-9 6 9" stroke="var(--cyan)" stroke-width="5" fill="none"/><circle r="6" fill="var(--text)"/></g></g>
            <text data-mechanics="rotation-label" x="130" y="70" font-size="15" fill="currentColor"></text>
            <g data-mechanics="load-position" class="mechanics-motion"><rect x="49" y="151" width="32" height="48" rx="5" fill="var(--cyan)" stroke="var(--text)" stroke-width="2"/><path d="M65 203v27" stroke="var(--text)" stroke-width="3"/><path d="M59 221l6 9 6-9" fill="none" stroke="var(--text)" stroke-width="2"/></g>
            <text x="260" y="290" text-anchor="middle" font-size="14" fill="currentColor">Bloque destacado = carga · flecha inferior = posición</text>
          </svg>
          <p class="sensor-result" data-mechanics="transform-formula"></p>
          <div class="sensor-readouts">${reading('displacement', 'Desplazamiento de la carga')}${reading('per-turn', 'Avance por vuelta')}${reading('angle', 'Ángulo acumulado')}</div>
          <p class="sensor-note">Aplicaciones: elevación, traslación y posicionamiento. Este banco solo calcula geometría: no calcula eficiencia ni fuerza. Un husillo puede ser autoblocante según su geometría y rozamiento; la irreversibilidad no es universal. Un husillo de bolas suele ser reversible.</p>
          <p role="status" aria-live="polite" aria-atomic="true" data-mechanics="transform-status"></p>
        </div></div>
      </section>
      <section class="sensor-experiment" aria-labelledby="${p}hydraulic-title">
        <p class="sensor-eyebrow">BANCO 2 · ENERGÍA HIDRÁULICA</p><h3 id="${p}hydraulic-title">La presión da fuerza; el caudal da velocidad.</h3>
        <p>Cada pulsación ejecuta un intervalo ideal de 0,2 segundos. No hay movimiento autónomo entre pulsaciones.</p>
        <div class="experiment-grid"><div class="sensor-controls">
          <div><label for="${p}cylinder-mode">Cilindro</label><select id="${p}cylinder-mode" data-mechanics-control="cylinder-mode"><option value="double">Doble efecto</option><option value="single">Simple efecto · retorno por resorte</option></select></div>
          ${range(p, 'pressure', 'Presión diferencial nominal Δp', 0, 100, 1, 30, 'bar')}
          ${range(p, 'diameter', 'Diámetro interior D', 20, 100, 1, 50, 'mm')}
          ${range(p, 'rod', 'Diámetro del vástago d', 5, 49, 1, 20, 'mm')}
          ${range(p, 'flow', 'Caudal disponible Q', 0, 20, 0.1, 3, 'L/min')}
          ${range(p, 'load', 'Carga que se opone al movimiento', 0, 10000, 100, 1000, 'N')}
          ${range(p, 'position', 'Preparar posición inicial manualmente', 0, 100, 0.01, 0, 'mm')}
          <p class="sensor-note">El deslizador de posición prepara el ensayo; no representa movimiento impulsado por el fluido. Carrera: 100 mm. El vástago siempre es menor que D.</p>
          <div class="sensor-buttons">${button('hydraulic-advance', 'Avance · 0,2 s')}${button('hydraulic-return', 'Retorno · 0,2 s')}${button('hydraulic-neutral', 'Centro neutro')}${button('hydraulic-reset', 'Reiniciar posición')}</div>
          <p class="sensor-note">La carga se opone a la dirección elegida, también durante el retorno. Simple efecto: resorte ideal constante de 500 N; el avance vence carga + resorte y el retorno exige 500 N &gt; carga. Q limita también el caudal de escape durante el retorno por resorte. Q = 0 impide todo movimiento.</p>
        </div><div class="sensor-visual">
          <svg viewBox="0 0 520 275" role="img" aria-labelledby="${p}cylinder-svg ${p}cylinder-desc">
            <title id="${p}cylinder-svg">Cámaras, pistón y vástago de un cilindro</title><desc id="${p}cylinder-desc" data-mechanics="cylinder-description"></desc>
            <text x="42" y="32" font-size="15" fill="currentColor">A · cara completa</text><text x="340" y="32" font-size="15" fill="currentColor">B · cara anular</text>
            <rect x="40" y="75" width="260" height="110" rx="7" fill="none" stroke="var(--text)" stroke-width="3"/>
            <rect data-mechanics="chamber-a" x="44" y="79" width="21" height="102" fill="var(--cyan)" opacity=".15"/>
            <rect data-mechanics="chamber-b" x="78" y="79" width="218" height="102" fill="var(--cyan)" opacity=".15"/>
            <g data-mechanics="piston-position" class="mechanics-motion"><rect x="65" y="77" width="13" height="106" fill="var(--muted)" stroke="var(--text)"/>
              <rect x="78" y="121" width="230" height="18" fill="var(--muted)" stroke="var(--text)"/>
              <text x="90" y="110" fill="currentColor" font-size="14">Vástago</text></g>
            <path data-mechanics="spring" d="M85 157l12-14 18 28 18-28 18 28 18-28 18 28 18-28 18 28 18-28 18 14H387" fill="none" stroke="var(--text)" stroke-width="2" hidden/>
            <path d="M50 78V50M290 78V50" stroke="var(--muted)" stroke-width="4"/>
            <text x="42" y="215" data-mechanics="port-a" font-size="14" fill="currentColor"></text>
            <text x="42" y="241" data-mechanics="port-b" font-size="14" fill="currentColor"></text>
            <text x="480" y="265" text-anchor="end" font-size="13" fill="currentColor">Esquema de principio · sin escala</text>
          </svg>
          <p class="sensor-result" data-mechanics="hydraulic-formula"></p>
          <div class="sensor-readouts">${reading('areas', 'Áreas completa / anular')}${reading('forces', 'Fuerza teórica avance / retorno')}${reading('net-force', 'Fuerza disponible antes de la carga')}${reading('hydraulic-position', 'Posición / carrera')}${reading('speeds', 'Q/A · avance / retorno')}${reading('actual-speed', 'Velocidad efectiva del estado actual')}</div>
          <p role="status" class="sensor-result" aria-live="polite" aria-atomic="true" data-mechanics="hydraulic-status"></p>
          <p class="sensor-note">F = Δp · A; v = Q/A. 1 bar = 100 000 Pa; 1 L/min = 10⁻³/60 m³/s. En doble efecto el retorno usa el área anular, por lo que da menos fuerza y más velocidad para el mismo Q. El centro neutro retiene la posición por convenio de este modelo.</p>
          <p class="sensor-note">Δp es la diferencia ideal nominal entre alimentación y descarga, no una presión absoluta. Cuando se bloquea, el caudal no atraviesa el pistón: no se calcula el circuito que desvía o limita ese caudal. No se modelan compresibilidad, rozamiento, aceleración, pérdidas ni transitorios. La velocidad efectiva se anula al faltar caudal, fuerza o carrera.</p>
          <details class="sensor-details"><summary>También hay actuadores hidráulicos rotativos</summary>
            <p>Motor hidráulico ideal de desplazamiento fijo Vd = 20 cm³/vuelta. Usa los controles Δp y Q anteriores, sin la carga lineal ni el resorte del cilindro.</p>
            <svg viewBox="0 0 520 155" role="img" aria-labelledby="${p}motor-title"><title id="${p}motor-title">Motor hidráulico: el fluido produce giro del eje</title>
              <path d="M35 76H150M300 76H475" stroke="var(--cyan)" stroke-width="7"/><circle cx="225" cy="76" r="55" fill="none" stroke="var(--text)" stroke-width="3"/>
              <path d="M165 65l20 11-20 11" fill="var(--cyan)"/>
              <g transform="translate(225 76)"><g data-mechanics="motor-rotation" class="mechanics-motion"><path d="M0-40V40M-40 0H40" stroke="var(--muted)" stroke-width="5"/><path d="M0 0L30-27" stroke="var(--cyan)" stroke-width="6"/><circle r="8" fill="var(--text)"/></g></g>
              <text x="35" y="120" font-size="14" fill="currentColor">Entrada Q, Δp</text><text x="370" y="120" font-size="14" fill="currentColor">Descarga</text>
              <text x="225" y="150" text-anchor="middle" font-size="13" fill="currentColor">Giro indicativo; ángulo acumulado en lectura</text>
            </svg>
            <div class="sensor-readouts">${reading('motor-torque', 'Par ideal τ = Δp · Vd / 2π')}${reading('motor-speed', 'Régimen n = Q / Vd')}${reading('motor-angle', 'Giro acumulado')}</div>
            <div class="sensor-buttons">${button('motor-step', 'Girar · 0,2 s')}${button('motor-reset', 'Reiniciar giro')}</div>
            <p class="sensor-note">Sin par resistente externo. Este convenio no permite giro sin presión o sin caudal. No se simula inercia. La ilustración recorre como máximo media vuelta por paso para hacer visible el giro; el valor numérico acumula todas las vueltas calculadas.</p>
            <p role="status" aria-live="polite" data-mechanics="motor-status"></p>
          </details>
        </div></div>
      </section>
      <section class="sensor-experiment" aria-labelledby="${p}valve-title">
        <p class="sensor-eyebrow">BANCO 3 · ELECTROVÁLVULA</p><h3 id="${p}valve-title">Una bobina abre un paso, no bombea.</h3>
        <p>Válvula 2/2 normalmente cerrada, de acción directa: dos vías y dos posiciones. Es monoestable: el resorte la mantiene cerrada cuando no se energiza la bobina. Las etapas intermedias explican el movimiento; no son posiciones adicionales de la válvula.</p>
        <div class="experiment-grid"><div class="sensor-controls">
          <div><input id="${p}energized" type="checkbox" data-mechanics-control="energized"><label for="${p}energized">Energizar bobina</label></div>
          <div><input id="${p}supplied" type="checkbox" data-mechanics-control="supplied" checked><label for="${p}supplied">Suministro de fluido disponible</label></div>
          ${range(p, 'upstream', 'Presión aguas arriba', 0, 5, 0.1, 3, 'bar')}
          <p class="sensor-note">Aguas abajo: 1 bar fijo. Solo se representa flujo de entrada a salida si Pentrada &gt; 1 bar, hay suministro y existe apertura. No se calcula caudal ni flujo inverso.</p>
          <div class="sensor-buttons">${button('valve-next', 'Paso siguiente')}${button('valve-explode', 'Mostrar despiece')}${button('valve-reset', 'Reiniciar válvula')}</div>
          <p class="sensor-note">Marca energizar y avanza: 0 bobina → 1 campo → 2 movimiento → 3 apertura → 4 observar flujo. El campo aparece al energizar; las etapas son hitos explicativos, no retardos físicos. Al desenergizar el campo desaparece inmediatamente; los pasos siguientes muestran el cierre por resorte. Puedes invertir la orden durante el recorrido.</p>
        </div><div class="sensor-visual">
          <svg viewBox="0 0 520 370" role="img" aria-labelledby="${p}valve-svg ${p}valve-desc">
            <title id="${p}valve-svg">Corte de una electroválvula 2/2 de acción directa</title><desc id="${p}valve-desc" data-mechanics="valve-description"></desc>
            <g data-mechanics="coil-part" class="mechanics-motion"><rect x="185" y="90" width="150" height="110" rx="10" fill="none" stroke="var(--muted)" stroke-width="4"/>
              <path data-mechanics="coil-wire" d="M190 100h140m-140 15h140m-140 15h140m-140 15h140m-140 15h140m-140 15h140m-140 15h140" fill="none" stroke="var(--muted)" stroke-width="5"/>
              <text x="350" y="115" fill="currentColor" font-size="14">Bobina</text></g>
            <g data-mechanics="field" visibility="hidden" stroke="var(--cyan)" fill="none" stroke-dasharray="5 4" stroke-width="2"><ellipse cx="260" cy="144" rx="99" ry="65"/><ellipse cx="260" cy="144" rx="108" ry="73"/></g>
            <g data-mechanics="spring-part" class="mechanics-motion"><path d="M260 39v7l-11 7 22 8-22 8 22 8-11 7v10" fill="none" stroke="var(--text)" stroke-width="3"/><text x="292" y="53" font-size="14" fill="currentColor">Resorte de cierre</text></g>
            <g data-mechanics="body-part" class="mechanics-motion"><path d="M48 221h176v30h72v-30h176v90H48Z" fill="none" stroke="var(--text)" stroke-width="4"/>
              <path d="M55 267h170v-15m70 0v15h169" fill="none" stroke="var(--muted)" stroke-width="14"/>
              <text x="62" y="300" font-size="14" fill="currentColor">Entrada</text><text x="395" y="300" font-size="14" fill="currentColor">Salida</text>
              <path data-mechanics="flow-path" d="M60 267H214L234 240H285L305 267H455m-13-8 13 8-13 8" fill="none" stroke="var(--cyan)" stroke-width="5" visibility="hidden"/>
              <text x="315" y="245" font-size="13" fill="currentColor">Asiento / paso</text></g>
            <g data-mechanics="plunger-part" class="mechanics-motion"><rect x="244" y="96" width="32" height="130" rx="5" fill="var(--muted)" stroke="var(--text)" stroke-width="2"/>
              <path d="M232 226h56v17h-56Z" fill="var(--muted)" stroke="var(--text)" stroke-width="2"/><text x="105" y="211" font-size="14" fill="currentColor">Émbolo</text></g>
            <text x="260" y="363" text-anchor="middle" font-size="14" fill="currentColor" data-mechanics="valve-svg-state"></text>
          </svg>
          <div class="sensor-readouts">${reading('valve-stage', 'Etapa explicativa')}${reading('valve-coil', 'Bobina / campo')}${reading('valve-opening', 'Apertura visual')}${reading('valve-pressure', 'Diferencia de presión')}</div>
          <p class="sensor-result" role="status" aria-live="polite" aria-atomic="true" data-mechanics="valve-status"></p>
          <p class="sensor-note" data-mechanics="explode-note">Vista montada: corte esquemático, sin escala.</p>
          <p class="sensor-note">La bobina crea un campo que atrae el émbolo y vence el resorte en este modelo ideal. El retorno por resorte cierra el paso al retirar energía. La energía del flujo procede del suministro hidráulico o neumático, no de la bobina. No se calculan esfuerzos electromagnéticos, presión máxima admisible ni tiempos reales de apertura.</p>
        </div></div>
      </section>
      <p class="sensor-note">Los tres bancos son diagramas didácticos ideales. No representan circuitos de seguridad, no controlan hardware y no sirven para dimensionar equipos ni verificar una instalación real.</p>
    </div>`;
  };
  N.Simulations.mountMechanics = function (root) {
    if (!root || !root.querySelector) throw new TypeError('mountMechanics requiere un elemento raíz.');
    var lab = root.matches && root.matches('[data-mechanics-lab]') ? root : root.querySelector('[data-mechanics-lab]');
    if (!lab) throw new Error('Inserta mechanicsMarkup() antes de montar los bancos.');
    if (!N.Models || !N.Models.mechanics) throw new Error('Carga scripts/models/mechanics.js antes del laboratorio.');
    if (mounts.has(lab)) mounts.get(lab)();
    var M = N.Models.mechanics;
    var nodes = {}, controls = {}, buttons = {};
    var direction = 'neutral', position = 0, lastMove = null;
    var motorDegrees = 0, motorDrawingDegrees = 0;
    var valveStage = 4, startLift = 0, exploded = false, disposed = false;
    lab.querySelectorAll('[data-mechanics]').forEach(function (node) { nodes[node.dataset.mechanics] = node; });
    lab.querySelectorAll('[data-mechanics-control]').forEach(function (node) { controls[node.dataset.mechanicsControl] = node; });
    lab.querySelectorAll('[data-mechanics-action]').forEach(function (node) { buttons[node.dataset.mechanicsAction] = node; });
    function number(key) { return Number(controls[key].value); }
    function text(key, value) { nodes[key].textContent = value; }
    function attr(key, name, value) { nodes[key].setAttribute(name, String(value)); }
    function translate(key, x, y) { nodes[key].style.transform = 'translate(' + x + 'px,' + y + 'px)'; }
    function rotate(key, degrees) { nodes[key].style.transform = 'rotate(' + degrees + 'deg)'; }
    function output(key, unit) {
      var value = fmt(number(key)) + ' ' + unit;
      text(key + '-value', value);
      controls[key].setAttribute('aria-valuetext', value);
    }
    function hydraulicOptions() {
      return { mode: controls['cylinder-mode'].value, pressureBar: number('pressure'), diameter: number('diameter'),
        rod: number('rod'), flowLMin: number('flow'), loadN: number('load'), direction: direction, positionMm: position };
    }
    function valveOptions() {
      return { energized: controls.energized.checked, supplied: controls.supplied.checked,
        upstreamBar: number('upstream'), stage: valveStage, startLift: startLift };
    }
    var previousEnergized = controls.energized.checked;
    function renderTransformation() {
      var t = M.transformation({ mode: controls.transmission.value, turns: number('turns'), pitch: number('pitch'), radius: number('radius') });
      output('turns', 'vueltas'); output('pitch', 'mm/vuelta'); output('radius', 'mm');
      nodes['pitch-group'].hidden = t.mode !== 'screw'; nodes['radius-group'].hidden = t.mode !== 'rack';
      nodes['screw-drawing'].toggleAttribute('hidden', t.mode !== 'screw');
      nodes['rack-drawing'].toggleAttribute('hidden', t.mode !== 'rack');
      translate('load-position', t.turns / 10 * 412, 0); rotate('input-rotation', t.degrees);
      text('rotation-label', (t.mode === 'screw' ? 'Husillo' : 'Piñón') + ' · ' + fmt(t.turns) + ' vueltas');
      text('travel-end', fmt(t.maxDisplacementMm) + ' mm');
      text('transform-formula', t.mode === 'screw' ? 'x = vueltas × paso = ' + fmt(t.turns) + ' × ' + fmt(t.pitch) + ' mm' :
        'x = θ · r = (' + fmt(t.turns) + ' × 2π) × ' + fmt(t.radius) + ' mm');
      text('displacement', fmt(t.displacementMm) + ' mm'); text('per-turn', fmt(t.travelPerTurnMm) + ' mm/vuelta'); text('angle', fmt(t.degrees) + '°');
      var summary = fmt(t.turns) + ' vueltas producen ' + fmt(t.displacementMm) + ' mm de desplazamiento.';
      text('transform-description', summary); text('transform-status', summary);
      buttons.back.disabled = t.turns <= 0; buttons.forward.disabled = t.turns >= 10;
    }
    function renderHydraulics() {
      var rodMax = Math.min(number('diameter') - 1, 50);
      controls.rod.max = String(rodMax);
      controls.rod.value = String(Math.min(number('rod'), rodMax));
      var h = M.hydraulics(hydraulicOptions());
      ['pressure', 'diameter', 'rod', 'flow', 'load', 'position'].forEach(function (key, index) {
        output(key, ['bar', 'mm', 'mm', 'L/min', 'N', 'mm'][index]);
      });
      text('position-value', fmt(h.positionMm) + ' mm');
      controls.position.setAttribute('aria-valuetext', fmt(h.positionMm) + ' mm');
      var offset = h.positionMm * 1.8;
      translate('piston-position', offset, 0);
      attr('chamber-a', 'width', 21 + offset); attr('chamber-b', 'x', 78 + offset); attr('chamber-b', 'width', 218 - offset);
      attr('chamber-a', 'opacity', h.direction === 'advance' && h.pressureBar > 0 ? '.55' : '.12');
      attr('chamber-b', 'opacity', h.mode === 'double' && h.direction === 'return' && h.pressureBar > 0 ? '.55' : '.12');
      nodes.spring.toggleAttribute('hidden', h.mode !== 'single');
      // El resorte esquemático se comprime con la carrera sin representar su ley de fuerza.
      attr('spring', 'd', 'M' + (85 + offset) + ' 157' + Array.from({ length: 12 }, function (_, i) {
        return 'L' + (85 + offset + (208 - offset) * (i + 1) / 12) + ' ' + (i === 11 ? 157 : i % 2 ? 171 : 143);
      }).join(''));
      text('port-a', h.direction === 'neutral' ? 'A: puerto cerrado por convenio' : h.direction === 'advance' ? 'A: alimentación · Δp nominal' : 'A: descarga');
      text('port-b', h.mode === 'single' ? 'B: sin alimentación · resorte ideal de 500 N' : h.direction === 'return' ? 'B: alimentación · área anular' : h.direction === 'advance' ? 'B: descarga' : 'B: puerto cerrado por convenio');
      text('hydraulic-formula', 'A = πD²/4 · Aanular = π(D² − d²)/4 · F = ΔpA · v = Q/A');
      text('areas', fmt(h.areaCm2) + ' / ' + fmt(h.annulusCm2) + ' cm²');
      text('forces', fmt(h.advanceForceN) + ' / ' + fmt(h.returnForceN) + ' N' + (h.mode === 'single' ? ' (retorno: resorte)' : ''));
      text('net-force', h.direction === 'neutral' ? 'Sin dirección activa' : fmt(h.availableForceN) + ' N' + (h.mode === 'single' && h.direction === 'advance' ? ' (ΔpA − 500 N)' : ''));
      text('hydraulic-position', fmt(h.positionMm) + ' / 100 mm');
      text('speeds', fmt(h.advanceSpeedMmS) + ' / ' + fmt(h.returnSpeedMmS) + ' mm/s');
      text('actual-speed', fmt(h.speedMmS) + ' mm/s' + (h.moving ? ' durante un paso' : ''));
      var summary = (h.direction === 'advance' ? 'Avance. ' : h.direction === 'return' ? 'Retorno. ' : '') + h.status + '. Posición: ' + fmt(h.positionMm) + ' mm.';
      if (lastMove !== null) summary += ' Último paso de 0,2 s: ' + fmt(lastMove) + ' mm; velocidad media ' + fmt(Math.abs(lastMove) / 0.2) + ' mm/s.';
      text('hydraulic-status', summary); text('cylinder-description', summary + ' La cámara destacada indica alimentación, no una medida de presión local.');
      var motor = M.rotary(hydraulicOptions());
      text('motor-torque', fmt(motor.torqueNm) + ' N·m'); text('motor-speed', fmt(motor.rpm) + ' rpm · ' + fmt(motor.radiansPerSecond) + ' rad/s');
      text('motor-angle', fmt(motorDegrees / 360) + ' vueltas · ' + fmt(motorDegrees) + '°');
      rotate('motor-rotation', motorDrawingDegrees);
      text('motor-status', motor.moving ? 'Listo para girar al pulsar; sin carga externa.' : 'Detenido: se requieren Δp > 0 y Q > 0.');
    }
    function renderValve() {
      var v = M.solenoid(valveOptions());
      output('upstream', 'bar');
      attr('coil-wire', 'stroke', v.energized ? 'var(--cyan)' : 'var(--muted)');
      attr('field', 'visibility', v.field && !exploded ? 'visible' : 'hidden');
      attr('flow-path', 'visibility', v.flow ? 'visible' : 'hidden');
      attr('flow-path', 'stroke-width', 2 + v.lift * 4);
      translate('coil-part', exploded ? -100 : 0, exploded ? -40 : 0);
      translate('spring-part', exploded ? 100 : 0, exploded ? -25 : 0);
      translate('body-part', 0, exploded ? 30 : 0);
      translate('plunger-part', 0, -v.lift * 42 - (exploded ? 15 : 0));
      text('valve-stage', v.stage + '/4 · ' + v.label);
      text('valve-coil', v.energized ? 'Energizada / presente' : 'Desenergizada / ausente');
      text('valve-opening', fmt(v.lift * 100, 0) + '% · ' + (v.lift === 0 ? 'cerrada' : v.lift === 1 ? 'abierta' : 'en tránsito'));
      text('valve-pressure', fmt(v.differentialBar) + ' bar');
      var summary = v.label + '. ' + v.flowReason + '.';
      text('valve-status', summary); text('valve-description', summary + (exploded ? ' Vista despiezada: separación solo ilustrativa.' : ' Vista en corte montada.'));
      text('valve-svg-state', (v.open ? 'Paso abierto' : 'Paso cerrado') + ' · ' + (v.flow ? 'flechas = flujo' : 'sin flujo hacia la salida'));
      text('explode-note', exploded ? 'Despiece: bobina, resorte, émbolo y cuerpo separados solo visualmente. No cambia la apertura, el campo físico ni el flujo calculado; las flechas indican el recorrido en la válvula montada.' : 'Vista montada: corte esquemático, sin escala.');
      buttons['valve-next'].disabled = v.completed;
      buttons['valve-next'].textContent = v.completed ? 'Secuencia completada' : 'Paso siguiente';
      buttons['valve-explode'].textContent = exploded ? 'Montar de nuevo' : 'Mostrar despiece';
      buttons['valve-explode'].setAttribute('aria-pressed', String(exploded));
    }
    function onInput(event) {
      if (disposed) return;
      var target = event.target.closest('[data-mechanics-control]');
      if (!target || !lab.contains(target)) return;
      var key = target.dataset.mechanicsControl;
      if (['transmission', 'turns', 'pitch', 'radius'].indexOf(key) >= 0) renderTransformation();
      else if (['energized', 'supplied', 'upstream'].indexOf(key) >= 0) {
        if (key === 'energized' && previousEnergized !== target.checked) {
          var before = valveOptions(); before.energized = previousEnergized;
          startLift = M.solenoid(before).lift;
          previousEnergized = target.checked; valveStage = 0;
        }
        renderValve();
      } else {
        if (key === 'position') { position = number('position'); direction = 'neutral'; }
        lastMove = null;
        renderHydraulics();
      }
    }
    function onClick(event) {
      if (disposed) return;
      var target = event.target.closest('[data-mechanics-action]');
      if (!target || !lab.contains(target) || target.disabled) return;
      var action = target.dataset.mechanicsAction;
      if (action === 'back' || action === 'forward' || action === 'transform-reset') {
        controls.turns.value = String(action === 'transform-reset' ? 0 : Math.max(0, Math.min(10, number('turns') + (action === 'back' ? -0.5 : 0.5))));
        renderTransformation();
      } else if (action.indexOf('hydraulic-') === 0) {
        if (action === 'hydraulic-reset') { position = 0; direction = 'neutral'; lastMove = null; }
        else if (action === 'hydraulic-neutral') { direction = 'neutral'; lastMove = null; }
        else {
          direction = action === 'hydraulic-return' ? 'return' : 'advance';
          var step = M.hydraulicStep(hydraulicOptions(), 0.2);
          position = step.positionMm; lastMove = step.movedMm;
        }
        // La simulación conserva la posición exacta, independientemente del redondeo del control.
        controls.position.value = String(position);
        renderHydraulics();
        text('position-value', fmt(position) + ' mm');
        controls.position.setAttribute('aria-valuetext', fmt(position) + ' mm');
      } else if (action === 'motor-step' || action === 'motor-reset') {
        if (action === 'motor-reset') { motorDegrees = 0; motorDrawingDegrees = 0; }
        else {
          var degrees = M.rotary(hydraulicOptions()).degreesPerSecond * 0.2;
          motorDegrees += degrees; motorDrawingDegrees += Math.min(180, degrees);
        }
        renderHydraulics();
      } else {
        if (action === 'valve-next') valveStage = Math.min(4, valveStage + 1);
        else if (action === 'valve-explode') exploded = !exploded;
        else if (action === 'valve-reset') {
          controls.energized.checked = false; controls.supplied.checked = true; controls.upstream.value = '3';
          previousEnergized = false; valveStage = 4; startLift = 0; exploded = false;
        }
        renderValve();
      }
    }
    root.addEventListener('input', onInput); root.addEventListener('change', onInput); root.addEventListener('click', onClick);
    // Cada montaje es independiente; los cambios de ruta eliminan todos los manejadores locales.
    function cleanup() {
      if (disposed) return;
      disposed = true;
      root.removeEventListener('input', onInput); root.removeEventListener('change', onInput); root.removeEventListener('click', onClick);
      mounts.delete(lab);
    }
    mounts.set(lab, cleanup);
    position = number('position');
    renderTransformation(); renderHydraulics(); renderValve();
    return cleanup;
  };
})(window.NEXO);
