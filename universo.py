"""Lista UNICA de vehiculos que sigo (universo.json) y su validacion.

Lo leen la captura diaria (fetch_precios_publico.py) y el comparador de fuentes
(fuentes_vl/comparar_fuentes.py). Solo tickers, ISIN y fuentes: NUNCA cantidades ni datos personales.
Para anadir un vehiculo nuevo: ver ALTA.md.
"""
import json
from pathlib import Path

UNIVERSO_PATH = Path(__file__).resolve().parent / "universo.json"

TIPOS = ("accion", "etf", "fondo", "plan", "cripto", "materia_prima")
ESTADOS = ("activo", "pendiente", "retirado")
FUENTES_CONOCIDAS = ("yahoo", "ft", "quefondos", "finanzen", "renta4", "gestora", "coingecko", "gold-api",
                     "google_finance", "twelve_data", "myinvestor")
PROHIBIDAS = ("cantidad", "unidades", "importe", "saldo", "patrimonio", "salario", "nif", "iban", "poliza",
              "titular", "email", "valor_eur", "participaciones", "shares", "posicion")


class UniversoError(ValueError):
    """universo.json no es valido. El mensaje lista todos los problemas."""


def validar_universo(doc):
    """Devuelve la lista de problemas (vacia si todo esta bien)."""
    errores = []
    if not isinstance(doc, dict) or not isinstance(doc.get("vehiculos"), list):
        return ["falta la lista 'vehiculos'"]
    vistos = set()
    for i, v in enumerate(doc["vehiculos"], 1):
        donde = f"vehiculo {i}"
        if not isinstance(v, dict):
            errores.append(f"{donde}: no es un objeto")
            continue
        id_ = v.get("id")
        if not isinstance(id_, str) or not id_.strip():
            errores.append(f"{donde}: falta 'id'")
        else:
            donde = f"{id_!r}"
            if id_ in vistos:
                errores.append(f"{donde}: id repetido")
            vistos.add(id_)
        if v.get("tipo") not in TIPOS:
            errores.append(f"{donde}: tipo no valido {v.get('tipo')!r} (validos: {', '.join(TIPOS)})")
        if v.get("estado", "activo") not in ESTADOS:
            errores.append(f"{donde}: estado no valido {v.get('estado')!r} (validos: {', '.join(ESTADOS)})")
        if not isinstance(v.get("moneda"), str) or not v["moneda"].strip():
            errores.append(f"{donde}: falta 'moneda'")
        fuentes = v.get("fuentes")
        if not isinstance(fuentes, list) or not fuentes:
            errores.append(f"{donde}: necesita al menos una fuente")
        else:
            for j, fu in enumerate(fuentes, 1):
                if not isinstance(fu, dict) or fu.get("fuente") not in FUENTES_CONOCIDAS:
                    errores.append(f"{donde}: fuente {j} no reconocida {fu!r}")
                elif fu["fuente"] == "yahoo" and not (isinstance(fu.get("ticker"), str) and fu["ticker"].strip()):
                    errores.append(f"{donde}: la fuente yahoo necesita 'ticker'")
        if v.get("tipo") == "fondo" and not v.get("isin"):
            errores.append(f"{donde}: un fondo necesita 'isin'")
        for clave in v:
            if any(p in str(clave).lower() for p in PROHIBIDAS):
                errores.append(f"{donde}: la clave {clave!r} parece un dato personal (no se permite)")
    return errores


def cargar_universo(path=None):
    """Lee y valida universo.json. Si no es valido, falla con TODOS los problemas a la vista."""
    path = Path(path) if path else UNIVERSO_PATH
    try:
        doc = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError) as e:
        raise UniversoError(f"no se pudo leer {path.name}: {e}") from e
    errores = validar_universo(doc)
    if errores:
        raise UniversoError(f"{path.name} no es valido:\n  - " + "\n  - ".join(errores))
    return doc


def vehiculos(doc, estado="activo", tipo=None, broker=None):
    """Vehiculos del universo en el estado indicado (por defecto, solo los 'activo'), en el orden del fichero."""
    return [v for v in doc["vehiculos"]
            if v.get("estado", "activo") == estado
            and (tipo is None or v["tipo"] == tipo)
            and (broker is None or v.get("broker") == broker)]


def fuente(vehiculo, nombre):
    """Primera fuente con ese nombre dentro de un vehiculo, o None."""
    return next((f for f in vehiculo["fuentes"] if f["fuente"] == nombre), None)
