# Verificación F4 — monolito-y-microservicios

- **Tema:** arquitecturas/monolito-y-microservicios
- **Fecha:** 2026-11-11
- **Verificador:** F4 (agente distinto del autor)
- **Veredicto:** APROBADO (re-verificación de 2294204 y cierre de ronda 2 en bc6bfef; H6 diferido a la pasada de retipado a `articulo` del director, no bloquea). Veredicto inicial (aaa7ad0): OBSERVADO.

Método: las fuentes se abrieron con `curl` sobre el HTML original y se convirtieron a texto con los títulos de sección (no resúmenes de WebFetch); así se confirmó cada título citado. Los números se recalcularon con Python sin mirar la cuenta del autor. Los simuladores aún no existen: sus lecturas se contrastaron con `SIMULADORES.md` §2.8 y §2.11, no con el componente real.

## Afirmaciones revisadas

| # | Afirmación | Fuente | Ubicación | Resultado | Nota |
|---|---|---|---|---|---|
| 1 | Monolito = un componente desplegable, una base, todos los subdominios, operaciones locales | richardson-monolito | "Solution" | ✅ | Coincide. |
| 2 | Microservicios: servicios pequeños y autónomos, capacidad de negocio en un bounded context, datos propios, APIs bien definidas | azure-microservicios | "What are microservices?" | ⚠️ | El bounded context está en el párrafo inicial (sin título), no bajo "What are microservices?". Ver H2. |
| 3 | Monolito modular: un despliegue, límites claros en APIs y datos, partirlo es "relativamente simple" | fowler-monolith-first | párrafo "The logical way…" (sin subtítulos) | ✅ | Fowler agrega que él no ha oído suficientes casos donde funcionó. Ver H4. |
| 4 | No cualquier sistema se puede partir: demasiadas dependencias entre módulos | fowler-monolith-first | nota al pie 1 | ✅ | Coincide. |
| 5 | Tabla, columna monolito (despliegue lento, más coordinación, ACID local, depuración más simple) | richardson-monolito | "Resulting context" (Benefits/Drawbacks) | ✅ | Coincide. |
| 6 | Tabla, columna microservicios (despliegue independiente, equipos autónomos, escalado selectivo, consistencia eventual, descubrimiento/logs/versionado) | azure-microservicios | "Benefits", "Challenges" | ✅ | Títulos existen. |
| 7 | En el monolito un cambio chico ata todo el ciclo y se escala la aplicación entera | fowler-microservices | introducción | ✅ | Coincide. |
| 8 | Llamadas remotas más caras, APIs más gruesas; conversión ingenua = comunicación "chatty" | fowler-microservices | "Componentization via Services" | ⚠️ | Costo y APIs gruesas sí están ahí; "chatty" está en "Smart endpoints and dumb pipes". Ver H1. |
| 9 | Charla excesiva = síntoma de acoplamiento y baja cohesión | azure-microservicios | "Best practices" | ⚠️ | La fuente dice "might be a symptom"; el texto y la tarjeta dicen "suele ser". Ver H5. |
| 10 | Con dependencias duras en serie la disponibilidad es el producto; AWS lo plantea para sistemas independientes | aws-disponibilidad | "Calculating availability with hard dependencies" | ✅ | Título exacto; el ejemplo 99,99 %³ = 99,97 % figura; recalculado 0,9999³ = 0,99970. |
| 11 | 0,999⁵ = 99,50 %; ≈ 44 h/año; un componente ≈ 8,8 h/año | aws-disponibilidad (tabla 99,9 % = 8 h 45 min) | cuenta propia | ✅ | Python: 0,995010; 43,7 h; 8,76 h. |
| 12 | Cadenas síncronas multiplican la caída; salidas: asíncronas o administrar la caída | fowler-microservices | "Synchronous calls considered harmful" | ✅ | Título exacto. |
| 13 | Casi todas las historias exitosas partieron de un monolito; las armadas desde cero terminaron mal | fowler-monolith-first | cuerpo | ⚠️ | Fiel, pero Fowler lo presenta como evidencia anecdótica y "tentativa". Ver H4. |
| 14 | Razones: no sabés si el producto funcionará (YAGNI); límites difíciles y caros de corregir | fowler-monolith-first | cuerpo | ✅ | Coincide. |
| 15 | "Premium": despliegue automático, monitoreo, fallas, consistencia eventual; se justifica con complejidad real | fowler-premium | cuerpo | ✅ | La lista de fuentes de complejidad es equivalente (equipos grandes, escalado, tamaño). |
| 16 | Hace falta cultura DevOps madura; evaluar experiencia del equipo | azure-microservicios | "Challenges" (Management, Skill set) | ✅ | Coincide. |
| 17 | Estrategia de desprender servicios desde los bordes | fowler-monolith-first | "peel off microservices at the edges" | ✅ | Coincide. |
| 18 | Modelar por dominio (DDD), evitar servicios demasiado finos; lo que cambia junto vive junto | azure-microservicios | "Best practices" | ✅ | Coincide. |
| 19 | Partir un monolito enredado "reparte el enredo por la red" | fowler-monolith-first | nota 1 | ⚠️ | Inferencia del autor, no está en la fuente. Ver H3. |
| 20 | 5 saltos de 99,9 % = 99,50 %; con timeouts y breaker tirar antifraude deja pagos degradado y gateway ok | SIMULADORES.md §2.8, §2.11 | contrato | ✅ | Coincide con el contrato; falta contrastar con el simulador real. Props validan contra el contrato. |
| 21 | e-disponibilidad-seis-servicios: 0,999⁶ = 99,40 %, tolerancia 0,02 | cálculo | — | ✅ | Python: 99,4015. Errores comunes (99,9 y 94) bien explicados. |
| 22 | e-horas-caido-cuatro-servicios: 0,9995⁴ → 17,5 h/año, tolerancia 0,5 | cálculo | — | ✅ | Python: 17,507 h; el error común 4,4 h = 4,38 h correcto. |
| 23 | e-elegir-arquitectura-equipo-chico: monolito modular es la correcta; distractores | fowler-monolith-first, azure-microservicios | "Best practices" (shared schemas) | ✅ | Explicaciones coherentes con las fuentes. |
| 24 | e-vf-cada-servicio-999: cadena de 5 da 99,50 % (falso) | aws-disponibilidad | idem #10 | ✅ | Correcta. |
| 25 | Tarjetas t-* (9): atomicidad y claridad | varias | — | ⚠️ | t-disponibilidad-independencia junta dos supuestos (independencia y dependencia dura). Resto bien. t-disponibilidad-serie-tres ≈ 99,7 % ✅ (0,997003). |
| 26 | Caso de guardia c-antifraude-cuelga: la decisión buena (timeout corto + breaker + camino degradado acordado con el negocio) | azure-microservicios, azure-circuit-breaker | "Benefits/Fault isolation"; "Context and problem" | ✅ | Es práctica documentada; las opciones malas (reiniciar, escalar pagos, subir timeout) son tentadoras y plausibles; hay desenlaces regular. Ver H6 por la fuente. |
| 27 | Plagio | todas | — | ✅ | Comparación de secuencias de 6 palabras contra todas las fuentes: solo coinciden títulos. Texto en castellano, paráfrasis. |
| 28 | Estilo: orden caso real → intuición → formal, voseo, largos | GUIA-ESTILO | — | ✅ | CasoReal 148, Intuición 327, Formal 733 palabras (cuerpo 1208); sin lunfardo forzado. |

## Hallazgos abiertos

**H1** — `src/content/temas/arquitecturas/monolito-y-microservicios/tema.mdx`, Formal, sección "El costo escondido", primera `<Cita f="fowler-microservices" loc="Componentization via Services" />` (misma ubicación en la tarjeta `t-llamada-remota-costo`, que no lleva `loc`). Qué está mal: "comunicación chatty" no está en esa sección. Qué dice la fuente: en "Componentization via Services" dice que las llamadas remotas son más caras y las APIs deben ser más gruesas; la frase sobre la conversión ingenua de llamadas en memoria a RPC que produce comunicación "chatty" está en "Smart endpoints and dumb pipes". Corrección: `loc="Componentization via Services y Smart endpoints and dumb pipes"`.

Respuesta del autor: corregido: `loc` ahora cita las dos secciones.

Re-verificación F4: **CERRADO** (2294204). `loc` = "Componentization via Services y Smart endpoints and dumb pipes"; verificado en el HTML crudo: "chatty" está en la segunda y costo/APIs gruesas en la primera.

**H2** — mismo archivo, Formal, "Las tres formas", `<Cita f="azure-microservicios" loc="What are microservices?" />`. Qué está mal: "bounded context" y "una capacidad de negocio" aparecen en el párrafo inicial de la página, que no tiene título; bajo "What are microservices?" figuran equipos chicos, repositorios separados, datos propios y APIs. Corrección: quitar el `loc` o escribir "introducción y What are microservices?".

Respuesta del autor: corregido: `loc` = "introducción y What are microservices?".

Re-verificación F4: **CERRADO** (2294204). `loc` = "introducción y What are microservices?"; el bounded context está en el párrafo inicial sin título (releído).

**H3** — mismo archivo, Intuición, `<Ojo>`: "reparte el enredo por la red<Cita f="fowler-monolith-first" />". Qué está mal: es una inferencia del autor (lo admite en FUENTES #19), pero queda citada como si fuera de Fowler. Qué dice la fuente (nota al pie 1): no se puede asumir que un sistema arbitrario se parte; la mayoría acumula demasiadas dependencias y los intentos de descomponer terminaron rápido "en un lío". Corrección: reescribir pegado a la fuente ("Fowler advierte que la mayoría de los sistemas tiene tantas dependencias entre módulos que no se pueden partir con sentido, y que intentarlo terminó seguido en un lío") y dejar la metáfora de la red sin cita o fuera de la oración citada.

Respuesta del autor: corregido: la oración citada sigue a Fowler y la metáfora va aparte, marcada "En criollo".

Re-verificación F4: **CERRADO** (2294204). La oración citada ahora reproduce la nota al pie 1 de Fowler (sistemas con demasiadas dependencias no se parten con sentido; intentos terminaron en un lío); la metáfora va sin cita tras "En criollo:".

**H4** — mismo archivo, Formal, "Cuándo conviene cada una", primer párrafo. Qué está mal: se presenta la regla "monolito primero" sin su matiz. Qué dice la fuente: Fowler dice que son "early days", que no tiene suficientes anécdotas, que el consejo debe leerse como tentativo, que no es unánime (hay colegas que prefieren empezar con microservicios) y que ve difícil lograr un monolito modular que se pueda partir. Corrección: agregar una oración: "Es una observación basada en anécdotas, y el propio Fowler la da como tentativa."

Respuesta del autor: corregido: se agregó que es una observación anecdótica y tentativa según Fowler.

Re-verificación F4: **CERRADO** (2294204). Agregado "observación basada en anécdotas… tentativa… quienes prefieren arrancar con microservicios"; coincide con los cierres del artículo ("early days", "not unanimous", "tentative").

**H5** — `monolito-y-microservicios/tema.mdx` (Formal, "El costo escondido", "suele ser síntoma") y `practica.yaml`, tarjeta `t-charla-excesiva-sintoma` (frente "suele ser síntoma"). Qué está mal: sobreafirma. Qué dice la fuente: "Overly chatty communication between two services might be a symptom of tight coupling and low cohesion". Corrección: "puede ser síntoma" en ambos lugares.

Respuesta del autor: corregido: "puede ser síntoma" en el texto y en la tarjeta.

Re-verificación F4: **CERRADO** (2294204). "puede ser síntoma" en el texto y en el frente de `t-charla-excesiva-sintoma`; coincide con "might be a symptom".

**H6** — `monolito-y-microservicios/tema.mdx`, frontmatter `fuentes`: `fowler-monolith-first`, `fowler-premium`, `fowler-microservices` y `richardson-monolito` tipados `doc-oficial`. Qué está mal: `GUIA-ESTILO.md` §3 admite como respaldo de datos libros, documentación oficial y cursos; las entradas de la "bliki" de Fowler y microservices.io son artículos de autor (blog/sitio personal). Qué dice la regla: blogs solo como "para ver más". Corrección: decisión del director: (a) aceptar un tipo "artículo" de autores reconocidos y ampliar el esquema (ya pedido por el escritor), o (b) pasar a `verMas: true` y respaldar con Azure Architecture Center y con Newman (libro) cuando el dueño lo provea. El contenido de las afirmaciones es correcto; es un tema de política.

Respuesta del autor: decisión del director, se retipa a `articulo` tras el merge.

Re-verificación F4: **DIFERIDO**: se cierra en la pasada de retipado a `articulo` del director; no bloquea el veredicto.

H7 — menor, `practica.yaml`, tarjeta `t-disponibilidad-independencia`: el dorso lleva dos ideas (independencia y dependencia dura). Corrección: dividir en dos tarjetas o preguntar solo por la independencia.


Respuesta del autor: corregido: la tarjeta pregunta solo por la independencia y se agregó `t-dependencia-dura-definicion`.

Re-verificación F4: **CERRADO** (2294204). `t-disponibilidad-independencia` pregunta solo por la independencia (AWS: sistemas independientes) y `t-dependencia-dura-definicion` copia la definición de AWS ("an interruption in a dependent system directly translates to an interruption of the invoking system"). Ronda 2 (bc6bfef): la tarjeta pasó a `t-dependencia-blanda-aplicacion` (caso de aplicación: checkout con recomendaciones opcionales; respuesta "blanda"), correcta según AWS ("soft dependency, where a failure of the dependent system is compensated for in the application"), con una sola respuesta y atómica; las tarjetas de definición vuelven a ser dos. Sigue **CERRADO**.
Respuesta del autor (ronda 2, observación): `t-dependencia-dura-definicion` pasó a tarjeta de aplicación (`t-dependencia-blanda-aplicacion`); quedan 2 de definición.
