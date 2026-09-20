// NEXO/scripts/models/mechanics.js — Relaciones ideales, sin DOM ni estado compartido.
(function (N) {
  'use strict';
  if (!N) throw new Error('Carga el registro NEXO antes de los modelos mecánicos.');
  N.Models = N.Models || {};
  function limit(value, min, max, fallback) {
    value = Number(value);
    return Math.max(min, Math.min(max, Number.isFinite(value) ? value : fallback));
  }
  function transformation(options) {
    var o = options || {};
    var turns = limit(o.turns, 0, 10, 0);
    var pitch = limit(o.pitch, 2, 10, 5);
    var radius = limit(o.radius, 10, 40, 20);
    var rack = o.mode === 'rack';
    var radians = turns * 2 * Math.PI;
    return { mode: rack ? 'rack' : 'screw', turns: turns, pitch: pitch, radius: radius,
      radians: radians, degrees: turns * 360,
      displacementMm: rack ? radians * radius : turns * pitch,
      travelPerTurnMm: rack ? 2 * Math.PI * radius : pitch,
      maxDisplacementMm: rack ? 20 * Math.PI * radius : 10 * pitch };
  }
  function hydraulics(options) {
    var o = options || {};
    var diameter = limit(o.diameter, 20, 100, 50);
    var rod = limit(o.rod, 5, Math.min(diameter - 1, 50), 20);
    var pressureBar = limit(o.pressureBar, 0, 100, 30);
    var flowLMin = limit(o.flowLMin, 0, 20, 3);
    var loadN = limit(o.loadN, 0, 10000, 1000);
    var positionMm = limit(o.positionMm, 0, 100, 0);
    var single = o.mode === 'single';
    var direction = o.direction === 'advance' || o.direction === 'return' ? o.direction : 'neutral';
    var area = Math.PI * diameter * diameter / 4 / 1e6;
    var annulus = area - Math.PI * rod * rod / 4 / 1e6;
    var pressurePa = pressureBar * 1e5;
    var advanceForceN = pressurePa * area;
    var returnForceN = single ? 500 : pressurePa * annulus;
    var returnArea = single ? area : annulus;
    var activeArea = direction === 'return' ? returnArea : area;
    var availableForceN = direction === 'return' ? returnForceN : advanceForceN - (single ? 500 : 0);
    var theoreticalSpeedMmS = flowLMin / 60000 / activeArea * 1000;
    var status = 'Movimiento disponible';
    if (direction === 'neutral') status = 'Centro neutro: posición retenida en este modelo';
    else if (flowLMin === 0) status = 'Detenido: caudal nulo';
    else if (availableForceN <= loadN) status = 'Detenido: fuerza insuficiente para vencer la carga';
    else if ((direction === 'advance' && positionMm >= 100) || (direction === 'return' && positionMm <= 0)) status = 'Detenido: fin de carrera';
    var moving = status === 'Movimiento disponible';
    return { mode: single ? 'single' : 'double', direction: direction, diameter: diameter, rod: rod,
      pressureBar: pressureBar, flowLMin: flowLMin, loadN: loadN, positionMm: positionMm,
      areaCm2: area * 1e4, annulusCm2: annulus * 1e4, activeAreaCm2: activeArea * 1e4,
      advanceForceN: advanceForceN, returnForceN: returnForceN, springForceN: single ? 500 : 0,
      availableForceN: availableForceN, theoreticalSpeedMmS: theoreticalSpeedMmS,
      advanceSpeedMmS: flowLMin / 60000 / area * 1000,
      returnSpeedMmS: flowLMin / 60000 / returnArea * 1000,
      speedMmS: moving ? theoreticalSpeedMmS : 0,
      signedSpeedMmS: moving ? theoreticalSpeedMmS * (direction === 'return' ? -1 : 1) : 0,
      moving: moving, status: status };
  }
  function hydraulicStep(options, seconds) {
    var state = hydraulics(options);
    var dt = limit(seconds, 0, 10, 0.2);
    var position = limit(state.positionMm + state.signedSpeedMmS * dt, 0, 100, state.positionMm);
    var next = Object.assign({}, options || {}, { positionMm: position });
    return Object.assign(hydraulics(next), { elapsedSeconds: dt, movedMm: position - state.positionMm });
  }
  function rotary(options) {
    var o = options || {};
    var pressureBar = limit(o.pressureBar, 0, 100, 30);
    var flowLMin = limit(o.flowLMin, 0, 20, 3);
    var displacementCm3Rev = 20;
    var torqueNm = pressureBar * 1e5 * displacementCm3Rev * 1e-6 / (2 * Math.PI);
    var nominalRpm = flowLMin * 1000 / displacementCm3Rev;
    var moving = pressureBar > 0 && flowLMin > 0;
    return { displacementCm3Rev: displacementCm3Rev, torqueNm: torqueNm,
      nominalRpm: nominalRpm, rpm: moving ? nominalRpm : 0,
      radiansPerSecond: moving ? nominalRpm * 2 * Math.PI / 60 : 0,
      degreesPerSecond: moving ? nominalRpm * 6 : 0, moving: moving };
  }
  function solenoid(options) {
    var o = options || {};
    var energized = Boolean(o.energized);
    var stage = Math.round(limit(o.stage, 0, 4, 0));
    var startLift = limit(o.startLift, 0, 1, 0);
    var lift = energized ? startLift + (1 - startLift) * [0, 0, 0.5, 1, 1][stage] : startLift * [1, 0.75, 0.35, 0, 0][stage];
    var upstreamBar = limit(o.upstreamBar, 0, 5, 3);
    var supplied = o.supplied !== false;
    var differentialBar = upstreamBar - 1;
    var flow = supplied && differentialBar > 0 && lift > 0;
    var labels = energized ? ['Bobina energizada', 'Campo magnético: atrae el émbolo', 'Émbolo en movimiento', 'Paso abierto', 'Secuencia completada: observa el flujo'] :
      ['Campo retirado al desenergizar', 'El resorte inicia el cierre', 'El émbolo se aproxima al asiento', 'Paso cerrado', 'Secuencia completada: reposo normalmente cerrado'];
    return { energized: energized, stage: stage, startLift: startLift, lift: lift,
      field: energized, upstreamBar: upstreamBar, downstreamBar: 1, differentialBar: differentialBar,
      supplied: supplied, open: lift > 0, flow: flow, completed: stage === 4, label: labels[stage],
      flowReason: flow ? 'Hay paso y diferencia de presión positiva: flujo hacia la salida' :
        !supplied ? 'Sin suministro: no hay flujo' : lift <= 0 ? 'Paso cerrado: no hay flujo' :
          'Sin diferencia de presión positiva: no hay flujo hacia la salida' };
  }
  N.Models.mechanics = Object.freeze({ transformation: transformation, hydraulics: hydraulics,
    hydraulicStep: hydraulicStep, rotary: rotary, solenoid: solenoid });
})(window.NEXO);
