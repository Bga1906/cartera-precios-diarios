# F3 — Valoración y foto diaria (25/10/2026)

Principio: «nube primero, el PC solo mira». El Sheet ya valora a diario; F3 le hace sacar una **foto fechada** de su estado al Drive privado de Brian, con un molde común para todos los Sheets.

## Qué hace
Cada vez que corre `actualizarValoracion()` (23:30 y 07:30, hora de Madrid) el Sheet «Seguimiento fondos» escribe en Drive, carpeta `TITAN datos Sheet/fotos/`:

| Archivo | Qué es | Se sobrescribe |
|---|---|---|
| `foto_fondos_AAAA-MM-DD.json` | Foto del día (`foto_cartera/v1`): posiciones, precio, fecha real del precio, estado, totales, huella | **No**: se crea una vez (primera pasada del día con hora ≥ 07:00 de Madrid) |
| `libro_fondos.json` | Libro y «Compras nuevas» en bruto + lo que el Sheet interpretó (`libro_cartera/v1`) | Sí, cada pasada |
| `historial_fondos.json` | Serie diaria recalculada (`historial_cartera/v1`) | Sí, cada pasada |

Una foto vieja es «lo que se veía entonces». Si apuntas una compra con fecha pasada, la foto de ayer no cambia; la de mañana (y `historial_fondos.json` hoy mismo) ya lo reflejan, y la **huella** (hash del libro) cambia para que se note.

## Molde común
Una foto por Sheet, mismos campos: `id, nombre, tipo, cantidad, moneda, precio, precio_eur, fecha_precio, estado_precio, frescura, dias_desfase, valor_eur, coste_eur, coste_tipo, estado_coste, no_liquido, oficial, avisos`. `estado_precio`: ok | dudoso | respaldo | sin_dato | manual | sin_oficial (sale del inspector, `oficial/ultimo.json`). F5 añade ETFs, acciones y cripto con otro adaptador y el mismo `foto_cartera.gs`.

- `aportado_efectivo_eur` (dinero que has puesto) y `coste_eur` (coste fiscal) van **separados**.
- El plan de pensiones es automático (participaciones × VL diario), siempre `no_liquido`, fuera del valor líquido; tu valor manual queda como contraste (aviso si difiere >0,5 % con fechas a ≤3 días).
- Si el precio de la hoja difiere >0,5 % del oficial **a la misma fecha**, aviso `dif_oficial`.

## Fecha de cierre (26/10/2026)
La foto se crea de madrugada (07:30) con los precios del cierre anterior. Por eso lleva dos fechas: `fecha_foto` (el día en que se hizo) y `fecha_cierre` (la última fecha REAL de precio de mercado de sus posiciones; no cuenta el valor manual del plan). Las fotos hechas antes del 26/10/2026 no traen `fecha_cierre`.

## Qué NO hace
- No toca `datos_sheet_fondos.json` ni `salud_sheet_fondos.json` (los copia el vault a las 22:00). Se revisará en la integración con vault y titan-mcp.
- El libro con cantidades **no** va a este repo público; solo vive en el Drive privado. El código nuevo no lleva ids, cifras ni datos personales (hay prueba que lo vigila).
- Un fallo al guardar no rompe la valoración: queda en las propiedades del script `FOTOS_ULTIMO_RESULTADO` / `FOTOS_ULTIMO_ERROR`.

## Archivos
- `google/foto_cartera.gs` — genérico (validación, huella, guardado, inmutabilidad). Igual para todos los Sheets.
- `google/fotos_fondos.gs` — adaptador de fondos + plan.
- `foto_cartera.py` — validador gemelo en Python (consolidador F4, simulacro F6).
- Pruebas: `google/test_fotos.test.mjs` (Node, ejecuta el código real con Drive simulado), `test_foto_cartera.py`, `test_fotos_apps_script.py` (contrato JS↔Python). Con `FONDOS_SCRIPT=<ruta al script real>` el Node también contrasta con el script v2.2 de Brian (solo en local; ese script no se copia al repo).

## Riesgos conocidos
- Drive no permite fichero de solo lectura: la inmutabilidad es por nombre (no se sobrescribe), no por permisos.
- `aplicarMejorasV1` borra y recrea la pestaña «Plan de pensiones» (pierde las participaciones): conviene hacerlo no destructivo.
- El último `oficial/ultimo.json` marca fondos y plan como `sin_dato` (captura de la noche del 25/10, pendiente de revisar); la foto lo reflejará como `estado_precio` tal cual.

## Siguiente
Revisión de integración con vault y titan-mcp → F4 consolidador → F5 cripto + Trade Republic + Mexem → F6 simulacro mensual de restauración.
