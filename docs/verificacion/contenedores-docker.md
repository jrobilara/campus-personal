# Verificación F4 — contenedores-docker

- **Tema:** servidores/contenedores-docker
- **Fecha:** 2026-11-11
- **Verificador:** F4 (agente distinto del autor)
- **Veredicto:** APROBADO (re-verificación sobre a78c34f; primera pasada sobre 6b629de: OBSERVADO)

Alcance: `tema.mdx`, `practica.yaml` y las filas de `FUENTES-servidores.md`. Los simuladores son stubs; la consigna se contrastó con `SIMULADORES.md` §2.9 (preset `contenedor-docker`). Docker 29.1.3 local solo con `--help`.

Puntos que marcó el autor:
- **HEALTHCHECK de Dockerfile reference:** el tema no lo afirma ni lo usa; sin hallazgo.
- **Estrategia del Deployment:** el tema no dice nada de `RollingUpdate`/`strategy`; solo usa la definición y la relación con ReplicaSet. Sin hallazgo por el truncamiento.
- **Pod Lifecycle (comienzo truncado):** leí la sección Container restarts y las dos subsecciones de retardo. Lo que usa el tema está ahí (ver filas 15-17 y H5).
- **Tag `python:3.12-slim`:** existe en Docker Hub (API `library/python/tags/3.12-slim`, estado `active`, actualizado 2026-11-08, con imágenes `linux/amd64` entre otras).
- **Duplicación del backoff (80 s, 160 s):** confirmada. La página dice que los retardos aumentan "exponentially by 2x each restart" (10, 20, 40, 80, 160, 300 con tope).

## Afirmaciones revisadas

| # | Afirmación | Fuente | Ubicación | Resultado | Nota |
|---|---|---|---|---|---|
| 1 | Contenedor = proceso aislado, autocontenido, independiente, portable | Docker, *What is a container?* | "Explanation" | ⚠️ | Contenido ✓ ("containers are isolated processes ..."; Self-contained, Isolated, Independent, Portable), pero no existe una sección "What a container is". Ver H1. |
| 2 | Imagen inmutable, hecha de capas | Docker, *What is an image?* | Explanation | ✅ | "Images are immutable"; "composed of layers". Las viñetas se llaman Immutability y Layers. |
| 3 | `FROM`, `WORKDIR`, `COPY`, `RUN`, `CMD` (solo vale el último), `EXPOSE` no publica | Dockerfile reference | secciones | ✅ | "If you list more than one CMD, only the last one takes effect"; "EXPOSE doesn't actually publish the port". |
| 4 | Forma exec (lista) sin shell | Dockerfile reference | Shell and exec form | ✅ | "The shell form automatically uses a command shell, whereas the exec form does not." |
| 5 | Dockerfile de ejemplo (`python:3.12-slim`) | Docker Hub | — | ✅ | El tag existe. Sintaxis correcta. |
| 6 | `docker run`: `-d`, `-p host:contenedor`, `--name`, `--rm`; `--rm` + `--restart` da error | docker container run | opciones | ✅ | "Combining --restart with the --rm flag results in an error." |
| 7 | `docker build -t`, `docker ps -a`, `docker logs -f --tail 100`, `docker stop` | Docker CLI | — | ✅ | Existen; `--help` local. |
| 8 | `docker stop`: SIGTERM, a los 10 s SIGKILL; `-t` cambia el plazo | docker container stop | descripción | ✅ | "10 seconds for Linux containers"; `-t, --timeout` verificado con `--help`. |
| 9 | La capa de escritura se pierde al borrar el contenedor; un volumen persiste | Docker, Volumes | "Data Survival After Container Removal" | ⚠️ | Contenido ✓; esos títulos no existen en la página. Ver H1. |
| 10 | Políticas `no` (defecto), `on-failure[:max]` (no reinicia con el daemon), `always`, `unless-stopped` | Docker, Start containers automatically | Use a restart policy | ✅ | La tabla del tema coincide con la doc y con `SIMULADORES.md` §2.9. |
| 11 | La política rige tras estar arriba ≥10 s | Docker, Start containers automatically | Restart policy details | ✅ | "up for at least 10 seconds". El tema aclara que el simulador no lo modela. |
| 12 | "Si lo detenés a mano, la política se ignora hasta que se reinicie el daemon o lo reinicies vos" | Docker, Start containers automatically | Restart policy details | ⚠️ | Casi literal de la doc, pero choca con la fila `unless-stopped` de la tabla del propio tema. Ver H3. |
| 13 | Docker desaconseja combinar políticas con un administrador de procesos del host | Docker, Start containers automatically | Use a process manager | ✅ | "Don't combine Docker restart policies with host-level process managers". |
| 14 | Pod: unidad más chica, contenedores con almacenamiento y red compartidos; efímero; "casi nunca se crean a mano" | Kubernetes, Pods | What is a Pod? / Working with Pods | ✅ | "smallest deployable units", "relatively ephemeral, disposable", "You'll rarely create individual Pods directly". La página permite gestionarlos directamente, y el tema dice "casi nunca": correcto. |
| 15 | Deployment: estado deseado; controlador lo iguala; ReplicaSet mantiene la cantidad de Pods | Kubernetes, Deployments | Use Case | ⚠️ | Las dos primeras ideas están en la introducción; lo de "ReplicaSet mantiene la cantidad de Pods" está en la página de ReplicaSet, no en "Use Case". Ver H4. |
| 16 | Reinicio con espera creciente 10 s, 20 s, 40 s..., tope 300 s, reset tras 10 min | Kubernetes, Pod Lifecycle | Container restarts | ✅ | Texto: "exponential backoff delay (10s, 20s, 40s, …), capped at 300 seconds"; "resets the restart backoff timer" tras 10 min. "2x each restart" confirma 80/160. Ver H5 por los valores configurables. |
| 17 | `CrashLoopBackOff` = el mecanismo de espera está activo | Kubernetes, Pod Lifecycle | CrashLoopBackOff | ✅ | |
| 18 | Probes: liveness reinicia; readiness quita la IP de los Services sin reiniciar; startup retiene a los otros y corre solo al inicio | Kubernetes, probes | secciones | ✅ | EndpointSlices de todos los Services que coinciden; startup "only executed at startup". |
| 19 | Liveness mal diseñado → fallas en cascada | Kubernetes, probes | Liveness probe (Caution) | ✅ | "Incorrect implementation of liveness probes can lead to cascading failures." |
| 20 | Con dependencia de back-end: liveness = app sana; readiness además chequea la dependencia | Kubernetes, probes | When should you use a readiness probe? | ✅ | Texto casi equivalente en la página ("liveness passes when the app itself is healthy, but readiness additionally checks ... back-end service"). |
| 21 | `kubectl get pods`, `describe pods`, `logs --previous`, `rollout undo deployment/...` | kubectl Quick Reference | ejemplos | ✅ | Los cuatro aparecen en la referencia rápida (`logs my-pod --previous`; `rollout undo deployment/frontend`). `kubectl` no está instalado localmente. |
| 22 | `docker system prune -a` borra todas las imágenes sin usar | `docker system prune --help` | — | ✅ | Respaldo local; no está en las páginas citadas (el autor lo declara). |
| 23 | Ejercicio e-espera-total-backoff = 610 s | k8s-lifecycle | — | ✅ | 10+20+40+80+160+300 = 610 (Python); errores comunes 630 y 310 correctos. |
| 24 | Ejercicios restantes (unless-stopped, probe con dependencia, V/F EXPOSE, datos en volumen) | docker-restart, k8s-probes, dockerfile-ref, docker-volumes | — | ✅ | Respuestas correctas. |
| 25 | Caso c-contenedor-restarting-3am | Docker CLI | — | ⚠️ | Buenas prácticas marcadas: leer el log primero, rollback a la imagen conocida, anotar la causa; `docker system prune -a -f` e invento de una cadena de conexión quedan en `mal`. Falta un paso para que el rollback sea ejecutable. Ver H2. |
| 26 | Consigna del simulador `contenedor-docker` | SIMULADORES.md §2.9 | — | ✅ | `always`: tras `docker stop` queda `exited` y vuelve con `reiniciar el daemon`; `unless-stopped` no; `on-failure` no. Coincide. |
| 27 | Tarjetas | ver filas | — | ⚠️ | 12 tarjetas, correctas. Ver H6. |
| 28 | Plagio | docs.docker.com, kubernetes.io | — | ✅ | Paráfrasis propia. El texto de readiness/dependencia se parece en estructura a la página pero está reformulado. |
| 29 | Estilo | GUIA-ESTILO | — | ✅ | |

## Hallazgos abiertos

**H1** — `tema.mdx`: `<Cita f="docker-volumes" loc="Data Survival After Container Removal" />` y frontmatter `fuentes[docker-container].ubicacion` ("sección What a container is"); `<Cita f="docker-container" loc="What a container is" />`; `FUENTES-servidores.md` filas 1 y 6.
- Qué está mal: esos nombres de sección no existen. En la página de Volumes los títulos son "A volume's lifecycle", etc. (no hay "Data Survival After Container Removal" ni "Loss of the Writable Layer"). En *What is a container?* el contenido está en "Explanation" (no hay "What a container is").
- Qué dice la fuente: Volumes, "A volume's lifecycle": "When a container is destroyed, the writable layer is destroyed with it" y "Using a volume ensures that the data is persisted even if the container using it is removed." *What is a container?*, "Explanation": "containers are isolated processes for each of your app's components".
- Corrección propuesta: `loc="A volume's lifecycle"` y `loc="Explanation"` (y ajustar `ubicacion` y FUENTES).

**H2** — `practica.yaml` → `casos[c-contenedor-restarting-3am]`, nodo `ver-log`, opción "Vuelvo a levantar la versión 1.3 con el mismo comando y las mismas variables de antes" (camino `bien`).
- Qué está mal: el contenedor `turnos` (versión 1.4) sigue existiendo y en `Restarting`, y probablemente ocupa el nombre y el puerto 8080. Un `docker run --name turnos ...` fallaría con nombre en uso. El camino bueno no incluye parar o quitar el contenedor roto (o ponerle otro nombre), y la consecuencia "responde en menos de un minuto" no es alcanzable tal cual.
- Qué dice la fuente: comportamiento de Docker (los nombres de contenedor son únicos; verificable con `docker run --help`, `--name`). La documentación de restart policy no cubre el paso.
- Corrección propuesta: reescribir la opción como "Paro el contenedor roto (`docker stop turnos`; lo dejo con otro nombre para conservar el log) y levanto la 1.3 con el comando y las variables anteriores". Así se conserva además el log del contenedor roto, que `docker rm -f` destruiría.

**H3** — `tema.mdx` Formal, "Políticas de reinicio": "Si lo detenés a mano, la política se ignora hasta que se reinicie el daemon o lo reinicies vos."
- Qué está mal: es verdadero para `always`, pero falso para `unless-stopped` (el propio tema lo dice dos líneas arriba en la tabla: "Queda detenido") y para `on-failure`. Leída sola, la oración contradice la tabla.
- Qué dice la fuente: Docker, Restart policy details usa esa frase en general; en la tabla de políticas dice `always`: "If it's manually stopped, it's restarted only when Docker daemon restarts" y `unless-stopped`: "isn't restarted ... even after Docker daemon restarts".
- Corrección propuesta: "Con `always`, si lo detenés a mano la política se ignora hasta que se reinicie el daemon; con `unless-stopped`, ni siquiera entonces vuelve".

**H4** — `tema.mdx`, `<Cita f="k8s-deployment" loc="Use Case" />` (y `fuentes[k8s-deployment].ubicacion` "Use Case y Creating a Deployment"); `FUENTES-servidores.md` fila 11.
- Qué está mal: "estado deseado" y "controlador lo iguala" están en la introducción de la página; "el ReplicaSet mantiene la cantidad de Pods" no está en "Use Case" (allí solo se dice "The ReplicaSet creates Pods in the background"). Lo afirmado es correcto, pero la ubicación citada no lo respalda entera.
- Qué dice la fuente: Deployments, intro: "You describe a desired state in a Deployment, and the Deployment Controller changes the actual state to the desired state at a controlled rate". ReplicaSet: "A ReplicaSet's purpose is to maintain a stable set of replica Pods running at any given time."
- Corrección propuesta: citar la introducción de Deployments para lo primero y agregar la fuente ReplicaSet (kubernetes.io/docs/concepts/workloads/controllers/replicaset/) para lo segundo. Hay que sumarla a `fuentes` y usarla (regla de integridad).

**H5** (menor) — `tema.mdx`, Formal "Orquestación básica": "una espera creciente (10 s, 20 s, 40 s, y así) que se frena en 300 segundos".
- Qué está mal: es el valor por defecto, pero la página actual agrega que el tope es configurable por nodo (`maxContainerRestartPeriod`, entre 1 s y 300 s; Beta desde v1.35) y que existe `ReduceDefaultCrashLoopBackOffDecay` (Alpha desde v1.33: empieza en 1 s y llega a 60 s). El ejercicio e-espera-total-backoff asume los defaults sin decirlo. También omite que el reinicio depende de `restartPolicy` (por defecto `Always`).
- Corrección propuesta: "por defecto" en el texto y en el enunciado del ejercicio ("con los valores por defecto"); mencionar `restartPolicy`.

**H6** (menor, no bloquea) — `practica.yaml`, tarjetas.
- `t-volumen-sobrevive` mezcla dos ideas (capa de escritura y volumen) y `t-stop-senal` pregunta dos cosas (qué señal y cuánto espera). La guía pide una idea por tarjeta: dividirlas.
- Definiciones/"qué es": `t-contenedor-definicion`, `t-pod-definicion` y `t-crashloop` suman 3 (máximo 2 por tema).
- `t-imagen-inmutable` dorso: "se agregan cambios encima en una capa nueva" sugiere que la imagen se modifica; mejor "se construye otra imagen".

## Re-verificación (cierre de F4) — diff 6b629de..a78c34f

Revisé solo lo que cambió. `npm run build` en Node 24: verde.

| Hallazgo | Estado | Verificación |
|---|---|---|
| H1 (secciones inexistentes) | CERRADO (a78c34f) | `loc="Explanation"` (What is a container?) y `loc="A volume's lifecycle"` (Volumes) existen en las páginas y contienen lo citado (ya contrastado en la primera pasada). `ubicacion` y FUENTES alineadas. |
| H2 (rollback del caso) | CERRADO (a78c34f) | Nueva opción: `docker stop turnos`, renombrar el contenedor roto y levantar la 1.3. Es correcto: `docker stop` detiene un contenedor en `Restarting` y, al ser un stop manual, la política `unless-stopped` no lo reinicia (docs: "when the container is stopped (manually or otherwise), it isn't restarted"); `docker rename CONTAINER NEW_NAME` existe (`--help` local); el contenedor no usa `--rm`, así que conserva el log; el nombre y el puerto quedan libres. La consecuencia describe eso. Observación menor, sin hallazgo: la opción nombra "lo renombro" sin dar el comando; FUENTES fila 15b lo documenta. |
| H3 (política ignorada tras stop manual) | CERRADO (a78c34f) | Oración separada por política: `always` se ignora hasta reiniciar el daemon; `unless-stopped` ni así. Coincide con la tabla del tema y con la doc. |
| H4 (ReplicaSet citado a Use Case) | CERRADO (a78c34f) | Nueva fuente `k8s-replicaset`, usada con `<Cita f="k8s-replicaset" loc="introducción" />`. Releí la página: "A ReplicaSet's purpose is to maintain a stable set of replica Pods running at any given time." El Deployment se cita a su introducción (estado deseado, controlador). |
| H5 (backoff por defecto) | CERRADO (a78c34f) | Agrega `restartPolicy` (Always/OnFailure/Never, default Always) y aclara que 300 s es el tope por defecto y configurable; coincide con Pod Lifecycle (Container restarts; Configurable container restart delay). Ejercicio con "Con los valores por defecto"; 610 s recalculado. |
| H6 (tarjetas) | CERRADO (a78c34f) | `t-stop-senal`/`t-stop-plazo` y `t-capa-escritura-se-pierde`/`t-volumen-sobrevive` quedaron atómicas y correctas (10 s a SIGKILL y `-t`; capa destruida con el contenedor, volumen persiste). `t-imagen-inmutable` ya no sugiere modificar la imagen. `t-pod-efimero` (aplicación) y `t-crashloop` reformulada: solo queda una tarjeta de definición. `t-pod-efimero` es correcta: Pods and controllers dice que un controlador crea un Pod de reemplazo si falla el nodo. |

Hallazgos nuevos por los cambios: ninguno.

Hallazgos abiertos: ninguno.
