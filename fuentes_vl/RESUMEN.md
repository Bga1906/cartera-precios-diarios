# Comparativa de fuentes de VL e índices

Generado automáticamente por `fuentes_vl/comparar_fuentes.py` (GitHub Actions, 09:15 y 22:40 aprox.).
Desfase = días hábiles (lunes a viernes) entre la captura y la fecha real del dato. Retraso = días hábiles que una fuente va por detrás de la más al día para ese mismo fondo o índice.

## Última captura: 2026-10-27 14:11

| Tipo | Instrumento | Fuente | Precio | Fecha del dato | Desfase (háb.) | Retraso vs mejor | Estado |
|---|---|---|---|---|---|---|---|
| fondo | ishares-developed-world | Yahoo | 12.406 | 2026-10-23 | 2 | 0 | OK |
| fondo | ishares-developed-world | FT | 12.41 | 2026-10-23 | 2 | 0 | OK (2 decimales) |
| fondo | ishares-developed-world | quefondos | 12.406 | 2026-10-23 | 2 | 0 | OK |
| fondo | ishares-emerging-markets | Yahoo | 13.3 | 2026-10-23 | 2 | 0 | OK |
| fondo | ishares-emerging-markets | FT | 13.3 | 2026-10-23 | 2 | 0 | OK (2 decimales) |
| fondo | horos-value-internacional | Yahoo | 210.936 | 2026-10-23 | 2 | 1 | OK |
| fondo | horos-value-internacional | FT | 211.37 | 2026-10-26 | 1 | 0 | OK (2 decimales) |
| fondo | horos-value-internacional | quefondos | 210.936 | 2026-10-23 | 2 | 1 | OK |
| fondo | horos-value-internacional | gestora | 210.94 | 2026-10-23 | 2 | 1 | OK (gestora) |
| fondo | myinvestor-value | Yahoo | 1.30536 | 2026-10-23 | 2 | 0 | OK |
| fondo | myinvestor-value | FT | 1.31 | 2026-10-23 | 2 | 0 | OK (2 decimales) |
| fondo | myinvestor-value | quefondos | 1.30536 | 2026-10-23 | 2 | 0 | OK |
| fondo | numantia | Yahoo | 29.4102 | 2026-10-22 | 3 | 0 | OK |
| fondo | numantia | FT | 29.41 | 2026-10-22 | 3 | 0 | OK (2 decimales) |
| fondo | numantia | quefondos | 29.4102 | 2026-10-22 | 3 | 0 | OK |
| fondo | numantia | gestora | 29.41 | 2026-10-22 | 3 | 0 | OK (gestora) |
| fondo | polar-capital | Yahoo | 36.54 | 2026-10-22 | 3 | 1 | OK |
| fondo | polar-capital | FT | 36.63 | 2026-10-23 | 2 | 0 | OK (2 decimales) |
| fondo | polar-capital | quefondos | 36.54 | 2026-10-22 | 3 | 1 | OK |
| fondo | pictet-china | Yahoo | 122.69 | 2026-10-23 | 2 | 1 | OK |
| fondo | pictet-china | FT | 123.15 | 2026-10-26 | 1 | 0 | OK (2 decimales) |
| fondo | pictet-china | quefondos | 121.39 | 2026-10-22 | 3 | 2 | OK |
| fondo | pictet-china | Renta 4 | 122.69 | 2026-10-23 | 2 | 1 | OK (gestora) |
| fondo | cobas-seleccion | Yahoo | 297.239 | 2026-10-23 | 2 | 1 | OK |
| fondo | cobas-seleccion | FT | 297.64 | 2026-10-26 | 1 | 0 | OK (2 decimales) |
| fondo | cobas-seleccion | quefondos | 297.239 | 2026-10-23 | 2 | 1 | OK |
| fondo | cobas-seleccion | gestora | 0.14 | 2026-10-26 | 1 | 0 | OK (gestora) |
| plan | plan-myinvestor-indexado-global | Yahoo | 20.1316 | 2026-10-23 | 2 | 0 | OK |
| plan | plan-myinvestor-indexado-global | quefondos | 20.1316 | 2026-10-23 | 2 | 0 | OK |
| indice | msci-world-nr-usd | Yahoo | 15881.1 | 2026-10-27 | 0 | 0 | OK |
| indice | msci-acwi-nr-eur | Yahoo | 526.36 | 2026-10-27 | 0 | 0 | OK |
| indice | msci-em-nr-eur | Yahoo | 737.47 | 2026-10-27 | 0 | 0 | OK |
| indice | msci-em-nr-eur-alt | Yahoo | 737.51 | 2026-10-27 | 0 | 0 | OK |
| indice | msci-europe-nr-eur | Yahoo | 445.15 | 2026-10-27 | 0 | 0 | OK |
| indice | msci-china-nr-eur | Yahoo | 458.99 | 2026-10-27 | 0 | 0 | OK |
| indice | dj-global-technology | Yahoo | 5268.74 | 2026-10-27 | 0 | 0 | OK |

## Avisos

- **numantia**: incluso la fuente más al día va 3 días hábiles atrasada.
- pictet-china: quefondos va 2 días hábiles por detrás de la mejor fuente.
- Diferencia de precio: cobas-seleccion (2026-10-26): FT 297.64 frente a gestora 0.14 (99.95%)

## Últimos 14 días, por fuente

| Tipo | Fuente | Capturas | Con dato | Desfase medio (háb.) | Retraso medio vs mejor | Veces la más al día |
|---|---|---|---|---|---|---|
| fondo | FT | 168 | 100% | 1.6 | 0.0 | 164 |
| fondo | Renta 4 | 6 | 100% | 2.0 | 0.8 | 1 |
| fondo | Yahoo | 168 | 100% | 1.8 | 0.2 | 131 |
| fondo | finanzen.at | 15 | 0% | — | — | 0 |
| fondo | gestora | 63 | 75% | 1.9 | 0.0 | 45 |
| fondo | quefondos | 162 | 91% | 2.2 | 0.6 | 66 |
| indice | Yahoo | 147 | 90% | 0.3 | 0.0 | 133 |
| plan | Yahoo | 21 | 100% | 2.1 | 0.0 | 21 |
| plan | quefondos | 21 | 100% | 2.7 | 0.6 | 10 |
