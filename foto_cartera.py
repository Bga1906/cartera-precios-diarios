"""Validador de la foto diaria (F3, 25/10/2026). Gemelo de fotoValidar_() de google/foto_cartera.gs.

Una foto es el estado de un Sheet un dia concreto (formato `foto_cartera/v1`, ver DISENO_F3.md). Las fotos viven en el
Drive privado de Brian, NUNCA en este repo publico; este modulo solo las lee y comprueba. Lo usaran el consolidador (F4),
el simulacro de restauracion (F6) y la tarea de vigilancia.

Uso:  python3 foto_cartera.py foto_fondos_2026-10-26.json [otra.json ...]   (sale con codigo 1 si alguna no es valida)
"""
import json
import re
import sys
from pathlib import Path

FOTO_FORMATO = "foto_cartera/v1"
LIBRO_FORMATO = "libro_cartera/v1"
HISTORIAL_FORMATO = "historial_cartera/v1"
TIPOS = ("fondo", "plan", "accion", "etf", "cripto", "materia_prima")
ESTADOS_PRECIO = ("ok", "dudoso", "respaldo", "sin_dato", "manual", "sin_oficial")
FRESCURAS = ("OK", "AMBAR", "ROJO", "SIN FECHA")
FUENTES_PRECIOS = ("precios", "oficial")
TOLERANCIA = 0.011

_FECHA = re.compile(r"^\d{4}-\d{2}-\d{2}$")
_ISO_Z = re.compile(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$")


def _num(x):
    return isinstance(x, (int, float)) and not isinstance(x, bool) and x == x and abs(x) != float("inf")


def _num_o_null(x):
    return x is None or _num(x)


def validar_foto(f):
    """Lista de errores de formato de una foto (vacia = valida)."""
    if not isinstance(f, dict):
        return ["la foto no es un objeto"]
    e = []
    if f.get("formato") != FOTO_FORMATO:
        e.append(f"formato distinto de {FOTO_FORMATO}")
    if not isinstance(f.get("sheet"), str) or not f.get("sheet"):
        e.append("falta sheet")
    if not (isinstance(f.get("fecha_foto"), str) and _FECHA.match(f["fecha_foto"])):
        e.append("fecha_foto no es AAAA-MM-DD")
    # fecha_cierre se anadio el 26/10/2026: las fotos anteriores no la traen (se acepta que falte, no que sea invalida)
    if f.get("fecha_cierre") is not None and not (isinstance(f["fecha_cierre"], str) and _FECHA.match(f["fecha_cierre"])):
        e.append("fecha_cierre debe ser AAAA-MM-DD o null")
    if not (isinstance(f.get("generado_utc"), str) and _ISO_Z.match(f["generado_utc"])):
        e.append("generado_utc no es ISO con Z")
    if not isinstance(f.get("version_script"), str):
        e.append("falta version_script")
    if not isinstance(f.get("version_exportador"), str) or not f.get("version_exportador"):
        e.append("falta version_exportador")
    if f.get("fuente_precios") not in FUENTES_PRECIOS:
        e.append("fuente_precios debe ser precios u oficial")
    cap = f.get("fecha_captura_precios")
    if cap is not None and not (isinstance(cap, str) and _FECHA.match(cap)):
        e.append("fecha_captura_precios invalida")
    h = f.get("huella")
    if not isinstance(h, dict) or not isinstance(h.get("hash"), str) or not h.get("hash"):
        e.append("falta huella.hash")
    t = f.get("totales")
    if not isinstance(t, dict):
        e.append("faltan totales")
        t = {}
    for k in ("valor_liquido_eur", "valor_no_liquido_eur", "valor_total_eur"):
        if not _num(t.get(k)):
            e.append(f"totales.{k} debe ser numero")
    for k in ("aportado_efectivo_eur", "coste_liquido_eur", "resultado_liquido_eur"):
        if k not in t or not _num_o_null(t.get(k)):
            e.append(f"totales.{k} debe ser numero o null")
    if not isinstance(f.get("posiciones"), list):
        e.append("posiciones no es lista")
        return e
    if not isinstance(f.get("avisos"), list):
        e.append("avisos no es lista")
    ids, suma_l, suma_n = set(), 0.0, 0.0
    for i, p in enumerate(f["posiciones"]):
        n = f"posicion {i}" + (f" ({p['id']})" if isinstance(p, dict) and p.get("id") else "")
        if not isinstance(p, dict):
            e.append(f"{n}: no es objeto")
            continue
        if not isinstance(p.get("id"), str) or not p.get("id"):
            e.append(f"{n}: falta id")
        elif p["id"] in ids:
            e.append(f"{n}: id repetido")
        else:
            ids.add(p["id"])
        if not isinstance(p.get("nombre"), str) or not p.get("nombre"):
            e.append(f"{n}: falta nombre")
        if p.get("tipo") not in TIPOS:
            e.append(f"{n}: tipo invalido")
        if not isinstance(p.get("moneda"), str) or not p.get("moneda"):
            e.append(f"{n}: falta moneda")
        for k in ("cantidad", "precio", "precio_eur", "valor_eur", "coste_eur"):
            if k not in p or not _num_o_null(p.get(k)):
                e.append(f"{n}: {k} debe ser numero o null")
        fp = p.get("fecha_precio")
        if fp is not None and not (isinstance(fp, str) and _FECHA.match(fp)):
            e.append(f"{n}: fecha_precio invalida")
        if p.get("estado_precio") not in ESTADOS_PRECIO:
            e.append(f"{n}: estado_precio invalido")
        if p.get("frescura") is not None and p.get("frescura") not in FRESCURAS:
            e.append(f"{n}: frescura invalida")
        if p.get("dias_desfase") is not None and not _num(p.get("dias_desfase")):
            e.append(f"{n}: dias_desfase debe ser numero o null")
        if not isinstance(p.get("estado_coste"), str):
            e.append(f"{n}: falta estado_coste")
        if not isinstance(p.get("no_liquido"), bool):
            e.append(f"{n}: no_liquido debe ser booleano")
        if not isinstance(p.get("avisos"), list):
            e.append(f"{n}: avisos no es lista")
        if p.get("oficial") is not None and not isinstance(p.get("oficial"), dict):
            e.append(f"{n}: oficial debe ser objeto o null")
        if _num(p.get("valor_eur")):
            if p.get("no_liquido") is True:
                suma_n += p["valor_eur"]
            else:
                suma_l += p["valor_eur"]
    if _num(t.get("valor_liquido_eur")) and abs(suma_l - t["valor_liquido_eur"]) > TOLERANCIA:
        e.append("valor_liquido_eur no cuadra con las posiciones")
    if _num(t.get("valor_no_liquido_eur")) and abs(suma_n - t["valor_no_liquido_eur"]) > TOLERANCIA:
        e.append("valor_no_liquido_eur no cuadra con las posiciones")
    if all(_num(t.get(k)) for k in ("valor_liquido_eur", "valor_no_liquido_eur", "valor_total_eur")):
        if abs(t["valor_liquido_eur"] + t["valor_no_liquido_eur"] - t["valor_total_eur"]) > TOLERANCIA:
            e.append("valor_total_eur no es liquido + no liquido")
    return e


def validar_libro(d):
    """Errores minimos del libro exportado (libro_<sheet>.json)."""
    if not isinstance(d, dict):
        return ["el libro no es un objeto"]
    e = []
    if d.get("formato") != LIBRO_FORMATO:
        e.append(f"formato distinto de {LIBRO_FORMATO}")
    for k in ("libro", "compras_nuevas"):
        if not isinstance(d.get(k), dict) or not isinstance(d[k].get("filas"), list):
            e.append(f"{k} debe traer filas")
    if not isinstance(d.get("huella"), dict) or not d["huella"].get("hash"):
        e.append("falta huella.hash")
    return e


def validar_historial(d):
    """Errores minimos del historial exportado (historial_<sheet>.json)."""
    if not isinstance(d, dict):
        return ["el historial no es un objeto"]
    e = []
    if d.get("formato") != HISTORIAL_FORMATO:
        e.append(f"formato distinto de {HISTORIAL_FORMATO}")
    if not isinstance(d.get("series"), list):
        e.append("series no es lista")
        return e
    fechas = [s.get("fecha") for s in d["series"]]
    if any(not (isinstance(x, str) and _FECHA.match(x)) for x in fechas):
        e.append("alguna fecha de la serie no es AAAA-MM-DD")
    elif fechas != sorted(fechas) or len(set(fechas)) != len(fechas):
        e.append("las fechas de la serie deben ir ordenadas y sin repetir")
    return e


def cargar_foto(ruta):
    """Lee y valida una foto; devuelve (foto, errores)."""
    f = json.loads(Path(ruta).read_text(encoding="utf-8"))
    return f, validar_foto(f)


def main(argv):
    if not argv:
        print(__doc__)
        return 2
    malo = False
    for ruta in argv:
        _, errores = cargar_foto(ruta)
        print(f"{ruta}: " + ("OK" if not errores else "NO VALIDA"))
        for x in errores:
            print("  -", x)
        malo = malo or bool(errores)
    return 1 if malo else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
