// Pruebas de la foto diaria del Sheet «CRYPTO» (F5). Ejecutan el CODIGO REAL de foto_cartera.gs y fotos_cripto.gs en Node,
// con las pestanas, Drive y las propiedades simulados en memoria (cifras INVENTADAS, nada personal).
//   node --test google/test_fotos_cripto.test.mjs
// Variable opcional: FOTOS_SALIDA=carpeta  guarda ahi fotos de muestra (las valida despues el validador de Python).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const SALIDA = process.env.FOTOS_SALIDA || null;
const leer = (f) => fs.readFileSync(path.join(AQUI, f), 'utf8');

function cargar(globales = {}) {
  const ctx = vm.createContext({ console, ...globales });
  for (const f of ['foto_cartera.gs', 'fotos_cripto.gs']) vm.runInContext(leer(f), ctx, { filename: f });
  return ctx;
}
const J = (x) => JSON.parse(JSON.stringify(x));   // saca los objetos del "mundo" de vm
function guardarMuestra(nombre, texto) { if (SALIDA) { fs.mkdirSync(SALIDA, { recursive: true }); fs.writeFileSync(path.join(SALIDA, nombre), typeof texto === 'string' ? texto : JSON.stringify(texto, null, 1)); } }

// ---------------------------------------------------------------- datos inventados

const AHORA = new Date('2026-10-27T06:35:00Z');      // 07:35 en Madrid (horario de invierno desde el 25/10)
const HOY = '2026-10-27';
const BTC = 'bitcoin:btc', ETH = 'cripto:eth', SOL = 'cripto:sol';

const OPS_CAB = ['Fecha', 'Plataforma', 'Tipo', 'Cantidad\nBTC', 'Pagado\n€', 'Comisión pagada', 'Comisión devuelta', 'Coste neto €',
  'Precio efectivo', 'Valor hoy €', 'Ganancia', 'G/P %', 'Divisa original', 'Importe en divisa', 'Tipo de cambio', 'Estado', 'ID de operación', 'Notas'];
const op = (fecha, tipo, cant, pagado, formulas = [pagado, 1, 1, 1, 1]) =>
  [fecha, 'Bitvavo', tipo, cant, pagado, null, null, ...formulas, 'EUR', null, null, 'VERIFICADO', 'ID-' + fecha, null];
const OTRAS_CAB = ['Fecha', 'Activo (símbolo)', 'Tipo', 'Cantidad', 'Importe €', 'Plataforma', 'Nota'];
const EXPO_CAB = ['Activo', 'Nombre', 'Cantidad', 'Dinero neto\npuesto €'];
const vacia = () => [null, null, null, null];

function expo(monedas) {
  const f = monedas.map((m) => m.slice());
  while (f.length < 16) f.push(vacia());           // filas 8 a 23 de la hoja
  f.push(['TOTAL', null, null, 0]);                // fila 24
  f.push([null, null, null, null], ['Resumen rápido', null, null, null]);   // lo que hay debajo no debe leerse
  return { cabecera: EXPO_CAB, filas: f };
}

function rawBase(extra = {}) {
  return {
    exposicion: expo([['BTC', 'Bitcoin', 0.5, 32000]]),
    operaciones: { cabecera: OPS_CAB, filas: [op('2026-09-01', 'Compra', 0.3, 18000), op('2026-10-07', 'Compra', 0.2, 14000)] },
    otras: { cabecera: OTRAS_CAB, filas: [] },
    cuadre: ['Estado general:', '✅ Todos los controles cuadran', null],
    ...extra,
  };
}
// Varias monedas: BTC + ETH (compra y venta) + SOL (alta recien escrita, sin compras ni precio oficial)
function rawVarias() {
  return rawBase({
    exposicion: expo([['BTC', 'Bitcoin', 0.5, 32000], ['ETH ', 'Ether', 1.5, 4400], [' sol', 'Solana', 10, 1000]]),
    otras: { cabecera: OTRAS_CAB, filas: [['2026-10-10', 'ETH', 'Compra', 2, 6000, 'Bitvavo', null], ['2026-10-12', 'eth', 'Venta', 0.5, 1600, 'Bitvavo', null]] },
  });
}
const ent = (precio, extra = {}) => ({ estado_precio: 'ok', precio, fecha_dato: '2026-10-26', fuente_elegida: 'yahoo', moneda: 'EUR', motivo: '', ...extra });
const oficialBase = () => ({ fecha: '2026-10-26', activos: { [BTC]: ent(70000), [ETH]: ent(3000) } });
const preciosBase = () => ({
  '2026-09-25': { [BTC]: { price: 59000, ok: true, moneda: 'EUR' } },        // anterior al 26/09: no entra
  '2026-09-26': { [BTC]: { price: 60000, ok: true, moneda: 'EUR' } },
  '2026-10-06': { [BTC]: { price: 61000, ok: true, moneda: 'EUR' } },
  '2026-10-07': { [BTC]: { price: 62000, ok: true, moneda: 'EUR' } },
  '2026-10-26': { [BTC]: { price: 70000, ok: true, moneda: 'EUR' }, [ETH]: { price: 3000, ok: true, moneda: 'EUR' } },
});
const ctxBase = (extra = {}) => ({ raw: rawBase(), oficial: oficialBase(), precios: preciosBase(), ahora: AHORA, scriptVersion: 'prueba', ...extra });
const pos = (foto, id) => foto.posiciones.find((p) => p.id === id);

function almacenMem() {
  const m = new Map();
  return { m, existe: (n) => m.has(n), escribir: (n, t) => { m.set(n, t); }, crear: (n, t) => { if (m.has(n)) throw new Error('ya existe ' + n); m.set(n, t); } };
}

// ---------------------------------------------------------------- molde, ids y precio

test('BTC: la foto cumple el molde, usa el id historico y el precio de la captura oficial', () => {
  const g = cargar();
  const r = J(g.fotosCriptoGenerar_(ctxBase()));
  assert.deepEqual(J(g.fotoValidar_(r.foto)), []);
  const f = r.foto;
  assert.equal(f.formato, 'foto_cartera/v1');
  assert.equal(f.sheet, 'cripto');
  assert.equal(f.vehiculo, 'Cripto');
  assert.equal(f.origen, undefined, 'una foto del Sheet no lleva origen (por defecto es «sheet»)');
  assert.equal(f.fecha_foto, HOY);
  assert.equal(f.fecha_cierre, '2026-10-26');
  assert.equal(f.fuente_precios, 'oficial');
  assert.equal(f.fecha_captura_precios, '2026-10-26');
  assert.equal(f.posiciones.length, 1);
  const p = f.posiciones[0];
  assert.equal(p.id, 'bitcoin:btc');
  assert.equal(p.nombre, 'btc');
  assert.equal(p.tipo, 'cripto');
  assert.equal(p.cantidad, 0.5);
  assert.equal(p.precio, 70000);
  assert.equal(p.precio_eur, 70000);
  assert.equal(p.fecha_precio, '2026-10-26');
  assert.equal(p.dias_desfase, 1);
  assert.equal(p.estado_precio, 'ok');
  assert.equal(p.valor_eur, 35000);
  assert.equal(p.no_liquido, false);
  assert.equal(f.totales.valor_liquido_eur, 35000);
  assert.equal(f.totales.valor_no_liquido_eur, 0);
  assert.equal(f.totales.valor_total_eur, 35000);
  assert.equal(f.totales.aportado_efectivo_eur, null);
  guardarMuestra('foto_cripto_2026-10-27.json', JSON.stringify(f, null, 1));
  guardarMuestra('libro_cripto.json', r.libro);
  guardarMuestra('historial_cripto.json', r.historial);
});

test('el precio es el oficial: cambia con oficial/ultimo.json y nada de la hoja (Google Finance) entra', () => {
  const g = cargar();
  const c = ctxBase({ oficial: { fecha: '2026-10-26', activos: { [BTC]: ent(71000) } } });
  const p = pos(J(g.fotosCriptoGenerar_(c)).foto, BTC);
  assert.equal(p.precio, 71000);
  assert.equal(p.valor_eur, 35500);
  // la lectura de «Exposicion» solo trae B..E (simbolo, nombre, cantidad, dinero neto): no hay columna de precio que leer
  const t = leer('fotos_cripto.gs');
  assert.equal(FOTOS_CRIPTO_NCOLS(g), 4);
  assert.ok(!/GOOGLEFINANCE/i.test(t.replace(/\/\*[\s\S]*?\*\//g, '')), 'GOOGLEFINANCE solo puede aparecer en comentarios');
});
function FOTOS_CRIPTO_NCOLS(g) { return vm.runInContext('FOTOS_CRIPTO.EXPO_NCOLS', g); }

test('estado «dudoso» del oficial se conserva; «sin_dato» del oficial sale como sin_dato', () => {
  const g = cargar();
  const d = pos(J(g.fotosCriptoGenerar_(ctxBase({ oficial: { fecha: '2026-10-26', activos: { [BTC]: ent(70000, { estado_precio: 'dudoso', motivo: 'fuentes discrepan' }) } } }))).foto, BTC);
  assert.equal(d.estado_precio, 'dudoso');
  assert.equal(d.valor_eur, 35000);
  assert.equal(d.oficial.motivo, 'fuentes discrepan');
  const s = pos(J(g.fotosCriptoGenerar_(ctxBase({ oficial: { fecha: '2026-10-26', activos: { [BTC]: ent(null, { estado_precio: 'sin_dato' }) } } }))).foto, BTC);
  assert.equal(s.estado_precio, 'sin_dato');
  assert.equal(s.valor_eur, null);
});

// ---------------------------------------------------------------- coste

test('coste: BTC «cuadrado» solo si «Cuadre» lo dice en ESTA pasada; si no, «sin verificar»', () => {
  const g = cargar();
  const p = pos(J(g.fotosCriptoGenerar_(ctxBase())).foto, BTC);
  assert.equal(p.coste_eur, 32000);
  assert.equal(p.coste_tipo, 'neto_caja');
  assert.equal(p.estado_coste, 'cuadrado');
  assert.equal(J(g.fotosCriptoGenerar_(ctxBase())).foto.totales.coste_liquido_eur, 32000);
  for (const cuadre of [['⚠ No todos los controles cuadran'], ['Estado general:', 'Revisar 2 controles'], [], null]) {
    const r = J(g.fotosCriptoGenerar_(ctxBase({ raw: rawBase({ cuadre }) })));
    const q = pos(r.foto, BTC);
    assert.equal(q.estado_coste, 'sin verificar', JSON.stringify(cuadre));
    assert.equal(q.coste_eur, 32000);
    assert.ok(r.foto.avisos.some((a) => a.includes('Cuadre')));
    assert.deepEqual(J(g.fotoValidar_(r.foto)), []);
  }
});

test('coste: cualquier otra moneda es «sin verificar» aunque Cuadre cuadre; sin dato = null y sin_dato', () => {
  const g = cargar();
  const r = J(g.fotosCriptoGenerar_(ctxBase({ raw: rawVarias() })));
  assert.equal(pos(r.foto, BTC).estado_coste, 'cuadrado');
  assert.equal(pos(r.foto, ETH).estado_coste, 'sin verificar');
  assert.equal(pos(r.foto, ETH).coste_tipo, 'neto_caja');
  assert.equal(pos(r.foto, ETH).coste_eur, 4400);
  const raw = rawBase({ exposicion: expo([['BTC', 'Bitcoin', 0.5, null]]) });
  const q = pos(J(g.fotosCriptoGenerar_(ctxBase({ raw }))).foto, BTC);
  assert.equal(q.coste_eur, null);
  assert.equal(q.coste_tipo, null);
  assert.equal(q.estado_coste, 'sin_dato');
});

// ---------------------------------------------------------------- monedas nuevas sin tocar codigo

test('varias monedas: todas las filas entran, ids «cripto:simbolo» y BTC con su id de siempre', () => {
  const g = cargar();
  const r = J(g.fotosCriptoGenerar_(ctxBase({ raw: rawVarias(), ahora: new Date('2026-10-28T06:35:00Z') })));
  assert.deepEqual(J(g.fotoValidar_(r.foto)), []);
  assert.deepEqual(r.foto.posiciones.map((p) => p.id), [BTC, ETH, SOL]);
  assert.deepEqual(r.foto.posiciones.map((p) => p.nombre), ['btc', 'eth', 'sol']);
  assert.equal(pos(r.foto, ETH).valor_eur, 4500);            // 1,5 x 3000
  assert.equal(r.foto.totales.valor_liquido_eur, 39500);     // SOL sin precio no suma
  assert.ok(r.foto.avisos.some((a) => a.includes('SOL')), 'el libro no explica la cantidad de SOL: debe avisar');
  guardarMuestra('foto_cripto_2026-10-28.json', JSON.stringify(r.foto, null, 1));
});

test('una moneda nueva sin precio oficial entra igualmente: sin_dato, valor null y aviso «sin precio oficial»', () => {
  const g = cargar();
  const r = J(g.fotosCriptoGenerar_(ctxBase({ raw: rawVarias(), ahora: new Date('2026-10-29T06:35:00Z') })));
  const s = pos(r.foto, SOL);
  assert.equal(s.estado_precio, 'sin_dato');
  assert.equal(s.precio, null);
  assert.equal(s.precio_eur, null);
  assert.equal(s.fecha_precio, null);
  assert.equal(s.valor_eur, null);
  assert.equal(s.cantidad, 10);
  assert.ok(s.avisos.includes('sin precio oficial'));
  assert.deepEqual(J(g.fotoValidar_(r.foto)), []);
  assert.ok(r.foto.posiciones.every((p) => p.estado_precio !== 'sin_oficial'), 'sin_oficial no se usa nunca');
  guardarMuestra('foto_cripto_2026-10-29.json', JSON.stringify(r.foto, null, 1));
});

test('con cantidad 0 y sin precio el valor es 0, no un null mudo; sin cantidad el valor es null y avisa', () => {
  const g = cargar();
  const raw = rawBase({ exposicion: expo([['BTC', 'Bitcoin', 0.5, 32000], ['XRP', 'XRP', 0, 0], ['ADA', 'Cardano', null, null]]) });
  const r = J(g.fotosCriptoGenerar_(ctxBase({ raw })));
  assert.equal(pos(r.foto, 'cripto:xrp').valor_eur, 0);
  assert.equal(pos(r.foto, 'cripto:ada').valor_eur, null);
  assert.ok(pos(r.foto, 'cripto:ada').avisos.includes('sin_cantidad'));
  assert.deepEqual(J(g.fotoValidar_(r.foto)), []);
});

test('sin oficial/ultimo.json (no se pudo leer): todo sale sin_dato con aviso y la foto sigue siendo valida', () => {
  const g = cargar();
  const r = J(g.fotosCriptoGenerar_(ctxBase({ oficial: null, ahora: new Date('2026-10-30T06:35:00Z') })));
  const p = pos(r.foto, BTC);
  assert.equal(p.estado_precio, 'sin_dato');
  assert.equal(p.valor_eur, null);
  assert.ok(p.avisos.includes('sin precio oficial'));
  assert.ok(r.foto.avisos.some((a) => a.includes('oficial/ultimo.json')));
  assert.equal(r.foto.fecha_captura_precios, null);
  assert.equal(r.foto.fecha_cierre, null);
  assert.deepEqual(J(g.fotoValidar_(r.foto)), []);
  guardarMuestra('foto_cripto_2026-10-30.json', JSON.stringify(r.foto, null, 1));
});

test('un precio oficial en otra moneda no se convierte: sin_dato con aviso', () => {
  const g = cargar();
  const p = pos(J(g.fotosCriptoGenerar_(ctxBase({ oficial: { fecha: '2026-10-26', activos: { [BTC]: ent(80000, { moneda: 'USD' }) } } }))).foto, BTC);
  assert.equal(p.estado_precio, 'sin_dato');
  assert.equal(p.valor_eur, null);
  assert.ok(p.avisos.some((a) => a.includes('USD')));
});

test('filas raras de «Exposicion»: simbolo no valido = aviso y se salta; repetido = error; lo de debajo de TOTAL no se lee', () => {
  const g = cargar();
  const raw = rawBase({ exposicion: expo([['BTC', 'Bitcoin', 0.5, 32000], ['E T H!', 'raro', 1, 10], [null, null, 3, null]]) });
  const r = J(g.fotosCriptoGenerar_(ctxBase({ raw })));
  assert.deepEqual(r.foto.posiciones.map((p) => p.id), [BTC]);
  assert.equal(r.foto.avisos.filter((a) => a.includes('Exposicion fila')).length, 2);
  const dup = rawBase({ exposicion: expo([['BTC', 'Bitcoin', 0.5, 32000], ['btc', 'otra', 1, 1]]) });
  assert.throws(() => g.fotosCriptoGenerar_(ctxBase({ raw: dup })), /dos veces/);
});

// ---------------------------------------------------------------- forma de las pestanas

test('si una pestana cambia de forma NO se genera la foto y el error lo dice claro', () => {
  const g = cargar();
  const raw1 = rawBase(); raw1.operaciones.cabecera = raw1.operaciones.cabecera.slice(); raw1.operaciones.cabecera[3] = 'Precio';
  assert.throws(() => g.fotosCriptoGenerar_(ctxBase({ raw: raw1 })), /Operaciones.*ya no tiene la forma esperada/);
  const raw2 = rawBase(); raw2.exposicion = { cabecera: EXPO_CAB, filas: raw2.exposicion.filas.filter((r) => r[0] !== 'TOTAL') };
  assert.throws(() => g.fotosCriptoGenerar_(ctxBase({ raw: raw2 })), /TOTAL/);
  const raw3 = rawBase(); raw3.exposicion = { cabecera: ['Activo', 'Nombre', 'Valor', 'Dinero neto'], filas: raw3.exposicion.filas };
  assert.throws(() => g.fotosCriptoGenerar_(ctxBase({ raw: raw3 })), /Exposici.n.*cantidad/);
  const alm = almacenMem();
  const r = J(g.exportarFotosCripto_({ ...ctxBase({ raw: raw1 }), almacen: alm }));
  assert.equal(r.foto, 'error');
  assert.equal(alm.m.size, 0, 'con la forma rota no se escribe nada');
});

// ---------------------------------------------------------------- huella, libro e historial

test('la huella no cambia con el precio ni con las formulas, y cambia si apuntas una operacion', () => {
  const g = cargar();
  const h = (raw, oficial) => J(g.fotosCriptoGenerar_(ctxBase({ raw, oficial: oficial || oficialBase() }))).foto.huella.hash;
  const base = h(rawBase());
  assert.equal(h(rawBase(), { fecha: '2026-10-26', activos: { [BTC]: ent(99999) } }), base);
  const conFormulas = rawBase(); conFormulas.operaciones.filas = [op('2026-09-01', 'Compra', 0.3, 18000, [1, 2, 3, 4, 5]), op('2026-10-07', 'Compra', 0.2, 14000, [9, 9, 9, 9, 9])];
  assert.equal(h(conFormulas), base);
  const nueva = rawBase(); nueva.operaciones.filas = nueva.operaciones.filas.concat([op('2026-10-20', 'Compra', 0.01, 700)]);
  assert.notEqual(h(nueva), base);
  const eth = rawVarias();
  assert.notEqual(h(eth), base);
  assert.equal(J(g.fotosCriptoGenerar_(ctxBase())).foto.huella.operaciones_filas, 2);
});

test('el libro conserva las filas en bruto y lo que se interpreto de ellas', () => {
  const g = cargar();
  const { libro } = J(g.fotosCriptoGenerar_(ctxBase({ raw: rawVarias() })));
  assert.equal(libro.formato, 'libro_cartera/v1');
  assert.equal(libro.sheet, 'cripto');
  assert.equal(libro.libro.filas.length, 2);
  assert.equal(libro.compras_nuevas.filas.length, 2);
  assert.deepEqual(libro.interpretado.movimientos.map((m) => [m.id, m.cantidad, m.origen]), [[BTC, 0.3, 'operaciones'], [BTC, 0.2, 'operaciones'], [ETH, 2, 'otras_criptos'], [ETH, -0.5, 'otras_criptos']]);
  assert.ok(libro.exposicion.filas.length === 3 && libro.exposicion.filas.every((r) => r[0]), 'solo filas con simbolo, sin TOTAL ni lo de debajo');
});

test('el historial arranca el 26/09, usa los ficheros de precios que existen y suma el libro hasta cada fecha', () => {
  const g = cargar();
  const { historial } = J(g.fotosCriptoGenerar_(ctxBase()));
  assert.equal(historial.formato, 'historial_cartera/v1');
  assert.deepEqual(historial.ids, [BTC]);
  assert.deepEqual(historial.series.map((s) => s.fecha), ['2026-09-26', '2026-10-06', '2026-10-07', '2026-10-26']);
  assert.deepEqual(historial.series.map((s) => s.posiciones[BTC].cantidad), [0.3, 0.3, 0.5, 0.5]);
  assert.deepEqual(historial.series.map((s) => s.valor_liquido_eur), [18000, 18300, 31000, 35000]);
  assert.ok(historial.series.every((s) => s.incompleto === false));
  assert.deepEqual(historial.avisos, []);
});

test('historial: sin precio un dia = valor null e incompleto (no se inventa); compra y venta de otras monedas con signo', () => {
  const g = cargar();
  const precios = preciosBase(); precios['2026-10-26'] = { [ETH]: { price: 3000, ok: true, moneda: 'EUR' } };   // ese dia BTC no tiene precio
  const { historial } = J(g.fotosCriptoGenerar_(ctxBase({ raw: rawVarias(), precios })));
  const ult = historial.series[historial.series.length - 1];
  assert.equal(ult.posiciones[BTC].valor_eur, null);
  assert.equal(ult.incompleto, true);
  assert.equal(ult.posiciones[ETH].cantidad, 1.5);
  assert.equal(ult.posiciones[ETH].valor_eur, 4500);
  assert.equal(historial.series[0].posiciones[ETH].cantidad, 0);       // antes de la primera compra de ETH
  assert.equal(historial.series[0].posiciones[ETH].valor_eur, 0);
});

test('si no se pudieron leer los precios diarios el historial sale vacio con aviso, y la foto sale igual', () => {
  const g = cargar();
  const r = J(g.fotosCriptoGenerar_(ctxBase({ precios: null })));
  assert.deepEqual(r.historial.series, []);
  assert.ok(r.historial.avisos.length === 1);
  assert.deepEqual(J(g.fotoValidar_(r.foto)), []);
});

test('un libro que no explica la cantidad de «Exposicion» avisa; movimientos de una moneda sin alta tambien', () => {
  const g = cargar();
  const raw = rawBase({ exposicion: expo([['BTC', 'Bitcoin', 0.6, 32000]]),
    otras: { cabecera: OTRAS_CAB, filas: [['2026-10-10', 'DOT', 'Compra', 5, 40, 'Bitvavo', null], ['2026-10-11', 'XLM', 'Regalo', 5, 0, 'Bitvavo', null]] } });
  const r = J(g.fotosCriptoGenerar_(ctxBase({ raw })));
  assert.ok(r.foto.avisos.some((a) => a.includes('BTC') && a.includes('no cuadra')));
  assert.ok(r.foto.avisos.some((a) => a.includes('DOT') && a.includes('dar de alta') === false && a.includes('falta darla de alta')));
  assert.ok(r.foto.avisos.some((a) => a.includes('XLM') === false && a.includes('tipo')));
  assert.deepEqual(r.historial.ids, [BTC, 'cripto:dot']);
});

test('una venta en «Operaciones» resta aunque la cantidad se teclee en positivo', () => {
  const g = cargar();
  const raw = rawBase({ exposicion: expo([['BTC', 'Bitcoin', 0.4, 100]]) });
  raw.operaciones.filas.push(op('2026-10-20', 'Venta', 0.1, 7000));
  const r = J(g.fotosCriptoGenerar_(ctxBase({ raw })));
  assert.equal(r.historial.series[r.historial.series.length - 1].posiciones[BTC].cantidad, 0.4);
  assert.ok(!r.foto.avisos.some((a) => a.includes('no cuadra')));
});

// ---------------------------------------------------------------- guardado

test('la foto del dia se crea una vez y no se sobrescribe; libro e historial si; antes de las 07:00 no se crea', () => {
  const g = cargar();
  const alm = almacenMem();
  const antes = J(g.exportarFotosCripto_({ ...ctxBase({ ahora: new Date('2026-10-27T05:30:00Z') }), almacen: alm, modo: 'ensayo' }));
  assert.equal(antes.foto, 'antes_de_hora');
  assert.ok(!alm.m.has('foto_cripto_2026-10-27.json'));
  const r1 = J(g.exportarFotosCripto_({ ...ctxBase(), almacen: alm, modo: 'ensayo' }));
  assert.equal(r1.foto, 'creada');
  assert.equal(r1.nombre, 'foto_cripto_2026-10-27.json');
  assert.equal(r1.modo, 'ensayo');
  assert.deepEqual([...alm.m.keys()].sort(), ['foto_cripto_2026-10-27.json', 'historial_cripto.json', 'libro_cripto.json']);
  const primera = alm.m.get('foto_cripto_2026-10-27.json');
  const r2 = J(g.exportarFotosCripto_({ ...ctxBase({ oficial: { fecha: '2026-10-26', activos: { [BTC]: ent(75000) } }, ahora: new Date('2026-10-27T08:00:00Z') }), almacen: alm, modo: 'ensayo' }));
  assert.equal(r2.foto, 'ya_existia');
  assert.equal(alm.m.get('foto_cripto_2026-10-27.json'), primera, 'la foto del dia cambio');
});

test('un fallo al guardar no lanza excepcion: devuelve error; una foto invalida no se guarda', () => {
  const g = cargar();
  const roto = { existe: () => false, escribir: () => { throw new Error('Drive caido'); }, crear: () => {} };
  const malo = J(g.exportarFotosCripto_({ ...ctxBase(), almacen: roto, modo: 'ensayo' }));
  assert.equal(malo.foto, 'error');
  assert.match(malo.error, /Drive caido/);
  // una foto invalida (aqui, forzada: totales que no cuadran) no llega a escribirse
  const alm = almacenMem();
  const r = g.fotosCriptoGenerar_(ctxBase());
  r.foto.totales.valor_total_eur = 1;
  assert.throws(() => g.fotoGuardar_(alm, 'cripto', r.foto, r.libro, r.historial, AHORA, {}), /foto invalida/);
  assert.equal(alm.m.size, 0);
});

// ---------------------------------------------------------------- Drive simulado: ensayo vs definitivo, configurar

function mundoDrive({ conFotos = true, datosDuplicada = false } = {}) {
  const reg = new Map(); let n = 0;
  const it = (l) => { let i = 0; return { hasNext: () => i < l.length, next: () => l[i++] }; };
  class Carpeta {
    constructor(nombre) { this.nombre = nombre; this.id = 'carpeta' + (++n); this.sub = []; this.ficheros = new Map(); reg.set(this.id, this); }
    getId() { return this.id; }
    getFoldersByName(x) { return it(this.sub.filter((c) => c.nombre === x)); }
    createFolder(x) { const c = new Carpeta(x); this.sub.push(c); return c; }
    getFilesByName(x) { return it(this.ficheros.has(x) ? [this._f(x)] : []); }
    createFile(x, t) { this.ficheros.set(x, t); }
    // como Drive: la busqueda de una carpeta mira SUS ficheros, no los de sus subcarpetas
    searchFiles(q) { const m = /title contains '([^']+)'/.exec(q); return it([...this.ficheros.keys()].filter((k) => !m || k.includes(m[1])).map((k) => this._f(k))); }
    _f(x) { const self = this; return { getName: () => x, setContent: (t) => self.ficheros.set(x, t), getBlob: () => ({ getDataAsString: () => self.ficheros.get(x) }) }; }
  }
  const datos = new Carpeta('TITAN datos Sheet'); const raices = [datos];
  if (datosDuplicada) raices.push(new Carpeta('TITAN datos Sheet'));
  const fotos = conFotos ? datos.createFolder('fotos') : null;
  const props = {}; const logs = [];
  return {
    datos, fotos, props, logs,
    globales: {
      DriveApp: { getFolderById: (id) => reg.get(id), getFoldersByName: (x) => it(raices.filter((c) => c.nombre === x)) },
      MimeType: { PLAIN_TEXT: 'text/plain' },
      PropertiesService: { getScriptProperties: () => ({ getProperty: (k) => (k in props ? props[k] : null), setProperty: (k, v) => { props[k] = v; } }) },
      Logger: { log: (t) => logs.push(t) },
    },
  };
}

test('configurar guarda la carpeta de datos; si hay 0 o 2 carpetas con ese nombre, o falta «fotos», no guarda nada', () => {
  const ok = mundoDrive(); const g = cargar(ok.globales);
  g.fotosCriptoConfigurar();
  assert.equal(ok.props.CARPETA_DATOS_ID, ok.datos.id);
  const dup = mundoDrive({ datosDuplicada: true }); const gd = cargar(dup.globales);
  assert.throws(() => gd.fotosCriptoConfigurar(), /exactamente 1 carpeta/);
  assert.equal(dup.props.CARPETA_DATOS_ID, undefined);
  const sin = mundoDrive({ conFotos: false }); const gs = cargar(sin.globales);
  assert.throws(() => gs.fotosCriptoConfigurar(), /subcarpeta/);
  assert.equal(sin.props.CARPETA_DATOS_ID, undefined);
});

test('modo ensayo (por defecto) escribe en fotos/ensayo_cripto/ y NO en fotos/; el definitivo escribe en fotos/', () => {
  const w = mundoDrive(); const g = cargar(w.globales);
  g.fotosCriptoConfigurar();
  const e = J(g.exportarFotosCripto_(ctxBase()));
  assert.equal(e.foto, 'creada'); assert.equal(e.modo, 'ensayo');
  assert.deepEqual([...w.fotos.ficheros.keys()], [], 'en ensayo no debe aparecer NADA directamente en fotos/');
  const ens = w.fotos.sub.find((c) => c.nombre === 'ensayo_cripto');
  assert.deepEqual([...ens.ficheros.keys()].sort(), ['foto_cripto_2026-10-27.json', 'historial_cripto.json', 'libro_cripto.json']);
  assert.equal(w.props.CRIPTO_ULTIMO_RESULTADO, '2026-10-27 ensayo creada');
  g.fotosCriptoModoDefinitivo();
  assert.equal(w.props.FOTOS_MODO, 'definitivo');
  const d = J(g.exportarFotosCripto_(ctxBase({ ahora: new Date('2026-10-28T06:35:00Z') })));
  assert.equal(d.foto, 'creada'); assert.equal(d.modo, 'definitivo');
  assert.deepEqual([...w.fotos.ficheros.keys()].sort(), ['foto_cripto_2026-10-28.json', 'historial_cripto.json', 'libro_cripto.json']);
  g.fotosCriptoModoEnsayo();
  assert.equal(w.props.FOTOS_MODO, 'ensayo');
});

test('sin configurar, o sin «fotos», falla con mensaje claro y no crea carpetas', () => {
  const w = mundoDrive({ conFotos: false }); const g = cargar(w.globales);
  assert.equal(J(g.exportarFotosCripto_(ctxBase())).foto, 'error');
  assert.match(w.props.CRIPTO_ULTIMO_ERROR, /configurar/);
  w.props.CARPETA_DATOS_ID = w.datos.id;
  const r = J(g.exportarFotosCripto_(ctxBase()));
  assert.equal(r.foto, 'error'); assert.match(r.error, /fotos/);
  assert.equal(w.datos.sub.length, 0, 'no debe crear «fotos»');
});

// Pestanas, descargas y reloj simulados: recorre el camino REAL (leer hojas -> oficial -> precios -> foto -> Drive)
function hojasFalsas() {
  const grid = (filas, cab, col, valores) => ({ filas, cab, col, valores });
  const d = (s) => new Date(s + 'T00:00:00Z');                    // las celdas de fecha llegan como Date
  const celdas = { Exposición: [], Operaciones: [], 'Otras criptos': [], Cuadre: [] };
  const poner = (hoja, fila, col, fila_valores) => { celdas[hoja][fila] = celdas[hoja][fila] || []; fila_valores.forEach((v, i) => { celdas[hoja][fila][col - 1 + i] = v; }); };
  // «Exposicion»: titulo en B1, cabecera B7:E7, BTC en la fila 8, TOTAL en la 24
  poner('Exposición', 1, 2, ['Exposición — cuanto tienes en cada cripto']);
  poner('Exposición', 7, 2, EXPO_CAB);
  poner('Exposición', 8, 2, ['BTC', 'Bitcoin', 0.5, 32000]);
  poner('Exposición', 24, 2, ['TOTAL', '', '', 32000]);
  poner('Exposición', 26, 2, ['Resumen rápido']);
  poner('Operaciones', 1, 1, ['Libro de operaciones de Bitcoin']);
  poner('Operaciones', 4, 1, ['TOTALES', '', '', 0.5]);
  poner('Operaciones', 5, 1, OPS_CAB);
  poner('Operaciones', 6, 1, op(d('2026-09-01'), 'Compra', 0.3, 18000));
  poner('Operaciones', 7, 1, op(d('2026-10-07'), 'Compra', 0.2, 14000));
  poner('Otras criptos', 5, 1, OTRAS_CAB);
  poner('Cuadre', 3, 2, ['Estado general:', '✅ Todos los controles cuadran']);
  const hoja = (nombre) => ({
    getLastRow: () => celdas[nombre].length - 1,
    getRange: (fila, col, n, ncols) => ({
      getValues: () => Array.from({ length: n }, (_, i) => Array.from({ length: ncols }, (_, k) => { const v = (celdas[nombre][fila + i] || [])[col - 1 + k]; return v === undefined ? '' : v; })),
    }),
  });
  return { getActive: () => ({ getSheetByName: (n) => (celdas[n] ? hoja(n) : null) }) };
}
function descargasFalsas(oficial, precios) {
  const resp = (codigo, cuerpo) => ({ getResponseCode: () => codigo, getContentText: () => cuerpo });
  const url = (u) => {
    if (u.endsWith('/oficial/ultimo.json')) return oficial ? resp(200, JSON.stringify(oficial)) : resp(404, '');
    const m = /\/precios\/(\d{4}-\d{2}-\d{2})\.json$/.exec(u);
    return m && precios[m[1]] ? resp(200, JSON.stringify({ date: m[1], activos: precios[m[1]] })) : resp(404, '');
  };
  return { fetch: (u) => url(u), fetchAll: (reqs) => reqs.map((r) => url(r.url)) };
}

test('camino real con las pestanas y las descargas simuladas: lee, genera y escribe en ensayo; el dia 1 y el 2 son consistentes', () => {
  const w = mundoDrive();
  const g = cargar({ ...w.globales, SpreadsheetApp: hojasFalsas(), UrlFetchApp: descargasFalsas(oficialBase(), preciosBase()) });
  g.fotosCriptoConfigurar();
  const r = J(g.exportarFotosCripto_({ ahora: AHORA }));
  assert.equal(r.foto, 'creada');
  const ens = w.fotos.sub.find((c) => c.nombre === 'ensayo_cripto');
  const foto = JSON.parse(ens.ficheros.get('foto_cripto_2026-10-27.json'));
  assert.deepEqual(J(g.fotoValidar_(foto)), []);
  assert.equal(foto.posiciones[0].valor_eur, 35000);
  assert.equal(foto.posiciones[0].estado_coste, 'cuadrado');
  const libro = JSON.parse(ens.ficheros.get('libro_cripto.json'));
  assert.equal(libro.libro.filas[0][0], '2026-09-01', 'las fechas de la hoja (Date) pasan a AAAA-MM-DD');
  const hist = JSON.parse(ens.ficheros.get('historial_cripto.json'));
  assert.deepEqual(hist.series.map((s) => s.valor_liquido_eur), [18000, 18300, 31000, 35000]);
  // vista previa: hace todo menos escribir
  const antes = [...ens.ficheros.keys()].length;
  g.fotosCriptoVerSinGuardar();
  assert.equal([...ens.ficheros.keys()].length, antes);
  assert.ok(w.logs.some((l) => l.includes('No se ha guardado nada')));
  assert.ok(w.logs.some((l) => l.includes('bitcoin:btc')));
});

test('fotosCriptoDiaria LANZA el error si algo falla (asi Google envia el correo) y no deja nada escrito', () => {
  const w = mundoDrive();
  const g = cargar({ ...w.globales, SpreadsheetApp: hojasFalsas(), UrlFetchApp: descargasFalsas(oficialBase(), preciosBase()),
    LockService: { getScriptLock: () => ({ tryLock: () => true, releaseLock: () => {} }) } });
  assert.throws(() => g.fotosCriptoDiaria(), /configurar/);          // sin configurar
  assert.match(w.props.CRIPTO_ULTIMO_ERROR, /configurar/);
  assert.equal(w.fotos.ficheros.size, 0);
});

test('el disparador se instala una sola vez, entre las 07:00 y las 08:00 de Madrid', () => {
  const w = mundoDrive(); const creados = []; const existentes = [];
  const g = cargar({ ...w.globales, ScriptApp: {
    getProjectTriggers: () => existentes,
    newTrigger: (f) => { const t = { f, horas: null, tz: null }; return { timeBased: () => ({ everyDays: () => ({ atHour: (h) => ({ inTimezone: (z) => ({ create: () => { t.horas = h; t.tz = z; creados.push(t); existentes.push({ getHandlerFunction: () => f }); } }) }) }) }) }; },
  } });
  g.fotosCriptoInstalarDisparador(); g.fotosCriptoInstalarDisparador();
  assert.equal(creados.length, 1);
  assert.deepEqual([creados[0].f, creados[0].horas, creados[0].tz], ['fotosCriptoDiaria', 7, 'Europe/Madrid']);
});

// ---------------------------------------------------------------- el consolidador real ve (o no) la foto

function consolidadorSobre(w) {
  const ctx = vm.createContext({ console, ...w.globales });
  vm.runInContext(leer('consolidador.gs'), ctx, { filename: 'consolidador.gs' });
  w.props.CARPETA_FOTOS_ID = w.fotos.id;
  return ctx;
}

test('consolidador real: en ensayo NO ve la foto de cripto; en definitivo la ve «al dia», origen sheet y sin avisos', () => {
  const w = mundoDrive(); const g = cargar(w.globales); const c = consolidadorSobre(w);
  g.fotosCriptoConfigurar(); w.props.CARPETA_DATOS_ID = w.datos.id;
  g.exportarFotosCripto_(ctxBase());                                              // ensayo
  assert.ok(!c.consAlmacenDrive_().listar().some((n) => n.includes('cripto')), 'el consolidador no debe listar nada de ensayo_cripto');
  const T = new Date('2026-10-27T07:30:00Z');                                      // 08:30 en Madrid
  let r = J(c.consEjecutar_(c.consAlmacenDrive_(), T, { sinEscribir: true }));
  const vEns = J(r.consolidada.vehiculos).find((v) => v.clave === 'cripto');
  assert.equal(vEns.estado, 'ausente');

  g.fotosCriptoModoDefinitivo();
  g.exportarFotosCripto_(ctxBase({ ahora: new Date('2026-10-27T06:40:00Z') }));
  assert.ok(c.consAlmacenDrive_().listar().includes('foto_cripto_2026-10-27.json'));
  r = J(c.consEjecutar_(c.consAlmacenDrive_(), T, {}));
  const cons = JSON.parse(w.fotos.ficheros.get('foto_consolidada_2026-10-27.json'));
  const v = cons.vehiculos.find((x) => x.clave === 'cripto');
  assert.equal(v.estado, 'al_dia');
  assert.equal(v.origen, 'sheet');
  assert.equal(v.n_posiciones, 1);
  assert.equal(v.nombre_visible, 'Cripto');
  assert.equal(v.fichero, 'foto_cripto_2026-10-27.json');
  assert.deepEqual(v.avisos, []);
  assert.equal(cons.posiciones.filter((p) => p.vehiculo === 'cripto')[0].id, 'bitcoin:btc');
  assert.deepEqual(J(c.consConsolidadaValidar_(cons)), []);
});

test('consolidador real: una moneda nueva sin precio entra en la consolidada y no la invalida', () => {
  const w = mundoDrive(); const g = cargar(w.globales); const c = consolidadorSobre(w);
  g.fotosCriptoConfigurar(); g.fotosCriptoModoDefinitivo();
  g.exportarFotosCripto_(ctxBase({ raw: rawVarias(), ahora: new Date('2026-10-27T06:40:00Z') }));
  c.consEjecutar_(c.consAlmacenDrive_(), new Date('2026-10-27T07:30:00Z'), {});
  const cons = JSON.parse(w.fotos.ficheros.get('foto_consolidada_2026-10-27.json'));
  const v = cons.vehiculos.find((x) => x.clave === 'cripto');
  assert.equal(v.estado, 'al_dia');
  assert.equal(v.n_posiciones, 3);
  assert.deepEqual(J(c.consConsolidadaValidar_(cons)), []);
});

// ---------------------------------------------------------------- higiene del codigo

test('el codigo nuevo no lleva ids de Drive, cifras personales, monedas fijas ni GOOGLEFINANCE', () => {
  const t = leer('fotos_cripto.gs');
  const sinComentarios = t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  assert.ok(!/getFolderById\(\s*['"]/.test(t), 'id de carpeta escrito en el codigo');
  assert.ok(!/['"][A-Za-z0-9_-]{28,}['"]/.test(t), 'parece un id de Drive');
  assert.ok(!/docs\.google\.com|drive\.google\.com/.test(t), 'enlace a Drive/Docs');
  assert.ok(!/['"](ETH|SOL|ADA|XRP|DOT|XLM)['"]/.test(sinComentarios), 'lista fija de monedas');
  assert.ok(!/GOOGLEFINANCE/i.test(sinComentarios));
  assert.ok(!/@gmail|@hotmail/.test(t));
});
