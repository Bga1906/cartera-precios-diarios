/**
 * MOLDE COMUN DE LA FOTO DIARIA (F3, 25/10/2026). Es identico en todos los Sheets (fondos, cripto, Trade Republic, Mexem...).
 * Sin cifras personales ni ids de Drive: el id de la carpeta se guarda en las propiedades del script (CARPETA_DATOS_ID).
 *
 * Que guarda, en la subcarpeta «fotos» de la carpeta de datos del Sheet (privada, en el Drive de Brian):
 *   libro_<sheet>.json       copia en bruto del libro (se sobrescribe cada dia: es la libreta)
 *   historial_<sheet>.json   serie diaria recalculada (se sobrescribe cada dia: es el album actualizado)
 *   foto_<sheet>_AAAA-MM-DD.json   foto congelada del dia: NUNCA se sobrescribe
 *
 * Reglas de la foto: una por dia (hora de Madrid), la crea la primera pasada a partir de las 07:00;
 * si ya existe, no se toca. Formato foto_cartera/v1 (ver DISENO_F3.md). El validador gemelo esta en foto_cartera.py.
 */
var FOTO_FORMATO = 'foto_cartera/v1';
var LIBRO_FORMATO = 'libro_cartera/v1';
var HISTORIAL_FORMATO = 'historial_cartera/v1';

var FOTO_CFG = {
  TZ: 'Europe/Madrid',
  HORA_MIN: 7,
  SUBCARPETA: 'fotos',
  OFICIAL_URL: 'https://raw.githubusercontent.com/Bga1906/cartera-precios-diarios/main/oficial/ultimo.json',
  UMBRAL_DIF_OFICIAL: 0.005,
  TIPOS: ['fondo', 'plan', 'accion', 'etf', 'cripto', 'materia_prima'],
  ESTADOS_PRECIO: ['ok', 'dudoso', 'respaldo', 'sin_dato', 'manual', 'sin_oficial'],
  FRESCURAS: ['OK', 'AMBAR', 'ROJO', 'SIN FECHA']
};

// ---------- utilidades ----------

/** Redondea a `dec` decimales; null si no es un numero finito. */
function fotoR_(x, dec) {
  if (typeof x !== 'number' || !isFinite(x)) return null;
  var k = Math.pow(10, dec);
  return Math.round(x * k) / k;
}

/** Dias naturales entre dos fechas AAAA-MM-DD (null si falta alguna). */
function fotoDiasEntre_(desde, hasta) {
  if (!desde || !hasta) return null;
  return Math.round((Date.parse(hasta) - Date.parse(desde)) / 86400000);
}

/** Partes de una fecha en hora de Madrid: {fecha:'AAAA-MM-DD', hora:H}. */
function fotoPartesMadrid_(d) {
  if (typeof Utilities !== 'undefined' && Utilities.formatDate) {
    return { fecha: Utilities.formatDate(d, FOTO_CFG.TZ, 'yyyy-MM-dd'), hora: Number(Utilities.formatDate(d, FOTO_CFG.TZ, 'H')) };
  }
  var f = new Intl.DateTimeFormat('en-GB', { timeZone: FOTO_CFG.TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23' });
  var p = {};
  f.formatToParts(d).forEach(function (x) { p[x.type] = x.value; });
  return { fecha: p.year + '-' + p.month + '-' + p.day, hora: Number(p.hour) };
}

function fotoIsoUtc_(d) { return d.toISOString().replace(/\.\d{3}Z$/, 'Z'); }

/** Texto canonico de un valor (claves ordenadas, numeros redondeados): mismo contenido = mismo texto. */
function fotoCanon_(v) {
  if (v === null || v === undefined) return 'null';
  if (Array.isArray(v)) return '[' + v.map(fotoCanon_).join(',') + ']';
  if (typeof v === 'object') {
    return '{' + Object.keys(v).sort().map(function (k) { return JSON.stringify(k) + ':' + fotoCanon_(v[k]); }).join(',') + '}';
  }
  if (typeof v === 'number') return isFinite(v) ? String(Math.round(v * 1e8) / 1e8) : 'null';
  return JSON.stringify(v);
}

/** Huella (cyrb53): sirve para detectar que el libro cambio entre dos fotos; no es criptografica. */
function fotoHash_(texto) {
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

function fotoEsFecha_(s) { return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s); }

/** Convierte una celda de la hoja a un valor JSON: fecha -> 'AAAA-MM-DD', vacio -> null. */
function fotoCelda_(v) {
  if (v === '' || v === null || v === undefined) return null;
  if (Object.prototype.toString.call(v) === '[object Date]') return isNaN(v.getTime()) ? null : fotoPartesMadrid_(v).fecha;
  if (typeof v === 'string') { var t = v.trim(); return t === '' ? null : t; }
  return v;
}

// ---------- precio oficial (inspector del repo) ----------

/** Entrada del vehiculo en oficial/ultimo.json, reducida a lo que usa la foto; null si no aparece. */
function fotoEstadoOficial_(oficial, id) {
  var a = oficial && oficial.activos && oficial.activos[id];
  if (!a) return null;
  return {
    estado_precio: String(a.estado_precio || 'sin_dato'),
    precio: typeof a.precio === 'number' ? a.precio : null,
    fecha_dato: a.fecha_dato || null,
    fuente_elegida: a.fuente_elegida || null,
    motivo: a.motivo || ''
  };
}

/** Descarga oficial/ultimo.json del repo publico; null si no se puede (la foto sale igual, con estado «sin_oficial»). */
function fotoDescargarOficial_() {
  try {
    var r = UrlFetchApp.fetch(FOTO_CFG.OFICIAL_URL, { muteHttpExceptions: true });
    if (r.getResponseCode() !== 200) return null;
    return JSON.parse(r.getContentText());
  } catch (e) { return null; }
}

/**
 * Contraste del precio del Sheet con el oficial. Solo es comparable si ambos son de la misma fecha real.
 * Devuelve el bloque `oficial` de la posicion y, si procede, un aviso.
 */
function fotoContrasteOficial_(precioSheet, fechaSheet, entradaOficial) {
  if (!entradaOficial) return { bloque: null, aviso: null };
  var bloque = {
    estado_precio: entradaOficial.estado_precio, precio: fotoR_(entradaOficial.precio, 6),
    fecha_dato: entradaOficial.fecha_dato, fuente_elegida: entradaOficial.fuente_elegida,
    misma_fecha: false, dif_pct: null
  };
  var aviso = null;
  if (typeof precioSheet === 'number' && entradaOficial.precio && fechaSheet && entradaOficial.fecha_dato === fechaSheet) {
    bloque.misma_fecha = true;
    bloque.dif_pct = fotoR_((precioSheet - entradaOficial.precio) / entradaOficial.precio, 6);
    if (Math.abs(bloque.dif_pct) > FOTO_CFG.UMBRAL_DIF_OFICIAL) aviso = 'dif_oficial';
  }
  return { bloque: bloque, aviso: aviso };
}

// ---------- construccion y validacion ----------

/**
 * Monta la foto. meta: {sheet, fechaFoto, ahora, versionScript, versionExportador, fuentePrecios, fechaCapturaPrecios, huella}.
 * Los totales se calculan SUMANDO las posiciones ya redondeadas, para que cuadren exactamente.
 * extras: {aportado_efectivo_eur, coste_liquido_eur?} con lo que el Sheet sabe y las posiciones no.
 */
function fotoConstruir_(meta, posiciones, extras, avisos) {
  var liquido = 0, noLiquido = 0, coste = 0, hayCoste = false;
  posiciones.forEach(function (p) {
    if (typeof p.valor_eur === 'number') { if (p.no_liquido) noLiquido += p.valor_eur; else liquido += p.valor_eur; }
    if (!p.no_liquido && typeof p.coste_eur === 'number') { coste += p.coste_eur; hayCoste = true; }
  });
  var aportado = fotoR_(extras && extras.aportado_efectivo_eur, 2);
  liquido = fotoR_(liquido, 2); noLiquido = fotoR_(noLiquido, 2);
  return {
    formato: FOTO_FORMATO,
    sheet: meta.sheet,
    fecha_foto: meta.fechaFoto,
    generado_utc: fotoIsoUtc_(meta.ahora),
    version_script: String(meta.versionScript || ''),
    version_exportador: String(meta.versionExportador || ''),
    fuente_precios: meta.fuentePrecios || 'precios',
    fecha_captura_precios: meta.fechaCapturaPrecios || null,
    huella: meta.huella,
    totales: {
      valor_liquido_eur: liquido,
      valor_no_liquido_eur: noLiquido,
      valor_total_eur: fotoR_(liquido + noLiquido, 2),
      aportado_efectivo_eur: aportado,
      coste_liquido_eur: hayCoste ? fotoR_(coste, 2) : null,
      resultado_liquido_eur: aportado === null ? null : fotoR_(liquido - aportado, 2)
    },
    posiciones: posiciones,
    avisos: avisos || []
  };
}

/** Lista de errores de formato de una foto (vacia = valida). Gemelo de validar_foto() en foto_cartera.py. */
function fotoValidar_(f) {
  var e = [];
  function esNumOnull(x) { return x === null || (typeof x === 'number' && isFinite(x)); }
  if (!f || typeof f !== 'object') return ['la foto no es un objeto'];
  if (f.formato !== FOTO_FORMATO) e.push('formato distinto de ' + FOTO_FORMATO);
  if (typeof f.sheet !== 'string' || !f.sheet) e.push('falta sheet');
  if (!fotoEsFecha_(f.fecha_foto)) e.push('fecha_foto no es AAAA-MM-DD');
  if (typeof f.generado_utc !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(f.generado_utc)) e.push('generado_utc no es ISO con Z');
  if (typeof f.version_script !== 'string') e.push('falta version_script');
  if (typeof f.version_exportador !== 'string' || !f.version_exportador) e.push('falta version_exportador');
  if (['precios', 'oficial'].indexOf(f.fuente_precios) < 0) e.push('fuente_precios debe ser precios u oficial');
  if (f.fecha_captura_precios !== null && !fotoEsFecha_(f.fecha_captura_precios)) e.push('fecha_captura_precios invalida');
  if (!f.huella || typeof f.huella.hash !== 'string' || !f.huella.hash) e.push('falta huella.hash');
  var t = f.totales;
  if (!t || typeof t !== 'object') { e.push('faltan totales'); t = {}; }
  ['valor_liquido_eur', 'valor_no_liquido_eur', 'valor_total_eur'].forEach(function (k) {
    if (typeof t[k] !== 'number' || !isFinite(t[k])) e.push('totales.' + k + ' debe ser numero');
  });
  ['aportado_efectivo_eur', 'coste_liquido_eur', 'resultado_liquido_eur'].forEach(function (k) {
    if (!esNumOnull(t[k])) e.push('totales.' + k + ' debe ser numero o null');
  });
  if (!Array.isArray(f.posiciones)) { e.push('posiciones no es lista'); return e; }
  if (!Array.isArray(f.avisos)) e.push('avisos no es lista');
  var ids = {}, sumL = 0, sumN = 0;
  f.posiciones.forEach(function (p, i) {
    var n = 'posicion ' + i + (p && p.id ? ' (' + p.id + ')' : '');
    if (!p || typeof p !== 'object') { e.push(n + ': no es objeto'); return; }
    if (typeof p.id !== 'string' || !p.id) e.push(n + ': falta id'); else if (ids[p.id]) e.push(n + ': id repetido'); else ids[p.id] = true;
    if (typeof p.nombre !== 'string' || !p.nombre) e.push(n + ': falta nombre');
    if (FOTO_CFG.TIPOS.indexOf(p.tipo) < 0) e.push(n + ': tipo invalido');
    if (typeof p.moneda !== 'string' || !p.moneda) e.push(n + ': falta moneda');
    ['cantidad', 'precio', 'precio_eur', 'valor_eur', 'coste_eur'].forEach(function (k) {
      if (!esNumOnull(p[k])) e.push(n + ': ' + k + ' debe ser numero o null');
    });
    if (p.fecha_precio !== null && !fotoEsFecha_(p.fecha_precio)) e.push(n + ': fecha_precio invalida');
    if (FOTO_CFG.ESTADOS_PRECIO.indexOf(p.estado_precio) < 0) e.push(n + ': estado_precio invalido');
    if (p.frescura !== null && FOTO_CFG.FRESCURAS.indexOf(p.frescura) < 0) e.push(n + ': frescura invalida');
    if (p.dias_desfase !== null && !(typeof p.dias_desfase === 'number' && isFinite(p.dias_desfase))) e.push(n + ': dias_desfase debe ser numero o null');
    if (typeof p.estado_coste !== 'string') e.push(n + ': falta estado_coste');
    if (typeof p.no_liquido !== 'boolean') e.push(n + ': no_liquido debe ser booleano');
    if (!Array.isArray(p.avisos)) e.push(n + ': avisos no es lista');
    if (p.oficial !== null && (typeof p.oficial !== 'object' || Array.isArray(p.oficial))) e.push(n + ': oficial debe ser objeto o null');
    if (typeof p.valor_eur === 'number') { if (p.no_liquido) sumN += p.valor_eur; else sumL += p.valor_eur; }
  });
  if (typeof t.valor_liquido_eur === 'number' && Math.abs(sumL - t.valor_liquido_eur) > 0.011) e.push('valor_liquido_eur no cuadra con las posiciones');
  if (typeof t.valor_no_liquido_eur === 'number' && Math.abs(sumN - t.valor_no_liquido_eur) > 0.011) e.push('valor_no_liquido_eur no cuadra con las posiciones');
  if (typeof t.valor_total_eur === 'number' && Math.abs(t.valor_liquido_eur + t.valor_no_liquido_eur - t.valor_total_eur) > 0.011) e.push('valor_total_eur no es liquido + no liquido');
  return e;
}

// ---------- guardado ----------

/**
 * Guarda los tres ficheros. `almacen` = {existe(nombre), escribir(nombre, texto), crear(nombre, texto)}.
 * libro e historial se sobrescriben; la foto SOLO se crea si no existe y si ya son las 07:00 (salvo opts.forzarHora).
 * Devuelve {foto: 'creada'|'ya_existia'|'antes_de_hora', nombre}.
 */
function fotoGuardar_(almacen, sheet, foto, libro, historial, ahora, opts) {
  opts = opts || {};
  var errores = fotoValidar_(foto);
  if (errores.length) throw new Error('foto invalida: ' + errores.join('; '));
  almacen.escribir('libro_' + sheet + '.json', JSON.stringify(libro, null, 1));
  almacen.escribir('historial_' + sheet + '.json', JSON.stringify(historial, null, 1));
  var nombre = 'foto_' + sheet + '_' + foto.fecha_foto + '.json';
  if (almacen.existe(nombre)) return { foto: 'ya_existia', nombre: nombre };
  if (fotoPartesMadrid_(ahora).hora < FOTO_CFG.HORA_MIN && !opts.forzarHora) return { foto: 'antes_de_hora', nombre: nombre };
  almacen.crear(nombre, JSON.stringify(foto, null, 1));
  return { foto: 'creada', nombre: nombre };
}

/**
 * Almacen sobre Drive: subcarpeta «fotos» dentro de la carpeta de datos del Sheet.
 * La carpeta de datos se toma de la propiedad del script CARPETA_DATOS_ID; si no esta, se localiza por el nombre
 * de un fichero de referencia que ya vive alli (p. ej. datos_sheet_fondos.json) y se guarda la propiedad.
 */
function fotoAlmacenDrive_(archivoReferencia) {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('CARPETA_DATOS_ID'), padre;
  if (id) {
    padre = DriveApp.getFolderById(id);
  } else {
    var it = DriveApp.getFilesByName(archivoReferencia);
    if (!it.hasNext()) throw new Error('No encuentro ' + archivoReferencia + ' en Drive. Guarda el id de la carpeta de datos en la propiedad del script CARPETA_DATOS_ID.');
    var padres = it.next().getParents();
    if (!padres.hasNext()) throw new Error(archivoReferencia + ' no esta dentro de ninguna carpeta.');
    padre = padres.next();
    props.setProperty('CARPETA_DATOS_ID', padre.getId());
  }
  var sub = padre.getFoldersByName(FOTO_CFG.SUBCARPETA);
  var carpeta = sub.hasNext() ? sub.next() : padre.createFolder(FOTO_CFG.SUBCARPETA);
  return {
    existe: function (n) { return carpeta.getFilesByName(n).hasNext(); },
    escribir: function (n, t) {
      var it2 = carpeta.getFilesByName(n);
      if (it2.hasNext()) it2.next().setContent(t); else carpeta.createFile(n, t, MimeType.PLAIN_TEXT);
    },
    crear: function (n, t) {
      if (carpeta.getFilesByName(n).hasNext()) throw new Error('ya existe ' + n);
      carpeta.createFile(n, t, MimeType.PLAIN_TEXT);
    }
  };
}
