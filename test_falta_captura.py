import datetime
import json

import falta_captura as fc

AHORA = datetime.datetime(2026, 10, 26, 4, 30)


def _u(tmp_path, gen):
    p = tmp_path / "ultimo.json"
    p.write_text(json.dumps({"generado_en": gen}), encoding="utf-8")
    return p


def test_captura_de_anoche_no_falta(tmp_path):
    assert fc.falta(_u(tmp_path, "2026-10-25T22:11:21"), AHORA) is False


def test_captura_de_anteayer_si_falta(tmp_path):
    assert fc.falta(_u(tmp_path, "2026-10-24T22:11:21"), AHORA) is True


def test_sin_fichero_o_roto_falta(tmp_path):
    assert fc.falta(tmp_path / "no.json", AHORA) is True
    p = tmp_path / "x.json"
    p.write_text("{}", encoding="utf-8")
    assert fc.falta(p, AHORA) is True
