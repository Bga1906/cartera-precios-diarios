# Comparativa de fuentes de VL e índices

Generado automáticamente por `fuentes_vl/comparar_fuentes.py` (GitHub Actions, 09:15 y 22:40 aprox.).
Desfase = días hábiles (lunes a viernes) entre la captura y la fecha real del dato. Retraso = días hábiles que una fuente va por detrás de la más al día para ese mismo fondo o índice.

## Última captura: 2026-11-04 01:51

| Tipo | Instrumento | Fuente | Precio | Fecha del dato | Desfase (háb.) | Retraso vs mejor | Estado |
|---|---|---|---|---|---|---|---|
| fondo | ishares-developed-world | Yahoo | 12.339 | 2026-11-02 | 2 | 0 | OK |
| fondo | ishares-developed-world | FT | 12.34 | 2026-11-02 | 2 | 0 | OK (2 decimales) |
| fondo | ishares-developed-world | quefondos | 12.61 | 2026-10-29 | 4 | 2 | OK |
| fondo | ishares-emerging-markets | Yahoo | 13.29 | 2026-11-02 | 2 | 0 | OK |
| fondo | ishares-emerging-markets | FT | 13.29 | 2026-11-02 | 2 | 0 | OK (2 decimales) |
| fondo | horos-value-internacional | Yahoo | 213.452 | 2026-11-02 | 2 | 0 | OK |
| fondo | horos-value-internacional | FT | 213.45 | 2026-11-02 | 2 | 0 | OK (2 decimales) |
| fondo | horos-value-internacional | quefondos | 212.159 | 2026-10-29 | 4 | 2 | OK |
| fondo | horos-value-internacional | gestora | 211.8 | 2026-10-30 | 3 | 1 | OK (gestora) |
| fondo | myinvestor-value | Yahoo | 1.348 | 2026-11-02 | 2 | 0 | OK |
| fondo | myinvestor-value | FT | 1.35 | 2026-11-02 | 2 | 0 | OK (2 decimales) |
| fondo | myinvestor-value | quefondos | 1.3394 | 2026-10-29 | 4 | 2 | OK |
| fondo | numantia | Yahoo | 29.9806 | 2026-10-30 | 3 | 0 | OK |
| fondo | numantia | FT | 29.98 | 2026-10-30 | 3 | 0 | OK (2 decimales) |
| fondo | numantia | quefondos | 29.4991 | 2026-10-28 | 5 | 2 | OK |
| fondo | numantia | gestora | 29.98 | 2026-11-01 | 3 | 0 | OK (gestora) |
| fondo | polar-capital | Yahoo | 34.55 | 2026-11-02 | 2 | 0 | OK |
| fondo | polar-capital | FT | 34.55 | 2026-11-02 | 2 | 0 | OK (2 decimales) |
| fondo | polar-capital | quefondos | 37.66 | 2026-10-29 | 4 | 2 | OK |
| fondo | pictet-china | Yahoo | 123.55 | 2026-11-02 | 2 | 0 | OK |
| fondo | pictet-china | FT | 123.55 | 2026-11-02 | 2 | 0 | OK (2 decimales) |
| fondo | pictet-china | quefondos | 123.47 | 2026-10-28 | 5 | 3 | OK |
| fondo | pictet-china | Renta 4 | 123.55 | 2026-11-02 | 2 | 0 | OK (gestora) |
| fondo | cobas-seleccion | Yahoo | 299.554 | 2026-10-30 | 3 | 0 | OK |
| fondo | cobas-seleccion | FT | 299.55 | 2026-10-30 | 3 | 0 | OK (2 decimales) |
| fondo | cobas-seleccion | quefondos | 300.833 | 2026-10-29 | 4 | 1 | OK |
| fondo | cobas-seleccion | gestora | 299.554 | 2026-10-30 | 3 | 0 | OK (gestora) |
| plan | plan-myinvestor-indexado-global | Yahoo | 20.1486 | 2026-11-02 | 2 | 0 | OK |
| plan | plan-myinvestor-indexado-global | quefondos | 20.3915 | 2026-10-29 | 4 | 2 | OK |
| indice | msci-world-nr-usd | Yahoo | 15710 | 2026-11-03 | 1 | 0 | OK |
| indice | msci-acwi-nr-eur | Yahoo | 517.56 | 2026-11-03 | 1 | 0 | OK |
| indice | msci-em-nr-eur | Yahoo | 722.26 | 2026-11-03 | 1 | 0 | OK |
| indice | msci-em-nr-eur-alt | Yahoo | 722.11 | 2026-11-03 | 1 | 0 | OK |
| indice | msci-europe-nr-eur | Yahoo | 448.32 | 2026-11-03 | 1 | 0 | OK |
| indice | msci-china-nr-eur | Yahoo | 463.74 | 2026-11-03 | 1 | 0 | OK |
| indice | dj-global-technology | Yahoo | 5013.5 | 2026-11-03 | 1 | 0 | OK |

## Avisos

- ishares-developed-world: quefondos va 2 días hábiles por detrás de la mejor fuente.
- horos-value-internacional: quefondos va 2 días hábiles por detrás de la mejor fuente.
- myinvestor-value: quefondos va 2 días hábiles por detrás de la mejor fuente.
- **numantia**: incluso la fuente más al día va 3 días hábiles atrasada.
- numantia: quefondos va 2 días hábiles por detrás de la mejor fuente.
- polar-capital: quefondos va 2 días hábiles por detrás de la mejor fuente.
- pictet-china: quefondos va 3 días hábiles por detrás de la mejor fuente.
- **cobas-seleccion**: incluso la fuente más al día va 3 días hábiles atrasada.
- plan-myinvestor-indexado-global: quefondos va 2 días hábiles por detrás de la mejor fuente.

## Últimos 14 días, por fuente

| Tipo | Fuente | Capturas | Con dato | Desfase medio (háb.) | Retraso medio vs mejor | Veces la más al día |
|---|---|---|---|---|---|---|
| fondo | FT | 240 | 100% | 1.7 | 0.0 | 229 |
| fondo | Renta 4 | 21 | 100% | 2.1 | 0.5 | 10 |
| fondo | Yahoo | 240 | 100% | 1.8 | 0.2 | 190 |
| fondo | finanzen.at | 9 | 0% | — | — | 0 |
| fondo | gestora | 90 | 89% | 2.1 | 0.2 | 67 |
| fondo | quefondos | 219 | 96% | 2.4 | 0.8 | 81 |
| indice | Yahoo | 210 | 96% | 0.3 | 0.0 | 202 |
| plan | Yahoo | 30 | 100% | 2.1 | 0.0 | 30 |
| plan | quefondos | 30 | 100% | 2.7 | 0.6 | 15 |
