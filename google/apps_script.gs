// Precios secundaria: foto nocturna y vigilancia de GitHub. Solo toca este Sheet y manda emails a tu propia cuenta.

// Copia los valores de Ultima a Historial y publica la hora de la foto en Ultima!I1:I2 (GitHub la lee).
function fotoNocturna() {
  const libro = SpreadsheetApp.getActive();
  const ultima = libro.getSheetByName('Ultima');
  let hist = libro.getSheetByName('Historial');
  const cabecera = ultima.getRange(1, 1, 1, 8).getValues()[0];
  if (!hist) {
    hist = libro.insertSheet('Historial');
    hist.appendRow(['captura_utc'].concat(cabecera));
  }
  const n = ultima.getLastRow();
  const ahora = Utilities.formatDate(new Date(), 'UTC', "yyyy-MM-dd'T'HH:mm:ss'Z'");
  if (n >= 2) {
    const valores = ultima.getRange(2, 1, n - 1, 8).getValues().filter(f => f[0] !== '');
    const filas = valores.map(f => [ahora].concat(f));
    if (filas.length) hist.getRange(hist.getLastRow() + 1, 1, filas.length, filas[0].length).setValues(filas);
  }
  ultima.getRange('I1').setValue('ultima_foto_utc');
  ultima.getRange('I2').setNumberFormat('@').setValue(ahora);
}

// Mira latido.json de GitHub; si la captura lleva mas de 30 h parada, te manda un email (maximo uno cada 24 h).
function vigilarGitHub() {
  const r = UrlFetchApp.fetch('https://raw.githubusercontent.com/Bga1906/cartera-precios-diarios/main/latido.json', {muteHttpExceptions: true});
  let aviso = null;
  if (r.getResponseCode() !== 200) {
    aviso = 'No se pudo leer latido.json de GitHub (codigo ' + r.getResponseCode() + ').';
  } else {
    const horas = (Date.now() - new Date(JSON.parse(r.getContentText()).generado_en).getTime()) / 3600000;
    if (horas > 30) aviso = 'La captura de precios de GitHub no se actualiza desde hace ' + Math.round(horas) + ' horas.';
  }
  if (!aviso) return;
  const props = PropertiesService.getScriptProperties();
  const ultimo = Number(props.getProperty('ultimo_aviso') || 0);
  if (Date.now() - ultimo < 24 * 3600000) return;
  MailApp.sendEmail(Session.getActiveUser().getEmail(), 'Aviso: captura de precios parada', aviso);
  props.setProperty('ultimo_aviso', String(Date.now()));
}

// Ejecutar UNA vez a mano: crea los dos disparadores (foto diaria a las 23:00 y vigilancia cada 6 horas).
function instalarDisparadores() {
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('fotoNocturna').timeBased().everyDays(1).atHour(23).create();
  ScriptApp.newTrigger('vigilarGitHub').timeBased().everyHours(6).create();
}
