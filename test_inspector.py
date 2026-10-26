import datetime
import json

import crudo
import inspector as ins

HASTA = datetime.datetime(2026, 10, 26, 7, 0, tzinfo=datetime.timezone.utc)  # lunes por la manana
CAP = "2026-10-25T20:00:00Z"


def u(*vs):
    return {"vehiculos": list(vs)}


FONDO = {"id": "f:1", "tipo": "fondo", "moneda": "EUR", "estado": "activo", "fuentes": []}
ACCION = {"id": "mexem:X", "tipo": "accion", "moneda": "EUR", "estado": "activo", "fuentes": []}


def fila(id_, fuente, precio, fecha, estado="ok", moneda="EUR", cap=CAP):
    return crudo.fila(cap, "github", id_, fuente, "T", precio, moneda, fecha, estado)


def run(universo, filas, precios=None):
    crudo.anadir_filas(filas)
    return ins.inspeccionar(universo, ins.leer_crudo(HASTA), HASTA, precios)["activos"]


def test_dias_habiles():
    assert ins.dias_habiles("2026-10-23", "2026-10-26") == 1   # viernes -> lunes
    assert ins.dias_habiles("2026-10-26", "2026-10-26") == 0
    assert ins.dias_habiles("2026-10-22", "2026-10-26") == 2


def test_fondo_gana_ft_ok():
    a = run(u(FONDO), [fila("f:1", "ft", 100.0, "2026-10-23"), fila("f:1", "yahoo", 100.0, "2026-10-23")])
    r = a["f:1"]
    assert (r["fuente_elegida"], r["estado_precio"], r["precio"]) == ("ft", "ok", 100.0)


def test_respaldo_si_ft_falla():
    a = run(u(FONDO), [fila("f:1", "ft", None, None, estado="sin precio"), fila("f:1", "yahoo", 99.0, "2026-10-23")])
    assert a["f:1"]["fuente_elegida"] == "yahoo" and a["f:1"]["estado_precio"] == "respaldo"


def test_dudoso_por_desacuerdo():
    a = run(u(FONDO), [fila("f:1", "ft", 100.0, "2026-10-23"), fila("f:1", "yahoo", 101.0, "2026-10-23")])
    assert a["f:1"]["estado_precio"] == "dudoso" and "yahoo difiere" in a["f:1"]["motivo"]


def test_contraste_no_gana_pero_avisa():
    a = run(u(FONDO), [fila("f:1", "ft", 100.0, "2026-10-23"), fila("f:1", "finanzen", 103.0, "2026-10-23")])
    assert a["f:1"]["fuente_elegida"] == "ft" and a["f:1"]["estado_precio"] == "dudoso"


def test_fondo_con_fecha_del_dia_de_captura_se_descarta():
    a = run(u(FONDO), [fila("f:1", "ft", 100.0, "2026-10-25"), fila("f:1", "yahoo", 99.0, "2026-10-23")])
    assert a["f:1"]["fuente_elegida"] == "yahoo"


def test_dudoso_por_atraso():
    a = run(u(ACCION), [fila("mexem:X", "yahoo", 5.0, "2026-10-21")])  # martes; hasta lunes = 3 dias habiles
    assert a["mexem:X"]["estado_precio"] == "dudoso" and "atraso" in a["mexem:X"]["motivo"]


def test_fuente_atrasada_no_gana_si_hay_otra_fresca():
    a = run(u(ACCION), [fila("mexem:X", "yahoo", 5.0, "2026-10-21"), fila("mexem:X", "google_finance", 5.2, "2026-10-23")])
    r = a["mexem:X"]
    assert r["fuente_elegida"] == "google_finance" and r["estado_precio"] in ("respaldo", "dudoso")


def test_monedas_distintas_no_se_comparan():
    a = run(u(ACCION), [fila("mexem:X", "yahoo", 5.0, "2026-10-23", moneda="USD"),
                        fila("mexem:X", "google_finance", 4.0, "2026-10-23", moneda="EUR")])
    assert a["mexem:X"]["estado_precio"] == "ok"


def test_sin_dato_y_pendientes_ignorados():
    pend = {**ACCION, "id": "mexem:P", "estado": "pendiente"}
    a = run(u(ACCION, pend), [])
    assert a["mexem:X"]["estado_precio"] == "sin_dato" and "mexem:P" not in a


def test_ventana_ignora_capturas_antiguas():
    antigua = fila("mexem:X", "yahoo", 5.0, "2026-10-20", cap="2026-10-20T20:00:00Z")
    a = run(u(ACCION), [antigua])
    assert a["mexem:X"]["estado_precio"] == "sin_dato"


def test_escribe_ficheros_y_referencia_precios(tmp_path):
    crudo.anadir_filas([fila("mexem:X", "yahoo", 5.0, "2026-10-23")])
    doc = ins.inspeccionar(u(ACCION), ins.leer_crudo(HASTA), HASTA, {"activos": {"mexem:X": {"price": 4.6}}})
    ins.escribir(doc, tmp_path)
    leido = json.loads((tmp_path / "ultimo.json").read_text(encoding="utf-8"))
    assert (tmp_path / "2026-10-26.json").exists()
    assert leido["activos"]["mexem:X"]["precios_json_eur"] == 4.6 and leido["resumen"] == {"ok": 1}


def test_oro_spot_sin_fecha_usa_la_fecha_de_captura():
    """gold-api da el precio de ahora y no trae fecha: antes se descartaba y el oro quedaba «sin_dato» (26/10/2026)."""
    oro = {"id": "oro-fisico:joyeria", "tipo": "materia_prima", "moneda": "EUR", "estado": "activo", "fuentes": []}
    filas = [fila("oro-fisico:joyeria", "gold-api", 3994.7, None, moneda="USD"),
             fila("oro-fisico:joyeria", "yahoo", 4007.9, CAP[:10], moneda="USD")]
    a = run(u(oro), filas)["oro-fisico:joyeria"]
    assert a["estado_precio"] == "ok" and a["fuente_elegida"] == "gold-api"
    assert a["fecha_dato"] == CAP[:10] and a["precio"] == 3994.7


def test_oro_sin_precio_sigue_sin_dato():
    oro = {"id": "oro-fisico:joyeria", "tipo": "materia_prima", "moneda": "EUR", "estado": "activo", "fuentes": []}
    a = run(u(oro), [fila("oro-fisico:joyeria", "gold-api", None, None, estado="error", moneda="USD")])["oro-fisico:joyeria"]
    assert a["estado_precio"] == "sin_dato"


def test_fondo_con_2_dias_habiles_de_atraso_ya_no_es_dudoso_pero_con_3_si():
    """Un fondo publica su VL con 1-2 dias de retraso: el lunes con el VL del jueves es normal (26/10/2026)."""
    assert ins.dias_habiles("2026-10-22", "2026-10-26") == 2          # jueves -> lunes
    ok = run(u(FONDO), [fila("f:1", "ft", 100.0, "2026-10-22")])["f:1"]
    assert ok["estado_precio"] == "ok"
    tarde = run(u(FONDO), [fila("f:1", "ft", 100.0, "2026-10-21")])["f:1"]   # miercoles -> lunes = 3
    assert tarde["estado_precio"] == "dudoso" and "atraso" in tarde["motivo"]
