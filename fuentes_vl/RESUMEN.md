# Comparativa de fuentes de VL e índices

Generado automáticamente por `fuentes_vl/comparar_fuentes.py` (GitHub Actions, 09:15 y 22:40 aprox.).
Desfase = días hábiles (lunes a viernes) entre la captura y la fecha real del dato. Retraso = días hábiles que una fuente va por detrás de la más al día para ese mismo fondo o índice.

## Última captura: 2026-10-24 01:26

| Tipo | Instrumento | Fuente | Precio | Fecha del dato | Desfase (háb.) | Retraso vs mejor | Estado |
|---|---|---|---|---|---|---|---|
| fondo | cobas-seleccion | Yahoo | 296.198 | 2026-10-22 | 1 | 0 | OK |
| fondo | cobas-seleccion | FT | 296.2 | 2026-10-22 | 1 | 0 | OK (2 decimales) |
| fondo | cobas-seleccion | quefondos | 299.787 | 2026-10-21 | 2 | 1 | OK |
| fondo | cobas-seleccion | gestora |  | 2026-10-22 | 1 | 0 | OK (gestora, solo fecha) |
| fondo | horos-value-internacional | Yahoo | 210.805 | 2026-10-22 | 1 | 0 | OK |
| fondo | horos-value-internacional | FT | 210.81 | 2026-10-22 | 1 | 0 | OK (2 decimales) |
| fondo | horos-value-internacional | quefondos | 211.895 | 2026-10-20 | 3 | 2 | OK |
| fondo | horos-value-internacional | gestora |  | — |  |  | formato no reconocido |
| fondo | ishares-developed-world | Yahoo | 12.465 | 2026-10-22 | 1 | 0 | OK |
| fondo | ishares-developed-world | FT | 12.47 | 2026-10-22 | 1 | 0 | OK (2 decimales) |
| fondo | ishares-developed-world | quefondos | 12.583 | 2026-10-21 | 2 | 1 | OK |
| fondo | ishares-emerging-markets | Yahoo | 13.287 | 2026-10-22 | 1 | 0 | OK |
| fondo | ishares-emerging-markets | FT | 13.29 | 2026-10-22 | 1 | 0 | OK (2 decimales) |
| fondo | ishares-emerging-markets | quefondos |  | — |  |  | formato no reconocido |
| fondo | myinvestor-value | Yahoo | 1.31774 | 2026-10-22 | 1 | 0 | OK |
| fondo | myinvestor-value | FT | 1.32 | 2026-10-22 | 1 | 0 | OK (2 decimales) |
| fondo | myinvestor-value | quefondos | 1.33625 | 2026-10-21 | 2 | 1 | OK |
| fondo | numantia | Yahoo | 29.0061 | 2026-10-21 | 2 | 0 | OK |
| fondo | numantia | FT | 29.01 | 2026-10-21 | 2 | 0 | OK (2 decimales) |
| fondo | numantia | quefondos | 28.8148 | 2026-10-20 | 3 | 1 | OK |
| fondo | numantia | gestora | 29.01 | 2026-10-21 | 2 | 0 | OK (gestora) |
| fondo | pictet-china | Yahoo | 121.39 | 2026-10-22 | 1 | 0 | OK |
| fondo | pictet-china | FT | 121.39 | 2026-10-22 | 1 | 0 | OK (2 decimales) |
| fondo | pictet-china | quefondos | 126.42 | 2026-10-20 | 3 | 2 | OK |
| fondo | pictet-china | finanzen.at |  | — |  |  | HTTP 403 |
| fondo | polar-capital | Yahoo | 36.54 | 2026-10-22 | 1 | 0 | OK |
| fondo | polar-capital | FT | 36.54 | 2026-10-22 | 1 | 0 | OK (2 decimales) |
| fondo | polar-capital | quefondos | 38.38 | 2026-10-21 | 2 | 1 | OK |
| plan | plan-myinvestor-indexado-global | Yahoo | 20.2627 | 2026-10-20 | 3 | 0 | OK |
| plan | plan-myinvestor-indexado-global | quefondos | 20.2627 | 2026-10-20 | 3 | 0 | OK |
| indice | msci-world-nr-eur | Yahoo |  | — |  |  | HTTP 404 |
| indice | msci-acwi-nr-eur | Yahoo | 521.24 | 2026-10-23 | 0 | 0 | OK |
| indice | msci-em-nr-eur | Yahoo | 734.01 | 2026-10-23 | 0 | 0 | OK |
| indice | msci-em-nr-eur-alt | Yahoo | 734.01 | 2026-10-23 | 0 | 0 | OK |
| indice | msci-europe-nr-eur | Yahoo | 441.72 | 2026-10-23 | 0 | 0 | OK |
| indice | msci-china-nr-eur | Yahoo | 459.19 | 2026-10-23 | 0 | 0 | OK |
| indice | dj-global-technology | Yahoo | 5230.05 | 2026-10-23 | 0 | 0 | OK |

## Avisos

- horos-value-internacional: quefondos va 2 días hábiles por detrás de la mejor fuente.
- pictet-china: quefondos va 2 días hábiles por detrás de la mejor fuente.
- **plan-myinvestor-indexado-global**: incluso la fuente más al día va 3 días hábiles atrasada.
- **msci-world-nr-eur**: ninguna fuente ha dado dato en esta captura.
- horos-value-internacional: gestora lleva 13 capturas seguidas sin dato (fuente caída o formato cambiado).
- ishares-emerging-markets: quefondos lleva 13 capturas seguidas sin dato (fuente caída o formato cambiado).
- msci-world-nr-eur: Yahoo lleva 13 capturas seguidas sin dato (fuente caída o formato cambiado).
- pictet-china: finanzen.at lleva 13 capturas seguidas sin dato (fuente caída o formato cambiado).

## Últimos 14 días, por fuente

| Tipo | Fuente | Capturas | Con dato | Desfase medio (háb.) | Retraso medio vs mejor | Veces la más al día |
|---|---|---|---|---|---|---|
| fondo | FT | 104 | 100% | 1.7 | 0.0 | 100 |
| fondo | Yahoo | 104 | 100% | 1.9 | 0.3 | 76 |
| fondo | finanzen.at | 13 | 0% | — | — | 0 |
| fondo | gestora | 39 | 67% | 2.1 | 0.0 | 26 |
| fondo | quefondos | 104 | 88% | 2.5 | 0.8 | 29 |
| indice | Yahoo | 91 | 86% | 0.4 | 0.0 | 78 |
| plan | Yahoo | 13 | 100% | 2.5 | 0.0 | 13 |
| plan | quefondos | 13 | 100% | 2.9 | 0.5 | 9 |
