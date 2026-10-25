# Cómo añadir o quitar algo que sigo (vía de alta)

Un solo camino, siempre igual, para vehículos, índices y datos nuevos:
**añadir como «pendiente» → probar sin guardar → validar → activar con un Pull Request.**
Nunca se escriben cantidades ni datos personales (las pruebas lo comprueban): lo que tienes de cada cosa va en tus Sheets privados.

La lista de vehículos es **`universo.json`** (acciones, ETF, fondos, planes, cripto, oro). Los índices de referencia
están en **`benchmarks_catalogo.json`**.

## 1. Añadir un vehículo

Añade **una línea** en `universo.json` (copia una parecida) con `"estado": "pendiente"`.

**Ejemplo: una acción de Mexem**
```json
{"id": "mexem:ABC", "tipo": "accion", "broker": "mexem", "moneda": "EUR", "estado": "pendiente",
 "fuentes": [{"fuente": "yahoo", "ticker": "ABC.MC"}]}
```
- `id`: el mismo que verás en `precios/*.json` (`mexem:XXXX`, `trade-republic:Nombre`, `myinvestor-cobas:ISIN`…).
- `ticker`: el de Yahoo (acciones españolas `.MC`, alemanas `.DE`, Londres `.L`, Canadá `.V`).
- `moneda`: moneda en la que cotiza o en la que se guarda (ver *Qué hay que saber*).

**Ejemplo: un fondo**
```json
{"id": "myinvestor-cobas:ES0000000000", "tipo": "fondo", "isin": "ES0000000000", "id_comparador": "ejemplo-fondo",
 "moneda": "EUR", "estado": "pendiente",
 "fuentes": [{"fuente": "yahoo", "ticker": "0P0000000.F", "lectura": "serie"}, {"fuente": "ft"}, {"fuente": "quefondos"}]}
```
- Los fondos se leen de la **serie de cierres** de Yahoo (`"lectura": "serie"`), nunca del precio de la ficha.
- Las fuentes de contraste (`finanzen`, `renta4`, `gestora`) son opcionales; nunca ganan, solo avisan.

## 2. Probar sin guardar nada
Lanza a mano el workflow **«Captura diaria de precios»** marcando **probar = sí** (o, en local, `python3 fetch_precios_publico.py --probar`).
Enseña, por cada vehículo pendiente: si existe en Yahoo, la moneda (de la fuente y la que has puesto), la fecha del último dato y el precio.
Las otras fuentes (FT, quefondos…) las comprueba el workflow **«Comparar fuentes»** cuando el vehículo ya está activo.
No se escribe nada en `precios/`, `crudo/` ni `oficial/`.

## 3. Validar
`python3 -m pytest -q` debe pasar (lo hace solo el Pull Request): id único, tipo y moneda válidos, al menos una fuente,
ticker de Yahoo presente y ninguna clave de datos personales.

## 4. Activar
Cambia `"estado"` a `"activo"` en un Pull Request. Desde la captura siguiente entra en `precios/`, en el comparador, en
el crudo, en el inspector (`oficial/`) y en el latido.
Si es una acción, ETF, cripto o divisa con cotización en Google Finance, **añade además una fila en la pestaña «Ultima»
del Sheet «Precios secundaria»** (mismo `id`; copia las fórmulas de la fila de arriba) para que tenga segunda fuente.

## 5. Quitar un vehículo
Cambia `"estado"` a `"retirado"`: deja de capturarse y el histórico se conserva. No borres la línea.

## Un índice nuevo (ejemplo)
Una línea en `benchmarks_catalogo.json`, con `"estado_verificacion": "pendiente"`:
```json
{"id": "mi-indice-eur", "ticker": "^XXXX", "nombre": "Mi índice", "moneda": "EUR", "tipo_retorno": "total",
 "estado_verificacion": "pendiente"}
```
`tipo_retorno`: `precio` (solo cotización) o `total` (con dividendos). Se prueba con el mismo paso 2 y pasa a `"verificado"` cuando responde bien. El benchmark principal es `msci-acwi-nr-eur`
(`"principal": true`; solo uno puede serlo).

## Un dato nuevo (tipo de cambio, indicador…)
Mismo camino: una entrada en `universo.json` con su `tipo` (`cripto`, `materia_prima`…) y su fuente. Si Google Finance lo
cubre, fila en «Ultima». Si necesita un tipo nuevo, hay que ampliar `universo.py` (lista TIPOS) y la jerarquía del
inspector (`inspector.py`, JERARQUIA): pídelo en un Pull Request aparte.

## Qué hay que saber
- Si `universo.json` está mal escrito, la captura **se detiene con un error que lista todos los fallos** (mejor eso
  que capturar con una lista a medias). Por eso siempre por Pull Request y con las pruebas pasando.
- Mientras esté `pendiente`, el vehículo **no se captura** ni aparece en ningún sitio.
- Las divisas se guardan **tal cual las da la fuente** en el crudo; la conversión a euros se ve solo en el Sheet.
- La cantidad que tienes de cada vehículo nunca va aquí.
