"""Pruebas del validador de fotos (foto_cartera.py)."""
import copy
import json

import foto_cartera as fc


def foto_ok():
    pos = {
        "id": "x:1", "nombre": "Fondo", "tipo": "fondo", "cantidad": 10, "moneda": "EUR", "precio": 100,
        "precio_eur": 100, "fecha_precio": "2026-10-21", "estado_precio": "ok", "frescura": "OK", "dias_desfase": 1,
        "valor_eur": 1000, "coste_eur": 900, "coste_tipo": "fiscal_entidad", "estado_coste": "", "no_liquido": False,
        "oficial": None, "avisos": [],
    }
    plan = dict(pos, id="x:plan", tipo="plan", valor_eur=500, no_liquido=True)
    return {
        "formato": "foto_cartera/v1", "sheet": "fondos", "fecha_foto": "2026-10-23", "generado_utc": "2026-10-23T06:45:00Z",
        "version_script": "2.2", "version_exportador": "F3.1", "fuente_precios": "precios", "fecha_captura_precios": "2026-10-22",
        "huella": {"hash": "c53:abc"}, "avisos": [],
        "totales": {"valor_liquido_eur": 1000, "valor_no_liquido_eur": 500, "valor_total_eur": 1500,
                    "aportado_efectivo_eur": 950, "coste_liquido_eur": 900, "resultado_liquido_eur": 50},
        "posiciones": [pos, plan],
    }


def test_foto_valida():
    assert fc.validar_foto(foto_ok()) == []


def test_detecta_errores():
    casos = [
        lambda f: f.update(formato="otra/v1"),
        lambda f: f.update(fecha_foto="23/10/2026"),
        lambda f: f["posiciones"][0].update(estado_precio="raro"),
        lambda f: f["posiciones"][1].update(id="x:1"),
        lambda f: f["totales"].update(valor_liquido_eur=1005),
        lambda f: f["totales"].update(valor_total_eur=1400),
        lambda f: f.pop("huella"),
        lambda f: f["posiciones"][0].pop("avisos"),
        lambda f: f["posiciones"][0].update(valor_eur="mil"),
        lambda f: f.update(fuente_precios="otra"),
    ]
    for mut in casos:
        f = foto_ok()
        mut(f)
        assert fc.validar_foto(f), mut


def test_valores_null_permitidos():
    f = foto_ok()
    f["posiciones"][0].update(precio=None, precio_eur=None, valor_eur=None, estado_precio="sin_dato")
    f["totales"].update(valor_liquido_eur=0, valor_total_eur=500)
    assert fc.validar_foto(f) == []


def test_libro_e_historial():
    assert fc.validar_libro({"formato": "libro_cartera/v1", "libro": {"filas": []}, "compras_nuevas": {"filas": []}, "huella": {"hash": "c53:a"}}) == []
    assert fc.validar_libro({"formato": "x"})
    assert fc.validar_historial({"formato": "historial_cartera/v1", "series": [{"fecha": "2026-10-20"}, {"fecha": "2026-10-21"}]}) == []
    assert fc.validar_historial({"formato": "historial_cartera/v1", "series": [{"fecha": "2026-10-21"}, {"fecha": "2026-10-20"}]})


def test_cli(tmp_path):
    bueno = tmp_path / "b.json"
    bueno.write_text(json.dumps(foto_ok()))
    malo = copy.deepcopy(foto_ok())
    malo["formato"] = "x"
    m = tmp_path / "m.json"
    m.write_text(json.dumps(malo))
    assert fc.main([str(bueno)]) == 0
    assert fc.main([str(bueno), str(m)]) == 1
