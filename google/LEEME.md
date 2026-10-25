# Captura secundaria de Google (F1.3)

- **Sheet:** «Precios secundaria» (Drive de Brian). Pestana **Ultima**: 21 filas con formulas `GOOGLEFINANCE`
  (17 acciones de Mexem, BTC/EUR, EUR/USD, `LON:COPX`, `LON:JEDI`). Las columnas `cambio_a_eur` y `precio_eur`
  son solo para mirar: el crudo guarda el precio tal cual lo da la fuente.
- **Publicacion:** Ultima se publica como CSV (solo tickers y precios, nunca cantidades). El enlace esta en
  `google/config.json`. Quitarlo: Archivo > Compartir > Publicar en la web > Dejar de publicar.
- **GitHub:** `captura_google.yml` ejecuta `google_lector.py`, que anade las lineas a `crudo/` con `origen=google`.
- **Apps Script** (`google/apps_script.gs`), instalacion (la hace Brian, requiere su permiso de Google):
  1. En el Sheet: Extensiones > Apps Script. Pegar el contenido del fichero y guardar.
  2. Ejecutar `instalarDisparador` una vez y aceptar los permisos (solo sobre este Sheet).
  3. Ejecutar `fotoNocturna` a mano una vez para comprobar que aparece la pestana «Historial».
- **Anadir un vehiculo:** una fila nueva en Ultima (id igual al de `universo.json`) y copiar las formulas de la fila de arriba.
- Bitcoin y EUR/USD no tienen fecha de dato en Google: en esas filas la fecha es la del momento del calculo.
