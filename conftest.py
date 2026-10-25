"""Aislamiento comun de las pruebas: ninguna prueba puede escribir en el crudo real ni arrastrar lecturas de otra."""
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent))
import crudo  # noqa: E402
import fetch_precios_publico  # noqa: E402


@pytest.fixture(autouse=True)
def crudo_aislado(tmp_path, monkeypatch):
    monkeypatch.setattr(crudo, "CRUDO_DIR", tmp_path / "crudo_de_prueba")
    fetch_precios_publico.LECTURAS_YAHOO.clear()
    yield
    fetch_precios_publico.LECTURAS_YAHOO.clear()
