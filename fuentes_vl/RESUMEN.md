# Comparativa de fuentes de VL e índices

Generado automáticamente por `fuentes_vl/comparar_fuentes.py` (GitHub Actions, 09:15 y 22:40 aprox.).
Desfase = días hábiles (lunes a viernes) entre la captura y la fecha real del dato. Retraso = días hábiles que una fuente va por detrás de la más al día para ese mismo fondo o índice.

## Última captura: 2026-11-06 02:05

| Tipo | Instrumento | Fuente | Precio | Fecha del dato | Desfase (háb.) | Retraso vs mejor | Estado |
|---|---|---|---|---|---|---|---|
| fondo | ishares-developed-world | Yahoo | 12.494 | 2026-11-04 | 2 | 0 | OK |
| fondo | ishares-developed-world | FT | 12.49 | 2026-11-04 | 2 | 0 | OK (2 decimales) |
| fondo | ishares-developed-world | quefondos | 12.357 | 2026-11-03 | 3 | 1 | OK |
| fondo | ishares-emerging-markets | Yahoo | 13.093 | 2026-11-04 | 2 | 0 | OK |
| fondo | ishares-emerging-markets | FT | 13.09 | 2026-11-04 | 2 | 0 | OK (2 decimales) |
| fondo | horos-value-internacional | Yahoo | 217.239 | 2026-11-04 | 2 | 0 | OK |
| fondo | horos-value-internacional | FT | 217.24 | 2026-11-04 | 2 | 0 | OK (2 decimales) |
| fondo | horos-value-internacional | quefondos | 212.184 | 2026-11-03 | 3 | 1 | OK |
| fondo | horos-value-internacional | gestora | 217.24 | 2026-11-04 | 2 | 0 | OK (gestora) |
| fondo | myinvestor-value | Yahoo | 1.36478 | 2026-11-04 | 2 | 0 | OK |
| fondo | myinvestor-value | FT | 1.36 | 2026-11-04 | 2 | 0 | OK (2 decimales) |
| fondo | myinvestor-value | quefondos | 1.33488 | 2026-11-03 | 3 | 1 | OK |
| fondo | numantia | Yahoo | 29.9969 | 2026-11-03 | 3 | 0 | OK |
| fondo | numantia | FT | 30 | 2026-11-03 | 3 | 0 | OK (2 decimales) |
| fondo | numantia | quefondos | 30.4304 | 2026-11-02 | 4 | 1 | OK |
| fondo | numantia | gestora | 30 | 2026-11-03 | 3 | 0 | OK (gestora) |
| fondo | polar-capital | Yahoo | 34.08 | 2026-11-04 | 2 | 0 | OK |
| fondo | polar-capital | FT | 34.08 | 2026-11-04 | 2 | 0 | OK (2 decimales) |
| fondo | polar-capital | quefondos | 34.89 | 2026-11-03 | 3 | 1 | OK |
| fondo | pictet-china | Yahoo | 125.87 | 2026-11-04 | 2 | 0 | OK |
| fondo | pictet-china | FT | 125.87 | 2026-11-04 | 2 | 0 | OK (2 decimales) |
| fondo | pictet-china | quefondos | 123.55 | 2026-11-02 | 4 | 2 | OK |
| fondo | pictet-china | Renta 4 | 125.87 | 2026-11-04 | 2 | 0 | OK (gestora) |
| fondo | cobas-seleccion | Yahoo | 300.717 | 2026-11-04 | 2 | 0 | OK |
| fondo | cobas-seleccion | FT | 300.72 | 2026-11-04 | 2 | 0 | OK (2 decimales) |
| fondo | cobas-seleccion | quefondos | 299.554 | 2026-10-30 | 5 | 3 | OK |
| fondo | cobas-seleccion | gestora | 300.717 | 2026-11-04 | 2 | 0 | OK (gestora) |
| plan | plan-myinvestor-indexado-global | Yahoo | 20.2438 | 2026-11-04 | 2 | 0 | OK |
| plan | plan-myinvestor-indexado-global | quefondos | 20.1486 | 2026-11-02 | 4 | 2 | OK |
| indice | msci-world-nr-usd | Yahoo | 15367.2 | 2026-11-05 | 1 | 0 | OK |
| indice | msci-acwi-nr-eur | Yahoo | 505.72 | 2026-11-05 | 1 | 0 | OK |
| indice | msci-em-nr-eur | Yahoo | 701.45 | 2026-11-05 | 1 | 0 | OK |
| indice | msci-em-nr-eur-alt | Yahoo | 701.37 | 2026-11-05 | 1 | 0 | OK |
| indice | msci-europe-nr-eur | Yahoo | 454.81 | 2026-11-05 | 1 | 0 | OK |
| indice | msci-china-nr-eur | Yahoo | 488.7 | 2026-11-05 | 1 | 0 | OK |
| indice | dj-global-technology | Yahoo | 4737.73 | 2026-11-05 | 1 | 0 | OK |

## Avisos

- **numantia**: incluso la fuente más al día va 3 días hábiles atrasada.
- pictet-china: quefondos va 2 días hábiles por detrás de la mejor fuente.
- cobas-seleccion: quefondos va 3 días hábiles por detrás de la mejor fuente.
- plan-myinvestor-indexado-global: quefondos va 2 días hábiles por detrás de la mejor fuente.

## Últimos 14 días, por fuente

| Tipo | Fuente | Capturas | Con dato | Desfase medio (háb.) | Retraso medio vs mejor | Veces la más al día |
|---|---|---|---|---|---|---|
| fondo | FT | 240 | 100% | 1.7 | 0.1 | 229 |
| fondo | Renta 4 | 25 | 100% | 2.1 | 0.5 | 12 |
| fondo | Yahoo | 240 | 100% | 1.9 | 0.2 | 183 |
| fondo | finanzen.at | 5 | 0% | — | — | 0 |
| fondo | gestora | 90 | 93% | 2.1 | 0.2 | 68 |
| fondo | quefondos | 215 | 98% | 2.4 | 0.8 | 76 |
| indice | Yahoo | 210 | 98% | 0.3 | 0.0 | 206 |
| plan | Yahoo | 30 | 100% | 2.0 | 0.0 | 30 |
| plan | quefondos | 30 | 100% | 2.7 | 0.7 | 13 |
