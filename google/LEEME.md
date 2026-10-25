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

## F1.5 – Vigilancia cruzada
- `fotoNocturna` publica la hora de su ultima foto en `Ultima!I1:I2` (columna `ultima_foto_utc`). El lector de GitHub la guarda en `latido_google.json`.
- `vigilarGitHub` (cada 6 h) lee `latido.json` de este repo; si GitHub lleva mas de 30 h sin actualizarlo, manda un email a tu cuenta (maximo uno cada 24 h). Pide permisos nuevos: leer una URL externa y enviar email.
- `instalarDisparadores` sustituye a `instalarDisparador`: crea la foto diaria y la vigilancia.
- Al reves, `vigilancia.yml` (GitHub, cada 6 h) abre un issue si la foto de Google o la captura de GitHub llevan mas de 30 h paradas.
