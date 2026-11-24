# Comparativa de fuentes de VL e índices

Generado automáticamente por `fuentes_vl/comparar_fuentes.py` (GitHub Actions, 09:15 y 22:40 aprox.).
Desfase = días hábiles (lunes a viernes) entre la captura y la fecha real del dato. Retraso = días hábiles que una fuente va por detrás de la más al día para ese mismo fondo o índice.

## Última captura: 2026-11-24 05:56

| Tipo | Instrumento | Fuente | Precio | Fecha del dato | Desfase (háb.) | Retraso vs mejor | Estado |
|---|---|---|---|---|---|---|---|
| fondo | ishares-developed-world | Yahoo | 11.59 | 2026-11-20 | 2 | 0 | OK |
| fondo | ishares-developed-world | FT | 11.59 | 2026-11-20 | 2 | 0 | OK (2 decimales) |
| fondo | ishares-developed-world | quefondos | 11.59 | 2026-11-20 | 2 | 0 | OK |
| fondo | ishares-emerging-markets | Yahoo | 12.19 | 2026-11-20 | 2 | 0 | OK |
| fondo | ishares-emerging-markets | FT | 12.19 | 2026-11-20 | 2 | 0 | OK (2 decimales) |
| fondo | horos-value-internacional | Yahoo | 208.185 | 2026-11-20 | 2 | 0 | OK |
| fondo | horos-value-internacional | FT | 208.19 | 2026-11-20 | 2 | 0 | OK (2 decimales) |
| fondo | horos-value-internacional | quefondos | 208.185 | 2026-11-20 | 2 | 0 | OK |
| fondo | horos-value-internacional | gestora |  | — |  |  | URLError: <urlopen error timed out> |
| fondo | myinvestor-value | Yahoo | 1.2554 | 2026-11-20 | 2 | 0 | OK |
| fondo | myinvestor-value | FT | 1.26 | 2026-11-20 | 2 | 0 | OK (2 decimales) |
| fondo | myinvestor-value | quefondos | 1.2554 | 2026-11-20 | 2 | 0 | OK |
| fondo | numantia | Yahoo | 29.9124 | 2026-11-19 | 3 | 0 | OK |
| fondo | numantia | FT | 29.91 | 2026-11-19 | 3 | 0 | OK (2 decimales) |
| fondo | numantia | quefondos | 29.9124 | 2026-11-19 | 3 | 0 | OK |
| fondo | numantia | gestora |  | — |  |  | URLError: <urlopen error timed out> |
| fondo | polar-capital | Yahoo | 29.34 | 2026-11-20 | 2 | 0 | OK |
| fondo | polar-capital | FT | 29.34 | 2026-11-20 | 2 | 0 | OK (2 decimales) |
| fondo | polar-capital | quefondos | 29.34 | 2026-11-20 | 2 | 0 | OK |
| fondo | pictet-china | Yahoo | 118.58 | 2026-11-20 | 2 | 0 | OK |
| fondo | pictet-china | FT | 118.58 | 2026-11-20 | 2 | 0 | OK (2 decimales) |
| fondo | pictet-china | quefondos | 120.56 | 2026-11-19 | 3 | 1 | OK |
| fondo | pictet-china | Renta 4 |  | — |  |  | URLError: <urlopen error timed out> |
| fondo | cobas-seleccion | Yahoo | 286.849 | 2026-11-20 | 2 | 0 | OK |
| fondo | cobas-seleccion | FT | 286.85 | 2026-11-20 | 2 | 0 | OK (2 decimales) |
| fondo | cobas-seleccion | quefondos | 286.849 | 2026-11-20 | 2 | 0 | OK |
| fondo | cobas-seleccion | gestora | 286.849 | 2026-11-20 | 2 | 0 | OK (gestora) |
| plan | plan-myinvestor-indexado-global | Yahoo | 18.9559 | 2026-11-20 | 2 | 0 | OK |
| plan | plan-myinvestor-indexado-global | quefondos | 18.9559 | 2026-11-20 | 2 | 0 | OK |
| indice | msci-world-nr-usd | Yahoo | 15019 | 2026-11-23 | 1 | 0 | OK |
| indice | msci-acwi-nr-eur | Yahoo | 507.98 | 2026-11-23 | 1 | 0 | OK |
| indice | msci-em-nr-eur | Yahoo | 703.23 | 2026-11-23 | 1 | 0 | OK |
| indice | msci-em-nr-eur-alt | Yahoo | 703.28 | 2026-11-23 | 1 | 0 | OK |
| indice | msci-europe-nr-eur | Yahoo | 442.98 | 2026-11-23 | 1 | 0 | OK |
| indice | msci-china-nr-eur | Yahoo | 445.14 | 2026-11-23 | 1 | 0 | OK |
| indice | dj-global-technology | Yahoo | 4605.26 | 2026-11-23 | 1 | 0 | OK |

## Avisos

- **numantia**: incluso la fuente más al día va 3 días hábiles atrasada.

## Últimos 14 días, por fuente

| Tipo | Fuente | Capturas | Con dato | Desfase medio (háb.) | Retraso medio vs mejor | Veces la más al día |
|---|---|---|---|---|---|---|
| fondo | FT | 232 | 100% | 1.5 | 0.0 | 232 |
| fondo | Renta 4 | 29 | 93% | 2.0 | 0.6 | 10 |
| fondo | Yahoo | 232 | 100% | 1.9 | 0.3 | 157 |
| fondo | gestora | 87 | 95% | 2.0 | 0.3 | 61 |
| fondo | quefondos | 203 | 100% | 2.5 | 0.9 | 54 |
| indice | Yahoo | 203 | 100% | 0.4 | 0.0 | 203 |
| plan | Yahoo | 29 | 100% | 2.2 | 0.2 | 24 |
| plan | quefondos | 29 | 100% | 2.8 | 0.8 | 14 |
