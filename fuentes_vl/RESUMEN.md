# Comparativa de fuentes de VL e índices

Generado automáticamente por `fuentes_vl/comparar_fuentes.py` (GitHub Actions, 09:15 y 22:40 aprox.).
Desfase = días hábiles (lunes a viernes) entre la captura y la fecha real del dato. Retraso = días hábiles que una fuente va por detrás de la más al día para ese mismo fondo o índice.

## Última captura: 2026-11-14 01:59

| Tipo | Instrumento | Fuente | Precio | Fecha del dato | Desfase (háb.) | Retraso vs mejor | Estado |
|---|---|---|---|---|---|---|---|
| fondo | ishares-developed-world | Yahoo | 12.556 | 2026-11-12 | 1 | 0 | OK |
| fondo | ishares-developed-world | FT | 12.56 | 2026-11-12 | 1 | 0 | OK (2 decimales) |
| fondo | ishares-developed-world | quefondos | 12.561 | 2026-11-11 | 2 | 1 | OK |
| fondo | ishares-emerging-markets | Yahoo | 13.262 | 2026-11-12 | 1 | 0 | OK |
| fondo | ishares-emerging-markets | FT | 13.26 | 2026-11-12 | 1 | 0 | OK (2 decimales) |
| fondo | horos-value-internacional | Yahoo | 219.695 | 2026-11-12 | 1 | 0 | OK |
| fondo | horos-value-internacional | FT | 219.7 | 2026-11-12 | 1 | 0 | OK (2 decimales) |
| fondo | horos-value-internacional | quefondos | 219.922 | 2026-11-11 | 2 | 1 | OK |
| fondo | horos-value-internacional | gestora | 219.92 | 2026-11-11 | 2 | 1 | OK (gestora) |
| fondo | myinvestor-value | Yahoo | 1.35068 | 2026-11-12 | 1 | 0 | OK |
| fondo | myinvestor-value | FT | 1.35 | 2026-11-12 | 1 | 0 | OK (2 decimales) |
| fondo | myinvestor-value | quefondos | 1.35449 | 2026-11-11 | 2 | 1 | OK |
| fondo | numantia | Yahoo | 30.9929 | 2026-11-11 | 2 | 0 | OK |
| fondo | numantia | FT | 30.99 | 2026-11-11 | 2 | 0 | OK (2 decimales) |
| fondo | numantia | quefondos | 30.7239 | 2026-11-10 | 3 | 1 | OK |
| fondo | numantia | gestora | 30.99 | 2026-11-11 | 2 | 0 | OK (gestora) |
| fondo | polar-capital | Yahoo | 34.45 | 2026-11-12 | 1 | 0 | OK |
| fondo | polar-capital | FT | 34.45 | 2026-11-12 | 1 | 0 | OK (2 decimales) |
| fondo | polar-capital | quefondos | 33.2 | 2026-11-10 | 3 | 2 | OK |
| fondo | pictet-china | Yahoo | 126.46 | 2026-11-12 | 1 | 0 | OK |
| fondo | pictet-china | FT | 126.46 | 2026-11-12 | 1 | 0 | OK (2 decimales) |
| fondo | pictet-china | quefondos | 128.9 | 2026-11-10 | 3 | 2 | OK |
| fondo | pictet-china | Renta 4 | 128.57 | 2026-11-11 | 2 | 1 | OK (gestora) |
| fondo | cobas-seleccion | Yahoo | 301.712 | 2026-11-12 | 1 | 0 | OK |
| fondo | cobas-seleccion | FT | 301.71 | 2026-11-12 | 1 | 0 | OK (2 decimales) |
| fondo | cobas-seleccion | quefondos | 302.368 | 2026-11-11 | 2 | 1 | OK |
| fondo | cobas-seleccion | gestora | 301.712 | 2026-11-12 | 1 | 0 | OK (gestora) |
| plan | plan-myinvestor-indexado-global | Yahoo | 19.9695 | 2026-11-10 | 3 | 0 | OK |
| plan | plan-myinvestor-indexado-global | quefondos | 19.9695 | 2026-11-10 | 3 | 0 | OK |
| indice | msci-world-nr-usd | Yahoo | 15727 | 2026-11-13 | 0 | 0 | OK |
| indice | msci-acwi-nr-eur | Yahoo | 526.68 | 2026-11-13 | 0 | 0 | OK |
| indice | msci-em-nr-eur | Yahoo | 733 | 2026-11-13 | 0 | 0 | OK |
| indice | msci-em-nr-eur-alt | Yahoo | 733 | 2026-11-13 | 0 | 0 | OK |
| indice | msci-europe-nr-eur | Yahoo | 461.59 | 2026-11-13 | 0 | 0 | OK |
| indice | msci-china-nr-eur | Yahoo | 466.76 | 2026-11-13 | 0 | 0 | OK |
| indice | dj-global-technology | Yahoo | 4895.75 | 2026-11-13 | 0 | 0 | OK |

## Avisos

- polar-capital: quefondos va 2 días hábiles por detrás de la mejor fuente.
- pictet-china: quefondos va 2 días hábiles por detrás de la mejor fuente.
- **plan-myinvestor-indexado-global**: incluso la fuente más al día va 3 días hábiles atrasada.

## Últimos 14 días, por fuente

| Tipo | Fuente | Capturas | Con dato | Desfase medio (háb.) | Retraso medio vs mejor | Veces la más al día |
|---|---|---|---|---|---|---|
| fondo | FT | 232 | 100% | 1.6 | 0.0 | 227 |
| fondo | Renta 4 | 29 | 100% | 2.0 | 0.5 | 15 |
| fondo | Yahoo | 232 | 100% | 1.9 | 0.3 | 163 |
| fondo | gestora | 87 | 100% | 2.1 | 0.3 | 60 |
| fondo | quefondos | 203 | 100% | 2.6 | 1.0 | 59 |
| indice | Yahoo | 203 | 100% | 0.3 | 0.0 | 203 |
| plan | Yahoo | 29 | 100% | 1.9 | 0.0 | 29 |
| plan | quefondos | 29 | 100% | 2.6 | 0.7 | 13 |
