# Comparativa de fuentes de VL e índices

Generado automáticamente por `fuentes_vl/comparar_fuentes.py` (GitHub Actions, 09:15 y 22:40 aprox.).
Desfase = días hábiles (lunes a viernes) entre la captura y la fecha real del dato. Retraso = días hábiles que una fuente va por detrás de la más al día para ese mismo fondo o índice.

## Última captura: 2026-11-18 03:33

| Tipo | Instrumento | Fuente | Precio | Fecha del dato | Desfase (háb.) | Retraso vs mejor | Estado |
|---|---|---|---|---|---|---|---|
| fondo | ishares-developed-world | Yahoo | 12.375 | 2026-11-16 | 2 | 0 | OK |
| fondo | ishares-developed-world | FT | 12.38 | 2026-11-16 | 2 | 0 | OK (2 decimales) |
| fondo | ishares-developed-world | quefondos | 12.554 | 2026-11-13 | 3 | 1 | OK |
| fondo | ishares-emerging-markets | Yahoo | 12.929 | 2026-11-16 | 2 | 0 | OK |
| fondo | ishares-emerging-markets | FT | 12.93 | 2026-11-16 | 2 | 0 | OK (2 decimales) |
| fondo | horos-value-internacional | Yahoo | 218.95 | 2026-11-16 | 2 | 0 | OK |
| fondo | horos-value-internacional | FT | 218.95 | 2026-11-16 | 2 | 0 | OK (2 decimales) |
| fondo | horos-value-internacional | quefondos | 219.289 | 2026-11-13 | 3 | 1 | OK |
| fondo | horos-value-internacional | gestora | 219.29 | 2026-11-13 | 3 | 1 | OK (gestora) |
| fondo | myinvestor-value | Yahoo | 1.33176 | 2026-11-16 | 2 | 0 | OK |
| fondo | myinvestor-value | FT | 1.33 | 2026-11-16 | 2 | 0 | OK (2 decimales) |
| fondo | myinvestor-value | quefondos | 1.34333 | 2026-11-13 | 3 | 1 | OK |
| fondo | numantia | Yahoo | 30.8606 | 2026-11-13 | 3 | 0 | OK |
| fondo | numantia | FT | 30.86 | 2026-11-13 | 3 | 0 | OK (2 decimales) |
| fondo | numantia | quefondos | 30.8255 | 2026-11-12 | 4 | 1 | OK |
| fondo | numantia | gestora | 30.86 | 2026-11-13 | 3 | 0 | OK (gestora) |
| fondo | polar-capital | Yahoo | 32.48 | 2026-11-16 | 2 | 0 | OK |
| fondo | polar-capital | FT | 32.48 | 2026-11-16 | 2 | 0 | OK (2 decimales) |
| fondo | polar-capital | quefondos | 33.89 | 2026-11-13 | 3 | 1 | OK |
| fondo | pictet-china | Yahoo | 125.07 | 2026-11-16 | 2 | 0 | OK |
| fondo | pictet-china | FT | 125.07 | 2026-11-16 | 2 | 0 | OK (2 decimales) |
| fondo | pictet-china | quefondos | 126.46 | 2026-11-12 | 4 | 2 | OK |
| fondo | pictet-china | Renta 4 | 125.07 | 2026-11-16 | 2 | 0 | OK (gestora) |
| fondo | cobas-seleccion | Yahoo | 300.486 | 2026-11-16 | 2 | 0 | OK |
| fondo | cobas-seleccion | FT | 300.49 | 2026-11-16 | 2 | 0 | OK (2 decimales) |
| fondo | cobas-seleccion | quefondos | 302.767 | 2026-11-13 | 3 | 1 | OK |
| fondo | cobas-seleccion | gestora | 300.485 | 2026-11-16 | 2 | 0 | OK (gestora) |
| plan | plan-myinvestor-indexado-global | Yahoo | 20.1234 | 2026-11-16 | 2 | 0 | OK |
| plan | plan-myinvestor-indexado-global | quefondos | 20.3508 | 2026-11-11 | 5 | 3 | OK |
| indice | msci-world-nr-usd | Yahoo | 15278.9 | 2026-11-17 | 1 | 0 | OK |
| indice | msci-acwi-nr-eur | Yahoo | 512.5 | 2026-11-17 | 1 | 0 | OK |
| indice | msci-em-nr-eur | Yahoo | 704.63 | 2026-11-17 | 1 | 0 | OK |
| indice | msci-em-nr-eur-alt | Yahoo | 704.77 | 2026-11-17 | 1 | 0 | OK |
| indice | msci-europe-nr-eur | Yahoo | 452.14 | 2026-11-17 | 1 | 0 | OK |
| indice | msci-china-nr-eur | Yahoo | 460.08 | 2026-11-17 | 1 | 0 | OK |
| indice | dj-global-technology | Yahoo | 4672.66 | 2026-11-17 | 1 | 0 | OK |

## Avisos

- **numantia**: incluso la fuente más al día va 3 días hábiles atrasada.
- pictet-china: quefondos va 2 días hábiles por detrás de la mejor fuente.
- plan-myinvestor-indexado-global: quefondos va 3 días hábiles por detrás de la mejor fuente.

## Últimos 14 días, por fuente

| Tipo | Fuente | Capturas | Con dato | Desfase medio (háb.) | Retraso medio vs mejor | Veces la más al día |
|---|---|---|---|---|---|---|
| fondo | FT | 232 | 100% | 1.6 | 0.0 | 229 |
| fondo | Renta 4 | 29 | 100% | 1.9 | 0.4 | 16 |
| fondo | Yahoo | 232 | 100% | 1.9 | 0.3 | 159 |
| fondo | gestora | 87 | 100% | 2.1 | 0.3 | 61 |
| fondo | quefondos | 203 | 100% | 2.6 | 1.0 | 53 |
| indice | Yahoo | 203 | 100% | 0.4 | 0.0 | 203 |
| plan | Yahoo | 29 | 100% | 2.2 | 0.2 | 24 |
| plan | quefondos | 29 | 100% | 3.0 | 0.9 | 12 |
