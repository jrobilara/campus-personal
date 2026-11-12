# Verificación F4: Comunicación con el usuario, base de conocimiento y post-mortem sin culpables

- **Tema:** `soporte/comunicacion-kb-postmortem`
- **Fecha:** 2026-11-11
- **Verificador:** F4 (agente distinto del autor)
- **Veredicto:** APROBADO (1.ª pasada: OBSERVADO; re-verificación 2026-11-12 contra 0c54241: 3 cerrados, ninguno abierto)

**Método.** Abrí los capítulos 14 y 15 del libro de SRE de Google y el capítulo 10 del *Workbook* (sre.google), la guía de respuesta a incidentes de PagerDuty (`response.pagerduty.com`: Postmortem Process y During an Incident), las páginas de Atlassian (comunicación y gestión del conocimiento), la página "The Solve Loop" de KCS v6 y el glosario del temario de PeopleCert (p. 15). Recalculé el único número con Python sin mirar el del autor. No hay frases copiadas: todas las fuentes están en inglés y el texto es paráfrasis propia. No hay comillas en inglés en el tema.

## Afirmaciones revisadas

| # | Afirmación | Fuente | Ubicación | Resultado | Nota |
|---|---|---|---|---|---|
| 1 | Un incidente se desordena cuando quien lo atiende se absorbe en lo técnico: nadie sabe qué hace cada uno y directivos y usuarios quedan sin información | google-sre-incidentes | cap. 14, "The Anatomy of an Unmanaged Incident" | ✅ | "Sharp Focus on the Technical Problem" y "Poor Communication". |
| 2 | Roles separados: solo operaciones modifica el sistema; otra persona comunica con actualizaciones periódicas (tarjeta `t-rol-comunicacion`) | google-sre-incidentes | "Recursive Separation of Responsibilities" | ✅ | "should be the only group modifying the system"; comunicación emite "periodic updates". |
| 3 | Cinco públicos: equipo que responde, soporte de primera línea, directivos, resto de empleados, clientes externos | atlassian-comunicacion | "Tailor alerts and communications to the right audience" | ✅ | Las cinco categorías coinciden. |
| 4 | No pasar más de una hora sin actualizar en incidentes que siguen afectando; decir cuándo viene la próxima (tarjeta `t-actualizacion-cada-hora`) | atlassian-comunicacion | misma sección | ⚠️ | La recomendación está, pero Atlassian la dirige a clientes externos afectados, no a usuarios en general. Ver H2. |
| 5 | Preparar plantillas de antemano | atlassian-comunicacion | "Set up templates…" | ✅ | |
| 6 | Mantener informados a los usuarios reduce la reacción negativa | atlassian-comunicacion | "Why incident communication matters" | ✅ | "much less negative reaction". |
| 7 | Evitar "outage" salvo que haya sido caída total; decir incidente o degradación (tarjeta `t-palabra-outage`) | pagerduty-postmortem | paso del mensaje externo | ✅ | Textual: "Avoid using the word 'outage' unless it really was a full outage". Regla de una empresa, rotulada así. |
| 8 | Ante la duda sobre avisar públicamente, avisar | pagerduty-durante | "Steps for Incident Commander" | ✅ | "If in doubt, post it out". |
| 9 | Plantilla de mensaje (qué sabemos, qué hacemos, qué podés hacer, próxima actualización) | atlassian-comunicacion | "Prepping for incident communication" | ✅ | Declarada propia e ilustrativa. Los elementos "qué pasa, qué hacemos, cuándo hay novedades" son los de Atlassian; "qué podés hacer mientras" es adición del autor. |
| 10 | ITIL 4 incluye la práctica de gestión del conocimiento: mantener y mejorar el uso eficaz, eficiente y cómodo de la información y el conocimiento | peoplecert-glosario | §8, p. 15 | ✅ | Coincide con el temario (verificado) y con el glosario ITIL 4 Foundation. |
| 11 | Lo más valioso a documentar: incidentes comunes con muchos tickets y problemas recurrentes | atlassian-conocimiento | "Knowledge identification" | ✅ | |
| 12 | KCS tiene cuatro prácticas en el ciclo de resolución: capturar, estructurar, reutilizar, mejorar (tarjeta `t-kcs-capturar`) | kcs-v6 | "The Solve Loop" | ✅ | "four KCS Practices… in the Solve Loop". Capturar "mientras respondés" y con las palabras del pedido: confirmado. |
| 13 | Reutilizar = buscar al empezar y durante el ticket; mejorar = quien usa un artículo lo revisa; corrige si tiene licencia, si no marca (tarjeta `t-kcs-flag-it-or-fix-it`) | kcs-v6 | Prácticas 3 y 4 | ✅ | "If we are confident… and authorized with a KCS license, we should fix it. If not… flag it". |
| 14 | El artículo de ejemplo (síntoma con palabras del usuario, entorno, causa, solución) sigue la plantilla de KCS | kcs-v6 | Prácticas 1 y 2 | ⚠️ | La página citada no lista esos campos (están en "The KCS Article" y la Técnica 2.1: Issue, Environment, Resolution, Cause). Ver H3. |
| 15 | Los portales de autoservicio desvían tickets antes de la cola | atlassian-conocimiento | "Knowledge sharing and distribution" | ✅ | "deflecting tickets before they reach the queue". |
| 16 | "Una base de conocimiento vieja es peor que ninguna" (Ojo) | razonamiento | n/a | ✅ | Opinión de oficio; la práctica de revisar al usar está respaldada (fila 13). |
| 17 | Post-mortem = registro escrito de un incidente con impacto, acciones, causas raíz y acciones de seguimiento (tarjeta `t-postmortem-definicion`) | google-sre-postmortem | cap. 15, introducción | ✅ | |
| 18 | Objetivos del post-mortem; disparadores típicos (caída visible sobre umbral, pérdida de datos, intervención de guardia); definir criterios antes (tarjeta `t-criterios-antes`) | google-sre-postmortem | "Google's Postmortem Philosophy" | ✅ | La lista de disparadores del libro es más larga; el tema dice "por ejemplo". |
| 19 | Sin culpables: asumir buenas intenciones; no se puede "arreglar" a las personas pero sí los sistemas (tarjetas `t-blameless-supuesto`, `t-arreglar-sistemas-no-personas`) | google-sre-postmortem | "Google's Postmortem Philosophy" | ✅ | Textual: "You can't 'fix' people, but you can fix systems and processes". |
| 20 | La cultura blameless nació en la salud y la aviación | google-sre-postmortem | misma sección | ✅ | "healthcare and avionics industries". |
| 21 | En una cultura de castigo la gente no reporta por miedo (tarjeta `t-castigo-oculta-problemas`) | google-sre-postmortem | "Best Practice: Avoid Blame…" | ✅ | La frase está en la sección anterior y en esta; ambas lo dicen. |
| 22 | Criterios de un buen post-mortem: qué y no quién; acciones sobre el sistema; responsable, prioridad y estado final verificable; "mejorar" no sirve; sin lenguaje cargado; publicación rápida y amplia (tarjeta `t-accion-verificable`) | google-sre-workbook-pm | "Bad Postmortem" y "Good Postmortem" | ✅ | Ítems "Key action item characteristics", "Animated language", "Missing ownership", "Delayed publication", "Measurability", "Blamelessness", "Promptness". "Improve/Make better" figuran como frases vagas. |
| 23 | Un post-mortem sin acciones posteriores es indistinguible de no tenerlo; "para los usuarios" (tarjeta `t-postmortem-sin-accion`) | google-sre-workbook-pm | recuadro Note en "Bad Postmortem" | ✅ | Cita de Ben Treynor Sloss: "To our users, a postmortem without subsequent action is indistinguishable from no postmortem". |
| 24 | PagerDuty: un único responsable del post-mortem, que empieza por la línea de tiempo; se identifican IC y escriba (ejercicio V/F) | pagerduty-postmortem | "Owner Designation/Responsibilities"; "Postmortem" | ✅ | |
| 25 | Blameless no impide nombrar roles; lo que evita es juzgar | pagerduty-postmortem; google-sre-workbook-pm | filas 22 y 24 | ✅ | Interpretación combinada, razonable y rotulada. El Workbook critica señalar individuos en tono de culpa, no listar roles. |
| 26 | Tabla "con culpable / sin culpable" | google-sre-workbook-pm | "Model and Enforce Blameless Behavior" | ✅ | Ejemplos propios, ilustrativos, patrón igual al del Workbook (reformular desde el sistema). |
| 27 | Analogía del vuelo demorado: el enojo suele ser falta de información (Intuición) | (analogía) | n/a | ⚠️ | Analogía, no necesita cita. Pero generaliza la psicología del usuario. Ver H1. |
| 28 | Analogía de la investigación de un accidente aéreo | (analogía) | n/a | ✅ | Mapea estructura (caja negra = línea de tiempo; cambios a todos los aviones = acciones). Coherente con SRE (origen en aviación). |
| 29 | Simulador: con KB la espera media baja "para todos, incluso para los casos difíciles" | SIMULADORES.md §2.8 | modo `cola`, `kb` | ⚠️ | El contrato solo dice que `espera-media` baja con 40 % resuelto por KB. "Incluso los casos difíciles" es lectura del autor, plausible. Sin hallazgo. |
| 30 | Ejercicio `e-horas-liberadas-con-kb`: 2,8 h; errores 4, 1,2, 168 | cálculo | Python | ✅ | 40 × 6 = 240 min = 4 h; × 0,7 = 2,8; 30 % restante = 1,2; 168 = 240 × 0,7 en minutos. |
| 31 | Ejercicio `e-mensaje-durante-caida` | atlassian-comunicacion | | ✅ | Una correcta, distractores plausibles. El rechazo del mensaje genérico es opinión fundada en "better than silence". |
| 32 | Ejercicio V/F `e-vf-blameless-sin-nombres`: falso | pagerduty-postmortem | | ✅ | |
| 33 | Ejercicio `e-cuando-documentar`: mientras resolvés | kcs-v6 | Práctica 1 | ✅ | "capture in the workflow". |
| 34 | Caso `c-usuaria-enojada-sin-novedades`: decir qué sabés, qué no, qué podés hacer mientras y cuándo volvés a escribir; cumplir la hora aunque no haya novedades; no prometer solución | atlassian-comunicacion | "Tailor…", "Why incident communication matters" | ✅ | Buena práctica según la fuente: "Even an update saying 'We're still working on the problem, nothing new to report,' is better than saying nothing". No inventa técnicas (no hay frases de contención emocional, escucha activa ni similares). El 1.º desenlace malo (frase vacía) y el de no contestar están bien. La lección generaliza: ver H1. |
| 35 | Caso `c-postmortem-quien-fue`: post-mortem con línea de tiempo y causas contribuyentes; acciones con dueño y fecha; no escribir "el compañero aplicó un cambio sin autorización" | google-sre-workbook-pm | cap. 10 | ✅ | Decisión buena según el Workbook (acciones verificables, sin culpa). |
| 36 | Tarjetas (12): atómicas, una respuesta, ≤ 2 definiciones | GUIA-ESTILO §4 | | ✅ | Solo `t-postmortem-definicion` es de definición pura. `t-actualizacion-cada-hora` y `t-palabra-outage` son datos de un proveedor, rotulados en el frente. |
| 37 | Problemas `p-articulo-kb-reseteo`, `p-postmortem-propio` | kcs-v6; google-sre-workbook-pm | | ⚠️ | El segundo ✅. El primero tiene la ubicación imprecisa (H3). |
| 38 | Orden caso real → intuición → formal, voseo, largo | GUIA-ESTILO §1-2 | | ✅ | ≈ 1450 palabras sin código, bajo el tope de 1500; el largo no daña la lectura. |

**Afirmaciones revisadas: 38.**

## Hallazgos abiertos

**H1: generalización sin respaldo sobre el enojo de los usuarios.**
- Archivos y campos: `tema.mdx`, `<Intuicion>` (frase de la idea: "lo que más enoja no es que algo se rompa, sino no saber qué pasa") y cierre de la analogía del vuelo ("el enojo suele ser falta de información"); `practica.yaml`, `casos[0]` (`c-usuaria-enojada-sin-novedades`), `leccion`: "A quien está enojado casi siempre le falta información más que paciencia".
- Qué está mal: son afirmaciones sobre la psicología del usuario enojado presentadas como regla general. El autor dejó escrito que no encontró fuente sobre atención de usuarios enojados y que no afirma nada más específico.
- Qué dice la fuente: Atlassian respalda una versión más acotada: si mantenés informados a los usuarios "se llevan una reacción mucho menos negativa" ("Why incident communication matters"), y el resumen de la página dice que el silencio durante una caída cuesta más confianza que la caída misma.
- Corrección propuesta: bajar el tono de la frase de la idea y de la lección a lo que respalda la fuente. Por ejemplo: "Según Atlassian, mantener informados a los usuarios baja mucho la reacción negativa: decí qué sabés, qué no sabés, qué estás haciendo y cuándo volvés a escribir, y cumplí esa hora aunque no haya novedades." Y en la analogía, "suele" por "muchas veces". La analogía puede quedar como tal.

**H2: la regla de "una hora" de Atlassian está aplicada a un público más amplio que el de la fuente.**
- Archivos y campos: `tema.mdx`, Formal §Comunicar durante un incidente (viñeta "No pasar más de una hora…", encabezada "incidentes que siguen afectando a usuarios"); `practica.yaml`, `tarjetas[7]` (`t-actualizacion-cada-hora`, `frente`); ejercicio `e-mensaje-durante-caida`; caso `c-usuaria-enojada-sin-novedades` (actualizaciones cada hora a una usuaria interna).
- Qué está mal: se presenta como recomendación de Atlassian para usuarios en general.
- Qué dice la fuente: Atlassian la formula para "External customers": "For issues that are still currently affecting your customers' ability to use your product, we recommend never going more than one hour without sending an update".
- Corrección propuesta: aclarar "Atlassian la plantea para clientes externos afectados; para usuarios internos aplicamos la misma lógica (una cadencia fija y anunciada), pero es criterio del autor". En la tarjeta: "para clientes afectados".

**H3: ubicación imprecisa de la plantilla de artículo KCS.**
- Archivos y campos: `tema.mdx`, Formal §Base de conocimiento (bloque de ejemplo que "sigue la plantilla simple de KCS"); `practica.yaml`, `problemas[0]` (`p-articulo-kb-reseteo`): `ubicacion: Prácticas 1 (Capture) y 2 (Structure)` y `url` de "The Solve Loop"; enunciado "la estructura de KCS, que consiste en síntoma…, entorno, causa y solución".
- Qué está mal: la página citada describe las cuatro prácticas, pero no lista los campos del artículo. KCS v6 los define en "The KCS Article" y en la Técnica 2.1 como Issue, Environment, Resolution y Cause (la causa es opcional).
- Qué dice la fuente: Técnica 2.1 "Use A Simple Template" y "The KCS Article" (`library.serviceinnovation.org/KCS/KCS_v6/KCS_v6_Practices_Guide/030/030/020/010` y `/030/020`).
- Corrección propuesta: apuntar `ubicacion` y `url` a la Técnica 2.1, y redactar el enunciado con los campos de KCS (asunto o *issue* con las palabras del usuario, entorno, resolución y causa si se conoce), aclarando que el orden y los nombres son los de KCS.

## Re-verificación (2026-11-12, `git diff abd28de..0c54241`)

Releí el diff del tema, de la práctica y de `FUENTES-soporte.md`, y abrí de nuevo las páginas de Atlassian (comunicación) y KCS (Técnica 2.1). No pude correr `npm run build` (proceso terminado por el sistema, código 137).

| Hallazgo | Estado | Evidencia |
|---|---|---|
| H1 generalización sobre el enojo | CERRADO (0c54241) | La frase de la idea ahora es "mantener informados a los usuarios baja mucho su reacción negativa", con cita a Atlassian ("much less negative reaction"). La analogía dice "muchas veces el enojo viene de la falta de información" (queda como analogía) y la lección empieza con "Según Atlassian…". La segunda mitad de la frase de la idea (la base de conocimiento evita resolver dos veces) cita KCS, que dice que reduce el retrabajo. |
| H2 regla de la hora | CERRADO (0c54241) | La viñeta se limita a clientes externos con uso afectado, el frente de la tarjeta dice "clientes externos" y el texto aclara que extenderla a usuarios internos es criterio del tema, no de Atlassian. Coincide con la página ("External customers… never going more than one hour"). |
| H3 plantilla KCS | CERRADO (0c54241) | El texto y el enunciado usan *issue*, *environment*, *resolution*, *cause* (opcional) y metadatos, con cita a la Técnica 2.1; `ubicacion` y `url` del problema apuntan a `…/030/030/020/010`. Verifiqué la página: define exactamente esos campos y marca la causa como opcional. |

Hallazgos nuevos: ninguno. Sin otros cambios en el diff que alteren una afirmación de la tabla de la primera pasada.

**Estado del tema: APROBADO** (0 abiertos).
