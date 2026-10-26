/**
 * FOTO DIARIA DEL SHEET «CRYPTO» (F5, primer vehiculo, 27/10/2026). Necesita foto_cartera.gs (el molde comun) en el MISMO proyecto
 * de Apps Script. Solo LEE el Sheet y escribe en Drive: nunca modifica ninguna pestana. Sin cifras personales ni ids de Drive.
 *
 * Que hace, cada manana (disparador entre las 07:00 y las 08:00, hora de Madrid):
 *   foto_cripto_AAAA-MM-DD.json   foto congelada del dia (molde foto_cartera/v1, sheet = «cripto»). NUNCA se sobrescribe.
 *   libro_cripto.json             copia en bruto de «Operaciones» y «Otras criptos» (se sobrescribe cada dia)
 *   historial_cripto.json         serie diaria desde el 26/09/2026 = cantidades del libro x precios diarios del repo (se sobrescribe)
 *
 * Reglas:
 *  - PRECIO: el cierre de la captura oficial (oficial/ultimo.json del repo publico), como en fondos. El precio de Google Finance
 *    de la hoja «Exposicion» es solo orientativo y NUNCA entra en la foto.
 *  - POSICIONES: todas las filas de la tabla de «Exposicion» (desde la fila 8 hasta la fila «TOTAL»), sin ninguna lista fija. Una
 *    moneda nueva = escribir su simbolo en la columna B. Se salta una fila solo si no tiene simbolo valido, y entonces avisa.
 *  - ID: BTC = «bitcoin:btc» (el de siempre); cualquier otra moneda = «cripto:» + simbolo en minusculas (p. ej. «cripto:eth»).
 *  - COSTE: «Dinero neto puesto» de la hoja (compras - ventas en euros: flujo de caja, NO base fiscal) con coste_tipo «neto_caja».
 *    estado_coste = «cuadrado» solo para BTC y solo si la pestana «Cuadre» dice «Todos los controles cuadran» en ESTA pasada;
 *    en cualquier otro caso «sin verificar». Sin dato: coste_eur null y estado_coste «sin_dato».
 *  - Sin precio oficial valido: la posicion entra igualmente con precio y valor null, estado_precio «sin_dato» y el aviso
 *    «sin precio oficial». Nunca se inventa un precio ni se omite en silencio.
 *  - MODO (propiedad del script FOTOS_MODO): «ensayo» (por defecto) escribe en fotos/ensayo_cripto/, que el consolidador no lee;
 *    «definitivo» escribe en fotos/ con el nombre definitivo. Se cambia a mano con fotosCriptoModoDefinitivo().
 *  - Comprueba la forma de las pestanas (cabeceras y la fila TOTAL). Si cambiaron, NO genera la foto y falla con un mensaje claro
 *    (el correo de error de Google avisa); el consolidador tratara ese vehiculo como atrasado.
 *
 * Funciones que veras en el desplegable del editor:
 *   fotosCriptoConfigurar()          una sola vez: localiza «TITAN datos Sheet» y guarda su id.
 *   fotosCriptoVerSinGuardar()       hace todo menos escribir y lo cuenta en el registro. Seguro de ejecutar cuando quieras.
 *   fotosCriptoInstalarDisparador()  una sola vez: crea el disparador diario (07:00-08:00).
 *   fotosCriptoDiaria()              la que ejecuta el disparador.
 *   fotosCriptoModoDefinitivo() / fotosCriptoModoEnsayo()   cambian el modo (solo con tu «si» para el cambio definitivo).
 */
var FOTOS_CRIPTO = {
  SHEET: 'cripto',
  VEHICULO: 'Cripto',
  ID_BTC: 'bitcoin:btc',
  SIMBOLO_BTC: 'BTC',
  PREFIJO_ID: 'cripto:',
  // Forma de las pestanas (se comprueba en cada pasada)
  HOJA_EXPO: 'Exposición', EXPO_FILA_CAB: 7, EXPO_COL: 2, EXPO_NCOLS: 4, EXPO_FILAS_MAX: 150,
  EXPO_CABECERA: [[0, 'activo'], [2, 'cantidad'], [3, 'dinero neto']],
  HOJA_OPS: 'Operaciones', OPS_FILA_CAB: 5, OPS_NCOLS: 18, OPS_FILAS_MAX: 2000,
  OPS_CABECERA: [[0, 'fecha'], [2, 'tipo'], [3, 'cantidad'], [4, 'pagado']],
  OPS_ENTRADA: [0, 1, 2, 3, 4, 5, 6, 12, 13, 14, 15, 16, 17],   // columnas que TECLEAS (A-G y M-R); H-L son formulas que cambian con el precio
  HOJA_OTRAS: 'Otras criptos', OTRAS_FILA_CAB: 5, OTRAS_NCOLS: 7, OTRAS_FILAS_MAX: 2000,
  OTRAS_CABECERA: [[0, 'fecha'], [1, 'activo'], [2, 'tipo'], [3, 'cantidad'], [4, 'importe']],
  HOJA_CUADRE: 'Cuadre',
  FRASE_CUADRA: 'todos los controles cuadran',
  // Datos
  DESDE: '2026-09-26',                 // primer dia con captura oficial de precios
  MAX_DIAS_HISTORIAL: 400,
  PRECIOS_URL: 'https://raw.githubusercontent.com/Bga1906/cartera-precios-diarios/main/precios/',
  ESTADOS_OFICIAL_VALIDOS: ['ok', 'dudoso', 'respaldo'],
  COSTE_TIPO: 'neto_caja',
  CARPETA_DATOS: 'TITAN datos Sheet',
  SUB_ENSAYO: 'ensayo_cripto',
  VERSION_EXPORTADOR: 'F5.1 (2026-10-27)'
};

// ---------- utilidades ----------

/** Minusculas, sin tildes y con los espacios (y saltos de linea) colapsados: para comparar cabeceras y frases. */
function fotosCriptoNorm_(s) {
  if (s === null || s === undefined) return '';
  return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();
}

function fotosCriptoNum_(x) { return typeof x === 'number' && isFinite(x); }

/** Simbolo normalizado (mayusculas, sin espacios) o null si esta vacio o no es valido. */
function fotosCriptoSimbolo_(x) {
  if (x === null || x === undefined) return null;
  var s = String(x).trim().toUpperCase();
  return /^[A-Z0-9][A-Z0-9._-]{0,14}$/.test(s) ? s : null;
}

/** BTC conserva su id historico; el resto = «cripto:» + simbolo en minusculas. */
function fotosCriptoId_(simbolo) {
  return simbolo === FOTOS_CRIPTO.SIMBOLO_BTC ? FOTOS_CRIPTO.ID_BTC : FOTOS_CRIPTO.PREFIJO_ID + simbolo.toLowerCase();
}

function fotosCriptoSimboloDeId_(id) { return id === FOTOS_CRIPTO.ID_BTC ? 'btc' : id.replace(FOTOS_CRIPTO.PREFIJO_ID, ''); }

/** Lista de fechas AAAA-MM-DD de `desde` a `hasta` (ambas incluidas), con tope de dias. */
function fotosCriptoFechasEntre_(desde, hasta, tope) {
  var out = [], t = Date.parse(desde + 'T00:00:00Z'), fin = Date.parse(hasta + 'T00:00:00Z');
  if (isNaN(t) || isNaN(fin)) return out;
  for (; t <= fin; t += 86400000) out.push(new Date(t).toISOString().slice(0, 10));
  return tope && out.length > tope ? out.slice(out.length - tope) : out;
}

// ---------- lectura de las pestanas (lo unico que toca SpreadsheetApp) ----------

function fotosCriptoLeerHojas_() {
  var ss = SpreadsheetApp.getActive();
  function tabla(nombre, filaCab, col, ncols, filasMax) {
    var sh = ss.getSheetByName(nombre);
    if (!sh) throw new Error('Falta la pestaña «' + nombre + '». No genero la foto.');
    var ultima = Math.min(sh.getLastRow(), filaCab + filasMax);
    var n = ultima - filaCab + 1;
    if (n < 1) return { cabecera: [], filas: [] };
    var v = sh.getRange(filaCab, col, n, ncols).getValues();
    return { cabecera: v[0].map(fotoCelda_), filas: v.slice(1).map(function (r) { return r.map(fotoCelda_); }) };
  }
  var cuadre = null, c = ss.getSheetByName(FOTOS_CRIPTO.HOJA_CUADRE);
  if (c) cuadre = c.getRange(1, 1, 6, 8).getValues().reduce(function (a, r) { return a.concat(r); }, []).map(fotoCelda_);
  return {
    exposicion: tabla(FOTOS_CRIPTO.HOJA_EXPO, FOTOS_CRIPTO.EXPO_FILA_CAB, FOTOS_CRIPTO.EXPO_COL, FOTOS_CRIPTO.EXPO_NCOLS, FOTOS_CRIPTO.EXPO_FILAS_MAX),
    operaciones: tabla(FOTOS_CRIPTO.HOJA_OPS, FOTOS_CRIPTO.OPS_FILA_CAB, 1, FOTOS_CRIPTO.OPS_NCOLS, FOTOS_CRIPTO.OPS_FILAS_MAX),
    otras: tabla(FOTOS_CRIPTO.HOJA_OTRAS, FOTOS_CRIPTO.OTRAS_FILA_CAB, 1, FOTOS_CRIPTO.OTRAS_NCOLS, FOTOS_CRIPTO.OTRAS_FILAS_MAX),
    cuadre: cuadre
  };
}

/** Lanza un error claro si alguna pestana ya no tiene la forma esperada (columnas movidas, fila TOTAL desaparecida). */
function fotosCriptoComprobarForma_(raw) {
  function cab(hoja, t, esperadas) {
    var c = (t && t.cabecera) || [];
    esperadas.forEach(function (e) {
      if (fotosCriptoNorm_(c[e[0]]).indexOf(e[1]) < 0) {
        throw new Error('La pestaña «' + hoja + '» ya no tiene la forma esperada: en la columna ' + (e[0] + 1) +
          ' de la cabecera debia aparecer «' + e[1] + '» y aparece «' + (c[e[0]] === undefined || c[e[0]] === null ? '' : c[e[0]]) + '». No genero la foto.');
      }
    });
  }
  cab(FOTOS_CRIPTO.HOJA_EXPO, raw.exposicion, FOTOS_CRIPTO.EXPO_CABECERA);
  cab(FOTOS_CRIPTO.HOJA_OPS, raw.operaciones, FOTOS_CRIPTO.OPS_CABECERA);
  cab(FOTOS_CRIPTO.HOJA_OTRAS, raw.otras, FOTOS_CRIPTO.OTRAS_CABECERA);
  var hayTotal = raw.exposicion.filas.some(function (r) { return fotosCriptoNorm_(r[0]).indexOf('total') === 0; });
  if (!hayTotal) throw new Error('No encuentro la fila «TOTAL» en «' + FOTOS_CRIPTO.HOJA_EXPO + '»: la tabla cambio de forma. No genero la foto.');
}

/** True solo si la pestana «Cuadre» dice «Todos los controles cuadran» (y no «No todos...»). */
function fotosCriptoCuadra_(cuadre) {
  if (!Array.isArray(cuadre)) return false;
  return cuadre.some(function (t) {
    var s = fotosCriptoNorm_(t);
    return s.indexOf(FOTOS_CRIPTO.FRASE_CUADRA) >= 0 && s.indexOf('no todos') < 0;
  });
}

// ---------- interpretacion del libro ----------

function fotosCriptoFilaOpsConDatos_(r) { return fotoEsFecha_(r[0]); }
function fotosCriptoFilaOtrasConDatos_(r) { return [0, 1, 2, 3, 4, 5].some(function (i) { return r[i] !== null && r[i] !== undefined; }); }

/**
 * Movimientos {fecha, id, cantidad (con signo), tipo, importe_eur, origen, fila} de «Operaciones» (BTC) y «Otras criptos»
 * (el resto). Compra, Ajuste, Traspaso... suman; Venta resta. Lo que no se puede interpretar no se cuenta y avisa.
 */
function fotosCriptoMovimientos_(raw) {
  var movs = [], avisos = [];
  function signo(tipo, cantidad) { return fotosCriptoNorm_(tipo).indexOf('venta') === 0 ? -Math.abs(cantidad) : cantidad; }
  raw.operaciones.filas.forEach(function (r, i) {
    var fila = FOTOS_CRIPTO.OPS_FILA_CAB + 1 + i;
    if (!fotosCriptoFilaOpsConDatos_(r)) return;
    if (!fotosCriptoNum_(r[3])) { if (r[3] !== null) avisos.push('Operaciones fila ' + fila + ': la cantidad no es un numero; no se cuenta.'); return; }
    movs.push({ fecha: r[0], id: FOTOS_CRIPTO.ID_BTC, cantidad: signo(r[2], r[3]), tipo: r[2], importe_eur: fotosCriptoNum_(r[4]) ? r[4] : null, origen: 'operaciones', fila: fila });
  });
  raw.otras.filas.forEach(function (r, i) {
    var fila = FOTOS_CRIPTO.OTRAS_FILA_CAB + 1 + i;
    if (!fotosCriptoFilaOtrasConDatos_(r)) return;
    var s = fotosCriptoSimbolo_(r[1]);
    if (!s) { avisos.push('Otras criptos fila ' + fila + ': simbolo vacio o no valido; no se cuenta.'); return; }
    if (!fotoEsFecha_(r[0])) { avisos.push('Otras criptos fila ' + fila + ': fecha vacia o no valida; no se cuenta.'); return; }
    if (!fotosCriptoNum_(r[3])) { avisos.push('Otras criptos fila ' + fila + ': la cantidad no es un numero; no se cuenta.'); return; }
    var t = fotosCriptoNorm_(r[2]);
    if (t.indexOf('compra') !== 0 && t.indexOf('venta') !== 0) { avisos.push('Otras criptos fila ' + fila + ': tipo «' + r[2] + '» no reconocido (Compra o Venta); no se cuenta.'); return; }
    movs.push({ fecha: r[0], id: fotosCriptoId_(s), cantidad: signo(r[2], r[3]), tipo: r[2], importe_eur: fotosCriptoNum_(r[4]) ? r[4] : null, origen: 'otras_criptos', fila: fila });
  });
  return { movs: movs, avisos: avisos };
}

/** Suma de cantidades de un id hasta una fecha (incluida). */
function fotosCriptoCantidadA_(movs, id, fecha) {
  var t = 0;
  movs.forEach(function (m) { if (m.id === id && m.fecha <= fecha) t += m.cantidad; });
  return fotoR_(t, 8);
}

// ---------- posiciones ----------

/** Las filas de la tabla de «Exposicion» desde la fila 8 hasta justo antes de «TOTAL». */
function fotosCriptoFilasExposicion_(raw) {
  var out = [];
  for (var i = 0; i < raw.exposicion.filas.length; i++) {
    var r = raw.exposicion.filas[i];
    if (fotosCriptoNorm_(r[0]).indexOf('total') === 0) break;
    out.push({ fila: FOTOS_CRIPTO.EXPO_FILA_CAB + 1 + i, r: r });
  }
  return out;
}

/** Posiciones de la foto. Devuelve {posiciones, avisos}. Lanza error si un simbolo sale repetido (la foto seria invalida). */
function fotosCriptoPosiciones_(raw, oficial, fechaFoto, cuadra) {
  var avisos = [], vistos = {}, posiciones = [];
  fotosCriptoFilasExposicion_(raw).forEach(function (f) {
    var r = f.r, vacia = r.every(function (x) { return x === null || x === undefined; });
    if (vacia) return;
    var s = fotosCriptoSimbolo_(r[0]);
    if (!s) {
      if (r[0] !== null && r[0] !== undefined) avisos.push('Exposicion fila ' + f.fila + ': el simbolo «' + r[0] + '» no es valido (letras y numeros, hasta 15); esa fila no entra en la foto.');
      else if (fotosCriptoNum_(r[2]) && r[2] !== 0) avisos.push('Exposicion fila ' + f.fila + ': tiene cantidad pero no simbolo; esa fila no entra en la foto.');
      return;
    }
    var id = fotosCriptoId_(s);
    if (vistos[id]) throw new Error('El simbolo ' + s + ' aparece dos veces en «' + FOTOS_CRIPTO.HOJA_EXPO + '». No genero la foto.');
    vistos[id] = true;
    var cantidad = fotosCriptoNum_(r[2]) ? fotoR_(r[2], 8) : null;
    var coste = fotosCriptoNum_(r[3]) ? fotoR_(r[3], 2) : null;
    var a = oficial && oficial.activos && oficial.activos[id] ? oficial.activos[id] : null;
    var estadoOf = a ? String(a.estado_precio || '') : '';
    var precio = a && fotosCriptoNum_(a.precio) && a.precio > 0 ? a.precio : null;
    var pa = [];
    var valido = precio !== null && FOTOS_CRIPTO.ESTADOS_OFICIAL_VALIDOS.indexOf(estadoOf) >= 0 && fotoEsFecha_(a.fecha_dato);
    if (valido && a.moneda && a.moneda !== 'EUR') { valido = false; pa.push('precio oficial en ' + a.moneda + ' (no se convierte)'); }
    var valor = null;
    if (valido && cantidad !== null) valor = fotoR_(cantidad * precio, 2);
    if (!valido && cantidad === 0) valor = 0;
    if (!valido) pa.unshift('sin precio oficial');
    if (cantidad === null) pa.push('sin_cantidad');
    var fechaPrecio = valido ? a.fecha_dato : null;
    posiciones.push({
      id: id, nombre: s.toLowerCase(), tipo: 'cripto', moneda: 'EUR',
      cantidad: cantidad, precio: valido ? fotoR_(precio, 6) : null, precio_eur: valido ? fotoR_(precio, 6) : null,
      fecha_precio: fechaPrecio, estado_precio: valido ? estadoOf : 'sin_dato', frescura: null,
      dias_desfase: fechaPrecio ? fotoDiasEntre_(fechaPrecio, fechaFoto) : null,
      valor_eur: valor,
      coste_eur: coste, coste_tipo: coste === null ? null : FOTOS_CRIPTO.COSTE_TIPO,
      estado_coste: coste === null ? 'sin_dato' : (id === FOTOS_CRIPTO.ID_BTC && cuadra ? 'cuadrado' : 'sin verificar'),
      no_liquido: false,
      oficial: a ? { estado_precio: estadoOf || 'sin_dato', precio: fotosCriptoNum_(a.precio) ? fotoR_(a.precio, 6) : null, fecha_dato: a.fecha_dato || null, fuente_elegida: a.fuente_elegida || null, motivo: a.motivo || '' } : null,
      avisos: pa
    });
  });
  return { posiciones: posiciones, avisos: avisos };
}

// ---------- huella, libro e historial ----------

/** Huella del libro: cambia si cambia algo que TECLEAS (operaciones, otras criptos, simbolos); no cambia con el precio. */
function fotosCriptoHuella_(raw) {
  var ops = raw.operaciones.filas.filter(fotosCriptoFilaOpsConDatos_).map(function (r) { return FOTOS_CRIPTO.OPS_ENTRADA.map(function (i) { return r[i] === undefined ? null : r[i]; }); });
  var otras = raw.otras.filas.filter(fotosCriptoFilaOtrasConDatos_).map(function (r) { return r.slice(0, 6); });
  var expo = fotosCriptoFilasExposicion_(raw).filter(function (f) { return fotosCriptoSimbolo_(f.r[0]); }).map(function (f) { return [fotosCriptoSimbolo_(f.r[0])]; });
  return {
    operaciones_filas: ops.length, otras_filas: otras.length, posiciones: expo.length,
    hash: fotoHash_(fotoCanon_({ operaciones: ops, otras: otras, simbolos: expo }))
  };
}

function fotosCriptoLibro_(raw, movs, huella, ahora, scriptVersion) {
  return {
    formato: LIBRO_FORMATO, sheet: FOTOS_CRIPTO.SHEET, generado_utc: fotoIsoUtc_(ahora), version_script: String(scriptVersion || ''), huella: huella,
    libro: { cabecera: raw.operaciones.cabecera, filas: raw.operaciones.filas.filter(fotosCriptoFilaOpsConDatos_) },
    compras_nuevas: { cabecera: raw.otras.cabecera, filas: raw.otras.filas.filter(fotosCriptoFilaOtrasConDatos_) },
    exposicion: { cabecera: raw.exposicion.cabecera, filas: fotosCriptoFilasExposicion_(raw).map(function (f) { return f.r; }).filter(function (r) { return fotosCriptoSimbolo_(r[0]); }) },
    interpretado: { movimientos: movs }
  };
}

/**
 * Serie diaria: por cada dia con fichero de precios del repo (desde DESDE), cantidad del libro a esa fecha x precio de ese dia.
 * Sin precio un dia = valor null y «incompleto»: nunca se inventa. `precios` = {fecha: activos} (null = no se pudo leer).
 */
function fotosCriptoHistorial_(ids, movs, precios, desde, huella, ahora, scriptVersion) {
  var series = [], avisos = [];
  var fechas = Object.keys(precios || {}).filter(function (d) { return fotoEsFecha_(d) && d >= desde; }).sort();
  if (precios === null) avisos.push('No se pudieron leer los precios diarios del repo: el historial sale vacio.');
  fechas.forEach(function (d) {
    var act = precios[d] || {}, pos = {}, liquido = 0, incompleto = false;
    ids.forEach(function (id) {
      var cant = fotosCriptoCantidadA_(movs, id, d), e = act[id];
      var p = e && e.ok === true && fotosCriptoNum_(e.price) && e.price > 0 && (!e.moneda || e.moneda === 'EUR') ? e.price : null;
      var v = p !== null ? fotoR_(cant * p, 2) : (cant === 0 ? 0 : null);
      if (v === null) incompleto = true; else liquido += v;
      pos[id] = { cantidad: cant, precio: fotoR_(p, 6), valor_eur: v };
    });
    series.push({ fecha: d, valor_liquido_eur: fotoR_(liquido, 2), incompleto: incompleto, posiciones: pos });
  });
  return {
    formato: HISTORIAL_FORMATO, sheet: FOTOS_CRIPTO.SHEET, generado_utc: fotoIsoUtc_(ahora), version_script: String(scriptVersion || ''),
    huella: huella, ids: ids, desde: desde, series: series, avisos: avisos
  };
}

// ---------- precios del repo publico ----------

/** Descarga precios/AAAA-MM-DD.json de cada dia (en paralelo). Devuelve {fecha: activos}; los dias sin fichero no aparecen. null si falla todo. */
function fotosCriptoDescargarPrecios_(desde, hasta) {
  var fechas = fotosCriptoFechasEntre_(desde, hasta, FOTOS_CRIPTO.MAX_DIAS_HISTORIAL);
  if (!fechas.length) return {};
  try {
    var resp = UrlFetchApp.fetchAll(fechas.map(function (d) { return { url: FOTOS_CRIPTO.PRECIOS_URL + d + '.json', muteHttpExceptions: true }; }));
    var out = {};
    resp.forEach(function (r, i) {
      if (r.getResponseCode() !== 200) return;
      try { var j = JSON.parse(r.getContentText()); if (j && j.activos) out[fechas[i]] = j.activos; } catch (e) { /* fichero roto: ese dia no cuenta */ }
    });
    return out;
  } catch (e2) { return null; }
}

// ---------- generacion (sin tocar Drive) ----------

/** Todo el calculo. ctx.raw, ctx.oficial, ctx.precios y ctx.ahora se pueden inyectar (pruebas); si no, se leen. */
function fotosCriptoGenerar_(ctx) {
  ctx = ctx || {};
  var ahora = ctx.ahora || new Date();
  var raw = ctx.raw || fotosCriptoLeerHojas_();
  fotosCriptoComprobarForma_(raw);
  var oficial = ctx.oficial !== undefined ? ctx.oficial : fotoDescargarOficial_();
  var fechaFoto = fotoPartesMadrid_(ahora).fecha;
  var desde = ctx.desde || FOTOS_CRIPTO.DESDE;
  var precios = ctx.precios !== undefined ? ctx.precios : fotosCriptoDescargarPrecios_(desde, fechaFoto);
  var cuadra = fotosCriptoCuadra_(raw.cuadre);

  var p = fotosCriptoPosiciones_(raw, oficial, fechaFoto, cuadra);
  var m = fotosCriptoMovimientos_(raw);
  var huella = fotosCriptoHuella_(raw);

  var avisos = p.avisos.concat(m.avisos);
  if (oficial === null) avisos.push('No se pudo leer oficial/ultimo.json: todas las posiciones salen sin precio oficial.');
  if (!cuadra) avisos.push('La pestaña «Cuadre» no dice «' + 'Todos los controles cuadran' + '»: el coste de BTC sale como «sin verificar».');

  // el libro debe explicar las cantidades que muestra «Exposicion»
  var idsPos = p.posiciones.map(function (x) { return x.id; });
  p.posiciones.forEach(function (x) {
    if (x.cantidad === null) return;
    var calc = fotosCriptoCantidadA_(m.movs, x.id, fechaFoto);
    if (Math.abs(calc - x.cantidad) > 2e-8) avisos.push('El libro de ' + fotosCriptoSimboloDeId_(x.id).toUpperCase() + ' suma ' + calc + ' y «Exposicion» muestra ' + x.cantidad + ': el historial no cuadra con la cantidad actual.');
  });
  var idsExtra = [];
  m.movs.forEach(function (mv) {
    if (idsPos.indexOf(mv.id) < 0 && idsExtra.indexOf(mv.id) < 0) idsExtra.push(mv.id);
  });
  idsExtra.forEach(function (id) {
    avisos.push('Hay movimientos de ' + fotosCriptoSimboloDeId_(id).toUpperCase() + ' en el libro pero esa moneda no aparece en «Exposicion»: falta darla de alta (simbolo en la columna B).');
  });
  var ids = idsPos.concat(idsExtra);

  var foto = fotoConstruir_({
    sheet: FOTOS_CRIPTO.SHEET, fechaFoto: fechaFoto, ahora: ahora, versionScript: ctx.scriptVersion || '', versionExportador: FOTOS_CRIPTO.VERSION_EXPORTADOR,
    fuentePrecios: 'oficial', fechaCapturaPrecios: oficial && fotoEsFecha_(oficial.fecha) ? oficial.fecha : null, huella: huella
  }, p.posiciones, { aportado_efectivo_eur: null }, avisos);
  foto.vehiculo = FOTOS_CRIPTO.VEHICULO;

  return {
    foto: foto, libro: fotosCriptoLibro_(raw, m.movs, huella, ahora, ctx.scriptVersion),
    historial: fotosCriptoHistorial_(ids, m.movs, precios, desde, huella, ahora, ctx.scriptVersion), ahora: ahora
  };
}

// ---------- Drive y propiedades (lo propio de Apps Script) ----------

function fotosCriptoModo_() {
  var v = PropertiesService.getScriptProperties().getProperty('FOTOS_MODO');
  return v === 'definitivo' ? 'definitivo' : 'ensayo';
}

/** Almacen sobre Drive: fotos/ (definitivo) o fotos/ensayo_cripto/ (ensayo; el consolidador NO lo lee). Nunca crea «fotos». */
function fotosCriptoAlmacenDrive_(modo) {
  var id = PropertiesService.getScriptProperties().getProperty('CARPETA_DATOS_ID');
  if (!id) throw new Error('Falta configurar: ejecuta primero la funcion «fotosCriptoConfigurar».');
  var datos = DriveApp.getFolderById(id);
  var subs = datos.getFoldersByName(FOTO_CFG.SUBCARPETA);
  if (!subs.hasNext()) throw new Error('No existe la subcarpeta «' + FOTO_CFG.SUBCARPETA + '» dentro de «' + FOTOS_CRIPTO.CARPETA_DATOS + '». No guardo nada.');
  var carpeta = subs.next();
  if (modo !== 'definitivo') {
    var e = carpeta.getFoldersByName(FOTOS_CRIPTO.SUB_ENSAYO);
    carpeta = e.hasNext() ? e.next() : carpeta.createFolder(FOTOS_CRIPTO.SUB_ENSAYO);
  }
  return {
    existe: function (n) { return carpeta.getFilesByName(n).hasNext(); },
    escribir: function (n, t) {
      var it = carpeta.getFilesByName(n);
      if (it.hasNext()) it.next().setContent(t); else carpeta.createFile(n, t, MimeType.PLAIN_TEXT);
    },
    crear: function (n, t) {
      if (carpeta.getFilesByName(n).hasNext()) throw new Error('ya existe ' + n);
      carpeta.createFile(n, t, MimeType.PLAIN_TEXT);
    }
  };
}

/** Genera y guarda. Nunca lanza error hacia fuera: devuelve {foto:'error', error}. ctx.modo y ctx.almacen se pueden inyectar. */
function exportarFotosCripto_(ctx) {
  ctx = ctx || {};
  var props = null;
  try { props = PropertiesService.getScriptProperties(); } catch (e0) { /* sin propiedades: solo pruebas */ }
  try {
    var r = fotosCriptoGenerar_(ctx);
    var modo = ctx.modo || fotosCriptoModo_();
    var almacen = ctx.almacen || fotosCriptoAlmacenDrive_(modo);
    var res = fotoGuardar_(almacen, FOTOS_CRIPTO.SHEET, r.foto, r.libro, r.historial, r.ahora, { forzarHora: !!ctx.forzarHora });
    res.modo = modo;
    if (props) props.setProperty('CRIPTO_ULTIMO_RESULTADO', r.foto.fecha_foto + ' ' + modo + ' ' + res.foto);
    return res;
  } catch (e) {
    console.log('exportarFotosCripto_: ' + e);
    if (props) { try { props.setProperty('CRIPTO_ULTIMO_ERROR', fotoPartesMadrid_(new Date()).fecha + ' ' + e); } catch (e2) { /* idem */ } }
    return { foto: 'error', error: String(e) };
  }
}

// ---------- funciones que ejecutas tu desde el editor ----------

/** UNA SOLA VEZ: localiza «TITAN datos Sheet» (debe haber exactamente una) y su subcarpeta «fotos», y guarda el id. */
function fotosCriptoConfigurar() {
  var padres = DriveApp.getFoldersByName(FOTOS_CRIPTO.CARPETA_DATOS), lista = [];
  while (padres.hasNext()) lista.push(padres.next());
  if (lista.length !== 1) throw new Error('Esperaba exactamente 1 carpeta llamada «' + FOTOS_CRIPTO.CARPETA_DATOS + '» y hay ' + lista.length + '. No guardo nada.');
  var subs = lista[0].getFoldersByName(FOTO_CFG.SUBCARPETA), n = 0;
  while (subs.hasNext()) { subs.next(); n++; }
  if (n !== 1) throw new Error('Esperaba exactamente 1 subcarpeta «' + FOTO_CFG.SUBCARPETA + '» y hay ' + n + '. No guardo nada.');
  PropertiesService.getScriptProperties().setProperty('CARPETA_DATOS_ID', lista[0].getId());
  Logger.log('Listo: carpeta «' + FOTOS_CRIPTO.CARPETA_DATOS + '» localizada y guardada. Modo actual: ' + fotosCriptoModo_() + '. Ahora ejecuta «fotosCriptoVerSinGuardar».');
}

/** Hace todo menos escribir y lo cuenta en el registro. Seguro de ejecutar cuando quieras. */
function fotosCriptoVerSinGuardar() {
  var r = fotosCriptoGenerar_({});
  var f = r.foto, errores = fotoValidar_(f);
  Logger.log('Modo: ' + fotosCriptoModo_() + ' | foto de ' + f.fecha_foto + ' | cierre de precios ' + f.fecha_cierre + ' | posiciones: ' + f.posiciones.length);
  f.posiciones.forEach(function (p) {
    Logger.log('  ' + p.id + ' | cantidad ' + p.cantidad + ' | precio ' + p.precio + ' (' + p.estado_precio + ', ' + p.fecha_precio + ') | valor ' + p.valor_eur + ' | coste ' + p.coste_eur + ' (' + p.estado_coste + ')' + (p.avisos.length ? ' | avisos: ' + p.avisos.join('; ') : ''));
  });
  Logger.log('Totales: liquido ' + f.totales.valor_liquido_eur + ' | coste ' + f.totales.coste_liquido_eur);
  Logger.log('Historial: ' + r.historial.series.length + ' dias desde ' + r.historial.desde + (r.historial.series.length ? ' (ultimo: ' + r.historial.series[r.historial.series.length - 1].fecha + ')' : ''));
  f.avisos.forEach(function (a) { Logger.log('AVISO: ' + a); });
  Logger.log(errores.length ? 'FOTO NO VALIDA: ' + errores.join('; ') : 'La foto cumple el molde foto_cartera/v1. No se ha guardado nada.');
}

/** UNA SOLA VEZ: crea el disparador diario (entre las 07:00 y las 08:00, hora de Madrid). No duplica. */
function fotosCriptoInstalarDisparador() {
  var ya = ScriptApp.getProjectTriggers().filter(function (t) { return t.getHandlerFunction() === 'fotosCriptoDiaria'; });
  if (ya.length) { Logger.log('Ya hay ' + ya.length + ' disparador(es) de fotosCriptoDiaria. No creo otro.'); return; }
  ScriptApp.newTrigger('fotosCriptoDiaria').timeBased().everyDays(1).atHour(7).inTimezone(FOTO_CFG.TZ).create();
  Logger.log('Disparador creado: fotosCriptoDiaria, cada dia entre las 07:00 y las 08:00 (Madrid). Modo actual: ' + fotosCriptoModo_() + '.');
}

/** La que ejecuta el disparador. Si algo falla LANZA el error, para que Google envie el correo de aviso. */
function fotosCriptoDiaria() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) throw new Error('Hay otra ejecucion de la foto de cripto en curso; vuelve a intentarlo en un minuto.');
  try {
    var r = exportarFotosCripto_({});
    if (r.foto === 'error') throw new Error(r.error);
    return r;
  } finally {
    lock.releaseLock();
  }
}

/** Cambio definitivo: desde la siguiente pasada la foto se escribe en fotos/ con el nombre definitivo. Solo con tu «si». */
function fotosCriptoModoDefinitivo() {
  PropertiesService.getScriptProperties().setProperty('FOTOS_MODO', 'definitivo');
  Logger.log('Modo DEFINITIVO: la proxima foto se escribira en fotos/ como foto_cripto_AAAA-MM-DD.json.');
}

function fotosCriptoModoEnsayo() {
  PropertiesService.getScriptProperties().setProperty('FOTOS_MODO', 'ensayo');
  Logger.log('Modo ENSAYO: las fotos se escriben en fotos/' + FOTOS_CRIPTO.SUB_ENSAYO + '/ y el consolidador no las lee.');
}
