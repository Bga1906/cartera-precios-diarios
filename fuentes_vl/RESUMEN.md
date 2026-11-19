# Comparativa de fuentes de VL e índices

Generado automáticamente por `fuentes_vl/comparar_fuentes.py` (GitHub Actions, 09:15 y 22:40 aprox.).
Desfase = días hábiles (lunes a viernes) entre la captura y la fecha real del dato. Retraso = días hábiles que una fuente va por detrás de la más al día para ese mismo fondo o índice.

## Última captura: 2026-11-19 02:58

| Tipo | Instrumento | Fuente | Precio | Fecha del dato | Desfase (háb.) | Retraso vs mejor | Estado |
|---|---|---|---|---|---|---|---|
| fondo | ishares-developed-world | Yahoo | 12.231 | 2026-11-17 | 2 | 0 | OK |
| fondo | ishares-developed-world | FT | 12.23 | 2026-11-17 | 2 | 0 | OK (2 decimales) |
| fondo | ishares-developed-world | quefondos | 12.375 | 2026-11-16 | 3 | 1 | OK |
| fondo | ishares-emerging-markets | Yahoo | 12.751 | 2026-11-17 | 2 | 0 | OK |
| fondo | ishares-emerging-markets | FT | 12.75 | 2026-11-17 | 2 | 0 | OK (2 decimales) |
| fondo | horos-value-internacional | Yahoo | 216.915 | 2026-11-17 | 2 | 0 | OK |
| fondo | horos-value-internacional | FT | 216.91 | 2026-11-17 | 2 | 0 | OK (2 decimales) |
| fondo | horos-value-internacional | quefondos | 218.95 | 2026-11-16 | 3 | 1 | OK |
| fondo | horos-value-internacional | gestora | 216.91 | 2026-11-17 | 2 | 0 | OK (gestora) |
| fondo | myinvestor-value | Yahoo | 1.31663 | 2026-11-17 | 2 | 0 | OK |
| fondo | myinvestor-value | FT | 1.32 | 2026-11-17 | 2 | 0 | OK (2 decimales) |
| fondo | myinvestor-value | quefondos | 1.33176 | 2026-11-16 | 3 | 1 | OK |
| fondo | numantia | Yahoo | 30.6796 | 2026-11-16 | 3 | 0 | OK |
| fondo | numantia | FT | 30.68 | 2026-11-16 | 3 | 0 | OK (2 decimales) |
| fondo | numantia | quefondos | 30.8606 | 2026-11-13 | 4 | 1 | OK |
| fondo | numantia | gestora | 30.68 | 2026-11-16 | 3 | 0 | OK (gestora) |
| fondo | polar-capital | Yahoo | 32.2 | 2026-11-17 | 2 | 0 | OK |
| fondo | polar-capital | FT | 32.2 | 2026-11-17 | 2 | 0 | OK (2 decimales) |
| fondo | polar-capital | quefondos | 32.48 | 2026-11-16 | 3 | 1 | OK |
| fondo | pictet-china | Yahoo | 123.48 | 2026-11-17 | 2 | 0 | OK |
| fondo | pictet-china | FT | 123.48 | 2026-11-17 | 2 | 0 | OK (2 decimales) |
| fondo | pictet-china | quefondos | 124.68 | 2026-11-13 | 4 | 2 | OK |
| fondo | pictet-china | Renta 4 | 123.48 | 2026-11-17 | 2 | 0 | OK (gestora) |
| fondo | cobas-seleccion | Yahoo | 299.491 | 2026-11-17 | 2 | 0 | OK |
| fondo | cobas-seleccion | FT | 299.49 | 2026-11-17 | 2 | 0 | OK (2 decimales) |
| fondo | cobas-seleccion | quefondos | 300.485 | 2026-11-16 | 3 | 1 | OK |
| fondo | cobas-seleccion | gestora | 299.491 | 2026-11-17 | 2 | 0 | OK (gestora) |
| plan | plan-myinvestor-indexado-global | Yahoo | 19.697 | 2026-11-17 | 2 | 0 | OK |
| plan | plan-myinvestor-indexado-global | quefondos | 20.2396 | 2026-11-13 | 4 | 2 | OK |
| indice | msci-world-nr-usd | Yahoo | 15207.7 | 2026-11-18 | 1 | 0 | OK |
| indice | msci-acwi-nr-eur | Yahoo | 510.73 | 2026-11-18 | 1 | 0 | OK |
| indice | msci-em-nr-eur | Yahoo | 697.34 | 2026-11-18 | 1 | 0 | OK |
| indice | msci-em-nr-eur-alt | Yahoo | 697.31 | 2026-11-18 | 1 | 0 | OK |
| indice | msci-europe-nr-eur | Yahoo | 447.51 | 2026-11-18 | 1 | 0 | OK |
| indice | msci-china-nr-eur | Yahoo | 452.47 | 2026-11-18 | 1 | 0 | OK |
| indice | dj-global-technology | Yahoo | 4690.44 | 2026-11-18 | 1 | 0 | OK |

## Avisos

- **numantia**: incluso la fuente más al día va 3 días hábiles atrasada.
- pictet-china: quefondos va 2 días hábiles por detrás de la mejor fuente.
- plan-myinvestor-indexado-global: quefondos va 2 días hábiles por detrás de la mejor fuente.

## Últimos 14 días, por fuente

| Tipo | Fuente | Capturas | Con dato | Desfase medio (háb.) | Retraso medio vs mejor | Veces la más al día |
|---|---|---|---|---|---|---|
| fondo | FT | 232 | 100% | 1.6 | 0.0 | 230 |
| fondo | Renta 4 | 29 | 100% | 1.9 | 0.4 | 16 |
| fondo | Yahoo | 232 | 100% | 1.9 | 0.3 | 158 |
| fondo | gestora | 87 | 100% | 2.1 | 0.3 | 62 |
| fondo | quefondos | 203 | 100% | 2.6 | 1.0 | 52 |
| indice | Yahoo | 203 | 100% | 0.4 | 0.0 | 203 |
| plan | Yahoo | 29 | 100% | 2.2 | 0.2 | 24 |
| plan | quefondos | 29 | 100% | 3.0 | 0.9 | 12 |
