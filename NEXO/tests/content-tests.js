// tests/content-tests.js
(function (N) {
  'use strict';
  N.runContentTests = function () {
    const results = [];
    const test = (name, passed) => results.push({ name, passed: Boolean(passed), message: passed ? '' : 'Revisar registro o contenido' });
    test('Los identificadores del registro son únicos', new Set(N.modules.map((m) => m.id)).size === N.modules.length);
    test('Todas las rutas tienen identificadores seguros', N.modules.every((m) => /^[a-z0-9-]+$/.test(m.id)));
    test('Todos los estados tienen etiqueta definida', N.modules.every((m) => N.statusLabels[m.status]));
    test('Cada módulo no futuro tiene contenido', N.modules.filter((m) => m.status !== 'planned').every((m) => N.content[m.id]));
    test('Los 20 puntos de sensores están en el mapa, no declarados completos', N.content.sensores.sections.reduce((sum, s) => sum + s.tags.length, 0) === 20);
    test('Sensores, actuadores e integración disponibles; temas III y IV planificados', ['sensores', 'actuadores', 'integracion'].every((id) => N.modules.find((m) => m.id === id)?.status === 'available') && ['microcontroladores', 'programacion'].every((id) => N.modules.find((m) => m.id === id)?.status === 'planned'));
    test('Tema III y IV permanecen previstos', N.modules.filter((m) => m.status === 'planned').length === 2);
    test('Las secciones tienen título y descripción', ['sensores', 'actuadores', 'integracion'].every((id) => N.content[id].sections.every((s) => s.title && (s.text || s.paragraphs?.length))));
    return results;
  };
}(window.NEXO));
