// Original editorial home. Load after ui.js; the router owns mounting and cleanup.
(function (N) {
  'use strict';
  const escape = N.ui.escape;
  const mounts = new WeakMap();
  let serial = 0;

  function sculpture(id) {
    return `<svg class="editorial-machine-svg" viewBox="0 0 640 430" role="img" aria-labelledby="${id}art-title ${id}art-desc">
      <title id="${id}art-title">De una pieza detectada a un movimiento</title>
      <desc id="${id}art-desc">Dibujo técnico sobre papel claro. A la izquierda, un sensor cilíndrico con su lente y su piloto; una pieza naranja se acerca a él. En el centro, el controlador con el chip del programa. A la derecha, el motor con su rotor. Una línea continua lleva la señal del sensor al controlador y otra discontinua lleva la orden del controlador al motor. Abajo, la fuente de energía alimenta el motor a través de una etapa de potencia, nunca a través del sensor. Los botones y las lecturas que siguen describen en texto el estado de cada etapa.</desc>
      <defs>
        <!-- Rampas en clave clara, derivadas de tokens.css: ningún literal.
             Los pasos --metal-* y --lens-* se definen una sola vez en la paleta. -->
        <linearGradient id="${id}metal" x1="0" y1="0" x2=".9" y2="1"><stop stop-color="var(--metal-1)"/><stop offset=".18" stop-color="var(--metal-2)"/><stop offset=".34" stop-color="var(--metal-4)"/><stop offset=".5" stop-color="var(--stage)"/><stop offset=".72" stop-color="var(--metal-3)"/><stop offset="1" stop-color="var(--metal-5)"/></linearGradient>
        <linearGradient id="${id}edge" x1="0" y1="0" x2="1" y2=".8"><stop stop-color="var(--metal-3)"/><stop offset=".3" stop-color="var(--metal-6)"/><stop offset=".74" stop-color="var(--metal-4)"/><stop offset="1" stop-color="var(--metal-5)"/></linearGradient>
        <!-- Lente: familia SENSORES, del rosa de relleno al rosa tinta. -->
        <radialGradient id="${id}lens" cx=".38" cy=".27" r=".8"><stop stop-color="var(--lens-1)"/><stop offset=".3" stop-color="var(--lens-2)"/><stop offset=".68" stop-color="var(--lens-3)"/><stop offset="1" stop-color="var(--lens-4)"/></radialGradient>
        <!-- Halo de apoyo: la opacidad va en stop-opacity, no en el token. -->
        <radialGradient id="${id}halo"><stop stop-color="var(--band-sage)" stop-opacity=".34"/><stop offset="1" stop-color="var(--band-sage)" stop-opacity="0"/></radialGradient>
        <pattern id="${id}brush" width="5" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(-24)"><path d="M0 1H5" stroke="var(--text)" stroke-opacity=".22" stroke-width=".7"/></pattern>
        <marker id="${id}arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="m1 1 7 4-7 4" fill="none" stroke="var(--text)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></marker>
      </defs>
      <rect width="640" height="430" rx="18" fill="var(--stage)"/>
      <ellipse cx="333" cy="238" rx="250" ry="152" fill="url(#${id}halo)"/>
      <g class="editorial-wireframe" fill="none" stroke="var(--text)" stroke-width=".8">
        <ellipse cx="325" cy="220" rx="244" ry="115" transform="rotate(-23 325 220)"/>
        <path d="m80 314 495-209M111 347 486 348M324 34v340M56 219h536" stroke-dasharray="3 9"/>
        <path d="m274 125 52-30 51 30v58l-51 31-52-31Zm0 0 52 31 51-31m-51 31v58"/>
      </g>
      <g fill="none" stroke-width="2.2" stroke-linecap="round" marker-end="url(#${id}arrow)">
        <path class="editorial-link editorial-link-sense" d="M182 202Q223 134 281 135" stroke="var(--line-strong)"/>
        <path class="editorial-link editorial-link-command" d="M370 155Q428 168 451 218" stroke="var(--line-strong)" stroke-dasharray="5 6"/>
      </g>
      <g class="editorial-sensor-piece">
        <path d="m84 180 49-29 50 29v69l-49 29-49-29Z" fill="url(#${id}edge)" stroke="var(--text)" stroke-width="1.4"/>
        <path d="m84 180 49 29 50-29M133 209v69" fill="none" stroke="var(--text)" stroke-opacity=".42"/>
        <path d="m90 224 86-48v68l-43 26-43-25Z" fill="url(#${id}brush)"/>
        <ellipse cx="133" cy="179" rx="50" ry="31" fill="url(#${id}metal)" stroke="var(--text)" stroke-width="1.4"/>
        <ellipse cx="133" cy="177" rx="39" ry="24" fill="url(#${id}lens)" stroke="var(--text)" stroke-width="3"/>
        <ellipse cx="119" cy="168" rx="12" ry="6" transform="rotate(-14 119 168)" fill="var(--surface-raised)" opacity=".8"/>
        <circle class="editorial-sensor-led" cx="149" cy="242" r="5" fill="var(--line-strong)" stroke="var(--text)" stroke-width="1.4"/>
      </g>
      <g class="editorial-workpiece" stroke="var(--text)" stroke-width="1.3">
        <path d="m108 113 25-15 26 15v30l-26 15-25-15Z" fill="var(--accent)"/>
        <path d="m108 113 25 15 26-15m-26 15v30" fill="none"/>
      </g>
      <g class="editorial-controller-piece">
        <path d="m268 109 57-33 63 35v45l-57 34-63-36Z" fill="url(#${id}edge)" stroke="var(--text)" stroke-width="1.4"/>
        <path d="m268 109 63 35 57-33-63-35Z" fill="url(#${id}metal)" stroke="var(--text)" stroke-width="1.3"/>
        <path d="m285 107 40-22 44 25-38 23Z" fill="var(--text)"/>
        <path d="m299 108 26-15 28 16-24 15Z" fill="var(--rose)" stroke="var(--text)" stroke-width="1.1"/>
        <path d="m331 144 57-33v45l-57 34Z" fill="url(#${id}brush)"/>
        <g fill="none" stroke="var(--text)" stroke-width="1.7" stroke-linecap="round"><path d="m279 142 11 6m-11 1 11 6m-11 1 11 6M343 152l10-6m-10 13 10-6m-10 13 10-6"/></g>
        <circle class="editorial-controller-led" cx="316" cy="152" r="5" fill="var(--line-strong)" stroke="var(--text)" stroke-width="1.4"/>
      </g>
      <g class="editorial-actuator-piece">
        <path d="M440 226 478 207Q527 210 541 254L504 277Z" fill="url(#${id}metal)" stroke="var(--text)" stroke-width="1.3"/>
        <ellipse cx="481" cy="260" rx="58" ry="71" transform="rotate(-28 481 260)" fill="url(#${id}edge)" stroke="var(--text)" stroke-width="1.5"/>
        <ellipse cx="473" cy="256" rx="49" ry="61" transform="rotate(-28 473 256)" fill="url(#${id}metal)" stroke="var(--text)" stroke-width="1.3"/>
        <ellipse cx="473" cy="256" rx="37" ry="46" transform="rotate(-28 473 256)" fill="var(--band-sage)" stroke="var(--text)" stroke-width="2"/>
        <g class="editorial-rotor" fill="var(--surface-raised)" stroke="var(--text)" stroke-width="1.2" stroke-linejoin="round">
          <path d="M472 252c-36-33-29-48-9-37 13 7 18 22 9 37Z"/>
          <path d="M477 255c34-26 45-10 29 6-10 10-24 8-29-6Z"/>
          <path d="M474 261c2 46-18 47-25 23-4-15 9-25 25-23Z"/>
        </g>
        <circle cx="473" cy="256" r="11" fill="url(#${id}metal)" stroke="var(--text)" stroke-width="1.3"/>
        <path d="m437 291-8 21 49 27 39-23-4-17" fill="url(#${id}edge)" stroke="var(--text)" stroke-width="1.3"/>
      </g>
      <g class="editorial-power-line" fill="none" stroke="var(--line-strong)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="272" y="326" width="57" height="24" rx="5" fill="var(--surface)"/><path d="M329 338h67l34-34" stroke-dasharray="3 5"/><path d="m294 331-5 8h12l-6 8"/></g>
      <g class="editorial-art-labels" fill="var(--text)" font-size="13">
        <text x="88" y="305"><tspan font-weight="700">01</tspan> · Sensor</text><text x="271" y="58"><tspan font-weight="700">02</tspan> · Programa</text><text x="442" y="374"><tspan font-weight="700">03</tspan> · Actuador</text><text x="272" y="376" fill="var(--muted)" font-size="11">Energía + driver</text>
      </g>
      <!-- Etiquetas de estado: refuerzan con texto lo que el color ya indica. Las escribe render(). -->
      <g class="editorial-art-values" fill="var(--muted)" font-size="11">
        <text x="224" y="122" text-anchor="middle" data-home-svg-signal>señal 0</text>
        <text x="394" y="199" data-home-svg-order>orden —</text>
        <text x="442" y="392" data-home-svg-motor>motor 0 %</text>
      </g>
    </svg>`;
  }

  N.ui.home = function () {
    const id = 'editorial-' + (++serial) + '-';
    const data = N.content.inicio;
    const available = N.modules.filter((module) => module.id !== 'inicio' && module.status !== 'planned');
    const planned = N.modules.filter((module) => module.status === 'planned');
    return `<div class="editorial-home">
      <section class="editorial-hero section-shell" aria-labelledby="home-title">
        <div class="editorial-kicker"><span class="eyebrow">NEXO / Sistemas programables</span><span class="eyebrow">Ideas que puedes poner a prueba</span></div>
        <div class="editorial-bento">
          <div class="editorial-intro editorial-panel">
            <p class="eyebrow editorial-overline"><span aria-hidden="true">↗</span> Del mundo físico al código. Y de vuelta.</p>
            <h1 id="home-title" tabindex="-1">Entiende lo que <span>mueve al mundo.</span></h1>
            <p class="editorial-deck">Un sensor detecta.<br>El programa decide.<br>Un actuador responde.</p>
            <div class="editorial-actions"><a class="button button-primary" href="#/integracion">Conecta el sistema <span aria-hidden="true">↗</span></a><a class="editorial-secondary" href="#/sensores">Empieza por el Tema I <span aria-hidden="true">→</span></a></div>
            <p class="editorial-intro-note">Explora una idea. Cambia una variable.<br>Descubre por qué cambia la respuesta.</p>
          </div>
          <section class="editorial-machine editorial-panel is-stage-0" data-editorial-machine aria-labelledby="${id}machine-title">
            <div class="editorial-panel-top"><h2 id="${id}machine-title">Una señal. Tres momentos.</h2><span class="editorial-live-label">Modelo paso a paso</span></div>
            ${sculpture(id)}
            <div class="editorial-stage-buttons" role="group" aria-label="Explora las etapas de la cadena">
              <button type="button" data-home-stage="0" aria-pressed="true" aria-controls="${id}caption"><span>01</span> Detecta</button>
              <button type="button" data-home-stage="1" aria-pressed="false" aria-controls="${id}caption"><span>02</span> Decide</button>
              <button type="button" data-home-stage="2" aria-pressed="false" aria-controls="${id}caption"><span>03</span> Actúa</button>
            </div>
            <div class="editorial-causal-control"><button class="editorial-piece-button" type="button" data-home-piece aria-pressed="false">Introducir pieza <span aria-hidden="true">＋</span></button><p>Regla: si hay pieza, activar el motor.</p></div>
            <ol class="editorial-chain" aria-label="Lecturas del modelo"><li><span>Sensor</span><strong data-home-signal>Señal 0</strong></li><li><span>Programa</span><strong data-home-command>Por evaluar</strong></li><li><span>Motor + driver</span><strong data-home-output>En espera</strong></li></ol>
            <p class="editorial-stage-caption" id="${id}caption" data-home-caption role="status" aria-live="polite" aria-atomic="true">Sin pieza, el sensor entrega 0. Introduce una pieza para cambiar la entrada; detectar no es todavía actuar.</p>
          </section>
          <a class="editorial-path-card editorial-panel" href="#/sensores"><span class="eyebrow">01 / Percibir</span><p><strong>20</strong> puntos sobre sensores</p><span class="editorial-path-description">De la magnitud física a la señal.</span><span class="editorial-path-arrow" aria-hidden="true">↗</span></a>
          <a class="editorial-path-card editorial-panel" href="#/actuadores"><span class="eyebrow">02 / Transformar</span><p><strong>11</strong> aplicaciones de actuadores</p><span class="editorial-path-description">Órdenes, energía y movimiento.</span><span class="editorial-path-arrow" aria-hidden="true">↗</span></a>
          <a class="editorial-path-card editorial-panel" href="#/integracion"><span class="eyebrow">03 / Conectar</span><p><strong>3</strong> procesos de integración</p><span class="editorial-path-description">Observa el sistema completo.</span><span class="editorial-path-arrow" aria-hidden="true">↗</span></a>
        </div>
        <div class="editorial-bottom-line"><p>Comprender la relación importa más que memorizar las piezas.</p><button class="text-button" type="button" data-jump="laboratorio">Ir al experimento <span aria-hidden="true">↓</span></button></div>
      </section>
      <section class="modules-section section-shell" id="modulos" aria-labelledby="modules-title"><div class="section-heading"><div><p class="eyebrow">EL MAPA / Elige una conexión</p><h2 id="modules-title" tabindex="-1">Cada parte cuenta.<br><span class="muted">Juntas, hacen más.</span></h2></div><p class="section-intro">Recorre los módulos a tu ritmo. Cada tarjeta muestra el estado real de su contenido, no tu progreso académico.</p></div><div class="module-grid">${available.map(N.ui.moduleCard).join('')}</div>${planned.length ? `<div class="editorial-upcoming"><p class="eyebrow">El siguiente capítulo</p><div class="upcoming-list">${planned.map((module) => `<a class="upcoming-item" href="#/${escape(module.id)}"><span class="eyebrow">${escape(module.chapter)}</span><h3>${escape(module.label)}</h3><span class="planned-label">${escape(N.statusLabels[module.status])}</span></a>`).join('')}</div><p class="editorial-upcoming-note">Los temas en preparación todavía no tienen contenido evaluable. Sin desbloqueos ni avances ficticios.</p></div>` : ''}</section>
      <section class="lab-section section-shell" id="laboratorio" aria-labelledby="lab-title"><div class="section-heading"><div><p class="eyebrow">Laboratorio / Control térmico</p><h2 id="lab-title" tabindex="-1">Menos imaginar.<br><span class="muted">Más experimentar.</span></h2></div><p class="section-intro">Sube el calor. Sigue la medición. Observa cuándo el controlador ordena encender el ventilador.</p></div><div class="editorial-lab-guide"><span class="eyebrow">Prueba en un minuto</span><p>Aumenta la entrada de calor y espera la respuesta. Usa <strong>Pausar</strong> y <strong>Avanzar 1 s</strong> para seguirla paso a paso. Después, cambia a lazo abierto.</p></div><div id="thermal-root">${N.Simulations.thermalMarkup()}</div><div class="experiment-prompts">${data.challenges.map((item, i) => `<article><span class="eyebrow">Reto / 0${i + 1}</span><h3>${escape(item.title)}</h3><p>${escape(item.text)}</p></article>`).join('')}</div></section>
      <section class="editorial-feedback section-shell" aria-labelledby="${id}feedback-title"><div class="editorial-feedback-mark" aria-hidden="true">↳</div><div><p class="eyebrow">Lo que pasa vuelve a importar</p><h2 id="${id}feedback-title">La respuesta también<br>cambia la pregunta.</h2><p>El actuador modifica el proceso. El sensor vuelve a medir. Esa realimentación permite corregir la respuesta: no es solo una cadena, es un lazo.</p></div><a class="button" href="#/integracion">Explora la integración <span aria-hidden="true">↗</span></a></section>
      <section class="editorial-closing section-shell"><p class="eyebrow">El conocimiento empieza con una buena pregunta.</p><h2>¿Qué pasa<br>si lo cambias?</h2><button class="button button-primary" type="button" data-jump="laboratorio">Vuelve a probar <span aria-hidden="true">↑</span></button><span class="editorial-closing-orbit" aria-hidden="true"></span></section>
    </div>`;
  };

  // Only the hero's HTML controls are owned here. Thermal mounting stays in router.js.
  N.ui.mountEditorialHome = function (root) {
    if (!root || typeof root.querySelector !== 'function') throw new TypeError('mountEditorialHome requiere un elemento raíz.');
    if (mounts.has(root)) mounts.get(root)();
    const machine = root.matches && root.matches('[data-editorial-machine]') ? root : root.querySelector('[data-editorial-machine]');
    if (!machine) return function () {};
    let stage = 0;
    let present = false;
    let disposed = false;
    const buttons = Array.from(machine.querySelectorAll('[data-home-stage]'));
    const piece = machine.querySelector('[data-home-piece]');
    const caption = machine.querySelector('[data-home-caption]');
    const signal = machine.querySelector('[data-home-signal]');
    const command = machine.querySelector('[data-home-command]');
    const output = machine.querySelector('[data-home-output]');
    // Rótulos dentro del dibujo: un estado nunca depende solo del color.
    const svgSignal = machine.querySelector('[data-home-svg-signal]');
    const svgOrder = machine.querySelector('[data-home-svg-order]');
    const svgMotor = machine.querySelector('[data-home-svg-motor]');
    function label(node, value) { if (node) node.textContent = value; }
    function render() {
      for (let i = 0; i < 3; i++) machine.classList.toggle('is-stage-' + i, i === stage);
      machine.classList.toggle('has-input', present);
      machine.classList.toggle('has-command', present && stage >= 1);
      machine.classList.toggle('has-output', present && stage === 2);
      buttons.forEach((button) => button.setAttribute('aria-pressed', String(Number(button.dataset.homeStage) === stage)));
      piece.setAttribute('aria-pressed', String(present));
      piece.textContent = present ? 'Retirar pieza −' : 'Introducir pieza ＋';
      signal.textContent = 'Señal ' + (present ? '1' : '0');
      command.textContent = stage === 0 ? 'Por evaluar' : 'Orden ' + (present ? '1' : '0');
      output.textContent = stage < 2 ? 'En espera' : present ? 'Motor activado' : 'Motor apagado';
      label(svgSignal, 'señal ' + (present ? '1' : '0'));
      label(svgOrder, stage === 0 ? 'orden —' : 'orden ' + (present ? '1' : '0'));
      label(svgMotor, stage < 2 ? 'motor en espera' : present ? 'motor 100 %' : 'motor 0 %');
      const messages = present ? [
        'Pieza presente: el sensor entrega 1. La señal informa de la presencia; no aporta la energía que necesita el motor. Sigue con Decide.',
        'El programa recibe 1 y aplica la regla «si hay pieza, activar». Produce la orden 1; falta ejecutarla mediante la etapa de potencia.',
        'Señal 1 → regla cumplida → orden 1. El driver conecta la fuente de energía y el motor gira. Retira la pieza para comprobar la causa de la respuesta.'
      ] : [
        'Sin pieza, el sensor entrega 0. Introduce una pieza para cambiar la entrada; detectar no es todavía actuar.',
        'El programa recibe 0: la condición «hay pieza» no se cumple. La orden es 0, aunque la fuente de energía esté disponible.',
        'Señal 0 → regla no cumplida → orden 0. El driver mantiene apagado el motor. Introduce la pieza y observa cómo cambia toda la cadena.'
      ];
      caption.textContent = messages[stage];
    }
    function onClick(event) {
      if (disposed || !event.target || typeof event.target.closest !== 'function') return;
      const button = event.target.closest('[data-home-stage], [data-home-piece]');
      if (!button || !machine.contains(button)) return;
      if (button.hasAttribute('data-home-piece')) present = !present;
      else {
        const next = Number(button.dataset.homeStage);
        if (!Number.isInteger(next) || next < 0 || next > 2) return;
        stage = next;
      }
      render();
    }
    function cleanup() {
      if (disposed) return;
      disposed = true;
      machine.removeEventListener('click', onClick);
      mounts.delete(root);
    }
    render();
    machine.addEventListener('click', onClick);
    mounts.set(root, cleanup);
    return cleanup;
  };
}(window.NEXO));
