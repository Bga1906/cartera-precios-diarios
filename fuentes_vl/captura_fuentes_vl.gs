/**
 * Captura de VL (valor liquidativo) de cada fondo desde varias fuentes, para
 * comparar cuál va más al día y cuál se desfasa más durante una semana.
 *
 * Escribe en la pestaña "Capturas" una fila por fondo, fuente y captura:
 *   captura | hora | isin | fondo | fuente | precio | fecha_vl | desfase_dias | estado
 *
 * Fuentes (todas públicas, sin login):
 *   - Yahoo   : API de gráficos (último cierre no nulo y su fecha)
 *   - FT      : markets.ft.com (precio con 2 decimales y fecha real)
 *   - finanzen: finanzen.at (solo donde se conoce la URL)
 * Investing y el catálogo de MyInvestor NO se leen aquí (Investing bloquea
 * accesos automáticos; el catálogo repite a Yahoo porque ambos vienen de Morningstar).
 *
 * Uso: ejecutar crearDisparadores() una vez; después corre solo.
 */

var HOJA = 'Capturas';
var CABECERA = ['captura', 'hora', 'isin', 'fondo', 'fuente', 'precio', 'fecha_vl', 'desfase_dias', 'estado'];

var FONDOS = [
  { isin: 'ES0124037013', fondo: 'cobas-seleccion',           yahoo: '0P0001LFVR.F' },
  { isin: 'ES0146309002', fondo: 'horos-value-internacional', yahoo: '0P0001DFE8.F' },
  { isin: 'IE000ZYRH0Q7', fondo: 'ishares-developed-world',   yahoo: '0P0001XF40.F' },
  { isin: 'IE000QAZP7L2', fondo: 'ishares-emerging-markets',  yahoo: '0P0001XF3Z.F' },
  { isin: 'ES0165243025', fondo: 'myinvestor-value',          yahoo: '0P0001T8V7.F' },
  { isin: 'ES0173311103', fondo: 'numantia',                  yahoo: '0P000168OI.F' },
  { isin: 'LU0625737910', fondo: 'pictet-china',              yahoo: 'LU0625737910.LU',
    finanzen: 'https://www.finanzen.at/fonds/pictet-china-index-p-lu0625737910/nav' },
  { isin: 'IE00BM95B621', fondo: 'polar-capital',             yahoo: '0P0001LT4H.F' }
];

var MESES = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };

function capturarFuentes() {
  var zona = 'Europe/Madrid';
  var ahora = new Date();
  var dia = Utilities.formatDate(ahora, zona, 'yyyy-MM-dd');
  var hora = Utilities.formatDate(ahora, zona, 'HH:mm');
  var filas = [];

  FONDOS.forEach(function (f) {
    filas.push(fila_(dia, hora, f, 'Yahoo', leerYahoo_(f)));
    filas.push(fila_(dia, hora, f, 'FT', leerFT_(f)));
    if (f.finanzen) filas.push(fila_(dia, hora, f, 'finanzen.at', leerFinanzen_(f)));
  });

  var hoja = hojaCapturas_();
  hoja.getRange(hoja.getLastRow() + 1, 1, filas.length, CABECERA.length).setValues(filas);
}

function fila_(dia, hora, f, fuente, r) {
  var desfase = '';
  if (r.fecha) {
    var d1 = new Date(dia + 'T00:00:00Z');
    var d2 = new Date(r.fecha + 'T00:00:00Z');
    desfase = Math.round((d1 - d2) / 86400000);
  }
  return [dia, hora, f.isin, f.fondo, fuente, r.precio === null ? '' : r.precio, r.fecha || '', desfase, r.estado];
}

function hojaCapturas_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = ss.getSheetByName(HOJA);
  if (!hoja) {
    hoja = ss.insertSheet(HOJA);
    hoja.getRange(1, 1, 1, CABECERA.length).setValues([CABECERA]).setFontWeight('bold');
    hoja.setFrozenRows(1);
  }
  return hoja;
}

function pedir_(url) {
  var resp = UrlFetchApp.fetch(url, {
    muteHttpExceptions: true,
    followRedirects: true,
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; seguimiento-fondos)' }
  });
  return { codigo: resp.getResponseCode(), texto: resp.getContentText() };
}

function leerYahoo_(f) {
  try {
    var url = 'https://query1.finance.yahoo.com/v8/finance/chart/' + encodeURIComponent(f.yahoo) + '?range=10d&interval=1d';
    var r = pedir_(url);
    if (r.codigo !== 200) return { precio: null, fecha: null, estado: 'HTTP ' + r.codigo };
    var res = JSON.parse(r.texto).chart.result[0];
    var ts = res.timestamp || [];
    var cierres = res.indicators.quote[0].close || [];
    for (var i = cierres.length - 1; i >= 0; i--) {
      if (cierres[i] !== null && cierres[i] !== undefined) {
        var zona = (res.meta && res.meta.exchangeTimezoneName) || 'UTC';
        return { precio: cierres[i], fecha: Utilities.formatDate(new Date(ts[i] * 1000), zona, 'yyyy-MM-dd'), estado: 'OK' };
      }
    }
    return { precio: null, fecha: null, estado: 'sin datos' };
  } catch (e) {
    return { precio: null, fecha: null, estado: 'ERROR ' + e };
  }
}

function leerFT_(f) {
  try {
    var r = pedir_('https://markets.ft.com/data/funds/tearsheet/summary?s=' + f.isin + ':EUR');
    if (r.codigo !== 200) return { precio: null, fecha: null, estado: 'HTTP ' + r.codigo };
    var t = r.texto.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');
    var p = t.match(/Price \(EUR\)\s*([\d.,]+)/);
    var d = t.match(/as of ([A-Za-z]{3})[a-z]* (\d{1,2}) (\d{4})/);
    if (!p || !d) return { precio: null, fecha: null, estado: 'formato no reconocido' };
    var mes = ('0' + (MESES[d[1]] + 1)).slice(-2);
    var dia = ('0' + d[2]).slice(-2);
    return { precio: parseFloat(p[1].replace(/,/g, '')), fecha: d[3] + '-' + mes + '-' + dia, estado: 'OK (2 decimales)' };
  } catch (e) {
    return { precio: null, fecha: null, estado: 'ERROR ' + e };
  }
}

function leerFinanzen_(f) {
  try {
    var r = pedir_(f.finanzen);
    if (r.codigo !== 200) return { precio: null, fecha: null, estado: 'HTTP ' + r.codigo };
    var t = r.texto.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');
    // Formato esperado en la página: "130,34 EUR ... 13.10.2026"
    var m = t.match(/([\d.]+,\d{2,4})\s*EUR[^0-9]{0,80}(\d{2})\.(\d{2})\.(\d{4})/);
    if (!m) return { precio: null, fecha: null, estado: 'formato no reconocido' };
    return { precio: parseFloat(m[1].replace(/\./g, '').replace(',', '.')), fecha: m[4] + '-' + m[3] + '-' + m[2], estado: 'OK' };
  } catch (e) {
    return { precio: null, fecha: null, estado: 'ERROR ' + e };
  }
}

/** Ejecutar UNA vez: captura a las 09:00 y a las 22:00 (hora de la hoja). */
function crearDisparadores() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'capturarFuentes') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('capturarFuentes').timeBased().everyDays(1).atHour(9).create();
  ScriptApp.newTrigger('capturarFuentes').timeBased().everyDays(1).atHour(22).create();
}
