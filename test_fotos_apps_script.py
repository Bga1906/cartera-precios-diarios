"""Ejecuta las pruebas Node del codigo Apps Script de las fotos y valida lo que genera con el validador de Python
(contrato entre los dos lenguajes). Se salta si no hay Node."""
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
    d = tmp_path_factory.mktemp("fotos")
    env = {k: v for k, v in os.environ.items() if k != "FONDOS_SCRIPT"}
    env["FOTOS_SALIDA"] = str(d)
    r = subprocess.run([NODE, "--test", str(AQUI / "google" / "test_fotos.test.mjs")], capture_output=True, text=True, env=env, timeout=180)
    assert r.returncode == 0, r.stdout[-3000:] + r.stderr[-1000:]
    return d


def test_fotos_generadas_por_js_las_valida_python(salida):
    fotos = sorted(salida.glob("foto_fondos_*.json"))
    assert fotos
    for f in fotos:
        assert fc.cargar_foto(f)[1] == [], f.name


def test_libro_e_historial_generados(salida):
    assert fc.validar_libro(json.loads((salida / "libro_fondos.json").read_text())) == []
    assert fc.validar_historial(json.loads((salida / "historial_fondos.json").read_text())) == []


def test_codigo_nuevo_sin_datos_personales():
    for nombre in ("foto_cartera.gs", "fotos_fondos.gs"):
        t = (AQUI / "google" / nombre).read_text(encoding="utf-8")
        assert not re.search(r"['\"][A-Za-z0-9_-]{28,}['\"]", t), nombre
        assert "1J4iKwig" not in t
