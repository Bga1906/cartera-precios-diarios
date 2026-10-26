"""Ejecuta las pruebas Node del codigo Apps Script de la foto de CRYPTO y valida lo que genera con el validador de Python
(contrato entre los dos lenguajes, y con el consolidador). Se salta si no hay Node. Solo datos inventados."""
import json
import os
import re
import shutil
import subprocess
from pathlib import Path

import pytest

import foto_cartera as fc

AQUI = Path(__file__).parent
NODE = shutil.which("node")


@pytest.fixture(scope="module")
def salida(tmp_path_factory):
    if not NODE:
        pytest.skip("Node no esta instalado")
    d = tmp_path_factory.mktemp("fotos_cripto")
    env = dict(os.environ)
    env["FOTOS_SALIDA"] = str(d)
    r = subprocess.run([NODE, "--test", str(AQUI / "google" / "test_fotos_cripto.test.mjs")], capture_output=True, text=True, env=env, timeout=180)
    assert r.returncode == 0, r.stdout[-3000:] + r.stderr[-1000:]
    return d


def test_fotos_generadas_por_js_las_valida_python(salida):
    fotos = sorted(salida.glob("foto_cripto_*.json"))
    assert len(fotos) >= 4          # BTC, varias monedas, moneda sin precio oficial, sin oficial/ultimo.json
    for f in fotos:
        assert fc.cargar_foto(f)[1] == [], f.name


def test_foto_del_sheet_se_parece_a_la_provisional_en_lo_que_lee_el_consolidador(salida):
    f = json.loads((salida / "foto_cripto_2026-10-27.json").read_text())
    assert f["sheet"] == "cripto" and f["vehiculo"] == "Cripto"
    assert "origen" not in f                       # por defecto = «sheet»
    assert [p["id"] for p in f["posiciones"]] == ["bitcoin:btc"]
    assert f["posiciones"][0]["nombre"] == "btc" and f["posiciones"][0]["tipo"] == "cripto"


def test_moneda_nueva_sin_precio_oficial_sale_sin_dato_y_valida(salida):
    f = json.loads((salida / "foto_cripto_2026-10-29.json").read_text())
    sol = next(p for p in f["posiciones"] if p["id"] == "cripto:sol")
    assert sol["estado_precio"] == "sin_dato" and sol["valor_eur"] is None and "sin precio oficial" in sol["avisos"]
    assert all(p["estado_precio"] != "sin_oficial" for p in f["posiciones"])


def test_libro_e_historial_generados(salida):
    assert fc.validar_libro(json.loads((salida / "libro_cripto.json").read_text())) == []
    assert fc.validar_historial(json.loads((salida / "historial_cripto.json").read_text())) == []


def test_codigo_nuevo_sin_datos_personales():
    t = (AQUI / "google" / "fotos_cripto.gs").read_text(encoding="utf-8")
    assert not re.search(r"['\"][A-Za-z0-9_-]{28,}['\"]", t)
    assert "docs.google.com" not in t and "drive.google.com" not in t
