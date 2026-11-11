# FUENTES — Servidores
- Escritor: F3-servidores · Fecha: 2026-11-11

Cómo verifiqué: abrí cada página con WebFetch (URL en la lista de fuentes de cada tema) y, para los comandos, leí además las man pages locales de solo lectura (`man`, `--help`) en una máquina con systemd 255, procps-ng 4.0.4, rsync 3.2.7 y Docker 29.1.3. No ejecuté nada que cambie el sistema. Lo que el visor de páginas no mostró (páginas truncadas) lo marco como "no verificado".

## linux-procesos-systemd-logs

| # | Afirmación clave (mi paráfrasis) | Dónde está | Fuente (id) | Ubicación exacta | Cómo la verificaste |
|---|---|---|---|---|---|
| 1 | Letras de `ps`: R, S, D, T, Z (y significado de cada una). | Formal, §Estados de un proceso; tarjeta t-estado-d | ps-man | sección PROCESS STATE CODES | Página de man7.org y `man ps` local: coinciden. |
| 2 | Una señal a un proceso en D se entrega recién al salir de D; si queda colgado (NFS, hardware) ni SIGKILL lo termina. | Formal; Ojo de Intuición | tlpi | cap. 22, §22.3 "Interruptible and Uninterruptible Process Sleep States" | Leí la sección en el PDF (texto extraído con pdftotext). |
| 3 | El zombi no se elimina con señales; queda en la tabla hasta que el padre hace `wait()`, o hasta que muere el padre e `init` lo adopta. | Formal; tarjeta t-zombi-no-se-mata; ejercicio e-vf-zombi-con-kill9; problema p-kerrisk-zombi | tlpi | cap. 26, §26.2 "Orphans and Zombies" (y ejemplo 26-4) | Leí la sección en el PDF. |
| 4 | Estados de unidad: active, reloading, inactive, failed, activating, deactivating; `failed` = se cayó, salió con error o venció un tiempo. | Formal, §Estados de una unidad | systemctl-man | comandos list-units y status | Página oficial y man local (systemd 255). |
| 5 | `Restart=` vale `no` por defecto; `on-failure` reinicia con código ≠ 0, señal o timeout; `always` reinicia aun con salida limpia. | Formal; tarjeta t-restart-valor-defecto | systemd-service | opción Restart= | Página y man local, incluida la tabla de causas de salida. |
| 6 | Una muerte causada por `systemctl stop`/restart no dispara reinicio. | Formal; tarjeta t-restart-stop-manual; ejercicio e-stop-con-restart-always | systemd-service | opción Restart= | Texto de la man page: "When the death of the process is a result of systemd operation (e.g. service stop or restart), the service will not be restarted." |
| 7 | `RestartSec=` por defecto es 100 ms. | Formal; tarjeta t-restartsec-defecto | systemd-service | opción RestartSec= | Página y man local. |
| 8 | Más de `StartLimitBurst=` arranques en `StartLimitIntervalSec=` impide arrancar; con `Restart=` no se reinicia más pero se puede arrancar a mano o por timer pasado el intervalo; `reset-failed` limpia el contador. Aplica también a arranques manuales. | Formal, §Por qué se rinde; caso c-facturacion-failed-viernes | systemd-unit | [Unit] Section Options, StartLimitIntervalSec=/StartLimitBurst= | Página y man local. |
| 9 | Valores por defecto del manager: 5 arranques en 10 s. | Formal; tarjeta t-start-limit-defecto | systemd-system-conf | DefaultStartLimitIntervalSec= / DefaultStartLimitBurst= | Página y man local (systemd 255). La distribución puede cambiarlos (lo aclaro en el texto). |
| 10 | El resultado `start-limit-hit` existe como valor de Result. | Formal; caso | systemd-service | tabla de valores de Result | `man systemd.service` local: "start-limit-hit — A start limit was defined for the unit and it was hit". |
| 11 | `systemctl reset-failed` limpia el estado failed y los contadores de arranque/reinicio. | tarjeta t-reset-failed; caso | systemctl-man | comando reset-failed | Página y man local. |
| 12 | `systemctl edit` crea un fragmento de ajuste (drop-in, `override.conf` por defecto) que extiende la unidad. | Formal | systemctl-man | comando edit | Man local (la página online no la leí entera por truncamiento). |
| 13 | `journalctl`: `-u` unidad, `-b` arranque, `-p` prioridad (incluye más graves), `-f` seguir, `-n` líneas, `--since` fechas y horas sueltas. | Formal, §Leer el log; tarjetas t-journal-por-unidad; ejercicio e-comando-log-unidad | journalctl-man | Options (Filtering, Output) | Página y man local. `--since "19:30"`: formato de hora suelta confirmado en `man systemd.time` local (`11:12`). |
| 14 | Con `Storage=auto`, si `/var/log/journal` no existe el journal queda en memoria y se pierde al reiniciar. | Formal; tarjeta t-journal-memoria | journald-conf | opción Storage= | Página oficial. |
| 15 | Cuenta del loop: con RestartSec=5 caben ≤2 arranques en 10 s, nunca se llega a 5. | Formal (aclaro que es cuenta propia); ejercicio e-arranques-en-ventana | systemd-unit (burst/intervalo) | StartLimit* | Deducción a partir de la definición; verifiqué el conteo con un script de Python (resultado 3 para RestartSec=4). |
| 16 | Tarjeta t-restart-valor-defecto, t-restart-stop-manual, t-restartsec-defecto, t-start-limit-defecto, t-reset-failed, t-estado-d, t-zombi-no-se-mata, t-journal-por-unidad, t-journal-memoria | tarjetas | ver filas 1-14 | — | Cada una repite una afirmación ya verificada arriba. |
| 17 | Caso: el orden recomendado (leer log, comparar con repositorio, `reset-failed` + `start`) y que subir `StartLimitBurst` o dejar `Restart=no` solo tapa el síntoma. | caso c-facturacion-failed-viernes | systemd-unit, journalctl-man | StartLimit*, -u/-b | Las consecuencias son escenario ilustrativo; los comandos y su efecto están en filas 8, 11 y 13. |

### Fuentes del tema
- `systemd-service`, `systemd-unit`, `systemd-system-conf`, `systemctl-man`, `journalctl-man`, `journald-conf`: man pages oficiales de systemd en freedesktop.org (versión "latest" consultada el 2026-11-11, contrastadas con systemd 255 local).
- `ps-man`: ps(1) en man7.org (procps-ng).
- `tlpi`: Michael Kerrisk, *The Linux Programming Interface*, No Starch Press (la copia consultada, PDF de la biblioteca del dueño, indica © 2011, 1.ª ed.). Acceso: PDF del dueño. **Páginas impresas:** el PDF es una versión ebook sin numeración de página impresa, por eso cito capítulo y sección, no número de página.

### Números y datos inventados para ejemplos
- Servicio "facturacion", archivo `/etc/facturacion/app.conf`, "19:40", "nueve minutos", "línea 14": ilustrativos.
- `RestartSec=4` con arranques en 0, 4, 8, 12 s: ilustrativo; el máximo de 3 arranques en 10 s está calculado.
- Ruta `/opt/facturacion/bin/facturacion` y la unidad completa: ilustrativas.

## monitoreo-y-alertas

| # | Afirmación clave (mi paráfrasis) | Dónde está | Fuente (id) | Ubicación exacta | Cómo la verificaste |
|---|---|---|---|---|---|
| 1 | Cuatro señales: latencia (éxito y falla por separado), tráfico, errores, saturación (el recurso más limitado). | Formal; tarjetas t-saturacion-definicion, t-error-lento | sre-monitoring | cap. 6, "The Four Golden Signals" | Leí la página oficial en sre.google. |
| 2 | El promedio de latencia puede esconder una cola lenta; conviene ver la distribución. | Formal; tarjeta t-promedio-esconde-cola | sre-monitoring | "Worrying About Your Tail" | Idem. |
| 3 | El load average cuenta procesos ejecutándose, esperando CPU o en espera de E/S no interrumpible; ventanas de 1, 5 y 15 min. | Formal; tarjeta t-load-que-cuenta; ejercicio e-vf-load-alto-cpu-baja | uptime-man | DESCRIPTION | Página man7.org y `man uptime` local. |
| 4 | No se normaliza por CPU: load 1 en 4 CPU = 75 % ocioso. | Formal; tarjeta t-load-contra-nucleos; ejercicio e-load-contra-nucleos | uptime-man | DESCRIPTION | Idem (el ejemplo del 75 % es de la man page). |
| 5 | El kernel lo calcula como promedio exponencial decreciente de las tareas ejecutables más las ininterrumpibles. | Formal | kernel-loadavg | comentario de cabecera | Leí el archivo vía raw.githubusercontent.com (rama master). No pude abrir git.kernel.org (403). |
| 6 | `/proc/loadavg` trae los tres load averages (y procesos ejecutables/total y último PID). | Formal | proc-loadavg | archivo /proc/loadavg | Página oficial de man7.org. |
| 7 | `vmstat`: `r` ejecutables, `b` bloqueados en E/S, `si`/`so` swap, `wa` espera de E/S; la primera línea es promedio desde el arranque. | Formal; tarjeta t-vmstat-bloqueados | vmstat-man | campos Procs, Swap, CPU; DESCRIPTION | Página man7.org y `man vmstat` local. |
| 8 | `free`: `available` estima memoria para nuevas aplicaciones sin swap; incluye caché liberable. | Formal; tarjeta t-free-available | free-man | columna available | Página man7.org y man local. |
| 9 | `df -h`, `df -i`, `du -xh --max-depth=1`: qué hace cada flag. | Formal (bloque bash) | df-man, du-man | opciones -h/-i; -x/-d | Páginas de manpages.debian.org (coreutils, bookworm) y `--help` local. |
| 10 | Destinos de las alertas: guardia (acción inmediata), tickets (importante pero sin urgencia), tableros (informativo). | Formal; tarjeta t-pagina-o-ticket | sre-alerting | cap. 10, sección "Alerting" | Leí la página; la sección no tiene subtítulos. |
| 11 | Las reglas de alerta exigen una duración mínima antes de saltar, para evitar parpadeo. | Formal; tarjeta t-pico-for-largo; ejercicio e-elegir-for-pico-backup | sre-alerting | sección "Alerting" | Idem. |
| 12 | Pocas alertas, enfocadas en síntomas del usuario; evitar avisos sin acción posible; acercarse a la capacidad puede pedir acción humana pero no es caída inmediata. | Formal; ejercicio e-dias-hasta-llenar | prom-practices | "What to alert on", "Capacity" | Leí la página oficial. |
| 13 | Prometheus `for`: la alerta queda pending hasta sostenerse toda la duración, luego firing; `keep_firing_for` la mantiene tras apagarse la condición. | Formal; tarjeta t-prom-for | prom-rules | cláusulas for y keep_firing_for | Leí la página oficial. |
| 14 | El node exporter expone métricas `node_*`, p. ej. `node_cpu_seconds_total` con etiqueta mode. | Formal | prom-node-exporter | guía completa | Leí la guía; **no verificado en la página:** el valor `mode="idle"` usado en la regla de ejemplo (es la convención del exporter; en el texto aclaro que la expresión es ilustrativa). |
| 15 | Criterios prácticos de mi autoría (relación load/núcleos ≈ 1; "nueve días = ticket, cuatro horas = guardia"). | Formal | — | — | Los marco en el texto como criterio práctico, no como regla de las fuentes. |
| 16 | Tarjetas t-load-que-cuenta, t-load-contra-nucleos, t-free-available, t-vmstat-bloqueados, t-prom-for, t-pico-for-largo, t-pagina-o-ticket, t-saturacion-definicion, t-error-lento, t-promedio-esconde-cola | tarjetas | ver filas 1-13 | — | Repiten afirmaciones ya verificadas. |
| 17 | Ejercicio e-load-contra-nucleos: 6/4 = 1,5. Ejercicio e-dias-hasta-llenar: 200·(1−0,78)=44 GB; 44/4,5 ≈ 9,8 días. | ejercicios | uptime-man, prom-practices | — | Calculé con Python (1,5; 9,78). |
| 18 | Caso c-disco-96-de-madrugada: 100 GB, 96 usados, se liberan 60 GB (36 %), el log crece 10 GB/h: 64/10 = 6,4 h. | caso | sre-alerting | sección "Alerting" | Cuentas con Python; el escenario es ilustrativo. |

### Fuentes del tema
- `sre-monitoring` (cap. 6) y `sre-alerting` (cap. 10): Beyer, Jones, Petoff y Murphy (eds.), *Site Reliability Engineering*, O'Reilly; edición online libre en sre.google (el sitio indica © 2017 Google). La tabla de contenidos del sitio lista el cap. 10 como "Practical Alerting"; el título en la propia página es "Practical Alerting from Time-Series Data". Acceso: web libre.
- `prom-rules`, `prom-practices`, `prom-node-exporter`: documentación oficial de Prometheus.
- `uptime-man`, `proc-loadavg`, `vmstat-man`, `free-man`: man7.org.
- `kernel-loadavg`: código fuente del kernel, vía GitHub.
- `df-man`, `du-man`: Debian Manpages (coreutils).
- `gregg-load`: blog, solo "para ver más".

### Números y datos inventados para ejemplos
- "41 alertas por noche", "disco /var al 96 %", horas 3:12 y 4:05: ilustrativos.
- Backup nocturno que satura la CPU 3 minutos: ilustrativo (coincide con el escenario pico-breve del simulador).
- Disco de 200 GB al 78 % que crece 4,5 GB/día y el de 100 GB del caso: ilustrativos.

## backups-rpo-rto

| # | Afirmación clave (mi paráfrasis) | Dónde está | Fuente (id) | Ubicación exacta | Cómo la verificaste |
|---|---|---|---|---|---|
| 1 | MTD: tiempo total de interrupción que el dueño del sistema acepta. | Formal | nist-800-34 | §3.2.1, p. 16 | Extraje el texto del PDF con pdftotext y lo leí. |
| 2 | RTO: máximo que un recurso puede estar caído antes de impacto inaceptable; normalmente menor que el MTD. | Formal; tarjetas t-rto-definicion, t-rto-contra-mtd | nist-800-34 | §3.2.1, p. 16 | Idem (texto: "the RTO must normally be shorter than the MTD"). |
| 3 | RPO: punto en el tiempo al que se recuperan los datos con la copia más reciente; refleja la pérdida tolerable; no es parte del MTD. | Formal; tarjeta t-rpo-definicion | nist-800-34 | §3.2.1, p. 16 | Idem. |
| 4 | Con respaldos cada f horas la pérdida va de 0 a f; si el último no sirve, hasta 2f. | Formal (marcado como cuenta derivada); ejercicios e-rpo-real-viernes, e-rpo-sin-probar | nist-800-34 | §3.2.1 | Cuenta propia a partir de las definiciones; verificada con Python (15,5 h; 39,5 h). |
| 5 | Tiempo de restauración = datos / velocidad. | Formal (Formula); ejercicio e-tiempo-restauracion | nist-800-34 | §3.2.1 (RTO) | Cuenta propia (cota inferior del RTO); Python: 900 000 MB / 100 MB/s = 2,5 h. |
| 6 | Regla 3-2-1: 3 copias (original + 2 respaldos), 2 tipos de medios, 1 copia fuera del sitio. | Formal; tarjeta t-321-numeros; ejercicio e-cumple-321 | cisa-backup | introducción, p. 1 | Extraje el texto del PDF oficial en cisa.gov y lo leí. |
| 7 | La regla se atribuye a Peter Krogh, *The DAM Book*, 2.ª ed., O'Reilly 2009, p. 207; es práctica difundida. | Formal; tarjeta t-321-origen | cisa-backup | nota 1 de la p. 1 | Idem (la nota 1 del PDF). No tuve el libro de Krogh: la atribución la tomo del documento de US-CERT/CISA. |
| 8 | Ransomware: muchas variantes buscan respaldos accesibles para borrarlos o cifrarlos; se recomiendan respaldos offline y cifrados y verificar su disponibilidad e integridad. | Ojo; Formal; tarjeta t-nas-conectado | cisa-ransomware | Parte 1 | Leí la página web de CISA (#StopRansomware Guide). |
| 9 | Recuperar desde respaldos offline y cifrados, cuidando de no reinfectar sistemas limpios. | Formal; caso | cisa-ransomware | Parte 2 | Idem. |
| 10 | La política de backup define frecuencia/alcance, ubicación, rotación y transporte afuera del sitio; guardar afuera es buena práctica; considerar si un mismo desastre alcanza ambos sitios. | Formal | nist-800-34 | §3.4.2, p. 21 | Texto del PDF. |
| 11 | Hay que probar los respaldos con regularidad para verificar que se recuperan sin errores (la nota habla de cintas). | Formal; tarjeta t-backup-probado; ejercicio e-vf-backup-exito | nist-800-34 | nota 25, p. 21 | Texto del PDF; aclaro en el cuerpo que la nota habla de cintas. |
| 12 | Las pruebas del plan suelen centrarse en recuperación y backups. | Formal | nist-800-34 | §3.5.1, p. 27 | Texto del PDF. |
| 13 | rsync: `-a` conserva atributos, `-n` simulacro, `--delete` borra en destino lo que no está en origen, `-c` compara por checksum (más lento), `--link-dest` enlaza (hard link) lo no cambiado. | Formal; tarjetas t-rsync-espejo, t-rsync-dry-run; problema p-restore-de-prueba | rsync-man | opciones -a, -n, -c, --delete, --link-dest | Página oficial de rsync (samba.org) y `rsync --help` local (3.2.7). |
| 14 | `rsync --delete` actúa como espejo, sin historial (consecuencia lógica). | Formal; tarjeta t-rsync-espejo | rsync-man | --delete | Deducción de la semántica de `--delete`; la marco como consecuencia en el texto. |
| 15 | `pg_dump` saca foto consistente sin bloquear lecturas/escrituras (salvo operaciones con lock exclusivo); formato `-Fc` + `pg_restore`. | Formal; tarjeta t-pg-dump-consistente | postgres-dump | §25.1 | Leí la página (PostgreSQL 18). No ejecuté pg_dump localmente. |
| 16 | Timer de systemd: `OnCalendar=` y `Persistent=true` (recupera ejecución perdida). | Formal; tarjeta t-timer-persistent | systemd-timer | OnCalendar=, Persistent= | Página oficial. |
| 17 | Espacio: 4·500 + 4·6·25 = 2600 GB. | ejercicio e-espacio-respaldo | cisa-backup | — | Calculé con Python. |
| 18 | Caso c-ransomware-viernes (aislar, restaurar en directorio de prueba, informar RPO real). | caso | cisa-ransomware | Partes 1 y 2 | La conducta "aislar antes de restaurar" es práctica general; la guía de CISA que leí menciona reconectar después de restaurar, y no verifiqué una cita textual de "aislar primero". |

### Fuentes del tema
- `nist-800-34`: NIST SP 800-34 Rev. 1, *Contingency Planning Guide for Federal Information Systems*, mayo de 2010 (Swanson et al.). Acceso: PDF libre en nvlpubs.nist.gov; páginas citadas son las impresas del documento.
- `cisa-backup`: Ruggiero y Heckathorn, *Data Backup Options*, US-CERT/CISA, 2012. Acceso: PDF libre en cisa.gov.
- `cisa-ransomware`: CISA, #StopRansomware Guide (web, consultada 2026-11-11).
- `rsync-man`, `postgres-dump`, `systemd-timer`: documentación oficial.
- `backblaze-321`: blog, solo "para ver más". Esa página dice que la regla es de la "late aughts" y cita el paper de US-CERT; no atribuye a Krogh.

### Números y datos inventados para ejemplos
- "Viernes 17:50/17:30", respaldo a las 2:00, disco USB de hace 22 días, NAS siempre montado: ilustrativos.
- 900 GB a 100 MB/s, respaldo completo de 500 GB e incrementales de 25 GB: ilustrativos.
- Fecha del timer y rutas `/mnt/respaldo/...`: ilustrativas.

## contenedores-docker

| # | Afirmación clave (mi paráfrasis) | Dónde está | Fuente (id) | Ubicación exacta | Cómo la verificaste |
|---|---|---|---|---|---|
| 1 | Contenedor = proceso aislado, autocontenido, independiente y portable. | Formal; tarjeta t-contenedor-definicion | docker-container | What a container is | Leí la página oficial. |
| 2 | Imagen = paquete con archivos, ejecutables, librerías y configuración; inmutable; hecha de capas. | Formal; tarjeta t-imagen-inmutable | docker-image | Immutability, Layers | Leí la página oficial. |
| 3 | Instrucciones FROM, WORKDIR, COPY, RUN, CMD (solo vale el último), EXPOSE (no publica); forma exec (lista) sin shell. | Formal; tarjeta t-expose-no-publica; ejercicio e-vf-expose-publica; problema p-dockerfile-propio | dockerfile-ref | secciones FROM, RUN, CMD, EXPOSE, Shell and exec form | Leí la página (truncada después de ARG; no leí HEALTHCHECK y no lo uso). |
| 4 | `docker run`: `-d` segundo plano, `-p host:contenedor`, `--name`, `--rm`, `--restart`; `--rm` y `--restart` no se combinan (error). | Formal; tarjeta t-rm-restart | docker-run | opciones | Página oficial y `docker run --help` local (29.1.3). |
| 5 | `docker stop` manda SIGTERM y, tras 10 s en Linux, SIGKILL; `-t` cambia el tiempo. | Formal; tarjeta t-stop-senal | docker-stop | descripción y opciones | Página oficial y `docker stop --help` local. |
| 6 | La capa de escritura se pierde al borrar el contenedor; un volumen persiste. | Formal; tarjeta t-volumen-sobrevive; ejercicio e-datos-sobreviven | docker-volumes | Data Survival After Container Removal; Loss of the Writable Layer | Leí la página oficial. |
| 7 | Políticas: `no` (defecto), `on-failure[:max]` (no reinicia con el daemon), `always` (tras stop manual vuelve con el daemon), `unless-stopped` (no vuelve). | Formal (tabla); tarjetas t-restart-default, t-always-vs-unless; ejercicio e-unless-stopped-reinicio-daemon; problema p-politicas-reinicio-local | docker-restart | Use a restart policy | Leí la página dos veces para el caso de on-failure. Coincide con SIMULADORES.md §2.9. |
| 8 | La política rige solo tras arrancar con éxito (≥10 s arriba). | Formal; tarjeta t-restart-diez-segundos | docker-restart | Restart policy details | Idem. El simulador no modela los 10 s: lo digo en el texto. |
| 9 | Docker desaconseja combinar sus políticas con un administrador de procesos del host. | Formal | docker-restart | Use a process manager | Idem. |
| 10 | Pod: unidad más chica desplegable, contenedores que comparten almacenamiento y red; efímeros; no se crean a mano. | Formal; tarjeta t-pod-definicion | k8s-pods | What is a Pod?; Pods and controllers | Leí la página oficial. |
| 11 | Deployment: estado deseado, controlador lo iguala, ReplicaSet mantiene la cantidad de Pods. | Formal | k8s-deployment | Use Case | Leí la página (truncada; no leí la sección de estrategia y no cito los porcentajes por defecto). |
| 12 | Reinicio de contenedores: espera creciente 10 s, 20 s, 40 s…, tope 300 s, reset tras 10 min; `CrashLoopBackOff`. | Formal; tarjeta t-crashloop; ejercicio e-espera-total-backoff | k8s-lifecycle | Container restarts; CrashLoopBackOff | Leí la página oficial (segunda parte, offset 100000). La duplicación exacta tras 40 s (80, 160…) es mi lectura de "10s, 20s, 40s, …"; el texto solo da la serie inicial y el tope. |
| 13 | Probes: liveness reinicia, readiness saca del tráfico (EndpointSlices) sin reiniciar, startup retiene a los otros y solo corre al inicio; un liveness mal hecho puede causar fallas en cascada. | Formal; tarjeta t-readiness-que-hace | k8s-probes | Liveness, Readiness, Startup probe | Leí la página oficial (concepts). |
| 14 | Con dependencia estricta de servicios externos: liveness = app sana; readiness además chequea el backend. | Formal; ejercicio e-probe-dependencia-externa | k8s-probes | When should you use a readiness probe? | Idem. La página no dice literalmente "no chequees dependencias en liveness"; lo expreso como práctica documentada, sin esa frase. |
| 15 | Comandos kubectl: `get pods`, `describe pods`, `logs --previous`, `rollout undo`. | Formal | k8s-kubectl | quick reference | Vi los ejemplos en la página (offset 100000). No tengo `kubectl` instalado para probarlos. |
| 16 | `docker system prune -a` borra todas las imágenes sin usar (no solo las dangling). | caso c-contenedor-restarting-3am | docker-restart (contexto) | — | `docker system prune --help` local. No está en las páginas citadas: lo respalda la ayuda local del CLI. |
| 17 | Espera total 10+20+40+80+160+300 = 610 s. | ejercicio e-espera-total-backoff | k8s-lifecycle | Container restarts | Calculé con Python (610; sin tope 630). |

### Fuentes del tema
- `docker-container`, `docker-image`, `dockerfile-ref`, `docker-run`, `docker-stop`, `docker-volumes`, `docker-restart`: docs.docker.com.
- `k8s-pods`, `k8s-deployment`, `k8s-lifecycle`, `k8s-probes`, `k8s-kubectl`: kubernetes.io.

### Números y datos inventados para ejemplos
- API de turnos 1.3/1.4, `DATABASE_URL`, horas 3:05 y 23:00: ilustrativos.
- El Dockerfile (`python:3.12-slim`, `app.py`): ilustrativo; no verifiqué ese tag de imagen.
- Nombre de volumen `datos` y puerto 8080: ilustrativos.

## Pedidos al director
- Los simuladores aparecen "en construcción": usé las props del contrato de `SIMULADORES.md` (`unidad-systemd`, `proceso-linux`, `contenedor-docker`, `modo="alertas"` con `pico-breve`, `disco-llenandose` y `carga-sostenida` con `nucleos={4}`, `modo="respaldo"`). El build valida las props; no pude ver los simuladores funcionando.
- Mis consignas y los "qué notar" describen el comportamiento del contrato de SIMULADORES.md (por ejemplo, 5 muertes en 10 s dejan `failed`; la alerta predictiva avisa con ≥3 h de anticipación; `always` vs `unless-stopped`; con `duracionMin = 5` el pico de `pico-breve` da 0 alertas). F4 debería comprobarlos contra el simulador ya construido. En `respaldo` describo el RTO real como el tiempo que el sistema queda caído mientras se restaura; si el simulador lo define distinto, hay que ajustar esa frase.
- El simulador `contenedor-docker` no modela la regla de los 10 segundos de Docker; lo aclaro en el texto del tema.
- Prerrequisito dentro del área: `servidores/linux-procesos-systemd-logs` en los temas 2 y 4 (existe en mi worktree).
- El PDF de Kerrisk no tiene páginas impresas: cité capítulo y sección.
- La alerta `for: 10m` y la expresión de Prometheus son ilustrativas; el texto lo aclara.

## Lo que no pude verificar
- Páginas truncadas por el visor: parte de systemd.unit, systemctl, Dockerfile reference (HEALTHCHECK), Deployment (estrategia), Pod Lifecycle (hasta el offset 100000). Usé solo lo que vi.
- `kubectl` no está instalado: los comandos de Kubernetes los verifiqué contra la referencia rápida, no ejecutándolos.
- No tuve acceso a *The DAM Book* de Peter Krogh (origen de la regla 3-2-1): la atribución sale de la nota 1 del documento de US-CERT/CISA.
- No verifiqué el tag `python:3.12-slim` ni los valores `mode="idle"` del node exporter.
- No ejecuté `pg_dump`/`pg_restore`, `rsync` con datos reales ni nada de Docker/Kubernetes más allá de `--help`.

## Libros que conviene pedirle al dueño
- Evi Nemeth, Garth Snyder, Trent Hein, Ben Whaley y Dan Mackin, *UNIX and Linux System Administration Handbook* (5.ª ed., Addison-Wesley, 2017): el libro de referencia de administración (procesos, servicios, logs, backups, monitoreo); no tuve acceso.
- Peter Krogh, *The DAM Book: Digital Asset Management for Photographers* (2.ª ed., O'Reilly, 2009), p. 207: origen de la regla 3-2-1.
- Andrew S. Tanenbaum y Herbert Bos, *Modern Operating Systems* (capítulo de procesos y estados) o Silberschatz, Galvin y Gagne, *Operating System Concepts*: para anclar la teoría de estados de proceso con la bibliografía de la cátedra (3649).
- Opcional: *Kubernetes: Up & Running* (O'Reilly) para profundizar la orquestación más allá de la documentación oficial.
