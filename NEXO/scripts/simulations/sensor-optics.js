// Modelos cualitativos para aprendizaje; no especificaciones de un sensor real.
(function (N) {
  'use strict';
  if (!N) throw new Error('Carga el registro NEXO antes de la simulación óptica.');
  N.Simulations = N.Simulations || {};
  N.Models = N.Models || {};
  var serial = 0;
  var mounts = new WeakMap();
  var parts = {
    emisor: ['Emisor · LED modulado', 'El LED emite pulsos de luz visible o infrarroja. El receptor busca esa modulación para distinguirla de parte de la luz ambiental. No proporciona inmunidad absoluta: sol intenso, saturación, suciedad o interferencias pueden impedir una detección fiable.'],
    receptor: ['Receptor · de luz a fotocorriente', 'Un fotodiodo convierte la luz recibida en fotocorriente. La electrónica amplifica, filtra y compara la señal con un umbral. Aquí se representa la señal útil con un índice de 0 a 100, no con amperios ni con una medida de iluminancia.'],
    lentes: ['Lentes · dirigir y recoger', 'La óptica concentra la emisión y recoge luz hacia el receptor. La alineación, la apertura, la suciedad y el tamaño del objeto cambian la señal disponible. Una lente no garantiza detectar cualquier superficie ni elimina los reflejos especulares.'],
    salida: ['Salida · etapa eléctrica y lógica', 'NPN hunde corriente hacia 0 V: la carga se conecta entre +V y la salida. PNP suministra corriente desde +V: la carga se conecta entre salida y 0 V. NO/NC decide cuándo conduce y es independiente de NPN/PNP. Una salida desactivada no equivale necesariamente a una tensión de 0 V.']
  };
  var materials = {
    acero: { label: 'Acero', inductive: 0.72, capacitive: 0.70, ir: 0.61 },
    aluminio: { label: 'Aluminio', inductive: 0.48, capacitive: 0.68, ir: 0.48 },
    plastico: { label: 'Plástico', inductive: 0, capacitive: 0.45, ir: 0.64 },
    madera: { label: 'Madera', inductive: 0, capacitive: 0.38, ir: 0.58 },
    agua: { label: 'Agua', inductive: 0, capacitive: 0.86, ir: 0.16 },
    vidrio: { label: 'Vidrio', inductive: 0, capacitive: 0.50, ir: 0.20 }
  };
  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function num(value, fallback, min, max) {
    var parsed = Number(value);
    return Number.isFinite(parsed) ? clamp(parsed, min, max) : fallback;
  }
  function owns(map, key) { return Object.prototype.hasOwnProperty.call(map, key); }
  function percent(value) { return Math.round(value) + ' / 100'; }
  function fixed(value) { return value.toFixed(2).replace('.', ','); }

  // Puras: devuelven resultados nuevos, sin DOM ni estado compartido mutable.
  function anatomyModel(light, threshold, transistor, logic) {
    var detected = light >= threshold;
    var active = logic === 'nc' ? !detected : detected;
    return {
      detected: detected,
      active: active,
      detail: !active ? 'Transistor sin conducir; tensión de salida dependiente de la carga y del circuito.' :
        transistor === 'npn' ? 'NPN conduce: hunde corriente hacia 0 V. Carga entre +V y salida.' :
          'PNP conduce: suministra corriente desde +V. Carga entre salida y 0 V.'
    };
  }

  function opticalModes(input) {
    var mode = ['barrera', 'retro', 'difuso'].indexOf(input.mode) >= 0 ? input.mode : 'barrera';
    var surface = ['claro', 'oscuro', 'brillante', 'transparente'].indexOf(input.surface) >= 0 ? input.surface : 'claro';
    var distance = num(input.distance, 40, 0, 100) / 100;
    var ambient = num(input.ambient, 15, 0, 100);
    var present = !!input.present;
    var signal;
    var reason;
    if (mode === 'barrera') {
      signal = (100 - 45 * distance) * (present ? (surface === 'transparente' ? 0.78 : 0.03) : 1) - ambient * 0.35;
      reason = present ? (surface === 'transparente' ? 'El objeto transparente deja pasar gran parte del haz.' : 'El objeto opaco interrumpe el trayecto entre emisor y receptor separados.') : 'Sin objeto, el receptor debe recibir el haz directo.';
    } else if (mode === 'retro') {
      var transmission = !present ? 1 : surface === 'transparente' ? 0.75 : surface === 'brillante' ? 0.82 : 0.03;
      signal = (94 - 55 * distance) * transmission - ambient * 0.32;
      reason = !present ? 'El reflector devuelve el haz al receptor situado junto al emisor.' : surface === 'brillante' ?
        'La superficie brillante puede devolver luz y confundirse con el reflector; este modelo no incluye polarización.' : surface === 'transparente' ?
          'La atenuación del objeto transparente puede ser insuficiente para distinguirlo del reflector.' : 'El objeto bloquea la ida y el retorno del reflector.';
    } else {
      var reflectance = { claro: 1, oscuro: 0.26, brillante: 0.34, transparente: 0.12 }[surface];
      signal = (present ? 98 * reflectance / (1 + 4 * distance * distance) : 0) - ambient * 0.25;
      reason = !present ? 'Sin objeto no hay retorno útil en este escenario sin fondo.' : surface === 'claro' ?
        'La superficie clara dispersa parte de la emisión hacia el receptor.' : surface === 'oscuro' ?
          'La superficie oscura absorbe gran parte de la luz y reduce el retorno.' : surface === 'brillante' ?
            'En esta orientación, el reflejo especular se desvía del receptor.' : 'El vidrio u otro objeto transparente transmite gran parte de la emisión; vuelve poca luz.';
    }
    signal = clamp(signal, 0, 100);
    var light = signal >= 35;
    var detected = mode === 'difuso' ? light : !light;
    var success = detected === present;
    reason += ' La distancia relativa reduce el margen; la luz ambiental resta señal útil en este modelo simplificado.';
    if (!success) reason += present ? ' Fallo: objeto presente no detectado.' : ' Fallo: indicación de objeto aunque el trayecto está libre.';
    else reason += present ? ' Éxito: objeto detectado.' : ' Éxito: ausencia de objeto reconocida.';
    return { mode: mode, signal: signal, light: light, detected: detected, success: success, reason: reason };
  }
  N.Models.opticalModes = opticalModes;

  function proximityModel(input, previous) {
    var material = materials[input.material] || materials.acero;
    var distance = num(input.distance, 45, 0, 100) / 100;
    var sensitivity = num(input.sensitivity, 50, 0, 100) / 100;
    var wall = !!input.wall;
    var damp = !!input.damp;
    var glossy = !!input.glossy;
    var background = (wall ? 0.38 : 0) + (damp ? 0.35 : 0);
    var capMasked = background * (0.6 + sensitivity) >= 0.80;
    var ranges = {
      inductive: Math.max(0, material.inductive - (wall ? 0.08 : 0)),
      capacitive: clamp(material.capacitive * (0.45 + sensitivity) - (wall ? 0.10 : 0) + (damp ? 0.12 : 0), 0, 0.94),
      ir: wall ? 0 : material.ir * (glossy ? 0.52 : 1)
    };
    var notes = {
      inductive: material.inductive === 0 ? 'No metálico: no produce la respuesta inductiva prevista.' :
        'Las corrientes inducidas en el metal modifican el oscilador; el aluminio tiene aquí menos alcance que el acero.',
      capacitive: 'Detecta cambios de capacitancia; el agua y los metales tienen aquí una respuesta mayor que la madera seca.',
      ir: 'IR activo: emite infrarrojo y mide el retorno. No es PIR, que responde pasivamente a variaciones de radiación térmica.'
    };
    if (wall) {
      notes.inductive += ' El plástico no es una pantalla metálica, pero la pared añade separación en este escenario.';
      notes.capacitive += ' Una pared plástica fina puede permitir detectar el contenido y también contribuir a la señal.';
      notes.ir += ' La pared elegida es opaca al infrarrojo: bloquea el retorno del material; no todos los plásticos lo son.';
    }
    if (damp) notes.capacitive += ' La humedad eleva la respuesta aparente y puede provocar falsas activaciones.';
    if (glossy && !wall) notes.ir += ' El acabado brillante desvía el reflejo fuera del receptor en esta orientación.';
    if (capMasked) notes.capacitive += ' ADVERTENCIA: pared húmeda y sensibilidad alta activan por fondo, no por detección fiable del material.';
    return ['inductive', 'capacitive', 'ir'].map(function (key) {
      var range = ranges[key];
      var on = Math.max(0, range - 0.04);
      var off = Math.min(1, range + 0.04);
      var forced = key === 'capacitive' && capMasked;
      var active = forced || (range > 0 && (previous[key] ? distance <= off : distance <= on));
      return { key: key, active: !!active, range: range, on: on, off: off, forced: forced, note: notes[key] };
    });
  }

  function rangeControl(id, key, label, value, help) {
    return '<div><label for="' + id + key + '">' + label + '</label>' +
      '<input id="' + id + key + '" data-optics="' + key + '" type="range" min="0" max="100" step="1" value="' + value + '" aria-describedby="' + id + key + '-help">' +
      '<output for="' + id + key + '" data-optics="' + key + '-value">' + value + ' / 100</output>' +
      '<p class="sensor-note" id="' + id + key + '-help">' + help + '</p></div>';
  }
  function checkbox(id, key, label) {
    return '<div><input type="checkbox" id="' + id + key + '" data-optics="' + key + '"><label for="' + id + key + '">' + label + '</label></div>';
  }
  function svgStart(id, title, description) {
    return '<svg viewBox="0 0 600 260" role="img" aria-labelledby="' + id + '-title ' + id + '-desc" font-family="sans-serif" font-size="14" fill="var(--text)">' +
      '<title id="' + id + '-title">' + title + '</title><desc id="' + id + '-desc">' + description + '</desc>' +
      '<defs><marker id="' + id + '-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="var(--cyan)"/></marker></defs>';
  }
  function ray(id, path, weak) {
    return '<path d="' + path + '" fill="none" stroke="var(--cyan)" stroke-width="3"' + (weak ? ' stroke-dasharray="5 6" opacity="0.5"' : '') + ' marker-end="url(#' + id + '-arrow)"/>';
  }
  function box(x, y, w, h, label, selected) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="9" fill="var(--surface)" stroke="' + (selected ? 'var(--amber)' : 'var(--line)') + '" stroke-width="' + (selected ? 4 : 2) + '"/>' +
      '<text x="' + (x + w / 2) + '" y="' + (y + h / 2 + 5) + '" text-anchor="middle">' + label + '</text>';
  }
  function anatomySvg(id, part, result) {
    return svgStart(id, 'Anatomía de un sensor fotoeléctrico', 'Emisión y recepción en ramas separadas. Lentes dirigen la luz. El receptor alimenta al comparador y a la salida. Pieza seleccionada: ' + parts[part][0] + '.') +
      box(20, 50, 112, 52, 'LED / emisor', part === 'emisor') +
      box(190, 40, 88, 65, 'Lente', part === 'lentes') +
      ray(id, 'M132 76H188', false) + ray(id, 'M280 76H420', false) +
      '<text x="350" y="48" text-anchor="middle">Emisión pulsada</text>' +
      '<path d="M426 70V162" stroke="var(--muted)" stroke-dasharray="4 5" fill="none"/><text x="450" y="114">Trayecto</text><text x="450" y="134">externo</text>' +
      ray(id, 'M420 145H280', false) + box(190, 115, 88, 60, 'Lente', part === 'lentes') +
      ray(id, 'M188 145H134', false) + box(20, 120, 112, 52, 'Fotodiodo', part === 'receptor') +
      '<path d="M76 174V219H188M352 219H422" stroke="var(--muted)" stroke-width="2" fill="none"/>' +
      box(190, 195, 160, 46, 'Filtro + umbral', false) + box(425, 195, 150, 46, 'Salida = ' + (result.active ? '1' : '0'), part === 'salida') + '</svg>';
  }
  function modeSvg(id, input, result) {
    var mode = result.mode;
    var objectX = mode === 'difuso' ? 235 + Math.round(input.distance * 2.4) : 295;
    var desc = mode === 'barrera' ? 'Emisor a la izquierda y receptor separado a la derecha.' : mode === 'retro' ?
      'Emisor y receptor juntos a la izquierda; reflector a la derecha; trayectos de ida y vuelta.' :
      'Emisor y receptor juntos a la izquierda; solo el objeto devuelve luz; sin reflector.';
    var svg = svgStart(id, 'Geometría: ' + mode, desc + ' ' + (input.present ? 'Objeto presente.' : 'Objeto ausente.') + ' Señal útil ' + Math.round(result.signal) + ' sobre 100.') +
      '<text x="20" y="25">' + (mode === 'barrera' ? 'Dos unidades enfrentadas' : mode === 'retro' ? 'Retorno desde reflector' : 'Retorno desde el objeto') + '</text>';
    if (mode === 'barrera') {
      svg += box(20, 95, 120, 70, 'Emisor', false) + box(460, 95, 120, 70, 'Receptor', false);
      svg += ray(id, 'M142 130H' + (input.present ? objectX : 458), false);
      if (input.present) svg += ray(id, 'M' + (objectX + 28) + ' 130H458', true);
    } else {
      svg += box(20, 68, 140, 125, '', false) + '<text x="90" y="102" text-anchor="middle">Emisor</text><text x="90" y="172" text-anchor="middle">Receptor</text>';
      if (mode === 'retro') {
        svg += '<path d="M518 65L540 85L518 105L540 125L518 145L540 165L518 185" fill="none" stroke="var(--amber)" stroke-width="4"/><text x="535" y="212" text-anchor="middle">Reflector</text>';
        svg += ray(id, 'M162 95H' + (input.present ? objectX : 514), false);
        if (input.present) svg += ray(id, 'M' + (objectX + 28) + ' 95H514', true);
        svg += ray(id, 'M516 163H162', input.present && input.surface !== 'brillante');
        if (input.present && input.surface === 'brillante') svg += ray(id, 'M' + objectX + ' 105L163 160', false);
      } else {
        svg += ray(id, 'M162 95L' + objectX + ' 127', false);
        if (input.present) svg += ray(id, 'M' + objectX + ' 147L162 163', !result.light);
        else svg += '<text x="380" y="192" text-anchor="middle">Sin objeto: sin retorno</text>';
        if (input.present && input.surface === 'brillante') svg += '<path d="M' + objectX + ' 129L' + (objectX + 75) + ' 60" stroke="var(--amber)" stroke-width="2" stroke-dasharray="5 5"/><text x="350" y="48">Reflejo fuera del receptor</text>';
      }
    }
    if (input.present) svg += '<rect x="' + objectX + '" y="80" width="28" height="100" fill="var(--amber)" fill-opacity="' + (input.surface === 'transparente' ? '0.18' : '0.65') + '" stroke="var(--amber)" stroke-width="2"/><text x="' + (objectX + 14) + '" y="211" text-anchor="middle">Objeto</text>';
    return svg + '<text x="20" y="245">Línea discontinua: retorno débil o transmisión parcial · esquema no a escala</text></svg>';
  }
  function proximitySvg(id, input, results) {
    var x = 255 + Math.round(input.distance * 2.6);
    var svg = svgStart(id, 'Tres tecnologías frente al mismo material', 'Inductivo, capacitivo e infrarrojo activo a una distancia normalizada común. Los resultados detallados están en las tres tarjetas.') +
      '<text x="20" y="24">Mismo material · misma distancia relativa</text>';
    results.forEach(function (result, index) {
      var y = 48 + index * 65;
      svg += box(20, y, 145, 44, ['Inductivo', 'Capacitivo', 'IR activo'][index], result.active);
      svg += '<path d="M168 ' + (y + 22) + 'H' + x + '" stroke="var(--cyan)" stroke-width="2" stroke-dasharray="' + (result.active ? '10 3' : '3 7') + '" fill="none"/>';
      svg += '<text x="180" y="' + (y + 14) + '">' + (result.active ? '1 · activo' : '0 · inactivo') + '</text>';
    });
    if (input.wall) svg += '<rect x="232" y="42" width="15" height="182" fill="var(--surface)" stroke="var(--amber)"/><text x="240" y="246" text-anchor="middle">Pared plástica</text>';
    svg += '<rect x="' + x + '" y="42" width="35" height="182" fill="var(--surface)" stroke="var(--cyan)" stroke-width="3"/><text x="' + (x + 17) + '" y="246" text-anchor="middle">' + materials[input.material].label + '</text>';
    return svg + '</svg>';
  }

  N.Simulations.opticsMarkup = function () {
    var id = 'optics-' + (++serial) + '-';
    return `<div class="sensor-lab" data-optics-lab="${id}">
      <section class="sensor-experiment" aria-labelledby="${id}anatomy-heading">
        <p class="sensor-eyebrow">01 / ANATOMÍA Y CONMUTACIÓN</p><h3 id="${id}anatomy-heading">De la luz a una salida binaria</h3>
        <div class="experiment-grid"><div class="sensor-controls">
          <div class="sensor-buttons" role="group" aria-label="Explorar las piezas del sensor">
            ${Object.keys(parts).map(function (key) { return '<button type="button" class="sensor-button" data-optics-part="' + key + '" aria-pressed="' + (key === 'emisor') + '" aria-controls="' + id + 'part-description">' + ({ emisor: 'Emisor', receptor: 'Receptor', lentes: 'Lentes', salida: 'Salida' }[key]) + '</button>'; }).join('')}
          </div>
          ${rangeControl(id, 'light', 'Luz útil recibida', 65, 'Índice relativo tras el filtrado; no lux. Detección cuando señal ≥ umbral.')}
          ${rangeControl(id, 'threshold', 'Umbral de comparación', 50, 'Umbral de 0 a 100. Este primer experimento no aplica histéresis.')}
          <label for="${id}transistor">Tipo eléctrico</label><select id="${id}transistor" data-optics="transistor"><option value="npn">NPN · hunde corriente</option><option value="pnp">PNP · suministra corriente</option></select>
          <label for="${id}logic">Lógica de salida</label><select id="${id}logic" data-optics="logic"><option value="no">NO · activa con detección</option><option value="nc">NC · activa sin detección</option></select>
          <p class="sensor-note">Convención local: «detección» significa luz útil ≥ umbral. En barrera o retro la presencia de un objeto puede significar precisamente pérdida de luz; la lógica NO/NC debe referirse al evento especificado por el fabricante.</p>
        </div><div class="sensor-visual"><div data-optics="anatomy-svg"></div>
          <div class="sensor-details" id="${id}part-description" aria-live="polite"><h4 data-optics="part-title"></h4><p data-optics="part-text"></p></div>
          <div class="sensor-readouts" aria-live="polite" aria-atomic="true"><p class="sensor-reading">Comparador <strong data-optics="comparison"></strong></p><p class="sensor-reading">Salida binaria <strong data-optics="binary"></strong></p><p class="sensor-result" data-optics="electrical"></p></div>
          <p class="sensor-note">1 = transistor conduciendo; 0 = sin conducir. NPN/PNP no invierte la lógica NO/NC. NO/NC describe aquí la función del transistor alimentado, no contactos mecánicos ni seguridad ante fallos.</p>
        </div></div>
      </section>
      <section class="sensor-experiment" aria-labelledby="${id}modes-heading">
        <p class="sensor-eyebrow">02 / GEOMETRÍA ÓPTICA</p><h3 id="${id}modes-heading">Tres maneras de encontrar un objeto</h3>
        <div class="experiment-grid"><div class="sensor-controls">
          <label for="${id}mode">Modo óptico</label><select id="${id}mode" data-optics="mode"><option value="barrera">Barrera · emisor y receptor separados</option><option value="retro">Retroreflectivo · con reflector</option><option value="difuso">Difuso · retorno del objeto</option></select>
          ${checkbox(id, 'present', 'Objeto presente en el trayecto')}
          ${rangeControl(id, 'distance', 'Distancia relativa', 40, 'Barrera: separación E–R. Retro: sensor–reflector. Difuso: sensor–objeto. 0 = cercano; 100 = lejano dentro de cada escenario, nunca metros comunes.')}
          <label for="${id}surface">Superficie del objeto</label><select id="${id}surface" data-optics="surface"><option value="claro">Clara y mate</option><option value="oscuro">Oscura y mate</option><option value="brillante">Brillante / especular</option><option value="transparente">Transparente</option></select>
          ${rangeControl(id, 'ambient', 'Luz ambiental', 15, 'Mayor luz ambiental reduce el margen útil en esta simplificación; no simula todas las interferencias ni la saturación real.')}
        </div><div class="sensor-visual"><div data-optics="modes-svg"></div>
          <div class="sensor-readouts" aria-live="polite" aria-atomic="true"><p class="sensor-reading">Señal útil <strong data-optics="mode-signal"></strong></p><p class="sensor-reading">Presencia estimada <strong data-optics="mode-detected"></strong></p><p class="sensor-result" data-optics="mode-result"></p><p data-optics="mode-reason"></p></div>
          <details class="sensor-details"><summary>Reglas y límites del modelo</summary><p>Barrera y retro indican objeto si la señal cae por debajo de 35/100; difuso indica objeto si alcanza 35/100. En igualdad se considera luz recibida. Un trayecto roto sin objeto puede producir una falsa presencia; un transparente puede no cortar suficiente luz.</p><p>La distancia y el ambiente reducen señal; las superficies oscuras o transparentes reducen el retorno difuso. El acabado brillante puede engañar al retro sin polarización, o desviar el retorno difuso. Se supone alineación inicial correcta, objeto que cubre el haz y ausencia de fondo en difuso.</p><p>Los coeficientes son didácticos, no alcances universales, probabilidades ni recomendaciones de instalación. Sensores polarizados, de supresión de fondo o específicos para transparentes pueden comportarse de otra manera.</p></details>
        </div></div>
      </section>
      <section class="sensor-experiment" aria-labelledby="${id}proximity-heading">
        <p class="sensor-eyebrow">03 / MATERIAL, ENTORNO Y MEMORIA</p><h3 id="${id}proximity-heading">Inductivo, capacitivo e IR activo</h3>
        <div class="experiment-grid"><div class="sensor-controls">
          <label for="${id}material">Material del objeto, siempre presente</label><select id="${id}material" data-optics="material">${Object.keys(materials).map(function (key) { return '<option value="' + key + '">' + materials[key].label + '</option>'; }).join('')}</select>
          ${rangeControl(id, 'proximity-distance', 'Distancia normalizada común', 45, 'Se muestra de 0,00 a 1,00 en una escala didáctica compartida, sin conversión a mm. Acerca y aleja para observar la memoria.')}
          ${rangeControl(id, 'sensitivity', 'Sensibilidad capacitiva', 50, 'Solo modifica el capacitivo. Aumentarla puede ampliar la respuesta y aumentar las activaciones por humedad o pared.')}
          ${checkbox(id, 'wall', 'Interponer pared plástica fina, opaca al IR')}
          ${checkbox(id, 'damp', 'Entorno húmedo / condensación')}
          ${checkbox(id, 'glossy', 'Acabado brillante: reflejo fuera del receptor IR')}
          <p class="sensor-note">Se conservan tres estados independientes. Cada sensor enciende al acercarse hasta R − 0,04 y apaga al alejarse más allá de R + 0,04. Entre límites conserva su estado; los límites se recortan a 0–1. Sin respuesta al material, la salida es 0.</p>
        </div><div class="sensor-visual"><div data-optics="proximity-svg"></div><p class="sensor-result" data-optics="proximity-summary" aria-live="polite" aria-atomic="true"></p><p class="sensor-note">Los alcances relativos no comparan productos reales. Inductivo no detecta todos los metales por igual; capacitivo depende de geometría, dieléctrico y ajuste; IR activo depende del retorno óptico, no del calor corporal.</p></div></div>
        <div class="sensor-grid">${['inductive', 'capacitive', 'ir'].map(function (key, index) { return '<article class="sensor-card"><h4>' + ['Inductivo', 'Capacitivo', 'IR activo · no PIR'][index] + '</h4><p class="sensor-reading">Salida <strong data-optics="' + key + '-state"></strong></p><p data-optics="' + key + '-range"></p><p data-optics="' + key + '-band"></p><p class="sensor-note" data-optics="' + key + '-note"></p></article>'; }).join('')}</div>
        <details class="sensor-details"><summary>Qué significa detectar detrás de una pared</summary><p>La pared no convierte una señal en identificación de material. El capacitivo puede responder al contenido, a la propia pared o a la humedad. En este modelo, pared y humedad con sensibilidad alta fuerzan una activación por fondo. El IR de esta comparación busca el material detrás de la pared: se omite deliberadamente el posible retorno de la propia pared.</p><p>La humedad solo altera aquí el canal capacitivo; una instalación real también puede sufrir corrosión, suciedad o empañamiento en otras tecnologías. Los cambios de material, pared o ajuste conservan la memoria previa y aplican inmediatamente los nuevos límites.</p></details>
      </section>
    </div>`;
  };

  N.Simulations.mountOptics = function (root) {
    if (!root || !root.querySelector || !root.addEventListener) throw new TypeError('mountOptics requiere un elemento raíz.');
    var lab = root.matches && root.matches('[data-optics-lab]') ? root : root.querySelector('[data-optics-lab]');
    if (!lab) throw new Error('Inserta opticsMarkup() antes de llamar a mountOptics(root).');
    if (mounts.has(lab)) mounts.get(lab)();
    var id = lab.getAttribute('data-optics-lab');
    var nodes = {};
    lab.querySelectorAll('[data-optics]').forEach(function (node) { nodes[node.getAttribute('data-optics')] = node; });
    var part = 'emisor';
    var previous = { inductive: false, capacitive: false, ir: false };
    var disposed = false;
    var labels = { inductive: 'Inductivo', capacitive: 'Capacitivo', ir: 'IR activo' };
    function text(key, value) { nodes[key].textContent = value; }
    function number(key) { return num(nodes[key].value, 0, 0, 100); }
    function rangeValue(key, normalized) {
      var value = number(key);
      var label = normalized ? fixed(value / 100) + ' · normalizada' : percent(value);
      text(key + '-value', label);
      nodes[key].setAttribute('aria-valuetext', label);
      return value;
    }
    function renderAnatomy() {
      var light = rangeValue('light');
      var threshold = rangeValue('threshold');
      var result = anatomyModel(light, threshold, nodes.transistor.value, nodes.logic.value);
      lab.querySelectorAll('[data-optics-part]').forEach(function (button) {
        button.setAttribute('aria-pressed', String(button.getAttribute('data-optics-part') === part));
      });
      text('part-title', parts[part][0]);
      text('part-text', parts[part][1]);
      text('comparison', result.detected ? '1 · luz ≥ umbral' : '0 · luz < umbral');
      text('binary', result.active ? '1 · conduce' : '0 · no conduce');
      text('electrical', result.detail);
      nodes['anatomy-svg'].innerHTML = anatomySvg(id + 'anatomy', part, result);
    }
    function renderModes() {
      var input = { mode: nodes.mode.value, present: nodes.present.checked, distance: rangeValue('distance'), surface: nodes.surface.value, ambient: rangeValue('ambient') };
      var result = opticalModes(input);
      text('mode-signal', percent(result.signal) + ' · umbral 35');
      text('mode-detected', result.detected ? '1 · objeto' : '0 · trayecto libre');
      text('mode-result', result.success ? 'ÉXITO · coincide con la presencia real' : 'FALLO · no coincide con la presencia real');
      text('mode-reason', result.reason);
      nodes['modes-svg'].innerHTML = modeSvg(id + 'mode', input, result);
    }
    function renderProximity() {
      var input = { material: owns(materials, nodes.material.value) ? nodes.material.value : 'acero', distance: rangeValue('proximity-distance', true), sensitivity: rangeValue('sensitivity'), wall: nodes.wall.checked, damp: nodes.damp.checked, glossy: nodes.glossy.checked };
      var results = proximityModel(input, previous);
      results.forEach(function (result) {
        previous[result.key] = result.active;
        text(result.key + '-state', result.active ? '1 · activo' : '0 · inactivo');
        text(result.key + '-range', result.range > 0 ? 'R relativo: ' + fixed(result.range) : 'Sin alcance útil para este escenario.');
        text(result.key + '-band', result.forced ? 'Activación por fondo: no confirma el material.' : result.range > 0 ?
          'Enciende con d ≤ ' + fixed(result.on) + '; apaga con d > ' + fixed(result.off) + '. Entre ambos, memoria.' : 'La banda de histéresis no aplica sin señal útil.');
        text(result.key + '-note', result.note);
      });
      text('proximity-summary', materials[input.material].label + ' · d = ' + fixed(input.distance / 100) + '. ' + results.map(function (result) { return labels[result.key] + ': ' + (result.active ? '1' : '0') + (result.forced ? ' (fondo, no objeto)' : ''); }).join(' · '));
      nodes['proximity-svg'].innerHTML = proximitySvg(id + 'proximity', input, results);
    }
    function onControl(event) {
      if (disposed || !lab.contains(event.target)) return;
      var key = event.target.getAttribute && event.target.getAttribute('data-optics');
      if (!key || !event.target.matches('input, select')) return;
      if (['light', 'threshold', 'transistor', 'logic'].indexOf(key) >= 0) renderAnatomy();
      else if (['mode', 'present', 'distance', 'surface', 'ambient'].indexOf(key) >= 0) renderModes();
      else if (['material', 'proximity-distance', 'sensitivity', 'wall', 'damp', 'glossy'].indexOf(key) >= 0) renderProximity();
    }
    function onClick(event) {
      if (disposed || !event.target.closest) return;
      var button = event.target.closest('[data-optics-part]');
      if (!button || !lab.contains(button)) return;
      var next = button.getAttribute('data-optics-part');
      if (!owns(parts, next)) return;
      part = next;
      renderAnatomy();
    }
    function cleanup() {
      if (disposed) return;
      disposed = true;
      root.removeEventListener('input', onControl);
      root.removeEventListener('change', onControl);
      root.removeEventListener('click', onClick);
      mounts.delete(lab);
    }
    renderAnatomy();
    renderModes();
    renderProximity();
    root.addEventListener('input', onControl);
    root.addEventListener('change', onControl);
    root.addEventListener('click', onClick);
    mounts.set(lab, cleanup);
    return cleanup;
  };
}(window.NEXO));
