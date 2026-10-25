"""Vigilancia de GitHub sobre la cadena de precios (F1.5).

Mira latido.json (GitHub) y latido_google.json (Google) y, si algo lleva mas de 30 h parado, abre UN issue de
GitHub (llega por email). No hace nada mas: no corrige, no escribe en precios/ ni en crudo/.

Uso:  python3 vigilancia.py            (solo muestra)
      python3 vigilancia.py --issue    (abre el issue si hay alertas y no hay ya uno abierto)
"""
import datetime
import json
import subprocess
import sys
from pathlib import Path

import latido as _latido

HERE = Path(__file__).resolve().parent
UMBRAL_HORAS = 30
REPO = "Bga1906/cartera-precios-diarios"
ETIQUETA = "vigilancia"
TITULO = "Vigilancia: la captura de precios lleva demasiado parada"


def evaluar(latido, latido_google, ahora, umbral=UMBRAL_HORAS):
    """Lista de textos de alerta (vacia si todo esta al dia)."""
    alertas = []
    if not latido:
        return ["No existe latido.json: el inspector no ha corrido nunca."]
    h = _latido.horas_desde(latido["generado_en"], ahora)
    if h > umbral:
        alertas.append(f"El inspector de GitHub no se actualiza desde hace {h:.0f} h.")
    for origen in ("github", "google"):
        o = (latido.get("origenes") or {}).get(origen)
        if not o:
            alertas.append(f"El crudo no tiene lecturas recientes del origen «{origen}».")
            continue
        h = _latido.horas_desde(o["ultima_captura_utc"], ahora)
        if h > umbral:
            alertas.append(f"La ultima lectura de «{origen}» en el crudo es de hace {h:.0f} h.")
    foto = (latido_google or {}).get("ultima_foto_utc")
    if not foto:
        alertas.append("Google no ha publicado la hora de su ultima foto nocturna (Apps Script parado o sin instalar).")
    else:
        h = _latido.horas_desde(foto, ahora)
        if h > umbral:
            alertas.append(f"La foto nocturna de Google (Apps Script) es de hace {h:.0f} h.")
    return alertas


def _cargar(nombre):
    p = HERE / nombre
    return json.loads(p.read_text(encoding="utf-8")) if p.exists() else None


def _gh(*args):
    return subprocess.run(["gh", "api", *args], capture_output=True, text=True, check=True).stdout


def abrir_issue(alertas):
    """Abre el issue solo si no hay ya uno abierto con la etiqueta de vigilancia."""
    abiertos = json.loads(_gh(f"repos/{REPO}/issues?state=open&labels={ETIQUETA}&per_page=5"))
    if any(i.get("title") == TITULO and "pull_request" not in i for i in abiertos):
        print("Ya hay un issue de vigilancia abierto; no se abre otro.")
        return False
    cuerpo = ("Detectado por `vigilancia.py`:\n\n" + "\n".join(f"- {a}" for a in alertas)
              + "\n\nNo se corrige nada solo. Cuando este todo al dia, cierra este issue.")
    _gh(f"repos/{REPO}/issues", "-f", f"title={TITULO}", "-f", f"body={cuerpo}", "-f", f"labels[]={ETIQUETA}")
    print("Issue abierto.")
    return True


def main(argv=None):
    argv = list(sys.argv[1:] if argv is None else argv)
    ahora = datetime.datetime.now(datetime.timezone.utc)
    alertas = evaluar(_cargar("latido.json"), _cargar("latido_google.json"), ahora)
    if not alertas:
        print("Vigilancia: todo al dia.")
        return 0
    print("Vigilancia: ALERTAS")
    for a in alertas:
        print(" -", a)
    if "--issue" in argv:
        abrir_issue(alertas)
    return 0


if __name__ == "__main__":
    sys.exit(main())
