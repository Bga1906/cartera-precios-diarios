# Comparativa de fuentes de VL e índices

Generado automáticamente por `fuentes_vl/comparar_fuentes.py` (GitHub Actions, 09:15 y 22:40 aprox.).
Desfase = días hábiles (lunes a viernes) entre la captura y la fecha real del dato. Retraso = días hábiles que una fuente va por detrás de la más al día para ese mismo fondo o índice.

## Última captura: 2026-10-19 16:39

| Tipo | Instrumento | Fuente | Precio | Fecha del dato | Desfase (háb.) | Retraso vs mejor | Estado |
|---|---|---|---|---|---|---|---|
| fondo | cobas-seleccion | Yahoo | 296.971 | 2026-10-15 | 2 | 1 | OK |
| fondo | cobas-seleccion | FT | 300.35 | 2026-10-16 | 1 | 0 | OK (2 decimales) |
| fondo | cobas-seleccion | quefondos | 296.971 | 2026-10-15 | 2 | 1 | OK |
| fondo | cobas-seleccion | gestora | 1.14 | 2026-10-16 | 1 | 0 | OK (gestora) |
| fondo | horos-value-internacional | Yahoo | 210.315 | 2026-10-15 | 2 | 1 | OK |
| fondo | horos-value-internacional | FT | 212.13 | 2026-10-16 | 1 | 0 | OK (2 decimales) |
| fondo | horos-value-internacional | quefondos | 210.315 | 2026-10-15 | 2 | 1 | OK |
| fondo | horos-value-internacional | gestora |  | — |  |  | formato no reconocido |
| fondo | ishares-developed-world | Yahoo | 12.557 | 2026-10-15 | 2 | 1 | OK |
| fondo | ishares-developed-world | FT | 12.44 | 2026-10-16 | 1 | 0 | OK (2 decimales) |
| fondo | ishares-developed-world | quefondos | 12.557 | 2026-10-15 | 2 | 1 | OK |
| fondo | ishares-emerging-markets | Yahoo | 13.548 | 2026-10-15 | 2 | 1 | OK |
| fondo | ishares-emerging-markets | FT | 13.59 | 2026-10-16 | 1 | 0 | OK (2 decimales) |
| fondo | ishares-emerging-markets | quefondos |  | — |  |  | formato no reconocido |
| fondo | myinvestor-value | Yahoo | 1.31912 | 2026-10-15 | 2 | 1 | OK |
| fondo | myinvestor-value | FT | 1.34 | 2026-10-16 | 1 | 0 | OK (2 decimales) |
| fondo | myinvestor-value | quefondos | 1.31912 | 2026-10-15 | 2 | 1 | OK |
| fondo | numantia | Yahoo | 28.2809 | 2026-10-14 | 3 | 1 | OK |
| fondo | numantia | FT | 28.56 | 2026-10-15 | 2 | 0 | OK (2 decimales) |
| fondo | numantia | quefondos | 28.2809 | 2026-10-14 | 3 | 1 | OK |
| fondo | numantia | gestora | 28.56 | 2026-10-15 | 2 | 0 | OK (gestora) |
| fondo | pictet-china | Yahoo | 128.02 | 2026-10-15 | 2 | 1 | OK |
| fondo | pictet-china | FT | 127.89 | 2026-10-16 | 1 | 0 | OK (2 decimales) |
| fondo | pictet-china | quefondos | 130.85 | 2026-10-14 | 3 | 2 | OK |
| fondo | pictet-china | finanzen.at |  | — |  |  | HTTP 403 |
| fondo | polar-capital | Yahoo | 38.74 | 2026-10-15 | 2 | 1 | OK |
| fondo | polar-capital | FT | 37.66 | 2026-10-16 | 1 | 0 | OK (2 decimales) |
| fondo | polar-capital | quefondos | 38.74 | 2026-10-15 | 2 | 1 | OK |
| plan | plan-myinvestor-indexado-global | Yahoo | 20.3286 | 2026-10-15 | 2 | 0 | OK |
| plan | plan-myinvestor-indexado-global | quefondos | 20.3286 | 2026-10-15 | 2 | 0 | OK |
| indice | msci-world-nr-eur | Yahoo |  | — |  |  | HTTP 404 |
| indice | msci-acwi-nr-eur | Yahoo | 526.09 | 2026-10-19 | 0 | 0 | OK |
| indice | msci-em-nr-eur | Yahoo | 752.38 | 2026-10-19 | 0 | 0 | OK |
| indice | msci-em-nr-eur-alt | Yahoo | 752.62 | 2026-10-19 | 0 | 0 | OK |
| indice | msci-europe-nr-eur | Yahoo | 442.45 | 2026-10-19 | 0 | 0 | OK |
| indice | msci-china-nr-eur | Yahoo | 480.48 | 2026-10-19 | 0 | 0 | OK |
| indice | dj-global-technology | Yahoo | 5358.19 | 2026-10-19 | 0 | 0 | OK |

## Avisos

- pictet-china: quefondos va 2 días hábiles por detrás de la mejor fuente.
- **msci-world-nr-eur**: ninguna fuente ha dado dato en esta captura.
- Diferencia de precio: cobas-seleccion (2026-10-16): FT 300.35 frente a gestora 1.14 (99.62%)
- horos-value-internacional: gestora lleva 4 capturas seguidas sin dato (fuente caída o formato cambiado).
- ishares-emerging-markets: quefondos lleva 4 capturas seguidas sin dato (fuente caída o formato cambiado).
- msci-world-nr-eur: Yahoo lleva 4 capturas seguidas sin dato (fuente caída o formato cambiado).
- pictet-china: finanzen.at lleva 4 capturas seguidas sin dato (fuente caída o formato cambiado).

## Últimos 14 días, por fuente

| Tipo | Fuente | Capturas | Con dato | Desfase medio (háb.) | Retraso medio vs mejor | Veces la más al día |
|---|---|---|---|---|---|---|
| fondo | FT | 32 | 100% | 1.4 | 0.0 | 32 |
| fondo | Yahoo | 32 | 100% | 1.6 | 0.2 | 24 |
| fondo | finanzen.at | 4 | 0% | — | — | 0 |
| fondo | gestora | 12 | 67% | 1.8 | 0.0 | 8 |
| fondo | quefondos | 32 | 88% | 1.8 | 0.4 | 18 |
| indice | Yahoo | 28 | 86% | 0.2 | 0.0 | 24 |
| plan | Yahoo | 4 | 100% | 1.5 | 0.0 | 4 |
| plan | quefondos | 4 | 100% | 1.5 | 0.0 | 4 |
