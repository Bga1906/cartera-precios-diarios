#!/usr/bin/env python3
"""Comparador diario de FUENTES de valor liquidativo (VL) y de indices.

Version en GitHub de la hoja «Fuentes VL – prueba» (captura_fuentes_vl.gs), ampliada:
para cada fondo, el plan de pensiones y los indices oficiales de los fondos, lee TODAS
las fuentes publicas posibles, apunta el precio y la FECHA REAL del dato, y calcula:
  - desfase: dias (naturales y habiles) entre la captura y la fecha del dato;
  - retraso frente a la mejor fuente: dias habiles que va por detras de la mas al dia;
  - diferencias de precio entre fuentes con la misma fecha.

Escribe (solo identificadores publicos y precios publicos; NUNCA cantidades ni datos personales):
  fuentes_vl/capturas/AAAA-MM.csv      una fila por instrumento, fuente y captura (se acumula)
  fuentes_vl/ultimo_comparativa.json   la ultima captura, para que la lea la hoja o el dashboard
  fuentes_vl/RESUMEN.md                resumen legible: ultima captura, ultimos 14 dias y avisos

Cada fuente falla por separado: un fallo se anota en 'estado' y nunca rompe a las demas.

Uso:  python3 fuentes_vl/comparar_fuentes.py            (captura y escribe)
      python3 fuentes_vl/comparar_fuentes.py --sin-red  (solo rehace el resumen con lo ya guardado)
"""
import argparse
import csv
import datetime
import json
import re
import sys
import urllib.parse
import urllib.request
import zoneinfo
from pathlib import Path

HERE = Path(__file__).resolve().parent
RAIZ = HERE.parent
CAPTURAS_DIR = HERE / "capturas"
RESUMEN_PATH = HERE / "RESUMEN.md"
ULTIMO_PATH = HERE / "ultimo_comparativa.json"
CATALOGO_PATH = RAIZ / "benchmarks_catalogo.json"

ZONA = zoneinfo.ZoneInfo("Europe/Madrid")
TIMEOUT = 20
UA = "Mozilla/5.0 (compatible; seguimiento-fondos; +github actions, uso personal)"

# Umbrales de aviso (dias HABILES, lunes a viernes; no descuenta festivos).
UMBRAL_RETRASO_FONDO = 3       # la fuente mas al dia ya va 3+ dias habiles atrasada
UMBRAL_FUENTE_ATRASADA = 2     # una fuente va 2+ dias habiles detras de la mejor
UMBRAL_DIFERENCIA_PRECIO = 0.005  # 0,5 % entre fuentes con la misma fecha
FALLOS_SEGUIDOS_CAIDA = 3      # capturas seguidas sin dato = fuente caida
DIAS_RESUMEN = 14

CABECERA = ["captura", "hora", "tipo", "id", "codigo", "fuente", "precio", "fecha_dato",
            "desfase_naturales", "desfase_habiles", "retraso_vs_mejor", "estado"]

QF_FONDO = "https://www.quefondos.com/es/fondos/ficha/index.html?isin={codigo}"
QF_PLAN = "https://www.quefondos.com/es/planes/ficha/index.html?isin={codigo}"
FT_URL = "https://markets.ft.com/data/funds/tearsheet/summary?s={codigo}:EUR"
YAHOO_URL = "https://query1.finance.yahoo.com/v8/finance/chart/{ticker}?range=10d&interval=1d"

# 25/10/2026 (F1.1): fondos y plan salen de universo.json (un solo sitio, junto con la captura diaria).
sys.path.insert(0, str(RAIZ))
import universo as _universo  # noqa: E402
import crudo as _crudo  # noqa: E402


def construir_fondos_y_planes(universo=None):
    """(FONDOS, PLANES) con el formato de siempre, a partir de los vehiculos 'activo' de universo.json."""
    universo = universo or _universo.cargar_universo()
    fondos, planes = [], []
    for v in _universo.vehiculos(universo):
        if v["tipo"] not in ("fondo", "plan"):
            continue
        y = _universo.fuente(v, "yahoo")
        item = {"id": v["id_comparador"], "codigo": v["isin"] if v["tipo"] == "fondo" else v["codigo"],
                "yahoo": y["ticker"]}
        if v["tipo"] == "plan":
            planes.append(item)
            continue
        if _universo.fuente(v, "quefondos") is None:
            item["sin_quefondos"] = True
        for nombre in ("finanzen", "renta4"):
            fu = _universo.fuente(v, nombre)
            if fu:
                item[nombre] = fu["url"]
        g = _universo.fuente(v, "gestora")
        if g:
            item["gestora"] = (g["parser"], g["url"])
        fondos.append(item)
    return fondos, planes


FONDOS, PLANES = construir_fondos_y_planes()
# Indices oficiales de los fondos (comparables_fondos.yaml v2). El ticker sale del catalogo (un solo sitio).
INDICES = ["msci-world-nr-usd", "msci-acwi-nr-eur", "msci-em-nr-eur", "msci-em-nr-eur-alt",
           "msci-europe-nr-eur", "msci-china-nr-eur", "dj-global-technology"]

MESES_EN = {m: i for i, m in enumerate(
    ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"], 1)}
MESES_ES = {m: i for i, m in enumerate(
    ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"], 1)}


# ---------------------------------------------------------------- red
def pedir(url):
    """Devuelve (texto, error). Nunca lanza."""
    try:
        req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "es-ES,es;q=0.9,en;q=0.8"})
        with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
            if r.status != 200:
                return None, f"HTTP {r.status}"
            return r.read().decode(r.headers.get_content_charset() or "utf-8", "replace"), None
    except Exception as e:  # noqa: BLE001
        codigo = getattr(e, "code", None)
        return None, f"HTTP {codigo}" if codigo else f"{type(e).__name__}: {e}"


def _r(precio=None, fecha=None, estado="OK"):
    return {"precio": precio, "fecha": fecha, "estado": estado}


def texto_plano(html):
    t = re.sub(r"<(script|style)[\s\S]*?</\1>", " ", html, flags=re.I)
    t = re.sub(r"<[^>]+>", " ", t)
    t = t.replace("&nbsp;", " ").replace("&#8364;", "€").replace("&euro;", "€")
    return re.sub(r"\s+", " ", t)


def num_es(s):
    """'1.234,567' o '28,54' -> float."""
    return float(s.replace(".", "").replace(",", "."))


def fecha_iso(y, m, d):
    try:
        return datetime.date(int(y), int(m), int(d)).isoformat()
    except ValueError:
        return None


# ---------------------------------------------------------------- lectores (parsers)
def parse_yahoo(texto):
    """Ultimo cierre no nulo y su fecha (zona del mercado)."""
    try:
        res = json.loads(texto)["chart"]["result"][0]
    except Exception:  # noqa: BLE001
        return _r(estado="respuesta no reconocida")
    marcas = res.get("timestamp") or []
    cierres = (((res.get("indicators") or {}).get("quote") or [{}])[0]).get("close") or []
    zona_txt = (res.get("meta") or {}).get("exchangeTimezoneName") or "UTC"
    try:
        zona = zoneinfo.ZoneInfo(zona_txt)
    except Exception:  # noqa: BLE001
        zona = datetime.timezone.utc
    for t, c in reversed(list(zip(marcas, cierres))):
        if c is not None:
            return _r(float(c), datetime.datetime.fromtimestamp(t, zona).date().isoformat())
    meta = res.get("meta") or {}
    if meta.get("regularMarketPrice") and meta.get("regularMarketTime"):
        return _r(float(meta["regularMarketPrice"]),
                  datetime.datetime.fromtimestamp(meta["regularMarketTime"], zona).date().isoformat())
    return _r(estado="sin datos")


def parse_ft(html):
    t = texto_plano(html)
    p = re.search(r"Price \((?:EUR|GBP|USD)\)\s*([\d.,]+)", t)
    d = re.search(r"as of ([A-Za-z]{3})[a-z]* (\d{1,2}) (\d{4})", t)
    if not p or not d:
        return _r(estado="formato no reconocido")
    f = fecha_iso(d.group(3), MESES_EN.get(d.group(1).lower(), 0), d.group(2))
    return _r(float(p.group(1).replace(",", "")), f, "OK (2 decimales)")


def parse_quefondos(html):
    t = texto_plano(html)
    p = re.search(r"Valor liquidativo:?\s*([\d.]+,\d+)", t, re.I)
    d = re.search(r"Fecha:?\s*(\d{2})/(\d{2})/(\d{4})", t[p.start():] if p else t)
    if not p or not d:
        return _r(estado="formato no reconocido")
    return _r(num_es(p.group(1)), fecha_iso(d.group(3), d.group(2), d.group(1)))


def parse_finanzen(html):
    t = texto_plano(html)
    m = re.search(r"([\d.]+,\d{2,4})\s*EUR[^0-9]{0,80}(\d{2})\.(\d{2})\.(\d{4})", t)
    if not m:
        return _r(estado="formato no reconocido")
    return _r(num_es(m.group(1)), fecha_iso(m.group(4), m.group(3), m.group(2)))


def parse_renta4(html):
    """Ficha de r4.com: '28,54 € ... 12 oct 2026'."""
    t = texto_plano(html)
    m = re.search(r"([\d.]+,\d{2,6})\s*€.{0,80}?(\d{1,2}) (ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)[a-z.]* (\d{4})", t, re.I)
    if not m:
        return _r(estado="formato no reconocido")
    return _r(num_es(m.group(1)), fecha_iso(m.group(4), MESES_ES[m.group(3).lower()], m.group(2)), "OK (gestora)")


COBAS_CLASE = "D"  # la clase que tiene Brian (posicion «Cobas Seleccion FI Clase D»)


def parse_cobas(html, clase=COBAS_CLASE):
    """Web de Cobas: da la fecha ('Fecha valor liquidativo: 27-10-2026') y un bloque por clase.

    En la pagina el numero va ANTES de la etiqueta: 'Clase D 299,428243 € Valor liquidativo 0,60% Rentabilidad diaria'.
    Hasta el 28/10/2026 se cogia el primer numero DESPUES de 'Valor liquidativo', que es la rentabilidad del dia
    (0,35 / 0,14 / 0,60) y dejaba el fondo «dudoso» a diario. Ahora se coge el VL de la clase indicada; si no aparece,
    solo la fecha (nunca un numero de otra clase)."""
    t = texto_plano(html)
    d = re.search(r"Fecha (?:del )?valor liquidativo:?\s*(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})", t, re.I)
    if not d:
        return _r(estado="formato no reconocido")
    f = fecha_iso(d.group(3), d.group(2), d.group(1))
    p = re.search(r"Clase " + re.escape(clase) + r"\s+([\d.]+,\d+)\s*€\s*Valor liquidativo(?!\s*:)", t, re.I)
    return _r(num_es(p.group(1)) if p else None, f, "OK (gestora)" if p else "OK (gestora, solo fecha)")


def parse_generica(html):
    """Gestora sin formato conocido: busca 'valor liquidativo' con un numero y una fecha cerca."""
    t = texto_plano(html)
    for m in re.finditer(r"valor liquidativo", t, re.I):
        trozo = t[m.start(): m.start() + 250]
        p = re.search(r"(\d{1,6},\d{2,6})", trozo)
        d = re.search(r"(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})", trozo)
        if d:
            return _r(num_es(p.group(1)) if p else None, fecha_iso(d.group(3), d.group(2), d.group(1)),
                      "OK (gestora, experimental)" if p else "OK (gestora, solo fecha)")
    return _r(estado="formato no reconocido")


PARSERS_GESTORA = {"renta4": parse_renta4, "cobas": parse_cobas, "generica": parse_generica}


def leer(url, parser):
    texto, err = pedir(url)
    if err:
        return _r(estado=err)
    try:
        return parser(texto)
    except Exception as e:  # noqa: BLE001  (un lector roto nunca rompe a los demas)
        return _r(estado=f"ERROR {type(e).__name__}: {e}")


# ---------------------------------------------------------------- que se lee
def cargar_tickers_catalogo(path=CATALOGO_PATH):
    try:
        datos = json.loads(Path(path).read_text(encoding="utf-8"))
        return {b["id"]: b["ticker"] for b in datos.get("benchmarks", []) if b.get("id") and b.get("ticker")}
    except Exception:  # noqa: BLE001
        return {}


def tareas(catalogo=None):
    """Lista de (tipo, id, codigo, fuente, url, parser)."""
    yurl = lambda tk: YAHOO_URL.format(ticker=urllib.parse.quote(tk, safe=""))  # noqa: E731
    out = []
    for f in FONDOS:
        out.append(("fondo", f["id"], f["codigo"], "Yahoo", yurl(f["yahoo"]), parse_yahoo))
        out.append(("fondo", f["id"], f["codigo"], "FT", FT_URL.format(codigo=f["codigo"]), parse_ft))
        if not f.get("sin_quefondos"):
            out.append(("fondo", f["id"], f["codigo"], "quefondos", QF_FONDO.format(codigo=f["codigo"]), parse_quefondos))
        if f.get("finanzen"):
            out.append(("fondo", f["id"], f["codigo"], "finanzen.at", f["finanzen"], parse_finanzen))
        if f.get("renta4"):
            out.append(("fondo", f["id"], f["codigo"], "Renta 4", f["renta4"], parse_renta4))
        if f.get("gestora"):
            tipo, url = f["gestora"]
            out.append(("fondo", f["id"], f["codigo"], "gestora", url, PARSERS_GESTORA[tipo]))
    for p in PLANES:
        out.append(("plan", p["id"], p["codigo"], "Yahoo", yurl(p["yahoo"]), parse_yahoo))
        out.append(("plan", p["id"], p["codigo"], "quefondos", QF_PLAN.format(codigo=p["codigo"]), parse_quefondos))
    cat = catalogo if catalogo is not None else cargar_tickers_catalogo()
    for i in INDICES:
        if i in cat:
            out.append(("indice", i, cat[i], "Yahoo", yurl(cat[i]), parse_yahoo))
    return out


# ---------------------------------------------------------------- calculos
def dias_habiles(desde_iso, hasta_iso):
    """Dias laborables (lun-vie) desde la fecha del dato hasta la captura, sin contar el del dato."""
    d1, d2 = datetime.date.fromisoformat(desde_iso), datetime.date.fromisoformat(hasta_iso)
    if d1 >= d2:
        return 0
    n, d = 0, d1
    while d < d2:
        d += datetime.timedelta(days=1)
        if d.weekday() < 5:
            n += 1
    return n


def capturar(ahora=None, lector=leer, catalogo=None):
    ahora = ahora or datetime.datetime.now(ZONA)
    dia, hora = ahora.date().isoformat(), ahora.strftime("%H:%M")
    filas = []
    for tipo, id_, codigo, fuente, url, parser in tareas(catalogo):
        r = lector(url, parser)
        fila = {"captura": dia, "hora": hora, "tipo": tipo, "id": id_, "codigo": codigo, "fuente": fuente,
                "precio": r["precio"], "fecha_dato": r["fecha"], "desfase_naturales": None,
                "desfase_habiles": None, "retraso_vs_mejor": None, "estado": r["estado"]}
        if r["fecha"]:
            fila["desfase_naturales"] = (ahora.date() - datetime.date.fromisoformat(r["fecha"])).days
            fila["desfase_habiles"] = dias_habiles(r["fecha"], dia)
        filas.append(fila)
    # retraso de cada fuente frente a la mas al dia del mismo instrumento
    mejor = {}
    for f in filas:
        if f["fecha_dato"]:
            mejor[f["id"]] = max(mejor.get(f["id"], f["fecha_dato"]), f["fecha_dato"])
    for f in filas:
        if f["fecha_dato"]:
            f["retraso_vs_mejor"] = dias_habiles(f["fecha_dato"], mejor[f["id"]])
    return filas


def diferencias_precio(filas):
    """Pares de fuentes con la misma fecha y precio distinto en mas del umbral."""
    avisos = []
    grupos = {}
    for f in filas:
        if f["precio"] and f["fecha_dato"]:
            grupos.setdefault((f["id"], f["fecha_dato"]), []).append(f)
    for (id_, fecha), g in sorted(grupos.items()):
        for i in range(len(g)):
            for j in range(i + 1, len(g)):
                a, b = g[i], g[j]
                dif = abs(a["precio"] - b["precio"]) / max(a["precio"], b["precio"])
                if dif > UMBRAL_DIFERENCIA_PRECIO:
                    avisos.append(f"{id_} ({fecha}): {a['fuente']} {a['precio']:g} frente a {b['fuente']} "
                                  f"{b['precio']:g} ({dif:.2%})")
    return avisos


# ---------------------------------------------------------------- guardar
def _fmt(v):
    if v is None:
        return ""
    if isinstance(v, float):
        return repr(v)
    return str(v)


def guardar_csv(filas, dir_=CAPTURAS_DIR):
    if not filas:
        return None
    dir_.mkdir(parents=True, exist_ok=True)
    path = dir_ / f"{filas[0]['captura'][:7]}.csv"
    nuevo = not path.exists()
    with path.open("a", newline="", encoding="utf-8") as fh:
        w = csv.writer(fh)
        if nuevo:
            w.writerow(CABECERA)
        for f in filas:
            w.writerow([_fmt(f[c]) for c in CABECERA])
    return path


def leer_historial(dias=DIAS_RESUMEN, hoy=None, dir_=CAPTURAS_DIR):
    hoy = hoy or datetime.datetime.now(ZONA).date()
    desde = (hoy - datetime.timedelta(days=dias)).isoformat()
    filas = []
    for path in sorted(dir_.glob("*.csv")):
        with path.open(encoding="utf-8") as fh:
            for r in csv.DictReader(fh):
                if r["captura"] >= desde:
                    filas.append(r)
    return filas


def _int(v):
    try:
        return int(v)
    except (TypeError, ValueError):
        return None


def construir_resumen(ultima, historial):
    lineas = ["# Comparativa de fuentes de VL e índices", "",
              "Generado automáticamente por `fuentes_vl/comparar_fuentes.py` (GitHub Actions, 09:15 y 22:40 aprox.).",
              "Desfase = días hábiles (lunes a viernes) entre la captura y la fecha real del dato. "
              "Retraso = días hábiles que una fuente va por detrás de la más al día para ese mismo fondo o índice.", ""]
    if ultima:
        lineas += [f"## Última captura: {ultima[0]['captura']} {ultima[0]['hora']}", "",
                   "| Tipo | Instrumento | Fuente | Precio | Fecha del dato | Desfase (háb.) | Retraso vs mejor | Estado |",
                   "|---|---|---|---|---|---|---|---|"]
        for f in ultima:
            precio = "" if f["precio"] is None else f"{f['precio']:g}"
            lineas.append(f"| {f['tipo']} | {f['id']} | {f['fuente']} | {precio} | {f['fecha_dato'] or '—'} | "
                          f"{'' if f['desfase_habiles'] is None else f['desfase_habiles']} | "
                          f"{'' if f['retraso_vs_mejor'] is None else f['retraso_vs_mejor']} | {f['estado']} |")
        lineas.append("")

    avisos = []
    if ultima:
        por_id = {}
        for f in ultima:
            por_id.setdefault(f["id"], []).append(f)
        for id_, g in por_id.items():
            con_dato = [f for f in g if f["fecha_dato"]]
            if not con_dato:
                avisos.append(f"**{id_}**: ninguna fuente ha dado dato en esta captura.")
                continue
            mejor = min(f["desfase_habiles"] for f in con_dato)
            if mejor >= UMBRAL_RETRASO_FONDO:
                avisos.append(f"**{id_}**: incluso la fuente más al día va {mejor} días hábiles atrasada.")
            for f in con_dato:
                if f["retraso_vs_mejor"] >= UMBRAL_FUENTE_ATRASADA:
                    avisos.append(f"{id_}: {f['fuente']} va {f['retraso_vs_mejor']} días hábiles por detrás de la mejor fuente.")
        avisos += ["Diferencia de precio: " + a for a in diferencias_precio(ultima)]
    # fuentes caidas: N capturas seguidas sin dato
    # Solo cuentan las fuentes que siguen en la ultima captura: una fuente retirada deja de avisar enseguida
    # (antes seguia avisando hasta 14 dias por el historial).
    vigentes = {(f["id"], f["fuente"]) for f in ultima} if ultima else None
    seguidas = {}
    for r in historial:
        clave = (r["id"], r["fuente"])
        if vigentes is not None and clave not in vigentes:
            continue
        seguidas[clave] = 0 if r["fecha_dato"] else seguidas.get(clave, 0) + 1
    for (id_, fuente), n in sorted(seguidas.items()):
        if n >= FALLOS_SEGUIDOS_CAIDA:
            avisos.append(f"{id_}: {fuente} lleva {n} capturas seguidas sin dato (fuente caída o formato cambiado).")
    lineas += ["## Avisos", ""] + ([f"- {a}" for a in avisos] or ["- Sin avisos."]) + [""]

    if historial:
        stats = {}
        for r in historial:
            s = stats.setdefault((r["tipo"], r["fuente"]), {"n": 0, "ok": 0, "desfases": [], "retrasos": [], "mejor": 0})
            s["n"] += 1
            if r["fecha_dato"]:
                s["ok"] += 1
                d, rt = _int(r["desfase_habiles"]), _int(r["retraso_vs_mejor"])
                if d is not None:
                    s["desfases"].append(d)
                if rt is not None:
                    s["retrasos"].append(rt)
                    s["mejor"] += rt == 0
        lineas += [f"## Últimos {DIAS_RESUMEN} días, por fuente", "",
                   "| Tipo | Fuente | Capturas | Con dato | Desfase medio (háb.) | Retraso medio vs mejor | Veces la más al día |",
                   "|---|---|---|---|---|---|---|"]
        for (tipo, fuente), s in sorted(stats.items()):
            media = lambda xs: f"{sum(xs) / len(xs):.1f}" if xs else "—"  # noqa: E731
            lineas.append(f"| {tipo} | {fuente} | {s['n']} | {s['ok'] / s['n']:.0%} | {media(s['desfases'])} | "
                          f"{media(s['retrasos'])} | {s['mejor']} |")
        lineas.append("")
    return "\n".join(lineas)


def escribir_salidas(filas, hoy=None):
    guardar_csv(filas)
    ULTIMO_PATH.write_text(json.dumps({"filas": filas}, ensure_ascii=False, indent=1), encoding="utf-8")
    RESUMEN_PATH.write_text(construir_resumen(filas, leer_historial(hoy=hoy)), encoding="utf-8")


def main(argv=None):
    ap = argparse.ArgumentParser()
    ap.add_argument("--sin-red", action="store_true", help="solo rehace el resumen con lo ya guardado")
    a = ap.parse_args(argv)
    if a.sin_red:
        ultima = json.loads(ULTIMO_PATH.read_text(encoding="utf-8"))["filas"] if ULTIMO_PATH.exists() else []
        RESUMEN_PATH.write_text(construir_resumen(ultima, leer_historial()), encoding="utf-8")
        return 0
    filas = capturar()
    escribir_salidas(filas)
    try:  # 25/10/2026 (F1.2): ademas del CSV de siempre, cada lectura va al crudo. Si falla, solo avisa.
        n = _crudo.anadir_filas(_crudo.filas_de_comparador(filas, _universo.cargar_universo()))
        print(f"Crudo: {n} lecturas anotadas en crudo/.")
    except Exception as e:  # noqa: BLE001
        print(f"AVISO crudo: no se pudo anotar ({type(e).__name__}: {e}); la comparativa no se ve afectada.", file=sys.stderr)
    ok = sum(1 for f in filas if f["fecha_dato"])
    print(f"Capturadas {len(filas)} lecturas ({ok} con dato).")
    for f in filas:
        print(f"  {f['id']:<34} {f['fuente']:<12} {str(f['fecha_dato'] or '-'):<10} "
              f"desfase {f['desfase_habiles'] if f['desfase_habiles'] is not None else '-':>2}  {f['estado']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
