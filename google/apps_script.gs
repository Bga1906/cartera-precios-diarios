/**
 * Apps Script del Sheet «Precios secundaria» (F1.3).
 * Solo copia VALORES de la pestana «Ultima» a «Historial». No lee ni escribe nada fuera de este Sheet.
 * (La lectura de FT para fondos y el aviso por email si GitHub se para llegan en F1.5.)
 */
const HOJA_ULTIMA = 'Ultima';
const HOJA_HISTORIAL = 'Historial';
const COLUMNAS_COPIADAS = 8; // A:H de Ultima

/** Foto nocturna: anade una linea por vehiculo con la hora de la captura. Google no deja leer
 *  por script el historico de GOOGLEFINANCE, asi que guardamos el nuestro. */
function fotoNocturna() {
  const libro = SpreadsheetApp.getActive();
  const ultima = libro.getSheetByName(HOJA_ULTIMA);
  let hist = libro.getSheetByName(HOJA_HISTORIAL);
  const cabecera = ultima.getRange(1, 1, 1, COLUMNAS_COPIADAS).getValues()[0];
  if (!hist) {
    hist = libro.insertSheet(HOJA_HISTORIAL);
    hist.appendRow(['captura_utc'].concat(cabecera));
  }
  const ultimaFila = ultima.getLastRow();
  if (ultimaFila < 2) return;
  const valores = ultima.getRange(2, 1, ultimaFila - 1, COLUMNAS_COPIADAS).getValues()
    .filter(f => f[0] !== '');
  const ahora = Utilities.formatDate(new Date(), 'UTC', "yyyy-MM-dd'T'HH:mm:ss'Z'");
  const filas = valores.map(f => [ahora].concat(f));
  if (filas.length) {
    hist.getRange(hist.getLastRow() + 1, 1, filas.length, filas[0].length).setValues(filas);
  }
}

/** Ejecutar UNA vez a mano: crea el disparador diario (entre las 23:00 y las 24:00 hora del Sheet). */
function instalarDisparador() {
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'fotoNocturna')
    .forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('fotoNocturna').timeBased().everyDays(1).atHour(23).create();
}
