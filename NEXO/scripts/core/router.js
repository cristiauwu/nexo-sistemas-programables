// scripts/core/router.js
(function (N) {
  'use strict';
  let dispose = () => {};
  let currentPath = '';
  const root = document.getElementById('contenido');
  N.core.renderRoute = function (first = false) {
    const fragment = window.location.hash;
    // El enlace de salto es un ancla accesible, no una ruta de la aplicación.
    if (fragment === '#contenido' && currentPath) return;
    const path = fragment.replace(/^#\/?/, '') || 'inicio';
    const parts = path.split('/');
    const id = parts[0];
    if (path === currentPath) return;
    dispose();
    currentPath = path;
    const module = N.modules.find((item) => item.id === id);
    const valid = Boolean(module) && (parts.length === 1 || (id === 'inicio' && parts.length === 2 && parts[1] === 'experimento'));
    root.innerHTML = !valid ? N.ui.notFound() : id === 'inicio' ? N.ui.home() : id === 'sensores' ? N.ui.sensorLesson() : id === 'actuadores' ? N.ui.actuatorLesson() : id === 'integracion' ? N.ui.integrationLesson() : N.ui.lesson(module);
    document.title = valid ? `${module.label} — NEXO · Sistemas Programables` : 'Ruta no encontrada — NEXO';
    document.body.dataset.route = valid ? id : '404';
    document.querySelectorAll('#primary-nav a').forEach((link) => {
      if (valid && link.dataset.route === id) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    document.querySelector('.menu-toggle').setAttribute('aria-expanded', 'false');
    document.getElementById('primary-nav').classList.remove('is-open');
    const cleanups = [];
    if (valid && id === 'inicio') cleanups.push(N.Simulations.mountThermal(document.getElementById('thermal-root')));
    if (valid && id === 'sensores') cleanups.push(N.ui.mountSensorLesson(root));
    if (valid && id === 'actuadores') cleanups.push(N.ui.mountActuatorLesson(root));
    if (valid && id === 'inicio') cleanups.push(N.ui.mountEditorialHome(root));
    if (valid && id === 'integracion') cleanups.push(N.ui.mountIntegrationLesson(root));
    cleanups.push(N.core.motion.observeSections(root));
    dispose = () => cleanups.forEach((cleanup) => { if (typeof cleanup === 'function') cleanup(); });
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (!first) root.querySelector('h1')?.focus({ preventScroll: true });
    N.core.motion.enter(root);
    if (valid && parts[1] === 'experimento') N.core.motion.jump('laboratorio');
  };
  window.addEventListener('hashchange', () => N.core.renderRoute());
}(window.NEXO));
