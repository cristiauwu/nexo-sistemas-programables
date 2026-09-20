// content/learning-guide.js
(function (N) {
  'use strict';
  N.content.learningGuide = {
    sensores: [
      { summary: 'Un sensor convierte algo del mundo real en una señal. Una salida discreta dice «sí o no». Una analógica dice «cuánto».', steps: ['Mueve el nivel del depósito.', 'Observa que el voltaje cambia poco a poco, pero el estado cambia de golpe.', 'Cambia el umbral y predice cuándo aparecerá el 1.'], takeaway: 'Detectar un límite no es lo mismo que medir un valor.' },
      { summary: 'Un sensor óptico necesita luz para detectar. Un inductivo busca metal. Un capacitivo puede notar materiales como agua o plástico. Cada principio tiene límites.', steps: ['Selecciona una pieza del sensor para conocer su función.', 'Compara los tres recorridos del haz.', 'Cambia el material y la distancia: busca una condición en la que el sensor falle.'], takeaway: 'No existe un sensor que detecte cualquier cosa en cualquier condición.' },
      { summary: 'La temperatura puede cambiar una resistencia o generar una tensión. La presión deforma una membrana. El sensor convierte ese cambio en una lectura.', steps: ['Sube la temperatura y compara las cuatro curvas.', 'Observa el aviso cuando una tecnología sale de su rango.', 'En presión, cambia la referencia sin cambiar la presión del proceso.'], takeaway: 'Una medida solo tiene sentido si conoces su rango, sus unidades y su referencia.' },
      { summary: 'Ahora elige qué usarías en situaciones concretas. No importa solo acertar: importa explicar por qué.', steps: [], takeaway: 'Si una respuesta te sorprende, vuelve al banco y compruébala.' }
    ],
    actuadores: [
      { summary: 'El controlador da la orden. La fuente aporta la energía. El actuador hace el trabajo: mover, empujar, iluminar o emitir sonido.', steps: ['Selecciona una familia.', 'Sigue la energía desde la entrada hasta el efecto.', 'Distingue un mecanismo que transmite movimiento de una fuente que lo produce.'], takeaway: 'Una señal pequeña puede controlar una carga grande, pero no la alimenta por sí sola.' },
      { summary: 'Los siete dispositivos convierten electricidad en acciones diferentes. Elige uno, actívalo y después retira su alimentación.', steps: ['Solicita una acción.', 'Desmarca la alimentación de potencia.', 'Observa por qué una orden sin energía no basta.'], takeaway: 'Orden y alimentación son dos cosas distintas.' },
      { summary: 'Un paso a paso avanza cuando recibe impulsos. En otros motores regulamos el giro cambiando su alimentación mediante un controlador apropiado.', steps: ['Envía un solo pulso y observa el cambio de posición.', 'Invierte el sentido o aumenta la frecuencia.', 'Prueba una carga excesiva: ordenar un paso no garantiza que ocurra.'], takeaway: 'El controlador necesita realimentación si debe comprobar la posición real.' },
      { summary: 'Un mecanismo convierte un giro en desplazamiento. En hidráulica, la presión ayuda a producir fuerza y el caudal determina qué tan rápido se mueve.', steps: ['Da una vuelta al husillo y observa cuánto avanza.', 'Aumenta el área del cilindro y compara fuerza y velocidad.', 'Abre la válvula: sin diferencia de presión, abrir no equivale a bombear.'], takeaway: 'Más fuerza no significa necesariamente más velocidad.' },
      { summary: 'El actuador correcto depende del trabajo y de las condiciones. Compara opciones, decide qué importa más y revisa por qué se descartan las otras.', steps: ['Elige una estación de la planta.', 'Ajusta las necesidades del proceso.', 'Lee la recomendación y comprueba sus límites.'], takeaway: 'Una buena elección incluye una explicación y reconoce sus límites.' }
    ]
  };
  N.content.glossary = [
    ['Transducción', 'Convertir una magnitud física en otra señal que podamos utilizar.'],
    ['Umbral', 'Valor a partir del cual cambia una decisión.'],
    ['Histéresis', 'Separación entre el valor de encendido y el de apagado para evitar cambios repetidos cerca del límite.'],
    ['Realimentación', 'Volver a medir el resultado para corregir la acción.'],
    ['Driver o etapa de potencia', 'Circuito que usa una orden de control para entregar energía a una carga.'],
    ['Caudal', 'Volumen de fluido que pasa por unidad de tiempo.'],
    ['Par', 'Efecto de una fuerza que hace girar un eje.'],
    ['PWM', 'Encender y apagar rápidamente una salida para regular su valor medio.'],
    ['Deslizamiento', 'Diferencia relativa entre el giro del campo y el del rotor en un motor de inducción.'],
    ['Junta fría', 'Punto de referencia del termopar cuya temperatura necesitamos conocer.']
  ];
}(window.NEXO));
