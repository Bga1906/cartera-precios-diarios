"""Latido (F1.5): cuando llego por ultima vez cada origen y cada fuente, y como van los precios oficiales.

Lo escribe el inspector en latido.json (raiz del repo, publico: solo horas y recuentos, nada personal).
Lo leen la vigilancia de GitHub y, desde fuera, el Apps Script de Google (que avisa por email si GitHub se para).
"""
import datetime

VENTANA_DIAS = 3


def calcular(filas, ahora, resumen_oficial=None):
    """filas: lineas de crudo (diccionarios). ahora: datetime UTC. Devuelve el diccionario del latido."""
    origenes, fuentes = {}, {}
    for f in filas:
        t = f["captura_utc"]
        o = origenes.setdefault(f["origen"], {"ultima_captura_utc": t, "lineas": 0})
        o["ultima_captura_utc"] = max(o["ultima_captura_utc"], t)
        o["lineas"] += 1
        clave = f"{f['origen']}/{f['fuente']}"
        s = fuentes.setdefault(clave, {"ultima_captura_utc": t, "ok": 0, "fallos": 0})
        s["ultima_captura_utc"] = max(s["ultima_captura_utc"], t)
        s["ok" if f.get("estado") == "ok" else "fallos"] += 1
    return {"generado_en": ahora.strftime("%Y-%m-%dT%H:%M:%SZ"), "ventana_dias": VENTANA_DIAS,
            "origenes": dict(sorted(origenes.items())), "fuentes": dict(sorted(fuentes.items())),
            "oficial": resumen_oficial or {}}


def horas_desde(texto_utc, ahora):
    t = datetime.datetime.strptime(texto_utc, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=datetime.timezone.utc)
    return (ahora - t).total_seconds() / 3600
