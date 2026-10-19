# Comparativa de fuentes de VL e índices

Generado automáticamente por `fuentes_vl/comparar_fuentes.py` (GitHub Actions, 09:15 y 22:40 aprox.).
Desfase = días hábiles (lunes a viernes) entre la captura y la fecha real del dato. Retraso = días hábiles que una fuente va por detrás de la más al día para ese mismo fondo o índice.

## Última captura: 2026-10-20 01:54

| Tipo | Instrumento | Fuente | Precio | Fecha del dato | Desfase (háb.) | Retraso vs mejor | Estado |
|---|---|---|---|---|---|---|---|
| fondo | cobas-seleccion | Yahoo | 300.346 | 2026-10-16 | 2 | 0 | OK |
| fondo | cobas-seleccion | FT | 300.35 | 2026-10-16 | 2 | 0 | OK (2 decimales) |
| fondo | cobas-seleccion | quefondos | 296.971 | 2026-10-15 | 3 | 1 | OK |
| fondo | cobas-seleccion | gestora | 1.14 | 2026-10-16 | 2 | 0 | OK (gestora) |
| fondo | horos-value-internacional | Yahoo | 212.13 | 2026-10-16 | 2 | 0 | OK |
| fondo | horos-value-internacional | FT | 212.13 | 2026-10-16 | 2 | 0 | OK (2 decimales) |
| fondo | horos-value-internacional | quefondos | 210.315 | 2026-10-15 | 3 | 1 | OK |
| fondo | horos-value-internacional | gestora |  | — |  |  | formato no reconocido |
| fondo | ishares-developed-world | Yahoo | 12.436 | 2026-10-16 | 2 | 0 | OK |
| fondo | ishares-developed-world | FT | 12.44 | 2026-10-16 | 2 | 0 | OK (2 decimales) |
| fondo | ishares-developed-world | quefondos | 12.557 | 2026-10-15 | 3 | 1 | OK |
| fondo | ishares-emerging-markets | Yahoo | 13.593 | 2026-10-16 | 2 | 0 | OK |
| fondo | ishares-emerging-markets | FT | 13.59 | 2026-10-16 | 2 | 0 | OK (2 decimales) |
| fondo | ishares-emerging-markets | quefondos |  | — |  |  | formato no reconocido |
| fondo | myinvestor-value | Yahoo | 1.33702 | 2026-10-16 | 2 | 0 | OK |
| fondo | myinvestor-value | FT | 1.34 | 2026-10-16 | 2 | 0 | OK (2 decimales) |
| fondo | myinvestor-value | quefondos | 1.31912 | 2026-10-15 | 3 | 1 | OK |
| fondo | numantia | Yahoo | 28.5553 | 2026-10-15 | 3 | 0 | OK |
| fondo | numantia | FT | 28.56 | 2026-10-15 | 3 | 0 | OK (2 decimales) |
| fondo | numantia | quefondos | 28.2809 | 2026-10-14 | 4 | 1 | OK |
| fondo | numantia | gestora | 28.56 | 2026-10-15 | 3 | 0 | OK (gestora) |
| fondo | pictet-china | Yahoo | 127.89 | 2026-10-16 | 2 | 0 | OK |
| fondo | pictet-china | FT | 127.89 | 2026-10-16 | 2 | 0 | OK (2 decimales) |
| fondo | pictet-china | quefondos | 130.85 | 2026-10-14 | 4 | 2 | OK |
| fondo | pictet-china | finanzen.at |  | — |  |  | HTTP 403 |
| fondo | polar-capital | Yahoo | 37.66 | 2026-10-16 | 2 | 0 | OK |
| fondo | polar-capital | FT | 37.66 | 2026-10-16 | 2 | 0 | OK (2 decimales) |
| fondo | polar-capital | quefondos | 38.74 | 2026-10-15 | 3 | 1 | OK |
| plan | plan-myinvestor-indexado-global | Yahoo | 20.3286 | 2026-10-15 | 3 | 0 | OK |
| plan | plan-myinvestor-indexado-global | quefondos | 20.3286 | 2026-10-15 | 3 | 0 | OK |
| indice | msci-world-nr-eur | Yahoo |  | — |  |  | HTTP 404 |
| indice | msci-acwi-nr-eur | Yahoo | 525.8 | 2026-10-19 | 1 | 0 | OK |
| indice | msci-em-nr-eur | Yahoo | 751.58 | 2026-10-19 | 1 | 0 | OK |
| indice | msci-em-nr-eur-alt | Yahoo | 751.58 | 2026-10-19 | 1 | 0 | OK |
| indice | msci-europe-nr-eur | Yahoo | 443.77 | 2026-10-19 | 1 | 0 | OK |
| indice | msci-china-nr-eur | Yahoo | 480.35 | 2026-10-19 | 1 | 0 | OK |
| indice | dj-global-technology | Yahoo | 5348.26 | 2026-10-19 | 1 | 0 | OK |

## Avisos

- **numantia**: incluso la fuente más al día va 3 días hábiles atrasada.
- pictet-china: quefondos va 2 días hábiles por detrás de la mejor fuente.
- **plan-myinvestor-indexado-global**: incluso la fuente más al día va 3 días hábiles atrasada.
- **msci-world-nr-eur**: ninguna fuente ha dado dato en esta captura.
- Diferencia de precio: cobas-seleccion (2026-10-16): Yahoo 300.346 frente a gestora 1.14 (99.62%)
- Diferencia de precio: cobas-seleccion (2026-10-16): FT 300.35 frente a gestora 1.14 (99.62%)
- horos-value-internacional: gestora lleva 5 capturas seguidas sin dato (fuente caída o formato cambiado).
- ishares-emerging-markets: quefondos lleva 5 capturas seguidas sin dato (fuente caída o formato cambiado).
- msci-world-nr-eur: Yahoo lleva 5 capturas seguidas sin dato (fuente caída o formato cambiado).
- pictet-china: finanzen.at lleva 5 capturas seguidas sin dato (fuente caída o formato cambiado).

## Últimos 14 días, por fuente

| Tipo | Fuente | Capturas | Con dato | Desfase medio (háb.) | Retraso medio vs mejor | Veces la más al día |
|---|---|---|---|---|---|---|
| fondo | FT | 40 | 100% | 1.5 | 0.0 | 40 |
| fondo | Yahoo | 40 | 100% | 1.7 | 0.2 | 32 |
| fondo | finanzen.at | 5 | 0% | — | — | 0 |
| fondo | gestora | 15 | 67% | 1.9 | 0.0 | 10 |
| fondo | quefondos | 40 | 88% | 2.1 | 0.5 | 18 |
| indice | Yahoo | 35 | 86% | 0.4 | 0.0 | 30 |
| plan | Yahoo | 5 | 100% | 1.8 | 0.0 | 5 |
| plan | quefondos | 5 | 100% | 1.8 | 0.0 | 5 |
