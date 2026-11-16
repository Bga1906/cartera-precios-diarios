# Comparativa de fuentes de VL e índices

Generado automáticamente por `fuentes_vl/comparar_fuentes.py` (GitHub Actions, 09:15 y 22:40 aprox.).
Desfase = días hábiles (lunes a viernes) entre la captura y la fecha real del dato. Retraso = días hábiles que una fuente va por detrás de la más al día para ese mismo fondo o índice.

## Última captura: 2026-11-16 17:58

| Tipo | Instrumento | Fuente | Precio | Fecha del dato | Desfase (háb.) | Retraso vs mejor | Estado |
|---|---|---|---|---|---|---|---|
| fondo | ishares-developed-world | Yahoo | 12.556 | 2026-11-12 | 2 | 1 | OK |
| fondo | ishares-developed-world | FT | 12.55 | 2026-11-13 | 1 | 0 | OK (2 decimales) |
| fondo | ishares-developed-world | quefondos | 12.556 | 2026-11-12 | 2 | 1 | OK |
| fondo | ishares-emerging-markets | Yahoo | 13.262 | 2026-11-12 | 2 | 1 | OK |
| fondo | ishares-emerging-markets | FT | 13.27 | 2026-11-13 | 1 | 0 | OK (2 decimales) |
| fondo | horos-value-internacional | Yahoo | 219.695 | 2026-11-12 | 2 | 1 | OK |
| fondo | horos-value-internacional | FT | 219.29 | 2026-11-13 | 1 | 0 | OK (2 decimales) |
| fondo | horos-value-internacional | quefondos | 219.695 | 2026-11-12 | 2 | 1 | OK |
| fondo | horos-value-internacional | gestora | 219.7 | 2026-11-12 | 2 | 1 | OK (gestora) |
| fondo | myinvestor-value | Yahoo | 1.35068 | 2026-11-12 | 2 | 1 | OK |
| fondo | myinvestor-value | FT | 1.34 | 2026-11-13 | 1 | 0 | OK (2 decimales) |
| fondo | myinvestor-value | quefondos | 1.35068 | 2026-11-12 | 2 | 1 | OK |
| fondo | numantia | Yahoo | 30.9929 | 2026-11-11 | 3 | 1 | OK |
| fondo | numantia | FT | 30.83 | 2026-11-12 | 2 | 0 | OK (2 decimales) |
| fondo | numantia | quefondos | 30.9929 | 2026-11-11 | 3 | 1 | OK |
| fondo | numantia | gestora | 30.83 | 2026-11-12 | 2 | 0 | OK (gestora) |
| fondo | polar-capital | Yahoo | 34.45 | 2026-11-12 | 2 | 1 | OK |
| fondo | polar-capital | FT | 33.89 | 2026-11-13 | 1 | 0 | OK (2 decimales) |
| fondo | polar-capital | quefondos | 34.45 | 2026-11-12 | 2 | 1 | OK |
| fondo | pictet-china | Yahoo | 126.46 | 2026-11-12 | 2 | 1 | OK |
| fondo | pictet-china | FT | 124.68 | 2026-11-13 | 1 | 0 | OK (2 decimales) |
| fondo | pictet-china | quefondos | 128.57 | 2026-11-11 | 3 | 2 | OK |
| fondo | pictet-china | Renta 4 | 124.68 | 2026-11-13 | 1 | 0 | OK (gestora) |
| fondo | cobas-seleccion | Yahoo | 301.712 | 2026-11-12 | 2 | 1 | OK |
| fondo | cobas-seleccion | FT | 302.77 | 2026-11-13 | 1 | 0 | OK (2 decimales) |
| fondo | cobas-seleccion | quefondos | 302.368 | 2026-11-11 | 3 | 2 | OK |
| fondo | cobas-seleccion | gestora | 302.767 | 2026-11-13 | 1 | 0 | OK (gestora) |
| plan | plan-myinvestor-indexado-global | Yahoo | 19.9695 | 2026-11-10 | 4 | 1 | OK |
| plan | plan-myinvestor-indexado-global | quefondos | 20.3508 | 2026-11-11 | 3 | 0 | OK |
| indice | msci-world-nr-usd | Yahoo | 15566.8 | 2026-11-16 | 0 | 0 | OK |
| indice | msci-acwi-nr-eur | Yahoo | 521.37 | 2026-11-16 | 0 | 0 | OK |
| indice | msci-em-nr-eur | Yahoo | 714.45 | 2026-11-16 | 0 | 0 | OK |
| indice | msci-em-nr-eur-alt | Yahoo | 714.45 | 2026-11-16 | 0 | 0 | OK |
| indice | msci-europe-nr-eur | Yahoo | 460.7 | 2026-11-16 | 0 | 0 | OK |
| indice | msci-china-nr-eur | Yahoo | 468.48 | 2026-11-16 | 0 | 0 | OK |
| indice | dj-global-technology | Yahoo | 4777.53 | 2026-11-16 | 0 | 0 | OK |

## Avisos

- pictet-china: quefondos va 2 días hábiles por detrás de la mejor fuente.
- cobas-seleccion: quefondos va 2 días hábiles por detrás de la mejor fuente.
- **plan-myinvestor-indexado-global**: incluso la fuente más al día va 3 días hábiles atrasada.

## Últimos 14 días, por fuente

| Tipo | Fuente | Capturas | Con dato | Desfase medio (háb.) | Retraso medio vs mejor | Veces la más al día |
|---|---|---|---|---|---|---|
| fondo | FT | 240 | 100% | 1.6 | 0.0 | 235 |
| fondo | Renta 4 | 30 | 100% | 2.0 | 0.5 | 16 |
| fondo | Yahoo | 240 | 100% | 1.9 | 0.3 | 163 |
| fondo | gestora | 90 | 100% | 2.1 | 0.3 | 66 |
| fondo | quefondos | 210 | 100% | 2.6 | 1.0 | 61 |
| indice | Yahoo | 210 | 100% | 0.4 | 0.0 | 210 |
| plan | Yahoo | 30 | 100% | 2.2 | 0.2 | 25 |
| plan | quefondos | 30 | 100% | 2.8 | 0.7 | 14 |
