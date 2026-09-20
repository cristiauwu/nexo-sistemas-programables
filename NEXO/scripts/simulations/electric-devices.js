// scripts/simulations/electric-devices.js
(function (N) {
  'use strict';
  N.Simulations.electricMarkup = function () {
    const e = N.ui.escape;
    return `<article class="sensor-experiment"><p class="sensor-eyebrow">BANCO ELÉCTRICO / ORDEN ≠ POTENCIA</p><h3>Una orden no es una fuente de energía.</h3><div class="device-selector" aria-label="Seleccionar actuador">${N.content.actuatorDevices.map((d, i) => `<button class="device-select" type="button" data-device="${d.id}" aria-pressed="${i === 0}"><span>${d.code}</span>${e(d.name)}<small>${e(d.effect)}</small></button>`).join('')}</div><div class="experiment-grid"><div><div class="device-stage" data-device-drawing></div><div class="actuation-chain"><span>CONTROLADOR<strong data-device-order>ORDEN 0</strong></span><span data-device-driver></span><span>ALIMENTACIÓN<strong data-device-supply>DISPONIBLE</strong></span></div><p class="sensor-result" data-device-result role="status"></p><div class="sensor-buttons"><button class="sensor-button" type="button" data-device-toggle aria-pressed="false">Solicitar giro</button><button class="sensor-button" type="button" data-device-advance>Avanzar representación</button><button class="sensor-button" type="button" data-device-audio hidden>Escuchar muestra · 0,25 s</button></div><div class="sensor-controls device-power"><label for="device-supply"><input type="checkbox" id="device-supply" checked> Alimentación de potencia disponible</label></div><p class="sensor-note">Representación por estados y pasos manuales. Avanzar la imagen no mide tiempo, velocidad ni respuesta real. No hay conexión a hardware.</p></div><div class="device-information" data-device-info></div></div></article>`;
  };
  N.Simulations.mountElectric = function (root) {
    const e = N.ui.escape;
    let id = 'dc', order = false, angle = 0, audioContext = null, oscillator = null, disposed = false;
    const q = (name) => root.querySelector(`[data-device-${name}]`);
    const current = () => N.content.actuatorDevices.find((device) => device.id === id);
    const active = () => order && root.querySelector('#device-supply').checked;
    function illustration() {
      const on = active(), color = on ? 'var(--amber)' : 'var(--muted)';
      const motor = `<g transform="translate(270 137)"><circle r="81" fill="var(--stage)" stroke="${color}" stroke-width="3"/><circle r="63" fill="none" stroke="var(--line)" stroke-dasharray="9 5"/><g transform="rotate(${angle})"><path d="M-45 0H45M0-45V45" stroke="${color}" stroke-width="14"/><circle r="18" fill="var(--text)"/><path d="M20 0H70" stroke="var(--text)" stroke-width="4"/></g></g>`;
      const drawings = {
        dc: `${motor}<text x="150" y="260">DC · IMANES + ROTOR + ESCOBILLAS</text><path d="M162 115h28m-28 44h28" stroke="${color}" stroke-width="8"/>`,
        ac: `${motor}<path d="M80 140q12-50 24 0t24 0t24 0" fill="none" stroke="${color}" stroke-width="3"/><text x="170" y="260">AC · CAMPO GIRATORIO</text>`,
        stepper: `${motor}<rect x="250" y="31" width="40" height="20" fill="${color}"/><rect x="356" y="117" width="20" height="40" fill="${color}"/><text x="153" y="260">FASES → POSICIONES DISCRETAS</text>`,
        solenoid: `<path d="M65 185H210M325 185H465" stroke="${on ? 'var(--cyan)' : 'var(--line)'}" stroke-width="30"/><rect x="206" y="145" width="124" height="80" fill="var(--stage)" stroke="var(--muted)"/><path d="M207 185h122" stroke="${on ? 'var(--cyan)' : 'var(--line)'}" stroke-width="18"/><rect x="230" y="58" width="76" height="68" fill="none" stroke="${color}" stroke-width="10"/><path d="M238 62v60m15-60v60m15-60v60m15-60v60m15-60v60" stroke="${color}"/><rect x="260" y="${on ? 95 : 130}" width="16" height="67" fill="var(--text)"/><text x="174" y="270">${on ? 'PASO ABIERTO' : 'PASO CERRADO'}</text>`,
        pump: `${motor}<path d="M70 137h115m165 0h105V70" fill="none" stroke="${color}" stroke-width="18"/><path d="M99 126l20 11-20 11M420 126l20 11-20 11" fill="none" stroke="var(--text)" stroke-width="3"/><text x="153" y="260">IMPULSOR → ENERGÍA AL FLUIDO</text>`,
        pilot: `<circle cx="270" cy="140" r="88" fill="var(--stage)" stroke="var(--muted)" stroke-width="6"/><circle cx="270" cy="140" r="68" fill="${on ? 'var(--amber)' : 'var(--surface)'}" stroke="var(--text)" stroke-width="2"/><circle cx="249" cy="120" r="25" fill="${on ? 'var(--surface-raised)' : 'var(--line)'}" opacity=".6"/><text x="206" y="267">${on ? 'INDICADOR ON' : 'INDICADOR OFF'}</text>`,
        buzzer: `<path d="M140 105h70l72-50v170l-72-50h-70Z" fill="var(--stage)" stroke="${color}" stroke-width="3"/>${on ? '<path d="M310 90q55 50 0 100M340 65q85 75 0 150M370 40q110 100 0 200" stroke="var(--amber)" fill="none" stroke-width="3"/>' : ''}<text x="140" y="275">${on ? 'AVISO ACTIVO · AUDIO OPCIONAL' : 'SIN AVISO'}</text>`
      };
      return `<svg viewBox="0 0 540 305" role="img" aria-labelledby="device-svg-title"><title id="device-svg-title">${e(current().name)}: ${on ? 'energizado' : 'sin energía aplicada'}</title><g fill="var(--muted)" font-family="monospace" font-size="12">${drawings[id]}</g></svg>`;
    }
    function render() {
      const d = current();
      root.querySelectorAll('[data-device]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.device === id)));
      q('drawing').innerHTML = illustration();
      q('order').textContent = order ? 'ORDEN 1' : 'ORDEN 0';
      q('supply').textContent = root.querySelector('#device-supply').checked ? 'DISPONIBLE' : 'NO DISPONIBLE';
      q('driver').innerHTML = `ETAPA DE POTENCIA<strong>${e(d.driver)}</strong>`;
      q('toggle').textContent = order ? 'Retirar orden' : d.action;
      q('toggle').setAttribute('aria-pressed', String(order));
      q('advance').hidden = !['dc', 'ac', 'stepper', 'pump'].includes(id);
      q('advance').disabled = !active();
      q('audio').hidden = id !== 'buzzer'; q('audio').disabled = !active();
      q('result').textContent = order && !root.querySelector('#device-supply').checked ? 'Hay orden de mando, pero falta alimentación de potencia: el actuador no puede producir la acción solicitada en este modelo.' : active() ? d.on : d.off;
      q('info').innerHTML = `<p class="sensor-eyebrow">${e(d.code)} / ${e(d.energy)}</p><h3>${e(d.name)}</h3><p>${e(d.description)}</p><dl><dt>Ventaja</dt><dd>${e(d.advantage)}</dd><dt>Límite que importa</dt><dd>${e(d.limitation)}</dd><dt>Aplicación industrial</dt><dd>${e(d.application)}</dd></dl>`;
    }
    function stopSound() { if (oscillator) { try { oscillator.stop(); } catch (_) {} oscillator = null; } }
    async function beep() {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) { q('result').textContent = 'Audio no disponible en este navegador. La indicación visual sigue activa.'; return; }
      try {
        audioContext ||= new Audio(); await audioContext.resume();
        if (disposed || !active() || id !== 'buzzer') return;
        stopSound();
        const tone = audioContext.createOscillator(), gain = audioContext.createGain();
        oscillator = tone; tone.frequency.value = 660; gain.gain.setValueAtTime(0, audioContext.currentTime);
        gain.gain.linearRampToValueAtTime(.035, audioContext.currentTime + .015);
        gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + .25);
        tone.connect(gain); gain.connect(audioContext.destination); tone.start(); tone.stop(audioContext.currentTime + .26);
        tone.onended = () => { tone.disconnect(); gain.disconnect(); if (oscillator === tone) oscillator = null; };
      } catch (_) { if (!disposed) q('result').textContent = 'No se pudo reproducir audio. El aviso visual permanece disponible.'; }
    }
    function click(event) {
      const selector = event.target.closest('[data-device]');
      if (selector) { stopSound(); id = selector.dataset.device; order = false; angle = 0; render(); }
      if (event.target.closest('[data-device-toggle]')) { stopSound(); order = !order; if (active()) angle += id === 'stepper' ? 15 : 45; render(); }
      if (event.target.closest('[data-device-advance]') && active()) { angle += id === 'stepper' ? 15 : 45; render(); }
      if (event.target.closest('[data-device-audio]') && active()) beep();
    }
    function change(event) { if (event.target.id === 'device-supply') { stopSound(); render(); } }
    root.addEventListener('click', click); root.addEventListener('change', change); render();
    return () => { disposed = true; stopSound(); if (audioContext) audioContext.close().catch(() => {}); root.removeEventListener('click', click); root.removeEventListener('change', change); };
  };
}(window.NEXO));
