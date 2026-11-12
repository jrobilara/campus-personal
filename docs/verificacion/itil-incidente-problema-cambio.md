# Verificación F4: ITIL 4, incidente, problema y cambio

- **Tema:** `soporte/itil-incidente-problema-cambio`
- **Fecha:** 2026-11-11
- **Verificador:** F4 (agente distinto del autor)
- **Veredicto:** OBSERVADO

**Método.** Abrí cada fuente citada: PDF del temario DevOps de PeopleCert (con `pdftotext`, glosario §8, pp. 14-16 de 20), artículo de PeopleCert 2023, las cinco guías de Atlassian y el glosario de ITIL 4 Foundation de PeopleCert (Official Training Materials, copia en igen.nl) más el glosario público de AXELOS de enero de 2019 (copia en maxpert.de) para contrastar las definiciones atribuidas a ITIL. Recalculé el único número con Python. Contrasté los estados del simulador con `SIMULADORES.md` §2.9. No encontré frases copiadas: las fuentes están en inglés y el texto es paráfrasis propia en castellano (comprobé incidente, problema, gestión de incidentes, de problemas, control de cambios y gestión del conocimiento contra el glosario).

## Afirmaciones revisadas

| # | Afirmación | Fuente | Ubicación | Resultado | Nota |
|---|---|---|---|---|---|
| 1 | Incidente = interrupción no planificada de un servicio, o falla de un componente que aún no lo afectó (tema, Formal; tarjeta `t-incidente-definicion`) | peoplecert-glosario | §8, p. 15, "Incident" | ⚠️ | Coincide con el temario DevOps citado. Pero el glosario ITIL 4 Foundation (PeopleCert y AXELOS 2019) dice "interrupción no planificada de un servicio o reducción de su calidad". Ver H1. |
| 2 | Gestión de incidentes = minimizar el impacto negativo restaurando la operación normal lo antes posible | peoplecert-glosario | §8, p. 15 | ✅ | Idéntico en sentido en el temario y en el glosario ITIL 4 Foundation. |
| 3 | "Fijate que el objetivo es restaurar, no encontrar la causa raíz" | peoplecert-glosario; atlassian-incidentes | p. 15; "What is incident management?" | ✅ | Atlassian: el incidente se resuelve con las tareas para mitigar y restaurar. |
| 4 | Atlassian define incidente como lo que exige respuesta de emergencia; quienes siguen ITIL dicen *major incident* (Nota) | atlassian-incidentes | "What is incident management?" | ✅ | Texto de la página confirmado; el tema lo rotula como interpretación del proveedor. |
| 5 | Problema = causa o causa potencial de uno o más incidentes | peoplecert-glosario | §8, p. 16 | ✅ | Confirmado también en el glosario ITIL 4 Foundation. |
| 6 | Gestión de problemas = reducir probabilidad e impacto identificando causas reales y potenciales y manejando soluciones temporales y errores conocidos | peoplecert-glosario | §8, p. 16 | ✅ | |
| 7 | Una solución temporal baja el impacto sin eliminar la causa | atlassian-problemas | "The problem management process" | ✅ | |
| 8 | Error conocido = problema con causa raíz documentada y solución temporal, guardado en una base de errores conocidos (tema y tarjeta `t-error-conocido`) | atlassian-problemas | "Create a known error record" | ⚠️ | Atlassian lo cita tal cual, pero es la definición de ITIL v3. El glosario ITIL 4 dice "problema analizado y no resuelto". Ver H3. |
| 9 | Un rollback puede terminar el incidente pero el problema sigue (tema; tarjeta `t-rollback-no-cierra-problema`) | atlassian-problemas | "Problem management vs. incident management" | ✅ | Textual en la página. |
| 10 | Cambio = agregar, modificar o quitar algo que pueda afectar servicios, directa o indirectamente (tarjeta: "en ITIL") | atlassian-cambios | "What is IT change management" | ⚠️ | Contenido correcto (coincide con el glosario ITIL 4 Foundation de PeopleCert), pero la única fuente citada es Atlassian. Ver H2. |
| 11 | "ITIL distingue tres tipos" de cambio: estándar, normal, de emergencia | atlassian-cambios | "Types of changes" | ⚠️ | Verdadero (Atlassian lo afirma y el glosario ITIL 4 define estándar y de emergencia), pero respaldo solo de Atlassian. Ver H2. |
| 12 | Estándar: bajo riesgo, repetido, preaprobado y documentado (tarjeta `t-cambio-estandar`) | atlassian-cambios | "Standard changes" | ✅ | Glosario ITIL 4: "de bajo riesgo, preautorizado, bien entendido y documentado". |
| 13 | Normal: sin procedimiento preaprobado, evaluación de riesgo, a veces CAB | atlassian-cambios | "Normal changes" | ✅ | Atlassian aclara que el CAB solo interviene en los de alto riesgo; el tema dice "a veces". |
| 14 | Emergencia: surge de falla o amenaza, trámite más corto; ejemplo parche de seguridad (tarjeta `t-cambio-emergencia`) | atlassian-cambios | "Emergency changes" | ✅ | |
| 15 | El CAB puede ser cuello de botella y se reserva a lo riesgoso (ejercicio `e-tipo-de-cambio`) | atlassian-cambios | "What is a change advisory board (CAB)?" | ✅ | |
| 16 | ITIL 4 Foundation (2019) llamó *change control* a la práctica: evaluar riesgos, autorizar, manejar calendario | peoplecert-glosario | §8, p. 14, "Change Control" | ✅ | También figura "change control practice" en el glosario AXELOS de enero de 2019. |
| 17 | AXELOS la renombró *change enablement* porque "control" se leía como frenar equipos (tema con "Según Atlassian"; tarjeta `t-change-enablement` sin hedge) | atlassian-cambios | "Defining change management" | ⚠️ | El renombre es real (glosario ITIL 4 Foundation: "change enablement practice", misma definición). Atlassian cita a AXELOS: se malinterpretaba como controlar cambios o equipos. "Frenar" es la glosa de Atlassian. Ver H5. |
| 18 | Solicitud de servicio = pedido formal de un usuario de algo (acceso, reseteo de clave, información); no es falla; flujo aparte, bajo riesgo, automatizable | atlassian-solicitudes | "What is service request management?" y "vs incident management" | ⚠️ | La redacción es la de ITIL v3 (Atlassian). Glosario ITIL 4: pedido de un usuario que inicia una acción de servicio acordada como parte normal de la entrega. Ver H2. |
| 19 | ITIL 4 organiza su guía en 34 prácticas que "reemplazan" a los procesos | atlassian-itil4 | "ITIL 4 practices" | ⚠️ | Las 34 están confirmadas por PeopleCert 2023, que no usa "reemplazan": dice que las prácticas van más allá de los procesos. Ver H2. |
| 20 | En 2023 se actualizaron las primeras cinco prácticas; para incidentes se recomienda mirar desde quien usa el servicio sin esconderse detrás del SLA | peoplecert-practicas-2023 | "first five revised practices"; "Chapter 8" | ✅ | Citas textuales confirmadas; autor Adam Griffith, ITIL Architect. |
| 21 | Cuando un cambio provoca una interrupción se analiza con incidentes y problemas | atlassian-problemas | "Problem management and change management" | ✅ | |
| 22 | Categorizar cada incidente para detectar tendencias que alimentan problemas | atlassian-incidentes | paso "Categorize" | ✅ | |
| 23 | Tabla "Cómo se conectan": cuándo se da por terminado cada elemento | atlassian-problemas; peoplecert | varias | ❌ | Fila Problema: "o queda como error conocido" contradice la fuente y el propio YAML del tema. Ver H4. Las otras tres columnas ✅. |
| 24 | Estados del simulador son típicos de una herramienta, no normativos de ITIL (Ojo) | SIMULADORES.md §2.9 | nota fija del diagrama | ✅ | Estados y la aclaración coinciden con el contrato. |
| 25 | Abrir problema o pedir cambio no mueve el incidente; suman `problemas-abiertos` y `cambios-pedidos` | SIMULADORES.md §2.9 | "Qué tiene que verse" | ✅ | |
| 26 | Ejercicio `e-horas-persona-perdidas`: 3 × 12 × 40 = 1440 min = 24 horas-persona | cálculo | Python | ✅ | 1440 y 24,0. Errores comunes 1440 (sin dividir) y 2 (3 × 40 min = 2 h) correctos. |
| 27 | Ejercicio `e-que-registro-falta`: 8 incidentes repetidos con causa sin identificar piden un problema | atlassian-problemas | "The problem management process" | ✅ | Única opción correcta, distractores plausibles. |
| 28 | Ejercicio `e-vf-incidente-requiere-causa`: falso | atlassian-incidentes | "What is incident management?" | ✅ | |
| 29 | Ejercicio `e-tipo-de-cambio`: 100 GB de disco repetido y preaprobado = estándar | atlassian-cambios | "Standard changes" | ✅ | Atlassian da "adding memory or storage" como ejemplo estándar. |
| 30 | Caso `c-impresora-fiscal-tercera-vez`: cerrar incidente, abrir problema vinculando las tres caídas, arreglo como cambio planificado fuera de horario con plan de vuelta atrás | atlassian-problemas; atlassian-cambios | ver filas 9, 11 | ✅ | Decisión buena según las fuentes. Los desenlaces `regular` (cerrar sin enlazar, incidente eterno, parche) son los clásicos. |
| 31 | Caso `c-actualizacion-viernes-sin-registro` y su lección: "si algo falla justo después de un cambio, lo primero es revertirlo" | atlassian-cambios | "Emergency changes" | ⚠️ | La fuente declarada respalda el cambio de emergencia con trámite corto, no la regla "revertir primero". Ver H6. |
| 32 | Tarjetas (9): atomicidad, una respuesta, dorso corto | GUIA-ESTILO §4 | | ⚠️ | Hay 4 tarjetas de definición (`t-incidente-definicion`, `t-problema-definicion`, `t-error-conocido`, `t-cambio-definicion`) y la guía pide ≤ 2 por tema. `t-incidente-objetivo` ofrece las dos alternativas en el frente y su dorso lleva dos ideas. Menor, sin hallazgo. |
| 33 | Problemas recomendados `p-tabla-itil-propia` y `p-buscar-repetidos` | peoplecert-glosario; atlassian-problemas | pp. 14-16; "The problem management process" | ✅ | Las secciones dan material para la tarea. La URL del PDF resuelve. |
| 34 | Orden caso real → intuición → formal, voseo, largo | GUIA-ESTILO §1-2 | | ✅ | Cuerpo ≈ 1265 palabras sin código. Voz criolla correcta. |

**Afirmaciones revisadas: 34** (cada fila agrupa las piezas de práctica que repiten la misma afirmación).

## Hallazgos abiertos

**H1: definición de incidente atribuida a ITIL 4 que no coincide con el glosario ITIL 4 Foundation.**
- Archivos y campos: `tema.mdx`, Formal §Las definiciones (primer párrafo); `practica.yaml`, `tarjetas[0]` (`t-incidente-definicion`, `dorso`); p. `p-tabla-itil-propia`.
- Qué está mal: el texto dice "para ITIL 4" y agrega "o la falla de un componente del servicio que todavía no llegó a afectarlo". Esa cláusula está en el temario DevOps de PeopleCert (la fuente citada) y es herencia de ITIL v3 (falla de un elemento de configuración).
- Qué dice la fuente: el glosario de ITIL 4 Foundation (PeopleCert, Official Training Materials, y glosario público de AXELOS de enero de 2019) define incidente como "an unplanned interruption to a service or reduction in the quality of a service". La propia página de Atlassian que el tema cita lo reproduce igual.
- Corrección propuesta: redefinir como "interrupción no planificada de un servicio o reducción de su calidad" y citar el glosario ITIL 4 Foundation de PeopleCert, o dejar la definición actual pero rotularla "según el temario DevOps de PeopleCert". Ajustar el `dorso` de la tarjeta.

**H2: definiciones atribuidas a ITIL cuyo único respaldo es Atlassian.**
- Archivos y campos: `tema.mdx`, Formal (párrafos de cambio, "ITIL distingue tres tipos", solicitud de servicio, §Prácticas, no procesos); `practica.yaml`, `tarjetas` `t-cambio-definicion` (fuente atlassian-cambios, frente "en ITIL"), `t-cambio-estandar`, `t-cambio-emergencia`, `t-solicitud-vs-incidente`; ejercicio `e-tipo-de-cambio`.
- Qué está mal: según el criterio del director, definición atribuida a ITIL con respaldo solo de Atlassian es hallazgo. El contenido es correcto, pero la atribución no está respaldada por PeopleCert/AXELOS.
- Qué dice la fuente oficial (verificado): glosario ITIL 4 Foundation de PeopleCert: *change* = "the addition, modification, or removal of anything that could have a direct or indirect effect on services"; *standard change* = "low-risk, pre-authorized change that is well understood and fully documented"; *emergency change* = "a change that must be introduced as soon as possible"; *service request* = "a request from a user or a user's authorized representative that initiates a service action which has been agreed as a normal part of service delivery". PeopleCert 2023 confirma "34 management practices" y dice que las prácticas "go beyond the idea of processes alone". El *normal change* y la descripción del CAB no están en ese glosario.
- Corrección propuesta: citar el glosario ITIL 4 Foundation de PeopleCert para cambio, estándar, emergencia, solicitud de servicio y *change enablement*; usar PeopleCert 2023 para las 34 prácticas y reformular "reemplazan los procesos" como "van más allá de los procesos". Mantener Atlassian solo para normal/CAB y rotularlo "según Atlassian". Alinear la definición de solicitud con la de ITIL 4. Si no se puede citar el glosario, cambiar "para ITIL" por "según Atlassian".

**H3: definición de error conocido de ITIL v3 presentada como ITIL.**
- Archivos y campos: `tema.mdx`, Formal (párrafo del problema, frase de "error conocido"); `practica.yaml`, `tarjetas` `t-error-conocido` (`dorso`).
- Qué está mal: define error conocido como "problema con causa raíz documentada y una solución temporal". Es la definición de ITIL v3.
- Qué dice la fuente: el glosario ITIL 4 Foundation dice "a problem that has been analysed but has not been resolved". Atlassian cita la versión v3 entre comillas.
- Corrección propuesta: usar la definición ITIL 4 con su cita, o decir "en la definición clásica de ITIL v3, que Atlassian sigue usando". Mantener que la solución temporal es práctica habitual, no parte de la definición.

**H4: la tabla "Cómo se conectan" da el problema por terminado en una situación en que sigue abierto.**
- Archivo y campo: `tema.mdx`, Formal, tabla, fila "Se da por terminado cuando", columna Problema: "La causa se eliminó, o queda como error conocido con solución temporal".
- Qué está mal: contradice la fuente y el YAML del propio tema (`problema.estado: error-conocido`, que no es cerrado).
- Qué dice la fuente: atlassian-problemas: "A closed problem is one that has been eliminated and can no longer cause another incident".
- Corrección propuesta: "La causa se eliminó (si no se puede, el problema sigue abierto como error conocido con solución temporal)".

**H5: la tarjeta presenta como hecho el motivo del renombre, que el tema hedgea.**
- Archivo y campo: `practica.yaml`, `tarjetas` `t-change-enablement` (`dorso`).
- Qué está mal: afirma "se renombró porque 'control' sonaba a frenar a los equipos" sin aclarar que es el relato de Atlassian. El tema sí dice "Según Atlassian".
- Qué dice la fuente: Atlassian cita a AXELOS: la práctica se interpretaba como foco en "controlar cambios" o "controlar equipos". "Frenar" es la interpretación de Atlassian.
- Corrección propuesta: "se renombró porque 'control' se malinterpretaba como controlar a los equipos (según AXELOS, citado por Atlassian)", o quitar el motivo.

**H6: la lección del caso del viernes enuncia una regla absoluta sin respaldo en la fuente del caso.**
- Archivo y campo: `practica.yaml`, `casos[1]` (`c-actualizacion-viernes-sin-registro`), `leccion`: "lo primero es revertirlo"; `fuente: atlassian-cambios`.
- Qué está mal: atlassian-cambios respalda el cambio de emergencia con trámite corto, no "revertir primero". Lo que respalda investigar el último cambio es SRE cap. 12 ("What touched it last"), que no está en las fuentes de este tema. El libro dice que los cambios recientes son "un buen lugar para empezar", no que siempre se revierta.
- Corrección propuesta: suavizar a "si algo falla justo después de un cambio, empezá por ahí: revertirlo, con registro y avisando, suele ser la mitigación más rápida", y respaldarlo con atlassian-problemas ("rolling back ... may get the service operating again") o sumar google-sre-troubleshooting a las fuentes del tema.
