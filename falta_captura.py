"""Pasada de madrugada (F1.6): decide si falta la captura de la noche anterior.

Mira precios/ultimo.json. Si su hora de generacion (UTC en el servidor de GitHub) tiene mas de 16 h, o no existe,
la captura de las 20:00 UTC no ha llegado a correr y la pasada de madrugada debe ejecutarla. Imprime «si» o «no».
"""
import datetime
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ULTIMO = HERE / "precios" / "ultimo.json"
HORAS_MAX = 16


def falta(ultimo_path, ahora, horas=HORAS_MAX):
    """True si no hay captura reciente (o no se puede leer). ahora: datetime sin zona, en UTC."""
    try:
        gen = json.loads(Path(ultimo_path).read_text(encoding="utf-8"))["generado_en"]
        t = datetime.datetime.fromisoformat(gen)
    except (OSError, KeyError, ValueError):
        return True
    return (ahora - t).total_seconds() / 3600 > horas


def main():
    ahora = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)
    print("si" if falta(ULTIMO, ahora) else "no")
    return 0


if __name__ == "__main__":
    sys.exit(main())
