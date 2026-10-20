# Comparativa de fuentes de VL e índices

Generado automáticamente por `fuentes_vl/comparar_fuentes.py` (GitHub Actions, 09:15 y 22:40 aprox.).
Desfase = días hábiles (lunes a viernes) entre la captura y la fecha real del dato. Retraso = días hábiles que una fuente va por detrás de la más al día para ese mismo fondo o índice.

## Última captura: 2026-10-21 01:21

| Tipo | Instrumento | Fuente | Precio | Fecha del dato | Desfase (háb.) | Retraso vs mejor | Estado |
|---|---|---|---|---|---|---|---|
| fondo | cobas-seleccion | Yahoo | 299.333 | 2026-10-19 | 2 | 0 | OK |
| fondo | cobas-seleccion | FT | 299.33 | 2026-10-19 | 2 | 0 | OK (2 decimales) |
| fondo | cobas-seleccion | quefondos | 300.346 | 2026-10-16 | 3 | 1 | OK |
| fondo | cobas-seleccion | gestora |  | 2026-10-19 | 2 | 0 | OK (gestora, solo fecha) |
| fondo | horos-value-internacional | Yahoo | 211.119 | 2026-10-19 | 2 | 0 | OK |
| fondo | horos-value-internacional | FT | 211.12 | 2026-10-19 | 2 | 0 | OK (2 decimales) |
| fondo | horos-value-internacional | quefondos | 212.13 | 2026-10-16 | 3 | 1 | OK |
| fondo | horos-value-internacional | gestora |  | — |  |  | formato no reconocido |
| fondo | ishares-developed-world | Yahoo | 12.489 | 2026-10-19 | 2 | 0 | OK |
| fondo | ishares-developed-world | FT | 12.49 | 2026-10-19 | 2 | 0 | OK (2 decimales) |
| fondo | ishares-developed-world | quefondos | 12.436 | 2026-10-16 | 3 | 1 | OK |
| fondo | ishares-emerging-markets | Yahoo | 13.616 | 2026-10-19 | 2 | 0 | OK |
| fondo | ishares-emerging-markets | FT | 13.62 | 2026-10-19 | 2 | 0 | OK (2 decimales) |
| fondo | ishares-emerging-markets | quefondos |  | — |  |  | formato no reconocido |
| fondo | myinvestor-value | Yahoo | 1.3275 | 2026-10-19 | 2 | 0 | OK |
| fondo | myinvestor-value | FT | 1.33 | 2026-10-19 | 2 | 0 | OK (2 decimales) |
| fondo | myinvestor-value | quefondos | 1.33702 | 2026-10-16 | 3 | 1 | OK |
| fondo | numantia | Yahoo | 28.543 | 2026-10-16 | 3 | 0 | OK |
| fondo | numantia | FT | 28.54 | 2026-10-16 | 3 | 0 | OK (2 decimales) |
| fondo | numantia | quefondos | 28.5553 | 2026-10-15 | 4 | 1 | OK |
| fondo | numantia | gestora | 28.54 | 2026-10-16 | 3 | 0 | OK (gestora) |
| fondo | pictet-china | Yahoo | 128.35 | 2026-10-19 | 2 | 0 | OK |
| fondo | pictet-china | FT | 128.35 | 2026-10-19 | 2 | 0 | OK (2 decimales) |
| fondo | pictet-china | quefondos | 128.02 | 2026-10-15 | 4 | 2 | OK |
| fondo | pictet-china | finanzen.at |  | — |  |  | HTTP 403 |
| fondo | polar-capital | Yahoo | 38.1 | 2026-10-19 | 2 | 0 | OK |
| fondo | polar-capital | FT | 38.1 | 2026-10-19 | 2 | 0 | OK (2 decimales) |
| fondo | polar-capital | quefondos | 37.66 | 2026-10-16 | 3 | 1 | OK |
| plan | plan-myinvestor-indexado-global | Yahoo | 20.2652 | 2026-10-16 | 3 | 0 | OK |
| plan | plan-myinvestor-indexado-global | quefondos | 20.3286 | 2026-10-15 | 4 | 1 | OK |
| indice | msci-world-nr-eur | Yahoo |  | — |  |  | HTTP 404 |
| indice | msci-acwi-nr-eur | Yahoo | 525.36 | 2026-10-20 | 1 | 0 | OK |
| indice | msci-em-nr-eur | Yahoo | 741.31 | 2026-10-20 | 1 | 0 | OK |
| indice | msci-em-nr-eur-alt | Yahoo | 741.31 | 2026-10-20 | 1 | 0 | OK |
| indice | msci-europe-nr-eur | Yahoo | 443.2 | 2026-10-20 | 1 | 0 | OK |
| indice | msci-china-nr-eur | Yahoo | 473.16 | 2026-10-20 | 1 | 0 | OK |
| indice | dj-global-technology | Yahoo | 5314.43 | 2026-10-20 | 1 | 0 | OK |

## Avisos

- **numantia**: incluso la fuente más al día va 3 días hábiles atrasada.
- pictet-china: quefondos va 2 días hábiles por detrás de la mejor fuente.
- **plan-myinvestor-indexado-global**: incluso la fuente más al día va 3 días hábiles atrasada.
- **msci-world-nr-eur**: ninguna fuente ha dado dato en esta captura.
- horos-value-internacional: gestora lleva 7 capturas seguidas sin dato (fuente caída o formato cambiado).
- ishares-emerging-markets: quefondos lleva 7 capturas seguidas sin dato (fuente caída o formato cambiado).
- msci-world-nr-eur: Yahoo lleva 7 capturas seguidas sin dato (fuente caída o formato cambiado).
- pictet-china: finanzen.at lleva 7 capturas seguidas sin dato (fuente caída o formato cambiado).

## Últimos 14 días, por fuente

| Tipo | Fuente | Capturas | Con dato | Desfase medio (háb.) | Retraso medio vs mejor | Veces la más al día |
|---|---|---|---|---|---|---|
| fondo | FT | 56 | 100% | 1.6 | 0.0 | 56 |
| fondo | Yahoo | 56 | 100% | 1.8 | 0.2 | 43 |
| fondo | finanzen.at | 7 | 0% | — | — | 0 |
| fondo | gestora | 21 | 67% | 2.1 | 0.0 | 14 |
| fondo | quefondos | 56 | 88% | 2.3 | 0.7 | 21 |
| indice | Yahoo | 49 | 86% | 0.4 | 0.0 | 42 |
| plan | Yahoo | 7 | 100% | 2.0 | 0.0 | 7 |
| plan | quefondos | 7 | 100% | 2.3 | 0.3 | 5 |
