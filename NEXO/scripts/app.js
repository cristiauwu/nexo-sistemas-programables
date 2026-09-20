// scripts/app.js
(function (N) {
  'use strict';
  const escape = N.ui.escape;
  const nav = document.getElementById('primary-nav');
  const menuButton = document.querySelector('.menu-toggle');
  nav.innerHTML = N.modules.filter((module) => module.status !== 'planned').map((module) => `<a href="#/${escape(module.id)}" data-route="${escape(module.id)}"><span class="nav-code" aria-hidden="true">${escape(module.code)}</span>${escape(module.label)}</a>`).join('');
  menuButton.addEventListener('click', () => {
    const opened = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(opened));
    nav.classList.toggle('is-open', opened);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
      menuButton.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
      menuButton.focus();
    }
  });
  const dialog = document.getElementById('guide-dialog');
  let dialogTrigger;
  document.addEventListener('click', (event) => {
    const jump = event.target.closest('[data-jump]');
    if (jump) N.core.motion.jump(jump.dataset.jump);
    const help = event.target.closest('[data-help]');
    if (help) { dialogTrigger = help; dialog.showModal(); }
    if (event.target.closest('[data-close]')) dialog.close();
  });
  dialog.addEventListener('close', () => dialogTrigger?.focus());
  document.querySelector('.skip-link').addEventListener('click', (event) => {
    event.preventDefault();
    const main = document.getElementById('contenido');
    main.focus();
    main.scrollIntoView({ block: 'start' });
  });
  N.core.renderRoute(true);
}(window.NEXO));
