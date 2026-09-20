// scripts/core/motion.js
(function (N) {
  'use strict';
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  N.core.motion = {
    reduced: () => preference.matches,
    enter(element) {
      if (!preference.matches && element.animate) {
        element.animate([{ opacity: .5, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 280, easing: 'ease-out' });
      }
    },
    jump(id) {
      const target = document.getElementById(id);
      if (!target) return;
      const focusTarget = target.querySelector('h2') || target;
      if (!focusTarget.hasAttribute('tabindex')) focusTarget.setAttribute('tabindex', '-1');
      focusTarget.focus({ preventScroll: true });
      target.scrollIntoView({ behavior: preference.matches ? 'instant' : 'smooth', block: 'start' });
    },
    observeSections(root) {
      if (!('IntersectionObserver' in window)) return () => {};
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          root.querySelectorAll('.section-link').forEach((button) => {
            if (button.dataset.jump === entry.target.id) button.setAttribute('aria-current', 'location');
            else button.removeAttribute('aria-current');
          });
        });
      }, { rootMargin: '-10% 0px -55% 0px', threshold: 0 });
      root.querySelectorAll('.lesson-section').forEach((section) => observer.observe(section));
      return () => observer.disconnect();
    }
  };
}(window.NEXO));
