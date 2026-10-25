"""Crudo: los justificantes. Una linea por vehiculo, fuente y captura, tal como la dio la fuente.

Reglas (F1.2, 25/10/2026):
  - SOLO se anaden lineas al final de crudo/AAAA-MM.csv. Nunca se reescribe ni se borra nada.
  - Nada de aqui puede romper la captura de precios: quien lo llama lo envuelve en try/except.
  - Solo tickers, precios y fechas publicas. NUNCA cantidades ni datos personales.

Columnas: captura_utc, origen (github|google), id, fuente, ticker, precio, moneda, fecha_dato, estado, detalle
  - id: el mismo identificador que en precios/*.json (mexem:AMZN, myinvestor-cobas:ISIN, benchmark:...).
  - precio: el valor TAL CUAL lo dio la fuente (en su moneda original, sin convertir).
  - fecha_dato: la fecha REAL del dato segun la fuente (no la de la captura).
  - estado: "ok" o el texto del error.
  - detalle: JSON compacto con lo que ayuda a auditar (p. ej. el 'precio actual' de la ficha de Yahoo).
"""
import csv
import datetime
import json
import zoneinfo
from pathlib import Path

HERE = Path(__file__).resolve().parent
CRUDO_DIR = HERE / "crudo"
ZONA_MADRID = zoneinfo.ZoneInfo("Europe/Madrid")
COLUMNAS = ["captura_utc", "origen", "id", "fuente", "ticker", "precio", "moneda", "fecha_dato", "estado", "detalle"]


def _fmt(v):
    if v is None:
        return ""
    if isinstance(v, bool):
        return str(v).lower()
    if isinstance(v, float):
        return repr(v)
    return str(v)


def fila(captura_utc, origen, id_, fuente, ticker=None, precio=None, moneda=None, fecha_dato=None,
         estado="ok", detalle=None):
    """Una linea de crudo como diccionario con TODAS las columnas."""
    return {
        "captura_utc": captura_utc, "origen": origen, "id": id_, "fuente": fuente, "ticker": ticker,
        "precio": precio, "moneda": moneda, "fecha_dato": fecha_dato, "estado": estado,
        "detalle": (json.dumps(detalle, ensure_ascii=False, separators=(",", ":"), sort_keys=True)
                    if detalle else None),
    }


def anadir_filas(filas, carpeta=None):
    """Anade las filas al CSV del mes de cada una (por su captura_utc). Devuelve cuantas se anadieron."""
    carpeta = Path(carpeta) if carpeta else CRUDO_DIR
    por_mes = {}
    for f in filas:
        por_mes.setdefault(f["captura_utc"][:7], []).append(f)
    total = 0
    for mes, grupo in sorted(por_mes.items()):
        carpeta.mkdir(parents=True, exist_ok=True)
        path = carpeta / f"{mes}.csv"
        nuevo = not path.exists()
        with path.open("a", newline="", encoding="utf-8") as fh:
            w = csv.writer(fh, lineterminator="\n")
            if nuevo:
                w.writerow(COLUMNAS)
            for f in grupo:
                w.writerow([_fmt(f.get(c)) for c in COLUMNAS])
                total += 1
    return total


def ahora_utc():
    return datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


# ---------------------------------------------------------------- captura diaria (GitHub)
def filas_de_captura(lecturas_yahoo, activos, universo, catalogo, captura_utc, origen="github"):
    """Filas de crudo de la captura diaria.

    lecturas_yahoo: lista de {"ticker", "rango", "desde_serie", "res"} (lo que devolvio Yahoo, sin convertir).
    activos: el diccionario que se guarda en precios/ (para oro y bitcoin, que tienen otras fuentes).
    universo: universo.json ya cargado; catalogo: lista de benchmarks (id, ticker).
    """
    ids_por_ticker = {}
    for v in universo["vehiculos"]:
        if v.get("estado", "activo") != "activo":
            continue
        y = next((f for f in v["fuentes"] if f["fuente"] == "yahoo"), None)
        if y:
            ids_por_ticker.setdefault(y["ticker"], []).append(v["id"])
    for b in catalogo or []:
        ids_por_ticker.setdefault(b["ticker"], []).append(f"benchmark:{b['id']}")

    out = []
    for lec in lecturas_yahoo:
        res = lec["res"]
        ok = res.get("precio") is not None
        detalle = {}
        if lec.get("desde_serie"):
            detalle["lectura"] = res.get("as_of_fuente") or "ficha"
            if res.get("as_of_fuente") == "cierre_serie":
                detalle["ficha_precio"] = res.get("ficha_precio")
                detalle["ficha_fecha"] = res.get("ficha_as_of")
        if res.get("cierre_anterior") is not None:
            detalle["cierre_anterior"] = res["cierre_anterior"]
        for id_ in ids_por_ticker.get(lec["ticker"], []):
            out.append(fila(captura_utc, origen, id_, "yahoo", lec["ticker"], res.get("precio"), res.get("moneda"),
                            res.get("as_of"), "ok" if ok else (res.get("error") or "sin dato"), detalle))

    oro = activos.get("oro-fisico:joyeria") or {}
    if str(oro.get("precio_oz_fuente") or "").startswith("gold-api"):
        out.append(fila(captura_utc, origen, "oro-fisico:joyeria", "gold-api", "XAU/USD", oro.get("precio_oz_usd"),
                        "USD", None, "ok", {"eur_usd": oro.get("eur_usd")}))
    elif oro.get("error"):
        out.append(fila(captura_utc, origen, "oro-fisico:joyeria", "gold-api", "XAU/USD", None, "USD", None,
                        str(oro["error"])))
    btc = activos.get("bitcoin:btc") or {}
    if str(btc.get("fuente") or "").startswith("CoinGecko"):
        out.append(fila(captura_utc, origen, "bitcoin:btc", "coingecko", "bitcoin/eur", btc.get("price"), "EUR",
                        None, "ok"))
    return out


# ---------------------------------------------------------------- comparador de fuentes (GitHub)
def filas_de_comparador(filas_comparador, universo, origen="github"):
    """Pasa las filas del comparador (fondos, plan, indices; FT, quefondos, gestoras...) al formato de crudo.

    La hora del comparador es la de Madrid; aqui se guarda en UTC."""
    id_por_comparador = {v["id_comparador"]: v["id"] for v in universo["vehiculos"] if v.get("id_comparador")}
    out = []
    for f in filas_comparador:
        local = datetime.datetime.fromisoformat(f"{f['captura']}T{f['hora']}:00").replace(tzinfo=ZONA_MADRID)
        captura_utc = local.astimezone(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        if f["tipo"] == "indice":
            id_ = f"benchmark:{f['id']}"
        else:
            id_ = id_por_comparador.get(f["id"])
            if id_ is None:
                continue  # un vehiculo que ya no esta en el universo: no se anota
        estado = f.get("estado") or ""
        ok = f.get("precio") is not None and estado.split(" ")[0].strip('"') == "OK"
        out.append(fila(captura_utc, origen, id_, str(f["fuente"]).lower().replace(" ", ""), f.get("codigo"),
                        f.get("precio"), "EUR" if f["tipo"] != "indice" else None, f.get("fecha_dato"),
                        "ok" if ok else estado, {"estado_fuente": estado} if ok and estado != "OK" else None))
    return out
