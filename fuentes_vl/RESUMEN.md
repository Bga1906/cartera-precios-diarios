# Comparativa de fuentes de VL e índices

Generado automáticamente por `fuentes_vl/comparar_fuentes.py` (GitHub Actions, 09:15 y 22:40 aprox.).
Desfase = días hábiles (lunes a viernes) entre la captura y la fecha real del dato. Retraso = días hábiles que una fuente va por detrás de la más al día para ese mismo fondo o índice.

## Última captura: 2026-10-22 14:57

| Tipo | Instrumento | Fuente | Precio | Fecha del dato | Desfase (háb.) | Retraso vs mejor | Estado |
|---|---|---|---|---|---|---|---|
| fondo | cobas-seleccion | Yahoo | 299.308 | 2026-10-20 | 2 | 1 | OK |
| fondo | cobas-seleccion | FT | 299.79 | 2026-10-21 | 1 | 0 | OK (2 decimales) |
| fondo | cobas-seleccion | quefondos | 299.308 | 2026-10-20 | 2 | 1 | OK |
| fondo | cobas-seleccion | gestora | 0.16 | 2026-10-21 | 1 | 0 | OK (gestora) |
| fondo | horos-value-internacional | Yahoo | 211.895 | 2026-10-20 | 2 | 0 | OK |
| fondo | horos-value-internacional | FT | 211.89 | 2026-10-20 | 2 | 0 | OK (2 decimales) |
| fondo | horos-value-internacional | quefondos | 211.895 | 2026-10-20 | 2 | 0 | OK |
| fondo | horos-value-internacional | gestora |  | — |  |  | formato no reconocido |
| fondo | ishares-developed-world | Yahoo | 12.481 | 2026-10-20 | 2 | 1 | OK |
| fondo | ishares-developed-world | FT | 12.58 | 2026-10-21 | 1 | 0 | OK (2 decimales) |
| fondo | ishares-developed-world | quefondos | 12.481 | 2026-10-20 | 2 | 1 | OK |
| fondo | ishares-emerging-markets | Yahoo | 13.427 | 2026-10-20 | 2 | 1 | OK |
| fondo | ishares-emerging-markets | FT | 13.59 | 2026-10-21 | 1 | 0 | OK (2 decimales) |
| fondo | ishares-emerging-markets | quefondos |  | — |  |  | formato no reconocido |
| fondo | myinvestor-value | Yahoo | 1.33573 | 2026-10-20 | 2 | 0 | OK |
| fondo | myinvestor-value | FT | 1.34 | 2026-10-20 | 2 | 0 | OK (2 decimales) |
| fondo | myinvestor-value | quefondos | 1.33573 | 2026-10-20 | 2 | 0 | OK |
| fondo | numantia | Yahoo | 28.5547 | 2026-10-19 | 3 | 0 | OK |
| fondo | numantia | FT | 28.55 | 2026-10-19 | 3 | 0 | OK (2 decimales) |
| fondo | numantia | quefondos | 28.5547 | 2026-10-19 | 3 | 0 | OK |
| fondo | numantia | gestora | 28.55 | 2026-10-19 | 3 | 0 | OK (gestora) |
| fondo | pictet-china | Yahoo | 126.42 | 2026-10-20 | 2 | 0 | OK |
| fondo | pictet-china | FT | 126.42 | 2026-10-20 | 2 | 0 | OK (2 decimales) |
| fondo | pictet-china | quefondos | 127.89 | 2026-10-16 | 4 | 2 | OK |
| fondo | pictet-china | finanzen.at |  | — |  |  | HTTP 403 |
| fondo | polar-capital | Yahoo | 37.64 | 2026-10-20 | 2 | 1 | OK |
| fondo | polar-capital | FT | 38.38 | 2026-10-21 | 1 | 0 | OK (2 decimales) |
| fondo | polar-capital | quefondos | 37.64 | 2026-10-20 | 2 | 1 | OK |
| plan | plan-myinvestor-indexado-global | Yahoo | 20.2627 | 2026-10-20 | 2 | 0 | OK |
| plan | plan-myinvestor-indexado-global | quefondos | 20.2652 | 2026-10-16 | 4 | 2 | OK |
| indice | msci-world-nr-eur | Yahoo |  | — |  |  | HTTP 404 |
| indice | msci-acwi-nr-eur | Yahoo | 527.82 | 2026-10-22 | 0 | 0 | OK |
| indice | msci-em-nr-eur | Yahoo | 734.21 | 2026-10-22 | 0 | 0 | OK |
| indice | msci-em-nr-eur-alt | Yahoo | 734.21 | 2026-10-22 | 0 | 0 | OK |
| indice | msci-europe-nr-eur | Yahoo | 444.08 | 2026-10-22 | 0 | 0 | OK |
| indice | msci-china-nr-eur | Yahoo | 453.87 | 2026-10-22 | 0 | 0 | OK |
| indice | dj-global-technology | Yahoo | 5389.56 | 2026-10-22 | 0 | 0 | OK |

## Avisos

- **numantia**: incluso la fuente más al día va 3 días hábiles atrasada.
- pictet-china: quefondos va 2 días hábiles por detrás de la mejor fuente.
- plan-myinvestor-indexado-global: quefondos va 2 días hábiles por detrás de la mejor fuente.
- **msci-world-nr-eur**: ninguna fuente ha dado dato en esta captura.
- Diferencia de precio: cobas-seleccion (2026-10-21): FT 299.79 frente a gestora 0.16 (99.95%)
- horos-value-internacional: gestora lleva 10 capturas seguidas sin dato (fuente caída o formato cambiado).
- ishares-emerging-markets: quefondos lleva 10 capturas seguidas sin dato (fuente caída o formato cambiado).
- msci-world-nr-eur: Yahoo lleva 10 capturas seguidas sin dato (fuente caída o formato cambiado).
- pictet-china: finanzen.at lleva 10 capturas seguidas sin dato (fuente caída o formato cambiado).

## Últimos 14 días, por fuente

| Tipo | Fuente | Capturas | Con dato | Desfase medio (háb.) | Retraso medio vs mejor | Veces la más al día |
|---|---|---|---|---|---|---|
| fondo | FT | 80 | 100% | 1.7 | 0.0 | 79 |
| fondo | Yahoo | 80 | 100% | 1.9 | 0.3 | 59 |
| fondo | finanzen.at | 10 | 0% | — | — | 0 |
| fondo | gestora | 30 | 67% | 2.1 | 0.0 | 20 |
| fondo | quefondos | 80 | 88% | 2.4 | 0.7 | 27 |
| indice | Yahoo | 70 | 86% | 0.4 | 0.0 | 60 |
| plan | Yahoo | 10 | 100% | 2.3 | 0.0 | 10 |
| plan | quefondos | 10 | 100% | 2.7 | 0.4 | 7 |
