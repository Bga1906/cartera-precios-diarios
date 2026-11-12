# Comparativa de fuentes de VL e índices

Generado automáticamente por `fuentes_vl/comparar_fuentes.py` (GitHub Actions, 09:15 y 22:40 aprox.).
Desfase = días hábiles (lunes a viernes) entre la captura y la fecha real del dato. Retraso = días hábiles que una fuente va por detrás de la más al día para ese mismo fondo o índice.

## Última captura: 2026-11-12 02:59

| Tipo | Instrumento | Fuente | Precio | Fecha del dato | Desfase (háb.) | Retraso vs mejor | Estado |
|---|---|---|---|---|---|---|---|
| fondo | ishares-developed-world | Yahoo | 12.362 | 2026-11-10 | 2 | 0 | OK |
| fondo | ishares-developed-world | FT | 12.36 | 2026-11-10 | 2 | 0 | OK (2 decimales) |
| fondo | ishares-developed-world | quefondos | 12.347 | 2026-11-09 | 3 | 1 | OK |
| fondo | ishares-emerging-markets | Yahoo | 13.1 | 2026-11-10 | 2 | 0 | OK |
| fondo | ishares-emerging-markets | FT | 13.1 | 2026-11-10 | 2 | 0 | OK (2 decimales) |
| fondo | horos-value-internacional | Yahoo | 219.288 | 2026-11-10 | 2 | 0 | OK |
| fondo | horos-value-internacional | FT | 219.29 | 2026-11-10 | 2 | 0 | OK (2 decimales) |
| fondo | horos-value-internacional | quefondos | 218.408 | 2026-11-09 | 3 | 1 | OK |
| fondo | horos-value-internacional | gestora | 219.29 | 2026-11-10 | 2 | 0 | OK (gestora) |
| fondo | myinvestor-value | Yahoo | 1.36027 | 2026-11-10 | 2 | 0 | OK |
| fondo | myinvestor-value | FT | 1.36 | 2026-11-10 | 2 | 0 | OK (2 decimales) |
| fondo | myinvestor-value | quefondos | 1.36238 | 2026-11-09 | 3 | 1 | OK |
| fondo | numantia | Yahoo | 30.789 | 2026-11-09 | 3 | 0 | OK |
| fondo | numantia | FT | 30.79 | 2026-11-09 | 3 | 0 | OK (2 decimales) |
| fondo | numantia | quefondos | 30.2445 | 2026-11-06 | 4 | 1 | OK |
| fondo | numantia | gestora | 30.79 | 2026-11-09 | 3 | 0 | OK (gestora) |
| fondo | polar-capital | Yahoo | 33.2 | 2026-11-10 | 2 | 0 | OK |
| fondo | polar-capital | FT | 33.2 | 2026-11-10 | 2 | 0 | OK (2 decimales) |
| fondo | polar-capital | quefondos | 33.08 | 2026-11-09 | 3 | 1 | OK |
| fondo | pictet-china | Yahoo | 128.9 | 2026-11-10 | 2 | 0 | OK |
| fondo | pictet-china | FT | 128.9 | 2026-11-10 | 2 | 0 | OK (2 decimales) |
| fondo | pictet-china | quefondos | 129.35 | 2026-11-06 | 4 | 2 | OK |
| fondo | pictet-china | Renta 4 | 128.9 | 2026-11-10 | 2 | 0 | OK (gestora) |
| fondo | cobas-seleccion | Yahoo | 301.295 | 2026-11-10 | 2 | 0 | OK |
| fondo | cobas-seleccion | FT | 301.3 | 2026-11-10 | 2 | 0 | OK (2 decimales) |
| fondo | cobas-seleccion | quefondos | 298.774 | 2026-11-06 | 4 | 2 | OK |
| fondo | cobas-seleccion | gestora | 301.295 | 2026-11-10 | 2 | 0 | OK (gestora) |
| plan | plan-myinvestor-indexado-global | Yahoo | 19.9695 | 2026-11-10 | 2 | 0 | OK |
| plan | plan-myinvestor-indexado-global | quefondos | 19.753 | 2026-11-06 | 4 | 2 | OK |
| indice | msci-world-nr-usd | Yahoo | 15839.4 | 2026-11-11 | 1 | 0 | OK |
| indice | msci-acwi-nr-eur | Yahoo | 527.71 | 2026-11-11 | 1 | 0 | OK |
| indice | msci-em-nr-eur | Yahoo | 741.06 | 2026-11-11 | 1 | 0 | OK |
| indice | msci-em-nr-eur-alt | Yahoo | 741.26 | 2026-11-11 | 1 | 0 | OK |
| indice | msci-europe-nr-eur | Yahoo | 460.91 | 2026-11-11 | 1 | 0 | OK |
| indice | msci-china-nr-eur | Yahoo | 475.93 | 2026-11-11 | 1 | 0 | OK |
| indice | dj-global-technology | Yahoo | 4982.7 | 2026-11-11 | 1 | 0 | OK |

## Avisos

- **numantia**: incluso la fuente más al día va 3 días hábiles atrasada.
- pictet-china: quefondos va 2 días hábiles por detrás de la mejor fuente.
- cobas-seleccion: quefondos va 2 días hábiles por detrás de la mejor fuente.
- plan-myinvestor-indexado-global: quefondos va 2 días hábiles por detrás de la mejor fuente.

## Últimos 14 días, por fuente

| Tipo | Fuente | Capturas | Con dato | Desfase medio (háb.) | Retraso medio vs mejor | Veces la más al día |
|---|---|---|---|---|---|---|
| fondo | FT | 232 | 100% | 1.7 | 0.0 | 223 |
| fondo | Renta 4 | 29 | 100% | 2.0 | 0.4 | 18 |
| fondo | Yahoo | 232 | 100% | 1.9 | 0.3 | 169 |
| fondo | gestora | 87 | 100% | 2.2 | 0.3 | 63 |
| fondo | quefondos | 203 | 100% | 2.6 | 0.9 | 64 |
| indice | Yahoo | 203 | 100% | 0.4 | 0.0 | 203 |
| plan | Yahoo | 29 | 100% | 1.9 | 0.0 | 29 |
| plan | quefondos | 29 | 100% | 2.6 | 0.7 | 14 |
