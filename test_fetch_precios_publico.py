"""Pruebas con respuestas de Yahoo SIMULADAS (no hay red). Ejecutar: python3 -m pytest -q"""
import datetime
import json
import re
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent))
import fetch_precios_publico as f  # noqa: E402

CLAVES_ANTIGUAS = ("price", "price_previous_close", "moneda", "fuente", "ok", "error")


def ts(y, m, d, h=0, mi=0):
    return int(datetime.datetime(y, m, d, h, mi, tzinfo=datetime.timezone.utc).timestamp())


def yahoo(precio=100.0, moneda="USD", t=None, zona=None, prev=None, chart_prev=None, extra_result=None):
    meta = {"regularMarketPrice": precio}
    if moneda is not None:
        meta["currency"] = moneda
    if t is not None:
        meta["regularMarketTime"] = t
    if zona:
        meta["exchangeTimezoneName"] = zona
    if prev is not None:
        meta["previousClose"] = prev
    if chart_prev is not None:
        meta["chartPreviousClose"] = chart_prev
    result = {"meta": meta}
    result.update(extra_result or {})
    return {"chart": {"result": [result], "error": None}}


@pytest.fixture
def red(monkeypatch):
    """Red simulada: respuestas por defecto para todo y un dict de ajustes por ticker."""
    respuestas = {}
    llamadas = []

    def falso(url):
        llamadas.append(url)
        if "gold-api" in url:
            return {"price": 3000.0}, None
        if "frankfurter" in url:
            return {"rates": {"USD": 1.1, "CAD": 1.5}}, None
        if "coingecko" in url:
            return {"bitcoin": {"eur": 70000.0}}, None
        if "finance/chart/" in url:
            ticker = f.urllib.parse.unquote(url.split("/chart/")[1].split("?")[0])
            r = respuestas.get(ticker)
            if r is None:
                return yahoo(50.0, "EUR", ts(2026, 10, 9, 15), "Europe/Madrid", prev=49.0), None
            if isinstance(r, Exception):
                raise r
            if isinstance(r, str):
                return None, r
            return r, None
        return None, "URL inesperada"

    monkeypatch.setattr(f, "_get_json", falso)
    falso.respuestas = respuestas
    falso.llamadas = llamadas
    return falso


# ---------- as_of ----------
@pytest.mark.parametrize("t,zona,esperado", [
    (ts(2026, 10, 9, 20), "America/New_York", "2026-10-09"),      # viernes por la tarde en NY
    (ts(2026, 10, 10, 2), "America/New_York", "2026-10-09"),      # 02:00 UTC = 22:00 del viernes en NY
    (ts(2026, 10, 9, 23, 30), "Europe/Madrid", "2026-10-10"),     # 01:30 del sabado en Madrid
    (ts(2026, 10, 9, 23, 30), None, "2026-10-09"),                # sin zona -> UTC
    (ts(2026, 10, 9, 23, 30), "Zona/Inventada", "2026-10-09"),    # zona invalida -> UTC
])
def test_fecha_de_mercado_zonas(t, zona, esperado):
    assert f.fecha_de_mercado(t, zona) == esperado


@pytest.mark.parametrize("valor", [None, "abc", True, 1e30, float("nan")])
def test_fecha_de_mercado_invalida(valor):
    assert f.fecha_de_mercado(valor, "UTC") is None


def test_as_of_en_cotizacion(red):
    red.respuestas["X"] = yahoo(10, "USD", ts(2026, 10, 9, 20), "America/New_York")
    r = f.obtener_cotizacion_yahoo("X")
    assert r["as_of"] == "2026-10-09" and r["precio"] == 10.0


def test_sin_regular_market_time_as_of_none(red):
    red.respuestas["X"] = yahoo(10, "USD", None)
    assert f.obtener_cotizacion_yahoo("X")["as_of"] is None
    extra = f.campos_fecha_mercado(f.obtener_cotizacion_yahoo("X"), "2026-10-10")
    assert extra["as_of"] is None and extra["as_of_fuente"] == "regularMarketTime"
    assert "arrastrado" not in extra


# ---------- arrastrado ----------
@pytest.mark.parametrize("fichero,dias", [
    ("2026-10-10", 1),   # sabado, dato del viernes
    ("2026-10-11", 2),   # domingo
    ("2026-10-12", 3),   # lunes festivo (12 oct): sigue el dato del viernes
])
def test_arrastrado_fin_de_semana_y_festivo(fichero, dias):
    res = {"as_of": "2026-10-09", "moneda_inferida": None}
    extra = f.campos_fecha_mercado(res, fichero)
    assert extra["arrastrado"] is True and extra["dias_desfase"] == dias


def test_no_arrastrado_si_es_del_mismo_dia_o_posterior():
    assert "arrastrado" not in f.campos_fecha_mercado({"as_of": "2026-10-09"}, "2026-10-09")
    assert "dias_desfase" not in f.campos_fecha_mercado({"as_of": "2026-10-10"}, "2026-10-09")  # Asia va por delante


def test_arrastrado_no_cambia_ok(red):
    red.respuestas["^IBEX"] = yahoo(11000, "EUR", ts(2026, 10, 2, 15), "Europe/Madrid")
    a = f.construir_activos("2026-10-10")
    b = a["benchmark:ibex-35"]
    assert b["arrastrado"] is True and b["dias_desfase"] == 8 and b["ok"] is True


# ---------- moneda ----------
def test_moneda_ausente_conocida_se_rellena(red):
    red.respuestas["^990100-USD-STRD"] = yahoo(4000, None, ts(2026, 10, 9, 20))
    b = f.construir_activos("2026-10-10")["benchmark:msci-world"]
    assert b["moneda"] == "USD" and b["moneda_inferida"] is True


def test_moneda_ausente_desconocida_queda_null(red):
    """Sin moneda en Yahoo NI en el catalogo: queda null (nunca se inventa)."""
    red.respuestas["^NDX"] = yahoo(20000, None, ts(2026, 10, 9, 20))
    cat = [{"id": "nasdaq-100", "ticker": "^NDX", "estado_verificacion": "verificado"}]
    b = f.construir_activos("2026-10-10", catalogo=cat)["benchmark:nasdaq-100"]
    assert b["moneda"] is None and b["moneda_inferida"] is False


def test_moneda_ausente_se_toma_del_catalogo(red):
    """Caso Euro Stoxx 50: Yahoo no da moneda pero el catalogo dice EUR."""
    red.respuestas["^STOXX50E"] = yahoo(6000, None, ts(2026, 10, 9, 20))
    cat = [{"id": "euro-stoxx-50", "ticker": "^STOXX50E", "moneda": "EUR", "estado_verificacion": "verificado"}]
    b = f.construir_activos("2026-10-10", catalogo=cat)["benchmark:euro-stoxx-50"]
    assert b["moneda"] == "EUR" and b["moneda_inferida"] is True


def test_moneda_de_yahoo_manda_sobre_el_catalogo(red):
    red.respuestas["^STOXX50E"] = yahoo(6000, "EUR", ts(2026, 10, 9, 20))
    cat = [{"id": "euro-stoxx-50", "ticker": "^STOXX50E", "moneda": "USD", "estado_verificacion": "verificado"}]
    b = f.construir_activos("2026-10-10", catalogo=cat)["benchmark:euro-stoxx-50"]
    assert b["moneda"] == "EUR" and b.get("moneda_inferida") is not True


def test_moneda_vacia_cuenta_como_ausente(red):
    red.respuestas["^NDX"] = yahoo(20000, "", ts(2026, 10, 9, 20))
    assert f.obtener_cotizacion_yahoo("^NDX")["moneda"] is None


def test_moneda_presente_no_lleva_moneda_inferida(red):
    b = f.construir_activos("2026-10-10")["benchmark:sp500"]
    assert "moneda_inferida" not in b


# ---------- cierre anterior ----------
def test_previous_close_se_usa_primero(red):
    red.respuestas["X"] = yahoo(10, "USD", None, prev=9, chart_prev=8)
    assert f.obtener_cotizacion_yahoo("X")["cierre_anterior"] == 9.0


def test_previous_close_ausente_usa_chart_previous_close(red):
    red.respuestas["X"] = yahoo(10, "USD", None, chart_prev=8)
    assert f.obtener_cotizacion_yahoo("X")["cierre_anterior"] == 8.0


def test_previous_close_ausente_en_ambos_es_null(red):
    red.respuestas["X"] = yahoo(10, "USD", None)
    assert f.obtener_cotizacion_yahoo("X")["cierre_anterior"] is None


def test_previous_close_no_positivo_se_ignora(red):
    red.respuestas["X"] = yahoo(10, "USD", None, prev=0, chart_prev=8)
    assert f.obtener_cotizacion_yahoo("X")["cierre_anterior"] == 8.0


# ---------- errores ----------
def test_ticker_inexistente(red):
    red.respuestas["NOEXISTE"] = {"chart": {"result": None, "error": {"code": "Not Found", "description": "No data"}}}
    r = f.obtener_cotizacion_yahoo("NOEXISTE")
    assert r["precio"] is None and "Not Found" in r["error"]


def test_respuesta_sin_result(red):
    red.respuestas["X"] = {"chart": {"result": [], "error": None}}
    r = f.obtener_cotizacion_yahoo("X")
    assert r["precio"] is None and "sin 'result'" in r["error"]


def test_error_http(red):
    red.respuestas["X"] = "HTTP 404"
    assert f.obtener_cotizacion_yahoo("X")["error"] == "HTTP 404"


@pytest.mark.parametrize("precio", [0, -5])
def test_precio_no_positivo(red, precio):
    red.respuestas["X"] = yahoo(precio, "USD", ts(2026, 10, 9, 20))
    r = f.obtener_cotizacion_yahoo("X")
    assert r["precio"] is None and "no positivo" in r["error"]


def test_sin_precio(red):
    red.respuestas["X"] = {"chart": {"result": [{"meta": {"currency": "USD"}}], "error": None}}
    assert f.obtener_cotizacion_yahoo("X")["error"] == "sin 'regularMarketPrice'"


# ---------- fallos aislados ----------
def test_ticker_nuevo_que_falla_no_rompe_el_resto(red):
    red.respuestas["^SP500TR"] = "HTTP 404"
    red.respuestas["^RUT"] = RuntimeError("boom")
    # _get_json simulado lanza: obtener_cotizacion_yahoo no lo captura, el bucle de benchmarks si
    activos = f.construir_activos("2026-10-10")
    assert activos["benchmark:sp500-tr"]["ok"] is False and activos["benchmark:sp500-tr"]["error"] == "HTTP 404"
    assert activos["benchmark:russell-2000"]["ok"] is False and "boom" in activos["benchmark:russell-2000"]["error"]
    assert activos["benchmark:sp500"]["ok"] is True
    assert len(activos) == 1 + 1 + 17 + 5 + 8 + 1 + 36  # ningun activo se pierde


def test_todos_los_benchmarks_del_catalogo_se_capturan(red):
    activos = f.construir_activos("2026-10-10")
    for b in f.cargar_catalogo():
        assert f"benchmark:{b['id']}" in activos


# ---------- compatibilidad hacia atras ----------
def lector_antiguo(doc):
    """Lo que hacia un lector de antes: solo conoce las claves antiguas."""
    return {k: {c: v[c] for c in CLAVES_ANTIGUAS} for k, v in doc["activos"].items()}


def test_compatibilidad_hacia_atras_claves_antiguas(red):
    red.respuestas["^GSPC"] = yahoo(5000.5, "USD", ts(2026, 10, 9, 20), "America/New_York", prev=4990.0)
    activos = f.construir_activos("2026-10-10")
    doc = {"date": "2026-10-10", "generado_en": "x", "activos": activos}
    leido = lector_antiguo(json.loads(json.dumps(doc)))
    assert leido["benchmark:sp500"] == {
        "price": 5000.5, "price_previous_close": 4990.0, "moneda": "USD",
        "fuente": "Yahoo Finance (^GSPC)", "ok": True, "error": None,
    }
    assert all(set(CLAVES_ANTIGUAS) <= set(v) for v in activos.values())


def test_compatibilidad_con_un_fichero_real_del_repo(red):
    """Todo id de un fichero real previo sigue existiendo y conserva las claves de siempre.

    Solo se exigen las claves antiguas: las opcionales (as_of, moneda_inferida...) dependen de
    lo que conteste Yahoo en cada captura (moneda_inferida solo sale si Yahoo no da moneda), y
    aqui Yahoo esta simulado, asi que no se pueden pedir como si fueran fijas.
    """
    reales = sorted((Path(__file__).parent / "precios").glob("????-??-??*.json"))  # sin ultimo.json
    if not reales:
        pytest.skip("no hay ficheros reales en precios/")
    viejo = json.loads(reales[-1].read_text(encoding="utf-8"))
    nuevo = f.construir_activos(viejo["date"])
    assert set(viejo["activos"]) <= set(nuevo)
    for id_, a in viejo["activos"].items():
        assert (set(a) & set(CLAVES_ANTIGUAS)) <= set(nuevo[id_]), id_


def test_documento_es_json_valido_y_sin_claves_personales(red):
    activos = f.construir_activos("2026-10-10")
    doc = {"date": "2026-10-10", "generado_en": "x", "activos": activos}
    texto = json.dumps(doc, ensure_ascii=False)
    claves = set()
    for a in json.loads(texto)["activos"].values():
        claves |= set(a)
    prohibidas = ("cantidad", "unidades", "importe", "saldo", "patrimonio", "salario", "nif", "iban",
                  "poliza", "titular", "nombre_usuario", "email", "valor_eur", "participaciones", "shares", "posicion")
    for c in claves:
        assert not any(p in c.lower() for p in prohibidas), c
    assert claves <= {*CLAVES_ANTIGUAS, "as_of", "as_of_fuente", "arrastrado", "dias_desfase", "moneda_inferida"}


# ---------- catalogo ----------
def test_catalogo_real_verificados_y_pendientes():
    cat = {b["id"]: b for b in f.cargar_catalogo()}
    esperados = {"msci-world": "^990100-USD-STRD", "nasdaq-100": "^NDX", "ibex-35": "^IBEX",
                 "acwi": "ACWI", "sp500": "^GSPC"}
    for id_, t in esperados.items():
        assert cat[id_]["ticker"] == t and cat[id_]["estado_verificacion"] == "verificado"
    pendientes = {i for i, b in cat.items() if b["estado_verificacion"] == "pendiente"}
    assert pendientes == set()  # los 36 verificados tras las pruebas del 12/10
    assert len(cat) == 36
    assert {b["tipo_retorno"] for b in cat.values()} <= {"precio", "total"}
    assert cat["msci-world-etf-acc"]["proxy_de"] == "msci-world"


def test_respaldo_coincide_con_los_verificados_del_catalogo():
    catalogo = {b["id"]: b["ticker"] for b in f.cargar_catalogo() if b["estado_verificacion"] == "verificado"}
    respaldo = {b["id"]: b["ticker"] for b in f.BENCHMARKS_RESPALDO}
    assert respaldo.items() <= catalogo.items()  # los 5 de siempre siguen verificados y con el mismo ticker


def test_catalogo_con_linea_mal_formada_se_salta_y_avisa(tmp_path):
    p = tmp_path / "c.json"
    p.write_text('{\n"benchmarks": [\n'
                 '{"id": "a", "ticker": "AAA", "estado_verificacion": "verificado"},\n'
                 '{"id": "b", "ticker": "BBB" "estado_verificacion": "pendiente"},\n'
                 '{"id": "c", "ticker": "CCC", "estado_verificacion": "pendiente"}\n'
                 ']\n}\n', encoding="utf-8")
    avisos = []
    cat = f.cargar_catalogo(p, avisos.append)
    assert [b["id"] for b in cat] == ["a", "c"]
    assert len(avisos) == 1 and "linea 4" in avisos[0]


def test_catalogo_entradas_invalidas_y_repetidas(tmp_path):
    p = tmp_path / "c.json"
    p.write_text(json.dumps({"benchmarks": [
        {"id": "a", "ticker": "AAA"}, {"id": "a", "ticker": "OTRO"}, {"id": "z"},
        {"id": "e", "ticker": "E", "estado_verificacion": "raro"}, "texto"]}), encoding="utf-8")
    avisos = []
    assert [b["id"] for b in f.cargar_catalogo(p, avisos.append)] == ["a"]
    assert len(avisos) == 4


def test_catalogo_inexistente_usa_respaldo(tmp_path):
    avisos = []
    cat = f.cargar_catalogo(tmp_path / "no_existe.json", avisos.append)
    assert len(cat) == 5 and avisos


# ---------- --probar ----------
def test_probar_solo_pendientes_y_tabla(red):
    red.respuestas["^SP500TR"] = yahoo(15000, "USD", ts(2026, 10, 9, 20), "America/New_York",
                                       extra_result={"timestamp": [ts(2026, 10, d, 20) for d in (5, 6, 7, 8, 9)],
                                                     "indicators": {"quote": [{"close": [1, 2, None, 4, 5]}]}})
    red.respuestas["^RUT"] = "HTTP 404"
    cat = [{"id": "sp500", "ticker": "^GSPC", "estado_verificacion": "verificado"},
           {"id": "sp500-tr", "ticker": "^SP500TR", "estado_verificacion": "pendiente"},
           {"id": "russell-2000", "ticker": "^RUT", "estado_verificacion": "pendiente"}]
    salida = []
    filas = f.probar_benchmarks(cat, salida.append)
    assert [x["id"] for x in filas] == ["sp500-tr", "russell-2000"]
    assert filas[0]["existe"] and filas[0]["moneda"] == "USD" and filas[0]["as_of"] == "2026-10-09" and filas[0]["puntos"] == 4
    assert not filas[1]["existe"]
    texto = "\n".join(salida)
    assert "sp500-tr" in texto and "russell-2000" in texto and "^GSPC" not in texto
    assert not any("%5EGSPC" in u for u in red.llamadas)


def test_probar_no_escribe_nada(red, tmp_path, monkeypatch, capsys):
    monkeypatch.setattr(f, "OUT_DIR", tmp_path / "precios")
    monkeypatch.setattr(sys, "argv", ["fetch_precios_publico.py", "--probar"])
    f.main()
    assert not (tmp_path / "precios").exists()
    assert list(tmp_path.iterdir()) == []
    salida = capsys.readouterr().out
    assert "No se ha escrito nada" in salida or "No hay benchmarks" in salida  # sin pendientes no hay tabla


def test_probar_sin_pendientes():
    salida = []
    assert f.probar_benchmarks([{"id": "a", "ticker": "A", "estado_verificacion": "verificado"}], salida.append) == []
    assert "No hay" in salida[0]


# ---------- escritura ----------
def test_main_escribe_json_valido_y_sin_temporales(red, tmp_path, monkeypatch):
    monkeypatch.setattr(f, "OUT_DIR", tmp_path / "precios")
    monkeypatch.setattr(sys, "argv", ["fetch_precios_publico.py"])
    f.main()
    ficheros = list((tmp_path / "precios").iterdir())
    assert all(x.suffix == ".json" for x in ficheros) and not list((tmp_path / "precios").glob("*.tmp"))
    nombres = sorted(x.name for x in ficheros)
    assert len(nombres) == 3 and "ultimo.json" in nombres
    con_hora = [n for n in nombres if re.fullmatch(r"\d{4}-\d{2}-\d{2}_\d{4}\.json", n)]
    alias = [n for n in nombres if re.fullmatch(r"\d{4}-\d{2}-\d{2}\.json", n)]
    assert len(con_hora) == 1 and len(alias) == 1
    doc = json.loads((tmp_path / "precios" / con_hora[0]).read_text(encoding="utf-8"))
    assert set(doc) == {"date", "generado_en", "activos"}
    assert doc["date"] == con_hora[0][:10] == alias[0][:-5]
    # ultimo.json y el alias del dia son identicos a la captura con hora
    for otro in ("ultimo.json", alias[0]):
        assert (tmp_path / "precios" / otro).read_text(encoding="utf-8") == (tmp_path / "precios" / con_hora[0]).read_text(encoding="utf-8")


# ---------- captura con hora y archivo ----------
def _cap(d, nombre, contenido=None):
    d.mkdir(parents=True, exist_ok=True)
    (d / nombre).write_text(json.dumps(contenido or {"date": nombre[:10], "activos": {}}), encoding="utf-8")


def test_dos_capturas_el_mismo_dia_no_se_pisan(red, tmp_path, monkeypatch):
    monkeypatch.setattr(f, "OUT_DIR", tmp_path / "precios")
    monkeypatch.setattr(sys, "argv", ["fetch_precios_publico.py"])

    class Reloj(f.datetime.datetime):
        hora = (1, 45)

        @classmethod
        def now(cls, tz=None):
            return cls(2026, 10, 13, *cls.hora, 0)

    monkeypatch.setattr(f.datetime, "datetime", Reloj)
    f.main()
    Reloj.hora = (23, 33)
    f.main()
    nombres = sorted(x.name for x in (tmp_path / "precios").iterdir())
    assert any(n.endswith("_0145.json") for n in nombres) and any(n.endswith("_2333.json") for n in nombres)


def test_archivar_agrupa_por_mes_y_respeta_lo_reciente(tmp_path):
    d = tmp_path / "precios"
    for n in ("2026-08-30.json", "2026-09-02_0145.json", "2026-09-02_2333.json", "2026-09-20.json",
              "2026-10-13_2333.json", "2026-10-13.json", "ultimo.json"):
        _cap(d, n)
    assert f.archivar_antiguos(d, "2026-10-14") == 3  # 30/08 y las dos del 02/09
    assert sorted(x.name for x in d.glob("*.json")) == [
        "2026-09-20.json", "2026-10-13.json", "2026-10-13_2333.json", "ultimo.json"]
    ago = json.loads((d / "archivo" / "2026-08.json").read_text(encoding="utf-8"))
    sep = json.loads((d / "archivo" / "2026-09.json").read_text(encoding="utf-8"))
    assert list(ago["capturas"]) == ["2026-08-30"]
    assert list(sep["capturas"]) == ["2026-09-02_0145", "2026-09-02_2333"]


def test_archivar_es_idempotente_y_fusiona(tmp_path):
    d = tmp_path / "precios"
    _cap(d, "2026-09-02.json")
    assert f.archivar_antiguos(d, "2026-10-14") == 1
    _cap(d, "2026-09-03.json")
    assert f.archivar_antiguos(d, "2026-10-14") == 1
    assert f.archivar_antiguos(d, "2026-10-14") == 0
    sep = json.loads((d / "archivo" / "2026-09.json").read_text(encoding="utf-8"))
    assert list(sep["capturas"]) == ["2026-09-02", "2026-09-03"]


def test_archivar_no_pierde_nada_si_hay_un_fichero_ilegible(tmp_path):
    d = tmp_path / "precios"
    _cap(d, "2026-09-02.json")
    (d / "2026-09-03.json").write_text("{roto", encoding="utf-8")
    assert f.archivar_antiguos(d, "2026-10-14") == 0
    assert (d / "2026-09-02.json").exists() and (d / "2026-09-03.json").exists()
    assert not (d / "archivo").exists()


def test_archivar_sin_carpeta_no_falla(tmp_path):
    assert f.archivar_antiguos(tmp_path / "no-existe", "2026-10-14") == 0
