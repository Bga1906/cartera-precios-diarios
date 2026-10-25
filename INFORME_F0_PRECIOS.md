# Informe F0 – Inventario de la captura de precios (25/10/2026)

Solo lectura: este informe no cambia ninguna cifra ni ningún workflow. Datos leídos de GitHub Actions, `precios/`, `precios/archivo/` y `fuentes_vl/capturas/2026-10.csv`. Lo que no se pudo comprobar está marcado «no verificable».

## Resumen para Brian (10 líneas)

1. La captura diaria **no ha fallado ninguna vez** en 50 ejecuciones (08/09–24/10). El problema no es que falle, es **cuándo sale**.
2. Hasta el 09/10 salía 7 minutos después de las 20:00 UTC. Desde el 10/10 sale entre 2 y 3,5 horas tarde (hasta las 22:58 UTC): GitHub no garantiza la hora de las tareas programadas.
3. Un fondo no puede tener ya el precio del día, así que cuando la fecha del dato es igual al día de captura es sospechoso. Solo pasa con **Pictet-China** (7 de 13 días); los otros 7 fondos y el plan, 0.
4. Causa de Pictet (comprobada con Yahoo): la captura lee el «precio actual» de la ficha, que va atrasado (125,04 del 21/10 con sello del 23/10). La serie por fechas es correcta: 22/10 = 121,39, igual que MyInvestor. El comparador sí lee la serie.
5. Fuente más fiable en los 8 días de comparación: **FT** (0 atrasos, 0 fallos), después **Yahoo**; quefondos va atrasada con frecuencia (21 de 64); la web de la gestora falla mucho y finanzen.at ya no sirve.
6. MyInvestor (conector) tiene 7 de los 8 fondos, con VL y fecha correctos; no tiene Cobas Selección ni el plan de pensiones, y solo da el último VL (sin histórico).
7. Fallos permanentes: `msci-world-nr-eur` (404; ya retirado del catálogo el 24/10) y 3 caídas de red del oro de joyería (ya con respaldo GC=F desde el 24/10).
8. La lista de vehículos está escrita en 3 sitios; los 8 fondos y sus tickers de Yahoo estaban duplicados en dos ficheros. Se propone un `universo.json` único (abajo).
9. Arreglos preparados en una rama aparte (PR separado, sin fusionar): fondos desde la serie de cierres, tickers en un solo sitio, ACWI como benchmark principal.
10. Decisiones para Brian: ver el apartado final.

## 1. Salud de las capturas (GitHub Actions)

**Captura diaria de precios** (programada a las 20:00 UTC). 50 ejecuciones, 50 correctas, ~20 s cada una.

| Periodo | Ejecuciones | Retraso frente a las 20:00 UTC | Observación |
|---|---|---|---|
| #1 (08/09, manual) | 1 | +95 min | primera ejecución |
| #2–#24 (09/09–01/10) | 23 | +5 a +8 min | normal |
| #25 (02/10) | 1 | +7 min | normal |
| #26 | 1 | +396 min (salió a las 02:36 UTC del 04/10) | el del 03/10 no salió a su hora |
| #27–#28 (04–05/10) | 2 | +87 y +90 min | |
| #29–#32 (06–09/10) | 4 | +7 a +10 min | normal |
| #33–#34 (10–11/10) | 2 | +188 y +203 min | desde aquí, retrasos largos |
| #35–#36 (12/10) | 2 | lanzadas a mano (07:46 y 08:01 UTC) | |
| #37 (13/10) | 1 | +346 min (01:45 UTC del 13/10) | |
| #38 (13/10) | 1 | +213 min | |
| #39 (14/10) | 1 | lanzada a mano (07:22 UTC) | |
| #40–#50 (14–24/10) | 11 | +116 a +195 min (21:55–23:15 UTC) | todas programadas |

**Comparar fuentes de VL e índices**: 17 ejecuciones desde el 17/10, 17 correctas, ~25–45 s. Dos por día (hacia las 12–15 UTC y hacia las 23–02 UTC; programadas 07:15 y 20:40 UTC), también con retraso de GitHub.

Hora programada exacta de cada ejecución: no verificable (la API de Actions solo da la hora real de inicio; los retrasos se calculan contra las 20:00 UTC del cron).

## 2. Cobertura por activo (61 capturas, 08/09–24/10, 77 activos)

Hay 17 acciones de Mexem, 5 ETF de Trade Republic, 8 fondos, plan de pensiones, bitcoin, oro de joyería y 44 índices de referencia.

| Problema | Activos | Detalle |
|---|---|---|
| Error de captura (`ok=false`) | `benchmark:msci-world-nr-eur` | 16 capturas con HTTP 404 (Yahoo no publica el MSCI World neto en euros). Retirado del catálogo el 24/10 (neto en USD en su lugar). |
| Error de captura | `oro-fisico:joyeria` | 3 caídas de red de gold-api.com. Respaldo GC=F añadido el 24/10. |
| Fecha del dato ≥ día de captura en un fondo | `LU0625737910` (Pictet-China) | 7 de 13 días con captura (primero: 14/10). Los otros 7 fondos y el plan: 0. |
| Mismo precio con fecha nueva | `mexem:E5S1` (2), `mexem:OHLA` (1) y varios índices (MSCI World, oro, plata, cobre, Brent…) | Casi todos en fin de semana: cierres repetidos legítimos. No se consideran error. |
| Desfase 2–3 días en fondos | todos los fondos y el plan | Normal (publican con 1–3 días de retraso); `ES0173311103` (Numantia) hasta 3. |

**Caso de validación Pictet-China (LU0625737910).** El detector lo marca. Evolución en la captura oficial:

| Captura (UTC) | Precio | Fecha que da | Fecha real (serie de Yahoo) |
|---|---|---|---|
| 20/10 22:53 | 128,34 | 20/10 | sospechosa |
| 22/10 22:55 | 126,42 | 22/10 | sospechosa |
| 23/10 22:50 | 125,04 | 23/10 | 21/10 |
| 24/10 22:11 | 125,04 | 23/10 (arrastrado) | 21/10 |

Serie de Yahoo (ticker `LU0625737910.LU`, 25/10): 20/10 = 126,42 · 21/10 = 125,04 · 22/10 = 121,39 · 23/10 = sin cierre. El campo «precio actual» de la ficha dice 125,04 con sello del 23/10 05:55 UTC: es el valor del 21/10 con la hora cambiada. MyInvestor: 121,39 con fecha 22/10. Las otras líneas de Yahoo (`0P…F`) no tienen este problema.

## 3. Desacuerdo entre fuentes

Solo hay 8 días de comparación (18–25/10), no 14 ni 60. Umbral de Brian: «dudoso» si dos fuentes difieren más de 0,5 % con la misma fecha, o si las fechas reales difieren 2 o más días hábiles.

| Fuente | Pares fondo-día vistos | Atrasada ≥2 días hábiles | Precio >0,5 % distinto | Fallos de lectura |
|---|---|---|---|---|
| FT | 64 | 0 | 0 | 0 |
| Yahoo | 72 | 2 | 0 | 14 |
| quefondos | 64 | 21 | 0 | 15 |
| Gestora | 13 | 0 | 4 (casi todo Cobas) | 27 de 51 |
| finanzen.at | 15 | – | – | 15 de 15 (HTTP 403) |
| Renta 4 | 1 | 0 | 0 | 0 |

Por vehículo (días con alguna alerta, de 8): Pictet 6 (todos por quefondos atrasada), iShares Developed 4, Polar Capital 4, Horos 3, plan de pensiones 3, Cobas 4 por precio de la gestora + 1 atrasado, iShares Emerging 0, MyInvestor Value 0, Numantia 0.

### Fuente más fiable por fondo (propuesta, con estos 8 días)

| Vehículo | 1.ª (principal) | 2.ª | Árbitro / control | Descartar o solo manual |
|---|---|---|---|---|
| Pictet-China | FT | Yahoo `LU0625737910.LU` **leído de la serie** | MyInvestor (121,39 del 22/10 correcto); Renta 4 | quefondos (atrasada 9 de 17) |
| Horos Value Internacional | FT | Yahoo | MyInvestor | quefondos (4 atrasos); web gestora (15 de 17 fallos; usar Renta 4) |
| iShares Developed World | FT | Yahoo | MyInvestor | quefondos (4 atrasos) |
| iShares Emerging Markets | FT | Yahoo | MyInvestor | quefondos (sin ficha del ISIN) |
| MyInvestor Value | FT | Yahoo | MyInvestor | – |
| Numantia | FT | Yahoo | MyInvestor; Renta 4 | – (publica con 2–3 días) |
| Polar Capital | FT | Yahoo | MyInvestor | quefondos (4 atrasos) |
| Cobas Selección | FT | Yahoo | quefondos (0 atrasos salvo 1) | web gestora (12 fallos, 5 precios distintos); **no está en MyInvestor** |
| Plan MyInvestor Indexado Global | Yahoo `0P0001LIG7.F` | quefondos (4 atrasos) | – | **no está en MyInvestor ni en FT**: hueco |

El árbitro MyInvestor solo es utilizable desde una sesión de Claude (conector), no dentro de GitHub Actions. Propuesta para F1/F2: captura en la nube con FT y Yahoo, y una tarea programada con el conector en solo lectura que valida y avisa.

## 4. Una sola lista de «qué sigo»: situación y propuesta

Hoy hay listas escritas dentro del código:

| Dónde | Qué contiene |
|---|---|
| `fetch_precios_publico.py` | `MEXEM_TICKERS` (17), `TR_ETFS` (5), `FONDOS_ISIN` (8), `PLAN_PENSIONES_TICKER_YAHOO`, `BTC_TICKER_YAHOO`, oro de joyería, `BENCHMARKS_RESPALDO` (5) |
| `fuentes_vl/comparar_fuentes.py` | `FONDOS` (los mismos 8, con sus tickers de Yahoo repetidos), `PLANES`, `INDICES` |
| `benchmarks_catalogo.json` | 47 benchmarks (44 en la captura del 24/10; +4 series de las liebres añadidas el 25/10) |

Diferencias detectadas: (a) los 8 fondos y sus tickers estaban duplicados en dos ficheros; (b) Pictet es el único con ticker `.LU` (los otros usan `0P…F`); (c) las fuentes de contraste cambian por fondo; (d) el benchmark principal no estaba marcado. No revisadas aquí: las listas de los Sheets (cripto, Trade Republic, Mexem) y `composiciones/reparto_vehiculos.csv` (van en F5).

Esquema propuesto de `universo.json` (**no aplicado**), con 3 ejemplos:

```json
{
  "version": 1,
  "vehiculos": [
    {"id": "pictet-china", "tipo": "fondo", "isin": "LU0625737910", "moneda": "EUR",
     "fuentes": [
       {"orden": 1, "fuente": "ft"},
       {"orden": 2, "fuente": "yahoo", "ticker": "LU0625737910.LU", "lectura": "serie"},
       {"orden": 3, "fuente": "myinvestor", "rol": "arbitro"}],
     "dudoso_pct": 0.5, "dudoso_dias_habiles": 2},
    {"id": "OHLA", "tipo": "accion", "broker": "mexem", "moneda": "EUR",
     "fuentes": [
       {"orden": 1, "fuente": "yahoo", "ticker": "OHLA.MC"},
       {"orden": 2, "fuente": "google_finance", "ticker": "BME:OHL"}],
     "dudoso_pct": 0.5, "dudoso_dias_habiles": 2},
    {"id": "msci-acwi-nr-eur", "tipo": "benchmark", "principal": true, "moneda": "EUR",
     "fuentes": [{"orden": 1, "fuente": "yahoo", "ticker": "^892400-EUR-NETR"}]}
  ]
}
```

El ticker de Google Finance de OHLA es una suposición: se comprobará en F1.

## 5. Funciona / falla / duplicado / falta

| Pieza | Estado |
|---|---|
| Captura diaria (Yahoo, oro, BTC, Mexem, Trade Republic, fondos) | **Funciona** (50/50); **falla** la hora: 2–3,5 h de retraso desde el 10/10 |
| Fechas de los fondos (captura oficial) | **Falla** en Pictet (precio actual atrasado). Arreglo preparado en PR aparte |
| Comparador de fuentes | **Funciona**; quefondos y gestoras poco fiables |
| MSCI World neto EUR | **Retirado** (404); MSCI World neto USD funciona |
| Oro de joyería | **Funciona** con respaldo GC=F desde el 24/10 |
| Lista de fondos y tickers | **Duplicado** (corregido en el PR aparte) |
| Lista de benchmarks | Un solo sitio (catálogo) + 5 de respaldo en el código |
| Benchmark principal | **Faltaba**; ACWI propuesto (sigue «pendiente» de verificar) |
| Segunda fuente automática del plan de pensiones | **Falta** |
| Cobas: fuente de control fiable | **Falta** (no está en MyInvestor; la web de la gestora falla) |
| Oro, plata y uranio de Trade Republic: contraste | **Falta** (hueco conocido) |
| Latido (aviso si una captura no llega) | **Falta** (F1/F2) |
| Pruebas automáticas | 2 de 76 fallaban en `main` por expectativas antiguas (claves del oro; 43 entradas de catálogo); corregidas en el PR aparte |
| Copia vieja `scripts/cartera_nube/fetch_precios_publico.py` en el vault | Pendiente (necesita el PC) |

## Decisiones que necesita Brian

1. ¿Fusionar el PR de arreglos (`f1-arreglos-fecha-y-duplicados`)? Cambia cómo se leen los fondos en la captura diaria; conviene dejarlo correr en paralelo antes de dar nada por bueno.
2. ¿Aceptar la jerarquía de fuentes por fondo y MyInvestor como árbitro desde una tarea en la nube (F1/F2)?
3. Hora de la captura: ¿cambiar la programación para que no dependa de una hora exacta (p. ej. dos intentos al día y marcar la fecha real del dato)?
4. ¿Verificar `msci-acwi-nr-eur` (hoy «pendiente») ya que será el benchmark oficial?
5. Cobas y plan de pensiones: elegir fuente alternativa.
