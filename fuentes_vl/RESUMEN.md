# Comparativa de fuentes de VL e índices

Generado automáticamente por `fuentes_vl/comparar_fuentes.py` (GitHub Actions, 09:15 y 22:40 aprox.).
Desfase = días hábiles (lunes a viernes) entre la captura y la fecha real del dato. Retraso = días hábiles que una fuente va por detrás de la más al día para ese mismo fondo o índice.

## Última captura: 2026-11-27 18:26

| Tipo | Instrumento | Fuente | Precio | Fecha del dato | Desfase (háb.) | Retraso vs mejor | Estado |
|---|---|---|---|---|---|---|---|
| fondo | ishares-developed-world | Yahoo | 11.982 | 2026-11-25 | 2 | 0 | OK |
| fondo | ishares-developed-world | FT | 11.98 | 2026-11-25 | 2 | 0 | OK (2 decimales) |
| fondo | ishares-developed-world | quefondos | 11.982 | 2026-11-25 | 2 | 0 | OK |
| fondo | ishares-emerging-markets | Yahoo | 12.264 | 2026-11-25 | 2 | 1 | OK |
| fondo | ishares-emerging-markets | FT | 12.4 | 2026-11-26 | 1 | 0 | OK (2 decimales) |
| fondo | horos-value-internacional | Yahoo | 210.673 | 2026-11-25 | 2 | 1 | OK |
| fondo | horos-value-internacional | FT | 214.5 | 2026-11-26 | 1 | 0 | OK (2 decimales) |
| fondo | horos-value-internacional | quefondos | 210.673 | 2026-11-25 | 2 | 1 | OK |
| fondo | horos-value-internacional | gestora |  | — |  |  | HTTP 500 |
| fondo | myinvestor-value | Yahoo | 1.26569 | 2026-11-25 | 2 | 1 | OK |
| fondo | myinvestor-value | FT | 1.3 | 2026-11-26 | 1 | 0 | OK (2 decimales) |
| fondo | myinvestor-value | quefondos | 1.26569 | 2026-11-25 | 2 | 1 | OK |
| fondo | numantia | Yahoo | 29.9419 | 2026-11-24 | 3 | 1 | OK |
| fondo | numantia | FT | 30.07 | 2026-11-25 | 2 | 0 | OK (2 decimales) |
| fondo | numantia | quefondos | 29.9418 | 2026-11-24 | 3 | 1 | OK |
| fondo | numantia | gestora |  | — |  |  | HTTP 500 |
| fondo | polar-capital | Yahoo | 29.98 | 2026-11-25 | 2 | 0 | OK |
| fondo | polar-capital | FT | 29.98 | 2026-11-25 | 2 | 0 | OK (2 decimales) |
| fondo | polar-capital | quefondos | 29.98 | 2026-11-25 | 2 | 0 | OK |
| fondo | pictet-china | Yahoo | 116.64 | 2026-11-25 | 2 | 1 | OK |
| fondo | pictet-china | FT | 117.66 | 2026-11-26 | 1 | 0 | OK (2 decimales) |
| fondo | pictet-china | quefondos | 117.92 | 2026-11-24 | 3 | 2 | OK |
| fondo | pictet-china | Renta 4 |  | — |  |  | HTTP 500 |
| fondo | cobas-seleccion | Yahoo | 288.155 | 2026-11-25 | 2 | 1 | OK |
| fondo | cobas-seleccion | FT | 293.42 | 2026-11-26 | 1 | 0 | OK (2 decimales) |
| fondo | cobas-seleccion | quefondos | 288.155 | 2026-11-25 | 2 | 1 | OK |
| fondo | cobas-seleccion | gestora | 293.423 | 2026-11-26 | 1 | 0 | OK (gestora) |
| plan | plan-myinvestor-indexado-global | Yahoo | 18.9372 | 2026-11-25 | 2 | 0 | OK |
| plan | plan-myinvestor-indexado-global | quefondos | 19.3004 | 2026-11-24 | 3 | 1 | OK |
| indice | msci-world-nr-usd | Yahoo | 15149.7 | 2026-11-27 | 0 | 0 | OK |
| indice | msci-acwi-nr-eur | Yahoo | 510.69 | 2026-11-27 | 0 | 0 | OK |
| indice | msci-em-nr-eur | Yahoo | 702.33 | 2026-11-27 | 0 | 0 | OK |
| indice | msci-em-nr-eur-alt | Yahoo | 702.33 | 2026-11-27 | 0 | 0 | OK |
| indice | msci-europe-nr-eur | Yahoo | 448.04 | 2026-11-27 | 0 | 0 | OK |
| indice | msci-china-nr-eur | Yahoo | 456.51 | 2026-11-27 | 0 | 0 | OK |
| indice | dj-global-technology | Yahoo | 4568.89 | 2026-11-27 | 0 | 0 | OK |

## Avisos

- pictet-china: quefondos va 2 días hábiles por detrás de la mejor fuente.
- horos-value-internacional: gestora lleva 10 capturas seguidas sin dato (fuente caída o formato cambiado).
- numantia: gestora lleva 10 capturas seguidas sin dato (fuente caída o formato cambiado).
- pictet-china: Renta 4 lleva 10 capturas seguidas sin dato (fuente caída o formato cambiado).

## Últimos 14 días, por fuente

| Tipo | Fuente | Capturas | Con dato | Desfase medio (háb.) | Retraso medio vs mejor | Veces la más al día |
|---|---|---|---|---|---|---|
| fondo | FT | 248 | 100% | 1.5 | 0.0 | 248 |
| fondo | Renta 4 | 31 | 68% | 2.0 | 0.6 | 8 |
| fondo | Yahoo | 248 | 100% | 1.9 | 0.4 | 160 |
| fondo | gestora | 93 | 78% | 1.9 | 0.2 | 56 |
| fondo | quefondos | 217 | 100% | 2.4 | 0.9 | 55 |
| indice | Yahoo | 217 | 100% | 0.4 | 0.0 | 217 |
| plan | Yahoo | 31 | 100% | 2.2 | 0.2 | 26 |
| plan | quefondos | 31 | 100% | 2.7 | 0.7 | 16 |
