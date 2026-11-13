# Comparativa de fuentes de VL e índices

Generado automáticamente por `fuentes_vl/comparar_fuentes.py` (GitHub Actions, 09:15 y 22:40 aprox.).
Desfase = días hábiles (lunes a viernes) entre la captura y la fecha real del dato. Retraso = días hábiles que una fuente va por detrás de la más al día para ese mismo fondo o índice.

## Última captura: 2026-11-13 02:26

| Tipo | Instrumento | Fuente | Precio | Fecha del dato | Desfase (háb.) | Retraso vs mejor | Estado |
|---|---|---|---|---|---|---|---|
| fondo | ishares-developed-world | Yahoo | 12.561 | 2026-11-11 | 2 | 0 | OK |
| fondo | ishares-developed-world | FT | 12.56 | 2026-11-11 | 2 | 0 | OK (2 decimales) |
| fondo | ishares-developed-world | quefondos | 12.362 | 2026-11-10 | 3 | 1 | OK |
| fondo | ishares-emerging-markets | Yahoo | 13.408 | 2026-11-11 | 2 | 0 | OK |
| fondo | ishares-emerging-markets | FT | 13.41 | 2026-11-11 | 2 | 0 | OK (2 decimales) |
| fondo | horos-value-internacional | Yahoo | 219.922 | 2026-11-11 | 2 | 0 | OK |
| fondo | horos-value-internacional | FT | 219.92 | 2026-11-11 | 2 | 0 | OK (2 decimales) |
| fondo | horos-value-internacional | quefondos | 219.288 | 2026-11-10 | 3 | 1 | OK |
| fondo | horos-value-internacional | gestora | 219.92 | 2026-11-11 | 2 | 0 | OK (gestora) |
| fondo | myinvestor-value | Yahoo | 1.35449 | 2026-11-11 | 2 | 0 | OK |
| fondo | myinvestor-value | FT | 1.35 | 2026-11-11 | 2 | 0 | OK (2 decimales) |
| fondo | myinvestor-value | quefondos | 1.36027 | 2026-11-10 | 3 | 1 | OK |
| fondo | numantia | Yahoo | 30.7239 | 2026-11-10 | 3 | 0 | OK |
| fondo | numantia | FT | 30.72 | 2026-11-10 | 3 | 0 | OK (2 decimales) |
| fondo | numantia | quefondos | 30.789 | 2026-11-09 | 4 | 1 | OK |
| fondo | numantia | gestora | 30.72 | 2026-11-10 | 3 | 0 | OK (gestora) |
| fondo | polar-capital | Yahoo | 33.2 | 2026-11-10 | 3 | 0 | OK |
| fondo | polar-capital | FT | 33.2 | 2026-11-10 | 3 | 0 | OK (2 decimales) |
| fondo | polar-capital | quefondos | 33.2 | 2026-11-10 | 3 | 0 | OK |
| fondo | pictet-china | Yahoo | 128.57 | 2026-11-11 | 2 | 0 | OK |
| fondo | pictet-china | FT | 128.57 | 2026-11-11 | 2 | 0 | OK (2 decimales) |
| fondo | pictet-china | quefondos | 128.43 | 2026-11-09 | 4 | 2 | OK |
| fondo | pictet-china | Renta 4 | 128.57 | 2026-11-11 | 2 | 0 | OK (gestora) |
| fondo | cobas-seleccion | Yahoo | 302.368 | 2026-11-11 | 2 | 0 | OK |
| fondo | cobas-seleccion | FT | 302.37 | 2026-11-11 | 2 | 0 | OK (2 decimales) |
| fondo | cobas-seleccion | quefondos | 298.774 | 2026-11-06 | 5 | 3 | OK |
| fondo | cobas-seleccion | gestora | 302.368 | 2026-11-11 | 2 | 0 | OK (gestora) |
| plan | plan-myinvestor-indexado-global | Yahoo | 19.9695 | 2026-11-10 | 3 | 0 | OK |
| plan | plan-myinvestor-indexado-global | quefondos | 19.9405 | 2026-11-09 | 4 | 1 | OK |
| indice | msci-world-nr-usd | Yahoo | 15789.7 | 2026-11-12 | 1 | 0 | OK |
| indice | msci-acwi-nr-eur | Yahoo | 527.8 | 2026-11-12 | 1 | 0 | OK |
| indice | msci-em-nr-eur | Yahoo | 742.05 | 2026-11-12 | 1 | 0 | OK |
| indice | msci-em-nr-eur-alt | Yahoo | 742.04 | 2026-11-12 | 1 | 0 | OK |
| indice | msci-europe-nr-eur | Yahoo | 461.45 | 2026-11-12 | 1 | 0 | OK |
| indice | msci-china-nr-eur | Yahoo | 471.24 | 2026-11-12 | 1 | 0 | OK |
| indice | dj-global-technology | Yahoo | 4955.92 | 2026-11-12 | 1 | 0 | OK |

## Avisos

- **numantia**: incluso la fuente más al día va 3 días hábiles atrasada.
- **polar-capital**: incluso la fuente más al día va 3 días hábiles atrasada.
- pictet-china: quefondos va 2 días hábiles por detrás de la mejor fuente.
- cobas-seleccion: quefondos va 3 días hábiles por detrás de la mejor fuente.
- **plan-myinvestor-indexado-global**: incluso la fuente más al día va 3 días hábiles atrasada.

## Últimos 14 días, por fuente

| Tipo | Fuente | Capturas | Con dato | Desfase medio (háb.) | Retraso medio vs mejor | Veces la más al día |
|---|---|---|---|---|---|---|
| fondo | FT | 232 | 100% | 1.6 | 0.0 | 226 |
| fondo | Renta 4 | 29 | 100% | 2.0 | 0.4 | 17 |
| fondo | Yahoo | 232 | 100% | 1.9 | 0.3 | 168 |
| fondo | gestora | 87 | 100% | 2.2 | 0.3 | 62 |
| fondo | quefondos | 203 | 100% | 2.6 | 0.9 | 63 |
| indice | Yahoo | 203 | 100% | 0.4 | 0.0 | 203 |
| plan | Yahoo | 29 | 100% | 1.9 | 0.0 | 29 |
| plan | quefondos | 29 | 100% | 2.6 | 0.7 | 13 |
