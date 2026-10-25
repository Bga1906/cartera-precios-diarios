# Cómo añadir o quitar algo que sigo (vía de alta)

Un solo sitio para la lista de vehículos: **`universo.json`** (acciones, ETF, fondos, planes, cripto, oro).
Los índices de referencia siguen en `benchmarks_catalogo.json`. Nunca se escriben cantidades ni datos personales
(las pruebas lo comprueban): lo que tienes de cada cosa va en tus Sheets privados.

## Añadir un vehículo

1. Añade **una línea** en `universo.json` (copia una parecida y cámbiala) con `"estado": "pendiente"`.
   Campos: `id` (el mismo que verás en `precios/*.json`: `mexem:XXXX`, `trade-republic:Nombre`,
   `myinvestor-cobas:ISIN`…), `tipo` (`accion`, `etf`, `fondo`, `plan`, `cripto`, `materia_prima`), `moneda`
   (`EUR`: es la moneda en la que se guarda el precio), `fuentes` por orden de preferencia, y `alta` (fecha, opcional).
   - Acción o ETF: `"fuentes": [{"fuente": "yahoo", "ticker": "XXXX.MC"}]` y `"broker"`.
   - Fondo: además `"isin"`, `"id_comparador"` y las fuentes de contraste (`ft`, `quefondos`, `renta4`, `gestora`).
2. Mientras esté `pendiente` **no se captura**. (Paso 7 de F1: botón «probar» para vehículos, que enseña qué
   responde cada fuente sin guardar nada. Hasta entonces, la prueba se hace a mano en Yahoo.)
3. `python3 -m pytest -q` debe pasar: comprueba que la entrada está bien escrita (id único, tipo y moneda válidos,
   al menos una fuente, ticker de Yahoo presente, sin claves de datos personales).
4. Cambia `"estado"` a `"activo"` en un Pull Request. Desde la captura siguiente entra en `precios/` y en el comparador.

## Quitar un vehículo
Cambia `"estado"` a `"retirado"`: deja de capturarse y el histórico se conserva. No borres la línea.

## Un índice nuevo
Una línea en `benchmarks_catalogo.json` con `"estado_verificacion": "pendiente"`; se prueba con el workflow manual
«Captura diaria de precios» marcando *probar*, y pasa a `verificado` cuando responde bien.

## Qué hay que saber
- Si `universo.json` está mal escrito, la captura **se detiene con un error que lista todos los fallos** (mejor eso
  que capturar con una lista a medias). Por eso siempre por Pull Request y con las pruebas pasando.
- Los Sheets que usen el vehículo nuevo lo leerán del mismo fichero cuando exista la captura secundaria (F1, paso 3).
