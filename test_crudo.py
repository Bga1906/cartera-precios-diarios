"""Pruebas del crudo (crudo/AAAA-MM.csv): solo se anaden lineas; nunca rompe la captura. Ejecutar: python3 -m pytest -q"""
import csv
import json
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent))
sys.path.insert(0, str(Path(__file__).resolve().parent / "fuentes_vl"))
import crudo as cr  # noqa: E402
import fetch_precios_publico as f  # noqa: E402
import comparar_fuentes as c  # noqa: E402
import universo as u  # noqa: E402
from test_fetch_precios_publico import PICTET_SERIE, red, ts, yahoo, yahoo_con_serie  # noqa: E402,F401


def leer(path):
    with open(path, newline="", encoding="utf-8") as fh:
        return list(csv.DictReader(fh))


def test_anadir_solo_anade_y_la_cabecera_sale_una_vez(tmp_path):
    a = cr.fila("2026-10-25T20:00:00Z", "github", "mexem:AMZN", "yahoo", "AMZN", 248.0, "USD", "2026-10-23")
    b = cr.fila("2026-10-26T20:00:00Z", "github", "mexem:AMZN", "yahoo", "AMZN", 249.5, "USD", "2026-10-26")
    assert cr.anadir_filas([a], tmp_path) == 1
    antes = (tmp_path / "2026-10.csv").read_text(encoding="utf-8")
    assert cr.anadir_filas([b], tmp_path) == 1
    despues = (tmp_path / "2026-10.csv").read_text(encoding="utf-8")
    assert despues.startswith(antes)  # lo que ya estaba no se toca
    assert despues.count("captura_utc") == 1
    assert [r["precio"] for r in leer(tmp_path / "2026-10.csv")] == ["248.0", "249.5"]


def test_cada_fila_va_al_csv_de_su_mes(tmp_path):
    a = cr.fila("2026-10-31T23:00:00Z", "github", "x", "yahoo")
    b = cr.fila("2026-11-01T01:00:00Z", "github", "x", "yahoo")
    cr.anadir_filas([a, b], tmp_path)
    assert (tmp_path / "2026-10.csv").exists() and (tmp_path / "2026-11.csv").exists()


def test_sin_filas_no_crea_nada(tmp_path):
    assert cr.anadir_filas([], tmp_path / "crudo") == 0
    assert not (tmp_path / "crudo").exists()


def lecturas_pictet(red):
    red.respuestas["LU0625737910.LU"] = yahoo_con_serie(125.04, ts(2026, 10, 23, 5, 55), PICTET_SERIE)
    f.LECTURAS_YAHOO.clear()
    f.construir_activos("2026-10-23", catalogo=[])
    return list(f.LECTURAS_YAHOO)


def test_el_crudo_guarda_la_ficha_y_la_serie_de_pictet(red):
    lecturas = lecturas_pictet(red)
    filas = cr.filas_de_captura(lecturas, {}, u.cargar_universo(), [], "2026-10-23T22:50:00Z")
    p = next(x for x in filas if x["id"] == "myinvestor-cobas:LU0625737910")
    assert p["fuente"] == "yahoo" and p["ticker"] == "LU0625737910.LU" and p["origen"] == "github"
    assert p["precio"] == 121.39 and p["fecha_dato"] == "2026-10-22" and p["estado"] == "ok"
    d = json.loads(p["detalle"])
    assert d["lectura"] == "cierre_serie" and d["ficha_precio"] == 125.04 and d["ficha_fecha"] == "2026-10-23"


def test_una_lectura_fallida_tambien_queda_anotada(red):
    red.respuestas["AMZN"] = "HTTP 500"
    f.LECTURAS_YAHOO.clear()
    f.construir_activos("2026-10-23", catalogo=[])
    filas = cr.filas_de_captura(list(f.LECTURAS_YAHOO), {}, u.cargar_universo(), [], "2026-10-23T22:50:00Z")
    a = next(x for x in filas if x["id"] == "mexem:AMZN")
    assert a["precio"] is None and a["estado"] == "HTTP 500"


def test_los_benchmarks_van_con_su_id(red):
    catalogo = [{"id": "ibex-35", "ticker": "^IBEX"}]
    f.LECTURAS_YAHOO.clear()
    f.construir_activos("2026-10-23", catalogo=catalogo)
    filas = cr.filas_de_captura(list(f.LECTURAS_YAHOO), {}, u.cargar_universo(), catalogo, "2026-10-23T22:50:00Z")
    assert any(x["id"] == "benchmark:ibex-35" and x["ticker"] == "^IBEX" for x in filas)


def test_oro_y_bitcoin_con_sus_otras_fuentes(red):
    activos = f.construir_activos("2026-10-23", catalogo=[])
    filas = cr.filas_de_captura([], activos, u.cargar_universo(), [], "2026-10-23T22:50:00Z")
    oro = next(x for x in filas if x["id"] == "oro-fisico:joyeria")
    assert oro["fuente"] == "gold-api" and oro["precio"] == 3000.0 and oro["moneda"] == "USD"
    red.respuestas["BTC-EUR"] = "HTTP 500"
    activos = f.construir_activos("2026-10-23", catalogo=[])
    filas = cr.filas_de_captura([], activos, u.cargar_universo(), [], "2026-10-23T22:50:00Z")
    btc = next(x for x in filas if x["id"] == "bitcoin:btc")
    assert btc["fuente"] == "coingecko" and btc["precio"] == 70000.0


def test_las_filas_del_comparador_se_pasan_a_utc_y_a_ids_del_universo():
    filas_cmp = [
        {"captura": "2026-10-20", "hora": "22:40", "tipo": "fondo", "id": "pictet-china", "codigo": "LU0625737910",
         "fuente": "FT", "precio": 121.39, "fecha_dato": "2026-10-22", "estado": "OK"},
        {"captura": "2026-10-20", "hora": "22:40", "tipo": "fondo", "id": "pictet-china", "codigo": "LU0625737910",
         "fuente": "Renta 4", "precio": None, "fecha_dato": None, "estado": "HTTP 403"},
        {"captura": "2026-10-20", "hora": "22:40", "tipo": "plan", "id": "plan-myinvestor-indexado-global",
         "codigo": "N5396", "fuente": "quefondos", "precio": 20.3772, "fecha_dato": "2026-10-21", "estado": "OK (2 decimales)"},
        {"captura": "2026-10-20", "hora": "22:40", "tipo": "indice", "id": "msci-acwi-nr-eur", "codigo": "^892400-EUR-NETR",
         "fuente": "Yahoo", "precio": 521.24, "fecha_dato": "2026-10-24", "estado": "OK"},
        {"captura": "2026-10-20", "hora": "22:40", "tipo": "fondo", "id": "fondo-que-ya-no-esta", "codigo": "X",
         "fuente": "FT", "precio": 1.0, "fecha_dato": "2026-10-20", "estado": "OK"},
    ]
    out = cr.filas_de_comparador(filas_cmp, u.cargar_universo())
    assert len(out) == 4  # el que ya no esta en el universo no se anota
    ft, r4, plan, idx = out
    assert ft["captura_utc"] == "2026-10-20T20:40:00Z"  # 22:40 en Madrid (CEST) = 20:40 UTC
    assert ft["id"] == "myinvestor-cobas:LU0625737910" and ft["fuente"] == "ft" and ft["estado"] == "ok"
    assert r4["fuente"] == "renta4" and r4["estado"] == "HTTP 403"
    assert plan["id"] == "myinvestor:plan-pensiones" and plan["estado"] == "ok"
    assert json.loads(plan["detalle"]) == {"estado_fuente": "OK (2 decimales)"}
    assert idx["id"] == "benchmark:msci-acwi-nr-eur" and idx["moneda"] is None


def test_si_el_crudo_falla_precios_se_escribe_igual(red, tmp_path, monkeypatch, capsys):
    monkeypatch.setattr(f, "OUT_DIR", tmp_path / "precios")
    monkeypatch.setattr(sys, "argv", ["fetch_precios_publico.py"])

    def roto(*a, **k):
        raise OSError("disco lleno")

    monkeypatch.setattr(cr, "anadir_filas", roto)
    f.main()
    assert (tmp_path / "precios" / "ultimo.json").exists()
    assert "AVISO crudo" in capsys.readouterr().err


def test_captura_completa_escribe_precios_y_crudo(red, tmp_path, monkeypatch):
    monkeypatch.setattr(f, "OUT_DIR", tmp_path / "precios")
    monkeypatch.setattr(cr, "CRUDO_DIR", tmp_path / "crudo")
    monkeypatch.setattr(sys, "argv", ["fetch_precios_publico.py"])
    f.LECTURAS_YAHOO.clear()
    f.main()
    doc = json.loads((tmp_path / "precios" / "ultimo.json").read_text(encoding="utf-8"))
    assert len(doc["activos"]) >= 33
    ficheros = list((tmp_path / "crudo").glob("*.csv"))
    assert len(ficheros) == 1
    filas = leer(ficheros[0])
    assert {"mexem:AMZN", "myinvestor-cobas:LU0625737910", "oro-fisico:joyeria", "bitcoin:btc"} <= {r["id"] for r in filas}
    for r in filas:
        assert not any(p in k for k in r for p in u.PROHIBIDAS)
