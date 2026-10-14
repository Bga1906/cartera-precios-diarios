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
