# Comparativa de fuentes de VL e índices

Generado automáticamente por `fuentes_vl/comparar_fuentes.py` (GitHub Actions, 09:15 y 22:40 aprox.).
Desfase = días hábiles (lunes a viernes) entre la captura y la fecha real del dato. Retraso = días hábiles que una fuente va por detrás de la más al día para ese mismo fondo o índice.

## Última captura: 2026-10-27 01:03

| Tipo | Instrumento | Fuente | Precio | Fecha del dato | Desfase (háb.) | Retraso vs mejor | Estado |
|---|---|---|---|---|---|---|---|
| fondo | ishares-developed-world | Yahoo | 12.406 | 2026-10-23 | 2 | 0 | OK |
| fondo | ishares-developed-world | FT | 12.41 | 2026-10-23 | 2 | 0 | OK (2 decimales) |
| fondo | ishares-developed-world | quefondos | 12.465 | 2026-10-22 | 3 | 1 | OK |
| fondo | ishares-emerging-markets | Yahoo | 13.3 | 2026-10-23 | 2 | 0 | OK |
| fondo | ishares-emerging-markets | FT | 13.3 | 2026-10-23 | 2 | 0 | OK (2 decimales) |
| fondo | horos-value-internacional | Yahoo | 210.936 | 2026-10-23 | 2 | 0 | OK |
| fondo | horos-value-internacional | FT | 210.94 | 2026-10-23 | 2 | 0 | OK (2 decimales) |
| fondo | horos-value-internacional | quefondos | 210.805 | 2026-10-22 | 3 | 1 | OK |
| fondo | horos-value-internacional | gestora | 210.94 | 2026-10-23 | 2 | 0 | OK (gestora) |
| fondo | myinvestor-value | Yahoo | 1.30536 | 2026-10-23 | 2 | 0 | OK |
| fondo | myinvestor-value | FT | 1.31 | 2026-10-23 | 2 | 0 | OK (2 decimales) |
| fondo | myinvestor-value | quefondos | 1.31774 | 2026-10-22 | 3 | 1 | OK |
| fondo | numantia | Yahoo | 29.4102 | 2026-10-22 | 3 | 0 | OK |
| fondo | numantia | FT | 29.41 | 2026-10-22 | 3 | 0 | OK (2 decimales) |
| fondo | numantia | quefondos | 29.0061 | 2026-10-21 | 4 | 1 | OK |
| fondo | numantia | gestora | 29.41 | 2026-10-22 | 3 | 0 | OK (gestora) |
| fondo | polar-capital | Yahoo | 36.54 | 2026-10-22 | 3 | 0 | OK |
| fondo | polar-capital | FT | 36.54 | 2026-10-22 | 3 | 0 | OK (2 decimales) |
| fondo | polar-capital | quefondos | 36.54 | 2026-10-22 | 3 | 0 | OK |
| fondo | pictet-china | Yahoo | 122.69 | 2026-10-23 | 2 | 0 | OK |
| fondo | pictet-china | FT | 122.69 | 2026-10-23 | 2 | 0 | OK (2 decimales) |
| fondo | pictet-china | quefondos | 125.04 | 2026-10-21 | 4 | 2 | OK |
| fondo | pictet-china | Renta 4 | 122.69 | 2026-10-23 | 2 | 0 | OK (gestora) |
| fondo | cobas-seleccion | Yahoo | 297.239 | 2026-10-23 | 2 | 0 | OK |
| fondo | cobas-seleccion | FT | 297.24 | 2026-10-23 | 2 | 0 | OK (2 decimales) |
| fondo | cobas-seleccion | quefondos | 296.198 | 2026-10-22 | 3 | 1 | OK |
| fondo | cobas-seleccion | gestora | 0.35 | 2026-10-23 | 2 | 0 | OK (gestora) |
| plan | plan-myinvestor-indexado-global | Yahoo | 20.1435 | 2026-10-22 | 3 | 0 | OK |
| plan | plan-myinvestor-indexado-global | quefondos | 20.3772 | 2026-10-21 | 4 | 1 | OK |
| indice | msci-world-nr-usd | Yahoo | 15876.8 | 2026-10-26 | 1 | 0 | OK |
| indice | msci-acwi-nr-eur | Yahoo | 525.06 | 2026-10-26 | 1 | 0 | OK |
| indice | msci-em-nr-eur | Yahoo | 734.97 | 2026-10-26 | 1 | 0 | OK |
| indice | msci-em-nr-eur-alt | Yahoo | 734.93 | 2026-10-26 | 1 | 0 | OK |
| indice | msci-europe-nr-eur | Yahoo | 444.89 | 2026-10-26 | 1 | 0 | OK |
| indice | msci-china-nr-eur | Yahoo | 460.93 | 2026-10-26 | 1 | 0 | OK |
| indice | dj-global-technology | Yahoo | 5268.74 | 2026-10-26 | 1 | 0 | OK |

## Avisos

- **numantia**: incluso la fuente más al día va 3 días hábiles atrasada.
- **polar-capital**: incluso la fuente más al día va 3 días hábiles atrasada.
- pictet-china: quefondos va 2 días hábiles por detrás de la mejor fuente.
- **plan-myinvestor-indexado-global**: incluso la fuente más al día va 3 días hábiles atrasada.
- Diferencia de precio: cobas-seleccion (2026-10-23): Yahoo 297.239 frente a gestora 0.35 (99.88%)
- Diferencia de precio: cobas-seleccion (2026-10-23): FT 297.24 frente a gestora 0.35 (99.88%)

## Últimos 14 días, por fuente

| Tipo | Fuente | Capturas | Con dato | Desfase medio (háb.) | Retraso medio vs mejor | Veces la más al día |
|---|---|---|---|---|---|---|
| fondo | FT | 160 | 100% | 1.6 | 0.0 | 156 |
| fondo | Renta 4 | 5 | 100% | 2.0 | 0.8 | 1 |
| fondo | Yahoo | 160 | 100% | 1.7 | 0.2 | 127 |
| fondo | finanzen.at | 15 | 0% | — | — | 0 |
| fondo | gestora | 60 | 73% | 1.9 | 0.0 | 43 |
| fondo | quefondos | 155 | 90% | 2.2 | 0.6 | 63 |
| indice | Yahoo | 140 | 90% | 0.3 | 0.0 | 126 |
| plan | Yahoo | 20 | 100% | 2.1 | 0.0 | 20 |
| plan | quefondos | 20 | 100% | 2.8 | 0.7 | 9 |
