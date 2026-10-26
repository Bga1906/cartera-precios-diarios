"""Ejecuta las pruebas Node del consolidador (google/consolidador.gs) y valida lo que escribe con el validador gemelo de
Python (contrato entre los dos lenguajes). Solo fotos inventadas. Se salta si no hay Node."""
import json
import re
import shutil
import subprocess
from pathlib import Path

import pytest

import foto_consolidada as fc

AQUI = Path(__file__).parent
NODE = shutil.which("node")


@pytest.fixture(scope="module")
def salida(tmp_path_factory):
    if not NODE:
        pytest.skip("Node no esta instalado")
    d = tmp_path_factory.mktemp("consolidadas")
    import os
    env = {k: v for k, v in os.environ.items() if k not in ("FOTOS_REALES",)}
    env["FOTOS_SALIDA"] = str(d)
    r = subprocess.run([NODE, "--test", str(AQUI / "google" / "test_consolidador.test.mjs")], capture_output=True, text=True, env=env, timeout=180)
    assert r.returncode == 0, r.stdout[-3000:] + r.stderr[-1000:]
    return d


def test_consolidadas_generadas_por_js_las_valida_python(salida):
    ficheros = sorted(salida.glob("sintetica_*.json"))
    assert len(ficheros) == 2
    for f in ficheros:
        assert fc.validar_consolidada(json.loads(f.read_text(encoding="utf-8"))) == [], f.name


def _base(salida):
    return json.loads((salida / "sintetica_completa.json").read_text(encoding="utf-8"))


def test_rechaza_total_que_no_es_la_suma(salida):
    c = _base(salida); c["totales"]["valor_total_eur"] += 1
    assert any("suma de los vehiculos" in x for x in fc.validar_consolidada(c))


def test_rechaza_posicion_que_falta(salida):
    c = _base(salida); c["posiciones"].pop()
    assert any("posiciones" in x for x in fc.validar_consolidada(c))


def test_rechaza_completa_mentirosa(salida):
    c = _base(salida); c["vehiculos"][0]["estado"] = "atrasado"
    assert any("completa" in x or "atrasados" in x for x in fc.validar_consolidada(c))


def test_rechaza_ausente_con_datos(salida):
    c = _base(salida); c["vehiculos"][1]["estado"] = "ausente"
    assert fc.validar_consolidada(c)


def test_codigo_sin_datos_personales_ni_salidas_a_internet():
    t = (AQUI / "google" / "consolidador.gs").read_text(encoding="utf-8")
    assert not re.search(r"[A-Za-z0-9_-]{28,}", t)
    assert not re.search(r"https?://|UrlFetchApp|MailApp|GmailApp|setTrashed|deleteFile", t)
