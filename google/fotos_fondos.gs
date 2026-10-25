/**
 * FOTO DIARIA DEL SHEET «Seguimiento fondos» (F3, 25/10/2026). Necesita foto_cartera.gs (el molde comun) en el mismo proyecto.
 * Solo LEE el Sheet y escribe en Drive: nunca modifica ninguna pestana. Sin cifras personales en este codigo.
 *
 * Se engancha al script de valoracion con UNA llamada al final de actualizarValoracion() (ver LEEME_FOTOS.md):
 *   exportarFotosFondos_({fondos: fondos, cache: cache, ev: ev, compras: compras, hist: hist, vl: vl, plan: d.plan,
 *                         planInfo: planInfo, frescura: frescura, hoy: hoy, scriptVersion: SCRIPT_VERSION});
 * Si algo falla, lo anota en la propiedad FOTOS_ULTIMO_ERROR y NO interrumpe la valoracion.
 */
var FOTOS_FONDOS = {
  SHEET: 'fondos',
  CLAVE: 'myinvestor-cobas:',
  PLAN_ID: 'myinvestor:plan-pensiones',
  PLAN_NOMBRE: 'MyInvestor Indexado Global PP',
  HOJA_LIBRO: 'Libro', FILA_CAB_LIBRO: 3, COLS_LIBRO: 15,
  HOJA_COMPRAS: 'Compras nuevas', FILA_CAB_COMPRAS: 4, COLS_COMPRAS: 7,
  HOJA_PLAN: 'Plan de pensiones',
  ARCHIVO_REFERENCIA: 'datos_sheet_fondos.json',
  VERSION_EXPORTADOR: 'F3.1 (2026-10-25)',
  CONTRASTE_PLAN_MAX_DIAS: 3
};

/** Lee en bruto lo que la foto necesita de las pestanas. Es la unica funcion que toca SpreadsheetApp. */
function fotosFondosLeerHojas_() {
  var ss = SpreadsheetApp.getActive();
  function tabla(nombre, filaCab, ncols) {
    var sh = ss.getSheetByName(nombre);
    if (!sh) return { cabecera: [], filas: [], ausente: true };
    var n = sh.getLastRow() - filaCab + 1;
    if (n < 1) return { cabecera: [], filas: [] };
    var v = sh.getRange(filaCab, 1, n, ncols).getValues();
    return {
      cabecera: v[0].map(fotoCelda_),
      filas: v.slice(1).map(function (r) { return r.map(fotoCelda_); }).filter(function (r) { return r.some(function (x) { return x !== null; }); })
    };
  }
  var plan = null, pp = ss.getSheetByName(FOTOS_FONDOS.HOJA_PLAN);
  if (pp) {
    plan = {};
    pp.getRange('A1:B20').getValues().forEach(function (r) { plan[String(r[0]).trim()] = fotoCelda_(r[1]); });
  }
  return {
    libro: tabla(FOTOS_FONDOS.HOJA_LIBRO, FOTOS_FONDOS.FILA_CAB_LIBRO, FOTOS_FONDOS.COLS_LIBRO),
    compras: tabla(FOTOS_FONDOS.HOJA_COMPRAS, FOTOS_FONDOS.FILA_CAB_COMPRAS, FOTOS_FONDOS.COLS_COMPRAS),
    plan: plan
  };
}

/** Posiciones de los fondos, tal como las valora «Valoracion hoy» (mismo precio, mismas participaciones, mismo coste). */
function fotosFondosPosiciones_(ctx, oficial) {
  var ult = ctx.hist.filas[ctx.hist.filas.length - 1];
  var comprasPorFondo = {};
  ctx.compras.forEach(function (c) {
    if (c.problema || typeof c.importe !== 'number' || isNaN(c.importe)) return;
    comprasPorFondo[c.fondo.fondo] = (comprasPorFondo[c.fondo.fondo] || 0) + c.importe;
  });
  return ctx.fondos.map(function (f) {
    var id = FOTOS_FONDOS.CLAVE + f.isin;
    var pf = ult.porFondo[f.isin] || { u: 0, p: undefined, v: 0 };
    var vl = (ctx.vl && ctx.vl[f.isin]) || {};
    var fr = ((ctx.frescura && ctx.frescura.fondos) || []).filter(function (x) { return x.isin === f.isin; })[0] || null;
    var precio = typeof pf.p === 'number' ? pf.p : null;
    var hayCantidad = pf.u > 1e-9;
    var avisos = [];
    var valor = hayCantidad ? (precio !== null ? pf.v : null) : 0;
    var of = fotoContrasteOficial_(precio, vl.asOf || null, fotoEstadoOficial_(oficial, id));
    var estado = (hayCantidad && precio === null) ? 'sin_dato' : (of.bloque ? of.bloque.estado_precio : 'sin_oficial');
    if (hayCantidad && precio === null) avisos.push('sin_precio');
    if (of.aviso) avisos.push(of.aviso);
    if (ult.arrastrados.indexOf(f.isin) >= 0) avisos.push('precio_arrastrado');
    if (/PENDIENTE/i.test(f.estado || '')) avisos.push('coste_pendiente_asesor');
    return {
      id: id, nombre: f.nombre || f.fondo, tipo: 'fondo',
      cantidad: fotoR_(pf.u, 8), moneda: 'EUR', precio: fotoR_(precio, 6), precio_eur: fotoR_(precio, 6),
      fecha_precio: vl.asOf || null, estado_precio: estado,
      frescura: fr ? fr.estado : null, dias_desfase: fr && typeof fr.dias === 'number' ? fr.dias : null,
      valor_eur: fotoR_(valor, 2),
      coste_eur: fotoR_(f.costeFiscal + (comprasPorFondo[f.fondo] || 0), 2), coste_tipo: 'fiscal_entidad',
      estado_coste: String(f.estado || ''), no_liquido: false,
      oficial: of.bloque, avisos: avisos
    };
  });
}

/**
 * El plan de pensiones: participaciones (las tecleas tu, solo cambian cuando aportas) x valor liquidativo del dia.
 * Si no hay VL automatico, se usa el valor manual de la pestana y se marca estado_precio = «manual».
 * Siempre no_liquido = true (IPS: bloqueado), asi que nunca suma al valor liquido.
 */
function fotosFondosPlan_(ctx, oficial, raw) {
  var p = raw && raw.plan;
  if (!p) return { posicion: null, avisos: ['Sin pestana «' + FOTOS_FONDOS.HOJA_PLAN + '»: el plan no sale en la foto.'] };
  var num = function (x) { return typeof x === 'number' && isFinite(x) ? x : null; };
  var cantidad = num(p['Participaciones']);
  var manualValor = num(p['Valor actual (€)']);
  var manualFecha = typeof p['Fecha del valor'] === 'string' ? p['Fecha del valor'] : null;
  var aportado = num(p['Aportado (€)']);
  var auto = ctx.plan && ctx.plan.ok && typeof ctx.plan.price === 'number' ? ctx.plan : null;
  var entradaOf = fotoEstadoOficial_(oficial, FOTOS_FONDOS.PLAN_ID);
  var avisos = [];
  var pos = {
    id: FOTOS_FONDOS.PLAN_ID, nombre: FOTOS_FONDOS.PLAN_NOMBRE, tipo: 'plan', cantidad: fotoR_(cantidad, 8), moneda: 'EUR',
    precio: null, precio_eur: null, fecha_precio: null, estado_precio: 'manual', frescura: null, dias_desfase: null,
    valor_eur: null, coste_eur: fotoR_(aportado, 2), coste_tipo: 'aportado', estado_coste: '', no_liquido: true,
    oficial: null, contraste_manual: null, avisos: avisos
  };
  if (auto && cantidad !== null) {
    pos.precio = fotoR_(auto.price, 6); pos.precio_eur = pos.precio;
    pos.fecha_precio = auto.asOf || null;
    pos.valor_eur = fotoR_(cantidad * auto.price, 2);
    var of = fotoContrasteOficial_(auto.price, pos.fecha_precio, entradaOf);
    pos.oficial = of.bloque;
    pos.estado_precio = of.bloque ? of.bloque.estado_precio : 'sin_oficial';
    if (of.aviso) avisos.push(of.aviso);
    pos.frescura = ctx.frescura && ctx.frescura.planEstado ? ctx.frescura.planEstado : null;
    pos.dias_desfase = ctx.frescura && typeof ctx.frescura.planDias === 'number' ? ctx.frescura.planDias : null;
    if (auto.arrastrado) avisos.push('precio_arrastrado');
    // Contraste con tu valor manual: solo si ambos son de fechas cercanas (si no, la diferencia es normal).
    var dias = fotoDiasEntre_(manualFecha, pos.fecha_precio);
    var comparable = manualValor !== null && dias !== null && Math.abs(dias) <= FOTOS_FONDOS.CONTRASTE_PLAN_MAX_DIAS;
    var dif = comparable && manualValor !== 0 ? fotoR_((pos.valor_eur - manualValor) / manualValor, 6) : null;
    pos.contraste_manual = { valor_manual_eur: fotoR_(manualValor, 2), fecha_manual: manualFecha, comparable: comparable, dif_pct: dif };
    if (comparable && dif !== null && Math.abs(dif) > FOTO_CFG.UMBRAL_DIF_OFICIAL) avisos.push('contraste_manual');
  } else {
    pos.valor_eur = fotoR_(manualValor, 2);
    pos.fecha_precio = manualFecha;
    pos.dias_desfase = fotoDiasEntre_(manualFecha, ctx.hoy);
    pos.contraste_manual = { valor_manual_eur: fotoR_(manualValor, 2), fecha_manual: manualFecha, comparable: false, dif_pct: null };
    avisos.push(cantidad === null ? 'plan_sin_participaciones' : 'plan_valor_manual');
  }
  return { posicion: pos, avisos: [] };
}

/** Huella del libro: cambia si cambia cualquier fila del Libro o de Compras nuevas (columnas de entrada A-G). */
function fotosFondosHuella_(ctx, raw) {
  var activas = ctx.compras.filter(function (c) { return !c.problema; }).length;
  return {
    libro_filas: raw.libro.filas.length,
    compras_filas: raw.compras.filas.length,
    compras_activas: activas,
    hash: fotoHash_(fotoCanon_({ libro: raw.libro.filas, compras: raw.compras.filas }))
  };
}

function fotosFondosLibro_(ctx, raw, huella, ahora) {
  var K = FOTOS_FONDOS.CLAVE;
  return {
    formato: LIBRO_FORMATO, sheet: FOTOS_FONDOS.SHEET, generado_utc: fotoIsoUtc_(ahora),
    version_script: String(ctx.scriptVersion || ''), huella: huella,
    libro: raw.libro, compras_nuevas: raw.compras,
    interpretado: {
      participaciones: ctx.hist.unidades.map(function (e) { return { fecha: e.fecha, id: K + e.isin, cantidad: fotoR_(e.u, 8), ref: e.id }; }),
      caja: ctx.hist.caja.map(function (e) { return { fecha: e.fecha, importe_eur: fotoR_(e.importe, 2), ref: e.id }; }),
      compras: ctx.compras.map(function (c) {
        return {
          fila: c.fila, fecha: c.fecha || null, id: c.fondo ? K + c.fondo.isin : null, importe_eur: fotoR_(c.importe, 2),
          cantidad: fotoR_(typeof c.u === 'number' ? c.u : c.unidades, 8), estimada: !!c.estimada, confirmada: !!c.participacionesReales,
          problema: c.problema || null, duplicado_de: c.duplicadoDe || null
        };
      })
    }
  };
}

function fotosFondosHistorial_(ctx, huella, ahora) {
  var K = FOTOS_FONDOS.CLAVE;
  var ids = ctx.fondos.map(function (f) { return K + f.isin; });
  return {
    formato: HISTORIAL_FORMATO, sheet: FOTOS_FONDOS.SHEET, generado_utc: fotoIsoUtc_(ahora),
    version_script: String(ctx.scriptVersion || ''), huella: huella, ids: ids,
    series: ctx.hist.filas.map(function (r) {
      var posiciones = {};
      ctx.fondos.forEach(function (f) {
        var x = r.porFondo[f.isin] || { u: 0, p: undefined, v: 0 };
        posiciones[K + f.isin] = { cantidad: fotoR_(x.u, 8), precio: fotoR_(x.p, 6), valor_eur: fotoR_(x.v, 2) };
      });
      return {
        fecha: r.fecha, valor_liquido_eur: fotoR_(r.total, 2), aportado_efectivo_eur: fotoR_(r.aportado, 2),
        resultado_eur: fotoR_(r.resultado, 2), rentabilidad_simple: r.rent === null ? null : fotoR_(r.rent, 6),
        posiciones: posiciones, arrastrados: r.arrastrados.map(function (i) { return K + i; })
      };
    })
  };
}

/** Todo el calculo, sin tocar Drive. ctx.raw y ctx.oficial se pueden inyectar (pruebas); si no, se leen. */
function fotosFondosGenerar_(ctx) {
  var ahora = ctx.ahora || new Date();
  var raw = ctx.raw || fotosFondosLeerHojas_();
  var oficial = ctx.oficial !== undefined ? ctx.oficial : fotoDescargarOficial_();
  if (!ctx.hist || !ctx.hist.filas || !ctx.hist.filas.length) throw new Error('no hay historial de valoracion todavia');
  var ult = ctx.hist.filas[ctx.hist.filas.length - 1];
  var plan = fotosFondosPlan_(ctx, oficial, raw);
  var posiciones = fotosFondosPosiciones_(ctx, oficial).concat(plan.posicion ? [plan.posicion] : []);
  var avisos = (ctx.hist.avisos || []).slice().concat(plan.avisos);
  if (oficial === null) avisos.push('No se pudo leer oficial/ultimo.json: los estados de precio salen como sin_oficial.');
  var huella = fotosFondosHuella_(ctx, raw);
  var foto = fotoConstruir_({
    sheet: FOTOS_FONDOS.SHEET, fechaFoto: fotoPartesMadrid_(ahora).fecha, ahora: ahora,
    versionScript: ctx.scriptVersion, versionExportador: FOTOS_FONDOS.VERSION_EXPORTADOR,
    fuentePrecios: 'precios', fechaCapturaPrecios: ult.fecha, huella: huella
  }, posiciones, { aportado_efectivo_eur: ult.aportado }, avisos);
  return {
    foto: foto, libro: fotosFondosLibro_(ctx, raw, huella, ahora), historial: fotosFondosHistorial_(ctx, huella, ahora), ahora: ahora
  };
}

/** Punto de entrada: genera y guarda. Nunca lanza error hacia fuera (no debe romper la valoracion). */
function exportarFotosFondos_(ctx) {
  try {
    var r = fotosFondosGenerar_(ctx);
    var almacen = ctx.almacen || fotoAlmacenDrive_(FOTOS_FONDOS.ARCHIVO_REFERENCIA);
    var res = fotoGuardar_(almacen, FOTOS_FONDOS.SHEET, r.foto, r.libro, r.historial, r.ahora, { forzarHora: !!ctx.forzarHora });
    try { PropertiesService.getScriptProperties().setProperty('FOTOS_ULTIMO_RESULTADO', r.foto.fecha_foto + ' ' + res.foto); } catch (e1) { /* sin propiedades: solo pruebas */ }
    return res;
  } catch (e) {
    console.log('exportarFotosFondos_: ' + e);
    try { PropertiesService.getScriptProperties().setProperty('FOTOS_ULTIMO_ERROR', fotoPartesMadrid_(new Date()).fecha + ' ' + e); } catch (e2) { /* idem */ }
    return { foto: 'error', error: String(e) };
  }
}
