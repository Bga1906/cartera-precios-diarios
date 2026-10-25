# Diseño F1 – Captura robusta de precios (aprobado por Brian el 25/10/2026)

Diseñado con Opus; se construye con el modelo intermedio. Parte del informe `INFORME_F0_PRECIOS.md`.
Regla de oro: **todo lo nuevo corre en paralelo**; `precios/` no cambia hasta que Brian lo decida.

Analogía: hoy hay una sola báscula. F1 pone dos básculas de empresas distintas (GitHub y Google), guarda
todo lo que marca cada una sin borrar nada (justificantes) y añade un inspector que elige el peso oficial
y avisa si no coinciden.

## Decisiones de Brian (25/10/2026)

| # | Decisión | Elegido |
|---|---|---|
| 1 | Cómo pasa la captura de Google a GitHub | **CSV publicado en la web** desde el Sheet; GitHub lo lee. Sin claves ni tokens. Solo tickers y precios |
| 2 | MyInvestor | **Fase A (F2):** la tarea en la nube solo contrasta su VL con el oficial y avisa. **Fase B (anotada, tras 2 semanas de A sin sorpresas):** la tarea anota además cada día el VL de MyInvestor en el crudo como una fuente más (`fuente=myinvestor`). Pasar a B requiere el «sí» de Brian |
| 3 | Avisos | **Los dos desde ya:** issue de GitHub (llega por email) y email desde Google (Apps Script) |
| 4 | Periodo en paralelo antes de que los lectores pasen a `oficial/` | **2 semanas** |
| 5 | Ampliaciones futuras | **Vía de alta** única para vehículos, índices y datos nuevos (sección 6) |
| – | Benchmark principal | `msci-acwi-nr-eur` (marcado en el catálogo) |

## 1. Lista única: `universo.json`

Todos los vehículos que Brian tiene, con las fuentes por orden. Lo leen la captura de GitHub, el comparador
y la captura de Google (que lo descarga desde la URL pública del repo). Los índices de referencia siguen en
`benchmarks_catalogo.json` (ya es lista única).

- `id`: el mismo identificador que hoy en `precios/*.json` (`mexem:AMZN`, `myinvestor-cobas:LU0625737910`…),
  para que Sheets, dashboard y vault no noten nada.
- `tipo`: `accion` | `etf` | `fondo` | `plan` | `cripto` | `materia_prima`.
- `moneda`, `isin` (si tiene), `nombre`.
- `fuentes`: lista ordenada `{fuente, ticker|codigo, lectura?, rol?}`; `rol: "contraste"` = se guarda y se
  compara, pero nunca gana.
- `estado`: `activo` | `pendiente` (vía de alta) | `retirado` (se deja de capturar; el histórico se conserva).
- `alta`: fecha en que se añadió.

## 2. Crudo (justificantes)

`crudo/AAAA-MM.csv`, una línea por vehículo, fuente y captura:
`captura_utc, origen (github|google), id, fuente, ticker, precio, moneda, fecha_dato, estado`.
Solo se añaden líneas; nunca se reescriben. Unos 2–3 MB al año.

## 3. Captura secundaria en Google

Sheet «Precios secundaria» en el Drive de Brian (solo tickers y precios, nunca cantidades):
- `GOOGLEFINANCE` para las 17 acciones de Mexem, `CURRENCY:BTCEUR`, `CURRENCY:EURUSD`, `LON:COPX`, `LON:JEDI`.
  Fórmulas en español: separador «;» y `IFERROR`.
- Apps Script: lee `universo.json` del repo, lee FT de los fondos (desde los servidores de Google), copia
  cada noche los valores a la pestaña «Historial» (Google no deja leer por script el histórico de
  `GOOGLEFINANCE`) y rellena la pestaña «Ultima».
- La pestaña «Ultima» se publica en la web como CSV; la captura de GitHub la descarga y la guarda en el crudo
  con `origen=google`.

## 4. El inspector: precio oficial y marca «dudoso»

Script nuevo que se ejecuta tras las capturas y escribe `oficial/AAAA-MM-DD.json` (mismo formato que `precios/`
más campos nuevos: `fuente_elegida`, `estado_precio` = ok | dudoso | respaldo | sin_dato, `motivo`).

| Vehículo | 1.ª | 2.ª | Contraste |
|---|---|---|---|
| 7 fondos (todos menos Cobas) | FT | Yahoo (serie de cierres) | MyInvestor (F2), quefondos |
| Cobas Selección | FT | Yahoo | quefondos |
| Plan de pensiones | Yahoo | quefondos | — (hueco conocido) |
| 17 acciones Mexem | Yahoo | Google Finance | Twelve Data / IBKR (F2, solo lectura) |
| ETF Trade Republic | Yahoo | Google Londres (cobre, espacio) | Investing (manual, mensual) |
| BTC | Yahoo | CoinGecko / Google | — |
| Oro | gold-api | futuro GC=F | — |

Reglas:
1. Gana la primera fuente con dato «fresco»: como mucho 1 día hábil por detrás de la fuente más reciente.
2. **Dudoso** si dos fuentes difieren más de 0,5 % con la misma fecha, o 2+ días hábiles en la fecha real.
   Se usa la fuente de mayor rango y se avisa.
3. Un fondo nunca puede tener fecha del dato igual o posterior al día de captura (se descarta esa lectura).
4. Si la 1.ª falla, gana la siguiente con `estado_precio = respaldo`.

## 5. Latido y vigilancia cruzada

- Cada captura escribe `latido.json`: última hora a la que llegó cada origen y cada fuente, cuántos precios
  ok/dudosos/sin dato.
- **GitHub vigila a Google:** si el CSV de Google lleva más de 30 h sin cambiar, el workflow abre un issue.
- **Google vigila a GitHub:** el Apps Script lee `latido.json` y, si GitHub lleva más de 30 h sin capturar,
  manda un email desde el Gmail de Brian.
- **Horario:** segunda pasada de madrugada que solo actúa si falta el día (GitHub retrasa la de las 20:00 UTC
  2–3,5 h desde el 10/10). Con la fecha real del dato guardada, el retraso deja de importar.

## 6. Vía de alta (vehículos, índices y datos nuevos)

Un solo camino, siempre igual, para que añadir algo no obligue a tocar código:

1. **Añadir la entrada** con `estado: "pendiente"`:
   - vehículo nuevo de tu patrimonio → `universo.json`;
   - índice o referencia nueva → `benchmarks_catalogo.json` (ya funciona así);
   - dato nuevo (p. ej. un tipo de cambio o un indicador) → `universo.json` con `tipo` propio.
2. **Probar sin guardar:** workflow manual «Captura diaria» con `probar = sí` (ya existe para los índices; se
   amplía a vehículos). Enseña, por cada fuente, si responde, el precio, la moneda y la fecha del dato.
3. **Validar:** las pruebas automáticas comprueban que la entrada está bien escrita (id único, tipo y moneda
   válidos, al menos una fuente, nunca cantidades).
4. **Activar:** cambiar a `estado: "activo"` en un PR. Desde la noche siguiente lo capturan GitHub y Google
   (el Sheet lo lee de `universo.json`), entra en el crudo, el inspector y el latido.
5. **Retirar:** `estado: "retirado"` (se deja de capturar y se conserva todo el histórico).

Se documentará como `ALTA.md` con ejemplos (una acción, un fondo, un índice). La cantidad que tienes de cada
vehículo nunca va aquí: va en el Sheet correspondiente (privado).

## 7. Orden de construcción (una rama y un PR por paso)

1. `universo.json` + scripts que lo leen; pruebas que demuestran que `precios/` sale idéntico.
2. Crudo (aditivo).
3. Sheet «Precios secundaria» (Brian lo crea con instrucciones; código en `google/`).
4. Inspector → `oficial/` en paralelo durante 2 semanas.
5. Latido + vigilancia cruzada (issue de GitHub + email de Google).
6. Segunda pasada horaria.
7. Vía de alta: `--probar` para vehículos, validación y `ALTA.md`.

Reglas vigentes: nada toca titan-mcp, ningún agente aprueba ni aplica, IBKR solo lectura, sin claves en el
repo público, la captura de las 20:00 UTC sigue intacta hasta el cambio decidido por Brian.
