# Comparativa de fuentes de VL e índices

Generado automáticamente por `fuentes_vl/comparar_fuentes.py` (GitHub Actions, 09:15 y 22:40 aprox.).
Desfase = días hábiles (lunes a viernes) entre la captura y la fecha real del dato. Retraso = días hábiles que una fuente va por detrás de la más al día para ese mismo fondo o índice.

## Última captura: 2026-11-20 02:52

| Tipo | Instrumento | Fuente | Precio | Fecha del dato | Desfase (háb.) | Retraso vs mejor | Estado |
|---|---|---|---|---|---|---|---|
| fondo | ishares-developed-world | Yahoo | 12.213 | 2026-11-18 | 2 | 0 | OK |
| fondo | ishares-developed-world | FT | 12.21 | 2026-11-18 | 2 | 0 | OK (2 decimales) |
| fondo | ishares-developed-world | quefondos | 12.231 | 2026-11-17 | 3 | 1 | OK |
| fondo | ishares-emerging-markets | Yahoo | 12.775 | 2026-11-18 | 2 | 0 | OK |
| fondo | ishares-emerging-markets | FT | 12.78 | 2026-11-18 | 2 | 0 | OK (2 decimales) |
| fondo | horos-value-internacional | Yahoo | 215.353 | 2026-11-18 | 2 | 0 | OK |
| fondo | horos-value-internacional | FT | 215.35 | 2026-11-18 | 2 | 0 | OK (2 decimales) |
| fondo | horos-value-internacional | quefondos | 216.915 | 2026-11-17 | 3 | 1 | OK |
| fondo | horos-value-internacional | gestora | 216.91 | 2026-11-17 | 3 | 1 | OK (gestora) |
| fondo | myinvestor-value | Yahoo | 1.3081 | 2026-11-18 | 2 | 0 | OK |
| fondo | myinvestor-value | FT | 1.31 | 2026-11-18 | 2 | 0 | OK (2 decimales) |
| fondo | myinvestor-value | quefondos | 1.31663 | 2026-11-17 | 3 | 1 | OK |
| fondo | numantia | Yahoo | 30.1963 | 2026-11-17 | 3 | 0 | OK |
| fondo | numantia | FT | 30.2 | 2026-11-17 | 3 | 0 | OK (2 decimales) |
| fondo | numantia | quefondos | 30.6796 | 2026-11-16 | 4 | 1 | OK |
| fondo | numantia | gestora | 30.2 | 2026-11-17 | 3 | 0 | OK (gestora) |
| fondo | polar-capital | Yahoo | 32.58 | 2026-11-18 | 2 | 0 | OK |
| fondo | polar-capital | FT | 32.58 | 2026-11-18 | 2 | 0 | OK (2 decimales) |
| fondo | polar-capital | quefondos | 32.2 | 2026-11-17 | 3 | 1 | OK |
| fondo | pictet-china | Yahoo | 123.15 | 2026-11-18 | 2 | 0 | OK |
| fondo | pictet-china | FT | 123.15 | 2026-11-18 | 2 | 0 | OK (2 decimales) |
| fondo | pictet-china | quefondos | 125.07 | 2026-11-16 | 4 | 2 | OK |
| fondo | pictet-china | Renta 4 | 123.15 | 2026-11-18 | 2 | 0 | OK (gestora) |
| fondo | cobas-seleccion | Yahoo | 297.121 | 2026-11-18 | 2 | 0 | OK |
| fondo | cobas-seleccion | FT | 297.12 | 2026-11-18 | 2 | 0 | OK (2 decimales) |
| fondo | cobas-seleccion | quefondos | 299.491 | 2026-11-17 | 3 | 1 | OK |
| fondo | cobas-seleccion | gestora | 297.121 | 2026-11-18 | 2 | 0 | OK (gestora) |
| plan | plan-myinvestor-indexado-global | Yahoo | 19.6895 | 2026-11-18 | 2 | 0 | OK |
| plan | plan-myinvestor-indexado-global | quefondos | 20.1234 | 2026-11-16 | 4 | 2 | OK |
| indice | msci-world-nr-usd | Yahoo | 14923.1 | 2026-11-19 | 1 | 0 | OK |
| indice | msci-acwi-nr-eur | Yahoo | 500.79 | 2026-11-19 | 1 | 0 | OK |
| indice | msci-em-nr-eur | Yahoo | 677.24 | 2026-11-19 | 1 | 0 | OK |
| indice | msci-em-nr-eur-alt | Yahoo | 677.27 | 2026-11-19 | 1 | 0 | OK |
| indice | msci-europe-nr-eur | Yahoo | 443.42 | 2026-11-19 | 1 | 0 | OK |
| indice | msci-china-nr-eur | Yahoo | 444.67 | 2026-11-19 | 1 | 0 | OK |
| indice | dj-global-technology | Yahoo | 4593.5 | 2026-11-19 | 1 | 0 | OK |

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
| fondo | gestora | 87 | 100% | 2.1 | 0.3 | 61 |
| fondo | quefondos | 203 | 100% | 2.5 | 1.0 | 52 |
| indice | Yahoo | 203 | 100% | 0.4 | 0.0 | 203 |
| plan | Yahoo | 29 | 100% | 2.2 | 0.2 | 24 |
| plan | quefondos | 29 | 100% | 3.0 | 0.9 | 12 |
