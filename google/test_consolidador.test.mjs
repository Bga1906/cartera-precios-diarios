// Tests del consolidador (F4). SOLO fotos inventadas (ningun dato real). FOTOS_SALIDA: donde dejar las consolidadas para el gemelo Python.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import path from 'node:path';

const SRC = fs.readFileSync(new URL('./consolidador.gs', import.meta.url), 'utf8');
const ctx = vm.createContext({ console });
vm.runInContext(SRC, ctx);
const C = ctx; // funciones del .gs
const J = (x) => JSON.parse(JSON.stringify(x)); // saca los objetos del contexto vm
const SALIDA = process.env.FOTOS_SALIDA || '';

// 26/10/2026 ya es horario de invierno en Madrid (UTC+1)
const T = (hhmm, dia = '2026-10-26') => new Date(`${dia}T${String(Number(hhmm.split(':')[0]) - 1).padStart(2, '0')}:${hhmm.split(':')[1]}:00Z`);
const HOY = '2026-10-26';
const rest = (f, dias) => new Date(Date.parse(f + 'T00:00:00Z') - dias * 86400000).toISOString().slice(0, 10);

function almacen(ficheros = {}, opt = {}) {
  const m = new Map(Object.entries(ficheros));
  return {
    m,
    listar: () => [...m.keys()],
    leer: (n) => { if (!m.has(n)) throw new Error('no existe'); return opt.corrompeLectura && n.startsWith('foto_consolidada_') ? '{}' : m.get(n); },
    existe: (n) => m.has(n),
    crear: (n, t) => { if (m.has(n)) throw new Error('ya existe'); m.set(n, t); },
    escribir: (n, t) => { m.set(n, t); }
  };
}

function posicion(id, valor, noLiq = false, tipo = 'fondo') {
  return { id, nombre: 'Pos ' + id, tipo, moneda: 'EUR', cantidad: 2, precio: valor / 2, precio_eur: valor / 2, valor_eur: valor,
    coste_eur: null, fecha_precio: HOY, estado_precio: 'ok', frescura: 'OK', dias_desfase: 0, estado_coste: 'sin_dato', no_liquido: noLiq, avisos: [],
    oficial: { cantidad_desde: '2026-01-01', fuente_cantidad: 'x' } };
}

function foto(clave, fecha, valores, { origen, noLiq = [] } = {}) {
  const pos = valores.map((v, i) => posicion(clave + ':' + i, v, noLiq.includes(i), clave === 'cripto' ? 'cripto' : 'fondo'));
  const liq = pos.filter((p) => !p.no_liquido).reduce((a, p) => a + p.valor_eur, 0);
  const nl = pos.filter((p) => p.no_liquido).reduce((a, p) => a + p.valor_eur, 0);
  const f = { formato: 'foto_cartera/v1', sheet: clave, fecha_foto: fecha, generado_utc: fecha + 'T21:00:00Z', version_script: 't', version_exportador: 't',
    fuente_precios: 'precios', fecha_captura_precios: fecha, huella: { hash: 'x' },
    totales: { valor_liquido_eur: liq, valor_no_liquido_eur: nl, valor_total_eur: liq + nl, aportado_efectivo_eur: null, coste_liquido_eur: null, resultado_liquido_eur: null },
    posiciones: pos, avisos: [] };
  if (origen === 'vault_provisional') { f.origen = origen; f.vehiculo = 'Vehiculo ' + clave; f.fecha_cierre = fecha; f.huella = { posiciones: pos.length, hash: C.consHuellaProvisional_(f) }; }
  return f;
}
const nom = (clave, fecha) => `foto_${clave}_${fecha}.json`;
const put = (a, f) => a.m.set(nom(f.sheet, f.fecha_foto), JSON.stringify(f));
function hoyCompleto(fecha = HOY) {
  return [foto('fondos', fecha, [100, 50], { noLiq: [1] }), foto('cripto', fecha, [10, 20], { origen: 'vault_provisional' }),
    foto('tr', fecha, [30], { origen: 'vault_provisional' }), foto('ibkr', fecha, [5, 6, 7], { origen: 'vault_provisional' })];
}
function almacenCon(fotos) { const a = almacen(); fotos.forEach((f) => put(a, f)); return a; }
const leerCons = (a, fecha = HOY) => JSON.parse(a.m.get(`foto_consolidada_${fecha}.json`));
const run = (a, hhmm, dia) => J(C.consEjecutar_(a, T(hhmm, dia), {}));

// ---------- 1. camino feliz ----------
test('4 fotos de hoy: completa, sumas y nº de posiciones cuadran, cada posicion lleva su vehiculo', () => {
  const a = almacenCon(hoyCompleto());
  const r = run(a, '08:30');
  assert.equal(r.accion, 'creada');
  const c = leerCons(a);
  assert.equal(c.completa, true); assert.equal(c.intento, 1); assert.equal(c.sustituye_a, null);
  assert.deepEqual(c.vehiculos.map((v) => v.estado), ['al_dia', 'al_dia', 'al_dia', 'al_dia']);
  assert.equal(c.totales.valor_total_eur, 100 + 50 + 30 + 30 + 18);
  assert.equal(c.totales.valor_no_liquido_eur, 50);
  assert.equal(c.posiciones.length, 8);
  assert.equal(c.posiciones.filter((p) => p.vehiculo === 'ibkr').length, 3);
  assert.deepEqual(J(C.consConsolidadaValidar_(c)), []);
  assert.equal(c.fecha_foto, HOY);
});

test('no toca los originales ni reescribe cifras: cada posicion es copia exacta + vehiculo', () => {
  const fs4 = hoyCompleto(); const a = almacenCon(fs4);
  const antes = JSON.stringify([...a.m.entries()]);
  run(a, '08:30');
  const c = leerCons(a);
  for (const f of fs4) for (const p of f.posiciones) {
    const q = c.posiciones.find((x) => x.id === p.id);
    const { vehiculo, ...sin } = q;
    assert.deepEqual(sin, p); assert.equal(vehiculo, f.sheet);
  }
  const despues = [...a.m.entries()].filter(([k]) => !k.startsWith('foto_consolidada_'));
  assert.equal(JSON.stringify(despues), antes);
});

test('es determinista: la misma entrada da la misma huella', () => {
  const a1 = almacenCon(hoyCompleto()), a2 = almacenCon(hoyCompleto());
  run(a1, '08:30'); run(a2, '08:45');
  assert.equal(leerCons(a1).huella.hash, leerCons(a2).huella.hash);
});

// ---------- 2. degradaciones ----------
test('falta un vehiculo: los demas entran, ese queda ausente, la consolidada se crea igual', () => {
  const a = almacenCon(hoyCompleto().filter((f) => f.sheet !== 'tr'));
  run(a, '08:30');
  const c = leerCons(a);
  assert.equal(c.completa, false); assert.deepEqual(c.ausentes, ['tr']);
  const tr = c.vehiculos.find((v) => v.clave === 'tr');
  assert.equal(tr.estado, 'ausente'); assert.equal(tr.totales, null); assert.equal(tr.fecha_foto, null); assert.equal(tr.n_posiciones, 0);
  assert.equal(c.totales.valor_total_eur, 100 + 50 + 30 + 18);
  assert.equal(c.posiciones.length, 7);
  assert.deepEqual(J(C.consConsolidadaValidar_(c)), []);
});

test('no hay ninguna foto: se escribe igualmente, todo ausente, con totales a cero', () => {
  const a = almacen(); run(a, '08:30');
  const c = leerCons(a);
  assert.equal(c.completa, false); assert.equal(c.ausentes.length, 4); assert.equal(c.totales.valor_total_eur, 0); assert.equal(c.posiciones.length, 0);
  assert.deepEqual(J(C.consConsolidadaValidar_(c)), []);
});

test('foto ilegible (JSON roto) y sin otra anterior: ausente + aviso; el resto entra', () => {
  const a = almacenCon(hoyCompleto()); a.m.set(nom('ibkr', HOY), '{"formato": "foto_cartera/v1", "posi');
  run(a, '08:30');
  const c = leerCons(a);
  const v = c.vehiculos.find((x) => x.clave === 'ibkr');
  assert.equal(v.estado, 'ausente');
  assert.ok(v.avisos.some((s) => /ilegible/.test(s)));
  assert.ok(c.avisos.some((s) => /ilegible/.test(s)));
  assert.equal(c.vehiculos.filter((x) => x.estado === 'al_dia').length, 3);
});

test('foto de hoy ilegible pero hay una valida de hace 2 dias: se usa esa, atrasado, con aviso', () => {
  const a = almacenCon(hoyCompleto().filter((f) => f.sheet !== 'ibkr'));
  a.m.set(nom('ibkr', HOY), 'no soy json');
  put(a, foto('ibkr', rest(HOY, 2), [1, 2], { origen: 'vault_provisional' }));
  run(a, '08:30');
  const v = leerCons(a).vehiculos.find((x) => x.clave === 'ibkr');
  assert.equal(v.estado, 'atrasado'); assert.equal(v.fecha_foto, rest(HOY, 2)); assert.equal(v.dias_atraso, 2); assert.equal(v.n_posiciones, 2);
  assert.ok(v.avisos.some((s) => /ilegible/.test(s)));
});

test('huella que no cuadra (provisional editada a mano): se rechaza como si no existiera', () => {
  const a = almacenCon(hoyCompleto());
  const f = JSON.parse(a.m.get(nom('cripto', HOY)));
  f.posiciones[0].cantidad = 999; // alguien toca una cantidad pero no la huella
  a.m.set(nom('cripto', HOY), JSON.stringify(f));
  run(a, '08:30');
  const c = leerCons(a);
  const v = c.vehiculos.find((x) => x.clave === 'cripto');
  assert.equal(v.estado, 'ausente');
  assert.ok(v.avisos.some((s) => /huella no cuadra/.test(s)));
  assert.equal(c.completa, false);
});

test('huella rota + foto anterior valida: cae a la anterior (atrasado)', () => {
  const a = almacenCon(hoyCompleto());
  const f = JSON.parse(a.m.get(nom('tr', HOY))); f.huella.hash = 'c53:0'; a.m.set(nom('tr', HOY), JSON.stringify(f));
  put(a, foto('tr', rest(HOY, 3), [9], { origen: 'vault_provisional' }));
  run(a, '08:30');
  const v = leerCons(a).vehiculos.find((x) => x.clave === 'tr');
  assert.equal(v.estado, 'atrasado'); assert.equal(v.dias_atraso, 3);
});

test('foto de hoy MALA y hay una anterior VALIDA: entra la anterior como atrasado (no ausente), para cada tipo de fallo', () => {
  const fallos = {
    'JSON roto': (a, k) => a.m.set(nom(k, HOY), '{roto'),
    'totales que no suman sus posiciones': (a, k) => { const f = JSON.parse(a.m.get(nom(k, HOY))); f.totales.valor_total_eur += 3; a.m.set(nom(k, HOY), JSON.stringify(f)); },
    'huella que no cuadra': (a, k) => { const f = JSON.parse(a.m.get(nom(k, HOY))); f.posiciones[0].cantidad += 1; a.m.set(nom(k, HOY), JSON.stringify(f)); }
  };
  for (const [fallo, rompe] of Object.entries(fallos)) {
    for (const k of ['cripto', 'fondos']) {
      if (fallo === 'huella que no cuadra' && k === 'fondos') continue; // la huella de fondos no se recalcula en Google (se verifica en el PC)
      const a = almacenCon(hoyCompleto());
      // la anterior valida es de AYER en fondos (Google: solo la de hoy es «al dia») y de hace 2 dias en las provisionales
      // (una provisional de ayer seria «al dia» por diseño, ver el test de edades)
      const dias = k === 'fondos' ? 1 : 2;
      put(a, k === 'fondos' ? foto('fondos', rest(HOY, dias), [100, 50], { noLiq: [1] }) : foto('cripto', rest(HOY, dias), [10, 20], { origen: 'vault_provisional' }));
      rompe(a, k);
      run(a, '08:30');
      const v = leerCons(a).vehiculos.find((x) => x.clave === k);
      assert.equal(v.estado, 'atrasado', `${k} / ${fallo}`);
      assert.equal(v.fecha_foto, rest(HOY, dias), `${k} / ${fallo}: usa la fecha REAL de la anterior`);
      assert.equal(v.dias_atraso, dias);
      assert.ok(v.avisos.some((s) => /se trata como si no existiera/.test(s)), `${k} / ${fallo}: deja aviso`);
    }
  }
});

test('fondos: la huella NO se recalcula en Google (se copia tal cual para que la verifique el PC)', () => {
  const a = almacenCon(hoyCompleto());
  const f = JSON.parse(a.m.get(nom('fondos', HOY))); f.huella = { libro_filas: 3, hash: 'c53:hash-que-solo-el-pc-puede-verificar' };
  a.m.set(nom('fondos', HOY), JSON.stringify(f));
  run(a, '08:30');
  const v = leerCons(a).vehiculos.find((x) => x.clave === 'fondos');
  assert.equal(v.estado, 'al_dia'); assert.equal(v.huella.hash, 'c53:hash-que-solo-el-pc-puede-verificar');
});

test('provisional de ayer = al dia; de hace 2 dias = atrasado (sin aviso); de hace 7 = atrasado con aviso', () => {
  const casos = [[1, 'al_dia', false], [2, 'atrasado', false], [6, 'atrasado', false], [7, 'atrasado', true]];
  for (const [dias, estado, conAviso] of casos) {
    const a = almacenCon(hoyCompleto().filter((f) => f.sheet !== 'cripto'));
    put(a, foto('cripto', rest(HOY, dias), [10], { origen: 'vault_provisional' }));
    run(a, '08:30');
    const v = leerCons(a).vehiculos.find((x) => x.clave === 'cripto');
    assert.equal(v.estado, estado, `edad ${dias}`);
    assert.equal(v.dias_atraso, dias);
    assert.equal(v.fecha_foto, rest(HOY, dias), 'la fecha es la real, nunca la de hoy');
    assert.equal(v.avisos.some((s) => /provisional de hace/.test(s)), conAviso, `aviso edad ${dias}`);
  }
});

test('foto de Google (fondos) de ayer = atrasado con aviso (solo es al dia la de hoy)', () => {
  const a = almacenCon(hoyCompleto().filter((f) => f.sheet !== 'fondos'));
  put(a, foto('fondos', rest(HOY, 1), [100, 50], { noLiq: [1] }));
  run(a, '08:30');
  const c = leerCons(a); const v = c.vehiculos.find((x) => x.clave === 'fondos');
  assert.equal(v.estado, 'atrasado'); assert.equal(v.dias_atraso, 1); assert.equal(v.fecha_foto, rest(HOY, 1));
  assert.ok(v.avisos.some((s) => /falta la foto de hoy/.test(s)));
  assert.deepEqual(c.atrasados, ['fondos']); assert.equal(c.completa, false);
});

test('foto de Google de hace 2 dias = atrasado', () => {
  const a = almacenCon(hoyCompleto().filter((f) => f.sheet !== 'fondos'));
  put(a, foto('fondos', rest(HOY, 2), [100, 50], { noLiq: [1] }));
  run(a, '08:30');
  const v = leerCons(a).vehiculos.find((x) => x.clave === 'fondos');
  assert.equal(v.estado, 'atrasado'); assert.equal(v.dias_atraso, 2);
});

test('foto con fecha futura, foto de otro vehiculo o con fecha interna distinta: se rechazan', () => {
  const a = almacenCon(hoyCompleto().filter((f) => !['tr', 'cripto', 'ibkr'].includes(f.sheet)));
  put(a, foto('tr', '2026-10-30', [1], { origen: 'vault_provisional' }));
  a.m.set(nom('cripto', HOY), JSON.stringify(foto('tr', HOY, [1], { origen: 'vault_provisional' }))); // dentro dice tr
  a.m.set(nom('ibkr', HOY), JSON.stringify(foto('ibkr', rest(HOY, 1), [1], { origen: 'vault_provisional' }))); // fecha interna distinta
  run(a, '08:30');
  const c = leerCons(a);
  for (const k of ['tr', 'cripto', 'ibkr']) assert.equal(c.vehiculos.find((x) => x.clave === k).estado, 'ausente', k);
  assert.ok(c.vehiculos.find((x) => x.clave === 'tr').avisos.some((s) => /futura/.test(s)));
  assert.ok(c.vehiculos.find((x) => x.clave === 'cripto').avisos.some((s) => /otro vehiculo/.test(s)));
  assert.ok(c.vehiculos.find((x) => x.clave === 'ibkr').avisos.some((s) => /no coincide/.test(s)));
});

test('foto con totales que no cuadran con sus posiciones: se rechaza', () => {
  const a = almacenCon(hoyCompleto());
  const f = JSON.parse(a.m.get(nom('fondos', HOY))); f.totales.valor_total_eur += 5; a.m.set(nom('fondos', HOY), JSON.stringify(f));
  run(a, '08:30');
  assert.equal(leerCons(a).vehiculos.find((x) => x.clave === 'fondos').estado, 'ausente');
});

// ---------- 3. segundo intento ----------
test('1.er intento incompleto, 2.º intento con mas datos: sustituye y deja rastro de a quien sustituye', () => {
  const a = almacenCon(hoyCompleto().filter((f) => f.sheet !== 'fondos'));
  run(a, '08:30');
  const c1 = leerCons(a); assert.equal(c1.completa, false); assert.equal(c1.intento, 1);
  put(a, hoyCompleto()[0]); // llega la foto de fondos
  const r = run(a, '11:30');
  assert.equal(r.accion, 'sustituida');
  const c2 = leerCons(a);
  assert.equal(c2.completa, true); assert.equal(c2.intento, 2);
  assert.equal(c2.sustituye_a.generado_utc, c1.generado_utc); assert.equal(c2.sustituye_a.intento, 1);
  assert.deepEqual(J(C.consConsolidadaValidar_(c2)), []);
});

test('2.º intento sin datos nuevos: no cambia nada', () => {
  const a = almacenCon(hoyCompleto().filter((f) => f.sheet !== 'fondos'));
  run(a, '08:30'); const antes = a.m.get(`foto_consolidada_${HOY}.json`);
  const r = run(a, '11:30');
  assert.equal(r.accion, 'mantenida'); assert.equal(a.m.get(`foto_consolidada_${HOY}.json`), antes);
});

test('si la primera salio COMPLETA el segundo intento no la toca, aunque el dia siguiente cambie algo', () => {
  const a = almacenCon(hoyCompleto()); run(a, '08:30'); const antes = a.m.get(`foto_consolidada_${HOY}.json`);
  const r = run(a, '11:30');
  assert.equal(r.accion, 'mantenida'); assert.match(r.motivo, /completo/); assert.equal(a.m.get(`foto_consolidada_${HOY}.json`), antes);
});

test('desde las 12:00 no se sustituye nada, aunque haya mas datos', () => {
  const a = almacenCon(hoyCompleto().filter((f) => f.sheet !== 'fondos'));
  run(a, '08:30'); const antes = a.m.get(`foto_consolidada_${HOY}.json`);
  put(a, hoyCompleto()[0]);
  const r = run(a, '12:30');
  assert.equal(r.accion, 'mantenida'); assert.match(r.motivo, /ventana cerrada/); assert.equal(a.m.get(`foto_consolidada_${HOY}.json`), antes);
});

test('2.º intento donde un vehiculo EMPEORA (ya no esta la foto): no sustituye', () => {
  const a = almacenCon(hoyCompleto().filter((f) => f.sheet !== 'fondos'));
  run(a, '08:30'); const antes = a.m.get(`foto_consolidada_${HOY}.json`);
  put(a, hoyCompleto()[0]); a.m.delete(nom('tr', HOY)); // mejora fondos, pero tr desaparece
  const r = run(a, '11:30');
  assert.equal(r.accion, 'mantenida'); assert.equal(a.m.get(`foto_consolidada_${HOY}.json`), antes);
});

test('consolidada existente ilegible: se sustituye', () => {
  const a = almacenCon(hoyCompleto()); a.m.set(`foto_consolidada_${HOY}.json`, 'basura');
  const r = run(a, '11:30');
  assert.equal(r.accion, 'sustituida'); assert.equal(leerCons(a).completa, true);
});

test('el intento se cuenta por la hora: antes de las 10 = 1, despues = 2', () => {
  const a = almacenCon(hoyCompleto().filter((f) => f.sheet !== 'fondos')); run(a, '09:59'); assert.equal(leerCons(a).intento, 1);
  const b = almacenCon(hoyCompleto().filter((f) => f.sheet !== 'fondos')); run(b, '10:00'); assert.equal(leerCons(b).intento, 2);
});

test('no mezcla dias: la consolidada de ayer queda como estaba', () => {
  const a = almacenCon(hoyCompleto()); a.m.set('foto_consolidada_2026-10-25.json', 'ayer');
  run(a, '08:30');
  assert.equal(a.m.get('foto_consolidada_2026-10-25.json'), 'ayer');
});

// ---------- 4. autocomprobacion ----------
test('autocomprobacion: si la suma de vehiculos no es el total, NO escribe y falla', () => {
  const a = almacenCon(hoyCompleto());
  const lect = C.CONS_CFG.VEHICULOS.map((v) => C.consLeerVehiculo_(a, a.listar(), v, HOY));
  const c = J(C.consConstruir_(lect, T('08:30'), 1)); c.totales.valor_total_eur += 1;
  assert.throws(() => C.consGuardar_(a, c, T('08:30')), /Autocomprobacion fallida/);
  assert.equal(a.m.has(`foto_consolidada_${HOY}.json`), false);
});

test('autocomprobacion: si falta una posicion, NO escribe y falla', () => {
  const a = almacenCon(hoyCompleto());
  const lect = C.CONS_CFG.VEHICULOS.map((v) => C.consLeerVehiculo_(a, a.listar(), v, HOY));
  const c = J(C.consConstruir_(lect, T('08:30'), 1)); c.posiciones.pop();
  assert.throws(() => C.consGuardar_(a, c, T('08:30')), /posiciones/);
  assert.equal(a.m.has(`foto_consolidada_${HOY}.json`), false);
});

test('relectura: si lo escrito no coincide con lo previsto, falla con mensaje claro', () => {
  const a = almacen(Object.fromEntries(hoyCompleto().map((f) => [nom(f.sheet, f.fecha_foto), JSON.stringify(f)])), { corrompeLectura: true });
  assert.throws(() => C.consEjecutar_(a, T('08:30'), {}), /no coincide con lo que debia escribirse/);
});

test('ensayo: no escribe nada y dice si la autocomprobacion pasaria', () => {
  const a = almacenCon(hoyCompleto()); const antes = a.m.size;
  const r = J(C.consEjecutar_(a, T('08:30'), { sinEscribir: true }));
  assert.equal(r.accion, 'ensayo'); assert.deepEqual(r.errores, []); assert.equal(a.m.size, antes);
});

// ---------- 5. higiene del codigo ----------
test('el codigo no lleva datos personales ni ids de Drive', () => {
  assert.doesNotMatch(SRC, /\bES\d{2}\s?\d{4}/); // IBAN
  assert.doesNotMatch(SRC, /\b\d{8}[A-Za-z]\b/); // NIF
  assert.doesNotMatch(SRC, /[A-Za-z0-9_-]{28,}/); // ids de Drive / claves largas
  assert.doesNotMatch(SRC, /@[a-z0-9-]+\.[a-z]{2,}/i); // correos
  assert.doesNotMatch(SRC, /https?:\/\//); // sin llamadas ni enlaces externos
  assert.doesNotMatch(SRC, /UrlFetchApp|MailApp|GmailApp|setTrashed|deleteFile|removeFile/); // no envia ni borra
});

test('hash y canon coinciden con los de F3 (vector fijo)', () => {
  assert.equal(C.consCanon_({ b: 1.123456789012, a: [null, 'x'] }), '{"a":[null,"x"],"b":1.12345679}');
  assert.equal(C.consHash_('hola'), C.consHash_('hola')); assert.notEqual(C.consHash_('hola'), C.consHash_('holb'));
});

test('SALIDA: deja una consolidada sintetica para el gemelo Python', { skip: !SALIDA }, () => {
  fs.mkdirSync(SALIDA, { recursive: true });
  const a = almacenCon(hoyCompleto().filter((f) => f.sheet !== 'tr')); run(a, '08:30');
  fs.writeFileSync(path.join(SALIDA, 'sintetica_incompleta.json'), a.m.get(`foto_consolidada_${HOY}.json`));
  const b = almacenCon(hoyCompleto()); run(b, '08:30');
  fs.writeFileSync(path.join(SALIDA, 'sintetica_completa.json'), b.m.get(`foto_consolidada_${HOY}.json`));
});
