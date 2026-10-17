# Seguimiento de fuentes de VL (prueba de una semana)

Objetivo: comparar qué fuente da el valor liquidativo (VL) de cada fondo más al día
y cuál se desfasa más, para elegir una fuente principal y una de reserva.

- `captura_fuentes_vl.gs`: Apps Script que se instala en la hoja
  «Fuentes VL – prueba» (Drive). Cada día a las 09:00 y 22:00 guarda en la pestaña
  `Capturas`, por fondo y fuente: precio, fecha real del VL y días de desfase.
- Fuentes leídas: Yahoo (API de gráficos), FT y finanzen.at (solo Pictet).
- No se leen: Investing (bloquea accesos automáticos, se captura a mano) ni el
  catálogo de MyInvestor (repite a Yahoo: ambos vienen de Morningstar).

Hallazgos del 14/10/2026: Yahoo y el catálogo de MyInvestor van 2–5 días por
detrás; FT/Investing/finanzen 1–2 días. FT solo da 2 decimales. En Pictet
(`.LU`) Yahoo etiqueta el precio con la fecha de captura, no la real.

Sin secretos ni datos personales: solo ISIN y precios públicos.

## Primera ejecución (14/10/2026 22:23)
- Yahoo (API de gráficos) y FT responden bien desde Apps Script. Yahoo da la fecha real
  también para Pictet (12/10), así que ese fallo es del script del repo, no de la API.
- finanzen.at devuelve HTTP 403 desde los servidores de Google: no automatizable así.
- Disparadores creados: capturarFuentes a las 09:00 y 22:00.

## Versión en GitHub (17/10/2026)
`comparar_fuentes.py` hace lo mismo que la hoja, ampliado, y corre solo dos veces al día
(workflow «Comparar fuentes de VL e indices», 09:15 y 22:40 hora de Madrid en verano):
- Fondos: Yahoo, FT, quefondos (VDOS), web de la gestora (Renta 4 para Numantia, Cobas, Horos)
  y finanzen.at (Pictet). Plan de pensiones: Yahoo y quefondos. Índices oficiales de los
  fondos (catálogo, «pendiente»): Yahoo.
- Por cada lectura: precio, fecha real del dato, desfase en días naturales y hábiles, y
  retraso frente a la fuente más al día de ese mismo fondo.
- Salidas: `capturas/AAAA-MM.csv` (se acumula), `ultimo_comparativa.json` y `RESUMEN.md`
  (última captura, avisos y estadística de los últimos 14 días por fuente).
- Avisos: fondo con 3+ días hábiles de retraso incluso en la mejor fuente; fuente 2+ días
  hábiles detrás de la mejor; 3 capturas seguidas sin dato; precios que difieren más de
  un 0,5 % con la misma fecha.
- La hoja «Fuentes VL – prueba» sigue funcionando; las dos se pueden comparar durante la prueba.
