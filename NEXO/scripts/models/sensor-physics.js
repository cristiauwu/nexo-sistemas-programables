// NEXO/scripts/models/sensor-physics.js
(function (N) {
  'use strict';
  if (!N) throw new Error('Carga el registro NEXO antes de los modelos de sensores.');
  N.Models = N.Models || {};

  var K_TABLE = [
    [-200, -5.891], [-100, -3.554], [0, 0], [100, 4.096], [200, 8.138],
    [400, 16.397], [600, 24.905], [800, 33.275], [1000, 41.276], [1100, 45.119]
  ];
  var SENSORS = [
    { id: 'ntc', name: 'NTC 10 kΩ', min: -50, max: 150, unit: 'kΩ', points: [-50, 0, 25, 100, 150],
      principle: 'Semiconductor: su resistencia disminuye al subir la temperatura.',
      note: 'Modelo Beta: R = 10 000 · exp[3950 · (1/(T + 273,15) − 1/298,15)] Ω. Beta constante; no incluye tolerancia ni autocalentamiento.' },
    { id: 'ptc', name: 'PTC cerámico', min: -20, max: 150, unit: 'kΩ', points: [-20, 25, 80, 110, 150],
      principle: 'Resistencia creciente y subida pronunciada cerca de la transición.',
      note: 'Curva conceptual de conmutación, no una pieza comercial: R = 1000 · [1 + 0,003 · (T + 20)] · [1 + 80/(1 + exp(−(T − 110)/7))] Ω. Transición ilustrativa cerca de 110 °C; no sirve para calibrar.' },
    { id: 'pt100', name: 'Pt100 · RTD', min: -200, max: 850, unit: 'Ω', points: [-200, 0, 100, 400, 850],
      principle: 'Platino: resistencia creciente, aproximadamente lineal.',
      note: 'Callendar–Van Dusen: R = 100 · (1 + A·T + B·T² + C·(T − 100)·T³) Ω. A = 0,0039083; B = −0,0000005775. C = −4,183·10⁻¹² solo con T < 0 °C; para T ≥ 0 se omite el término C. Sin resistencia de cables.' },
    { id: 'k', name: 'Termopar tipo K', min: -200, max: 1100, unit: 'mV', points: [-200, 0, 200, 600, 1100],
      principle: 'Efecto Seebeck: tensión entre la unión caliente y la unión de referencia.',
      note: 'Interpolación lineal entre puntos de una tabla orientativa tipo K, no calibración ni ajuste de precisión. V = E(T) − E(Tref); la compensación añade E(Tref) para recuperar E(T). No se utiliza una sensibilidad constante en todo el rango.' }
  ];
  SENSORS.forEach(function (sensor) { Object.freeze(sensor.points); Object.freeze(sensor); });
  Object.freeze(SENSORS);

  function finite(value) { return typeof value === 'number' && Number.isFinite(value); }
  function bounded(value, min, max, fallback) {
    return finite(value) ? Math.max(min, Math.min(max, value)) : fallback;
  }
  function typeKEmf(temperature) {
    if (!finite(temperature) || temperature < -200 || temperature > 1100) return null;
    for (var i = 1; i < K_TABLE.length; i++) {
      var left = K_TABLE[i - 1];
      var right = K_TABLE[i];
      if (temperature <= right[0]) {
        return left[1] + (temperature - left[0]) * (right[1] - left[1]) / (right[0] - left[0]);
      }
    }
    return null;
  }
  function temperature(id, degrees, reference) {
    var sensor = SENSORS.filter(function (item) { return item.id === id; })[0];
    if (!sensor) throw new RangeError('Tipo de sensor térmico desconocido.');
    var cold = reference === undefined ? 25 : reference;
    var valid = finite(degrees) && degrees >= sensor.min && degrees <= sensor.max;
    if (id === 'k') valid = valid && finite(cold) && cold >= 0 && cold <= 50;
    var result = { id: id, temperature: degrees, min: sensor.min, max: sensor.max,
      unit: sensor.unit, inRange: valid, value: null, resistanceOhm: null,
      reference: id === 'k' ? cold : null, referenceMv: null, compensatedMv: null,
      status: valid ? 'Dentro del rango didáctico' : 'Fuera de rango / no extrapolar' };
    if (!valid) return result;
    var resistance;
    if (id === 'ntc') {
      resistance = 10000 * Math.exp(3950 * (1 / (degrees + 273.15) - 1 / 298.15));
    } else if (id === 'ptc') {
      resistance = 1000 * (1 + 0.003 * (degrees + 20)) * (1 + 80 / (1 + Math.exp(-(degrees - 110) / 7)));
    } else if (id === 'pt100') {
      resistance = 100 * (1 + 0.0039083 * degrees - 0.0000005775 * degrees * degrees +
        (degrees < 0 ? -4.183e-12 * (degrees - 100) * degrees * degrees * degrees : 0));
    } else {
      result.referenceMv = typeKEmf(cold);
      result.compensatedMv = typeKEmf(degrees);
      result.value = result.compensatedMv - result.referenceMv;
      return result;
    }
    result.resistanceOhm = resistance;
    result.value = sensor.unit === 'kΩ' ? resistance / 1000 : resistance;
    return result;
  }
  function compareTemperature(degrees, reference) {
    return SENSORS.map(function (sensor) { return temperature(sensor.id, degrees, reference); });
  }
  function temperatureCurve(id, reference, count) {
    var sensor = SENSORS.filter(function (item) { return item.id === id; })[0];
    if (!sensor) throw new RangeError('Tipo de sensor térmico desconocido.');
    var length = Math.round(bounded(count, 2, 401, 101));
    var points = [];
    for (var i = 0; i < length; i++) {
      var degrees = sensor.min + (sensor.max - sensor.min) * i / (length - 1);
      points.push(temperature(id, degrees, reference));
    }
    return points;
  }

  // Transferencia pura reutilizable: limita SOLO la señal, nunca oculta la presión real.
  function pressureSignal(measured, lower, upper) {
    if (!finite(measured) || !finite(lower) || !finite(upper) || upper <= lower) {
      throw new RangeError('La transferencia requiere presión y extremos finitos, con máximo > mínimo.');
    }
    var raw = (measured - lower) / (upper - lower);
    return { currentMa: 4 + 16 * Math.max(0, Math.min(1, raw)),
      saturation: raw < 0 ? 'baja' : raw > 1 ? 'alta' : 'ninguna', lower: lower, upper: upper };
  }
  function pressure(input) {
    input = input || {};
    var absolute = bounded(input.absolute, 0, 400, 150);
    var atmosphere = bounded(input.atmosphere, 80, 110, 101);
    var secondary = bounded(input.secondary, 0, 200, 100);
    var threshold = bounded(input.threshold, -200, 400, 100);
    var mode = input.mode === 'gauge' || input.mode === 'differential' ? input.mode : 'absolute';
    var transducer = input.transducer === 'capacitive' ? 'capacitive' : 'piezoresistive';
    var reference = mode === 'absolute' ? 0 : mode === 'gauge' ? atmosphere : secondary;
    var measured = absolute - reference;
    var normalizedDeflection = measured / 400;
    var signal = pressureSignal(measured, mode === 'absolute' ? 0 : -200, 400);
    var alarm = measured >= threshold;
    return { absolute: absolute, atmosphere: atmosphere, secondary: secondary,
      mode: mode, transducer: transducer, reference: reference, measured: measured,
      normalizedDeflection: normalizedDeflection,
      // Geometría normalizada: d/d0 = 1 − 0,35·(Pmed/400), siempre positiva en la demo.
      gapRatio: 1 - 0.35 * normalizedDeflection,
      capacitanceRatio: 1 / (1 - 0.35 * normalizedDeflection),
      deltaResistanceRatio: 0.08 * normalizedDeflection,
      resistanceRatio: 1 + 0.08 * normalizedDeflection,
      currentMa: signal.currentMa, saturation: signal.saturation,
      signalMin: signal.lower, signalMax: signal.upper,
      threshold: threshold, alarm: alarm, output: alarm ? 1 : 0,
      gaugeVacuum: absolute < atmosphere,
      integration: { measuredKpa: measured, referenceKpa: reference, mode: mode,
        currentMa: signal.currentMa, alarm: alarm, digitalOutput: alarm ? 1 : 0,
        saturated: signal.saturation !== 'ninguna' } };
  }

  // API sin DOM, reloj, efectos secundarios ni mutaciones del estado recibido.
  N.Models.sensorPhysics = Object.freeze({ sensors: SENSORS, temperature: temperature,
    compareTemperature: compareTemperature, temperatureCurve: temperatureCurve,
    typeKEmf: typeKEmf, pressure: pressure, pressureSignal: pressureSignal });
}(window.NEXO));
