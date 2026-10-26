# Foto diaria del Sheet «CRYPTO» (F5, primer vehículo)

Cada mañana el Sheet «CRYPTO» crea `foto_cripto_AAAA-MM-DD.json` (molde `foto_cartera/v1`, el mismo que fondos) en la carpeta privada de Drive
«TITAN datos Sheet/fotos», más `libro_cripto.json` (copia en bruto de «Operaciones» y «Otras criptos») e `historial_cripto.json`
(cantidades del libro × precios diarios del repo, desde el 26/09/2026). Sustituye a la foto provisional que hoy hace el PC:
mismo nombre de fichero, mismos ids (`bitcoin:btc`), `sheet: "cripto"`. El consolidador y el vault no deben notar el cambio.

Código: `fotos_cripto.gs` (+ `foto_cartera.gs`, el molde común, idéntico al de fondos) · pruebas: `test_fotos_cripto.test.mjs` (Node, datos
inventados) y `test_fotos_cripto_apps_script.py` (valida con el validador público lo que genera el código).

## Reglas
- **Precio:** el cierre de `oficial/ultimo.json` (captura oficial de GitHub). El precio de Google Finance de la hoja «Exposición» no entra nunca.
- **Posiciones:** todas las filas de la tabla de «Exposición» (de la fila 8 a la fila «TOTAL»). Sin lista fija de monedas.
- **Ids:** BTC = `bitcoin:btc`; el resto = `cripto:` + símbolo en minúsculas (`cripto:eth`). El nombre de la posición es el símbolo en minúsculas (`btc`).
- **Sin precio oficial válido:** la posición entra igualmente con `precio`/`valor_eur` a `null`, `estado_precio: "sin_dato"` y el aviso «sin precio oficial».
  (`sin_oficial` no se usa nunca.) Precio oficial en otra moneda que no sea EUR: igual, sin convertir.
- **Coste:** «Dinero neto puesto» de «Exposición» (compras − ventas en euros, flujo de caja, **no** base fiscal), con `coste_tipo: "neto_caja"`.
  `estado_coste` = `cuadrado` solo para BTC y solo si la pestaña «Cuadre» dice «Todos los controles cuadran» en esa pasada; si no, o para cualquier
  otra moneda, `sin verificar`. Sin dato: `coste_eur: null`, `estado_coste: "sin_dato"`.
- **Forma de las pestañas:** se comprueban las cabeceras y la fila «TOTAL». Si cambian, no se genera la foto y el error lo dice (correo de Google).
- **La foto del día se crea una vez y no se sobrescribe**; libro e historial sí se sobrescriben. Antes de las 07:00 de Madrid no se crea.
- **Modo** (propiedad del script `FOTOS_MODO`): `ensayo` (por defecto) escribe en `fotos/ensayo_cripto/`, que el consolidador no lee (solo mira los
  ficheros que cuelgan directamente de `fotos/`); `definitivo` escribe en `fotos/`.
- Datos de error o último resultado: ⚙ Configuración del proyecto → Propiedades de la secuencia de comandos → `CRIPTO_ULTIMO_RESULTADO` / `CRIPTO_ULTIMO_ERROR`.

## Instalar (a mano, en el Apps Script del Sheet «CRYPTO»)
1. Abre el Sheet «CRYPTO» → **Extensiones → Apps Script**. Ya existe el archivo `Código.gs` (la carga diaria de «Datos diarios»): **no lo toques**.
2. **+ → Secuencia de comandos**, nombre `foto_cartera`, pega el contenido de `google/foto_cartera.gs` (el molde común; es el mismo que usa fondos).
3. **+ → Secuencia de comandos**, nombre `fotos_cripto`, pega el contenido de `google/fotos_cripto.gs`.
4. Guarda (icono del disquete).
5. En el desplegable de funciones elige `fotosCriptoConfigurar` → **Ejecutar**. Acepta los permisos que pida Google (Drive y descargas). En el registro debe salir «Listo: carpeta «TITAN datos Sheet» localizada…». Si dice que hay 0 o 2 carpetas con ese nombre, no guarda nada: avísame.
6. Elige `fotosCriptoVerSinGuardar` → **Ejecutar**. No escribe nada: en el registro verás cada posición (cantidad, precio, valor, coste) y «La foto cumple el molde foto_cartera/v1». Comprueba que la cantidad de BTC coincide con «Exposición».
7. Elige `fotosCriptoDiaria` → **Ejecutar** (modo ensayo): crea `libro_cripto.json` e `historial_cripto.json` en `fotos/ensayo_cripto/` y, si ya son las 07:00 o más, también la foto.
8. Elige `fotosCriptoInstalarDisparador` → **Ejecutar** (Google pedirá un permiso nuevo para gestionar disparadores). Crea el disparador diario entre las 07:00 y las 08:00 de Madrid. Comprueba en **Activadores** (icono del reloj): `fotosCriptoDiaria`, basado en tiempo, temporizador diario, 7 a 8; notificaciones de error: «Notificarme inmediatamente».
9. A la mañana siguiente, en Drive: `fotos/ensayo_cripto/` debe tener `foto_cripto_<hoy>.json`, `libro_cripto.json` e `historial_cripto.json`; y `fotos/` **no** debe tener ninguna `foto_cripto` creada por el Sheet (la del PC sigue donde estaba).

## Comparar con la provisional (unos días, mientras está en ensayo)
La foto del Sheet de la mañana del día D lleva el cierre de D−1; la provisional del PC dated D−1 se hizo a las 22:00 de D−1. Se comparan **esas dos**:
- `id` y `cantidad`: idénticos.
- Huella de contenido (hash de la lista ordenada de `id` + `cantidad`): idéntica. (La `huella.hash` de cada foto no sirve para esto: la del Sheet resume el libro; la provisional, las posiciones.)
- `valor_eur` de la foto del Sheet = `cantidad` × precio oficial de esa fecha (exacto). El de la provisional puede diferir un poco: BTC cotiza 24 h y la provisional usa el precio de las 22:00, no el de la captura de las 23:31 UTC. Es informativo, no un fallo.
- Avisos: ninguno inesperado.

## Pasar a definitivo (solo con tu «sí»; en este orden)
1. Vault: apagar el interruptor de cripto en `scripts/cartera/fotos_provisionales.yaml` (commit con rutas exactas, skill `commit-seguro-vault`, nunca `git add -A`).
2. Sheet: ejecutar `fotosCriptoModoDefinitivo`. El disparador ya existe desde el primer día de ensayo, así que no hay que instalar nada nuevo.
3. A la mañana siguiente: `fotos/foto_cripto_<hoy>.json` existe, y la consolidada de las 08–09 h trae `cripto` «al día» con origen `sheet`.
- Si ya existe en `fotos/` una foto de ese día (p. ej. una provisional), el Sheet no la sustituye (la foto del día es inmutable): ese día manda la que ya está.
- Marcha atrás: `fotosCriptoModoEnsayo` y volver a encender el interruptor del vault.

## Cómo dar de alta una moneda nueva (receta; ejemplo: ETH)
Una moneda distinta de BTC entra en la manga `bitcoin_cripto`. **Antes de comprarla, revisa si el IPS lo permite.**

1. **IPS:** comprueba que el IPS permite esa moneda y que cabe en la banda de la manga `bitcoin_cripto`. Si no está claro, no compres.
2. **Captura de precios (repo público, vía de `ALTA.md`):** añade en `universo.json`, **debajo de la línea de BTC** (el capturador usa hoy la primera cripto de la lista), una línea
   `{"id": "cripto:eth", "tipo": "cripto", "moneda": "EUR", "estado": "pendiente", "fuentes": [{"fuente": "yahoo", "ticker": "ETH-EUR"}]}`,
   pruébala («probar = sí»), y actívala con un Pull Request. Después añade su fila en la pestaña «Ultima» del Sheet «Precios secundaria».
   **Aviso — verificado en `fetch_precios_publico.py`:** hoy el capturador solo escribe a mano `bitcoin:btc` (toma `vehiculos(tipo="cripto")[0]` y CoinGecko está fijado a Bitcoin). Una segunda cripto activa **no se captura** hasta ampliar el capturador (cambio único, en un Pull Request aparte, antes de la primera moneda nueva). Sin eso, el Sheet la mostrará con `sin_dato` y el aviso «sin precio oficial»: no rompe nada, pero no tiene valor. No he comprobado si `crudo.py` y el inspector la tratan bien (solo BTC está probado).
3. **Vault (solo la primera vez):** que el prefijo `cripto:` vaya a la cesta de cripto en `_CESTA_POR_PREFIJO` y a la manga `bitcoin_cripto` en `scripts/cartera/reglas_ips.yaml`, igual que hoy `bitcoin:`. Con ese cambio hecho una vez, las monedas siguientes no necesitan tocar nada más. (Cambio en el vault: con tu «sí» y commit con rutas exactas.)
4. **Sheet «CRYPTO», hoja «Exposición»:** escribe el símbolo (`ETH`) en la columna B de una fila libre (de la 9 a la 23). No hay que tocar código: el gancho lee todas las filas hasta «TOTAL».
5. **Hoja «Otras criptos»:** una fila por operación (fecha, símbolo, Compra o Venta, cantidad, importe € — siempre en positivo —, plataforma).
6. **Comprueba:** ejecuta `fotosCriptoVerSinGuardar`. Debe salir `cripto:eth` con su cantidad, sin el aviso «falta darla de alta». Si el paso 2 no está completo verás «sin precio oficial» (esperado hasta entonces). Su coste saldrá `sin verificar` (la pestaña «Cuadre» solo controla BTC).
7. **Dashboard:** hasta que el dashboard lea las fotos (pasos 3 y 4 de la integración con el vault), una moneda nueva **no saldrá en el dashboard**, aunque sí en la foto, en la consolidada y en el Sheet.
