// scripts/models/selection.js — Funciones puras: no DOM, azar, reloj ni mutación.
(function (N) {
  'use strict';
  const levels = {
    precision: { basic: 1, indexed: 2, verified: 3 },
    load: { light: 1, medium: 2, heavy: 3 },
    budget: { low: 1, medium: 2, high: 3 },
    speed: { slow: 1, normal: 2, fast: 3 }
  };
  const sources = { ac: 'red AC compatible', dc: '24 V DC', air: 'aire comprimido preparado', hydraulic: 'central hidráulica operativa' };
  function validate(caseId, input, cases) {
    const errors = [];
    if (!cases.some((item) => item.id === caseId)) errors.push('Caso no reconocido. Selecciona uno de los once escenarios.');
    if (!input || typeof input !== 'object') return errors.concat('Faltan las restricciones del escenario.');
    Object.keys(levels).forEach((key) => {
      if (!Object.prototype.hasOwnProperty.call(levels[key], input[key])) errors.push('Valor no reconocido para ' + key + '.');
    });
    if (!Array.isArray(input.supplies) || input.supplies.some((id) => !Object.prototype.hasOwnProperty.call(sources, id))) errors.push('Indica las fuentes disponibles usando ac, dc, air o hydraulic.');
    return errors;
  }
  // Es posible inyectar datos para pruebas. Se leen, nunca se modifican.
  function recommend(caseId, input, data) {
    const cases = data ? data.cases : N.content.industrialCases;
    const catalog = data ? data.actuators : N.content.industrialActuators;
    const errors = validate(caseId, input, cases);
    if (errors.length) return { caseId: caseId, status: 'invalid', errors: errors, ranked: [], rejected: [], recommendation: null, assumptions: [] };
    const scenario = cases.find((item) => item.id === caseId);
    const demand = {};
    Object.keys(levels).forEach((key) => { demand[key] = levels[key][input[key]]; });
    const ranked = [], rejected = [];
    catalog.forEach((actuator) => {
      const missing = actuator.sources.filter((source) => !input.supplies.includes(source));
      // Fuente es una barrera dura ANTES de compatibilidad y puntuación.
      if (missing.length) {
        rejected.push({ id: actuator.id, name: actuator.name, stage: 'supply', reasons: ['Falta alimentación: ' + missing.map((id) => sources[id]).join(' + ') + '. No se supone ningún convertidor ni fuente adicional.'] });
        return;
      }
      const candidate = scenario.candidates.find((item) => item.id === actuator.id);
      if (!candidate) {
        rejected.push({ id: actuator.id, name: actuator.name, stage: 'task', reasons: ['No realiza la acción concreta definida para «' + scenario.name + '» en este catálogo. ' + scenario.others] });
        return;
      }
      const reasons = [];
      if (actuator.precision < demand.precision) reasons.push(demand.precision === 3 ? 'Se exige posición medida y corregida. Este conjunto no tiene realimentación de posición.' : 'Se exigen posiciones incrementales; este conjunto solo ofrece giro sin posición o dos estados.');
      if (actuator.load < demand.load) reasons.push(actuator.mechanical ? 'La carga pedida supera la clase educativa de este conjunto; no basta aumentar la velocidad.' : 'La carga mecánica media/alta no corresponde a esta tarea de fluido o aviso. Usa «Ligera / no mecánica»; presión y caudal requieren otro análisis.');
      if (actuator.speed < demand.speed) reasons.push('La rapidez pedida supera el rango cualitativo de este conjunto de ejemplo.');
      if (actuator.cost > demand.budget) reasons.push('El costo relativo del conjunto supera el presupuesto elegido.');
      if (reasons.length) { rejected.push({ id: actuator.id, name: actuator.name, stage: 'constraints', reasons: reasons }); return; }
      const fitPoints = candidate.fit * 10;
      const costPoints = (demand.budget - actuator.cost) * 2;
      ranked.push({ id: actuator.id, name: actuator.name, score: fitPoints + costPoints,
        breakdown: ['Afinidad con la tarea: ' + candidate.fit + '/5 × 10 = ' + fitPoints + ' puntos.', 'Margen de costo: (' + demand.budget + ' − ' + actuator.cost + ') × 2 = ' + costPoints + ' puntos.'],
        reasons: ['Dispone de todas las fuentes exigidas: ' + actuator.sources.map((id) => sources[id]).join(' + ') + '.', 'Cumple las cuatro restricciones cualitativas del conjunto de ejemplo.', scenario.why],
        assumption: actuator.assumption, traits: actuator.traits.slice() });
    });
    ranked.sort((a, b) => b.score - a.score || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    return { caseId: caseId, status: ranked.length ? 'ok' : 'no-match', errors: [], ranked: ranked, rejected: rejected,
      recommendation: ranked.length ? ranked[0] : null,
      assumptions: [
        'Catálogo limitado a conjuntos de ejemplo, no a todas las variantes comerciales. No se añaden fuentes, reductores ni sensores implícitos.',
        'Carga, rapidez y presupuesto son clases relativas sin kg, rpm ni moneda. No son capacidades certificadas ni dimensionamiento de ingeniería.',
        'AC = corriente alterna; DC = corriente continua. La selección real exige tensión, corriente, potencia, par, ciclo y ambiente compatibles.',
        'Precisión significa aquí tipo de control: básico, incrementos sin verificación o posición medida. No se promete tolerancia en mm o grados.',
        'Potencia, espacio y mantenimiento se comparan con texto, no con puntos inventados. El desempate se resuelve por identificador estable.',
        'Para fluidos hay que verificar presión (Pa), caudal (m³/s), materiales y temperatura; para avisos, visibilidad y audibilidad. Esos datos no se calculan aquí.'
      ] };
  }
  N.Models.selection = { recommend: recommend, validate: (caseId, input) => validate(caseId, input, N.content.industrialCases) };
}(window.NEXO));
