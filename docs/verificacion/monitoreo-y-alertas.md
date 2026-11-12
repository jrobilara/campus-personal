# Verificación F4 — monitoreo-y-alertas

- **Tema:** servidores/monitoreo-y-alertas
- **Fecha:** 2026-11-11
- **Verificador:** F4 (agente distinto del autor)
- **Veredicto:** OBSERVADO

Alcance: `tema.mdx`, `practica.yaml` y las filas de `FUENTES-servidores.md`. Los simuladores son stubs en el worktree; las consignas se contrastaron con el contrato de `SIMULADORES.md` §2.10.

Punto pendiente que señaló el autor: `mode="idle"` del node exporter. La guía de Prometheus (prom-node-exporter) solo muestra `mode="system"`, así que la cita sola no lo respalda. Lo verifiqué en el código del exporter (`collector/cpu_linux.go`: `cpu`, `mode` y el valor `"idle"`). El hecho es correcto; la cita está floja (ver H2).

## Afirmaciones revisadas

| # | Afirmación | Fuente | Ubicación | Resultado | Nota |
|---|---|---|---|---|---|
| 1 | Cuatro señales: latencia (éxito y falla por separado), tráfico, errores, saturación (recurso más limitado) | Beyer et al., SRE | cap. 6, "The Four Golden Signals" | ✅ | "distinguish between the latency of successful requests and ... failed". |
| 2 | Error lento es especialmente dañino | SRE | cap. 6, Four Golden Signals | ✅ | El capítulo dice que un error lento es peor que uno rápido. |
| 3 | El promedio esconde una cola lenta; conviene la distribución | SRE | cap. 6, "Worrying About Your Tail" | ✅ | Ejemplo del libro: 100 ms promedio a 1000 req/s, "1% of requests might easily take 5 seconds". |
| 4 | Load average = procesos ejecutándose, esperando CPU o en E/S no interrumpible; 1, 5, 15 min | uptime(1) | DESCRIPTION | ✅ | Man local procps 4.0.4. |
| 5 | No se normaliza por CPU; load 1 en 4 CPU = 75 % ocioso | uptime(1) | DESCRIPTION | ✅ | Literal en la man page. |
| 6 | El kernel lo calcula como promedio exponencial decreciente | kernel/sched/loadavg.c | comentario de cabecera | ✅ | "an exponentially decaying average of nr_running + nr_uninterruptible". |
| 7 | `/proc/loadavg` trae los tres valores, procesos ejecutables y último PID | proc_loadavg(5) | /proc/loadavg | ✅ | Los 3 primeros campos, el 4.º "runnable/existentes", el 5.º PID más reciente. |
| 8 | `vmstat`: `r` ejecutables, `b` bloqueados en E/S, `si`/`so`, `wa`; primera línea = promedio desde el arranque | vmstat(8) | Procs, Swap, CPU, DESCRIPTION | ✅ | `b`: "blocked waiting for I/O to complete". |
| 9 | `free`: `available` estima memoria para apps nuevas sin swap, cuenta caché liberable | free(1) | available | ✅ | |
| 10 | `df -h`, `df -i`, `du -xh --max-depth=1`, `sort -h` | df(1), du(1) | opciones | ✅ | Verificados con `--help` local. `du -x`: no cruza sistemas de archivos. |
| 11 | Tres destinos: guardia, tickets, tableros | SRE | cap. 10, sección Alerting | ✅ | "page-worthy ... on-call", "important but subcritical ... ticket queues", "informational data for status dashboards". |
| 12 | Las reglas exigen una duración mínima antes de saltar | SRE | cap. 10, Alerting | ✅ | "minimum duration for which the alerting rule must be true". |
| 13 | Pocas alertas, síntomas del usuario, evitar avisos sin acción; acercarse a la capacidad puede pedir acción humana | Prometheus, Alerting | What to alert on, Capacity | ✅ | "as few alerts as possible ... symptoms ... end-user pain"; "close to capacity often requires human intervention". "avoid having pages where there is nothing to do" está en el resumen de la página. |
| 14 | Prometheus `for`: pending hasta sostenerse; luego firing; `keep_firing_for` | Prometheus, alerting rules | for, keep_firing_for | ✅ | |
| 15 | Regla de ejemplo PromQL | Prometheus, node exporter | — | ✅ | `1 - avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) > 0.9` es válida: la resta precede a la comparación. `mode="idle"` es un valor real del exporter. Marcada como ilustrativa en el texto. Ver H2 (cita). |
| 16 | `node_*` expone el node exporter | Prometheus, node exporter | guía | ✅ | "Metrics specific to the Node Exporter are prefixed with node_". |
| 17 | Criterios propios (relación ≈ 1; nueve días = ticket, cuatro horas = guardia) | — | — | ✅ | Marcados en el texto como criterio práctico, no de las fuentes. |
| 18 | Ejercicio e-load-contra-nucleos = 1,5 | uptime(1) | — | ✅ | 6/4 = 1,5 (Python). |
| 19 | Ejercicio e-dias-hasta-llenar = 9,8 | prom-practices | — | ✅ | 200·0,22 = 44 GB; 44/4,5 = 9,78 (Python). |
| 20 | Ejercicio e-dias-hasta-llenar, error común `43.3` | — | `erroresComunes` | ❌ | 200/4,5 = 44,4, no 43,3. Ver H1. |
| 21 | Ejercicio e-elegir-for-pico-backup (opción `for`) | Prometheus / SRE | — | ✅ | |
| 22 | Ejercicio e-vf-load-alto-cpu-baja = falso | uptime(1) | — | ✅ | |
| 23 | 10 tarjetas | ver filas 1-14 | — | ✅ | Atómicas. `t-load-que-cuenta` junta dos categorías en el dorso, pero responde una sola pregunta. Sin hallazgo. |
| 24 | Caso c-disco-96-de-madrugada: decisiones | SRE / práctica general | — | ✅ | Bien: mirar `df -h`/`du` antes de actuar, comprimir y mover (no borrar), buscar la causa, rotación y alerta predictiva. Malos: silenciar el canal y borrar todo `/var/log` quedan en `mal`. Sin paso peligroso presentado como bueno. |
| 25 | Caso: cuentas (96−60=36 %; 100−36=64 GB; 64/10=6,4 h) | — | — | ✅ | Python. |
| 26 | Caso: consistencia interna de tiempos | — | — | ⚠️ | Ver H3. |
| 27 | Consignas `pico-breve`, `disco-llenandose`, `carga-sostenida` | SIMULADORES.md §2.10 | — | ✅ | Umbral 90: 1 alerta con `duracionMin`=0 y 0 con 5; predictiva ≥3 h frente a 1 h con umbral 95 %; 1 min reacciona primero y 15 min tarda más. Coincide. |
| 28 | Plagio | fuentes | — | ✅ | Paráfrasis propia. |
| 29 | Estilo | GUIA-ESTILO | — | ✅ | |

## Hallazgos abiertos

**H1** — `practica.yaml` → `ejercicios[e-dias-hasta-llenar].erroresComunes[1]` (`valor: 43.3`).
- Qué está mal: la explicación dice "Calculaste 200 / 4,5 (el disco entero)", pero 200/4,5 = 44,44, no 43,3. El valor no coincide con el error que describe, así que el feedback nunca se dispararía para quien cometa ese error.
- Qué dice la fuente: es aritmética (recalculada con Python: 200/4,5 = 44,444…).
- Corrección propuesta: `valor: 44.4`.

**H2** — `tema.mdx` Formal, `<Cita f="prom-node-exporter" />` tras "Las métricas `node_*` ... las expone el node exporter", y bloque YAML con `mode="idle"`; `FUENTES-servidores.md` fila 14.
- Qué está mal: la guía citada solo muestra `node_cpu_seconds_total{mode="system"}`. El valor `mode="idle"` queda sin respaldo en una fuente listada (el autor lo admite).
- Qué dice la fuente: el código del exporter (`collector/cpu_linux.go`, github.com/prometheus/node_exporter) emite la serie con las etiquetas `cpu` y `mode` y el valor `"idle"` (también `iowait`, entre otros).
- Corrección propuesta: sumar el repositorio de node_exporter (collector cpu) como fuente o `loc`, o dejar la nota de que `idle` es la convención del exporter con cita al código. Severidad baja: el dato es correcto.

**H3** — `practica.yaml` → `casos[c-disco-96-de-madrugada].contexto` y nodo `final-silenciar`, frente a `miras-crecimiento` y al `<CasoReal>`.
- Qué está mal: el disco de 100 GB está al 96 % (4 GB libres) y el desenlace dice que "a las 4:05 se llena" (53 min → ~4,5 GB/h), pero el nodo siguiente afirma que un log crece 10 GB/h. A 10 GB/h los 4 GB se acabarían en ~24 min. Además "unas seis horas y media" (64/10) supone que ese ritmo sigue después de liberar espacio, lo cual es coherente solo si el ritmo ya era 10 GB/h antes.
- Qué dice la fuente: es consistencia interna del escenario ilustrativo.
- Corrección propuesta: unificar el ritmo (por ejemplo 5 GB/h → llena a las 4:05 y quedan ~12,8 h tras liberar 60 GB) o cambiar el horario del desenlace. Severidad baja.

**H4** (menor, no bloquea) — `tema.mdx` frontmatter `fuentes[sre-monitoring/sre-alerting].edicion`: dice "© 2017 Google, publicado por O'Reilly"; el BRIEF habla de O'Reilly 2016. Aclarar "1.ª ed., O'Reilly, 2016 (edición online © 2017 Google)". Sin impacto en el contenido.
