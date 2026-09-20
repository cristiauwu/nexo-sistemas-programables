// Pure integration model: explicit state in, new state out. No DOM or clocks.
(function (N) {
  'use strict';
  const M = N.Models;
  const IDS = ['temperature', 'metal', 'pressure'];
  const bounds = (value, min, max, fallback) => Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;
  const limits = {
    temperature: { threshold: [28, 50, 35], hysteresis: [0, 8, 2], source: 65 },
    metal: { threshold: [0, 1, 1], hysteresis: [0, 0, 0], source: 65 },
    pressure: { threshold: [160, 300, 220], hysteresis: [0, 40, 20], source: 65 }
  };
  function normalize(input) {
    const id = IDS.includes(input.caseId) ? input.caseId : 'temperature';
    const lim = limits[id];
    const s = Object.assign({}, input, {
      caseId: id, mode: input.mode === 'open' ? 'open' : 'closed',
      source: bounds(input.source, 0, 100, lim.source),
      threshold: bounds(input.threshold, ...lim.threshold),
      hysteresis: bounds(input.hysteresis, ...lim.hysteresis),
      manualCommand: !!input.manualCommand, command: !!input.command,
      material: input.material === 'plastic' ? 'plastic' : 'metal',
      time: bounds(input.time, 0, Number.MAX_SAFE_INTEGER, 0),
      temp: bounds(input.temp, 22, 85, 32),
      absolute: bounds(input.absolute, 101, 400, 170),
      position: bounds(input.position, -60, 820, 80),
      turns: bounds(input.turns, 0, Number.MAX_SAFE_INTEGER, 0),
      passes: Math.floor(bounds(input.passes, 0, Number.MAX_SAFE_INTEGER, 0)),
      history: Array.isArray(input.history) ? input.history.slice(-120) : []
    });
    return s;
  }
  function sense(s) {
    if (s.caseId === 'temperature') {
      const sensor = M.sensorPhysics.temperature('ntc', s.temp);
      return { value: s.temp, unit: '°C', electrical: sensor.value, electricalUnit: 'kΩ', detected: false };
    }
    if (s.caseId === 'pressure') {
      const sensor = M.sensorPhysics.pressure({ absolute: s.absolute, mode: 'absolute', threshold: s.threshold });
      return { value: sensor.measured, unit: 'kPa abs', electrical: sensor.currentMa, electricalUnit: 'mA', detected: sensor.alarm };
    }
    // Fixed sensing window [500, 520] mm; the 60 mm box must actually enter it.
    const detected = s.material === 'metal' && s.position + 60 >= 500 && s.position <= 520;
    return { value: s.position, unit: 'mm', electrical: detected ? 24 : 0, electricalUnit: 'V', detected: detected };
  }
  function decide(s) {
    const sensor = sense(s);
    if (s.mode === 'open') {
      s.command = s.manualCommand;
      s.rule = 'Lazo abierto: se aplica la orden manual; la medida no decide.';
    } else if (s.caseId === 'metal') {
      s.command = !sensor.detected;
      s.rule = sensor.detected ? 'Metal detectado → quitar potencia y detener la banda.' : 'Sin metal detectado → permitir el avance de la banda.';
    } else if (sensor.value > s.threshold) {
      s.command = true;
      s.rule = 'Medida > umbral → activar ' + (s.caseId === 'temperature' ? 'ventilador.' : 'alivio.');
    } else if (sensor.value < s.threshold - s.hysteresis) {
      s.command = false;
      s.rule = 'Medida < umbral − histéresis → desactivar la salida.';
    } else {
      s.rule = 'Dentro de la banda (incluidos extremos) → conservar la orden anterior.';
    }
    s.sensor = sensor;
    s.actuator = actuator(s);
    return s;
  }
  function actuator(s) {
    if (s.caseId === 'pressure') {
      const valve = M.mechanics.solenoid({ energized: s.command, stage: 4, startLift: s.command ? 1 : 0, upstreamBar: s.absolute / 100 });
      return { active: valve.open, lift: valve.lift, rpm: 0, speed: 0,
        label: valve.open ? 'Válvula abierta · descarga hacia 101 kPa' : 'Válvula cerrada · sin descarga de alivio',
        power: s.command ? 'Driver 24 V → bobina energizada' : 'Driver 0 V → resorte cierra' };
    }
    const motor = M.motors.dc({ duty: s.command ? (s.caseId === 'metal' ? s.source : 100) : 0 });
    const speed = s.caseId === 'metal' ? motor.rpm / 60 / 60 * M.mechanics.transformation({ mode: 'rack', radius: 20, turns: 1 }).travelPerTurnMm : 0;
    return { active: Math.abs(motor.rpm) > 0, rpm: motor.rpm, speed: speed, lift: 0,
      label: s.caseId === 'metal' ? 'Motor ' + motor.rpm.toFixed(0) + ' rpm · banda ' + speed.toFixed(1) + ' mm/s' : 'Ventilador ' + motor.rpm.toFixed(0) + ' rpm · ' + (s.command ? 'enfriamiento forzado' : 'enfriamiento pasivo'),
      power: 'Driver ' + motor.averageVoltage.toFixed(1) + ' V medios → motor DC' };
  }
  function record(s) {
    s.history.push({ time: s.time, value: s.sensor.value, unit: s.sensor.unit,
      electrical: s.sensor.electrical, electricalUnit: s.sensor.electricalUnit,
      command: s.command, mode: s.mode, response: s.actuator.label, rule: s.rule });
    s.history = s.history.slice(-120);
    return s;
  }
  function create(caseId) {
    if (caseId !== undefined && !IDS.includes(caseId)) throw new RangeError('Caso de integración desconocido.');
    const id = caseId || 'temperature';
    return record(decide(normalize({ caseId: id, threshold: limits[id].threshold[2], hysteresis: limits[id].hysteresis[2] })));
  }
  function configure(state, controls) {
    const permitted = ['mode', 'source', 'threshold', 'hysteresis', 'manualCommand', 'material'];
    const next = Object.assign({}, state);
    permitted.forEach((key) => { if (Object.prototype.hasOwnProperty.call(controls || {}, key)) next[key] = controls[key]; });
    return decide(normalize(next));
  }
  function step(state, dt) {
    const s = normalize(state);
    let remaining = bounds(dt, 0, 1, 0);
    if (remaining === 0) return decide(s);
    while (remaining > 1e-9) {
      const h = Math.min(0.1, remaining);
      decide(s);
      if (s.caseId === 'temperature') {
        // thermal forces hysteresis=2 internally. Its OPEN mode is deliberately used
        // as the physical plant; this controller owns the configurable hysteresis.
        const plant = Object.assign(M.thermal.create(), { temp: s.temp, ambient: 22,
          heat: s.source, time: s.time, threshold: s.threshold, mode: 'open', manualFan: s.command, fan: s.command });
        M.thermal.step(plant, h);
        s.temp = plant.temp;
      } else if (s.caseId === 'pressure') {
        // Lumped educational vessel: feed raises pressure, relief drains it.
        // Exact first-order integration. Atmosphere is 101 kPa, never vacuum.
        const k = 0.025 + (s.actuator.open || s.actuator.lift > 0 ? 0.9 : 0);
        const equilibrium = 101 + 0.35 * s.source / k;
        s.absolute = bounds(equilibrium + (s.absolute - equilibrium) * Math.exp(-k * h), 101, 400, 170);
      } else {
        s.position += s.actuator.speed * h;
        if (s.position > 820) { s.position -= 880; s.passes += 1; }
      }
      if (s.caseId !== 'pressure') s.turns += s.actuator.rpm * h / 60;
      s.time = Math.round((s.time + h) * 1e9) / 1e9;
      remaining -= h;
      decide(s);
      record(s);
    }
    return s;
  }
  function compatibility(sensor, output, rule) {
    const map = { temperature: { actuator: 'fan', rule: 'cool', caseId: 'temperature', reason: 'NTC + ventilador + enfriar al superar el umbral: el aire modifica la temperatura que vuelve a medirse.' },
      metal: { actuator: 'conveyor', rule: 'stop', caseId: 'metal', reason: 'Inductivo + banda + detener ante metal: el movimiento lleva la pieza al sensor y la detección corta el avance.' },
      pressure: { actuator: 'valve', rule: 'relieve', caseId: 'pressure', reason: 'Transmisor de presión + válvula de alivio + descargar al superar el umbral: la descarga reduce la presión medida.' } };
    const selected = map[sensor];
    if (!selected) return { compatible: false, reason: 'Elige un sensor de estos tres bancos.' };
    if (selected.actuator !== output) {
      const explanations = {
        'temperature-valve': 'Esta válvula descarga un depósito de aire, no un circuito refrigerante: aquí no modifica la temperatura de la cámara.',
        'temperature-conveyor': 'Esta banda desplaza piezas, pero no enfría la cámara. La NTC no realimenta la posición de una pieza.',
        'metal-fan': 'El ventilador no detiene el transporte de la pieza detectada. Necesitas actuar sobre el motor de la banda.',
        'metal-valve': 'La válvula alivia presión, pero no detiene esta banda eléctrica cuando pasa metal.',
        'pressure-fan': 'El ventilador de esta cámara no descarga el depósito: la presión seguiría subiendo con el aporte.',
        'pressure-conveyor': 'Mover esta banda no descarga el depósito; el transmisor de presión no controla su posición.'
      };
      return { compatible: false, reason: explanations[sensor + '-' + output] || 'El actuador no pertenece al proceso medido en este banco.' };
    }
    if (selected.rule !== rule) return { compatible: false, reason: sensor === 'metal' ? 'El inductivo entrega presencia 0/1, no temperatura ni presión: usa detener al detectar metal.' : sensor === 'temperature' ? 'Para esta cámara usa enfriar al superar el umbral. Detener por presencia o descargar presión no describe lo que mide la NTC.' : 'Para este depósito usa aliviar al superar el umbral. Ni presencia de metal ni enfriamiento térmico son la condición medida.' };
    return { compatible: true, caseId: selected.caseId, reason: selected.reason };
  }
  M.integration = Object.freeze({ create: create, step: step, configure: configure, sense: sense, compatibility: compatibility });
})(window.NEXO);
