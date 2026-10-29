# Comparativa de fuentes de VL e índices

Generado automáticamente por `fuentes_vl/comparar_fuentes.py` (GitHub Actions, 09:15 y 22:40 aprox.).
Desfase = días hábiles (lunes a viernes) entre la captura y la fecha real del dato. Retraso = días hábiles que una fuente va por detrás de la más al día para ese mismo fondo o índice.

## Última captura: 2026-10-29 01:21

| Tipo | Instrumento | Fuente | Precio | Fecha del dato | Desfase (háb.) | Retraso vs mejor | Estado |
|---|---|---|---|---|---|---|---|
| fondo | ishares-developed-world | Yahoo | 12.608 | 2026-10-27 | 2 | 0 | OK |
| fondo | ishares-developed-world | FT | 12.61 | 2026-10-27 | 2 | 0 | OK (2 decimales) |
| fondo | ishares-developed-world | quefondos | 12.504 | 2026-10-26 | 3 | 1 | OK |
| fondo | ishares-emerging-markets | Yahoo | 13.384 | 2026-10-27 | 2 | 0 | OK |
| fondo | ishares-emerging-markets | FT | 13.38 | 2026-10-27 | 2 | 0 | OK (2 decimales) |
| fondo | horos-value-internacional | Yahoo | 212.803 | 2026-10-27 | 2 | 0 | OK |
| fondo | horos-value-internacional | FT | 212.8 | 2026-10-27 | 2 | 0 | OK (2 decimales) |
| fondo | horos-value-internacional | quefondos | 211.372 | 2026-10-26 | 3 | 1 | OK |
| fondo | horos-value-internacional | gestora | 212.8 | 2026-10-27 | 2 | 0 | OK (gestora) |
| fondo | myinvestor-value | Yahoo | 1.32638 | 2026-10-27 | 2 | 0 | OK |
| fondo | myinvestor-value | FT | 1.33 | 2026-10-27 | 2 | 0 | OK (2 decimales) |
| fondo | myinvestor-value | quefondos | 1.31612 | 2026-10-26 | 3 | 1 | OK |
| fondo | numantia | Yahoo | 29.3605 | 2026-10-23 | 4 | 1 | OK |
| fondo | numantia | FT | 29.36 | 2026-10-23 | 4 | 1 | OK (2 decimales) |
| fondo | numantia | quefondos | 29.3605 | 2026-10-23 | 4 | 1 | OK |
| fondo | numantia | gestora | 29.56 | 2026-10-26 | 3 | 0 | OK (gestora) |
| fondo | polar-capital | Yahoo | 37.86 | 2026-10-27 | 2 | 0 | OK |
| fondo | polar-capital | FT | 37.86 | 2026-10-27 | 2 | 0 | OK (2 decimales) |
| fondo | polar-capital | quefondos | 36.63 | 2026-10-23 | 4 | 2 | OK |
| fondo | pictet-china | Yahoo | 122.71 | 2026-10-27 | 2 | 0 | OK |
| fondo | pictet-china | FT | 122.71 | 2026-10-27 | 2 | 0 | OK (2 decimales) |
| fondo | pictet-china | quefondos | 122.69 | 2026-10-23 | 4 | 2 | OK |
| fondo | pictet-china | Renta 4 | 122.71 | 2026-10-27 | 2 | 0 | OK (gestora) |
| fondo | cobas-seleccion | Yahoo | 299.428 | 2026-10-27 | 2 | 0 | OK |
| fondo | cobas-seleccion | FT | 299.43 | 2026-10-27 | 2 | 0 | OK (2 decimales) |
| fondo | cobas-seleccion | quefondos | 297.643 | 2026-10-26 | 3 | 1 | OK |
| fondo | cobas-seleccion | gestora | 299.428 | 2026-10-27 | 2 | 0 | OK (gestora) |
| plan | plan-myinvestor-indexado-global | Yahoo | 20.2301 | 2026-10-26 | 3 | 0 | OK |
| plan | plan-myinvestor-indexado-global | quefondos | 20.1316 | 2026-10-23 | 4 | 1 | OK |
| indice | msci-world-nr-usd | Yahoo | 15999 | 2026-10-28 | 1 | 0 | OK |
| indice | msci-acwi-nr-eur | Yahoo | 531.72 | 2026-10-28 | 1 | 0 | OK |
| indice | msci-em-nr-eur | Yahoo | 754.72 | 2026-10-28 | 1 | 0 | OK |
| indice | msci-em-nr-eur-alt | Yahoo | 754.67 | 2026-10-28 | 1 | 0 | OK |
| indice | msci-europe-nr-eur | Yahoo | 447.17 | 2026-10-28 | 1 | 0 | OK |
| indice | msci-china-nr-eur | Yahoo | 462.13 | 2026-10-28 | 1 | 0 | OK |
| indice | dj-global-technology | Yahoo | 5391.99 | 2026-10-28 | 1 | 0 | OK |

## Avisos

- **numantia**: incluso la fuente más al día va 3 días hábiles atrasada.
- polar-capital: quefondos va 2 días hábiles por detrás de la mejor fuente.
- pictet-china: quefondos va 2 días hábiles por detrás de la mejor fuente.
- **plan-myinvestor-indexado-global**: incluso la fuente más al día va 3 días hábiles atrasada.

## Últimos 14 días, por fuente

| Tipo | Fuente | Capturas | Con dato | Desfase medio (háb.) | Retraso medio vs mejor | Veces la más al día |
|---|---|---|---|---|---|---|
| fondo | FT | 192 | 100% | 1.6 | 0.0 | 186 |
| fondo | Renta 4 | 9 | 100% | 2.0 | 0.7 | 3 |
| fondo | Yahoo | 192 | 100% | 1.8 | 0.2 | 149 |
| fondo | finanzen.at | 15 | 0% | — | — | 0 |
| fondo | gestora | 72 | 78% | 2.0 | 0.0 | 54 |
| fondo | quefondos | 183 | 92% | 2.3 | 0.7 | 69 |
| indice | Yahoo | 168 | 92% | 0.3 | 0.0 | 154 |
| plan | Yahoo | 24 | 100% | 2.2 | 0.0 | 24 |
| plan | quefondos | 24 | 100% | 2.8 | 0.6 | 11 |
