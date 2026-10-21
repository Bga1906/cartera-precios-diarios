# Comparativa de fuentes de VL e índices

Generado automáticamente por `fuentes_vl/comparar_fuentes.py` (GitHub Actions, 09:15 y 22:40 aprox.).
Desfase = días hábiles (lunes a viernes) entre la captura y la fecha real del dato. Retraso = días hábiles que una fuente va por detrás de la más al día para ese mismo fondo o índice.

## Última captura: 2026-10-22 01:35

| Tipo | Instrumento | Fuente | Precio | Fecha del dato | Desfase (háb.) | Retraso vs mejor | Estado |
|---|---|---|---|---|---|---|---|
| fondo | cobas-seleccion | Yahoo | 299.308 | 2026-10-20 | 2 | 0 | OK |
| fondo | cobas-seleccion | FT | 299.31 | 2026-10-20 | 2 | 0 | OK (2 decimales) |
| fondo | cobas-seleccion | quefondos | 299.333 | 2026-10-19 | 3 | 1 | OK |
| fondo | cobas-seleccion | gestora |  | 2026-10-20 | 2 | 0 | OK (gestora, solo fecha) |
| fondo | horos-value-internacional | Yahoo | 211.895 | 2026-10-20 | 2 | 0 | OK |
| fondo | horos-value-internacional | FT | 211.89 | 2026-10-20 | 2 | 0 | OK (2 decimales) |
| fondo | horos-value-internacional | quefondos | 211.119 | 2026-10-19 | 3 | 1 | OK |
| fondo | horos-value-internacional | gestora |  | — |  |  | formato no reconocido |
| fondo | ishares-developed-world | Yahoo | 12.481 | 2026-10-20 | 2 | 0 | OK |
| fondo | ishares-developed-world | FT | 12.48 | 2026-10-20 | 2 | 0 | OK (2 decimales) |
| fondo | ishares-developed-world | quefondos | 12.489 | 2026-10-19 | 3 | 1 | OK |
| fondo | ishares-emerging-markets | Yahoo | 13.427 | 2026-10-20 | 2 | 0 | OK |
| fondo | ishares-emerging-markets | FT | 13.43 | 2026-10-20 | 2 | 0 | OK (2 decimales) |
| fondo | ishares-emerging-markets | quefondos |  | — |  |  | formato no reconocido |
| fondo | myinvestor-value | Yahoo | 1.33573 | 2026-10-20 | 2 | 0 | OK |
| fondo | myinvestor-value | FT | 1.34 | 2026-10-20 | 2 | 0 | OK (2 decimales) |
| fondo | myinvestor-value | quefondos | 1.3275 | 2026-10-19 | 3 | 1 | OK |
| fondo | numantia | Yahoo | 28.5547 | 2026-10-19 | 3 | 0 | OK |
| fondo | numantia | FT | 28.55 | 2026-10-19 | 3 | 0 | OK (2 decimales) |
| fondo | numantia | quefondos | 28.543 | 2026-10-16 | 4 | 1 | OK |
| fondo | numantia | gestora | 28.55 | 2026-10-19 | 3 | 0 | OK (gestora) |
| fondo | pictet-china | Yahoo | 126.42 | 2026-10-20 | 2 | 0 | OK |
| fondo | pictet-china | FT | 126.42 | 2026-10-20 | 2 | 0 | OK (2 decimales) |
| fondo | pictet-china | quefondos | 127.89 | 2026-10-16 | 4 | 2 | OK |
| fondo | pictet-china | finanzen.at |  | — |  |  | HTTP 403 |
| fondo | polar-capital | Yahoo | 37.64 | 2026-10-20 | 2 | 0 | OK |
| fondo | polar-capital | FT | 37.64 | 2026-10-20 | 2 | 0 | OK (2 decimales) |
| fondo | polar-capital | quefondos | 38.1 | 2026-10-19 | 3 | 1 | OK |
| plan | plan-myinvestor-indexado-global | Yahoo | 20.2652 | 2026-10-16 | 4 | 0 | OK |
| plan | plan-myinvestor-indexado-global | quefondos | 20.2652 | 2026-10-16 | 4 | 0 | OK |
| indice | msci-world-nr-eur | Yahoo |  | — |  |  | HTTP 404 |
| indice | msci-acwi-nr-eur | Yahoo | 528.7 | 2026-10-21 | 1 | 0 | OK |
| indice | msci-em-nr-eur | Yahoo | 750.04 | 2026-10-21 | 1 | 0 | OK |
| indice | msci-em-nr-eur-alt | Yahoo | 750.04 | 2026-10-21 | 1 | 0 | OK |
| indice | msci-europe-nr-eur | Yahoo | 447.16 | 2026-10-21 | 1 | 0 | OK |
| indice | msci-china-nr-eur | Yahoo | 468.04 | 2026-10-21 | 1 | 0 | OK |
| indice | dj-global-technology | Yahoo | 5389.56 | 2026-10-21 | 1 | 0 | OK |

## Avisos

- **numantia**: incluso la fuente más al día va 3 días hábiles atrasada.
- pictet-china: quefondos va 2 días hábiles por detrás de la mejor fuente.
- **plan-myinvestor-indexado-global**: incluso la fuente más al día va 4 días hábiles atrasada.
- **msci-world-nr-eur**: ninguna fuente ha dado dato en esta captura.
- horos-value-internacional: gestora lleva 9 capturas seguidas sin dato (fuente caída o formato cambiado).
- ishares-emerging-markets: quefondos lleva 9 capturas seguidas sin dato (fuente caída o formato cambiado).
- msci-world-nr-eur: Yahoo lleva 9 capturas seguidas sin dato (fuente caída o formato cambiado).
- pictet-china: finanzen.at lleva 9 capturas seguidas sin dato (fuente caída o formato cambiado).

## Últimos 14 días, por fuente

| Tipo | Fuente | Capturas | Con dato | Desfase medio (háb.) | Retraso medio vs mejor | Veces la más al día |
|---|---|---|---|---|---|---|
| fondo | FT | 72 | 100% | 1.7 | 0.0 | 71 |
| fondo | Yahoo | 72 | 100% | 1.9 | 0.2 | 55 |
| fondo | finanzen.at | 9 | 0% | — | — | 0 |
| fondo | gestora | 27 | 67% | 2.1 | 0.0 | 18 |
| fondo | quefondos | 72 | 88% | 2.4 | 0.7 | 24 |
| indice | Yahoo | 63 | 86% | 0.4 | 0.0 | 54 |
| plan | Yahoo | 9 | 100% | 2.3 | 0.0 | 9 |
| plan | quefondos | 9 | 100% | 2.6 | 0.2 | 7 |
