// scripts/config/modules.js
(function (N) {
  'use strict';
  N.modules = [
    { id: 'inicio', label: 'Inicio', code: '00', status: 'available', accent: 'lime' },
    { id: 'sensores', label: 'Sensores', code: '01', chapter: 'TEMA I', status: 'available', accent: 'cyan', symbol: 'sensor', description: 'El mundo físico se convierte en información.', preview: 'Luz / temperatura / presión' },
    { id: 'actuadores', label: 'Actuadores', code: '02', chapter: 'TEMA II', status: 'available', accent: 'amber', symbol: 'actuator', description: 'Una orden se convierte en movimiento y acción.', preview: 'Movimiento / fuerza / energía' },
    { id: 'integracion', label: 'Integración', code: '03', chapter: 'LABORATORIO', status: 'available', accent: 'lime', symbol: 'loop', description: 'Conecta lo que percibes con lo que controlas.', preview: 'Sensor / controlador / actuador' },
    { id: 'microcontroladores', label: 'Microcontroladores', code: '04', chapter: 'TEMA III', status: 'planned', accent: 'muted', description: 'La inteligencia dentro del sistema.' },
    { id: 'programacion', label: 'Programación de microcontroladores', code: '05', chapter: 'TEMA IV', status: 'planned', accent: 'muted', description: 'Del algoritmo al comportamiento físico.' }
  ];
  // Estados posibles de un módulo. 'building' queda disponible para un tema en curso.
  N.statusLabels = { available: 'Disponible', building: 'En construcción', planned: 'Próximamente' };
}(window.NEXO));
