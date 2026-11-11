# BRIEF PARA ESCRITORES (F3) — campus-personal v1

> Encargo común para los 6 escritores de contenido, uno por área. Cada escritor lee este documento entero (la parte común y **su** sección de área en §7) y no ve a los demás ni al constructor de la app (F2). Todo lo que necesitás está acá o en los documentos que se listan abajo.

## 1. Qué leer, en este orden

1. `docs/modulos/v1/SPEC.md` — el plano (secciones "Alcance v1", "Temas de v1" y "Criterios de aceptación").
2. `docs/NORTE.md` — para quién es: al dueño le cansa la teoría demasiado estructurada; el gancho va primero.
3. `docs/modulos/v1/diseno/CONTRATO-CONTENIDO.md` — la forma exacta de los archivos. **El tema de ejemplo (§9) es tu plantilla**: copiá su estructura.
4. `docs/modulos/v1/diseno/GUIA-ESTILO.md` — la voz, los largos, las citas, las reglas para tarjetas y ejercicios.
5. `docs/modulos/v1/diseno/SIMULADORES.md` — los 12 simuladores, sus props y cuáles te tocan (§3).
6. `docs/modulos/v1/investigacion/unlam-planes.md` — las materias UNLaM y sus contenidos mínimos, para el campo `materias` y para el ángulo.

## 2. Dónde escribís (y nada más)

Escribís **solo** en:

- `src/content/temas/<tu-area>/` — una carpeta por tema con `tema.mdx` y `practica.yaml`, con los slugs exactos de §7.
- `docs/modulos/v1/fuentes/FUENTES-<tu-area>.md` — tu registro de afirmaciones y citas (§6).

No tocás nada más: ni `src/content/areas.yaml`, ni `src/content/temas/ejemplo/`, ni otras áreas, ni código (`src/` fuera de tu carpeta, `astro.config.mjs`, `package.json`), ni otros documentos. Si algo del contrato no te alcanza, **no lo cambies**: anotalo en la sección "Pedidos al director" de tu `FUENTES-<tu-area>.md` y seguí con la opción más cercana del contrato.

Trabajás en tu propio worktree de git (te lo da el director, partiendo de un `main` que ya tiene el hito 0 de F2). Así tu `npm run build` no choca con el de los demás. Al terminar, commiteás solo tus dos rutas: `git add src/content/temas/<tu-area> docs/modulos/v1/fuentes/FUENTES-<tu-area>.md`.

## 3. Mínimos (el build los hace cumplir)

Por tema:
- Las tres secciones `<CasoReal titulo="…">`, `<Intuicion>`, `<Formal>`, en ese orden y sin nada afuera (la práctica y las fuentes las dibuja la página).
- En `<Intuicion>`: ≥1 `<Analogia>` y ≥1 simulador del catálogo. En `<Formal>`: ≥1 `<Cita>`.
- ≥2 fuentes con `verMas: false`, todas usadas (citadas en el cuerpo o como `fuente` de alguna pieza de práctica).
- ≥6 tarjetas, ≥3 ejercicios de ≥2 tipos, ≥2 problemas recomendados.
- ≥1 caso de guardia en **todos** los temas de Arquitecturas, Servidores y Soporte (en las otras áreas es opcional y suma).
- Ids estables con prefijo (`t-`, `e-`, `c-`, `p-`), en kebab-case, que describan la idea.

Por área: los 4 temas de §7. El mínimo del SPEC es 3; el 4.º entra si pasa la verificación de F4. Escribí los 4.

## 4. Fuentes permitidas

- Bibliografía de cátedra y libros clásicos: Stewart, Grossman, Strang, Tanenbaum, Silberschatz, Ross, Walpole, Montgomery, Cormen, Kleppmann, etc. Con autor, título, edición y año, capítulo o sección.
- Documentación oficial: man pages de Linux y systemd, Docker, Kubernetes, PostgreSQL, Axelos/PeopleCert (ITIL 4), NIST, RFC de la IETF, Microsoft Learn (Azure Architecture Center), Google SRE (libros publicados por Google en sre.google). Con URL estable y sección.
- Cursos universitarios abiertos: MIT OpenCourseWare, Khan Academy. Con URL y clase o unidad.
- Videos y blogs (incluidos blogs de empresas): **solo** como "para ver más" (`tipo: video` o `blog`, `verMas: true`). Nunca respaldan un dato.
- Las fuentes candidatas de cada área (§7) son eso, **candidatas**: confirmá vos edición, año, capítulo y URL antes de usarlas. Si no podés acceder a una fuente, no la cites: buscá otra válida.
- Prohibido copiar texto: paráfrasis propia siempre (`GUIA-ESTILO.md` §3).

## 5. Cómo validar localmente

```bash
nvm use                 # Node 24 (esta PC trae Node 25, que Astro no soporta)
npm ci                  # la primera vez en tu worktree
npm run build           # valida esquemas, reglas cruzadas y props de simuladores
CAMPUS_ESTRICTO=1 npm run build   # además: ≥3 temas y ≥2 simuladores en tu área, prerrequisitos existentes
npm run dev             # para mirar tus temas en http://localhost:4321/campus-personal/<area>/<tema>/
```

- Si el build falla, el mensaje dice archivo, campo y regla (`[contenido] src/content/temas/… → practica.yaml → tarjetas.3.dorso: no puede estar vacío`). Arreglá y volvé a correr hasta que dé verde.
- En modo estricto, un prerrequisito a un tema de **otra** área va a fallar si ese tema todavía no existe en tu worktree: es esperable. Usá solo los slugs de §7 y anotalo en tu `FUENTES-<tu-area>.md`.
- Los simuladores pueden verse como "simulador en construcción" mientras F2 los termina: lo que importa es que tus props validen.
- Si `src/content.config.ts` no existe en tu worktree, el hito 0 de F2 no llegó: avisale al director y seguí escribiendo según el contrato. No crees ese archivo vos.

## 6. `FUENTES-<tu-area>.md` (para el verificador de F4)

Un archivo por área en `docs/modulos/v1/fuentes/`, con esta forma:

```markdown
# FUENTES — <Nombre del área>
- Escritor: F3-<area> · Fecha: AAAA-MM-DD

## <slug-del-tema>
| # | Afirmación clave (tu paráfrasis) | Dónde está | Fuente (id) | Ubicación exacta | Cómo la verificaste |
|---|---|---|---|---|---|
| 1 | La mediana no cambia si se reemplaza el valor máximo por uno mayor. | Formal, §Robustez | ross | cap. 2, §2.3.2 | Leí la sección; el libro lo muestra con un ejemplo numérico. |
| 2 | … | tarjeta t-mediana-robusta | nist-eda | §1.3.5.1 | … |

### Fuentes del tema
- `ross`: Sheldon M. Ross, *Introduction to Probability and Statistics for Engineers and Scientists*, 6.ª ed., 2021, cap. 2. Acceso: (biblioteca / PDF de cátedra / vista previa).
- …

### Números y datos inventados para ejemplos
- "200 tickets por día" en el caso real: ilustrativo.

## Pedidos al director
- (lo que el contrato no cubría y cómo lo resolviste)
```

Reglas: una fila por cada afirmación clave del cuerpo **y** por cada tarjeta, ejercicio (su respuesta) y caso que afirme un hecho. "Dónde está" nombra la sección del tema o el id de la pieza. "Ubicación exacta" es lo que F4 va a abrir para comparar. Lo que no está en esta tabla, F4 lo marca como sin respaldo.

## 7. Las seis áreas

Para cada tema: slug (fijo), título sugerido (podés mejorarlo), ángulo laboral, materias de anclaje (`carrera` y `codigo` para el frontmatter), simuladores (de `SIMULADORES.md` §3), fuentes candidatas y advertencias. Los temas de la Lic. en Gestión de Tecnología (`lic-gestion-tecnologia`) se anclan **solo por nombre** de materia: su contenido no está publicado.

### 7.1 Análisis de datos — `src/content/temas/analisis-datos/`

Ángulo del área: el que arma el reporte del lunes, el tablero de la mesa de ayuda o la planilla de ventas, y tiene que defender sus conclusiones.

| orden | slug | Título sugerido | Ángulo laboral | Materias | Simuladores |
|---|---|---|---|---|---|
| 1 | `limpieza-y-eda` | Limpieza y exploración de datos (EDA) | Te pasan un Excel de tickets "listo para analizar": duplicados, vacíos, minutos mezclados con horas. | ing-informatica 3670 Ciencia de Datos; 3641 Bases de Datos Aplicada; lic-gestion-tecnologia 1325 Inteligencia de Negocios | `SimDatos dataset="tickets-sucios"` con `limpieza` |
| 2 | `elegir-el-grafico` | Elegir el gráfico correcto | El gerente pide "un gráfico de torta" para mostrar una tendencia de 24 meses. | 3670; 1325 | `SimDatos dataset="ventas-mensuales"` con `veredictos` |
| 3 | `sql-analitico` | SQL analítico: agregaciones y funciones de ventana | Ranking de vendedores por región y acumulado del mes sin subconsultas eternas. | 3641 Bases de Datos Aplicada; 3636 Bases de Datos; lic-gestion-tecnologia 1320 Explotación y Administración de BD | `SimTablaSQL` group-by + ventana |
| 4 | `regresion-y-causalidad` | Regresión lineal y correlación ≠ causalidad | "Cuando sube el uso de la VPN suben los incidentes": ¿cortamos la VPN? | 3670; 3651 Probabilidad y Estadística; 3656 Estadística Aplicada | `SimDatos dataset="anscombe"` + `dataset="confusora-temperatura"` |

Fuentes candidatas: Wickham, Çetinkaya-Rundel y Grolemund, *R for Data Science* (2.ª ed., 2023; versión libre en r4ds.hadley.nz); NIST/SEMATECH *e-Handbook of Statistical Methods*, cap. 1 (EDA); documentación de PostgreSQL ("Window Functions" del tutorial, "Window Function Calls" y "Window Functions" del manual de la versión vigente); Silberschatz, Korth y Sudarshan, *Database System Concepts* (7.ª ed., 2019); Montgomery y Runger, *Applied Statistics and Probability for Engineers* (regresión lineal simple); Freedman, Pisani y Purves, *Statistics* (4.ª ed., 2007, correlación y causalidad); MIT OCW 18.05 (Spring 2014).

Advertencias:
- `elegir-el-grafico`: las reglas sobre qué gráfico conviene son de criterio; respaldalas con fuente (Wickham et al., NIST, o un libro clásico de visualización que puedas citar con capítulo) y escribí los `veredictos` del simulador con la misma cita en el texto.
- `sql-analitico`: los ejemplos de SQL tienen que correr en PostgreSQL tal cual. Usá la misma tabla `ventas` del simulador (columnas `fecha`, `region`, `vendedor`, `monto`).
- `regresion-y-causalidad`: el cuarteto de Anscombe es de 1973 (*The American Statistician*); si lo citás, que sea por un libro o curso que lo trate, no por un blog.

### 7.2 Arquitecturas y microservicios — `src/content/temas/arquitecturas/`

Ángulo del área: el que tiene que decidir cómo partir un sistema, o el que lo opera cuando una pieza se cae. Todos los temas llevan ≥1 caso de guardia.

| orden | slug | Título sugerido | Ángulo laboral | Materias | Simuladores |
|---|---|---|---|---|---|
| 1 | `monolito-y-microservicios` | Monolito, monolito modular y microservicios | "Pasemos todo a microservicios" en un equipo de cuatro personas. | ing-informatica 3653 Arquitecturas de Sistemas Software; 3648 Diseño de Software; lic-gestion-tecnologia 1319 Arquitectura de Software | `SimFlujo modo="cadena"` + `SimGrafo grafo="microservicios-tienda" modo="propagar-falla"` |
| 2 | `sincrono-vs-asincrono` | Comunicación síncrona (REST) vs asíncrona (colas y Kafka) | El servicio de mails tarda y la compra entera queda esperando. | 3660 Sistemas Operativos Avanzados (u.6); 3653 | `SimFlujo modo="sincrono-vs-asincrono"` + `modo="cola"` |
| 3 | `escalabilidad-balanceo-cache` | Escalabilidad, balanceo de carga y caché | Hot Sale: el tráfico se multiplica por diez a las 0:00. | 3653; 3654 Virtualización de Hardware | `SimFlujo modo="balanceador" cache` |
| 4 | `resiliencia-y-cap` | Resiliencia: timeouts, reintentos, circuit breaker y CAP | El proveedor de pagos se cuelga y tus reintentos lo terminan de tirar. | 3653; 3660; 3658 Programación Concurrente | `SimMaquinaEstados preset="circuit-breaker"` |

Fuentes candidatas: Newman, *Building Microservices* (2.ª ed., 2021); Richards y Ford, *Fundamentals of Software Architecture* (O'Reilly, la edición que consultes, con año); Kleppmann, *Designing Data-Intensive Applications* (O'Reilly; cap. 8-9 para fallas parciales, consistencia y CAP); Tanenbaum y van Steen, *Distributed Systems* (versión descargable en distributed-systems.net); Nygard, *Release It!* (2.ª ed., 2018; circuit breaker y timeouts); Microsoft Azure Architecture Center (patrones Circuit Breaker, Retry, Queue-Based Load Leveling, Cache-Aside); documentación de Apache Kafka ("Introduction" y "Design").

Advertencias:
- CAP se explica mal en todos lados. No digas "elegí 2 de 3": la elección real es entre consistencia y disponibilidad **cuando hay una partición**. Respaldalo con Kleppmann o Tanenbaum.
- Reintentos: mencioná backoff exponencial con jitter y la idempotencia, con fuente (Azure Architecture Center o Nygard).
- La disponibilidad compuesta (producto de disponibilidades en serie) supone fallas independientes: decilo.

### 7.3 Servidores — `src/content/temas/servidores/`

Ángulo del área: el que está de guardia y tiene que entender qué pasa en una máquina Linux sin entrar en pánico. La facultad lo cubre poco (Virtualización de Hardware y SO): apoyate en documentación oficial. Todos los temas llevan ≥1 caso de guardia.

| orden | slug | Título sugerido | Ángulo laboral | Materias | Simuladores |
|---|---|---|---|---|---|
| 1 | `linux-procesos-systemd-logs` | Linux: procesos, servicios con systemd y logs | El servicio se reinicia en loop y después queda `failed`. | ing-informatica 3649 Sistemas Operativos; 3654 Virtualización de Hardware | `SimMaquinaEstados preset="unidad-systemd"` (+ `proceso-linux`) |
| 2 | `monitoreo-y-alertas` | Monitoreo (CPU, memoria, disco, load average) y alertas | 40 alertas por noche que nadie mira, y la que importaba se perdió. | 3654; 3649; lic-gestion-tecnologia 1317 Tópicos Avanzados de Redes | `SimSerieTemporal modo="alertas"` |
| 3 | `backups-rpo-rto` | Backups 3-2-1, RPO/RTO y restauración probada | Ransomware un viernes: hay backup, pero nadie lo restauró nunca. | 3641 Bases de Datos Aplicada (protección de datos); 3650 Seguridad de la Información (u.9 continuidad) | `SimSerieTemporal modo="respaldo"` |
| 4 | `contenedores-docker` | Contenedores (Docker) y orquestación básica | "En mi máquina anda": la misma imagen en desarrollo y en producción. | 3654 (contenedores/DevOps); 3660 Sistemas Operativos Avanzados | `SimMaquinaEstados preset="contenedor-docker"` |

Fuentes candidatas: man pages oficiales en freedesktop.org (`systemd.service(5)`, `systemd.unit(5)`, `systemctl(1)`, `journalctl(1)`) y en man7.org (`ps(1)`, `proc(5)`, `uptime(1)`); Tanenbaum y Bos, *Modern Operating Systems* (procesos y estados); Silberschatz, Galvin y Gagne, *Operating System Concepts*; Beyer et al., *Site Reliability Engineering* (Google/O'Reilly, 2016; libre en sre.google, cap. 6 "Monitoring Distributed Systems"); documentación de Prometheus (reglas de alerta, cláusula `for`); NIST SP 800-34 Rev. 1 (*Contingency Planning Guide*, RPO/RTO); documentación de Docker ("Start containers automatically" para políticas de reinicio, "Dockerfile reference") y de Kubernetes ("Pods", "Deployments", "Liveness, Readiness and Startup Probes").

Advertencias:
- Load average en Linux cuenta procesos ejecutables **y** en espera no interrumpible (estado `D`); compará contra la cantidad de núcleos. Respaldalo con man page o un libro, no con un blog.
- La regla 3-2-1 de backups se repite en todos lados sin fuente seria: buscá una fuente válida (organismo oficial como CISA o NIST); si no la encontrás, presentala como práctica difundida y citá lo que sí respalda (copias fuera de sitio, pruebas de restauración) en NIST SP 800-34.
- Los comandos van en bloques ```bash y tienen que ser correctos para una distribución actual con systemd (Debian/Ubuntu).
- Docker: lo que digas de `always` vs `unless-stopped` tiene que coincidir con el simulador (`SIMULADORES.md` §2.9) y con la documentación oficial.

### 7.4 Matemática y física aplicadas — `src/content/temas/matematica-fisica/`

Ángulo del área: la matemática de la facultad vista desde lo que resuelve: entrenar un modelo, transformar una imagen, rutear paquetes, entender por qué el wifi anda mal.

| orden | slug | Título sugerido | Ángulo laboral | Materias | Simuladores |
|---|---|---|---|---|---|
| 1 | `derivadas-y-gradiente` | Derivadas y descenso por gradiente | Cómo "aprende" un modelo de regresión: bajando una loma con los ojos cerrados. | ing-informatica 3622 Análisis Matemático I; 3639 Análisis Matemático III (gradiente); 3664 Inteligencia Artificial | `SimFuncion modo="tangente"` + `modo="descenso"` |
| 2 | `vectores-y-matrices` | Vectores y matrices como transformaciones | Rotar, escalar y proyectar: lo que hace una librería gráfica o un modelo con tus datos. | 3627 Álgebra y Geometría Analítica I; 3645 Álgebra y Geometría Analítica II | `SimTransformacion2D` |
| 3 | `grafos` | Grafos: rutas y dependencias | El camino más corto en un mapa y el orden en que `npm` instala paquetes. | 3621 Matemática Discreta; 3640 Algoritmos y Estructuras de Datos | `SimGrafo` camino-minimo + orden-topologico |
| 4 | `senales-frecuencia-ruido` | Señales: frecuencia, ancho de banda y ruido | Por qué un audio grabado a baja frecuencia de muestreo suena "metálico" y qué limita a una red. | 3634 Física II (corriente alterna); 3643 Redes de Computadoras; 3662 Matemática Aplicada (teoría de la información) | `SimFuncion modo="senal"` |

Fuentes candidatas: Stewart, *Cálculo de una variable: trascendentes tempranas* (Cengage, 8.ª ed.); Strang, *Introduction to Linear Algebra* (Wellesley-Cambridge) y MIT OCW 18.06 (Spring 2010); Grossman, *Álgebra lineal* (McGraw-Hill, 7.ª ed.); Rosen, *Matemática discreta y sus aplicaciones* (McGraw-Hill, 7.ª ed.); Cormen, Leiserson, Rivest y Stein, *Introduction to Algorithms* (4.ª ed., 2022; BFS, DFS, orden topológico, Dijkstra); Goodfellow, Bengio y Courville, *Deep Learning* (MIT Press, 2016; libre en deeplearningbook.org, §4.3); Oppenheim y Willsky, *Signals and Systems* (2.ª ed.) y MIT OCW 6.003; Tanenbaum, Feamster y Wetherall, *Computer Networks* (6.ª ed., 2021; capa física, Nyquist y Shannon); Khan Academy (derivadas, vectores).

Advertencias:
- Es el área con más fórmulas: usá `<Formula>` para 2-4 centrales por tema y explicá cada símbolo. Probá cada LaTeX en el build (un LaTeX inválido rompe).
- Señales: distinguí el teorema de muestreo (Nyquist: muestrear a más del doble de la frecuencia máxima) de la capacidad de canal de Shannon (ancho de banda y relación señal/ruido). Son dos fórmulas distintas y se confunden seguido.
- Descenso por gradiente: lo que digas de la tasa de aprendizaje (converge / oscila / diverge) tiene que coincidir con el simulador.

### 7.5 Probabilidad y estadística — `src/content/temas/probabilidad-estadistica/`

Ángulo del área: no dejarse engañar por números: un A/B que "dio significativo", una alerta que "siempre acierta", un promedio con 5 datos.

| orden | slug | Título sugerido | Ángulo laboral | Materias | Simuladores |
|---|---|---|---|---|---|
| 1 | `variables-y-distribuciones` | Variables aleatorias y distribuciones (binomial, Poisson, normal) | Cuántos tickets llegan por hora y cuántos servidores fallan por mes. | ing-informatica 3651 Probabilidad y Estadística | `SimDistribucion` |
| 2 | `tcl-e-intervalos` | Teorema central del límite e intervalos de confianza | "El tiempo promedio de resolución bajó 3 minutos": ¿con cuántos tickets? | 3651; 3656 Estadística Aplicada | `SimInferencia modo="tcl"` + `modo="intervalos"` |
| 3 | `pruebas-de-hipotesis-ab` | Pruebas de hipótesis y A/B testing | El botón verde "convirtió más" con 300 visitas por versión. | 3651; 3656; 3670 Ciencia de Datos | `SimInferencia modo="ab"` |
| 4 | `bayes-falsos-positivos` | Bayes y los falsos positivos | El antivirus marca un archivo: ¿qué probabilidad hay de que sea malware de verdad? | 3651; 3656 (inferencia bayesiana); 3650 Seguridad de la Información | `SimBayes` |

Fuentes candidatas: Ross, *A First Course in Probability* (Pearson, 10.ª ed., 2019) e *Introduction to Probability and Statistics for Engineers and Scientists* (Academic Press, 6.ª ed., 2021); Walpole, Myers, Myers y Ye, *Probabilidad y estadística para ingeniería y ciencias* (Pearson, 9.ª ed.); Montgomery y Runger, *Applied Statistics and Probability for Engineers*; MIT OCW 18.05 *Introduction to Probability and Statistics* (Spring 2014); NIST/SEMATECH *e-Handbook*; Khan Academy (estadística y probabilidad); Kohavi, Tang y Xu, *Trustworthy Online Controlled Experiments* (Cambridge University Press, 2020) para A/B.

Advertencias:
- **`variables-y-distribuciones` tiene que tratar la varianza explícitamente** (definición, fórmula y la palabra "varianza" en el texto, en tarjetas y en al menos un ejercicio): el criterio 7 del SPEC prueba que el buscador encuentre "varianza".
- El p-valor no es "la probabilidad de que la hipótesis nula sea cierta". Si lo explicás, que sea con la definición correcta y citada.
- A/B: mencioná el problema de mirar los resultados a cada rato y cortar cuando "da" (*peeking*), con fuente.
- Bayes: usá frecuencias naturales ("de cada 1000 personas…"), que es lo que muestra el simulador.

### 7.6 Soporte técnico — `src/content/temas/soporte/`

Ángulo del área: la mesa de ayuda y la guardia de segundo nivel: qué se atiende primero, cómo se encuentra la falla, cómo se habla con el usuario y cómo se aprende de lo que salió mal. **La facultad casi no lo cubre** (ITIL es la unidad 10 de Seguridad de la Información): el área se apoya en ITIL 4 y en documentación oficial. Todos los temas llevan ≥1 caso de guardia.

| orden | slug | Título sugerido | Ángulo laboral | Materias | Simuladores |
|---|---|---|---|---|---|
| 1 | `itil-incidente-problema-cambio` | ITIL 4: incidente, problema y cambio | Es la tercera vez en el mes que se cae la impresora fiscal: ¿otro ticket o un problema? | ing-informatica 3650 Seguridad de la Información (u.10 ITIL); 3665 Gestión Aplicada al Desarrollo de Software II; lic-gestion-tecnologia 1326 Modelos de Calidad | `SimMaquinaEstados preset="incidente-itil"` |
| 2 | `troubleshooting-metodico` | Troubleshooting metódico: capas OSI y dividir para encontrar | "No anda internet" en una oficina de 30 puestos. | 3643 Redes de Computadoras (OSI y TCP/IP); 3649 Sistemas Operativos | `SimGrafo grafo="cadena-red" modo="buscar-falla"` |
| 3 | `prioridad-y-sla` | Prioridad por impacto × urgencia y SLA | Lunes 9 de la mañana con seis tickets y un solo técnico. | 3632 Introducción a Proyectos Informáticos (administración de servicios); 3667 Gestión de la Calidad en Procesos de Sistemas; lic-gestion-tecnologia 1329 Gestión de Procesos de Negocios | `SimMatrizPrioridad` + `SimFlujo modo="cola" etiquetas="tickets"` |
| 4 | `comunicacion-kb-postmortem` | Comunicación con el usuario, base de conocimiento y post-mortem sin culpables | El mismo reseteo de contraseña explicado 40 veces por semana, y una caída que nadie quiere documentar. | 3650 (u.10); 3667; lic-gestion-tecnologia 1321 Gestión del Conocimiento | `SimFlujo modo="cola" etiquetas="tickets" kb` |

Fuentes candidatas: Axelos, *ITIL Foundation: ITIL 4 Edition* (TSO, 2019) y las guías de práctica de ITIL 4 (Incident Management, Problem Management, Change Enablement, Service Desk, Service Level Management, Knowledge Management); el glosario y los materiales públicos de PeopleCert/Axelos; NIST SP 800-61 (*Computer Security Incident Handling Guide*, la revisión vigente) para el ciclo de respuesta y las lecciones aprendidas; Beyer et al., *Site Reliability Engineering* (cap. 15 "Postmortem Culture: Learning from Failure") y *The Site Reliability Workbook* (cap. 10 "Postmortem Culture"), libres en sre.google; Tanenbaum, Feamster y Wetherall, *Computer Networks* (6.ª ed.) para el modelo de capas; documentación de Cisco o de la IETF (RFC) para herramientas de diagnóstico (`ping`, `traceroute`).

Advertencias:
- **Los libros de ITIL 4 son pagos.** Citá solo lo que puedas leer de verdad (el libro si tenés acceso; si no, materiales públicos oficiales de Axelos/PeopleCert). No reconstruyas definiciones de ITIL "de memoria" ni de blogs de consultoras: si no lo podés verificar, no va. Anotá en `FUENTES-soporte.md` a qué tuviste acceso.
- ITIL 4 habla de **prácticas** (no "procesos" como ITIL v3) y de "habilitación del cambio" (*change enablement*). No mezcles terminología de v3 sin aclararlo.
- La matriz impacto × urgencia y los SLA del simulador son **de ejemplo** (cada organización define los suyos). Decilo en el texto.
- Post-mortem sin culpables (*blameless*): respaldalo con el libro de SRE de Google; los blogs de empresas van solo como "para ver más".
- Los estados del simulador `incidente-itil` son los típicos de una herramienta de mesa de ayuda, no estados normativos de ITIL: si los describís, aclaralo.

## 8. Cómo entregás

1. Los 4 temas de tu área con `npm run build` en verde, y `CAMPUS_ESTRICTO=1 npm run build` en verde salvo por prerrequisitos a otras áreas (anotados).
2. `docs/modulos/v1/fuentes/FUENTES-<tu-area>.md` completo.
3. Un commit en tu worktree con solo tus dos rutas: `F3 <area>: 4 temas con práctica y fuentes`.
4. Un informe corto al director: temas entregados, qué fuentes no pudiste verificar, pedidos al director y cualquier duda de contenido que F4 debería mirar con más cuidado.
