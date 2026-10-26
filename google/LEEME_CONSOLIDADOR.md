# Consolidador de fotos (F4)

Proyecto de Apps Script **independiente** (no va dentro de ningún Sheet). Cada día junta las fotos de los cuatro vehículos
(`fondos`, `cripto`, `tr`, `ibkr`) de Drive → «TITAN datos Sheet/fotos» y escribe `foto_consolidada_AAAA-MM-DD.json`.

Código: `consolidador.gs` · manifiesto: `consolidador_appsscript.json` · pruebas: `test_consolidador.test.mjs` (Node, solo fotos
inventadas) · validador gemelo en Python: `foto_consolidada.py` (+ `test_consolidador_apps_script.py`).

## Reglas (diseño F4)
- Cada vehículo por separado; si falta uno, los demás entran y la consolidada se crea igual (todo ausente si no hay ninguna foto).
- Nunca se inventa una fecha: sin foto de hoy entra la última foto **válida** con su fecha real («atrasado»); sin ninguna, «ausente».
- Foto de Google (`fondos`): «al día» solo si es de hoy. Foto provisional del vault: «al día» con 0 o 1 día, «atrasado» desde 2, aviso desde 7.
- Una foto ilegible, con formato inválido, con totales que no suman sus posiciones o (solo provisionales) con huella que no cuadra
  **cuenta como mala**: se trata como si no existiera, con aviso, y entra la anterior válida si la hay.
- **La huella de `fondos` NO se recalcula en Google**: se copia tal cual y se verifica en el PC (parte 3, vigilancia del vault).
- Dos intentos (disparadores 08–09 h y 11–12 h, hora de Madrid): una consolidada incompleta se sustituye solo si hay más datos y ningún
  vehículo empeora; una completa no se toca; desde las 12:00 no se sustituye nada.
- Autocomprobación antes de escribir (suma de vehículos = total, nº de posiciones = suma de las originales); si falla no escribe y avisa.
  Tras escribir, relee y compara.

## Instalar (a mano)
1. `script.google.com` → Nuevo proyecto → pegar `consolidador.gs`. Zona horaria del proyecto: Madrid.
2. Ejecutar `configurar` (una vez; autoriza Drive) y después `ensayo` (no escribe nada).
3. Activadores → Añadir: `consolidarFotos`, por días, entre las 8 y las 9; y otro entre las 11 y las 12. Notificaciones de error: inmediatamente.
