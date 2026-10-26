# Comparativa de fuentes de VL e índices

Generado automáticamente por `fuentes_vl/comparar_fuentes.py` (GitHub Actions, 09:15 y 22:40 aprox.).
Desfase = días hábiles (lunes a viernes) entre la captura y la fecha real del dato. Retraso = días hábiles que una fuente va por detrás de la más al día para ese mismo fondo o índice.

## Última captura: 2026-10-26 15:14

| Tipo | Instrumento | Fuente | Precio | Fecha del dato | Desfase (háb.) | Retraso vs mejor | Estado |
|---|---|---|---|---|---|---|---|
| fondo | ishares-developed-world | Yahoo | 12.465 | 2026-10-22 | 2 | 1 | OK |
| fondo | ishares-developed-world | FT | 12.41 | 2026-10-23 | 1 | 0 | OK (2 decimales) |
| fondo | ishares-developed-world | quefondos | 12.465 | 2026-10-22 | 2 | 1 | OK |
| fondo | ishares-emerging-markets | Yahoo | 13.287 | 2026-10-22 | 2 | 1 | OK |
| fondo | ishares-emerging-markets | FT | 13.3 | 2026-10-23 | 1 | 0 | OK (2 decimales) |
| fondo | horos-value-internacional | Yahoo | 210.805 | 2026-10-22 | 2 | 1 | OK |
| fondo | horos-value-internacional | FT | 210.94 | 2026-10-23 | 1 | 0 | OK (2 decimales) |
| fondo | horos-value-internacional | quefondos | 210.805 | 2026-10-22 | 2 | 1 | OK |
| fondo | horos-value-internacional | gestora | 210.81 | 2026-10-22 | 2 | 1 | OK (gestora) |
| fondo | myinvestor-value | Yahoo | 1.31774 | 2026-10-22 | 2 | 0 | OK |
| fondo | myinvestor-value | FT | 1.32 | 2026-10-22 | 2 | 0 | OK (2 decimales) |
| fondo | myinvestor-value | quefondos | 1.31774 | 2026-10-22 | 2 | 0 | OK |
| fondo | numantia | Yahoo | 29.0061 | 2026-10-21 | 3 | 0 | OK |
| fondo | numantia | FT | 29.01 | 2026-10-21 | 3 | 0 | OK (2 decimales) |
| fondo | numantia | quefondos | 29.0061 | 2026-10-21 | 3 | 0 | OK |
| fondo | numantia | gestora | 29.01 | 2026-10-21 | 3 | 0 | OK (gestora) |
| fondo | polar-capital | Yahoo | 36.54 | 2026-10-22 | 2 | 0 | OK |
| fondo | polar-capital | FT | 36.54 | 2026-10-22 | 2 | 0 | OK (2 decimales) |
| fondo | polar-capital | quefondos | 36.54 | 2026-10-22 | 2 | 0 | OK |
| fondo | pictet-china | Yahoo | 121.39 | 2026-10-22 | 2 | 1 | OK |
| fondo | pictet-china | FT | 122.69 | 2026-10-23 | 1 | 0 | OK (2 decimales) |
| fondo | pictet-china | quefondos | 125.04 | 2026-10-21 | 3 | 2 | OK |
| fondo | pictet-china | Renta 4 | 121.39 | 2026-10-22 | 2 | 1 | OK (gestora) |
| fondo | cobas-seleccion | Yahoo | 296.198 | 2026-10-22 | 2 | 1 | OK |
| fondo | cobas-seleccion | FT | 297.24 | 2026-10-23 | 1 | 0 | OK (2 decimales) |
| fondo | cobas-seleccion | quefondos | 296.198 | 2026-10-22 | 2 | 1 | OK |
| fondo | cobas-seleccion | gestora | 0.35 | 2026-10-23 | 1 | 0 | OK (gestora) |
| plan | plan-myinvestor-indexado-global | Yahoo | 20.1435 | 2026-10-22 | 2 | 0 | OK |
| plan | plan-myinvestor-indexado-global | quefondos | 20.3772 | 2026-10-21 | 3 | 1 | OK |
| indice | msci-world-nr-usd | Yahoo | 15869.8 | 2026-10-26 | 0 | 0 | OK |
| indice | msci-acwi-nr-eur | Yahoo | 524.52 | 2026-10-26 | 0 | 0 | OK |
| indice | msci-em-nr-eur | Yahoo | 733.98 | 2026-10-26 | 0 | 0 | OK |
| indice | msci-em-nr-eur-alt | Yahoo | 733.99 | 2026-10-26 | 0 | 0 | OK |
| indice | msci-europe-nr-eur | Yahoo | 444.86 | 2026-10-26 | 0 | 0 | OK |
| indice | msci-china-nr-eur | Yahoo | 460.9 | 2026-10-26 | 0 | 0 | OK |
| indice | dj-global-technology | Yahoo | 5241.74 | 2026-10-26 | 0 | 0 | OK |

## Avisos

- **numantia**: incluso la fuente más al día va 3 días hábiles atrasada.
- pictet-china: quefondos va 2 días hábiles por detrás de la mejor fuente.
- Diferencia de precio: cobas-seleccion (2026-10-23): FT 297.24 frente a gestora 0.35 (99.88%)

## Últimos 14 días, por fuente

| Tipo | Fuente | Capturas | Con dato | Desfase medio (háb.) | Retraso medio vs mejor | Veces la más al día |
|---|---|---|---|---|---|---|
| fondo | FT | 152 | 100% | 1.5 | 0.0 | 148 |
| fondo | Renta 4 | 4 | 100% | 2.0 | 1.0 | 0 |
| fondo | Yahoo | 152 | 100% | 1.7 | 0.2 | 119 |
| fondo | finanzen.at | 15 | 0% | — | — | 0 |
| fondo | gestora | 57 | 72% | 1.9 | 0.0 | 40 |
| fondo | quefondos | 148 | 90% | 2.2 | 0.6 | 62 |
| indice | Yahoo | 133 | 89% | 0.3 | 0.0 | 119 |
| plan | Yahoo | 19 | 100% | 2.1 | 0.0 | 19 |
| plan | quefondos | 19 | 100% | 2.7 | 0.6 | 9 |
