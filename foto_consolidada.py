"""Validador gemelo (Python) de la foto CONSOLIDADA de F4. Mismas reglas que consConsolidadaValidar_ de consolidador.gs.
Lo usara el vault (parte 3) para comprobar la consolidada que deja Google en Drive. Solo libreria estandar. Sin datos personales."""
import re
FORMATO = "foto_cartera/v1"
TOL = 0.011
TIPOS = {"fondo", "plan", "accion", "etf", "cripto", "materia_prima"}
ESTADOS_PRECIO = {"ok", "dudoso", "respaldo", "sin_dato", "manual", "sin_oficial"}
ESTADOS_VEH = {"al_dia", "atrasado", "ausente"}
ORIGENES = {"sheet", "vault_provisional"}
_F = re.compile(r"^\d{4}-\d{2}-\d{2}$")


def _num(x):
    return isinstance(x, (int, float)) and not isinstance(x, bool) and x == x and abs(x) != float("inf")


def _fecha(x):
    return isinstance(x, str) and bool(_F.match(x))


def _fecha_o_nulo(x):
    return x is None or _fecha(x)


def validar_foto(f):
    e = []
    if not isinstance(f, dict):
        return ["la foto no es un objeto"]
    if f.get("formato") != FORMATO: e.append("formato distinto de " + FORMATO)
    if not f.get("sheet"): e.append("falta sheet")
    if not _fecha(f.get("fecha_foto")): e.append("fecha_foto no es AAAA-MM-DD")
    if not _fecha_o_nulo(f.get("fecha_cierre")): e.append("fecha_cierre invalida")
    if not re.match(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$", str(f.get("generado_utc"))): e.append("generado_utc no es ISO con Z")
    h = f.get("huella")
    if not isinstance(h, dict) or not h.get("hash"): e.append("falta huella.hash")
    t = f.get("totales")
    if not isinstance(t, dict):
        e.append("faltan totales"); t = {}
    for k in ("valor_liquido_eur", "valor_no_liquido_eur", "valor_total_eur"):
        if not _num(t.get(k)): e.append("totales.%s debe ser numero" % k)
    pos = f.get("posiciones")
    if not isinstance(pos, list):
        return e + ["posiciones no es lista"]
    ids, sl, sn = set(), 0.0, 0.0
    for i, p in enumerate(pos):
        if not isinstance(p, dict): e.append("posicion %d: no es objeto" % i); continue
        if not p.get("id"): e.append("posicion %d: falta id" % i)
        elif p["id"] in ids: e.append("posicion %d: id repetido" % i)
        else: ids.add(p["id"])
        if p.get("tipo") not in TIPOS: e.append("posicion %d: tipo invalido" % i)
        if p.get("estado_precio") not in ESTADOS_PRECIO: e.append("posicion %d: estado_precio invalido" % i)
        if not isinstance(p.get("no_liquido"), bool): e.append("posicion %d: no_liquido debe ser booleano" % i)
        if _num(p.get("valor_eur")):
            if p.get("no_liquido") is True: sn += p["valor_eur"]
            else: sl += p["valor_eur"]
    if _num(t.get("valor_liquido_eur")) and abs(sl - t["valor_liquido_eur"]) > TOL: e.append("valor_liquido_eur no cuadra con las posiciones")
    if _num(t.get("valor_no_liquido_eur")) and abs(sn - t["valor_no_liquido_eur"]) > TOL: e.append("valor_no_liquido_eur no cuadra con las posiciones")
    return e


def validar_consolidada(c):
    e = validar_foto(c)
    if not isinstance(c, dict): return e
    if c.get("sheet") != "consolidada": e.append("sheet debe ser consolidada")
    if not isinstance(c.get("completa"), bool): e.append("completa debe ser booleano")
    if c.get("intento") not in (1, 2): e.append("intento debe ser 1 o 2")
    vs = c.get("vehiculos")
    if not isinstance(vs, list) or not vs: return e + ["vehiculos no es una lista con elementos"]
    claves, atras, aus, todos, sl, sn, st, spos = {}, [], [], True, 0.0, 0.0, 0.0, 0
    for i, v in enumerate(vs):
        n = "vehiculo %d (%s)" % (i, v.get("clave") if isinstance(v, dict) else "?")
        if not isinstance(v, dict): e.append(n + ": no es objeto"); continue
        if v.get("clave") in claves: e.append(n + ": clave repetida")
        claves[v.get("clave")] = v
        if v.get("estado") not in ESTADOS_VEH: e.append(n + ": estado invalido")
        if v.get("estado") != "al_dia": todos = False
        if v.get("estado") == "atrasado": atras.append(v.get("clave"))
        if v.get("estado") == "ausente":
            aus.append(v.get("clave"))
            if any(v.get(k) is not None for k in ("fecha_foto", "huella", "totales", "fichero")) or v.get("n_posiciones") != 0:
                e.append(n + ": un vehiculo ausente no lleva foto, huella ni totales")
            continue
        if not _fecha(v.get("fecha_foto")): e.append(n + ": fecha_foto invalida")
        if v.get("origen") not in ORIGENES: e.append(n + ": origen invalido")
        if not (isinstance(v.get("huella"), dict) and v["huella"].get("hash")): e.append(n + ": falta huella.hash")
        tt = v.get("totales") or {}
        if all(_num(tt.get(k)) for k in ("valor_liquido_eur", "valor_no_liquido_eur", "valor_total_eur")):
            sl += tt["valor_liquido_eur"]; sn += tt["valor_no_liquido_eur"]; st += tt["valor_total_eur"]
        else: e.append(n + ": totales invalidos")
        if isinstance(v.get("n_posiciones"), int): spos += v["n_posiciones"]
        else: e.append(n + ": n_posiciones invalido")
    if isinstance(c.get("completa"), bool) and c["completa"] != todos: e.append("completa no coincide con el estado de los vehiculos")
    if c.get("atrasados") != atras: e.append("atrasados no coincide con los vehiculos")
    if c.get("ausentes") != aus: e.append("ausentes no coincide con los vehiculos")
    t = c.get("totales") or {}
    for k, s in (("valor_liquido_eur", sl), ("valor_no_liquido_eur", sn), ("valor_total_eur", st)):
        if _num(t.get(k)) and abs(s - t[k]) > TOL: e.append("el total %s no es la suma de los vehiculos" % k)
    pos = c.get("posiciones")
    if isinstance(pos, list):
        if len(pos) != spos: e.append("el n de posiciones (%d) no es la suma de las originales (%d)" % (len(pos), spos))
        por = {}
        for p in pos:
            por[p.get("vehiculo")] = por.get(p.get("vehiculo"), 0) + 1
        for k, v in claves.items():
            if v.get("estado") != "ausente" and por.get(k, 0) != v.get("n_posiciones"):
                e.append("vehiculo %s: posiciones distintas de las de su foto original" % k)
    return e
