// tests/model-tests.js
(function (N) {
  'use strict';
  N.runModelTests = function () {
    const model = N.Models.thermal;
    const results = [];
    const test = (name, fn) => { try { fn(); results.push({ name, passed: true }); } catch (error) { results.push({ name, passed: false, message: error.message }); } };
    const assert = (condition, message) => { if (!condition) throw new Error(message || 'Aserción no satisfecha'); };
    test('Estado inicial y unidades coherentes', () => { const s = model.create(); assert(s.temp === 32 && s.ambient === 22 && s.time === 0 && !s.fan); });
    test('El control activa el ventilador sobre el umbral', () => { const s = model.create(); s.temp = 36; model.step(s, 0); assert(s.fan); });
    test('La histéresis conserva el estado dentro de la banda', () => { const s = model.create(); s.temp = 34; s.fan = true; model.step(s, 0); assert(s.fan); s.fan = false; model.step(s, 0); assert(!s.fan); });
    test('El ventilador se apaga bajo el límite inferior', () => { const s = model.create(); s.temp = 32.9; s.fan = true; model.step(s, 0); assert(!s.fan); });
    test('En los extremos exactos se conserva el estado previo', () => { const s = model.create(); s.temp = 35; model.step(s, 0); assert(!s.fan); s.temp = 33; s.fan = true; model.step(s, 0); assert(s.fan); });
    test('En lazo abierto la medida no decide la salida', () => { const s = model.create(); s.mode = 'open'; s.temp = 60; model.step(s, 0); assert(!s.fan); s.manualFan = true; s.temp = 22; model.step(s, 0); assert(s.fan); });
    test('Sin aporte térmico no se enfría por debajo del ambiente', () => { const s = model.create(); s.heat = 0; s.mode = 'open'; s.manualFan = true; for (let i = 0; i < 10000; i++) model.step(s, .1); assert(s.temp >= s.ambient && s.temp < s.ambient + .01); });
    test('El aporte de calor incrementa la temperatura sin ventilación', () => { const s = model.create(); s.heat = 100; model.step(s, 1); assert(s.temp > 32); });
    test('El enfriamiento forzado reduce la temperatura', () => { const s = model.create(); s.temp = 40; s.mode = 'open'; s.manualFan = true; model.step(s, 1); assert(s.temp < 40); });
    test('Un umbral alto puede resultar inalcanzable', () => { const s = model.create(); s.threshold = 50; let activated = false; for (let i = 0; i < 3000; i++) { model.step(s, .1); activated ||= s.fan; } assert(!activated && s.temp < 37); });
    test('El escenario inicial produce encendido y apagado', () => { const s = model.create(); let on = false; let offAfter = false; for (let i = 0; i < 400; i++) { model.step(s, .1); if (s.fan) on = true; if (on && !s.fan) offAfter = true; } assert(on && offAfter); });
    test('El modelo es determinista', () => { const a = model.create(); const b = model.create(); for (let i = 0; i < 250; i++) { model.step(a, .1); model.step(b, .1); } assert(JSON.stringify(a) === JSON.stringify(b)); });
    test('Un paso de un segundo equivale a diez subpasos', () => { const a = model.create(); const b = model.create(); model.step(a, 1); for (let i = 0; i < 10; i++) model.step(b, .1); assert(Math.abs(a.temp - b.temp) < 1e-8 && a.time === b.time); });
    test('Entradas no finitas se normalizan sin propagar NaN', () => { const s = model.create(); s.temp = NaN; s.heat = Infinity; s.threshold = NaN; model.step(s, NaN); assert(Number.isFinite(s.temp) && Number.isFinite(s.heat) && Number.isFinite(s.threshold)); });
    test('Pausar el tiempo no avanza la física', () => { const s = model.create(); model.step(s, 0); assert(s.time === 0 && s.temp === 32); });
    test('Reiniciar conserva el objeto y restablece sus valores', () => { const s = model.create(); model.step(s, 1); assert(model.reset(s) === s && JSON.stringify(s) === JSON.stringify(model.create())); });
    return results;
  };
}(window.NEXO));
