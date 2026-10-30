# Comparativa de fuentes de VL e índices

Generado automáticamente por `fuentes_vl/comparar_fuentes.py` (GitHub Actions, 09:15 y 22:40 aprox.).
Desfase = días hábiles (lunes a viernes) entre la captura y la fecha real del dato. Retraso = días hábiles que una fuente va por detrás de la más al día para ese mismo fondo o índice.

## Última captura: 2026-10-30 01:16

| Tipo | Instrumento | Fuente | Precio | Fecha del dato | Desfase (háb.) | Retraso vs mejor | Estado |
|---|---|---|---|---|---|---|---|
| fondo | ishares-developed-world | Yahoo | 12.638 | 2026-10-28 | 2 | 0 | OK |
| fondo | ishares-developed-world | FT | 12.64 | 2026-10-28 | 2 | 0 | OK (2 decimales) |
| fondo | ishares-developed-world | quefondos | 12.608 | 2026-10-27 | 3 | 1 | OK |
| fondo | ishares-emerging-markets | Yahoo | 13.642 | 2026-10-28 | 2 | 0 | OK |
| fondo | ishares-emerging-markets | FT | 13.64 | 2026-10-28 | 2 | 0 | OK (2 decimales) |
| fondo | horos-value-internacional | Yahoo | 212.022 | 2026-10-28 | 2 | 0 | OK |
| fondo | horos-value-internacional | FT | 212.02 | 2026-10-28 | 2 | 0 | OK (2 decimales) |
| fondo | horos-value-internacional | quefondos | 212.803 | 2026-10-27 | 3 | 1 | OK |
| fondo | horos-value-internacional | gestora | 212.02 | 2026-10-28 | 2 | 0 | OK (gestora) |
| fondo | myinvestor-value | Yahoo | 1.321 | 2026-10-28 | 2 | 0 | OK |
| fondo | myinvestor-value | FT | 1.32 | 2026-10-28 | 2 | 0 | OK (2 decimales) |
| fondo | myinvestor-value | quefondos | 1.32638 | 2026-10-27 | 3 | 1 | OK |
| fondo | numantia | Yahoo | 29.6127 | 2026-10-27 | 3 | 0 | OK |
| fondo | numantia | FT | 29.61 | 2026-10-27 | 3 | 0 | OK (2 decimales) |
| fondo | numantia | quefondos | 29.5562 | 2026-10-26 | 4 | 1 | OK |
| fondo | numantia | gestora | 29.61 | 2026-10-27 | 3 | 0 | OK (gestora) |
| fondo | polar-capital | Yahoo | 38.67 | 2026-10-28 | 2 | 0 | OK |
| fondo | polar-capital | FT | 38.67 | 2026-10-28 | 2 | 0 | OK (2 decimales) |
| fondo | polar-capital | quefondos | 37.86 | 2026-10-27 | 3 | 1 | OK |
| fondo | pictet-china | Yahoo | 123.47 | 2026-10-28 | 2 | 0 | OK |
| fondo | pictet-china | FT | 123.47 | 2026-10-28 | 2 | 0 | OK (2 decimales) |
| fondo | pictet-china | quefondos | 123.15 | 2026-10-26 | 4 | 2 | OK |
| fondo | pictet-china | Renta 4 | 123.47 | 2026-10-28 | 2 | 0 | OK (gestora) |
| fondo | cobas-seleccion | Yahoo | 299.914 | 2026-10-28 | 2 | 0 | OK |
| fondo | cobas-seleccion | FT | 299.91 | 2026-10-28 | 2 | 0 | OK (2 decimales) |
| fondo | cobas-seleccion | quefondos | 299.428 | 2026-10-27 | 3 | 1 | OK |
| fondo | cobas-seleccion | gestora | 299.914 | 2026-10-28 | 2 | 0 | OK (gestora) |
| plan | plan-myinvestor-indexado-global | Yahoo | 20.4171 | 2026-10-27 | 3 | 0 | OK |
| plan | plan-myinvestor-indexado-global | quefondos | 20.4171 | 2026-10-27 | 3 | 0 | OK |
| indice | msci-world-nr-usd | Yahoo | 15995.6 | 2026-10-29 | 1 | 0 | OK |
| indice | msci-acwi-nr-eur | Yahoo | 528.19 | 2026-10-29 | 1 | 0 | OK |
| indice | msci-em-nr-eur | Yahoo | 735.73 | 2026-10-29 | 1 | 0 | OK |
| indice | msci-em-nr-eur-alt | Yahoo | 735.66 | 2026-10-29 | 1 | 0 | OK |
| indice | msci-europe-nr-eur | Yahoo | 450.65 | 2026-10-29 | 1 | 0 | OK |
| indice | msci-china-nr-eur | Yahoo | 455.94 | 2026-10-29 | 1 | 0 | OK |
| indice | dj-global-technology | Yahoo | 5291.45 | 2026-10-29 | 1 | 0 | OK |

## Avisos

- **numantia**: incluso la fuente más al día va 3 días hábiles atrasada.
- pictet-china: quefondos va 2 días hábiles por detrás de la mejor fuente.
- **plan-myinvestor-indexado-global**: incluso la fuente más al día va 3 días hábiles atrasada.

## Últimos 14 días, por fuente

| Tipo | Fuente | Capturas | Con dato | Desfase medio (háb.) | Retraso medio vs mejor | Veces la más al día |
|---|---|---|---|---|---|---|
| fondo | FT | 208 | 100% | 1.7 | 0.0 | 200 |
| fondo | Renta 4 | 11 | 100% | 2.0 | 0.5 | 5 |
| fondo | Yahoo | 208 | 100% | 1.9 | 0.2 | 160 |
| fondo | finanzen.at | 15 | 0% | — | — | 0 |
| fondo | gestora | 78 | 79% | 2.0 | 0.0 | 60 |
| fondo | quefondos | 197 | 92% | 2.4 | 0.7 | 72 |
| indice | Yahoo | 182 | 92% | 0.3 | 0.0 | 168 |
| plan | Yahoo | 26 | 100% | 2.2 | 0.0 | 26 |
| plan | quefondos | 26 | 100% | 2.8 | 0.6 | 13 |
