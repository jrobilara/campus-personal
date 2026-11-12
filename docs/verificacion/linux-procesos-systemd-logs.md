# Verificación F4 — linux-procesos-systemd-logs

- **Tema:** servidores/linux-procesos-systemd-logs
- **Fecha:** 2026-11-11
- **Verificador:** F4 (agente distinto del autor)
- **Veredicto:** APROBADO (re-verificación sobre a78c34f; primera pasada sobre 6b629de: OBSERVADO)

Alcance: `tema.mdx`, `practica.yaml` y las filas de `FUENTES-servidores.md`. Los simuladores del worktree son stubs (7 líneas), así que las consignas se contrastaron contra el contrato de `SIMULADORES.md` §2.9, no contra el simulador funcionando.

Páginas que el autor dijo que le llegaron truncadas (parte de systemd.unit y de systemctl): las releí. En systemd.unit la sección StartLimit* y los drop-ins están antes del corte (confirmado con WebFetch y con `man systemd.unit` local, systemd 255.4). En systemctl, `list-units`/estados, `reset-failed` y `edit` también están antes del corte. Lo único del tema que no estaba en esas páginas es `start-limit-hit` (ver H1).

## Afirmaciones revisadas

| # | Afirmación | Fuente | Ubicación | Resultado | Nota |
|---|---|---|---|---|---|
| 1 | Letras de `ps`: R, S, D, T, Z y su significado | ps(1) man7 | PROCESS STATE CODES | ✅ | D "uninterruptible sleep (usually I/O)"; Z "defunct, terminated but not reaped by its parent". |
| 2 | Señal a proceso en D se entrega al salir de D; si queda colgado (NFS, hardware) ni SIGKILL lo termina | Kerrisk, TLPI | cap. 22, §22.3 | ✅ | Leído con pdftotext. Ver H3 por el matiz TASK_KILLABLE que el mismo libro agrega. |
| 3 | Zombi no se mata con señales; sale cuando el padre hace `wait()` o muere y `init` lo adopta | TLPI | cap. 26, §26.2, ejemplo 26-4 | ✅ | El libro dice "the only way to remove them ... is to kill their parent". Ejemplo 26-4 (`make_zombie`) existe. |
| 4 | Estados de unidad active, reloading, inactive, failed, activating, deactivating | systemctl(1) | tabla de estados de list-units/is-active | ✅ | Omite `maintenance` y `refreshing`; el texto dice "estos estados", no "todos". Sin hallazgo. |
| 5 | `failed` = se cayó, salió con error o venció un tiempo | systemctl(1) | reset-failed / status | ✅ | Man local: "non-zero error code, terminating abnormally or timing out". |
| 6 | `Restart=` por defecto `no`; `always` reinicia aun con salida limpia | systemd.service(5) | Restart= | ✅ | |
| 7 | `on-failure` reinicia si hay código ≠ 0, "muere por una señal" o timeout | systemd.service(5) | Restart= | ⚠️ | Excluye SIGHUP, SIGINT, SIGTERM y SIGPIPE (salida limpia). Ver H4. |
| 8 | Una muerte causada por stop/restart no dispara reinicio | systemd.service(5) | Restart= | ✅ | Texto literal en man. |
| 9 | `RestartSec=` por defecto 100 ms | systemd.service(5) | RestartSec= | ✅ | "Defaults to 100ms." |
| 10 | Más de `StartLimitBurst` arranques en `StartLimitIntervalSec` impide arrancar; vale también para arranques manuales; con `Restart=` no se reinicia más pero se puede arrancar a mano o por timer; `reset-failed` limpia el contador | systemd.unit(5) | [Unit] StartLimit* | ✅ | Todo presente en el man ("including manual", "restarted manually or from a timer or socket at a later point", "reset-failed ... flushed"). |
| 11 | Defaults del manager: 5 arranques en 10 s | systemd-system.conf(5) | DefaultStartLimit* | ✅ | "defaults to 10s", "defaults to 5". |
| 12 | El motivo se registra como `start-limit-hit` | systemd.service(5), "tabla de Result" | — | ❌ | La tabla está en systemd.exec(5), no en systemd.service(5). Ver H1. El hecho es cierto. |
| 13 | `systemctl reset-failed` limpia failed y contadores | systemctl(1) | reset-failed | ✅ | Man local: resetea el contador de arranques de todos los tipos y el de reinicios de servicios. |
| 14 | `systemctl edit` crea un drop-in que extiende la unidad | systemctl(1) | edit | ✅ | "to extend or override"; archivo `override.conf` por defecto. |
| 15 | `journalctl -u/-b/-p/-f/-n/--since`; `-p err` incluye más graves; `--since "19:30"` válido | journalctl(1), systemd.time(7) | Options | ✅ | `-p`: "this log level or a lower (hence more important)". `--since` sin fecha asume hoy; systemd.time da `11:12` como ejemplo válido. |
| 16 | Con `Storage=auto`, sin `/var/log/journal` el journal queda en memoria | journald.conf(5) | Storage= | ✅ | "auto behaves like persistent if the directory exists, and volatile otherwise". |
| 17 | Cuenta: con RestartSec=5 caben ≤2 arranques en 10 s | derivada de systemd.unit | StartLimit* | ✅ | Recalculado con Python: RestartSec=5 → 2, RestartSec=4 → 3, RestartSec=0,1 → 101. |
| 18 | Ejercicio e-arranques-en-ventana: respuesta 3 | derivada | — | ✅ | ceil(10/4)=3, verificado por enumeración. Errores comunes 2,5 y 5 coherentes. |
| 19 | Ejercicio e-stop-con-restart-always (opción correcta: queda detenida, `inactive`) | systemd.service(5) | Restart= | ✅ | |
| 20 | Ejercicio e-vf-zombi-con-kill9 = falso | TLPI | §26.2 | ✅ | |
| 21 | Ejercicio e-comando-log-unidad | journalctl(1) | -u, --since, -p | ✅ | Comando correcto; distractores bien descartados. |
| 22 | Bloques bash: `ps -eo pid,ppid,stat,comm`, filtro `awk '$1 ~ /^[DZ]/'`, `systemctl --failed`, `journalctl ... --no-pager` | ps(1), systemctl(1), journalctl(1) | — | ✅ | Todos existen y hacen lo que dice el texto (solo lectura). |
| 23 | Unidad de ejemplo `.ini`: `Type=exec`, `StartLimit*` en [Unit], `Restart=on-failure`, `RestartSec=5` | systemd.service/unit | — | ⚠️ | Sintaxis válida (`Type=exec` existe desde v240), pero ver H2. |
| 24 | 8 tarjetas | ver filas 6-16 | — | ✅ | Atómicas, con pregunta precisa y dorso corto. Sin listas ni V/F. |
| 25 | Caso c-facturacion-failed-viernes | systemd.unit, journalctl | — | ✅ | La decisión buena (leer log, comparar con el repositorio, `reset-failed` + `start`, verificar) es la práctica documentada. Los pasos malos (restart a ciegas, reiniciar el servidor, subir `StartLimitBurst`, borrar la línea, `Restart=no`) están marcados `mal` o `regular`. Ningún paso peligroso se presenta como bueno. |
| 26 | Consigna del simulador `unidad-systemd` y "qué notar" | SIMULADORES.md §2.9 | — | ✅ | 5 muertes en <10 s → `failed` con `start-limit-hit`; sin `Restart` una muerte → `failed`. Coincide con el contrato. |
| 27 | Consigna `proceso-linux` | SIMULADORES.md §2.9 | — | ✅ | Eventos `pide disco`, `SIGSTOP`, `termina (exit)`, `el padre hace wait()` existen en el contrato. |
| 28 | Plagio | man pages, TLPI | — | ✅ | Paráfrasis propia; sin tramos largos coincidentes. |
| 29 | Estilo (caso → intuición → formal, voseo) | GUIA-ESTILO | — | ✅ | |

## Hallazgos abiertos

**H1** — `tema.mdx`, `<Cita f="systemd-service" loc="tabla de Result" />` (sección Formal, "Por qué se rinde"); `tema.mdx` frontmatter `fuentes[systemd-service].ubicacion` ("tabla de valores de Result"); `FUENTES-servidores.md` fila 10.
- Qué está mal: la tabla de valores de `Result` (incluido `start-limit-hit`) no está en systemd.service(5). Está en systemd.exec(5), en la tabla de `$SERVICE_RESULT`. La página online de systemd.service no contiene la cadena `start-limit-hit` y `man systemd.service` local tampoco; `man systemd.exec` la tiene (línea ~3748).
- Qué dice la fuente: systemd.exec(5): "start-limit-hit — A start limit was defined for the unit and it was hit, causing the unit to fail to start. See systemd.unit(5)'s StartLimitIntervalSec= and StartLimitBurst= for details."
- Corrección propuesta: agregar una fuente `systemd-exec` (systemd.exec(5), tabla de `$SERVICE_RESULT`), citarla en esa oración y quitar "tabla de valores de Result" de la ubicación de `systemd-service`. Corregir la fila 10 de FUENTES.

**H2** — `tema.mdx`, bloque `ini` de `/etc/systemd/system/facturacion.service` (línea `RestartSec=5`) frente al `<CasoReal>` y a `practica.yaml` → `casos[c-facturacion-failed-viernes]`.
- Qué está mal: el texto dice que con `RestartSec=5` "nunca se llega a 5" arranques en 10 s y el servicio queda en loop sin pasar a `failed`. Pero el CasoReal y el caso de guardia presentan `failed` con `start-limit-hit` en menos de un segundo, y la unidad de ejemplo es "la de facturación". La unidad mostrada no podría producir el síntoma de la historia.
- Qué dice la fuente: systemd.service(5) `RestartSec=` default 100 ms; con 100 ms los 6 arranques caben en <1 s (cuenta verificada).
- Corrección propuesta: dejar la unidad de ejemplo sin `RestartSec` (o `RestartSec=100ms`) y mostrar el `RestartSec=5` como variante en el párrafo de la cuenta, o aclarar que la unidad del caso usa el default.

**H3** — `tema.mdx`, `<Ojo>` de Intuicion ("no responde ni a `kill -9` hasta que sale de ese estado").
- Qué está mal: afirmación absoluta. El mismo libro citado agrega que desde Linux 2.6.25 existe `TASK_KILLABLE`, que se comporta como D pero despierta ante una señal fatal, y que NFS fue el primer código convertido. Un proceso mostrado como `D` puede morir con SIGKILL.
- Qué dice la fuente: TLPI §22.3: "Starting with kernel 2.6.25, Linux adds a third state ... TASK_KILLABLE ... wakes the process if a fatal signal ... is received."
- Corrección propuesta: "puede no responder ni a `kill -9`" y una línea sobre `TASK_KILLABLE`; el párrafo de Formal ya está bien al decir "si queda colgado".

**H4** — `tema.mdx`, Formal "Estados de una unidad y política de reinicio" ("con `on-failure` se reinicia si ... muere por una señal"); `FUENTES-servidores.md` fila 5.
- Qué está mal: imprecisión. `on-failure` no reinicia si la señal es SIGHUP, SIGINT, SIGTERM o SIGPIPE (cuentan como salida limpia, salvo `Type=oneshot`).
- Qué dice la fuente: systemd.service(5): "terminated by a signal (including on core dump, but excluding the aforementioned four signals)".
- Corrección propuesta: "muere por una señal anormal (no SIGTERM, SIGHUP, SIGINT ni SIGPIPE)". Severidad baja.

**H5** (menor, no bloquea) — `practica.yaml`, tarjeta `t-estado-d`: la respuesta es una sola letra ("La D"). Es una tarjeta de memorización pura; la guía pide aplicación o "por qué". Sugerencia: "Un proceso aparece en `D` y no responde a `kill`: ¿qué estado es y qué suele indicar?". Opcional.

## Re-verificación (cierre de F4) — diff 6b629de..a78c34f

Revisé solo lo que cambió (`tema.mdx`, `practica.yaml`, filas de FUENTES). `npm run build` en Node 24: verde.

| Hallazgo | Estado | Verificación |
|---|---|---|
| H1 (`start-limit-hit` citado a systemd.service) | CERRADO (a78c34f) | Se agregó la fuente `systemd-exec` y la cita usa `loc="tabla de $SERVICE_RESULT"`. En `man systemd.exec` local (255.4) la "Table 5. Defined $SERVICE_RESULT values" incluye `start-limit-hit` con el texto citado. `systemd-service` ya no promete la tabla de Result. Fila 10 de FUENTES corregida. |
| H2 (unidad de ejemplo con `RestartSec=5`) | CERRADO (a78c34f) | La unidad ya no define `RestartSec` (queda en 100 ms, systemd.service(5) "Defaults to 100ms") y conserva `StartLimitIntervalSec=10`/`StartLimitBurst=5` (iguales a los defaults de systemd-system.conf). Recalculé: arranques en t = 0, 0,1, …, 0,5 s; el 6.º (a 0,5 s) supera el burst de 5 en 10 s según systemd.unit ("started more than burst times within an interval"), así que llega a `start-limit-hit` en menos de 1 s, que es el síntoma del CasoReal y del caso. El `RestartSec=5` pasa a variante explícita ("cambiá una sola línea"), con la cuenta de ≤2 arranques por ventana (Python: 2). Ejercicio con `RestartSec=4` intacto (3). |
| H3 (Ojo: `kill -9` en D) | CERRADO (a78c34f) | Ahora dice "puede no responder" y menciona `TASK_KILLABLE` desde 2.6.25 con `<Cita f="tlpi" loc="§22.3" />`; coincide con el PDF de Kerrisk (§22.3). |
| H4 (`on-failure` y señales) | CERRADO (a78c34f) | "señal anormal (no cuentan SIGHUP, SIGINT, SIGTERM ni SIGPIPE ...)" coincide con systemd.service(5) y el man local. |
| H5 (tarjeta `t-estado-d`) | CERRADO (a78c34f) | Reformulada como situación ("proceso en D y un `kill` no le hace nada"); respuesta coherente con ps(1) "uninterruptible sleep (usually I/O)" y con el Ojo. |

Hallazgos nuevos por los cambios: ninguno.

Hallazgos abiertos: ninguno.
