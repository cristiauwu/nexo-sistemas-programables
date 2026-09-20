// NEXO/scripts/models/control.js
(function (NEXO) {
  'use strict';
  if (!NEXO) throw new Error('Carga el registro NEXO antes del modelo térmico.');
  NEXO.Models = NEXO.Models || {};

  // Modelo didáctico, no hardware: dT/dt = gain·heat − k·(T − ambient).
  // Sin ventilación: equilibrio inicial 36,73 °C; primer encendido ≈18,3 s.
  // Con ventilación: k = 0,295 s⁻¹, suficiente para enfriar a plena entrada.
  var GAIN = 0.018;
  var PASSIVE = 0.055;
  var FORCED = 0.24;
  function clamp(value, min, max, fallback) {
    return Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;
  }
  function create() {
    return { temp: 32, ambient: 22, heat: 45, threshold: 35, hysteresis: 2,
      fan: false, mode: 'closed', manualFan: false, time: 0 };
  }
  function control(state) {
    if (state.mode === 'open') state.fan = state.manualFan;
    else if (state.temp > state.threshold) state.fan = true;
    else if (state.temp < state.threshold - state.hysteresis) state.fan = false;
    // En la banda y en sus extremos se conserva el estado anterior.
  }
  function step(state, dt) {
    state.ambient = clamp(state.ambient, -20, 50, 22);
    state.temp = clamp(state.temp, state.ambient, 85, Math.max(state.ambient, 32));
    state.heat = clamp(state.heat, 0, 100, 45);
    state.threshold = clamp(state.threshold, 28, 50, 35);
    state.hysteresis = 2;
    state.time = clamp(state.time, 0, Number.MAX_SAFE_INTEGER, 0);
    state.mode = state.mode === 'open' ? 'open' : 'closed';
    state.manualFan = !!state.manualFan;
    state.fan = !!state.fan;
    var remaining = clamp(dt, 0, 1, 0);
    control(state);
    // Solución exponencial exacta por subpaso: estable incluso con dt grande.
    while (remaining > 1e-9) {
      var h = Math.min(0.1, remaining);
      var k = PASSIVE + (state.fan ? FORCED : 0);
      var equilibrium = state.ambient + GAIN * state.heat / k;
      state.temp = clamp(equilibrium + (state.temp - equilibrium) * Math.exp(-k * h), state.ambient, 85, state.ambient);
      state.time = Math.round((state.time + h) * 1e9) / 1e9;
      remaining -= h;
      control(state);
    }
    return state;
  }
  function reset(state) {
    return Object.assign(state, create());
  }
  NEXO.Models.thermal = { create: create, step: step, reset: reset };
}(window.NEXO));
