// scripts/core/storage.js
(function (N) {
  'use strict';
  // file:// y algunos modos privados no permiten persistencia: nunca es obligatoria.
  const memory = {};
  N.core.storage = {
    get(key, fallback) {
      try { const value = localStorage.getItem('nexo.v1.' + key); return value === null ? (memory[key] ?? fallback) : JSON.parse(value); }
      catch (_) { return memory[key] ?? fallback; }
    },
    set(key, value) {
      memory[key] = value;
      try { localStorage.setItem('nexo.v1.' + key, JSON.stringify(value)); return true; }
      catch (_) { return false; }
    }
  };
}(window.NEXO));
