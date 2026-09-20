// content/home.js
window.NEXO.content.inicio = {
  title: 'Una señal cambia lo que ocurre.',
  intro: 'Una máquina no adivina. Percibe el entorno, toma una decisión y transforma energía en acción. Descubre el recorrido de esa señal.',
  stages: [
    { number: '01', title: 'Percibe.', role: 'SENSOR', text: 'Convierte una magnitud física, como la temperatura, en una señal que el controlador puede interpretar.' },
    { number: '02', title: 'Decide.', role: 'CONTROLADOR', text: 'Evalúa la señal mediante una lógica programada. Un umbral y una regla pueden cambiar lo que hará el sistema.' },
    { number: '03', title: 'Actúa.', role: 'ACTUADOR', text: 'Recibe la orden a través de una etapa de potencia y utiliza energía para modificar el proceso.' }
  ],
  challenges: [
    { title: 'Provoca una respuesta.', text: 'Aumenta el aporte térmico y espera. Cuando la temperatura alcance el umbral, observa qué elementos cambian.' },
    { title: 'Rompe la realimentación.', text: 'Selecciona lazo abierto. La lectura sigue visible, pero ya no decide el encendido del ventilador: ahora lo decides tú.' },
    { title: 'Busca la diferencia.', text: 'Vuelve a lazo cerrado. El ventilador se apaga 2 °C por debajo del umbral: esa separación es la histéresis y evita conmutaciones excesivas.' }
  ]
};
