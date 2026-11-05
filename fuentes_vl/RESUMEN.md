# Comparativa de fuentes de VL e índices

Generado automáticamente por `fuentes_vl/comparar_fuentes.py` (GitHub Actions, 09:15 y 22:40 aprox.).
Desfase = días hábiles (lunes a viernes) entre la captura y la fecha real del dato. Retraso = días hábiles que una fuente va por detrás de la más al día para ese mismo fondo o índice.

## Última captura: 2026-11-05 02:02

| Tipo | Instrumento | Fuente | Precio | Fecha del dato | Desfase (háb.) | Retraso vs mejor | Estado |
|---|---|---|---|---|---|---|---|
| fondo | ishares-developed-world | Yahoo | 12.357 | 2026-11-03 | 2 | 0 | OK |
| fondo | ishares-developed-world | FT | 12.36 | 2026-11-03 | 2 | 0 | OK (2 decimales) |
| fondo | ishares-developed-world | quefondos | 12.339 | 2026-11-02 | 3 | 1 | OK |
| fondo | ishares-emerging-markets | Yahoo | 13.066 | 2026-11-03 | 2 | 0 | OK |
| fondo | ishares-emerging-markets | FT | 13.07 | 2026-11-03 | 2 | 0 | OK (2 decimales) |
| fondo | horos-value-internacional | Yahoo | 212.184 | 2026-11-03 | 2 | 0 | OK |
| fondo | horos-value-internacional | FT | 212.18 | 2026-11-03 | 2 | 0 | OK (2 decimales) |
| fondo | horos-value-internacional | quefondos | 213.452 | 2026-11-02 | 3 | 1 | OK |
| fondo | horos-value-internacional | gestora | 212.18 | 2026-11-03 | 2 | 0 | OK (gestora) |
| fondo | myinvestor-value | Yahoo | 1.33488 | 2026-11-03 | 2 | 0 | OK |
| fondo | myinvestor-value | FT | 1.33 | 2026-11-03 | 2 | 0 | OK (2 decimales) |
| fondo | myinvestor-value | quefondos | 1.348 | 2026-11-02 | 3 | 1 | OK |
| fondo | numantia | Yahoo | 30.4304 | 2026-11-02 | 3 | 0 | OK |
| fondo | numantia | FT | 30.43 | 2026-11-02 | 3 | 0 | OK (2 decimales) |
| fondo | numantia | quefondos | 29.9806 | 2026-10-30 | 4 | 1 | OK |
| fondo | numantia | gestora | 29.98 | 2026-11-01 | 4 | 1 | OK (gestora) |
| fondo | polar-capital | Yahoo | 34.89 | 2026-11-03 | 2 | 0 | OK |
| fondo | polar-capital | FT | 34.89 | 2026-11-03 | 2 | 0 | OK (2 decimales) |
| fondo | polar-capital | quefondos | 34.55 | 2026-11-02 | 3 | 1 | OK |
| fondo | pictet-china | Yahoo | 123.86 | 2026-11-03 | 2 | 0 | OK |
| fondo | pictet-china | FT | 123.86 | 2026-11-03 | 2 | 0 | OK (2 decimales) |
| fondo | pictet-china | quefondos | 122.59 | 2026-10-30 | 4 | 2 | OK |
| fondo | pictet-china | Renta 4 | 123.86 | 2026-11-03 | 2 | 0 | OK (gestora) |
| fondo | cobas-seleccion | Yahoo | 298.583 | 2026-11-03 | 2 | 0 | OK |
| fondo | cobas-seleccion | FT | 298.58 | 2026-11-03 | 2 | 0 | OK (2 decimales) |
| fondo | cobas-seleccion | quefondos | 299.554 | 2026-10-30 | 4 | 2 | OK |
| fondo | cobas-seleccion | gestora | 298.583 | 2026-11-03 | 2 | 0 | OK (gestora) |
| plan | plan-myinvestor-indexado-global | Yahoo | 20.0115 | 2026-11-03 | 2 | 0 | OK |
| plan | plan-myinvestor-indexado-global | quefondos | 20.1009 | 2026-10-30 | 4 | 2 | OK |
| indice | msci-world-nr-usd | Yahoo | 15968.9 | 2026-11-04 | 1 | 0 | OK |
| indice | msci-acwi-nr-eur | Yahoo | 523.24 | 2026-11-04 | 1 | 0 | OK |
| indice | msci-em-nr-eur | Yahoo | 715.97 | 2026-11-04 | 1 | 0 | OK |
| indice | msci-em-nr-eur-alt | Yahoo | 714.97 | 2026-11-04 | 1 | 0 | OK |
| indice | msci-europe-nr-eur | Yahoo | 456.63 | 2026-11-04 | 1 | 0 | OK |
| indice | msci-china-nr-eur | Yahoo | 471.21 | 2026-11-04 | 1 | 0 | OK |
| indice | dj-global-technology | Yahoo | 5043.69 | 2026-11-04 | 1 | 0 | OK |

## Avisos

- **numantia**: incluso la fuente más al día va 3 días hábiles atrasada.
- pictet-china: quefondos va 2 días hábiles por detrás de la mejor fuente.
- cobas-seleccion: quefondos va 2 días hábiles por detrás de la mejor fuente.
- plan-myinvestor-indexado-global: quefondos va 2 días hábiles por detrás de la mejor fuente.

## Últimos 14 días, por fuente

| Tipo | Fuente | Capturas | Con dato | Desfase medio (háb.) | Retraso medio vs mejor | Veces la más al día |
|---|---|---|---|---|---|---|
| fondo | FT | 240 | 100% | 1.7 | 0.1 | 229 |
| fondo | Renta 4 | 23 | 100% | 2.1 | 0.5 | 11 |
| fondo | Yahoo | 240 | 100% | 1.9 | 0.2 | 187 |
| fondo | finanzen.at | 7 | 0% | — | — | 0 |
| fondo | gestora | 90 | 91% | 2.1 | 0.2 | 67 |
| fondo | quefondos | 217 | 97% | 2.4 | 0.8 | 79 |
| indice | Yahoo | 210 | 97% | 0.3 | 0.0 | 204 |
| plan | Yahoo | 30 | 100% | 2.0 | 0.0 | 30 |
| plan | quefondos | 30 | 100% | 2.7 | 0.7 | 14 |
