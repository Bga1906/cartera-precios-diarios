import datetime
import json

import crudo
import google_lector as g
import inspector as ins
import latido
import vigilancia as v

AHORA = datetime.datetime(2026, 10, 26, 7, 0, tzinfo=datetime.timezone.utc)


def f(cap, origen, fuente, estado="ok"):
    return crudo.fila(cap, origen, "x:1", fuente, "T", 1.0, "EUR", "2026-10-23", estado)


def test_calcular_latido():
    filas = [f("2026-10-25T20:00:00Z", "github", "yahoo"), f("2026-10-25T22:30:00Z", "google", "google_finance"),
             f("2026-10-25T20:00:00Z", "github", "yahoo", "error")]
    lat = latido.calcular(filas, AHORA, {"ok": 3})
    assert lat["origenes"]["google"]["ultima_captura_utc"] == "2026-10-25T22:30:00Z"
    assert lat["fuentes"]["github/yahoo"] == {"ultima_captura_utc": "2026-10-25T20:00:00Z", "ok": 1, "fallos": 1}
    assert lat["oficial"] == {"ok": 3}


def _lat(gh, goo, gen="2026-10-26T06:00:00Z"):
    return {"generado_en": gen, "origenes": {"github": {"ultima_captura_utc": gh}, "google": {"ultima_captura_utc": goo}}}


def test_todo_al_dia():
    lat = _lat("2026-10-25T20:00:00Z", "2026-10-26T06:30:00Z")
    assert v.evaluar(lat, {"ultima_foto_utc": "2026-10-25T22:10:00Z"}, AHORA) == []


def test_github_parado():
    lat = _lat("2026-10-24T20:00:00Z", "2026-10-26T06:30:00Z")
    a = v.evaluar(lat, {"ultima_foto_utc": "2026-10-25T22:10:00Z"}, AHORA)
    assert len(a) == 1 and "github" in a[0]


def test_google_parado_o_sin_foto():
    lat = _lat("2026-10-25T20:00:00Z", "2026-10-26T06:30:00Z")
    assert "foto nocturna" in v.evaluar(lat, {"ultima_foto_utc": "2026-10-23T22:10:00Z"}, AHORA)[0]
    assert "no ha publicado" in v.evaluar(lat, {"ultima_foto_utc": None}, AHORA)[0]


def test_sin_latido():
    assert "no ha corrido" in v.evaluar(None, None, AHORA)[0]


def test_foto_de_google_y_latido_google(tmp_path, monkeypatch):
    csv = "id,ticker_google,precio,moneda,fecha_dato,ultima_foto_utc\nmexem:A,A,\"1,5\",EUR,2026-10-23,2026-10-25T22:10:00Z\nmexem:B,B,2,EUR,2026-10-23,\n"
    assert g.foto_de_google(g.leer_csv(csv)) == "2026-10-25T22:10:00Z"
    monkeypatch.setattr(g, "LATIDO_GOOGLE", tmp_path / "lg.json")
    p = tmp_path / "u.csv"
    p.write_text(csv, encoding="utf-8")
    g.main(["--archivo", str(p)])
    assert json.loads((tmp_path / "lg.json").read_text())["ultima_foto_utc"] == "2026-10-25T22:10:00Z"


def test_inspector_con_salida_no_escribe_latido(tmp_path, monkeypatch):
    monkeypatch.setattr(ins, "HERE", tmp_path)
    ins.main(["--hasta", "2026-10-26T07:00:00Z", "--salida", str(tmp_path / "of")])
    assert not (tmp_path / "latido.json").exists()
