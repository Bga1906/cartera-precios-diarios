"""Inspector de precios (F1.4, 25/10/2026): elige el precio OFICIAL de cada vehiculo a partir del crudo.

Lee crudo/*.csv (justificantes de GitHub y Google) y escribe oficial/AAAA-MM-DD.json y oficial/ultimo.json.
No toca precios/ ni crudo/. Corre EN PARALELO: los lectores (Sheets, dashboard, vault) siguen leyendo precios/
hasta que Brian decida pasar a oficial/ (minimo 2 semanas de comparacion).

Reglas (DISENO_F1.md, seccion 4):
  1. Gana la primera fuente de la jerarquia con dato FRESCO (como mucho 1 dia habil por detras de la mas reciente).
  2. «dudoso» si otra fuente con la MISMA fecha y moneda difiere mas de 0,5 %, o si el dato oficial va 2+ dias
     habiles por detras del dia de captura (2+ dias naturales en cripto y materias primas).
  3. Un fondo o plan nunca puede tener fecha del dato igual o posterior al dia de su captura (se descarta esa lectura).
  4. Si la primera fuente falla o esta atrasada, gana la siguiente con estado «respaldo».
  5. Sin ninguna lectura valida: «sin_dato».
Uso:  python3 inspector.py [--hasta 2026-10-25T23:00:00Z] [--salida carpeta]
"""
import csv
import datetime
import json
import sys
from pathlib import Path

import crudo as _crudo
import latido as _latido
import universo as _universo

HERE = Path(__file__).resolve().parent
OFICIAL_DIR = HERE / "oficial"
PRECIOS_ULTIMO = HERE / "precios" / "ultimo.json"

# Quien manda primero, por tipo de vehiculo. Las fuentes de contraste (finanzen, renta4, gestora, myinvestor,
# twelve_data...) se guardan y se comparan, pero nunca ganan.
JERARQUIA = {
    "fondo": ["ft", "yahoo", "quefondos"],
    "plan": ["yahoo", "quefondos"],
    "accion": ["yahoo", "google_finance"],
    "etf": ["yahoo", "google_finance"],
    "cripto": ["yahoo", "coingecko", "google_finance"],
    "materia_prima": ["gold-api"],
}
# Fuentes de precio "spot" (el precio de AHORA): la API no da fecha, asi que su fecha es la de la captura (UTC).
SPOT_SIN_FECHA = ("gold-api",)
UMBRAL_DIFERENCIA = 0.005   # 0,5 %
FRESCO_DIAS_HABILES = 1
DUDOSO_DIAS_HABILES = 2
VENTANA_HORAS = 36
SIN_DIAS_HABILES = ("cripto", "materia_prima")  # estos se miden en dias naturales


def _dt(txt):
    return datetime.datetime.strptime(txt, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=datetime.timezone.utc)


def dias_habiles(desde_iso, hasta_iso):
    """Dias laborables (lun-vie) entre dos fechas, sin contar el de partida. 0 si desde >= hasta."""
    d1, d2 = datetime.date.fromisoformat(desde_iso), datetime.date.fromisoformat(hasta_iso)
    n = 0
    while d1 < d2:
        d1 += datetime.timedelta(days=1)
        n += d1.weekday() < 5
    return n


def _atraso(tipo, desde_iso, hasta_iso):
    if tipo in SIN_DIAS_HABILES:
        return max(0, (datetime.date.fromisoformat(hasta_iso) - datetime.date.fromisoformat(desde_iso)).days)
    return dias_habiles(desde_iso, hasta_iso)


def leer_crudo(hasta, carpeta=None, horas=VENTANA_HORAS):
    """Filas de crudo de la ventana (hasta - horas, hasta]. Devuelve lista de diccionarios."""
    carpeta = Path(carpeta) if carpeta else _crudo.CRUDO_DIR
    desde = hasta - datetime.timedelta(hours=horas)
    meses = {desde.strftime("%Y-%m"), hasta.strftime("%Y-%m")}
    out = []
    for mes in sorted(meses):
        p = carpeta / f"{mes}.csv"
        if not p.exists():
            continue
        with p.open(encoding="utf-8", newline="") as fh:
            for f in csv.DictReader(fh):
                try:
                    t = _dt(f["captura_utc"])
                except (KeyError, ValueError):
                    continue
                if desde < t <= hasta:
                    out.append(f)
    return out


def _precio(txt):
    try:
        return float(txt) if txt not in (None, "") else None
    except ValueError:
        return None


def lecturas_por_vehiculo(filas):
    """{id: {fuente: lectura mas reciente}} con lectura = dict(fuente, precio, moneda, fecha_dato, estado, captura_utc)."""
    out = {}
    for f in filas:
        l = {"fuente": f["fuente"], "precio": _precio(f.get("precio")), "moneda": f.get("moneda") or None,
             "fecha_dato": f.get("fecha_dato") or None, "estado": f.get("estado") or "",
             "captura_utc": f["captura_utc"]}
        if l["fecha_dato"] is None and l["fuente"] in SPOT_SIN_FECHA and l["precio"] is not None:
            l["fecha_dato"] = f["captura_utc"][:10]
        previa = out.setdefault(f["id"], {}).get(f["fuente"])
        if previa is None or l["captura_utc"] >= previa["captura_utc"]:
            out[f["id"]][f["fuente"]] = l
    return out


def _valida(l, tipo):
    """Una lectura sirve si tiene precio, estado ok y fecha; y un fondo/plan no puede datar del dia de su captura."""
    if l["precio"] is None or l["estado"] != "ok" or not l["fecha_dato"]:
        return False
    if tipo in ("fondo", "plan") and l["fecha_dato"] >= l["captura_utc"][:10]:
        return False
    return True


def decidir(vehiculo, lecturas, hasta_dia):
    """Elige el precio oficial de un vehiculo. lecturas = {fuente: lectura}. Devuelve el diccionario de salida."""
    tipo = vehiculo["tipo"]
    jerarquia = JERARQUIA.get(tipo, [])
    validas = {n: l for n, l in lecturas.items() if _valida(l, tipo)}
    resumen = [{"fuente": n, "precio": l["precio"], "fecha_dato": l["fecha_dato"],
                "estado": "ok" if n in validas else (l["estado"] if l["estado"] != "ok" else "descartada")}
               for n, l in sorted(lecturas.items())]
    base = {"id": vehiculo["id"], "tipo": tipo, "lecturas": resumen}

    candidatas = [n for n in jerarquia if n in validas]
    if not candidatas:
        return {**base, "fuente_elegida": None, "precio": None, "moneda": vehiculo.get("moneda"),
                "fecha_dato": None, "estado_precio": "sin_dato", "motivo": "ninguna fuente dio un dato valido"}

    mejor_fecha = max(l["fecha_dato"] for l in validas.values())
    frescas = [n for n in candidatas if dias_habiles(validas[n]["fecha_dato"], mejor_fecha) <= FRESCO_DIAS_HABILES]
    motivos = []
    if frescas:
        elegida = frescas[0]
        rango = jerarquia.index(elegida)
        estado = "ok" if rango == 0 else "respaldo"
        if rango:
            saltadas = [n for n in jerarquia[:rango]]
            motivos.append(f"respaldo: {', '.join(saltadas)} sin dato valido o atrasado")
    else:
        elegida, estado = candidatas[0], "dudoso"
        motivos.append("ninguna fuente de la jerarquia esta al dia")
    l = validas[elegida]

    # dudoso por desacuerdo con cualquier otra fuente (tambien las de contraste) con la misma fecha y moneda
    for n, o in validas.items():
        if n == elegida or o["fecha_dato"] != l["fecha_dato"] or (o["moneda"] or l["moneda"]) != l["moneda"]:
            continue
        dif = abs(o["precio"] - l["precio"]) / l["precio"] if l["precio"] else 0
        if dif > UMBRAL_DIFERENCIA:
            estado = "dudoso"
            motivos.append(f"{n} difiere {dif * 100:.2f} % con la misma fecha")
    atraso = _atraso(tipo, l["fecha_dato"], hasta_dia)
    if atraso >= DUDOSO_DIAS_HABILES:
        estado = "dudoso"
        motivos.append(f"el dato tiene {atraso} dias de atraso")
    return {**base, "fuente_elegida": elegida, "precio": l["precio"], "moneda": l["moneda"] or vehiculo.get("moneda"),
            "fecha_dato": l["fecha_dato"], "estado_precio": estado, "motivo": "; ".join(motivos) or "primera fuente al dia"}


def inspeccionar(universo, filas_crudo, hasta, precios_ultimo=None):
    hasta_dia = hasta.strftime("%Y-%m-%d")
    lecs = lecturas_por_vehiculo(filas_crudo)
    activos = {}
    for v in _universo.vehiculos(universo):
        r = decidir(v, lecs.get(v["id"], {}), hasta_dia)
        ref = ((precios_ultimo or {}).get("activos") or {}).get(v["id"]) or {}
        if ref.get("price") is not None:
            r["precios_json_eur"] = ref["price"]  # solo de referencia durante el periodo en paralelo
        activos[r.pop("id")] = r
    cuenta = {}
    for r in activos.values():
        cuenta[r["estado_precio"]] = cuenta.get(r["estado_precio"], 0) + 1
    return {"fecha": hasta_dia, "hasta": hasta.strftime("%Y-%m-%dT%H:%M:%SZ"), "version": 1,
            "resumen": dict(sorted(cuenta.items())), "activos": activos}


def escribir(doc, carpeta=None):
    carpeta = Path(carpeta) if carpeta else OFICIAL_DIR
    carpeta.mkdir(parents=True, exist_ok=True)
    txt = json.dumps(doc, ensure_ascii=False, indent=1, sort_keys=True) + "\n"
    (carpeta / f"{doc['fecha']}.json").write_text(txt, encoding="utf-8")
    (carpeta / "ultimo.json").write_text(txt, encoding="utf-8")


def main(argv=None):
    argv = list(sys.argv[1:] if argv is None else argv)
    hasta = _dt(argv[argv.index("--hasta") + 1]) if "--hasta" in argv else datetime.datetime.now(datetime.timezone.utc)
    carpeta = argv[argv.index("--salida") + 1] if "--salida" in argv else None
    precios = json.loads(PRECIOS_ULTIMO.read_text(encoding="utf-8")) if PRECIOS_ULTIMO.exists() else None
    doc = inspeccionar(_universo.cargar_universo(), leer_crudo(hasta), hasta, precios)
    escribir(doc, carpeta)
    if carpeta is None:  # el latido solo se escribe en la ejecucion real
        lat = _latido.calcular(leer_crudo(hasta, horas=_latido.VENTANA_DIAS * 24), hasta, doc["resumen"])
        (HERE / "latido.json").write_text(json.dumps(lat, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"Oficial {doc['fecha']}: {doc['resumen']}")
    for k, r in doc["activos"].items():
        if r["estado_precio"] != "ok":
            print(f"  {r['estado_precio']:9} {k}: {r['motivo']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
