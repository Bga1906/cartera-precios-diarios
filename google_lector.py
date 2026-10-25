"""Lector de la captura secundaria de Google (F1.3, 25/10/2026).

Descarga el CSV publicado de la pestana «Ultima» del Sheet «Precios secundaria» y anade sus lineas al crudo
con origen=google. No toca precios/ ni oficial/. Si algo falla, avisa y termina sin romper nada.

Uso:  python3 google_lector.py            (descarga y anota)
      python3 google_lector.py --archivo x.csv   (lee un CSV local, para probar)
"""
import csv
import io
import json
import re
import sys
import urllib.request
from pathlib import Path

import crudo as _crudo

HERE = Path(__file__).resolve().parent
CONFIG = HERE / "google" / "config.json"
LATIDO_GOOGLE = HERE / "latido_google.json"
COLUMNAS_ESPERADAS = ["id", "ticker_google", "precio", "moneda", "fecha_dato"]
RE_FECHA = re.compile(r"^\d{4}-\d{2}-\d{2}$")


def numero(texto):
    """Pasa '1.234,56', '1,2345', '1234.5' o '' a float (o None). El Sheet esta en espanol, pero se admiten ambos."""
    s = (texto or "").strip().replace(" ", "").replace(" ", "")
    if not s:
        return None
    if "," in s and "." in s:
        s = s.replace(".", "").replace(",", ".") if s.rfind(",") > s.rfind(".") else s.replace(",", "")
    elif "," in s:
        s = s.replace(",", ".")
    try:
        return float(s)
    except ValueError:
        return None


def descargar(url, timeout=30):
    req = urllib.request.Request(url, headers={"User-Agent": "cartera-precios-bot"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read().decode("utf-8-sig")


def leer_csv(texto):
    """Lista de diccionarios. Lanza ValueError si faltan columnas."""
    lector = csv.DictReader(io.StringIO(texto))
    faltan = [c for c in COLUMNAS_ESPERADAS if c not in (lector.fieldnames or [])]
    if faltan:
        raise ValueError(f"Al CSV de Google le faltan columnas: {faltan}")
    return [f for f in lector if (f.get("id") or "").strip()]


def foto_de_google(registros):
    """Hora (UTC) de la ultima foto nocturna del Apps Script, si el Sheet la publica en la columna ultima_foto_utc."""
    for r in registros:
        v = (r.get("ultima_foto_utc") or "").strip()
        if v:
            return v
    return None


def filas_de_google(registros, captura_utc, origen="google"):
    """Lineas de crudo (una por vehiculo) a partir de las filas del CSV. Precio TAL CUAL, sin convertir."""
    out = []
    for r in registros:
        precio = numero(r.get("precio"))
        fecha = (r.get("fecha_dato") or "").strip()
        fecha = fecha if RE_FECHA.match(fecha) else None
        detalle = {}
        cierre = numero(r.get("cierre_anterior"))
        if cierre is not None:
            detalle["cierre_anterior"] = cierre
        out.append(_crudo.fila(
            captura_utc, origen, r["id"].strip(), "google_finance", (r.get("ticker_google") or "").strip() or None,
            precio, (r.get("moneda") or "").strip() or None, fecha,
            "ok" if precio is not None else "sin dato", detalle))
    return out


def main(argv=None):
    argv = list(sys.argv[1:] if argv is None else argv)
    try:
        if "--archivo" in argv:
            texto = Path(argv[argv.index("--archivo") + 1]).read_text(encoding="utf-8-sig")
        else:
            texto = descargar(json.loads(CONFIG.read_text(encoding="utf-8"))["ultima_csv_url"])
        registros = leer_csv(texto)
        ahora = _crudo.ahora_utc()
        filas = filas_de_google(registros, ahora)
        n = _crudo.anadir_filas(filas)
        LATIDO_GOOGLE.write_text(json.dumps({"leido_utc": ahora, "ultima_foto_utc": foto_de_google(registros)},
                                            indent=1) + "\n", encoding="utf-8")
        sin = sum(1 for f in filas if f["estado"] != "ok")
        print(f"Google: {n} lineas anotadas en el crudo ({sin} sin dato).")
    except Exception as e:  # nunca rompe nada: el aviso lo dara la vigilancia (F1.5)
        print(f"AVISO Google: no se pudo leer la captura secundaria: {e}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
