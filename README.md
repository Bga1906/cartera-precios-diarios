# cartera-precios-diarios

Captura diaria automática (GitHub Actions, ~22:00 hora de Madrid) de cotizaciones públicas de mercado — acciones, ETFs, fondos, oro y Bitcoin, vía Yahoo Finance / gold-api.com / frankfurter.app / CoinGecko.

Este repositorio es público y solo contiene identificadores de mercado (tickers/ISIN) y sus cotizaciones — información pública, consultable igualmente en Yahoo Finance. No contiene cantidades, valores en euros ni ningún dato personal.

Sirve como respaldo de continuidad para un panel de seguimiento de cartera personal, que descarga estos datos para rellenar los días en los que su propio equipo estuvo apagado.

Cada ejecución escribe `precios/AAAA-MM-DD_HHMM.json` (hora UTC del runner; no se sobrescribe nunca) con la cotización de cada activo seguido, y además:

- `precios/ultimo.json`: copia de la captura más reciente (el lector recomendado).
- `precios/AAAA-MM-DD.json`: alias transitorio de la última captura del día. Existe solo porque el dashboard del vault lo pide por fecha; se retirará cuando ese lector pase a `ultimo.json`.
- `precios/archivo/AAAA-MM.json`: las capturas de más de 30 días, agrupadas por mes (`{"mes": ..., "capturas": {"AAAA-MM-DD_HHMM": {...}}}`). Solo se abre para recalcular historia.

## Campos de cada activo

Claves de siempre (no cambian): `price`, `price_previous_close`, `moneda`, `fuente`, `ok`, `error`.

Campos **opcionales** añadidos (los lectores antiguos pueden ignorarlos; solo en activos que vienen de Yahoo):

| Campo | Qué significa |
|---|---|
| `as_of` | Fecha de mercado del precio (`AAAA-MM-DD`), en la zona horaria del mercado. Para un fondo es la fecha del valor liquidativo. `null` si Yahoo no la da. |
| `as_of_fuente` | De dónde sale `as_of` (`regularMarketTime`). |
| `arrastrado` | `true` solo si `as_of` es anterior a la fecha del fichero (fin de semana, festivo, fondo con valor liquidativo atrasado). Informativo: `ok` no cambia. |
| `dias_desfase` | Días entre la fecha del fichero y `as_of` (solo junto a `arrastrado`). |
| `moneda_inferida` | Solo aparece si Yahoo no dio moneda: `true` = rellenada desde una tabla pequeña de benchmarks conocidos; `false` = desconocida, `moneda` queda en `null`. |

`price_previous_close` usa `previousClose` y, si falta, `chartPreviousClose`; si tampoco, `null` (no se calcula a mano).

## Catálogo de benchmarks

`benchmarks_catalogo.json` lista los benchmarks (`id`, `ticker`, `nombre`, `moneda`, `tipo_retorno` precio|total, `proxy_de` opcional, `estado_verificacion` verificado|pendiente). Todos se capturan como `benchmark:<id>`. Una entrada por línea; una línea mal formada se salta con aviso.

## Modo de comprobación

`python3 fetch_precios_publico.py --probar` descarga solo los benchmarks en estado `pendiente`, imprime una tabla (id, ticker, ¿existe?, moneda, último `as_of`, puntos de la última semana) y **no escribe nada** en `precios/`. En GitHub: pestaña Actions → "Captura diaria de precios" → Run workflow → marcar **probar**; la tabla sale en el registro y en el resumen de la ejecución.

## Pruebas

`pip install pytest && python3 -m pytest -q` (respuestas de Yahoo simuladas, sin red).
