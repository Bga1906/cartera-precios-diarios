// Pruebas de la foto diaria (F3). Ejecutan el CODIGO REAL de foto_cartera.gs y fotos_fondos.gs en Node,
// con Drive y las pestanas simulados en memoria (cifras inventadas, nada personal).
//   node --test google/test_fotos.test.mjs
// Variables opcionales:
//   FOTOS_SALIDA=carpeta   guarda ahi las fotos de muestra (las valida despues el validador de Python)
//   FONDOS_SCRIPT=ruta     ruta al script de valoracion REAL (2.2) de Brian: activa las pruebas contra el. NUNCA va al repo.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const SALIDA = process.env.FOTOS_SALIDA || null;
const SCRIPT_REAL = process.env.FONDOS_SCRIPT && fs.existsSync(process.env.FONDOS_SCRIPT) ? process.env.FONDOS_SCRIPT : null;

function cargar(conScriptReal = false) {
  const ctx = vm.createContext({ console });
  const ficheros = [];
  if (conScriptReal) ficheros.push(SCRIPT_REAL);
  ficheros.push(path.join(AQUI, 'foto_cartera.gs'), path.join(AQUI, 'fotos_fondos.gs'));
  for (const f of ficheros) vm.runInContext(fs.readFileSync(f, 'utf8'), ctx, { filename: f });
  return ctx;
}
const J = (x) => JSON.parse(JSON.stringify(x));   // pasa objetos de otro "mundo" de JS a objetos normales

function almacenMem() {
  const m = new Map();
  return {
    m,
    existe: (n) => m.has(n),
    escribir: (n, t) => { m.set(n, t); },
    crear: (n, t) => { if (m.has(n)) throw new Error('ya existe ' + n); m.set(n, t); },
  };
}

const A = 'ES0000000001', B = 'ES0000000002';
const ID_A = 'myinvestor-cobas:' + A, ID_B = 'myinvestor-cobas:' + B, ID_PLAN = 'myinvestor:plan-pensiones';

function ctxBase(extra = {}) {
  const fondos = [
    { fondo: 'FondoA', nombre: 'Fondo A global', isins: [A], isin: A, costeFiscal: 1000, fuenteCoste: 'entidad', estado: '' },
    { fondo: 'FondoB', nombre: 'Fondo B prudente', isins: [B], isin: B, costeFiscal: 500, fuenteCoste: 'entidad', estado: 'PENDIENTE ASESOR' },
  ];
  const fila = (fecha, pa, pb) => ({
    fecha, total: 10 * pa + 5 * pb, aportado: 1400, resultado: 10 * pa + 5 * pb - 1400, rent: (10 * pa + 5 * pb - 1400) / 1400,
    porFondo: { [A]: { u: 10, p: pa, v: 10 * pa }, [B]: { u: 5, p: pb, v: 5 * pb } }, arrastrados: [],
  });
  const hist = {
    filas: [fila('2026-10-20', 100, 100), fila('2026-10-21', 101, 102), fila('2026-10-22', 102, 104)],
    avisos: [],
    unidades: [{ fecha: '2026-10-01', isin: A, u: 10, id: 'L1' }, { fecha: '2026-10-01', isin: B, u: 5, id: 'L2' }],
    caja: [{ fecha: '2026-10-01', importe: 1400, id: 'L1' }],
  };
  return {
    fondos, hist, cache: {}, ev: { unidades: [], caja: [] }, compras: [],
    vl: { [A]: { captura: '2026-10-22', asOf: '2026-10-21', fuente: 'Yahoo' }, [B]: { captura: '2026-10-22', asOf: '2026-10-21', fuente: 'Yahoo' } },
    plan: { ok: true, price: 20, asOf: '2026-10-21', arrastrado: false },
    planInfo: { manual: false, asOf: '2026-10-21', estado: 'AUTOMATICO' },
    frescura: {
      fondos: [{ fondo: 'FondoA', isin: A, asOf: '2026-10-21', dias: 1, estado: 'OK' }, { fondo: 'FondoB', isin: B, asOf: '2026-10-21', dias: 1, estado: 'OK' }],
      atrasados: [], planEstado: 'OK', planDias: 1,
    },
    hoy: '2026-10-22', scriptVersion: '2.2 (prueba)',
    ahora: new Date('2026-10-23T06:45:00Z'),     // 08:45 en Madrid
    raw: {
      libro: { cabecera: ['id', 'fecha', 'isin', 'tipo', 'importe'], filas: [['L1', '2026-10-01', A, 'aportacion', 1000], ['L2', '2026-10-01', B, 'aportacion', 400]] },
      compras: { cabecera: ['fecha', 'fondo', 'importe', 'participaciones', 'estado', 'nota', 'reales'], filas: [] },
      plan: { 'Participaciones': 100, 'Valor actual (€)': 2000, 'Fecha del valor': '2026-10-21', 'Aportado (€)': 1900 },
    },
    oficial: { activos: {
      [ID_A]: { estado_precio: 'ok', precio: 101, fecha_dato: '2026-10-21', fuente_elegida: 'ft', motivo: '' },
      [ID_B]: { estado_precio: 'respaldo', precio: 102, fecha_dato: '2026-10-21', fuente_elegida: 'yahoo', motivo: 'respaldo: ft sin dato' },
      [ID_PLAN]: { estado_precio: 'ok', precio: 20, fecha_dato: '2026-10-21', fuente_elegida: 'yahoo', motivo: '' },
    } },
    almacen: almacenMem(),
    ...extra,
  };
}
// Precios de la hoja que acompanan a hist (para que el precio de cada fondo a 21/10 sea el del oficial)
function ctxCoherente(extra = {}) {
  const c = ctxBase(extra);
  c.hist.filas[2].porFondo[A].p = 101; c.hist.filas[2].porFondo[A].v = 1010;
  c.hist.filas[2].porFondo[B].p = 102; c.hist.filas[2].porFondo[B].v = 510;
  c.hist.filas[2].total = 1520; c.hist.filas[2].resultado = 120; c.hist.filas[2].rent = 120 / 1400;
  return c;
}
const pos = (foto, id) => foto.posiciones.find((p) => p.id === id);
function guardarMuestra(nombre, texto) { if (SALIDA) { fs.mkdirSync(SALIDA, { recursive: true }); fs.writeFileSync(path.join(SALIDA, nombre), texto); } }

// ---------------------------------------------------------------- molde y totales

test('la foto cumple el molde y los totales cuadran con las posiciones', () => {
  const g = cargar();
  const r = J(g.fotosFondosGenerar_(ctxCoherente()));
  assert.deepEqual(J(g.fotoValidar_(r.foto)), []);
  assert.equal(r.foto.formato, 'foto_cartera/v1');
  assert.equal(r.foto.fecha_foto, '2026-10-23');
  assert.equal(r.foto.fuente_precios, 'precios');
  assert.equal(r.foto.fecha_captura_precios, '2026-10-22');
  assert.equal(r.foto.posiciones.length, 3);
  assert.equal(r.foto.totales.valor_liquido_eur, 1520);       // 1010 + 510
  assert.equal(r.foto.totales.valor_no_liquido_eur, 2000);    // plan: 100 x 20
  assert.equal(r.foto.totales.valor_total_eur, 3520);
  assert.equal(r.foto.totales.aportado_efectivo_eur, 1400);
  assert.equal(r.foto.totales.resultado_liquido_eur, 120);
  assert.equal(r.foto.totales.coste_liquido_eur, 1500);       // coste fiscal de los dos fondos
});

test('aportado en efectivo y coste fiscal son cosas distintas y viajan por separado', () => {
  const g = cargar();
  const r = J(g.fotosFondosGenerar_(ctxCoherente()));
  assert.equal(pos(r.foto, ID_A).coste_tipo, 'fiscal_entidad');
  assert.equal(pos(r.foto, ID_A).coste_eur, 1000);
  assert.equal(pos(r.foto, ID_B).estado_coste, 'PENDIENTE ASESOR');
  assert.ok(pos(r.foto, ID_B).avisos.includes('coste_pendiente_asesor'));
  assert.equal(r.foto.totales.aportado_efectivo_eur, 1400);   // no es la suma de costes
  assert.notEqual(r.foto.totales.aportado_efectivo_eur, r.foto.totales.coste_liquido_eur);
});

// ---------------------------------------------------------------- plan de pensiones

test('plan automatico: participaciones x VL del dia, no liquido, fuera del valor liquido', () => {
  const g = cargar();
  const { foto } = J(g.fotosFondosGenerar_(ctxCoherente()));
  const p = pos(foto, ID_PLAN);
  assert.equal(p.tipo, 'plan');
  assert.equal(p.no_liquido, true);
  assert.equal(p.cantidad, 100);
  assert.equal(p.precio, 20);
  assert.equal(p.valor_eur, 2000);
  assert.equal(p.coste_eur, 1900);
  assert.equal(p.coste_tipo, 'aportado');
  assert.equal(p.estado_precio, 'ok');
  assert.equal(p.fecha_precio, '2026-10-21');
  assert.equal(foto.totales.valor_liquido_eur, 1520);
});

test('plan sin VL automatico: usa el valor manual y lo marca como manual', () => {
  const g = cargar();
  const c = ctxCoherente({ plan: { ok: false, motivo: 'no aparece' }, planInfo: { manual: true, asOf: '' } });
  c.frescura.planEstado = null; c.frescura.planDias = null;
  const { foto } = J(g.fotosFondosGenerar_(c));
  const p = pos(foto, ID_PLAN);
  assert.equal(p.estado_precio, 'manual');
  assert.equal(p.valor_eur, 2000);
  assert.equal(p.precio, null);
  assert.equal(p.fecha_precio, '2026-10-21');
  assert.ok(p.avisos.includes('plan_valor_manual'));
  assert.deepEqual(J(g.fotoValidar_(foto)), []);
});

test('contraste del plan con tu valor manual: solo si las fechas son cercanas', () => {
  const g = cargar();
  // misma fecha y 3 % de diferencia -> comparable y con aviso
  let c = ctxCoherente(); c.raw.plan['Valor actual (€)'] = 1940;
  let p = pos(J(g.fotosFondosGenerar_(c)).foto, ID_PLAN);
  assert.equal(p.contraste_manual.comparable, true);
  assert.ok(Math.abs(p.contraste_manual.dif_pct - (2000 - 1940) / 1940) < 1e-6);
  assert.ok(p.avisos.includes('contraste_manual'));
  // valor manual de hace 13 dias -> no comparable, sin aviso (la diferencia es normal)
  c = ctxCoherente(); c.raw.plan['Valor actual (€)'] = 1770.17; c.raw.plan['Fecha del valor'] = '2026-10-08';
  p = pos(J(g.fotosFondosGenerar_(c)).foto, ID_PLAN);
  assert.equal(p.contraste_manual.comparable, false);
  assert.equal(p.contraste_manual.dif_pct, null);
  assert.ok(!p.avisos.includes('contraste_manual'));
  // diferencia pequena (< 0,5 %) -> comparable pero sin aviso
  c = ctxCoherente(); c.raw.plan['Valor actual (€)'] = 1995;
  p = pos(J(g.fotosFondosGenerar_(c)).foto, ID_PLAN);
  assert.equal(p.contraste_manual.comparable, true);
  assert.ok(!p.avisos.includes('contraste_manual'));
});

test('plan sin participaciones anotadas: no inventa un valor', () => {
  const g = cargar();
  const c = ctxCoherente(); c.raw.plan['Participaciones'] = null; c.raw.plan['Valor actual (€)'] = null;
  const p = pos(J(g.fotosFondosGenerar_(c)).foto, ID_PLAN);
  assert.equal(p.valor_eur, null);
  assert.ok(p.avisos.includes('plan_sin_participaciones'));
});

// ---------------------------------------------------------------- estado del precio (oficial/)

test('estado_precio sale del inspector (oficial/) y se conserva su motivo', () => {
  const g = cargar();
  const { foto } = J(g.fotosFondosGenerar_(ctxCoherente()));
  assert.equal(pos(foto, ID_A).estado_precio, 'ok');
  assert.equal(pos(foto, ID_B).estado_precio, 'respaldo');
  assert.equal(pos(foto, ID_A).oficial.fuente_elegida, 'ft');
  assert.equal(pos(foto, ID_A).oficial.misma_fecha, true);
  assert.equal(pos(foto, ID_A).oficial.dif_pct, 0);
});

test('sin oficial/ la foto sale igual, con estado sin_oficial y un aviso', () => {
  const g = cargar();
  const { foto } = J(g.fotosFondosGenerar_(ctxCoherente({ oficial: null })));
  assert.ok(foto.posiciones.every((p) => p.estado_precio === 'sin_oficial'));
  assert.ok(foto.avisos.some((a) => a.includes('oficial/ultimo.json')));
  assert.deepEqual(J(g.fotoValidar_(foto)), []);
});

test('si el precio de la hoja difiere mas de 0,5 % del oficial a la misma fecha, avisa', () => {
  const g = cargar();
  const c = ctxCoherente(); c.oficial.activos[ID_A].precio = 100;   // la hoja tiene 101: 1 % de diferencia
  const p = pos(J(g.fotosFondosGenerar_(c)).foto, ID_A);
  assert.ok(p.avisos.includes('dif_oficial'));
  assert.ok(Math.abs(p.oficial.dif_pct - 0.01) < 1e-9);
});

test('si el oficial es de otra fecha no se compara (la diferencia seria normal)', () => {
  const g = cargar();
  const c = ctxCoherente(); c.oficial.activos[ID_A].precio = 90; c.oficial.activos[ID_A].fecha_dato = '2026-10-20';
  const p = pos(J(g.fotosFondosGenerar_(c)).foto, ID_A);
  assert.equal(p.oficial.misma_fecha, false);
  assert.equal(p.oficial.dif_pct, null);
  assert.ok(!p.avisos.includes('dif_oficial'));
});

test('un fondo con participaciones y sin precio sale con valor null y sin_dato, nunca con un 0 mudo', () => {
  const g = cargar();
  const c = ctxCoherente(); const f = c.hist.filas[2].porFondo[A]; f.p = undefined; f.v = 0;
  const p = pos(J(g.fotosFondosGenerar_(c)).foto, ID_A);
  assert.equal(p.valor_eur, null);
  assert.equal(p.estado_precio, 'sin_dato');
  assert.ok(p.avisos.includes('sin_precio'));
});

// ---------------------------------------------------------------- huella

test('la huella cambia si se anota una compra con fecha pasada y no cambia si nada cambia', () => {
  const g = cargar();
  const h1 = J(g.fotosFondosGenerar_(ctxCoherente())).foto.huella;
  const h2 = J(g.fotosFondosGenerar_(ctxCoherente())).foto.huella;
  assert.equal(h1.hash, h2.hash);
  const c = ctxCoherente(); c.raw.compras.filas.push(['2026-10-20', 'FondoA', 100, null, null, null, null]);
  const h3 = J(g.fotosFondosGenerar_(c)).foto.huella;
  assert.notEqual(h1.hash, h3.hash);
  assert.equal(h3.compras_filas, 1);
});

// ---------------------------------------------------------------- guardado e inmutabilidad

test('la foto del dia se crea una vez y no se sobrescribe; libro e historial si', () => {
  const g = cargar();
  const alm = almacenMem();
  const c1 = ctxCoherente({ almacen: alm });
  const r1 = J(g.exportarFotosFondos_(c1));
  assert.equal(r1.foto, 'creada');
  assert.deepEqual([...alm.m.keys()].sort(), ['foto_fondos_2026-10-23.json', 'historial_fondos.json', 'libro_fondos.json']);
  const foto1 = alm.m.get('foto_fondos_2026-10-23.json');
  const libro1 = alm.m.get('libro_fondos.json');

  // misma fecha, datos distintos (alguien apunta una compra y relanza a mano el mismo dia)
  const c2 = ctxCoherente({ almacen: alm, ahora: new Date('2026-10-23T18:00:00Z') });
  c2.raw.compras.filas.push(['2026-10-20', 'FondoA', 100, null, null, null, null]);
  const r2 = J(g.exportarFotosFondos_(c2));
  assert.equal(r2.foto, 'ya_existia');
  assert.equal(alm.m.get('foto_fondos_2026-10-23.json'), foto1);       // la foto NO cambia
  assert.notEqual(alm.m.get('libro_fondos.json'), libro1);             // el libro SI se actualiza
  guardarMuestra('foto_fondos_2026-10-23.json', foto1);
  guardarMuestra('libro_fondos.json', alm.m.get('libro_fondos.json'));
  guardarMuestra('historial_fondos.json', alm.m.get('historial_fondos.json'));
});

test('antes de las 07:00 de Madrid no se crea la foto (el cierre de ayer aun puede no estar)', () => {
  const g = cargar();
  const alm = almacenMem();
  const r = J(g.exportarFotosFondos_(ctxCoherente({ almacen: alm, ahora: new Date('2026-10-23T03:00:00Z') })));   // 05:00 Madrid
  assert.equal(r.foto, 'antes_de_hora');
  assert.ok(![...alm.m.keys()].some((k) => k.startsWith('foto_fondos_')));
  // a las 23:30 de Madrid si (por si la pasada de la manana fallo)
  const r2 = J(g.exportarFotosFondos_(ctxCoherente({ almacen: alm, ahora: new Date('2026-10-23T21:30:00Z') })));
  assert.equal(r2.foto, 'creada');
});

test('el cambio de hora no descuadra el dia: 23:30 de Madrid el dia del cambio sigue siendo ese dia', () => {
  const g = cargar();
  const alm = almacenMem();
  // 25/10/2026 termina el horario de verano: 23:30 Madrid = 22:30 UTC
  g.exportarFotosFondos_(ctxCoherente({ almacen: alm, ahora: new Date('2026-10-25T22:30:00Z') }));
  assert.ok(alm.m.has('foto_fondos_2026-10-25.json'));
});

test('compra tardia (estructura): la foto vieja queda intacta y la del dia siguiente refleja el cambio', () => {
  const g = cargar();
  const alm = almacenMem();
  g.exportarFotosFondos_(ctxCoherente({ almacen: alm, ahora: new Date('2026-10-23T06:45:00Z') }));
  const vieja = alm.m.get('foto_fondos_2026-10-23.json');
  // dia siguiente: Brian anota una compra del 20/10 -> el Sheet recalcula el pasado
  const c = ctxCoherente({ almacen: alm, ahora: new Date('2026-10-24T06:45:00Z') });
  c.raw.compras.filas.push(['2026-10-20', 'FondoA', 100, null, null, null, null]);
  const f = c.hist.filas;
  f.forEach((fila) => { fila.porFondo[A].u += 1; fila.porFondo[A].v += fila.porFondo[A].p; fila.total += fila.porFondo[A].p; fila.aportado += 100; fila.resultado = fila.total - fila.aportado; });
  assert.equal(J(g.exportarFotosFondos_(c)).foto, 'creada');
  assert.equal(alm.m.get('foto_fondos_2026-10-23.json'), vieja);
  const nueva = JSON.parse(alm.m.get('foto_fondos_2026-10-24.json'));
  const antigua = JSON.parse(vieja);
  assert.notEqual(nueva.huella.hash, antigua.huella.hash);
  assert.equal(nueva.totales.aportado_efectivo_eur, antigua.totales.aportado_efectivo_eur + 100);
  const hist = JSON.parse(alm.m.get('historial_fondos.json'));
  assert.equal(hist.series[0].posiciones[ID_A].cantidad, 11);          // el pasado (20/10) quedo corregido
  guardarMuestra('foto_fondos_2026-10-24.json', alm.m.get('foto_fondos_2026-10-24.json'));
});

test('un fallo al guardar no rompe la valoracion: devuelve error y no lanza', () => {
  const g = cargar();
  const roto = { existe: () => false, escribir: () => { throw new Error('Drive no responde'); }, crear: () => { throw new Error('Drive no responde'); } };
  const r = J(g.exportarFotosFondos_(ctxCoherente({ almacen: roto })));
  assert.equal(r.foto, 'error');
  assert.match(r.error, /Drive no responde/);
});

test('una foto invalida no se guarda nunca', () => {
  const g = cargar();
  const alm = almacenMem();
  const c = ctxCoherente({ almacen: alm }); c.fondos[0].nombre = '';  c.fondos[0].fondo = '';
  const r = J(g.exportarFotosFondos_(c));
  assert.equal(r.foto, 'error');
  assert.equal(alm.m.size, 0);
});

// ---------------------------------------------------------------- validador y exportaciones

test('el validador detecta fotos mal formadas', () => {
  const g = cargar();
  const buena = J(g.fotosFondosGenerar_(ctxCoherente())).foto;
  const rota = (mut) => { const f = JSON.parse(JSON.stringify(buena)); mut(f); return g.fotoValidar_(f); };
  assert.ok(rota((f) => { f.formato = 'otra/v9'; }).length > 0);
  assert.ok(rota((f) => { delete f.posiciones[0].estado_precio; }).length > 0);
  assert.ok(rota((f) => { f.posiciones[0].estado_precio = 'raro'; }).length > 0);
  assert.ok(rota((f) => { f.posiciones[1].id = f.posiciones[0].id; }).some((x) => x.includes('repetido')));
  assert.ok(rota((f) => { f.totales.valor_liquido_eur += 5; }).some((x) => x.includes('no cuadra')));
  assert.ok(rota((f) => { f.fecha_foto = '23/10/2026'; }).length > 0);
  assert.ok(rota((f) => { delete f.huella; }).length > 0);
  assert.ok(rota((f) => { delete f.posiciones[0].avisos; }).length > 0);
});

test('el libro exportado conserva las filas en bruto y lo que el Sheet interpreto', () => {
  const g = cargar();
  const c = ctxCoherente();
  c.raw.compras.filas.push(['2026-10-20', 'FondoA', 100, null, null, null, null]);
  c.compras = [{ fila: 5, fecha: '2026-10-20', fondo: c.fondos[0], importe: 100, unidades: NaN, u: 0.98, estimada: true, participacionesReales: false, problema: '' }];
  const { libro } = J(g.fotosFondosGenerar_(c));
  assert.equal(libro.formato, 'libro_cartera/v1');
  assert.deepEqual(libro.libro.filas[0], ['L1', '2026-10-01', A, 'aportacion', 1000]);
  assert.equal(libro.interpretado.compras[0].estimada, true);
  assert.equal(libro.interpretado.compras[0].id, ID_A);
  assert.equal(libro.interpretado.participaciones.length, 2);
});

test('el historial lleva una linea por dia, ordenada, con la posicion de cada fondo', () => {
  const g = cargar();
  const { historial } = J(g.fotosFondosGenerar_(ctxCoherente()));
  assert.equal(historial.formato, 'historial_cartera/v1');
  assert.deepEqual(historial.series.map((s) => s.fecha), ['2026-10-20', '2026-10-21', '2026-10-22']);
  assert.deepEqual(historial.ids, [ID_A, ID_B]);
  assert.equal(historial.series[2].posiciones[ID_A].valor_eur, 1010);
});

test('el codigo nuevo no lleva ids de Drive ni cifras personales', () => {
  for (const f of ['foto_cartera.gs', 'fotos_fondos.gs']) {
    const t = fs.readFileSync(path.join(AQUI, f), 'utf8');
    assert.ok(!/getFolderById\(\s*['"]/.test(t), f + ': id de carpeta escrito en el codigo');
    assert.ok(!/['"][A-Za-z0-9_-]{28,}['"]/.test(t), f + ': parece un id de Drive');
    assert.ok(!/docs\.google\.com|drive\.google\.com/.test(t), f + ': enlace a Drive/Docs');
  }
});

// ---------------------------------------------------------------- contra el script REAL de Brian (opcional)

const testReal = SCRIPT_REAL ? test : test.skip;

function mundoReal(extraCompras = []) {
  const g = cargar(true);
  const precios = {
    '2026-10-20': { [A]: 100, [B]: 100 },
    '2026-10-21': { [A]: 101, [B]: 102 },
    '2026-10-22': { [A]: 102, [B]: 104 },
  };
  const meta = {};
  for (const d of Object.keys(precios)) meta[d] = { [A]: { asOf: d, fuente: 'Yahoo' }, [B]: { asOf: d, fuente: 'Yahoo' } };
  const filasFondos = [
    ['FondoA', 'Fondo A global', A, true, '', '', 1000, 'entidad', '', '', '', ''],
    ['FondoB', 'Fondo B prudente', B, true, '', '', 500, 'entidad', '', '', '', 'PENDIENTE ASESOR'],
  ];
  const libroFilas = [
    ['L1', '2026-10-01', '', A, '', 'aportacion', 1000, '', '2026-10-01', 10, '', '', '', '', ''],
    ['L2', '2026-10-01', '', B, '', 'aportacion', 400, '', '2026-10-01', 5, '', '', '', '', ''],
  ];
  const fondos = g.leerFondos_(filasFondos);
  g.asignarIsin_(fondos, precios['2026-10-22']);
  const ev = g.eventosLibro_(libroFilas, fondos.map((f) => f.isin));
  const compras = g.leerCompras_(extraCompras, fondos, '2026-10-22');
  const hist = g.calcularHistorial_(fondos, ev, compras, precios);
  const cache = { precios, meta, filas: {} };
  const vl = g.vlPorFondo_(fondos, cache);
  const frescura = g.evaluarFrescura_(fondos, vl, { asOf: '2026-10-21' }, '2026-10-22', g.CFG.UMBRALES);
  return { g, fondos, ev, compras, hist, cache, vl, frescura, filasFondos, libroFilas };
}

function ctxReal(m, ahora, almacen, comprasRaw = []) {
  return {
    fondos: m.fondos, cache: m.cache, ev: m.ev, compras: m.compras, hist: m.hist, vl: m.vl,
    plan: { ok: true, price: 20, asOf: '2026-10-21', arrastrado: false }, planInfo: { manual: false, asOf: '2026-10-21' },
    frescura: m.frescura, hoy: '2026-10-22', scriptVersion: m.g.SCRIPT_VERSION, ahora, almacen,
    oficial: ctxBase().oficial,
    raw: {
      libro: { cabecera: ['id'], filas: m.libroFilas },
      compras: { cabecera: ['fecha'], filas: comprasRaw },
      plan: { 'Participaciones': 100, 'Valor actual (€)': 2000, 'Fecha del valor': '2026-10-21', 'Aportado (€)': 1900 },
    },
  };
}

testReal('script real: la foto coincide con «Valoracion hoy» (valor, coste y aportado)', () => {
  const m = mundoReal();
  const hoy = J(m.g.tablaHoy_(m.fondos, m.hist, m.compras, m.vl, '2026-10-22'));
  const { foto } = J(m.g.fotosFondosGenerar_(ctxReal(m, new Date('2026-10-23T06:45:00Z'), almacenMem())));
  assert.deepEqual(J(m.g.fotoValidar_(foto)), []);
  hoy.filas.forEach((f) => {
    const p = pos(foto, 'myinvestor-cobas:' + f.isin);
    assert.ok(Math.abs(p.valor_eur - f.v) < 0.006, 'valor ' + f.fondo);
    assert.ok(Math.abs(p.coste_eur - f.coste) < 0.006, 'coste ' + f.fondo);
    assert.ok(Math.abs(p.cantidad - f.u) < 1e-7, 'cantidad ' + f.fondo);
    assert.equal(p.fecha_precio, f.asOf);
  });
  assert.ok(Math.abs(foto.totales.valor_liquido_eur - hoy.ult.total) < 0.011);
  assert.ok(Math.abs(foto.totales.aportado_efectivo_eur - hoy.ult.aportado) < 0.006);
});

testReal('script real: una compra con fecha pasada recalcula el pasado y la foto vieja no se toca', () => {
  const alm = almacenMem();
  const m1 = mundoReal();
  m1.g.exportarFotosFondos_(ctxReal(m1, new Date('2026-10-23T06:45:00Z'), alm));
  const vieja = alm.m.get('foto_fondos_2026-10-23.json');
  const hist1 = JSON.parse(alm.m.get('historial_fondos.json'));

  // Brian apunta (el 24) una compra de 100 EUR en FondoA con fecha 20/10, sin participaciones: se estiman con el precio de ese dia
  const filaCompra = ['2026-10-20', 'FondoA', 100, '', '', '', ''];
  const m2 = mundoReal([filaCompra]);
  const ctx2 = ctxReal(m2, new Date('2026-10-24T06:45:00Z'), alm, [filaCompra]);
  assert.equal(J(m2.g.exportarFotosFondos_(ctx2)).foto, 'creada');

  assert.equal(alm.m.get('foto_fondos_2026-10-23.json'), vieja, 'la foto vieja cambio');
  const hist2 = JSON.parse(alm.m.get('historial_fondos.json'));
  assert.ok(hist2.series[0].posiciones[ID_A].cantidad > hist1.series[0].posiciones[ID_A].cantidad, 'el 20/10 no se corrigio');
  assert.ok(Math.abs(hist2.series[0].posiciones[ID_A].cantidad - (10 + 100 / 100)) < 1e-6);       // 100 EUR / 100 EUR por participacion
  const nueva = JSON.parse(alm.m.get('foto_fondos_2026-10-24.json'));
  const antigua = JSON.parse(vieja);
  assert.notEqual(nueva.huella.hash, antigua.huella.hash);
  assert.ok(Math.abs(nueva.totales.aportado_efectivo_eur - antigua.totales.aportado_efectivo_eur - 100) < 0.006);
  assert.ok(nueva.avisos.some((a) => a.includes('ESTIMADAS')));
  assert.deepEqual(J(m2.g.fotoValidar_(nueva)), []);
  guardarMuestra('foto_fondos_2026-10-24_real.json', alm.m.get('foto_fondos_2026-10-24.json'));
});
