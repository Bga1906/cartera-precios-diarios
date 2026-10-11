#!/usr/bin/env python3
"""Captura diaria de cotizaciones publicas (GitHub Actions) - repo aparte
y separado del vault privado "segundo-cerebro". Objetivo: que el historico
de variacion diaria del dashboard no quede vacio los dias que Brian no
enciende su PC (viajes, etc.) - ver scripts/cartera/abrir_dashboard.py y
scripts/cartera/build_dashboard.py::_construir_historico_precios_vivos()
en el vault privado, que descargan y fusionan lo que este script publica.

Que contiene este repo (y que NO): SOLO tickers/ISINs (identificadores de
mercado, informacion publica) y las cotizaciones que devuelven esas
fuentes publicas. NUNCA cantidades, valores en euros, patrimonio ni ningun
dato personal.

Uso:
    python3 fetch_precios_publico.py                # escribe precios/AAAA-MM-DD.json
    python3 fetch_precios_publico.py --pretty        # con sangria
"""
import argparse
import datetime
import json
import urllib.parse
import urllib.request
import zoneinfo
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT_DIR = HERE / "precios"

TIMEOUT_SEGUNDOS = 10
USER_AGENT = "cartera-precios-diarios/1.0 (+github actions, uso personal)"

YAHOO_CHART_URL = "https://query1.finance.yahoo.com/v8/finance/chart/{ticker}"
GOLD_API_URL = "https://api.gold-api.com/price/XAU"
FX_API_URL = "https://api.frankfurter.app/latest?from=EUR&to=USD"
FX_CAD_API_URL = "https://api.frankfurter.app/latest?from=EUR&to=CAD"
FX_RESPALDO_URL = "https://open.er-api.com/v6/latest/EUR"
COINGECKO_BTC_URL = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur"
GRAMOS_POR_ONZA_TROY = 31.1034768

# Pureza del oro físico de Brian (joyería, 18 quilates) — MISMO valor que
# ORO_PUREZA en segundo-cerebro/scripts/cartera/build_daily_snapshot.py
# (repo separado, no importable desde aquí: mismo criterio, comentario
# cruzado en ambos sitios para no desincronizar). Bug real detectado el
# 21-22/09/2026: este script guardaba aquí el precio del oro PURO (24k)
# bajo el asset_id "oro-fisico:joyeria", que en el pipeline local SIEMPRE
# lleva ya descontada la pureza de la joya real. Cuando ese dato se usaba
# para rellenar un día sin snapshot local, quedaba en una unidad distinta
# (24k) a la de los demás días (18k), y la "variación diaria" del oro
# salía disparada (-25,78% falso el 21/09). Se corrige aquí, en origen.
ORO_PUREZA = 0.750  # 18 quilates

MEXEM_TICKERS = [
    ("AMZN", "AMZN"), ("APR0", "AMP.MC"), ("CRML", "CRML"), ("DMX", "DMX.V"),
    ("E5S1", "E5S1.F"), ("ERO", "ERO"), ("GOOGL", "GOOGL"), ("HUMA", "HUMA"),
    ("IDR", "IDR.MC"), ("KRKNF", "KRKNF"), ("META", "META"), ("MP", "MP"),
    ("NXT", "NXT.MC"), ("OHLA", "OHLA.MC"), ("PLTR", "PLTR"), ("RIG", "RIG"),
    ("TRE", "TRE.MC"),
]

TR_ETFS = [
    ("Physical Gold USD (Acc)", "PPFB.DE"),
    ("Copper Miners USD (Acc)", "4COP.DE"),
    ("Physical Silver", "ISLN.L"),
    ("Uranium And Nuclear Technologies USD (Acc)", "NUKL.DE"),
    ("Space Innovators USD (Acc)", "JEDI.DE"),
]
FONDOS_ISIN = [
    ("IE000ZYRH0Q7", "0P0001XF40.F"),
    ("IE000QAZP7L2", "0P0001XF3Z.F"),
    ("ES0146309002", "0P0001DFE8.F"),
    ("ES0165243025", "0P0001T8V7.F"),
    ("ES0173311103", "0P000168OI.F"),
    ("IE00BM95B621", "0P0001LT4H.F"),
    ("LU0625737910", "LU0625737910.LU"),
    ("ES0124037013", "0P0001LFVR.F"),
]
PLAN_PENSIONES_TICKER_YAHOO = "0P0001LIG7.F"
BTC_TICKER_YAHOO = "BTC-EUR"

# Añadido 14/09/2026, a petición de Brian ("el sistema de actualización
# diaria vía github y mi pc, ¿incluye los índices en benchmark?"): este
# repo público NO los llevaba (solo activos propios de Brian), así que
# los días sin PC encendido el histórico de benchmarks se quedaba sin
# ese día. Misma lista que scripts/cartera/posiciones.yaml (sección
# `benchmarks:`) en el vault privado, y mismo criterio que
# build_daily_snapshot.py::_activos_benchmarks() (09/09/2026, esa sí
# corre en el PC local): no son posiciones de Brian, así que se guarda
# el precio en su moneda nativa, sin convertir a EUR — es un nivel de
# índice, no un importe.
BENCHMARKS = [
    ("msci-world", "^990100-USD-STRD"),
    ("nasdaq-100", "^NDX"),
    ("ibex-35", "^IBEX"),
    ("acwi", "ACWI"),
    ("sp500", "^GSPC"),
]


def _get_json(url: str):
    try:
        req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
        with urllib.request.urlopen(req, timeout=TIMEOUT_SEGUNDOS) as resp:
            if resp.status != 200:
                return None, f"HTTP {resp.status}"
            payload = json.loads(resp.read().decode("utf-8"))
        return payload, None
    except Exception as e:  # noqa: BLE001
        return None, f"{type(e).__name__}: {e}"


# Monedas de benchmarks cuyo "currency" Yahoo devuelve vacio. Tabla minima y
# conservadora: solo lo comprobado; si un ticker no esta aqui, la moneda se
# deja en null (nunca se inventa).
MONEDA_CONOCIDA = {
    "^990100-USD-STRD": "USD",
}

SEGUNDOS_SEMANA = 7 * 24 * 3600


def _resultado_yahoo(precio=None, moneda=None, cierre_anterior=None, error=None,
                     as_of=None, moneda_inferida=None, puntos_ultima_semana=0):
    return {
        "precio": precio, "moneda": moneda, "cierre_anterior": cierre_anterior, "error": error,
        "as_of": as_of, "moneda_inferida": moneda_inferida,
        "puntos_ultima_semana": puntos_ultima_semana,
    }


def _positivo_o_none(valor):
    try:
        valor = float(valor)
    except (TypeError, ValueError):
        return None
    return valor if valor > 0 else None


def fecha_de_mercado(segundos, zona=None):
    """Convierte regularMarketTime (segundos desde 1970, UTC) a 'AAAA-MM-DD' en
    la zona horaria del mercado (exchangeTimezoneName); UTC si falta o no vale."""
    if isinstance(segundos, bool) or not isinstance(segundos, (int, float)):
        return None
    tz = datetime.timezone.utc
    if zona:
        try:
            tz = zoneinfo.ZoneInfo(zona)
        except Exception:  # noqa: BLE001  (zona desconocida o sin base de zonas)
            tz = datetime.timezone.utc
    try:
        return datetime.datetime.fromtimestamp(segundos, tz).date().isoformat()
    except (OverflowError, OSError, ValueError):
        return None


def _puntos_ultima_semana(result, referencia):
    """Cuantas velas diarias con cierre hay en los 7 dias previos a `referencia`."""
    try:
        marcas = result.get("timestamp") or []
        cierres = (((result.get("indicators") or {}).get("quote") or [{}])[0]).get("close") or []
        if not isinstance(referencia, (int, float)):
            return 0
        return sum(
            1 for t, c in zip(marcas, cierres)
            if c is not None and isinstance(t, (int, float)) and referencia - SEGUNDOS_SEMANA <= t <= referencia
        )
    except Exception:  # noqa: BLE001
        return 0


def obtener_cotizacion_yahoo(ticker: str, rango: str = None):
    url = YAHOO_CHART_URL.format(ticker=urllib.parse.quote(ticker, safe=""))
    if rango:
        url += f"?range={rango}&interval=1d"
    payload, err = _get_json(url)
    if err:
        return _resultado_yahoo(error=err)
    try:
        chart = payload.get("chart") or {}
        if chart.get("error"):
            return _resultado_yahoo(error=f"Yahoo devolvio error: {chart['error']!r}")
        result = (chart.get("result") or [None])[0]
        if result is None:
            return _resultado_yahoo(error=f"sin 'result' para {ticker!r}")
        meta = result.get("meta") or {}
        precio = meta.get("regularMarketPrice")
        moneda = meta.get("currency") or None
        moneda_inferida = None
        if moneda is None and ticker in MONEDA_CONOCIDA:
            moneda, moneda_inferida = MONEDA_CONOCIDA[ticker], True
        elif moneda is None:
            moneda_inferida = False
        as_of = fecha_de_mercado(meta.get("regularMarketTime"), meta.get("exchangeTimezoneName"))
        puntos = _puntos_ultima_semana(result, meta.get("regularMarketTime"))
        if precio is None:
            return _resultado_yahoo(moneda=moneda, error="sin 'regularMarketPrice'", as_of=as_of,
                                    moneda_inferida=moneda_inferida)
        precio = float(precio)
        if precio <= 0:
            return _resultado_yahoo(moneda=moneda, error=f"precio no positivo: {precio!r}", as_of=as_of,
                                    moneda_inferida=moneda_inferida)
        # previousClose y, si falta, chartPreviousClose; si tampoco, null (no se calcula a mano).
        cierre_anterior = _positivo_o_none(meta.get("previousClose"))
        if cierre_anterior is None:
            cierre_anterior = _positivo_o_none(meta.get("chartPreviousClose"))
        return _resultado_yahoo(precio=precio, moneda=moneda, cierre_anterior=cierre_anterior, as_of=as_of,
                                moneda_inferida=moneda_inferida, puntos_ultima_semana=puntos)
    except Exception as e:  # noqa: BLE001
        return _resultado_yahoo(error=f"respuesta inesperada: {type(e).__name__}: {e}")


def campos_fecha_mercado(res, fecha_fichero):
    """Campos OPCIONALES que se anaden a cada activo de Yahoo (los lectores antiguos
    los ignoran): as_of, as_of_fuente y, si el dato es de un dia anterior al del
    fichero, arrastrado + dias_desfase. Informativo: no cambia 'ok'."""
    as_of = res.get("as_of")
    extra = {"as_of": as_of, "as_of_fuente": "regularMarketTime"}
    if as_of is not None and fecha_fichero is not None:
        try:
            dias = (datetime.date.fromisoformat(fecha_fichero) - datetime.date.fromisoformat(as_of)).days
        except ValueError:
            dias = 0
        if dias > 0:
            extra["arrastrado"] = True
            extra["dias_desfase"] = dias
    if res.get("moneda_inferida") is not None:
        extra["moneda_inferida"] = res["moneda_inferida"]
    return extra


def _tasa_respaldo_open_er_api(moneda: str):
    payload, err = _get_json(FX_RESPALDO_URL)
    if err:
        return None, err
    try:
        tasa = float(payload["rates"][moneda])
        return (tasa, None) if tasa > 0 else (None, f"tasa no positiva: {tasa!r}")
    except (KeyError, TypeError, ValueError) as e:
        return None, f"respuesta inesperada: {e}"


def obtener_tasa_fx(moneda: str, url: str):
    payload, err = _get_json(url)
    if not err:
        try:
            tasa = float(payload["rates"][moneda])
            if tasa > 0:
                return tasa, None
            err = f"tasa no positiva: {tasa!r}"
        except (KeyError, TypeError, ValueError) as e:
            err = f"respuesta inesperada: {e}"
    tasa_resp, err_resp = _tasa_respaldo_open_er_api(moneda)
    if tasa_resp is not None:
        return tasa_resp, f"primario fallo ({err}), usado respaldo open.er-api.com"
    return None, f"primario: {err} | respaldo: {err_resp}"


def construir_activos(fecha=None):
    activos = {}
    fecha = fecha or datetime.date.today().isoformat()

    payload, err_oro = _get_json(GOLD_API_URL)
    precio_oz_usd = None
    if not err_oro:
        try:
            precio_oz_usd = float(payload["price"])
        except (KeyError, TypeError, ValueError):
            err_oro = "respuesta inesperada de gold-api.com"

    tasa_eur_usd, err_usd = obtener_tasa_fx("USD", FX_API_URL)
    tasa_eur_cad, err_cad = obtener_tasa_fx("CAD", FX_CAD_API_URL)

    precio_g_eur_24k = None
    precio_g_eur_18k = None
    if precio_oz_usd is not None and tasa_eur_usd is not None:
        precio_g_eur_24k = (precio_oz_usd / GRAMOS_POR_ONZA_TROY) / tasa_eur_usd
        precio_g_eur_18k = precio_g_eur_24k * ORO_PUREZA
    activos["oro-fisico:joyeria"] = {
        "price": precio_g_eur_18k, "price_previous_close": None, "moneda": "EUR",
        "fuente": "gold-api.com (XAU/USD) + frankfurter.app (EUR/USD), ya con pureza 18k aplicada",
        "ok": precio_g_eur_18k is not None,
        "error": err_oro or err_usd,
    }

    res_btc = obtener_cotizacion_yahoo(BTC_TICKER_YAHOO)
    if res_btc["precio"] is not None and (res_btc["moneda"] or "EUR") == "EUR":
        activos["bitcoin:btc"] = {
            "price": res_btc["precio"], "price_previous_close": res_btc["cierre_anterior"],
            "moneda": "EUR", "fuente": f"Yahoo Finance ({BTC_TICKER_YAHOO})",
            "ok": True, "error": None, **campos_fecha_mercado(res_btc, fecha),
        }
    else:
        payload_cg, err_cg = _get_json(COINGECKO_BTC_URL)
        precio_cg = None
        if not err_cg:
            try:
                precio_cg = float(payload_cg["bitcoin"]["eur"])
            except (KeyError, TypeError, ValueError):
                err_cg = "respuesta inesperada de CoinGecko"
        activos["bitcoin:btc"] = {
            "price": precio_cg, "price_previous_close": None, "moneda": "EUR",
            "fuente": "CoinGecko (bitcoin/eur, respaldo)" if precio_cg is not None else f"Yahoo Finance ({BTC_TICKER_YAHOO})",
            "ok": precio_cg is not None,
            "error": res_btc["error"] if precio_cg is not None else f"Yahoo: {res_btc['error']} | CoinGecko: {err_cg}",
        }

    for ticker_mexem, ticker_yahoo in MEXEM_TICKERS:
        res = obtener_cotizacion_yahoo(ticker_yahoo)
        precio_eur = res["precio"]
        precio_prev_eur = res["cierre_anterior"]
        if res["moneda"] == "USD" and tasa_eur_usd:
            if precio_eur is not None:
                precio_eur = precio_eur / tasa_eur_usd
            if precio_prev_eur is not None:
                precio_prev_eur = precio_prev_eur / tasa_eur_usd
        elif res["moneda"] == "CAD" and tasa_eur_cad:
            if precio_eur is not None:
                precio_eur = precio_eur / tasa_eur_cad
            if precio_prev_eur is not None:
                precio_prev_eur = precio_prev_eur / tasa_eur_cad
        activos[f"mexem:{ticker_mexem}"] = {
            "price": precio_eur, "price_previous_close": precio_prev_eur, "moneda": "EUR",
            "fuente": f"Yahoo Finance ({ticker_yahoo})", "ok": res["precio"] is not None, "error": res["error"],
            **campos_fecha_mercado(res, fecha),
        }

    for nombre, ticker_yahoo in TR_ETFS:
        res = obtener_cotizacion_yahoo(ticker_yahoo)
        precio_eur = res["precio"]
        precio_prev_eur = res["cierre_anterior"]
        if res["moneda"] == "USD" and tasa_eur_usd:
            if precio_eur is not None:
                precio_eur = precio_eur / tasa_eur_usd
            if precio_prev_eur is not None:
                precio_prev_eur = precio_prev_eur / tasa_eur_usd
        activos[f"trade-republic:{nombre}"] = {
            "price": precio_eur, "price_previous_close": precio_prev_eur, "moneda": "EUR",
            "fuente": f"Yahoo Finance ({ticker_yahoo})", "ok": res["precio"] is not None, "error": res["error"],
            **campos_fecha_mercado(res, fecha),
        }

    for isin, ticker_yahoo in FONDOS_ISIN:
        res = obtener_cotizacion_yahoo(ticker_yahoo)
        activos[f"myinvestor-cobas:{isin}"] = {
            "price": res["precio"], "price_previous_close": res["cierre_anterior"], "moneda": "EUR",
            "fuente": f"Yahoo Finance ({ticker_yahoo})", "ok": res["precio"] is not None, "error": res["error"],
            **campos_fecha_mercado(res, fecha),
        }

    res_pp = obtener_cotizacion_yahoo(PLAN_PENSIONES_TICKER_YAHOO)
    activos["myinvestor:plan-pensiones"] = {
        "price": res_pp["precio"], "price_previous_close": res_pp["cierre_anterior"], "moneda": "EUR",
        "fuente": f"Yahoo Finance ({PLAN_PENSIONES_TICKER_YAHOO})", "ok": res_pp["precio"] is not None, "error": res_pp["error"],
        **campos_fecha_mercado(res_pp, fecha),
    }

    for id_bench, ticker_yahoo in BENCHMARKS:
        res = obtener_cotizacion_yahoo(ticker_yahoo)
        activos[f"benchmark:{id_bench}"] = {
            "price": res["precio"], "price_previous_close": res["cierre_anterior"], "moneda": res["moneda"],
            "fuente": f"Yahoo Finance ({ticker_yahoo})", "ok": res["precio"] is not None, "error": res["error"],
            **campos_fecha_mercado(res, fecha),
        }

    return activos


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--pretty", action="store_true")
    args = ap.parse_args()

    hoy = datetime.date.today().isoformat()
    activos = construir_activos(hoy)
    resultado = {
        "date": hoy,
        "generado_en": datetime.datetime.now().isoformat(timespec="seconds"),
        "activos": activos,
    }

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out_path = OUT_DIR / f"{hoy}.json"
    texto = json.dumps(resultado, ensure_ascii=False, indent=2 if args.pretty else None)
    out_path.write_text(texto, encoding="utf-8")
    print(f"Escrito {out_path} ({sum(1 for a in activos.values() if a['ok'])}/{len(activos)} activos con precio fresco).")


if __name__ == "__main__":
    main()
