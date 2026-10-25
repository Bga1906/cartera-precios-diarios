"""Pruebas del comparador de fuentes con respuestas SIMULADAS (sin red). python3 -m pytest -q"""
import datetime
import json
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent / "fuentes_vl"))
import comparar_fuentes as c  # noqa: E402

MADRID = c.ZONA


def ts(y, m, d, h=16):
    return int(datetime.datetime(y, m, d, h, tzinfo=datetime.timezone.utc).timestamp())


def yahoo_json(cierres, zona="Europe/Berlin"):
    return json.dumps({"chart": {"result": [{
        "meta": {"exchangeTimezoneName": zona},
        "timestamp": [t for t, _ in cierres],
        "indicators": {"quote": [{"close": [v for _, v in cierres]}]}}], "error": None}})


# ---------- lectores
def test_yahoo_toma_el_ultimo_cierre_no_nulo():
    r = c.parse_yahoo(yahoo_json([(ts(2026, 10, 13), 210.0), (ts(2026, 10, 14), 210.09), (ts(2026, 10, 15), None)]))
    assert r == {"precio": 210.09, "fecha": "2026-10-14", "estado": "OK"}


def test_yahoo_basura_no_rompe():
    assert c.parse_yahoo("no es json")["estado"] == "respuesta no reconocida"


def test_ft():
    html = "<div>Price (EUR)</div><span>210.09</span> ... Data delayed, as of Oct 15 2026 ..."
    assert c.parse_ft(html) == {"precio": 210.09, "fecha": "2026-10-15", "estado": "OK (2 decimales)"}


def test_quefondos_fondo_y_plan():
    html = "<b>Última valoración</b> Valor liquidativo: 19,474230 EUR Patrimonio (miles de euros):153.927,97 Fecha: 27/07/2026"
    assert c.parse_quefondos(html) == {"precio": 19.47423, "fecha": "2026-07-27", "estado": "OK"}


def test_finanzen():
    assert c.parse_finanzen("<td>130,34 EUR</td><td>Stand</td><td>13.10.2026</td>")["fecha"] == "2026-10-13"


def test_renta4():
    r = c.parse_renta4("<h2>28,54 €</h2> <span>+10,91% YTD</span> <span>12 oct 2026</span>")
    assert r == {"precio": 28.54, "fecha": "2026-10-12", "estado": "OK (gestora)"}


def test_cobas_solo_fecha():
    r = c.parse_cobas("Rentabilidad ... Fecha valor liquidativo: 8-10-2026 ...")
    assert r["fecha"] == "2026-10-08" and r["precio"] is None and "solo fecha" in r["estado"]


def test_generica():
    r = c.parse_generica("<p>Valor liquidativo</p><p>210,3153 €</p><p>15/10/2026</p>")
    assert r["precio"] == 210.3153 and r["fecha"] == "2026-10-15"


@pytest.mark.parametrize("parser", [c.parse_ft, c.parse_quefondos, c.parse_finanzen, c.parse_renta4,
                                    c.parse_cobas, c.parse_generica])
def test_formato_cambiado(parser):
    assert parser("<html>pagina rediseñada</html>")["estado"] == "formato no reconocido"


# ---------- calculos
def test_dias_habiles_salta_fin_de_semana():
    assert c.dias_habiles("2026-10-16", "2026-10-19") == 1   # viernes -> lunes
    assert c.dias_habiles("2026-10-14", "2026-10-17") == 2   # miercoles -> sabado
    assert c.dias_habiles("2026-10-17", "2026-10-17") == 0


def lector_falso(respuestas):
    def lector(url, parser):
        for clave, r in respuestas.items():
            if clave in url:
                return r
        return c._r(estado="HTTP 404")
    return lector


def test_capturar_calcula_desfase_y_retraso_vs_mejor():
    ahora = datetime.datetime(2026, 10, 17, 9, 15, tzinfo=MADRID)  # sabado
    lector = lector_falso({
        "0P0001DFE8.F": c._r(210.09, "2026-10-14"),
        "ES0146309002:EUR": c._r(210.32, "2026-10-15", "OK (2 decimales)"),
    })
    filas = c.capturar(ahora, lector, catalogo={})
    horos = {f["fuente"]: f for f in filas if f["id"] == "horos-value-internacional"}
    assert horos["Yahoo"]["desfase_habiles"] == 2 and horos["Yahoo"]["retraso_vs_mejor"] == 1
    assert horos["FT"]["desfase_habiles"] == 1 and horos["FT"]["retraso_vs_mejor"] == 0
    assert horos["quefondos"]["fecha_dato"] is None and horos["quefondos"]["estado"] == "HTTP 404"
    assert horos["gestora"]["estado"] == "HTTP 404"


def test_un_lector_que_lanza_no_rompe_el_resto(monkeypatch):
    monkeypatch.setattr(c, "pedir", lambda url: ("<html>", None))
    def roto(html):
        raise ValueError("boom")
    assert "boom" in c.leer("http://x", roto)["estado"]


def test_tareas_incluye_todas_las_fuentes_e_indices_del_catalogo():
    cat = {i: f"^T{n}" for n, i in enumerate(c.INDICES)}
    t = c.tareas(cat)
    fuentes_horos = {x[3] for x in t if x[1] == "horos-value-internacional"}
    assert fuentes_horos == {"Yahoo", "FT", "quefondos", "gestora"}
    assert {x[3] for x in t if x[1] == "pictet-china"} == {"Yahoo", "FT", "quefondos", "Renta 4"}
    # iShares EM no esta en quefondos (ISIN nuevo): no se pide
    assert {x[3] for x in t if x[1] == "ishares-emerging-markets"} == {"Yahoo", "FT"}
    assert any("r4.com" in x[4] and "ES0146309002" in x[4] for x in t if x[1] == "horos-value-internacional")
    assert {x[3] for x in t if x[0] == "plan"} == {"Yahoo", "quefondos"}
    assert {x[1] for x in t if x[0] == "indice"} == set(c.INDICES)


def test_indices_salen_del_catalogo_real():
    cat = c.cargar_tickers_catalogo()
    assert set(c.INDICES) <= set(cat)


def test_diferencia_de_precio_misma_fecha():
    filas = [{"id": "a", "fuente": "Yahoo", "precio": 100.0, "fecha_dato": "2026-10-15"},
             {"id": "a", "fuente": "FT", "precio": 101.0, "fecha_dato": "2026-10-15"},
             {"id": "a", "fuente": "quefondos", "precio": 100.2, "fecha_dato": "2026-10-14"}]
    avisos = c.diferencias_precio(filas)
    assert len(avisos) == 1 and "Yahoo" in avisos[0] and "FT" in avisos[0]


# ---------- salida
def test_csv_resumen_y_avisos(tmp_path, monkeypatch):
    monkeypatch.setattr(c, "CAPTURAS_DIR", tmp_path / "capturas")
    lector = lector_falso({
        "0P0001DFE8.F": c._r(210.09, "2026-10-10"),
        "ES0146309002:EUR": c._r(212.0, "2026-10-10"),
    })
    hoy = datetime.date(2026, 10, 17)
    for dia in (15, 16, 17):
        filas = c.capturar(datetime.datetime(2026, 10, dia, 22, 40, tzinfo=MADRID), lector, catalogo={})
        c.guardar_csv(filas, c.CAPTURAS_DIR)
    hist = c.leer_historial(hoy=hoy, dir_=c.CAPTURAS_DIR)
    assert (tmp_path / "capturas" / "2026-10.csv").read_text(encoding="utf-8").startswith("captura,hora,tipo")
    md = c.construir_resumen(filas, hist)
    assert "incluso la fuente más al día va 5 días hábiles atrasada" in md
    assert "quefondos lleva 3 capturas seguidas sin dato" in md
    assert "Diferencia de precio" in md
    assert "| fondo | Yahoo | 24 | 12% |" in md  # 8 fondos x 3 capturas; solo Horos tiene dato (3/24)


def test_resumen_vacio_no_rompe():
    assert "Sin avisos" in c.construir_resumen([], [])


def test_fuente_retirada_deja_de_avisar():
    """Una fuente que ya no esta en la ultima captura no debe seguir saliendo como «caida» por el historial."""
    def fila(fuente, dia, fecha=None):
        return {"captura": f"2026-10-{dia:02d}", "id": "a", "fuente": fuente, "fecha_dato": fecha, "precio": None,
                "tipo": "fondo", "hora": "22:40", "desfase_naturales": None, "desfase_habiles": None,
                "retraso_vs_mejor": None, "estado": "x", "codigo": "x"}
    hist = [fila("vieja", d) for d in (20, 21, 22, 23)] + [fila("Yahoo", d, "2026-10-22") for d in (20, 21, 22, 23)]
    ultima = [dict(fila("Yahoo", 23, "2026-10-22"), precio=1.0, desfase_habiles=1, retraso_vs_mejor=0)]
    md = c.construir_resumen(ultima, hist)
    assert "vieja lleva" not in md

