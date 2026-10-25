# Instalar la foto diaria en «Seguimiento fondos»

Hazlo tú, en tu Sheet. Nada se pega solo.

1. Abre el Sheet «Seguimiento fondos» → menú **Extensiones → Apps Script**.
2. A la izquierda, junto a «Archivos», pulsa **+ → Secuencia de comandos**. Llámala `foto_cartera` (Apps Script añade `.gs`). Borra el contenido y pega el de `google/foto_cartera.gs` del repo.
3. Repite: **+ → Secuencia de comandos**, nombre `fotos_fondos`, pega `google/fotos_fondos.gs`.
4. Abre tu archivo principal (el de `actualizarValoracion`). Busca estas dos líneas seguidas:
   ```
       exportarSaludJson_();
       protegerPestanas_();
   ```
   y **entre las dos** añade una línea:
   ```
       exportarFotosFondos_({fondos: fondos, cache: cache, ev: ev, compras: compras, hist: hist, vl: vl, plan: d.plan, planInfo: planInfo, frescura: frescura, hoy: hoy, scriptVersion: SCRIPT_VERSION});
   ```
5. Pulsa el icono de **Guardar** (disquete).
6. Arriba, en el desplegable de funciones elige `actualizarValoracion` y pulsa **Ejecutar**. Si Google pide permisos, acéptalos (son los mismos servicios que ya usa el script: Drive y descargas).
7. Comprueba en Drive: carpeta «TITAN datos Sheet» → debe aparecer la subcarpeta **fotos** con `libro_fondos.json`, `historial_fondos.json` y (si son las 07:00 de Madrid o más) `foto_fondos_<hoy>.json`. Antes de las 07:00 no se crea la foto, es lo esperado.
8. Si algo falla: Apps Script → ⚙ **Configuración del proyecto → Propiedades de la secuencia de comandos** → mira `FOTOS_ULTIMO_ERROR`. La valoración normal sigue funcionando aunque las fotos fallen.

Verificación opcional en el repo: `python3 foto_cartera.py foto_fondos_<fecha>.json` (descarga antes la foto desde Drive).
