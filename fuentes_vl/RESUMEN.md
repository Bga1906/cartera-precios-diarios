# Comparativa de fuentes de VL e índices

Generado automáticamente por `fuentes_vl/comparar_fuentes.py` (GitHub Actions, 09:15 y 22:40 aprox.).
Desfase = días hábiles (lunes a viernes) entre la captura y la fecha real del dato. Retraso = días hábiles que una fuente va por detrás de la más al día para ese mismo fondo o índice.

## Última captura: 2026-11-10 03:53

| Tipo | Instrumento | Fuente | Precio | Fecha del dato | Desfase (háb.) | Retraso vs mejor | Estado |
|---|---|---|---|---|---|---|---|
| fondo | ishares-developed-world | Yahoo | 12.129 | 2026-11-06 | 2 | 0 | OK |
| fondo | ishares-developed-world | FT | 12.13 | 2026-11-06 | 2 | 0 | OK (2 decimales) |
| fondo | ishares-developed-world | quefondos | 12.093 | 2026-11-05 | 3 | 1 | OK |
| fondo | ishares-emerging-markets | Yahoo | 12.72 | 2026-11-06 | 2 | 0 | OK |
| fondo | ishares-emerging-markets | FT | 12.72 | 2026-11-06 | 2 | 0 | OK (2 decimales) |
| fondo | horos-value-internacional | Yahoo | 216.246 | 2026-11-05 | 3 | 0 | OK |
| fondo | horos-value-internacional | FT | 216.25 | 2026-11-05 | 3 | 0 | OK (2 decimales) |
| fondo | horos-value-internacional | quefondos | 216.246 | 2026-11-05 | 3 | 0 | OK |
| fondo | horos-value-internacional | gestora | 216.25 | 2026-11-05 | 3 | 0 | OK (gestora) |
| fondo | myinvestor-value | Yahoo | 1.35345 | 2026-11-06 | 2 | 0 | OK |
| fondo | myinvestor-value | FT | 1.35 | 2026-11-06 | 2 | 0 | OK (2 decimales) |
| fondo | myinvestor-value | quefondos | 1.35806 | 2026-11-05 | 3 | 1 | OK |
| fondo | numantia | Yahoo | 30.2403 | 2026-11-05 | 3 | 0 | OK |
| fondo | numantia | FT | 30.24 | 2026-11-05 | 3 | 0 | OK (2 decimales) |
| fondo | numantia | quefondos | 30.8109 | 2026-11-04 | 4 | 1 | OK |
| fondo | numantia | gestora | 30.81 | 2026-11-04 | 4 | 1 | OK (gestora) |
| fondo | polar-capital | Yahoo | 31.93 | 2026-11-06 | 2 | 0 | OK |
| fondo | polar-capital | FT | 31.93 | 2026-11-06 | 2 | 0 | OK (2 decimales) |
| fondo | polar-capital | quefondos | 31.46 | 2026-11-05 | 3 | 1 | OK |
| fondo | pictet-china | Yahoo | 129.35 | 2026-11-06 | 2 | 0 | OK |
| fondo | pictet-china | FT | 129.35 | 2026-11-06 | 2 | 0 | OK (2 decimales) |
| fondo | pictet-china | quefondos | 125.87 | 2026-11-04 | 4 | 2 | OK |
| fondo | pictet-china | Renta 4 | 130.54 | 2026-11-05 | 3 | 1 | OK (gestora) |
| fondo | cobas-seleccion | Yahoo | 299.603 | 2026-11-05 | 3 | 0 | OK |
| fondo | cobas-seleccion | FT | 299.6 | 2026-11-05 | 3 | 0 | OK (2 decimales) |
| fondo | cobas-seleccion | quefondos | 299.603 | 2026-11-05 | 3 | 0 | OK |
| fondo | cobas-seleccion | gestora | 299.603 | 2026-11-05 | 3 | 0 | OK (gestora) |
| plan | plan-myinvestor-indexado-global | Yahoo | 19.753 | 2026-11-06 | 2 | 0 | OK |
| plan | plan-myinvestor-indexado-global | quefondos | 19.7644 | 2026-11-05 | 3 | 1 | OK |
| indice | msci-world-nr-usd | Yahoo | 15734.5 | 2026-11-09 | 1 | 0 | OK |
| indice | msci-acwi-nr-eur | Yahoo | 517.88 | 2026-11-09 | 1 | 0 | OK |
| indice | msci-em-nr-eur | Yahoo | 719.66 | 2026-11-09 | 1 | 0 | OK |
| indice | msci-em-nr-eur-alt | Yahoo | 719.45 | 2026-11-09 | 1 | 0 | OK |
| indice | msci-europe-nr-eur | Yahoo | 456.23 | 2026-11-09 | 1 | 0 | OK |
| indice | msci-china-nr-eur | Yahoo | 480.54 | 2026-11-09 | 1 | 0 | OK |
| indice | dj-global-technology | Yahoo | 4877.54 | 2026-11-09 | 1 | 0 | OK |

## Avisos

- **horos-value-internacional**: incluso la fuente más al día va 3 días hábiles atrasada.
- **numantia**: incluso la fuente más al día va 3 días hábiles atrasada.
- pictet-china: quefondos va 2 días hábiles por detrás de la mejor fuente.
- **cobas-seleccion**: incluso la fuente más al día va 3 días hábiles atrasada.

## Últimos 14 días, por fuente

| Tipo | Fuente | Capturas | Con dato | Desfase medio (háb.) | Retraso medio vs mejor | Veces la más al día |
|---|---|---|---|---|---|---|
| fondo | FT | 232 | 100% | 1.7 | 0.0 | 222 |
| fondo | Renta 4 | 29 | 100% | 2.0 | 0.4 | 18 |
| fondo | Yahoo | 232 | 100% | 1.9 | 0.2 | 176 |
| fondo | gestora | 87 | 100% | 2.2 | 0.3 | 65 |
| fondo | quefondos | 203 | 100% | 2.5 | 0.8 | 71 |
| indice | Yahoo | 203 | 100% | 0.4 | 0.0 | 203 |
| plan | Yahoo | 29 | 100% | 1.9 | 0.0 | 29 |
| plan | quefondos | 29 | 100% | 2.5 | 0.6 | 16 |
