# Comparativa de fuentes de VL e índices

Generado automáticamente por `fuentes_vl/comparar_fuentes.py` (GitHub Actions, 09:15 y 22:40 aprox.).
Desfase = días hábiles (lunes a viernes) entre la captura y la fecha real del dato. Retraso = días hábiles que una fuente va por detrás de la más al día para ese mismo fondo o índice.

## Última captura: 2026-10-23 01:33

| Tipo | Instrumento | Fuente | Precio | Fecha del dato | Desfase (háb.) | Retraso vs mejor | Estado |
|---|---|---|---|---|---|---|---|
| fondo | cobas-seleccion | Yahoo | 299.787 | 2026-10-21 | 2 | 0 | OK |
| fondo | cobas-seleccion | FT | 299.79 | 2026-10-21 | 2 | 0 | OK (2 decimales) |
| fondo | cobas-seleccion | quefondos | 299.308 | 2026-10-20 | 3 | 1 | OK |
| fondo | cobas-seleccion | gestora | 0.16 | 2026-10-21 | 2 | 0 | OK (gestora) |
| fondo | horos-value-internacional | Yahoo | 211.367 | 2026-10-21 | 2 | 0 | OK |
| fondo | horos-value-internacional | FT | 211.37 | 2026-10-21 | 2 | 0 | OK (2 decimales) |
| fondo | horos-value-internacional | quefondos | 211.895 | 2026-10-20 | 3 | 1 | OK |
| fondo | horos-value-internacional | gestora |  | — |  |  | formato no reconocido |
| fondo | ishares-developed-world | Yahoo | 12.583 | 2026-10-21 | 2 | 0 | OK |
| fondo | ishares-developed-world | FT | 12.58 | 2026-10-21 | 2 | 0 | OK (2 decimales) |
| fondo | ishares-developed-world | quefondos | 12.481 | 2026-10-20 | 3 | 1 | OK |
| fondo | ishares-emerging-markets | Yahoo | 13.589 | 2026-10-21 | 2 | 0 | OK |
| fondo | ishares-emerging-markets | FT | 13.59 | 2026-10-21 | 2 | 0 | OK (2 decimales) |
| fondo | ishares-emerging-markets | quefondos |  | — |  |  | formato no reconocido |
| fondo | myinvestor-value | Yahoo | 1.33625 | 2026-10-21 | 2 | 0 | OK |
| fondo | myinvestor-value | FT | 1.34 | 2026-10-21 | 2 | 0 | OK (2 decimales) |
| fondo | myinvestor-value | quefondos | 1.33573 | 2026-10-20 | 3 | 1 | OK |
| fondo | numantia | Yahoo | 28.5547 | 2026-10-19 | 4 | 1 | OK |
| fondo | numantia | FT | 28.55 | 2026-10-19 | 4 | 1 | OK (2 decimales) |
| fondo | numantia | quefondos | 28.5547 | 2026-10-19 | 4 | 1 | OK |
| fondo | numantia | gestora | 28.81 | 2026-10-20 | 3 | 0 | OK (gestora) |
| fondo | pictet-china | Yahoo | 125.04 | 2026-10-21 | 2 | 0 | OK |
| fondo | pictet-china | FT | 125.04 | 2026-10-21 | 2 | 0 | OK (2 decimales) |
| fondo | pictet-china | quefondos | 127.89 | 2026-10-16 | 5 | 3 | OK |
| fondo | pictet-china | finanzen.at |  | — |  |  | HTTP 403 |
| fondo | polar-capital | Yahoo | 38.38 | 2026-10-21 | 2 | 0 | OK |
| fondo | polar-capital | FT | 38.38 | 2026-10-21 | 2 | 0 | OK (2 decimales) |
| fondo | polar-capital | quefondos | 37.64 | 2026-10-20 | 3 | 1 | OK |
| plan | plan-myinvestor-indexado-global | Yahoo | 20.2627 | 2026-10-20 | 3 | 0 | OK |
| plan | plan-myinvestor-indexado-global | quefondos | 20.2652 | 2026-10-16 | 5 | 2 | OK |
| indice | msci-world-nr-eur | Yahoo |  | — |  |  | HTTP 404 |
| indice | msci-acwi-nr-eur | Yahoo | 522.61 | 2026-10-22 | 1 | 0 | OK |
| indice | msci-em-nr-eur | Yahoo | 733.32 | 2026-10-22 | 1 | 0 | OK |
| indice | msci-em-nr-eur-alt | Yahoo | 733.32 | 2026-10-22 | 1 | 0 | OK |
| indice | msci-europe-nr-eur | Yahoo | 442.99 | 2026-10-22 | 1 | 0 | OK |
| indice | msci-china-nr-eur | Yahoo | 454.33 | 2026-10-22 | 1 | 0 | OK |
| indice | dj-global-technology | Yahoo | 5218.79 | 2026-10-22 | 1 | 0 | OK |

## Avisos

- **numantia**: incluso la fuente más al día va 3 días hábiles atrasada.
- pictet-china: quefondos va 3 días hábiles por detrás de la mejor fuente.
- **plan-myinvestor-indexado-global**: incluso la fuente más al día va 3 días hábiles atrasada.
- plan-myinvestor-indexado-global: quefondos va 2 días hábiles por detrás de la mejor fuente.
- **msci-world-nr-eur**: ninguna fuente ha dado dato en esta captura.
- Diferencia de precio: cobas-seleccion (2026-10-21): Yahoo 299.787 frente a gestora 0.16 (99.95%)
- Diferencia de precio: cobas-seleccion (2026-10-21): FT 299.79 frente a gestora 0.16 (99.95%)
- horos-value-internacional: gestora lleva 11 capturas seguidas sin dato (fuente caída o formato cambiado).
- ishares-emerging-markets: quefondos lleva 11 capturas seguidas sin dato (fuente caída o formato cambiado).
- msci-world-nr-eur: Yahoo lleva 11 capturas seguidas sin dato (fuente caída o formato cambiado).
- pictet-china: finanzen.at lleva 11 capturas seguidas sin dato (fuente caída o formato cambiado).

## Últimos 14 días, por fuente

| Tipo | Fuente | Capturas | Con dato | Desfase medio (háb.) | Retraso medio vs mejor | Veces la más al día |
|---|---|---|---|---|---|---|
| fondo | FT | 88 | 100% | 1.7 | 0.0 | 86 |
| fondo | Yahoo | 88 | 100% | 2.0 | 0.2 | 66 |
| fondo | finanzen.at | 11 | 0% | — | — | 0 |
| fondo | gestora | 33 | 67% | 2.1 | 0.0 | 22 |
| fondo | quefondos | 88 | 88% | 2.5 | 0.8 | 27 |
| indice | Yahoo | 77 | 86% | 0.5 | 0.0 | 66 |
| plan | Yahoo | 11 | 100% | 2.4 | 0.0 | 11 |
| plan | quefondos | 11 | 100% | 2.9 | 0.5 | 7 |
