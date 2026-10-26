"""Pruebas de universo.json (lista unica de vehiculos) y de su validacion. Ejecutar: python3 -m pytest -q"""
import copy
import json
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent))
import universo as u  # noqa: E402


@pytest.fixture
def doc():
    return copy.deepcopy(u.cargar_universo())


def test_el_universo_real_es_valido():
    assert u.validar_universo(json.loads(u.UNIVERSO_PATH.read_text(encoding="utf-8"))) == []


def test_contrato_los_vehiculos_de_hoy_siguen_ahi(doc):
    """Foto de lo que se captura el 26/10/2026 (HUMA y CRML retiradas: vendidas el 01/10/2026): si alguien quita uno por error, esta prueba falla."""
    por_tipo = {t: u.vehiculos(doc, tipo=t) for t in u.TIPOS}
    assert {t: len(v) for t, v in por_tipo.items()} == {
        "accion": 15, "etf": 5, "fondo": 8, "plan": 1, "cripto": 1, "materia_prima": 1}
    assert {v["id"] for v in por_tipo["accion"]} == {f"mexem:{t}" for t in (
        "AMZN", "APR0", "DMX", "E5S1", "ERO", "GOOGL", "IDR", "KRKNF", "META", "MP",
        "NXT", "OHLA", "PLTR", "RIG", "TRE")}
    assert {v["isin"] for v in por_tipo["fondo"]} == {
        "ES0124037013", "ES0146309002", "ES0165243025", "ES0173311103", "IE000QAZP7L2", "IE000ZYRH0Q7",
        "IE00BM95B621", "LU0625737910"}
    assert u.fuente(next(v for v in por_tipo["fondo"] if v["isin"] == "LU0625737910"), "yahoo")["ticker"] == "LU0625737910.LU"
    assert {v["id"] for v in por_tipo["cripto"] + por_tipo["materia_prima"] + por_tipo["plan"]} == {
        "bitcoin:btc", "oro-fisico:joyeria", "myinvestor:plan-pensiones"}


def test_ids_unicos_y_sin_datos_personales():
    texto = u.UNIVERSO_PATH.read_text(encoding="utf-8").lower()
    for p in u.PROHIBIDAS:
        assert f'"{p}' not in texto, p


def test_solo_se_capturan_los_activos(doc):
    doc["vehiculos"][0]["estado"] = "pendiente"
    doc["vehiculos"][1]["estado"] = "retirado"
    ids = {v["id"] for v in u.vehiculos(doc)}
    assert doc["vehiculos"][0]["id"] not in ids and doc["vehiculos"][1]["id"] not in ids
    assert {v["id"] for v in u.vehiculos(doc, estado="pendiente")} == {doc["vehiculos"][0]["id"]}


@pytest.mark.parametrize("cambio,mensaje", [
    (lambda v: v.update(id=""), "falta 'id'"),
    (lambda v: v.update(tipo="coche"), "tipo no valido"),
    (lambda v: v.update(estado="quiza"), "estado no valido"),
    (lambda v: v.pop("moneda"), "falta 'moneda'"),
    (lambda v: v.update(fuentes=[]), "al menos una fuente"),
    (lambda v: v.update(fuentes=[{"fuente": "inventada"}]), "no reconocida"),
    (lambda v: v.update(fuentes=[{"fuente": "yahoo"}]), "necesita 'ticker'"),
    (lambda v: v.update(cantidad=5), "dato personal"),
    (lambda v: v.update(saldo_eur=100), "dato personal"),
])
def test_la_validacion_rechaza_entradas_mal_escritas(doc, cambio, mensaje):
    cambio(doc["vehiculos"][0])
    errores = u.validar_universo(doc)
    assert any(mensaje in e for e in errores), errores


def test_id_repetido(doc):
    doc["vehiculos"][1]["id"] = doc["vehiculos"][0]["id"]
    assert any("id repetido" in e for e in u.validar_universo(doc))


def test_un_fondo_necesita_isin(doc):
    fondo = next(v for v in doc["vehiculos"] if v["tipo"] == "fondo")
    fondo.pop("isin")
    assert any("necesita 'isin'" in e for e in u.validar_universo(doc))


def test_sin_lista_de_vehiculos():
    assert u.validar_universo({}) == ["falta la lista 'vehiculos'"]


def test_universo_roto_falla_con_todos_los_problemas(tmp_path):
    p = tmp_path / "universo.json"
    p.write_text(json.dumps({"vehiculos": [{"id": "a", "tipo": "x"}, {"id": "a", "tipo": "accion"}]}), encoding="utf-8")
    with pytest.raises(u.UniversoError) as e:
        u.cargar_universo(p)
    assert "tipo no valido" in str(e.value) and "id repetido" in str(e.value)


def test_fichero_ausente_o_ilegible_da_error_claro(tmp_path):
    with pytest.raises(u.UniversoError, match="no se pudo leer"):
        u.cargar_universo(tmp_path / "no_existe.json")
    ilegible = tmp_path / "x.json"
    ilegible.write_text("{no es json", encoding="utf-8")
    with pytest.raises(u.UniversoError, match="no se pudo leer"):
        u.cargar_universo(ilegible)


# ---- F1.7: via de alta (los ejemplos de ALTA.md tienen que ser validos) ----
EJEMPLOS_ALTA = [
    {"id": "mexem:ABC", "tipo": "accion", "broker": "mexem", "moneda": "EUR", "estado": "pendiente",
     "fuentes": [{"fuente": "yahoo", "ticker": "ABC.MC"}]},
    {"id": "myinvestor-cobas:ES0000000000", "tipo": "fondo", "isin": "ES0000000000", "id_comparador": "ejemplo-fondo",
     "moneda": "EUR", "estado": "pendiente",
     "fuentes": [{"fuente": "yahoo", "ticker": "0P0000000.F", "lectura": "serie"}, {"fuente": "ft"},
                 {"fuente": "quefondos"}]},
]


def test_ejemplos_de_alta_son_validos_y_no_se_capturan():
    doc = u.cargar_universo()
    doc["vehiculos"] = doc["vehiculos"] + EJEMPLOS_ALTA
    u.validar_universo(doc)
    activos = {v["id"] for v in u.vehiculos(doc)}
    assert "mexem:ABC" not in activos and "myinvestor-cobas:ES0000000000" not in activos
    assert {v["id"] for v in u.vehiculos(doc, estado="pendiente")} == {"mexem:ABC", "myinvestor-cobas:ES0000000000"}
