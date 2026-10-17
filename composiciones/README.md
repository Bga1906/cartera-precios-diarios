# Composición de los vehículos (look-through)

`reparto_vehiculos.csv`: qué hay dentro de cada fondo, plan, ETF/ETC y acción seguidos, en **porcentaje** (nunca importes).
Una fila por vehículo, dimensión (`Empresa`, `País`, `Sector`) y categoría. En cada vehículo y dimensión los `pct` suman 100:
lo que el vehículo no publica sale como `Sin desglosar`; caja, oro, plata, uranio físico o bitcoin como `Liquidez` o `No aplica (no es empresa): …`.

- `sheet` dice qué Sheet lo usa: `fondos` (Seguimiento fondos), `trade_republic` y `mexem` (Sheets futuros).
- Los Sheets lo leen con `IMPORTDATA` y multiplican cada `pct` por el valor del vehículo de su propia valoración.
- `fecha_dato`, `fuente` y `nivel` (A = documento oficial; B = fuente secundaria; C = caducado) indican de dónde sale cada cifra.

Generado el 17/10/2026 desde las composiciones del hito 7 (iShares 15/10/2026, informes CNMV 1S2026, fichas VanEck, AJ Bell, tabla del gestor de Numantia).
Se actualiza a mano cuando cambia una composición (calendario: fondos activos trimestral, índices mensual).
