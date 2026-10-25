import csv

import crudo
import google_lector as g

CSV = """id,ticker_google,precio,moneda,fecha_dato,cierre_anterior,cambio_a_eur,precio_eur
mexem:AMZN,NASDAQ:AMZN,"248,5",USD,2026-10-23,"250,38","0,8926","221,9"
mexem:DMX,CVE:DMX,0.39,CAD,2026-10-23,0.38,,
bitcoin:btc,CURRENCY:BTCEUR,"71.935,4638",EUR,2026-10-25,,,
mexem:XXX,BME:XXX,,EUR,,,,
"""


def test_numero_formatos():
    assert g.numero("1.234,56") == 1234.56
    assert g.numero("1,2345") == 1.2345
    assert g.numero("1234.5") == 1234.5
    assert g.numero("71.935,4638") == 71935.4638
    assert g.numero("") is None and g.numero("n/d") is None


def test_filas_de_google():
    filas = g.filas_de_google(g.leer_csv(CSV), "2026-10-25T20:00:00Z")
    assert [f["id"] for f in filas] == ["mexem:AMZN", "mexem:DMX", "bitcoin:btc", "mexem:XXX"]
    amzn, dmx, btc, xxx = filas
    assert amzn["precio"] == 248.5 and amzn["moneda"] == "USD" and amzn["origen"] == "google"
    assert amzn["fuente"] == "google_finance" and amzn["detalle"] == '{"cierre_anterior":250.38}'
    assert dmx["moneda"] == "CAD" and dmx["precio"] == 0.39
    assert btc["precio"] == 71935.4638
    assert xxx["estado"] == "sin dato" and xxx["fecha_dato"] is None


def test_no_se_guardan_columnas_derivadas():
    filas = g.filas_de_google(g.leer_csv(CSV), "2026-10-25T20:00:00Z")
    assert all("0,8926" not in (f["detalle"] or "") for f in filas)


def test_faltan_columnas():
    try:
        g.leer_csv("a,b\n1,2\n")
        assert False
    except ValueError as e:
        assert "faltan" in str(e)


def test_main_archivo_escribe_en_crudo(tmp_path):
    p = tmp_path / "u.csv"
    p.write_text(CSV, encoding="utf-8")
    assert g.main(["--archivo", str(p)]) == 0
    ficheros = list(crudo.CRUDO_DIR.glob("*.csv"))
    assert len(ficheros) == 1
    filas = list(csv.DictReader(ficheros[0].open(encoding="utf-8")))
    assert len(filas) == 4 and filas[0]["origen"] == "google"


def test_main_no_rompe_si_falla(capsys):
    assert g.main(["--archivo", "/no/existe.csv"]) == 0
    assert "AVISO Google" in capsys.readouterr().out
