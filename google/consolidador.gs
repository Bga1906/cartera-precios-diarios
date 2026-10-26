/**
 * CONSOLIDADOR DE FOTOS (F4, 26/10/2026) — proyecto de Apps Script INDEPENDIENTE (propio; no va dentro de ningun Sheet).
 *
 * Que hace: lee las fotos de cada vehiculo en la carpeta privada «TITAN datos Sheet/fotos» de Drive y escribe ahi
 * `foto_consolidada_AAAA-MM-DD.json`, la foto de sintesis que leera titan-mcp. La secretaria solo junta y cita:
 * NUNCA reescribe una foto original, ni inventa una fecha, ni calcula nada salvo el total global.
 *
 * SIN DATOS PERSONALES: este codigo no lleva cifras, cuentas, ids de Drive ni nombres de posiciones. El id de la carpeta
 * se guarda en las propiedades del script (funcion `configurar`). Lo unico que toca es `foto_consolidada_*.json`:
 * no borra nada, no envia nada fuera de Drive.
 *
 * Funciones que veras en el desplegable del editor:
 *   configurar()       una sola vez: localiza la carpeta «fotos» y guarda su id.
 *   ensayo()           hace todo menos escribir: muestra en el registro que saldria. Seguro de ejecutar cuando quieras.
 *   consolidarFotos()  la que ejecutan los dos disparadores diarios (08-09 h y 11-12 h, hora de Madrid).
 *
 * Reglas (diseno F4, apartados 2 a 7):
 *  - Cada vehiculo por separado (fondos, cripto, tr, ibkr). Si falta uno, los demas entran. La consolidada se crea siempre.
 *  - Nunca se inventa la fecha: sin foto de hoy entra su ultima foto VALIDA con su fecha real («atrasado»); sin ninguna, «ausente».
 *  - Foto creada por Google (origen sheet): «al dia» solo si es de hoy; si no, «atrasado» y aviso (falta 1 dia).
 *  - Foto provisional del vault (origen vault_provisional): «al dia» con 0 o 1 dia; «atrasado» desde 2; aviso desde 7.
 *  - Un fichero ilegible, invalido o con huella que no cuadra se trata como si no existiera, con aviso. Si hay otra
 *    anterior VALIDA, entra esa como «atrasado» (con su fecha real); solo si no hay ninguna queda «ausente».
 *  - Comprobacion interna de cada foto: formato y totales = suma de sus posiciones (liquido, no liquido y total). Si no
 *    cuadra, la foto cuenta como mala (regla anterior).
 *  - LA HUELLA: aqui solo se recalcula en las provisionales (cripto, tr, ibkr). La de fondos NO se puede recalcular en Google:
 *    se copia tal cual a la consolidada y se verifica en el PC (parte 3: vigilancia del vault), no aqui.
 *  - Dos intentos: antes de las 12:00 (Madrid) una consolidada INCOMPLETA se sustituye solo si el nuevo resultado tiene mas
 *    datos y ningun vehiculo empeora; una COMPLETA no se toca nunca; desde las 12:00 no se sustituye nada.
 *  - Autocomprobacion antes de escribir: suma de vehiculos = total y nº de posiciones = suma de las originales; formato valido.
 *    Si no cuadra NO escribe y falla (Google envia el correo de error). Tras escribir, relee y comprueba.
 *
 * Contrato con el vault: los nombres de fichero foto_<fichero>_AAAA-MM-DD.json y el campo `sheet` de cada foto son el
 * contrato; si se anade un vehiculo, se anade a CONS_CFG.VEHICULOS. Validador gemelo en Python: consolidada_validador.py.
 */
var CONS_FORMATO = 'foto_cartera/v1';

var CONS_CFG = {
  TZ: 'Europe/Madrid',
  VERSION: 'consolidador/1',
  CARPETA_DATOS: 'TITAN datos Sheet',
  SUBCARPETA: 'fotos',
  PROP_CARPETA_FOTOS: 'CARPETA_FOTOS_ID',
  PREFIJO_SALIDA: 'foto_consolidada_',
  HORA_SEGUNDO_INTENTO: 10,   // antes de esta hora (Madrid) cuenta como 1.er intento
  HORA_CIERRE: 12,            // desde esta hora ya no se sustituye ninguna consolidada
  PROVISIONAL_AL_DIA_MAX: 1,  // dias
  PROVISIONAL_AVISO: 7,       // dias
  TOLERANCIA: 0.011,
  VEHICULOS: [
    { clave: 'fondos', fichero: 'fondos', nombre: 'Fondos y plan de pensiones' },
    { clave: 'cripto', fichero: 'cripto', nombre: 'Cripto' },
    { clave: 'tr', fichero: 'tr', nombre: 'Trade Republic' },
    { clave: 'ibkr', fichero: 'ibkr', nombre: 'IBKR' }
  ],
  TIPOS: ['fondo', 'plan', 'accion', 'etf', 'cripto', 'materia_prima'],
  ESTADOS_PRECIO: ['ok', 'dudoso', 'respaldo', 'sin_dato', 'manual', 'sin_oficial'],
  FRESCURAS: ['OK', 'AMBAR', 'ROJO', 'SIN FECHA'],
  FUENTES_PRECIOS: ['precios', 'oficial'],
  ESTADOS_VEHICULO: ['al_dia', 'atrasado', 'ausente'],
  ORIGENES: ['sheet', 'vault_provisional']
};

// ---------- utilidades ----------

function consR_(x, dec) {
  if (typeof x !== 'number' || !isFinite(x)) return null;
  var k = Math.pow(10, dec);
  return Math.round(x * k) / k;
}

function consEsFecha_(s) {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  var d = new Date(s + 'T00:00:00Z');
  return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

/** Dias naturales entre dos fechas AAAA-MM-DD (null si falta alguna). */
function consDiasEntre_(desde, hasta) {
  if (!desde || !hasta) return null;
  return Math.round((Date.parse(hasta) - Date.parse(desde)) / 86400000);
}

/** Partes de una fecha en hora de Madrid: {fecha:'AAAA-MM-DD', hora:H}. */
function consPartesMadrid_(d) {
  if (typeof Utilities !== 'undefined' && Utilities.formatDate) {
    return { fecha: Utilities.formatDate(d, CONS_CFG.TZ, 'yyyy-MM-dd'), hora: Number(Utilities.formatDate(d, CONS_CFG.TZ, 'H')) };
  }
  var f = new Intl.DateTimeFormat('en-GB', { timeZone: CONS_CFG.TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23' });
  var p = {};
  f.formatToParts(d).forEach(function (x) { p[x.type] = x.value; });
  return { fecha: p.year + '-' + p.month + '-' + p.day, hora: Number(p.hour) };
}

function consIsoUtc_(d) { return d.toISOString().replace(/\.\d{3}Z$/, 'Z'); }

function consCopia_(x) { return JSON.parse(JSON.stringify(x)); }

function consLog_(t) {
  if (typeof Logger !== 'undefined' && Logger.log) Logger.log(t);
  else if (typeof console !== 'undefined') console.log(t);
}

function consDias_(n) { return n + (n === 1 ? ' dia' : ' dias'); }

/** Texto canonico de un valor (claves ordenadas, numeros redondeados): mismo contenido = mismo texto. IGUAL que fotoCanon_ de F3. */
function consCanon_(v) {
  if (v === null || v === undefined) return 'null';
  if (Array.isArray(v)) return '[' + v.map(consCanon_).join(',') + ']';
  if (typeof v === 'object') {
    return '{' + Object.keys(v).sort().map(function (k) { return JSON.stringify(k) + ':' + consCanon_(v[k]); }).join(',') + '}';
  }
  if (typeof v === 'number') return isFinite(v) ? String(Math.round(v * 1e8) / 1e8) : 'null';
  return JSON.stringify(v);
}

/** Huella (cyrb53): detecta que algo cambio; no es criptografica. IGUAL que fotoHash_ de F3. */
function consHash_(texto) {
  var h1 = 0xdeadbeef, h2 = 0x41c6ce57, ch, i;
  for (i = 0; i < texto.length; i++) {
    ch = texto.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 'c53:' + (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
}

/** Huella de una foto PROVISIONAL recalculada desde su propio contenido (id, cantidad, desde cuando, fuente de la cantidad). */
function consHuellaProvisional_(f) {
  var entradas = f.posiciones.map(function (p) {
    var of = p.oficial || {};
    return {
      id: p.id,
      cantidad: p.cantidad,
      desde: of.cantidad_desde === undefined ? null : of.cantidad_desde,
      fuente: of.fuente_cantidad === undefined ? null : of.fuente_cantidad
    };
  });
  return consHash_(consCanon_({ posiciones: entradas }));
}

// ---------- validacion (gemela de foto_cartera.py: acepta fotos sin fecha_cierre) ----------

function consNum_(x) { return typeof x === 'number' && isFinite(x); }
function consNumONull_(x) { return x === null || consNum_(x); }
function consTiene_(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }
function consFechaONulo_(x) { return x === undefined || x === null || consEsFecha_(x); }

/** Errores de formato de una foto de vehiculo (lista vacia = valida). */
function consFotoValidar_(f) {
  var e = [];
  if (!f || typeof f !== 'object' || Array.isArray(f)) return ['la foto no es un objeto'];
  if (f.formato !== CONS_FORMATO) e.push('formato distinto de ' + CONS_FORMATO);
  if (typeof f.sheet !== 'string' || !f.sheet) e.push('falta sheet');
  if (!consEsFecha_(f.fecha_foto)) e.push('fecha_foto no es AAAA-MM-DD');
  if (!consFechaONulo_(f.fecha_cierre)) e.push('fecha_cierre debe ser AAAA-MM-DD o null');
  if (typeof f.generado_utc !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(f.generado_utc)) e.push('generado_utc no es ISO con Z');
  if (typeof f.version_script !== 'string') e.push('falta version_script');
  if (typeof f.version_exportador !== 'string' || !f.version_exportador) e.push('falta version_exportador');
  if (CONS_CFG.FUENTES_PRECIOS.indexOf(f.fuente_precios) < 0) e.push('fuente_precios debe ser precios u oficial');
  if (!consFechaONulo_(f.fecha_captura_precios)) e.push('fecha_captura_precios invalida');
  if (!f.huella || typeof f.huella.hash !== 'string' || !f.huella.hash) e.push('falta huella.hash');
  var t = f.totales;
  if (!t || typeof t !== 'object') { e.push('faltan totales'); t = {}; }
  ['valor_liquido_eur', 'valor_no_liquido_eur', 'valor_total_eur'].forEach(function (k) {
    if (!consNum_(t[k])) e.push('totales.' + k + ' debe ser numero');
  });
  ['aportado_efectivo_eur', 'coste_liquido_eur', 'resultado_liquido_eur'].forEach(function (k) {
    if (!consTiene_(t, k) || !consNumONull_(t[k])) e.push('totales.' + k + ' debe ser numero o null');
  });
  if (!Array.isArray(f.posiciones)) { e.push('posiciones no es lista'); return e; }
  if (!Array.isArray(f.avisos)) e.push('avisos no es lista');
  var ids = {}, sumL = 0, sumN = 0;
  f.posiciones.forEach(function (p, i) {
    var n = 'posicion ' + i + (p && p.id ? ' (' + p.id + ')' : '');
    if (!p || typeof p !== 'object' || Array.isArray(p)) { e.push(n + ': no es objeto'); return; }
    if (typeof p.id !== 'string' || !p.id) e.push(n + ': falta id');
    else if (ids[p.id]) e.push(n + ': id repetido');
    else ids[p.id] = true;
    if (typeof p.nombre !== 'string' || !p.nombre) e.push(n + ': falta nombre');
    if (CONS_CFG.TIPOS.indexOf(p.tipo) < 0) e.push(n + ': tipo invalido');
    if (typeof p.moneda !== 'string' || !p.moneda) e.push(n + ': falta moneda');
    ['cantidad', 'precio', 'precio_eur', 'valor_eur', 'coste_eur'].forEach(function (k) {
      if (!consTiene_(p, k) || !consNumONull_(p[k])) e.push(n + ': ' + k + ' debe ser numero o null');
    });
    if (!consFechaONulo_(p.fecha_precio)) e.push(n + ': fecha_precio invalida');
    if (CONS_CFG.ESTADOS_PRECIO.indexOf(p.estado_precio) < 0) e.push(n + ': estado_precio invalido');
    if (p.frescura !== undefined && p.frescura !== null && CONS_CFG.FRESCURAS.indexOf(p.frescura) < 0) e.push(n + ': frescura invalida');
    if (p.dias_desfase !== undefined && p.dias_desfase !== null && !consNum_(p.dias_desfase)) e.push(n + ': dias_desfase debe ser numero o null');
    if (typeof p.estado_coste !== 'string') e.push(n + ': falta estado_coste');
    if (typeof p.no_liquido !== 'boolean') e.push(n + ': no_liquido debe ser booleano');
    if (!Array.isArray(p.avisos)) e.push(n + ': avisos no es lista');
    if (p.oficial !== undefined && p.oficial !== null && (typeof p.oficial !== 'object' || Array.isArray(p.oficial))) e.push(n + ': oficial debe ser objeto o null');
    if (consNum_(p.valor_eur)) { if (p.no_liquido === true) sumN += p.valor_eur; else sumL += p.valor_eur; }
  });
  if (consNum_(t.valor_liquido_eur) && Math.abs(sumL - t.valor_liquido_eur) > CONS_CFG.TOLERANCIA) e.push('valor_liquido_eur no cuadra con las posiciones');
  if (consNum_(t.valor_no_liquido_eur) && Math.abs(sumN - t.valor_no_liquido_eur) > CONS_CFG.TOLERANCIA) e.push('valor_no_liquido_eur no cuadra con las posiciones');
  if (consNum_(t.valor_liquido_eur) && consNum_(t.valor_no_liquido_eur) && consNum_(t.valor_total_eur) &&
      Math.abs(t.valor_liquido_eur + t.valor_no_liquido_eur - t.valor_total_eur) > CONS_CFG.TOLERANCIA) e.push('valor_total_eur no es liquido + no liquido');
  return e;
}

/** Errores de una foto CONSOLIDADA: el formato base + la cabecera ampliada + «suma de vehiculos = total» y «nº posiciones = suma de las originales». */
function consConsolidadaValidar_(c) {
  var e = consFotoValidar_(c);
  if (!c || typeof c !== 'object' || Array.isArray(c)) return e;
  if (c.sheet !== 'consolidada') e.push('sheet debe ser consolidada');
  if (typeof c.completa !== 'boolean') e.push('completa debe ser booleano');
  if (c.intento !== 1 && c.intento !== 2) e.push('intento debe ser 1 o 2');
  if (c.sustituye_a !== null && (typeof c.sustituye_a !== 'object' || Array.isArray(c.sustituye_a))) e.push('sustituye_a debe ser objeto o null');
  if (!Array.isArray(c.atrasados)) e.push('atrasados no es lista');
  if (!Array.isArray(c.ausentes)) e.push('ausentes no es lista');
  if (!Array.isArray(c.vehiculos) || !c.vehiculos.length) { e.push('vehiculos no es una lista con elementos'); return e; }
  var claves = {}, atras = [], aus = [], todosAlDia = true, nIncl = 0;
  var sumL = 0, sumN = 0, sumT = 0, sumPos = 0;
  c.vehiculos.forEach(function (v, i) {
    var n = 'vehiculo ' + i + (v && v.clave ? ' (' + v.clave + ')' : '');
    if (!v || typeof v !== 'object') { e.push(n + ': no es objeto'); return; }
    if (typeof v.clave !== 'string' || !v.clave) e.push(n + ': falta clave');
    else if (claves[v.clave]) e.push(n + ': clave repetida');
    else claves[v.clave] = v;
    if (typeof v.nombre_visible !== 'string' || !v.nombre_visible) e.push(n + ': falta nombre_visible');
    if (CONS_CFG.ESTADOS_VEHICULO.indexOf(v.estado) < 0) e.push(n + ': estado invalido');
    if (!Array.isArray(v.avisos)) e.push(n + ': avisos no es lista');
    if (v.estado !== 'al_dia') todosAlDia = false;
    if (v.estado === 'atrasado') atras.push(v.clave);
    if (v.estado === 'ausente') {
      aus.push(v.clave);
      if (v.fecha_foto !== null || v.huella !== null || v.totales !== null || v.fichero !== null || v.n_posiciones !== 0) e.push(n + ': un vehiculo ausente no lleva foto, huella ni totales');
      return;
    }
    nIncl++;
    if (typeof v.fichero !== 'string' || !v.fichero) e.push(n + ': falta fichero');
    if (!consEsFecha_(v.fecha_foto)) e.push(n + ': fecha_foto invalida');
    if (!(consNum_(v.dias_atraso) && v.dias_atraso >= 0)) e.push(n + ': dias_atraso invalido');
    if (CONS_CFG.ORIGENES.indexOf(v.origen) < 0) e.push(n + ': origen invalido');
    if (!consFechaONulo_(v.fecha_cierre)) e.push(n + ': fecha_cierre invalida');
    if (!v.huella || typeof v.huella.hash !== 'string' || !v.huella.hash) e.push(n + ': falta huella.hash');
    if (!v.totales || !consNum_(v.totales.valor_liquido_eur) || !consNum_(v.totales.valor_no_liquido_eur) || !consNum_(v.totales.valor_total_eur)) {
      e.push(n + ': totales invalidos');
    } else {
      sumL += v.totales.valor_liquido_eur; sumN += v.totales.valor_no_liquido_eur; sumT += v.totales.valor_total_eur;
    }
    if (!(typeof v.n_posiciones === 'number' && v.n_posiciones >= 0 && Math.floor(v.n_posiciones) === v.n_posiciones)) e.push(n + ': n_posiciones invalido');
    else sumPos += v.n_posiciones;
  });
  if (c.completa !== undefined && typeof c.completa === 'boolean' && c.completa !== todosAlDia) e.push('completa no coincide con el estado de los vehiculos');
  if (Array.isArray(c.atrasados) && c.atrasados.join('|') !== atras.join('|')) e.push('atrasados no coincide con los vehiculos');
  if (Array.isArray(c.ausentes) && c.ausentes.join('|') !== aus.join('|')) e.push('ausentes no coincide con los vehiculos');
  // autocomprobacion del diseno: suma de vehiculos = total
  if (c.totales && consNum_(c.totales.valor_liquido_eur) && Math.abs(sumL - c.totales.valor_liquido_eur) > CONS_CFG.TOLERANCIA) e.push('el total liquido no es la suma de los vehiculos');
  if (c.totales && consNum_(c.totales.valor_no_liquido_eur) && Math.abs(sumN - c.totales.valor_no_liquido_eur) > CONS_CFG.TOLERANCIA) e.push('el total no liquido no es la suma de los vehiculos');
  if (c.totales && consNum_(c.totales.valor_total_eur) && Math.abs(sumT - c.totales.valor_total_eur) > CONS_CFG.TOLERANCIA) e.push('el total no es la suma de los vehiculos');
  // autocomprobacion del diseno: nº de posiciones = suma de las originales
  if (Array.isArray(c.posiciones)) {
    if (c.posiciones.length !== sumPos) e.push('el nº de posiciones (' + c.posiciones.length + ') no es la suma de las originales (' + sumPos + ')');
    var porVeh = {};
    c.posiciones.forEach(function (p, i) {
      if (!p || typeof p.vehiculo !== 'string' || !claves[p.vehiculo] || claves[p.vehiculo].estado === 'ausente') e.push('posicion ' + i + ': vehiculo desconocido o ausente');
      else porVeh[p.vehiculo] = (porVeh[p.vehiculo] || 0) + 1;
    });
    Object.keys(claves).forEach(function (k) {
      if (claves[k].estado !== 'ausente' && (porVeh[k] || 0) !== claves[k].n_posiciones) e.push('vehiculo ' + k + ': tiene ' + (porVeh[k] || 0) + ' posiciones y su foto original tenia ' + claves[k].n_posiciones);
    });
  }
  return e;
}

// ---------- lectura de cada vehiculo ----------

/** Abre una foto candidata y la comprueba. Devuelve {foto, origen} o {error}. */
function consAbrirFoto_(almacen, cand, v, hoy) {
  if (cand.fecha > hoy) return { error: 'tiene fecha futura' };
  var texto, f;
  try { texto = almacen.leer(cand.nombre); } catch (err) { return { error: 'no se pudo leer' }; }
  try { f = JSON.parse(texto); } catch (err2) { return { error: 'ilegible (JSON roto)' }; }
  var errs = consFotoValidar_(f);
  if (errs.length) return { error: 'no es una foto valida (' + errs.slice(0, 2).join('; ') + ')' };
  if (f.sheet !== v.fichero) return { error: 'es de otro vehiculo (sheet=' + f.sheet + ')' };
  if (f.fecha_foto !== cand.fecha) return { error: 'la fecha de dentro (' + f.fecha_foto + ') no coincide con la del nombre' };
  var origen = (f.origen === undefined || f.origen === 'sheet') ? 'sheet' : (f.origen === 'vault_provisional' ? 'vault_provisional' : null);
  if (!origen) return { error: 'origen desconocido' };
  if (origen === 'vault_provisional' && consHuellaProvisional_(f) !== f.huella.hash) {
    return { error: 'la huella no cuadra con su contenido (¿editada a mano?)' };
  }
  return { foto: f, origen: origen };
}

/** Estado de un vehiculo segun el origen y los dias de antiguedad de su foto (diseno, apartado 4). */
function consEstado_(origen, edad) {
  if (origen === 'sheet') {
    if (edad <= 0) return { estado: 'al_dia', aviso: null };
    return { estado: 'atrasado', aviso: 'falta la foto de hoy; la ultima es de hace ' + consDias_(edad) };
  }
  if (edad <= CONS_CFG.PROVISIONAL_AL_DIA_MAX) return { estado: 'al_dia', aviso: null };
  if (edad >= CONS_CFG.PROVISIONAL_AVISO) return { estado: 'atrasado', aviso: 'foto provisional de hace ' + consDias_(edad) + ' (se avisa desde ' + CONS_CFG.PROVISIONAL_AVISO + ')' };
  return { estado: 'atrasado', aviso: null };
}

/** Lee un vehiculo: su ultima foto VALIDA de fecha <= hoy. Devuelve {entrada, foto}. */
function consLeerVehiculo_(almacen, nombres, v, hoy) {
  var re = new RegExp('^foto_' + v.fichero + '_(\\d{4}-\\d{2}-\\d{2})\\.json$');
  var cand = [], visto = {};
  nombres.forEach(function (n) {
    var m = re.exec(n);
    if (m && !visto[n]) { visto[n] = true; cand.push({ nombre: n, fecha: m[1] }); }
  });
  cand.sort(function (a, b) { return a.fecha < b.fecha ? 1 : (a.fecha > b.fecha ? -1 : 0); });
  var avisos = [], elegida = null, nombreElegido = null;
  for (var i = 0; i < cand.length && !elegida; i++) {
    var r = consAbrirFoto_(almacen, cand[i], v, hoy);
    if (r.error) avisos.push(cand[i].nombre + ': ' + r.error + '; se trata como si no existiera');
    else { elegida = r; nombreElegido = cand[i].nombre; }
  }
  if (!elegida) {
    avisos.push('sin ninguna foto valida');
    return {
      foto: null,
      entrada: { clave: v.clave, nombre_visible: v.nombre, estado: 'ausente', fichero: null, fecha_foto: null, dias_atraso: null, origen: null,
                 generado_utc: null, fecha_cierre: null, huella: null, totales: null, n_posiciones: 0, avisos: avisos }
    };
  }
  var f = elegida.foto, edad = consDiasEntre_(f.fecha_foto, hoy);
  var est = consEstado_(elegida.origen, edad);
  if (est.aviso) avisos.push(est.aviso);
  return {
    foto: f,
    entrada: {
      clave: v.clave,
      nombre_visible: (typeof f.vehiculo === 'string' && f.vehiculo) ? f.vehiculo : v.nombre,
      estado: est.estado, fichero: nombreElegido, fecha_foto: f.fecha_foto, dias_atraso: edad, origen: elegida.origen,
      generado_utc: f.generado_utc, fecha_cierre: (f.fecha_cierre === undefined ? null : f.fecha_cierre),
      huella: consCopia_(f.huella), totales: consCopia_(f.totales), n_posiciones: f.posiciones.length, avisos: avisos
    }
  };
}

// ---------- construccion ----------

/** Monta la foto consolidada. `lecturas` = [{entrada, foto}] en el orden de CONS_CFG.VEHICULOS. */
function consConstruir_(lecturas, ahora, intento) {
  var hoy = consPartesMadrid_(ahora).fecha;
  var posiciones = [], liq = 0, noLiq = 0, atras = [], aus = [], avisos = [], entradas = [], huellas = [], todosAlDia = true, nIncl = 0;
  lecturas.forEach(function (l) {
    var en = l.entrada;
    entradas.push(en);
    if (en.estado !== 'al_dia') todosAlDia = false;
    if (en.estado === 'atrasado') atras.push(en.clave);
    if (en.estado === 'ausente') aus.push(en.clave);
    en.avisos.forEach(function (a) { avisos.push('[' + en.nombre_visible + '] ' + a); });
    huellas.push({ clave: en.clave, fecha_foto: en.fecha_foto, hash: en.huella ? en.huella.hash : null });
    if (l.foto) {
      nIncl++;
      liq += l.foto.totales.valor_liquido_eur;
      noLiq += l.foto.totales.valor_no_liquido_eur;
      l.foto.posiciones.forEach(function (p) {
        var c = consCopia_(p);
        c.vehiculo = en.clave;
        posiciones.push(c);
      });
    }
  });
  liq = consR_(liq, 2); noLiq = consR_(noLiq, 2);
  return {
    formato: CONS_FORMATO,
    sheet: 'consolidada',
    origen: 'consolidador',
    fecha_foto: hoy,
    fecha_cierre: null,   // cada vehiculo trae la suya en vehiculos[].fecha_cierre; aqui no se inventa ninguna
    generado_utc: consIsoUtc_(ahora),
    version_script: CONS_CFG.VERSION,
    version_exportador: CONS_CFG.VERSION,
    fuente_precios: 'precios',
    fecha_captura_precios: null,
    huella: { vehiculos: nIncl, hash: consHash_(consCanon_({ fecha: hoy, vehiculos: huellas })) },
    totales: {
      valor_liquido_eur: liq,
      valor_no_liquido_eur: noLiq,
      valor_total_eur: consR_(liq + noLiq, 2),
      aportado_efectivo_eur: null,
      coste_liquido_eur: null,
      resultado_liquido_eur: null
    },
    completa: todosAlDia,
    intento: intento,
    sustituye_a: null,
    atrasados: atras,
    ausentes: aus,
    vehiculos: entradas,
    avisos: avisos,
    posiciones: posiciones
  };
}

// ---------- guardado: dos intentos, autocomprobacion y relectura ----------

function consRango_(estado) { return estado === 'al_dia' ? 2 : (estado === 'atrasado' ? 1 : 0); }

/** ¿La nueva tiene mas datos que la existente y ningun vehiculo empeora? */
function consHayMasDatos_(vieja, nueva) {
  var peor = false, mejor = false, porClave = {};
  vieja.vehiculos.forEach(function (x) { porClave[x.clave] = x; });
  nueva.vehiculos.forEach(function (n) {
    var o = porClave[n.clave];
    if (!o) { mejor = true; return; }
    var rn = consRango_(n.estado), ro = consRango_(o.estado);
    if (rn < ro) peor = true;
    else if (rn > ro) mejor = true;
    else if (n.fecha_foto && o.fecha_foto) {
      if (n.fecha_foto < o.fecha_foto) peor = true;
      else if (n.fecha_foto > o.fecha_foto) mejor = true;
    }
  });
  return mejor && !peor;
}

/**
 * Decide y escribe. `almacen` = {listar(), leer(n), existe(n), crear(n,t), escribir(n,t)}.
 * Devuelve {accion: 'creada'|'sustituida'|'mantenida', motivo, nombre}. Lanza si la autocomprobacion falla (y no escribe nada).
 */
function consGuardar_(almacen, c, ahora) {
  var errs = consConsolidadaValidar_(c);
  if (errs.length) throw new Error('Autocomprobacion fallida; NO se escribe nada: ' + errs.slice(0, 5).join(' | '));
  var nombre = CONS_CFG.PREFIJO_SALIDA + c.fecha_foto + '.json';
  var hora = consPartesMadrid_(ahora).hora;
  var existe = almacen.existe(nombre), previo = null, legible = true, accion, motivo;
  if (existe) {
    try {
      previo = JSON.parse(almacen.leer(nombre));
      if (!previo || typeof previo !== 'object' || !Array.isArray(previo.vehiculos) || typeof previo.completa !== 'boolean') throw new Error('forma');
    } catch (err) { previo = null; legible = false; }
  }
  if (!existe) { accion = 'creada'; motivo = 'no habia consolidada de hoy'; }
  else if (!legible) { accion = 'sustituida'; motivo = 'la consolidada existente estaba ilegible'; }
  else if (hora >= CONS_CFG.HORA_CIERRE) { return { accion: 'mantenida', motivo: 'ventana cerrada (desde las ' + CONS_CFG.HORA_CIERRE + ':00 no se sustituye)', nombre: nombre }; }
  else if (previo.completa) { return { accion: 'mantenida', motivo: 'el dia ya estaba completo', nombre: nombre }; }
  else if (consHayMasDatos_(previo, c)) { accion = 'sustituida'; motivo = 'la anterior estaba incompleta y ahora hay mas datos'; }
  else { return { accion: 'mantenida', motivo: 'sin datos nuevos (o algun vehiculo empeora)', nombre: nombre }; }
  if (accion === 'sustituida') {
    c.sustituye_a = { generado_utc: previo ? previo.generado_utc : null, intento: previo ? previo.intento : null };
    var errs2 = consConsolidadaValidar_(c);
    if (errs2.length) throw new Error('Autocomprobacion fallida; NO se escribe nada: ' + errs2.slice(0, 5).join(' | '));
  }
  var texto = JSON.stringify(c, null, 1);
  if (accion === 'creada') almacen.crear(nombre, texto); else almacen.escribir(nombre, texto);
  var releido;
  try { releido = JSON.stringify(JSON.parse(almacen.leer(nombre))); } catch (err3) { releido = null; }
  if (releido !== JSON.stringify(c)) throw new Error('Lo escrito en ' + nombre + ' no coincide con lo que debia escribirse; revisalo.');
  return { accion: accion, motivo: motivo, nombre: nombre };
}

function consResumen_(c, r) {
  return 'Consolidada ' + c.fecha_foto + ' (intento ' + c.intento + '): ' + (c.completa ? 'COMPLETA' : 'INCOMPLETA') + ' | ' +
    c.vehiculos.map(function (v) { return v.clave + '=' + v.estado + (v.fecha_foto ? '(' + v.fecha_foto + ')' : ''); }).join(', ') +
    (r ? ' | ' + r.accion + ': ' + r.motivo : '');
}

/** Nucleo, sin Drive: lo prueba Node con un almacen en memoria. opts.sinEscribir = ensayo. */
function consEjecutar_(almacen, ahora, opts) {
  opts = opts || {};
  var partes = consPartesMadrid_(ahora);
  var intento = partes.hora < CONS_CFG.HORA_SEGUNDO_INTENTO ? 1 : 2;
  var nombres = almacen.listar();
  var lecturas = CONS_CFG.VEHICULOS.map(function (v) { return consLeerVehiculo_(almacen, nombres, v, partes.fecha); });
  var c = consConstruir_(lecturas, ahora, intento);
  if (opts.sinEscribir) {
    var errores = consConsolidadaValidar_(c);
    consLog_('ENSAYO (no se escribe nada). ' + consResumen_(c, null));
    c.avisos.forEach(function (a) { consLog_('  aviso: ' + a); });
    consLog_(errores.length ? 'La autocomprobacion FALLARIA: ' + errores.join(' | ') : 'La autocomprobacion pasaria.');
    return { accion: 'ensayo', consolidada: c, errores: errores };
  }
  var r = consGuardar_(almacen, c, ahora);
  consLog_(consResumen_(c, r));
  c.avisos.forEach(function (a) { consLog_('  aviso: ' + a); });
  r.consolidada = c;
  return r;
}

// ---------- Drive (lo unico propio de Apps Script) ----------

function consAlmacenDrive_() {
  var id = PropertiesService.getScriptProperties().getProperty(CONS_CFG.PROP_CARPETA_FOTOS);
  if (!id) throw new Error('Falta configurar: ejecuta primero la funcion «configurar».');
  var carpeta = DriveApp.getFolderById(id);
  return {
    listar: function () {
      var out = [], it = carpeta.searchFiles("trashed = false and title contains 'foto_'");
      while (it.hasNext()) out.push(it.next().getName());
      return out;
    },
    leer: function (n) {
      var it = carpeta.getFilesByName(n);
      if (!it.hasNext()) throw new Error('no existe ' + n);
      return it.next().getBlob().getDataAsString('UTF-8');
    },
    existe: function (n) { return carpeta.getFilesByName(n).hasNext(); },
    crear: function (n, t) {
      if (carpeta.getFilesByName(n).hasNext()) throw new Error('ya existe ' + n);
      carpeta.createFile(n, t, MimeType.PLAIN_TEXT);
    },
    escribir: function (n, t) {
      var it = carpeta.getFilesByName(n);
      if (it.hasNext()) it.next().setContent(t); else carpeta.createFile(n, t, MimeType.PLAIN_TEXT);
    }
  };
}

/** UNA SOLA VEZ: localiza «TITAN datos Sheet/fotos» y guarda su id en las propiedades del script. */
function configurar() {
  var padres = DriveApp.getFoldersByName(CONS_CFG.CARPETA_DATOS), lista = [];
  while (padres.hasNext()) lista.push(padres.next());
  if (lista.length !== 1) throw new Error('Esperaba exactamente 1 carpeta llamada «' + CONS_CFG.CARPETA_DATOS + '» y hay ' + lista.length + '. No guardo nada.');
  var subs = lista[0].getFoldersByName(CONS_CFG.SUBCARPETA), sublista = [];
  while (subs.hasNext()) sublista.push(subs.next());
  if (sublista.length !== 1) throw new Error('Esperaba exactamente 1 subcarpeta «' + CONS_CFG.SUBCARPETA + '» y hay ' + sublista.length + '. No guardo nada.');
  PropertiesService.getScriptProperties().setProperty(CONS_CFG.PROP_CARPETA_FOTOS, sublista[0].getId());
  var n = consAlmacenDrive_().listar().length;
  consLog_('Listo: carpeta «' + CONS_CFG.CARPETA_DATOS + '/' + CONS_CFG.SUBCARPETA + '» localizada y guardada. Contiene ' + n + ' ficheros foto_*. Ahora ejecuta «ensayo».');
}

/** Hace todo menos escribir y lo cuenta en el registro de ejecucion. Seguro de ejecutar cuando quieras. */
function ensayo() {
  return consEjecutar_(consAlmacenDrive_(), new Date(), { sinEscribir: true });
}

/** La que ejecutan los dos disparadores diarios. */
function consolidarFotos() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) throw new Error('Hay otra ejecucion del consolidador en curso; vuelve a intentarlo en un minuto.');
  try {
    return consEjecutar_(consAlmacenDrive_(), new Date(), {});
  } finally {
    lock.releaseLock();
  }
}
