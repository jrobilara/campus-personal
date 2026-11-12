# Verificación F4 — resiliencia-y-cap

- **Tema:** arquitecturas/resiliencia-y-cap
- **Fecha:** 2026-11-11
- **Verificador:** F4 (agente distinto del autor)
- **Veredicto:** APROBADO (re-verificación de 2294204 y cierre de ronda 2 en bc6bfef; H6 diferido a la pasada de retipado a `articulo` del director, no bloquea). Veredicto inicial (aaa7ad0): OBSERVADO.

Método: fuentes abiertas con `curl` sobre el HTML original y convertidas a texto con títulos; Gilbert y Lynch leído completo con `pdftotext`; Brewer en la reproducción de InfoQ; RFC 9110 completo. La fórmula de backoff se verificó contra la imagen original de Brooker y contra el simulador oficial de AWS (ver #6). Números recalculados con Python.

## Afirmaciones revisadas

| # | Afirmación | Fuente | Ubicación | Resultado | Nota |
|---|---|---|---|---|---|
| 1 | Sin timeout, los pedidos bloqueados retienen hilos, memoria y conexiones y pueden agotar recursos de otras partes | azure-circuit-breaker | "Context and problem" | ✅ | Coincide. |
| 2 | El timeout debe ser corto pero suficiente para que la operación funcione la mayoría de las veces | azure-circuit-breaker | "Context and problem" | ✅ | Coincide. |
| 3 | Propagar el plazo restante: 30 s con 7 gastados deja 23 | sre-cascadas | "Latency and Deadlines" (subsección "Deadline propagation") | ✅ | El ejemplo de la fuente es exactamente 30 − 7 = 23. |
| 4 | Retry: cancelar, reintentar de inmediato o tras una demora que puede crecer exponencialmente | azure-retry | "Retry strategies" | ✅ | Coincide ("increased incrementally or exponentially"). |
| 5 | Una política agresiva degrada más a un servicio al límite | azure-retry | "Impact on performance" | ✅ | Coincide. |
| 6 | Usar siempre backoff exponencial aleatorizado; el azar evita la sincronización | sre-cascadas | "Retries" | ✅ | "Always use randomized exponential backoff…" y la explicación de "retry ripples". |
| 7 | Fórmula `espera_n = aleatorio(0, min(tope, base·2ⁿ))` (full jitter) y el código Python | Brooker, "Exponential Backoff and Jitter" (blog, para ver más) | sección "Adding Jitter", figura "Full Jitter" | ✅ | Confirmado dos veces: la imagen original del artículo dice `sleep = random_between(0, min(cap, base * 2 ** attempt))` y el simulador oficial de AWS (`aws-samples/aws-arch-backoff-simulator`, clase `ExpoBackoffFullJitter`) hace `random.uniform(0, min(cap, pow(2, n)*base))`. La página de Amazon Builders' Library ("Timeouts, retries, and backoff with jitter") describe jitter y remite a Brooker, pero no imprime la fórmula. Python del tema válido (`ast.parse`); la lógica da 4 intentos y 3 esperas. Ver H1. |
| 8 | 3 reintentos (4 intentos) en 3 capas = 64 intentos en la base | sre-cascadas | "Retries" | ✅ | Texto casi idéntico en la fuente (backend, frontend y JavaScript → 4³ = 64). Python: 64. |
| 9 | Reintentar solo en la capa inmediatamente superior; máx. 3 intentos por pedido; presupuesto por cliente del 10 % | sre-sobrecarga | "Deciding to Retry" | ✅ | Las tres cosas están en esa sección. |
| 10 | Reintentar solo donde se conoce el contexto; capas anidadas agregan demoras | azure-retry | "General guidance" | ✅ | Coincide. |
| 11 | Idempotente = seguro de reintentar; si no, puede ejecutarse dos veces | azure-retry | "Idempotency" | ✅ | Coincide. |
| 12 | HTTP: PUT, DELETE y métodos seguros son idempotentes (GET, HEAD, OPTIONS, TRACE); no reintentar automáticamente un método no idempotente salvo que se sepa idempotente o no aplicado | rfc9110 | §9.2.2 "Idempotent Methods"; §9.2.1 | ✅ | Título exacto; "A client SHOULD NOT automatically retry…". POST no figura entre los idempotentes. |
| 13 | Clave de negocio estable (id de la orden) para descartar duplicados | azure-idempotente | "Choose a stable deduplication key" | ✅ | La fuente habla de mensajes; aplicarlo a un cobro es extensión razonable y la fuente menciona "double-charge". |
| 14 | Circuit breaker de tres estados y sus transiciones (tabla) | azure-circuit-breaker | "Solution" | ✅ | Coincide estado por estado, incluido el reinicio del temporizador. |
| 15 | Contador del estado cerrado es temporal; semiabierto evita inundar al servicio que se recupera | azure-circuit-breaker | "Solution" | ✅ | Coincide. |
| 16 | No usar para recursos locales ni como reemplazo del manejo de excepciones; quien llama necesita plan | azure-circuit-breaker | "Problems and considerations" (Exception handling), "When to use this pattern" | ✅ | Coincide. |
| 17 | Cada apertura debería generar alerta; los cambios de estado se registran | fowler-circuit-breaker | secciones de monitoreo | ⚠️ | La fuente dice "usually you'll also want some kind of monitor alert"; el texto dice "debería". Ver H5. |
| 18 | CAP (Gilbert y Lynch): consistencia atómica, disponibilidad = toda solicitud recibe respuesta eventualmente, partición = red que demora o pierde mensajes; imposible garantizar respuesta a todo pedido con atomicidad en una red con fallas; el nodo aislado no puede saber la última escritura | gilbert-lynch-cap | §2 | ✅ | Definiciones y esbozo de prueba (p₁ / p₂) coinciden. Dato de contexto: es el artículo de revisión de 2012, no el de 2002. |
| 19 | Brewer: "2 de 3" engaña; solo se renuncia a una de las dos durante la partición; la decisión se toma por operación, dato o usuario | brewer-cap | "Why '2 of 3' is misleading" | ✅ | En InfoQ el título tiene un error de tipeo ("missleading"); el tema usa el título correcto del original. |
| 20 | Brewer: la partición en la práctica es un timeout: cancelar (menos disponibilidad) o seguir (riesgo de inconsistencia) | brewer-cap | "Why '2 of 3' is misleading" | ⚠️ | El contenido es correcto, pero está en la sección "CAP-latency connection". Ver H2. |
| 21 | Manejo de particiones: detectar, modo de partición que limita operaciones, recuperar | brewer-cap | "Managing partitions" | ✅ | Título exacto; los tres pasos coinciden. |
| 22 | E-commerce: carrito disponible aunque pierda una actualización; producto algo viejo; cobro/facturación consistentes | gilbert-lynch-cap | §4.4 "Segmenting Consistency and Availability" (Data partitioning) | ✅ | La fuente dice "check-out/billing/shipping records"; el tema resume en "cobro y facturación". |
| 23 | CAP sin los mitos clásicos | gilbert-lynch-cap, brewer-cap | — | ✅ | El tema dice explícitamente que no es "elegí dos de tres", ubica la elección en la partición, no presenta "CA" como opción ni etiqueta bases como CP/AP (remite a Kleppmann como "para ver más"). Consistente con Gilbert-Lynch (2012) y Brewer (2012). |
| 24 | Profundizar: "consistencia en CAP es atomicidad, no la C de ACID; muchos sistemas no entran en CP/AP" | kleppmann-cap (blog) | — | ⚠️ | Verdadero (Gilbert-Lynch §2 define atomicidad; Kleppmann dice linealizabilidad), pero sin `<Cita>`. Ver H3. |
| 25 | e-intentos-multiplicados: 64 (errores 12 y 27) | cálculo | — | ✅ | Python: 4³ = 64; 3×4 = 12; 3³ = 27. |
| 26 | e-carga-por-reintentos: 1.600 (error 1.200) | cálculo | — | ✅ | 400 × 4 = 1.600; 400 × 3 = 1.200. |
| 27 | e-espera-backoff: 1.600 ms (errores 800 y 3.200) | cálculo | — | ✅ | 200·2³ = 1.600; coherente con la fórmula (n = 0 es el primer reintento). |
| 28 | e-cap-decision-real; e-vf-reintentar-post | gilbert-lynch-cap; rfc9110 | §2; §9.2.2 | ✅ | Respuestas correctas. En e-cap-decision-real la explicación del distractor usa a Brewer pero la fuente declarada es Gilbert-Lynch (menor). |
| 29 | Tarjetas (12): atomicidad y claridad | varias | — | ⚠️ | t-cap-por-operacion: pregunta y dorso compuestos y con error de concordancia. Ver H4. t-reintentos-capas ✅ (64). |
| 30 | Caso c-proveedor-pagos-cuelga: la decisión buena (timeout corto, sin reintentos inmediatos, breaker, reproducir de a poco con backoff y jitter, clave de idempotencia) | azure-circuit-breaker, sre-cascadas, azure-idempotente | varias | ✅ | Es práctica de las fuentes; las opciones malas (subir timeout, reiniciar, reproducir todo junto) son tentadoras; hay desenlaces regular. |
| 31 | Lecturas del simulador (breaker mide los últimos 20 pedidos; abierto: llamadas dejan de crecer; pasa por semiabierto) | SIMULADORES.md §2.9 | contrato | ✅ | Coincide con el contrato (umbral sobre los últimos 20 pedidos). El simulador usa 1 pedido de prueba en semiabierto; el texto dice "pocos", compatible con Azure. |
| 32 | Plagio | todas | — | ✅ | Solo coinciden títulos. |
| 33 | Estilo | GUIA-ESTILO | — | ✅ | CasoReal 121, Intuición 321, Formal 863 palabras (supera las 700; el autor lo declaró). Orden y voz correctos. |

## Hallazgos abiertos

**H1** — `docs/modulos/v1/fuentes/FUENTES-arquitecturas.md`, tema resiliencia-y-cap, fila 6 (columna "Cómo la verificaste"), y `src/content/temas/arquitecturas/resiliencia-y-cap/tema.mdx`, Formal, `<Formula nombre="Espera con backoff exponencial y jitter">`. Qué está mal: el registro dice que la fórmula "no está respaldada" y el texto la presenta sin fuente. Qué dice la fuente: la fórmula es exactamente la "Full Jitter" de Brooker: `sleep = random_between(0, min(cap, base * 2 ** attempt))` (imagen del artículo y simulador oficial de AWS). Corrección: no hace falta cambiar la fórmula ni el código. Actualizar la fila 6 con esta verificación y, en el texto, nombrar la fuente como lectura adicional ("la llaman *full jitter* en el artículo de Brooker, ver fuentes"). Se mantiene sin `<Cita>` porque es un blog (solo "para ver más" según GUIA-ESTILO §3); el respaldo citable del concepto es SRE cap. 22 "Retries".

Respuesta del autor: corregido: FUENTES fila 6 actualizada con la fórmula confirmada y el texto nombra a Brooker como lectura adicional.

Re-verificación F4: **CERRADO** (2294204). Fila 6 de FUENTES actualizada con la verificación y el texto nombra a Brooker como "full jitter" en lectura adicional, sin `Cita` (es blog).

**H2** — `resiliencia-y-cap/tema.mdx`, Formal, "CAP, sin simplificar", segundo párrafo: `<Cita f="brewer-cap" loc="Why '2 of 3' is misleading" />` cubre también "la partición, en la práctica, es un timeout: o cancelás o seguís". Esa idea está en "CAP-latency connection". La tarjeta `t-cap-particion-timeout` (misma fuente, sin `loc`) depende de esa sección. Corrección: `loc="Why '2 of 3' is misleading y CAP-latency connection"` (o dos citas).

Respuesta del autor: corregido: `loc` incluye "CAP-latency connection".

Re-verificación F4: **CERRADO** (2294204). `loc` = "Why '2 of 3' is misleading y CAP-latency connection".

**H3** — `resiliencia-y-cap/tema.mdx`, Formal, `<Profundizar titulo="¿CP y AP como etiqueta de productos?">`: "consistencia es atomicidad, no la C de ACID" y "muchos sistemas no entran en ninguna caja" no llevan cita (Kleppmann es blog y no puede respaldar). Corrección: agregar `<Cita f="gilbert-lynch-cap" loc="§2" />` a la afirmación de que la consistencia de CAP es la atómica (la definición está ahí) y dejar a Kleppmann solo como "para ver más". Opcional: completar la ficha de `gilbert-lynch-cap` con la revista (IEEE Computer, 2012; no figura en el PDF de MIT y no lo pude confirmar en línea, el escritor tampoco).

Respuesta del autor: corregido: la afirmación sobre la consistencia atómica lleva `Cita` a Gilbert-Lynch §2 y Kleppmann queda como "para ver más". Sobre la revista de `gilbert-lynch-cap`: no pude confirmarla, queda sin nombrar.

Re-verificación F4: **REABIERTO** (menor) en 2294204; ronda 2: **CERRADO** (bc6bfef): la oración lleva `<Cita f="gilbert-lynch-cap" loc="§2" /><Cita f="brewer-cap" loc="ACID, BASE, and CAP" />` (la sección existe en Brewer y dice que la C de CAP es consistencia de copia única, subconjunto de la C de ACID) y el frontmatter de `gilbert-lynch-cap` ahora dice "Computer (IEEE) 45(2), feb. 2012, pp. 30–36", coincidente con DSpace@MIT/IEEE Xplore; el build pasa. Detalle original: La nueva cita `<Cita f="gilbert-lynch-cap" loc="§2" />` respalda que la consistencia del teorema es la atómica, pero §2 no menciona ACID; la contraposición con la "C" de ACID está en Brewer, sección "ACID, BASE, and CAP" ("the C in CAP refers only to single-copy consistency, a strict subset of ACID consistency"). Corrección: citar también `<Cita f="brewer-cap" loc="ACID, BASE, and CAP" />` en esa oración. Publicación del paper, confirmada: Seth Gilbert y Nancy Lynch, "Perspectives on the CAP Theorem", *Computer* (IEEE Computer Society) 45(2), febrero de 2012, pp. 30–36 (DSpace@MIT, handle 1721.1/79112, e IEEE Xplore). El frontmatter de `gilbert-lynch-cap` sigue diciendo "artículo de 2012": completar `edicion` con "IEEE Computer 45(2), febrero de 2012, pp. 30–36". La parte de Kleppmann (muchos sistemas no son ni CP ni AP) sí está en su artículo.

**H4** — `resiliencia-y-cap/practica.yaml`, tarjeta `t-cap-por-operacion`. Qué está mal: pregunta con dos mitades ("qué datos toleran… y cuáles requieren…") y dorso con dos listas, contra GUIA-ESTILO §4 reglas 1 y 2; además "Tolera lo del carrito" debería concordar ("Toleran…"). Corrección: una tarjeta por dato ("En una tienda online, ¿qué nivel de consistencia exige el cobro?" / "¿Y el carrito?").

Respuesta del autor: corregido: dos tarjetas, una por dato.

Re-verificación F4: **CERRADO** (2294204). Dos tarjetas atómicas: cobro/facturación ("check-out/billing/shipping records… strongly consistent") y carrito ("highly available… losing a recent update"), con `fuente: gilbert-lynch-cap` (§4.4).

**H5** — `resiliencia-y-cap/tema.mdx`, Formal, "Circuit breaker": "Cada vez que se abre, debería saltar una alerta de monitoreo". Qué dice la fuente: Fowler escribe "usually you'll also want some kind of monitor alert if the circuit breaker trips" y "any change in breaker state should be logged". Corrección: "suele convenir una alerta cada vez que se abre, y los cambios de estado deberían registrarse". Menor.

Respuesta del autor: corregido: "suele convenir una alerta" y "deberían registrarse".

Re-verificación F4: **CERRADO** (2294204). "Suele convenir una alerta… deberían registrarse" coincide con "usually you'll also want some kind of monitor alert" y "any change in breaker state should be logged".

**H6** — `resiliencia-y-cap/tema.mdx`, frontmatter: `fowler-circuit-breaker` (bliki), `gilbert-lynch-cap` y `brewer-cap` (artículos de IEEE Computer reproducidos en PDF de autor / InfoQ) tipados `doc-oficial`. Los dos de CAP son artículos revisados de revista, no blogs; el de Fowler sí es sitio de autor. Misma observación de política que en los otros temas: decisión del director (tipo "artículo" en el esquema, o `verMas` para Fowler y respaldar el breaker solo con Azure, que ya lo cubre completo).


Respuesta del autor: decisión del director, se retipa a `articulo` tras el merge.

Re-verificación F4: **DIFERIDO**: se cierra en la pasada de retipado a `articulo` del director; no bloquea el veredicto.
Respuesta del autor (ronda 2): corregido: se agregó `<Cita f="brewer-cap" loc="ACID, BASE, and CAP" />` y la ficha de `gilbert-lynch-cap` dice Computer (IEEE) 45(2), feb. 2012, pp. 30-36 (dato aportado por F4, no lo confirmé por mi cuenta).
