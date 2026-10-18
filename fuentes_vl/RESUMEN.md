# Comparativa de fuentes de VL e índices

Generado automáticamente por `fuentes_vl/comparar_fuentes.py` (GitHub Actions, 09:15 y 22:40 aprox.).
Desfase = días hábiles (lunes a viernes) entre la captura y la fecha real del dato. Retraso = días hábiles que una fuente va por detrás de la más al día para ese mismo fondo o índice.

## Última captura: 2026-10-19 00:34

| Tipo | Instrumento | Fuente | Precio | Fecha del dato | Desfase (háb.) | Retraso vs mejor | Estado |
|---|---|---|---|---|---|---|---|
| fondo | cobas-seleccion | Yahoo | 296.971 | 2026-10-15 | 2 | 0 | OK |
| fondo | cobas-seleccion | FT | 296.97 | 2026-10-15 | 2 | 0 | OK (2 decimales) |
| fondo | cobas-seleccion | quefondos | 296.971 | 2026-10-15 | 2 | 0 | OK |
| fondo | cobas-seleccion | gestora |  | 2026-10-15 | 2 | 0 | OK (gestora, solo fecha) |
| fondo | horos-value-internacional | Yahoo | 210.315 | 2026-10-15 | 2 | 0 | OK |
| fondo | horos-value-internacional | FT | 210.32 | 2026-10-15 | 2 | 0 | OK (2 decimales) |
| fondo | horos-value-internacional | quefondos | 210.315 | 2026-10-15 | 2 | 0 | OK |
| fondo | horos-value-internacional | gestora |  | — |  |  | formato no reconocido |
| fondo | ishares-developed-world | Yahoo | 12.557 | 2026-10-15 | 2 | 0 | OK |
| fondo | ishares-developed-world | FT | 12.56 | 2026-10-15 | 2 | 0 | OK (2 decimales) |
| fondo | ishares-developed-world | quefondos | 12.557 | 2026-10-15 | 2 | 0 | OK |
| fondo | ishares-emerging-markets | Yahoo | 13.548 | 2026-10-15 | 2 | 0 | OK |
| fondo | ishares-emerging-markets | FT | 13.55 | 2026-10-15 | 2 | 0 | OK (2 decimales) |
| fondo | ishares-emerging-markets | quefondos |  | — |  |  | formato no reconocido |
| fondo | myinvestor-value | Yahoo | 1.31912 | 2026-10-15 | 2 | 0 | OK |
| fondo | myinvestor-value | FT | 1.32 | 2026-10-15 | 2 | 0 | OK (2 decimales) |
| fondo | myinvestor-value | quefondos | 1.31912 | 2026-10-15 | 2 | 0 | OK |
| fondo | numantia | Yahoo | 28.2809 | 2026-10-14 | 3 | 0 | OK |
| fondo | numantia | FT | 28.28 | 2026-10-14 | 3 | 0 | OK (2 decimales) |
| fondo | numantia | quefondos | 28.2809 | 2026-10-14 | 3 | 0 | OK |
| fondo | numantia | gestora | 28.28 | 2026-10-14 | 3 | 0 | OK (gestora) |
| fondo | pictet-china | Yahoo | 128.02 | 2026-10-15 | 2 | 0 | OK |
| fondo | pictet-china | FT | 128.02 | 2026-10-15 | 2 | 0 | OK (2 decimales) |
| fondo | pictet-china | quefondos | 130.85 | 2026-10-14 | 3 | 1 | OK |
| fondo | pictet-china | finanzen.at |  | — |  |  | HTTP 403 |
| fondo | polar-capital | Yahoo | 38.74 | 2026-10-15 | 2 | 0 | OK |
| fondo | polar-capital | FT | 38.74 | 2026-10-15 | 2 | 0 | OK (2 decimales) |
| fondo | polar-capital | quefondos | 38.74 | 2026-10-15 | 2 | 0 | OK |
| plan | plan-myinvestor-indexado-global | Yahoo | 20.3286 | 2026-10-15 | 2 | 0 | OK |
| plan | plan-myinvestor-indexado-global | quefondos | 20.3286 | 2026-10-15 | 2 | 0 | OK |
| indice | msci-world-nr-eur | Yahoo |  | — |  |  | HTTP 404 |
| indice | msci-acwi-nr-eur | Yahoo | 523.64 | 2026-10-18 | 1 | 0 | OK |
| indice | msci-em-nr-eur | Yahoo | 750.45 | 2026-10-18 | 1 | 0 | OK |
| indice | msci-em-nr-eur-alt | Yahoo | 750.45 | 2026-10-18 | 1 | 0 | OK |
| indice | msci-europe-nr-eur | Yahoo | 447.32 | 2026-10-18 | 1 | 0 | OK |
| indice | msci-china-nr-eur | Yahoo | 478.67 | 2026-10-18 | 1 | 0 | OK |
| indice | dj-global-technology | Yahoo | 5304.02 | 2026-10-18 | 1 | 0 | OK |

## Avisos

- **numantia**: incluso la fuente más al día va 3 días hábiles atrasada.
- **msci-world-nr-eur**: ninguna fuente ha dado dato en esta captura.
- horos-value-internacional: gestora lleva 3 capturas seguidas sin dato (fuente caída o formato cambiado).
- ishares-emerging-markets: quefondos lleva 3 capturas seguidas sin dato (fuente caída o formato cambiado).
- msci-world-nr-eur: Yahoo lleva 3 capturas seguidas sin dato (fuente caída o formato cambiado).
- pictet-china: finanzen.at lleva 3 capturas seguidas sin dato (fuente caída o formato cambiado).

## Últimos 14 días, por fuente

| Tipo | Fuente | Capturas | Con dato | Desfase medio (háb.) | Retraso medio vs mejor | Veces la más al día |
|---|---|---|---|---|---|---|
| fondo | FT | 24 | 100% | 1.5 | 0.0 | 24 |
| fondo | Yahoo | 24 | 100% | 1.5 | 0.0 | 24 |
| fondo | finanzen.at | 3 | 0% | — | — | 0 |
| fondo | gestora | 9 | 67% | 1.8 | 0.0 | 6 |
| fondo | quefondos | 24 | 88% | 1.6 | 0.1 | 18 |
| indice | Yahoo | 21 | 86% | 0.3 | 0.0 | 18 |
| plan | Yahoo | 3 | 100% | 1.3 | 0.0 | 3 |
| plan | quefondos | 3 | 100% | 1.3 | 0.0 | 3 |
