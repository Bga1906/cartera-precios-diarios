# Comparativa de fuentes de VL e índices

Generado automáticamente por `fuentes_vl/comparar_fuentes.py` (GitHub Actions, 09:15 y 22:40 aprox.).
Desfase = días hábiles (lunes a viernes) entre la captura y la fecha real del dato. Retraso = días hábiles que una fuente va por detrás de la más al día para ese mismo fondo o índice.

## Última captura: 2026-11-26 04:02

| Tipo | Instrumento | Fuente | Precio | Fecha del dato | Desfase (háb.) | Retraso vs mejor | Estado |
|---|---|---|---|---|---|---|---|
| fondo | ishares-developed-world | Yahoo | 12.004 | 2026-11-24 | 2 | 0 | OK |
| fondo | ishares-developed-world | FT | 12 | 2026-11-24 | 2 | 0 | OK (2 decimales) |
| fondo | ishares-developed-world | quefondos | 12.106 | 2026-11-23 | 3 | 1 | OK |
| fondo | ishares-emerging-markets | Yahoo | 12.61 | 2026-11-24 | 2 | 0 | OK |
| fondo | ishares-emerging-markets | FT | 12.61 | 2026-11-24 | 2 | 0 | OK (2 decimales) |
| fondo | horos-value-internacional | Yahoo | 210.873 | 2026-11-24 | 2 | 0 | OK |
| fondo | horos-value-internacional | FT | 210.87 | 2026-11-24 | 2 | 0 | OK (2 decimales) |
| fondo | horos-value-internacional | quefondos | 210.483 | 2026-11-23 | 3 | 1 | OK |
| fondo | horos-value-internacional | gestora |  | — |  |  | HTTP 500 |
| fondo | myinvestor-value | Yahoo | 1.27248 | 2026-11-24 | 2 | 0 | OK |
| fondo | myinvestor-value | FT | 1.27 | 2026-11-24 | 2 | 0 | OK (2 decimales) |
| fondo | myinvestor-value | quefondos | 1.28299 | 2026-11-23 | 3 | 1 | OK |
| fondo | numantia | Yahoo | 29.9566 | 2026-11-23 | 3 | 0 | OK |
| fondo | numantia | FT | 29.96 | 2026-11-23 | 3 | 0 | OK (2 decimales) |
| fondo | numantia | quefondos | 29.1494 | 2026-11-20 | 4 | 1 | OK |
| fondo | numantia | gestora |  | — |  |  | HTTP 500 |
| fondo | polar-capital | Yahoo | 30.57 | 2026-11-24 | 2 | 0 | OK |
| fondo | polar-capital | FT | 30.57 | 2026-11-24 | 2 | 0 | OK (2 decimales) |
| fondo | polar-capital | quefondos | 31.67 | 2026-11-23 | 3 | 1 | OK |
| fondo | pictet-china | Yahoo | 117.92 | 2026-11-24 | 2 | 0 | OK |
| fondo | pictet-china | FT | 117.92 | 2026-11-24 | 2 | 0 | OK (2 decimales) |
| fondo | pictet-china | quefondos | 118.58 | 2026-11-20 | 4 | 2 | OK |
| fondo | pictet-china | Renta 4 |  | — |  |  | HTTP 500 |
| fondo | cobas-seleccion | Yahoo | 288.581 | 2026-11-24 | 2 | 0 | OK |
| fondo | cobas-seleccion | FT | 288.58 | 2026-11-24 | 2 | 0 | OK (2 decimales) |
| fondo | cobas-seleccion | quefondos | 289.4 | 2026-11-23 | 3 | 1 | OK |
| fondo | cobas-seleccion | gestora | 288.581 | 2026-11-24 | 2 | 0 | OK (gestora) |
| plan | plan-myinvestor-indexado-global | Yahoo | 19.3004 | 2026-11-24 | 2 | 0 | OK |
| plan | plan-myinvestor-indexado-global | quefondos | 19.6491 | 2026-11-23 | 3 | 1 | OK |
| indice | msci-world-nr-usd | Yahoo | 14921 | 2026-11-25 | 1 | 0 | OK |
| indice | msci-acwi-nr-eur | Yahoo | 501.36 | 2026-11-25 | 1 | 0 | OK |
| indice | msci-em-nr-eur | Yahoo | 685.15 | 2026-11-25 | 1 | 0 | OK |
| indice | msci-em-nr-eur-alt | Yahoo | 685.31 | 2026-11-25 | 1 | 0 | OK |
| indice | msci-europe-nr-eur | Yahoo | 435.89 | 2026-11-25 | 1 | 0 | OK |
| indice | msci-china-nr-eur | Yahoo | 444.92 | 2026-11-25 | 1 | 0 | OK |
| indice | dj-global-technology | Yahoo | 4470.62 | 2026-11-25 | 1 | 0 | OK |

## Avisos

- **numantia**: incluso la fuente más al día va 3 días hábiles atrasada.
- pictet-china: quefondos va 2 días hábiles por detrás de la mejor fuente.
- horos-value-internacional: gestora lleva 6 capturas seguidas sin dato (fuente caída o formato cambiado).
- numantia: gestora lleva 6 capturas seguidas sin dato (fuente caída o formato cambiado).
- pictet-china: Renta 4 lleva 6 capturas seguidas sin dato (fuente caída o formato cambiado).

## Últimos 14 días, por fuente

| Tipo | Fuente | Capturas | Con dato | Desfase medio (háb.) | Retraso medio vs mejor | Veces la más al día |
|---|---|---|---|---|---|---|
| fondo | FT | 232 | 100% | 1.5 | 0.0 | 232 |
| fondo | Renta 4 | 29 | 79% | 2.0 | 0.6 | 9 |
| fondo | Yahoo | 232 | 100% | 1.8 | 0.3 | 157 |
| fondo | gestora | 87 | 86% | 1.9 | 0.2 | 57 |
| fondo | quefondos | 203 | 100% | 2.4 | 0.9 | 52 |
| indice | Yahoo | 203 | 100% | 0.4 | 0.0 | 203 |
| plan | Yahoo | 29 | 100% | 2.2 | 0.2 | 24 |
| plan | quefondos | 29 | 100% | 2.7 | 0.7 | 16 |
