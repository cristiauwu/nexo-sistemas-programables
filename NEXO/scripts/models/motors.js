// NEXO/scripts/models/motors.js
(function (N) {
  'use strict';
  if (!N || !N.Models) throw new Error('Carga NEXO y Models antes del modelo de motores.');

  var sequence = ['A+', 'B+', 'A−', 'B−'];
  function bounded(value, min, max, fallback) {
    value = Number(value);
    return Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;
  }
  function angle(value) { return ((value % 360) + 360) % 360; }
  function stepperSettings(options) {
    options = options || {};
    return {
      stepAngle: Number(options.stepAngle) === 7.5 ? 7.5 : 1.8,
      frequency: bounded(options.frequency, 1, 20, 8),
      direction: Number(options.direction) === -1 ? -1 : 1,
      load: options.load === 'excessive' ? 'excessive' : 'normal'
    };
  }
  function createStepper(options) {
    return Object.assign(stepperSettings(options), {
      pulses: 0, commandedSteps: 0, simulatedSteps: 0, lostSteps: 0,
      commandedAngle: 0, simulatedAngle: 0, phase: 0, lastLost: false
    });
  }
  // Un pulso = un cambio de excitación; nunca integra un giro continuo.
  // La pérdida cada tercer pulso es una regla didáctica, no una curva de par.
  function pulse(state) {
    Object.assign(state, stepperSettings(state));
    state.pulses += 1;
    state.phase = (state.phase + state.direction + 4) % 4;
    state.commandedSteps += state.direction;
    state.commandedAngle += state.direction * state.stepAngle;
    state.lastLost = state.load === 'excessive' && state.pulses % 3 === 0;
    if (state.lastLost) state.lostSteps += 1;
    else {
      state.simulatedSteps += state.direction;
      state.simulatedAngle += state.direction * state.stepAngle;
    }
    return state;
  }
  function stepperReadout(state) {
    return {
      phase: sequence[state.phase],
      rpm: state.frequency * state.stepAngle / 6,
      signedRpm: state.direction * state.frequency * state.stepAngle / 6,
      commandedAngle: state.commandedAngle,
      estimatedAngle: state.commandedAngle,
      simulatedAngle: state.simulatedAngle,
      errorAngle: state.commandedAngle - state.simulatedAngle,
      rotorAngle: angle(state.simulatedAngle)
    };
  }
  function ac(options) {
    options = options || {};
    var frequency = bounded(options.frequency, 20, 60, 50);
    var slipPercent = bounded(options.slipPercent, 0, 8, 3);
    var synchronousRpm = 120 * frequency / 4;
    return { frequency: frequency, poles: 4, slipPercent: slipPercent,
      synchronousRpm: synchronousRpm, rpm: synchronousRpm * (1 - slipPercent / 100) };
  }
  function dc(options) {
    options = options || {};
    var duty = bounded(options.duty, 0, 100, 50);
    var direction = Number(options.direction) === -1 ? -1 : 1;
    return { supplyVoltage: 24, duty: duty, direction: direction,
      averageVoltage: direction * 24 * duty / 100,
      referenceRpm: 1500, rpm: direction * 1500 * duty / 100 };
  }
  function createComparison() {
    return { time: 0, acTurns: 0, fieldTurns: 0, dcTurns: 0 };
  }
  // Integra vueltas, no pretende resolver transitorios eléctricos ni mecánicos.
  function advanceComparison(state, seconds, acOptions, dcOptions) {
    var dt = bounded(seconds, 0, 60, 0);
    var a = ac(acOptions);
    var d = dc(dcOptions);
    state.time += dt;
    state.acTurns += a.rpm * dt / 60;
    state.fieldTurns += a.synchronousRpm * dt / 60;
    state.dcTurns += d.rpm * dt / 60;
    return state;
  }
  function application(caseId, approach) {
    if (caseId === 'indexed') {
      if (approach === 'stepper') return 'Banda indexada: el paso a paso permite ordenar incrementos de posición. Es adecuado si se dimensiona la carga y se mantiene margen; sin encoder no verifica que cada paso ocurra. Para posición garantizada, valorar realimentación o un servo.';
      if (approach === 'dc') return 'Banda indexada: PWM en un DC regula aproximadamente velocidad, no posición. Harían falta encoder, referencia y lazo de posición para indexar con precisión; el puente H por sí solo no basta.';
      return 'Banda indexada: variar frecuencia con un VFD no garantiza una posición final. Una solución AC puede indexar con control y realimentación apropiados; este banco de inducción abierto no los incluye.';
    }
    if (approach === 'ac') return 'Ventilador de funcionamiento continuo: inducción AC con VFD es una opción habitual para variar velocidad. La selección real depende de potencia, red, ventilación del motor y curva de carga; aquí no se calculan ahorro ni par.';
    if (approach === 'dc') return 'Ventilador pequeño a 24 V: un DC puede ser adecuado y permite regular con PWM. Este ejemplo lleva escobillas y requiere considerar desgaste; otros ventiladores usan BLDC, que es otra tecnología.';
    return 'Ventilador: un paso a paso puede girarlo, pero su control incremental no suele aportar ventaja al giro continuo. Ruido, calentamiento, velocidad y eficiencia deben evaluarse; ningún motor es universal.';
  }
  N.Models.motors = {
    sequence: sequence.slice(), angle: angle, stepperSettings: stepperSettings,
    createStepper: createStepper, pulse: pulse, stepperReadout: stepperReadout,
    ac: ac, dc: dc, createComparison: createComparison,
    advanceComparison: advanceComparison, application: application
  };
}(window.NEXO));
