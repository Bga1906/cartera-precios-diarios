# Comparativa de fuentes de VL e índices

Generado automáticamente por `fuentes_vl/comparar_fuentes.py` (GitHub Actions, 09:15 y 22:40 aprox.).
Desfase = días hábiles (lunes a viernes) entre la captura y la fecha real del dato. Retraso = días hábiles que una fuente va por detrás de la más al día para ese mismo fondo o índice.

## Última captura: 2026-11-23 20:13

| Tipo | Instrumento | Fuente | Precio | Fecha del dato | Desfase (háb.) | Retraso vs mejor | Estado |
|---|---|---|---|---|---|---|---|
| fondo | ishares-developed-world | Yahoo | 11.59 | 2026-11-20 | 1 | 0 | OK |
| fondo | ishares-developed-world | FT | 11.59 | 2026-11-20 | 1 | 0 | OK (2 decimales) |
| fondo | ishares-developed-world | quefondos | 11.989 | 2026-11-19 | 2 | 1 | OK |
| fondo | ishares-emerging-markets | Yahoo | 12.19 | 2026-11-20 | 1 | 0 | OK |
| fondo | ishares-emerging-markets | FT | 12.19 | 2026-11-20 | 1 | 0 | OK (2 decimales) |
| fondo | horos-value-internacional | Yahoo | 212.288 | 2026-11-19 | 2 | 1 | OK |
| fondo | horos-value-internacional | FT | 208.19 | 2026-11-20 | 1 | 0 | OK (2 decimales) |
| fondo | horos-value-internacional | quefondos | 212.288 | 2026-11-19 | 2 | 1 | OK |
| fondo | horos-value-internacional | gestora |  | — |  |  | URLError: <urlopen error timed out> |
| fondo | myinvestor-value | Yahoo | 1.29344 | 2026-11-19 | 2 | 1 | OK |
| fondo | myinvestor-value | FT | 1.26 | 2026-11-20 | 1 | 0 | OK (2 decimales) |
| fondo | myinvestor-value | quefondos | 1.29344 | 2026-11-19 | 2 | 1 | OK |
| fondo | numantia | Yahoo | 30.1772 | 2026-11-18 | 3 | 1 | OK |
| fondo | numantia | FT | 29.91 | 2026-11-19 | 2 | 0 | OK (2 decimales) |
| fondo | numantia | quefondos | 30.1772 | 2026-11-18 | 3 | 1 | OK |
| fondo | numantia | gestora |  | — |  |  | URLError: <urlopen error timed out> |
| fondo | polar-capital | Yahoo | 29.34 | 2026-11-20 | 1 | 0 | OK |
| fondo | polar-capital | FT | 29.34 | 2026-11-20 | 1 | 0 | OK (2 decimales) |
| fondo | polar-capital | quefondos | 31.85 | 2026-11-19 | 2 | 1 | OK |
| fondo | pictet-china | Yahoo | 120.56 | 2026-11-19 | 2 | 1 | OK |
| fondo | pictet-china | FT | 118.58 | 2026-11-20 | 1 | 0 | OK (2 decimales) |
| fondo | pictet-china | quefondos | 123.15 | 2026-11-18 | 3 | 2 | OK |
| fondo | pictet-china | Renta 4 |  | — |  |  | URLError: <urlopen error timed out> |
| fondo | cobas-seleccion | Yahoo | 292.741 | 2026-11-19 | 2 | 1 | OK |
| fondo | cobas-seleccion | FT | 286.85 | 2026-11-20 | 1 | 0 | OK (2 decimales) |
| fondo | cobas-seleccion | quefondos | 292.741 | 2026-11-19 | 2 | 1 | OK |
| fondo | cobas-seleccion | gestora | 286.849 | 2026-11-20 | 1 | 0 | OK (gestora) |
| plan | plan-myinvestor-indexado-global | Yahoo | 19.6079 | 2026-11-19 | 2 | 0 | OK |
| plan | plan-myinvestor-indexado-global | quefondos | 19.6079 | 2026-11-19 | 2 | 0 | OK |
| indice | msci-world-nr-usd | Yahoo | 15013.7 | 2026-11-23 | 0 | 0 | OK |
| indice | msci-acwi-nr-eur | Yahoo | 506.59 | 2026-11-23 | 0 | 0 | OK |
| indice | msci-em-nr-eur | Yahoo | 679.44 | 2026-11-23 | 0 | 0 | OK |
| indice | msci-em-nr-eur-alt | Yahoo | 679.46 | 2026-11-23 | 0 | 0 | OK |
| indice | msci-europe-nr-eur | Yahoo | 443.25 | 2026-11-23 | 0 | 0 | OK |
| indice | msci-china-nr-eur | Yahoo | 448.03 | 2026-11-23 | 0 | 0 | OK |
| indice | dj-global-technology | Yahoo | 4611.7 | 2026-11-23 | 0 | 0 | OK |

## Avisos

- pictet-china: quefondos va 2 días hábiles por detrás de la mejor fuente.

## Últimos 14 días, por fuente

| Tipo | Fuente | Capturas | Con dato | Desfase medio (háb.) | Retraso medio vs mejor | Veces la más al día |
|---|---|---|---|---|---|---|
| fondo | FT | 240 | 100% | 1.5 | 0.0 | 240 |
| fondo | Renta 4 | 30 | 97% | 2.0 | 0.6 | 11 |
| fondo | Yahoo | 240 | 100% | 1.9 | 0.3 | 159 |
| fondo | gestora | 90 | 98% | 2.1 | 0.3 | 64 |
| fondo | quefondos | 210 | 100% | 2.5 | 0.9 | 56 |
| indice | Yahoo | 210 | 100% | 0.4 | 0.0 | 210 |
| plan | Yahoo | 30 | 100% | 2.2 | 0.2 | 25 |
| plan | quefondos | 30 | 100% | 2.8 | 0.8 | 15 |
