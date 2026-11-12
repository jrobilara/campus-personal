# FUENTES — Arquitecturas y microservicios
- Escritor: F3-arquitecturas · Fecha: 2026-11-11

> Cómo se verificó: todas las páginas se abrieron con WebFetch el 2026-11-11. Para las páginas del Azure Architecture Center, el paper de Gilbert y Lynch (PDF leído con `pdftotext`) la herramienta devolvió el texto completo o casi completo. Para Fowler, microservices.io, AWS, Kafka, SRE (sre.google), NGINX, RabbitMQ, RFC 9110, InfoQ (Brewer) y Kleppmann la herramienta devolvió resúmenes elaborados por un modelo sobre el texto de la página: las "ubicaciones" que doy para esas fuentes son los títulos de sección que el resumen reportó. F4 debería reabrirlas para confirmar el título exacto de cada sección. Ningún libro de pago se consultó: los dos que aparecen (Newman, Kleppmann) están como "para ver más" sin capítulo.

## monolito-y-microservicios
| # | Afirmación clave (tu paráfrasis) | Dónde está | Fuente (id) | Ubicación exacta | Cómo la verificaste |
|---|---|---|---|---|---|
| 1 | Un monolito es un componente desplegable único, con una sola base, que contiene todos los subdominios; las operaciones son locales. | Formal, Las tres formas | richardson-monolito | párrafo de definición | Leí la página (WebFetch, resumen). |
| 2 | Microservicios: servicios pequeños y autónomos, una capacidad de negocio en un bounded context, datos propios, despliegue separado, APIs bien definidas. | Formal, Las tres formas | azure-microservicios | introducción (párrafo sin título) y "What are microservices?" | Texto completo de la página; corregido tras F4 (el bounded context está en el párrafo inicial). |
| 3 | Monolito modular: un solo despliegue con límites claros en las APIs y en el almacenamiento, lo que hace relativamente simple partirlo. | Formal, Las tres formas | fowler-monolith-first | pasaje sobre modularidad en API y capa de datos (el artículo no tiene subtítulos que haya podido confirmar) | Resumen del artículo con WebFetch. |
| 4 | No cualquier sistema se puede partir: la mayoría acumula demasiadas dependencias entre módulos. | Formal, Las tres formas | fowler-monolith-first | mismo pasaje | Idem. |
| 5 | Ventajas/desventajas del monolito: despliegue que obliga a construir y probar todo, equipos que coordinan más, operaciones ACID locales, depuración más simple. | Formal, tabla (columna monolito) | richardson-monolito | "Resulting context" | Leí la página. |
| 6 | Ventajas/desafíos de microservicios: despliegue independiente, equipos autónomos, escalado selectivo, consistencia eventual, más piezas (descubrimiento, logs correlacionados, versionado). | Formal, tabla (columna microservicios) | azure-microservicios | "Benefits" y "Challenges" | Texto completo. |
| 7 | En el monolito un cambio chico ata todo el ciclo de despliegue y se escala la aplicación entera. | Formal, tras la tabla | fowler-microservices | introducción (primeros párrafos) | Resumen con WebFetch. |
| 8 | Pasar llamadas en memoria a remotas las encarece y pide APIs más gruesas; una conversión ingenua da comunicación "chatty". | Formal, El costo escondido | fowler-microservices | "Componentization via Services" (costo y APIs gruesas) y "Smart endpoints and dumb pipes" (chatty) | Corregido tras F4 (H1). |
| 9 | Una charla excesiva entre servicios puede ser síntoma de acoplamiento fuerte y baja cohesión (la fuente dice "might be"). | Formal, El costo escondido | azure-microservicios | "Best practices" (viñeta sobre loose coupling y high functional cohesion) | Texto completo; corregido tras F4 (H5). |
| 10 | Con dependencias duras en serie, la disponibilidad es el producto de las disponibilidades; AWS la plantea para sistemas independientes. | Formal, Disponibilidad compuesta | aws-disponibilidad | "Calculating availability with hard dependencies" | Resumen/lectura de la página; el ejemplo 99,99 %³ = 99,97 % figura ahí. |
| 11 | 0,999^5 = 0,9950 (99,50 %); ≈ 44 h/año caído; un componente 99,9 % ≈ 8,8 h/año. | Formal; Intuición (lectura del simulador) | aws-disponibilidad | cuenta propia con Python; la tabla de AWS da 99,9 % = 8 h 45 min por año | `python3`: 0,999**5 = 0,99501; (1-0,99501)*8760 = 43,7 h. |
| 12 | Encadenar llamadas síncronas multiplica la caída; salidas: asíncronas o administrar la caída. | Formal | fowler-microservices | barra lateral "Synchronous calls considered harmful" | Resumen con WebFetch. |
| 13 | Casi todas las historias exitosas de microservicios partieron de un monolito; los armados desde cero tendieron a terminar mal; consejo: monolito primero y bien modularizado. Es una observación anecdótica y Fowler la da como tentativa (el texto lo dice, tras F4 H4). | Formal, Cuándo conviene | fowler-monolith-first | cuerpo del artículo (argumento central y cautelas finales) | Resumen con WebFetch; matiz confirmado por el verificador F4. |
| 14 | Razones: no sabés si el producto funcionará; límites difíciles de acertar y más caros de corregir entre servicios. | Formal, Cuándo conviene | fowler-monolith-first | "YAGNI" y "service boundaries" del artículo | Idem. |
| 15 | El "premium": despliegue automatizado, monitoreo, fallas, consistencia eventual; se justifica con complejidad real (equipos grandes, escala, tamaño). | Formal, Cuándo conviene | fowler-premium | cuerpo del artículo | Resumen con WebFetch. |
| 16 | Hace falta cultura DevOps madura y evaluar la experiencia del equipo. | Formal, Cuándo conviene | azure-microservicios | "Challenges" (Management, Skill set) | Texto completo. |
| 17 | Existe la estrategia de desprender servicios desde los bordes de a poco. | Formal, Cuándo conviene | fowler-monolith-first | pasaje "Other strategies" | Resumen. |
| 18 | Modelar servicios por dominio (DDD), evitar servicios demasiado finos; lo que cambia junto debe vivir junto. | Formal, Profundizar | azure-microservicios | "Best practices" | Texto completo. |
| 19 | Fowler advierte que la mayoría de los sistemas tiene demasiadas dependencias entre módulos para partirse con sentido y que los intentos terminaron seguido en un lío. La metáfora "reparte el enredo por la red" es inferencia mía, separada en el texto con "En criollo:". | Intuición, Ojo | fowler-monolith-first | nota al pie 1 (la inferencia no se cita) | Corregido tras F4 (H3). |
| 20 | Con 5 saltos de 99,9 % la disponibilidad compuesta da 99,50 %; con timeouts y circuit breaker, tirar antifraude deja pagos degradado y el gateway ok. | Intuición (lectura de simuladores) | — | SIMULADORES.md §2.8 y §2.11 (contrato del simulador) | Lo dice el contrato; verificar contra el simulador real cuando exista. |
| t-monolito-modular-definicion | Monolito modular = un despliegue + límites claros en APIs y datos. | tarjeta | fowler-monolith-first | idem #3 | idem |
| t-monolith-first-razon | Razón del monolith-first. | tarjeta | fowler-monolith-first | idem #14 | idem |
| t-premium-microservicios | Qué es el premium. | tarjeta | fowler-premium | idem #15 | idem |
| t-disponibilidad-serie-tres | 0,999^3 ≈ 0,997. | tarjeta | aws-disponibilidad | idem #10 | Cuenta con Python: 0,997003. |
| t-disponibilidad-independencia | Supuesto de independencia de las fallas (una sola idea tras F4 H7). | tarjeta | aws-disponibilidad | idem #10 | idem |
| t-dependencia-blanda-aplicacion | Dependencia blanda: la falla del otro sistema se compensa en la aplicación (frente a la dura, donde se traduce en caída). Tarjeta de aplicación, ronda 2. | tarjeta | aws-disponibilidad | "Calculating availability with hard dependencies" | Texto completo. |
| t-base-por-servicio-costo | Con base por servicio se pierde ACID entre servicios (queda consistencia eventual). | tarjeta | azure-microservicios | "Challenges", Data integrity | Texto completo. |
| t-charla-excesiva-sintoma | Charla excesiva puede ser síntoma de acoplamiento. | tarjeta | azure-microservicios | idem #9 | idem |
| t-escalar-parte | Escalado selectivo de microservicios vs escalar el monolito entero. | tarjeta | fowler-microservices | introducción | Resumen. |
| t-llamada-remota-costo | Llamadas remotas cuestan más; APIs más gruesas; chatty. | tarjeta | fowler-microservices | "Componentization via Services" | Resumen. |
| e-disponibilidad-seis-servicios | 0,999^6 = 99,40 %. | ejercicio | aws-disponibilidad | idem #10 | Python: 0,994015. |
| e-horas-caido-cuatro-servicios | 0,9995^4 = 0,99800; 17,5 h/año. | ejercicio | aws-disponibilidad | idem #10 | Python: 17,507 h. |
| e-elegir-arquitectura-equipo-chico | Monolito modular para equipo chico y producto no validado; microservicios con base compartida no dan independencia. | ejercicio | fowler-monolith-first | idem #13, #14; la opción de base compartida sale de azure-microservicios ("Avoid coupling... shared database schemas") | Resumen y texto completo. |
| e-vf-cada-servicio-999 | Cadena de 5 servicios de 99,9 % da 99,50 %. | ejercicio | aws-disponibilidad | idem #10 | Python. |
| c-antifraude-cuelga | Una dependencia lenta retiene hilos; timeout corto + circuit breaker + camino degradado limitan el contagio. | caso | azure-microservicios | "Benefits", Fault isolation; el efecto de timeouts largos está en azure-circuit-breaker "Context and problem" (no citada en este tema) | Texto completo. Los tiempos (29 de 30 s, etc.) son ilustrativos. |
| p-disponibilidad-tu-sistema | Ejercicio de cálculo con dependencias duras. | problema | aws-disponibilidad | "Availability" | Leí la sección. |
| p-decidir-arquitectura | Comparar criterios de Fowler y Azure. | problema | fowler-monolith-first | artículo + "Challenges" de azure-microservicios | Leí ambas. |

### Fuentes del tema
- `fowler-monolith-first`: Martin Fowler, "Monolith First", 3 de junio de 2015, martinfowler.com. Acceso: web, resumen vía WebFetch.
- `fowler-premium`: Martin Fowler, "Microservice Premium", 13 de mayo de 2015. Acceso: web, resumen.
- `fowler-microservices`: Martin Fowler y James Lewis, "Microservices", 25 de marzo de 2014. Acceso: web, resumen.
- `richardson-monolito`: Chris Richardson, "Monolithic Architecture", microservices.io. Acceso: web, resumen.
- `azure-microservicios`: Microsoft, "Microservices Architecture Style", Azure Architecture Center (ms.date 2025-06-30). Acceso: texto completo.
- `aws-disponibilidad`: AWS Well-Architected, Reliability Pillar, "Availability". Acceso: texto completo en pantalla (ejemplo de dependencias duras y redundantes).
- `newman-microservicios` (para ver más): no consultado; sin capítulo.

### Números y datos inventados para ejemplos
- Caso real: equipo de 4 personas, deploy semanal de 12 minutos, 9 servicios: ilustrativo.
- Caso de guardia: 20:15, p95 de 30 s, 29 de 30 s esperando a antifraude: ilustrativo.
- Disponibilidades de 99,9 % y 99,95 % por servicio de los ejercicios: ilustrativas.

## sincrono-vs-asincrono
| # | Afirmación clave (tu paráfrasis) | Dónde está | Fuente (id) | Ubicación exacta | Cómo la verificaste |
|---|---|---|---|---|---|
| 1 | RPI: el cliente manda y espera; ambos deben estar vivos todo el tiempo (acoplamiento en ejecución, menor disponibilidad); es simple y sin broker. | Formal, Dos estilos | richardson-rpi | "Benefits" y "Drawbacks" | Resumen de la página. |
| 2 | Cadenas de llamadas síncronas multiplican la caída. | Formal, Dos estilos | fowler-microservices | barra lateral "Synchronous calls considered harmful" | Resumen. |
| 3 | Mensajería: el broker desacopla; emisor y consumidor no tienen que estar a la vez; el broker retiene mensajes; costo: broker altamente disponible y pedido-respuesta más difícil. | Formal, Dos estilos | richardson-mensajeria | "Benefits" y "Drawbacks" | Resumen. |
| 4 | Queue-based load leveling: cola entre tarea y servicio, la cola guarda y el servicio toma a su ritmo; los emisores no se demoran si el servicio no está; se dimensiona para la media y no para el pico. | Formal, La cola como amortiguador | azure-colas | "Solution" | Texto completo. |
| 5 | Si la tasa media de llegada supera la de consumo, la cola crece y sube la latencia; monitorear profundidad, escalar con límite o descartar en el productor. | Formal | azure-colas | "Problems and considerations" | Texto completo. |
| 6 | $\mu = c/t$, $T = Q/(\lambda-\mu)$; 50 s con los números del simulador. | Formal, Fórmula | — | aritmética propia | Python: 2/0,5 = 4; 50/(5-4) = 50. Además corrí un script con queue.Queue: crece ~1/s. |
| 7 | Kafka: eventos con clave, valor y marca de tiempo; tópicos con muchos productores/suscriptores; el evento leído no se borra, vence por retención; particiones; misma clave a la misma partición; orden solo dentro de una partición. | Formal, Broker y log | kafka-intro | "Main Concepts and Terminology" | Resumen de la página. |
| 8 | Dentro de un grupo de consumidores clásico (*consumer group*), cada partición la consume un solo consumidor; posición = offset; se puede retroceder; los consumidores hacen pull. | Formal | kafka-diseno | "Consumer Position and Offsets", "Push vs. Pull" | Resumen (Kafka 4.4); acotado a grupos clásicos tras F4 H3 (existen los share groups). |
| 9 | RabbitMQ: con ack manual, entregas sin confirmar vuelven a la cola si se cierra el canal o la conexión; el reentregado viene marcado; los consumidores deben estar preparados para reentregas y diseñarse con idempotencia en mente. | Formal | rabbitmq-confirmaciones | "When Consumers Fail or Lose Connection: Automatic Requeueing" | Resumen; sección corregida tras F4 (H2). |
| 10 | La mayoría de los brokers (Kafka, RabbitMQ incluidos) entrega al menos una vez; exactly-once de punta a punta es impracticable porque el broker solo controla lo propio. | Formal, Duplicados | azure-idempotente | "Context and problem" | Texto completo. |
| 11 | Kafka: al-menos-una-vez es la garantía por defecto; ofrece exactly-once entre tópicos con transacciones, pero hacia sistemas externos requiere la cooperación de ellos; por eso el consumidor idempotente sigue siendo la defensa. | Formal | kafka-diseno | "Message Delivery Semantics" | Resumen; reescrito tras F4 (H1). El pedido de idempotencia se respalda con #9, no con Kafka. |
| 12 | Consumidor idempotente: procesar dos veces = una vez. | Formal | azure-idempotente | "Solution" | Texto completo. |
| 13 | Preferir operaciones naturalmente idempotentes (upsert, valor absoluto) o clave de deduplicación estable. | Formal | azure-idempotente | "Problems and considerations", "Choose a stable deduplication key" | Texto completo. |
| 14 | La restricción de unicidad hace que la base arbitre duplicados concurrentes; el marcador y el efecto van en la misma transacción. | Formal (SQL) | azure-idempotente | "Guard against concurrent duplicates" y "Commit the processed key and the side effects atomically" | Texto completo. El SQL es mío (PostgreSQL estándar). |
| 15 | Dead-letter queue para mensajes imposibles de procesar, monitoreada; el orden no se conserva siempre con consumidores paralelos; las colas son de una vía. | Formal, Otros cuidados | azure-colas | "Problems and considerations" | Texto completo. |
| 16 | No conviene cola cuando se necesita respuesta síncrona de baja latencia. | Intuición, Ojo; tarjeta | azure-colas | "When to use this pattern" | Texto completo. |
| 17 | Lecturas del simulador: la espera síncrona sube con la latencia de B y la asíncrona no; con B caído suma errores/pendientes; 2 consumidores a 0,5 s procesan 4/s; con "consumidor caído" los mensajes se acumulan y se drenan al volver mientras la cola tenga lugar. Con llegada de 5/s y capacidad 50, un corte total del consumo llena la cola en 50/5 = 10 s y desde ahí se pierden mensajes (`perdidos`). | Intuición | — | SIMULADORES.md §2.8 | Contrato del simulador; cuenta con Python; falta verificar contra el real. |
| t-broker-ventaja, t-broker-costo | ver #3 | tarjetas | richardson-mensajeria | idem | idem |
| t-cola-crece-sin-parar | ver #5 | tarjeta | azure-colas | idem | idem |
| t-tasa-consumo-calculo | 2 / 0,5 = 4. | tarjeta | — | aritmética | Mental/Python. |
| t-dead-letter | ver #15 | tarjeta | azure-colas | idem | idem |
| t-redelivery-crash | Un consumidor que se cae sin confirmar provoca reentrega. | tarjeta | rabbitmq-confirmaciones | idem #9 | idem |
| t-consumidor-idempotente, t-exactly-once-limite | ver #12 y #10 | tarjetas | azure-idempotente | idem | idem |
| t-kafka-no-borra, t-kafka-orden-particion | ver #7 | tarjetas | kafka-intro | idem | idem |
| t-cuando-no-cola, t-cuando-no-cola-carga-estable | ver #16 (dos tarjetas, una por caso, tras F4 H5) | tarjetas | azure-colas | "When to use this pattern" | Texto completo. |
| e-tiempo-llenar-cola | 50 s. | ejercicio | azure-colas | idem #5, #6 | Python. |
| e-consumidores-necesarios | 30 · 0,4 = 12. | ejercicio | azure-colas | aritmética | Python. |
| e-evitar-doble-cobro | Clave única en la misma transacción. | ejercicio | azure-idempotente | idem #14 | idem |
| e-vf-kafka-borra | El evento no se borra al leerse. | ejercicio | kafka-intro | idem #7 | idem |
| c-cola-mails-crece | Con 20 consumidores configurados y la mitad reiniciando, 10 sanos × 4 = 40/s contra 30/s que entran: la cola baja 10/s, 18.000 / 10 = 1.800 s = 30 min (ronda 2). Diagnosticar tasas, aislar mensajes venenosos en dead-letter, escalar con límite; purgar pierde mensajes. Cuenta (F4 H6): cada consumidor 4 msg/s; 2 sanos = 8/s; con 12 sanos = 48/s contra 30 que entran, la cola baja 18/s y 18.000 / 18 = 1.000 s ≈ 17 min. | caso | azure-colas | "Problems and considerations" | Texto completo; cuenta con Python. Cifras ilustrativas. |
| p-kafka-quickstart | Pasos del Quickstart (descargar la distribución con los scripts bin/, broker con scripts o Docker, crear tópico, productor y consumidor de consola, --from-beginning). | problema | kafka-quickstart | pasos 1 a 5 | Resumen con los comandos; enunciado aclarado tras F4 H7. No lo ejecuté. |
| p-cola-python | Simulación con queue.Queue. | problema | azure-colas | "Problems and considerations" | Corrí el script: la cola crece ~1/s con 2 consumidores. |

### Fuentes del tema
- `richardson-rpi`, `richardson-mensajeria`: Chris Richardson, microservices.io. Acceso: web, resumen.
- `azure-colas` (ms.date 2026-06-09), `azure-idempotente` (ms.date 2026-08-13): Azure Architecture Center. Acceso: texto completo.
- `kafka-intro` (https://kafka.apache.org/intro), `kafka-diseno` (https://kafka.apache.org/44/design/design/), `kafka-quickstart` (https://kafka.apache.org/quickstart): documentación de Kafka 4.4. Acceso: web, resumen.
- `rabbitmq-confirmaciones`: RabbitMQ, "Consumer Acknowledgements and Publisher Confirms". Acceso: web, resumen.
- `fowler-microservices`: ver arriba.

### Números y datos inventados para ejemplos
- Caso real: 200 hilos, mail de 150 ms a 8 s, 11:40: ilustrativo.
- Caso de guardia: 18.000 mensajes, 30 entran y 8 salen por segundo, 2 de 4 consumidores en bucle: ilustrativo.

## escalabilidad-balanceo-cache
| # | Afirmación clave (tu paráfrasis) | Dónde está | Fuente (id) | Ubicación exacta | Cómo la verificaste |
|---|---|---|---|---|---|
| 1 | Vertical = más capacidad a un recurso, útil si la carga no se divide; horizontal = más instancias, mejor resiliencia y capacidad, para cargas divisibles. | Formal, Escalar | azure-escalado | "Choose a scaling strategy" | Texto completo. |
| 2 | Hay que evitar sesión en el servidor (externalizarla) y la afinidad de cliente. | Formal | azure-escalado | "Design application to scale" | Texto completo. |
| 3 | Evitar singletons cuello de botella. | Formal | azure-escalado | "Design infrastructure to scale" (Avoid singletons) | Texto completo. |
| 4 | $\rho=\lambda/(N\mu)$ y $N \ge \lceil \lambda/(\mu\rho_{obj})\rceil$; 600 / (50·0,7) = 17,1 → 18. | Formal, Fórmula | — | aritmética propia | Python: 17,14. |
| 5 | Azure recomienda un colchón de capacidad libre para absorber picos inesperados, y advierte que completar un escalado lleva tiempo y hay que probar el efecto de esas demoras. La conclusión "como tarda, el colchón te cubre mientras tanto" es mía y está marcada "En criollo". | Formal | azure-escalado | "Configure scaling" (Use a buffer) y "Test scaling" (It takes time for scaling to complete) | Texto completo; corregido tras F4 (E-H1). |
| 6 | Si un clúster cae y el otro recibe +20 % de tráfico, puede no absorberlo. | Formal | sre-cascadas | "Server Overload" | Resumen. |
| 7 | NGINX: round-robin por defecto; least_conn al de menos conexiones activas (ayuda con pedidos largos); ip_hash persistencia; weight; chequeos pasivos: `max_fails` intentos fallidos dentro de la ventana de `fail_timeout` marcan al servidor como no disponible, y `fail_timeout` es también cuánto dura ese estado. | Formal, Balanceo | nginx-balanceo | "Load balancing methods", "Health checks"; la precisión sobre la ventana viene de la referencia del módulo upstream, según el verificador F4 | Resumen. La configuración de ejemplo es propia y usa solo directivas descritas ahí; no la ejecuté (no hay nginx en la PC). |
| 8 | Un algoritmo mal elegido puede fijar artificialmente clientes en una instancia. | Formal | azure-escalado | "Review your load balancing algorithm" | Texto completo. |
| 9 | Dos réplicas independientes de 99,9 % dan 99,9999 %. | Formal | aws-disponibilidad | "Calculating availability with redundant components" | Texto completo del ejemplo. |
| 10 | Cache-aside: mirar la caché, ante miss leer la base, guardar y devolver; al escribir, escribir en la base y luego invalidar. | Formal, Caché | azure-cache-aside | "Solution" | Texto completo. |
| 11 | Orden importa: invalidar antes de escribir permite recargar el valor viejo. | Formal | azure-cache-aside | "Example" (nota sobre el orden) | Texto completo. |
| 12 | Cache-aside no garantiza consistencia; TTL ni muy corto ni muy largo; caché local privada puede desincronizarse. | Formal | azure-cache-aside | "Problems and considerations" | Texto completo. |
| 13 | Carga a la base = λ(1-h). | Formal | — | aritmética propia | Python. |
| 14 | Caché fría encarece los pedidos; recomienda sobredimensionar, subir carga de a poco, usar cachés de latencia y no de capacidad. | Formal; Intuición, Ojo | sre-cascadas | "Slow Startup and Cold Caching" | Resumen. |
| 15 | Load shedding y degradación elegante. | Formal | sre-cascadas | "Load Shedding and Graceful Degradation" | Resumen. |
| 16 | Lecturas del simulador (colas crecen si λ > servidores × capacidad; con caché 80 % baja la utilización; con servidor lento menos-conexiones tiene p95 menor que round-robin). | Intuición | — | SIMULADORES.md §2.8 | Contrato del simulador; falta verificar contra el real. |
| t-escala-vertical-horizontal | ver #1 | tarjeta | azure-escalado | idem | idem |
| t-sesion-afinidad | ver #2 | tarjeta | azure-escalado | idem | idem |
| t-colchon-capacidad, t-escalado-demora | ver #5 (una tarjeta por idea, tras F4 E-H1) | tarjetas | azure-escalado | idem | idem |
| t-nginx-default, t-least-conn-cuando, t-ip-hash-para-que, t-max-fails-fail-timeout, t-fail-timeout-doble-rol | ver #7 | tarjetas | nginx-balanceo | idem | idem |
| t-cache-miss-pasos, t-cache-orden-escritura | ver #10 y #11 | tarjetas | azure-cache-aside | idem | idem |
| t-carga-base-acierto | 100 × 0,2 = 20. | tarjeta | — | aritmética | mental |
| t-cache-fria | ver #14 | tarjeta | sre-cascadas | idem | idem |
| e-servidores-necesarios | 18 servidores. | ejercicio | azure-escalado | ver #4, #5 | Python: ceil(600/35). |
| e-carga-base-con-cache | 600 · 0,15 = 90. | ejercicio | azure-cache-aside | ver #13 | Python. |
| e-servidor-lento | least_conn mejor con servidor lento; ip_hash no corrige; TTL no resuelve. | ejercicio | nginx-balanceo | ver #7 | Resumen; la parte "ayuda cuando algunos pedidos tardan más" sale del doc. |
| e-vf-cache-consistente | cache-aside no garantiza consistencia. | ejercicio | azure-cache-aside | ver #12 | Texto completo. |
| c-hot-sale-pico | El autoscaler tarda; hay que dimensionar antes, calentar cachés y subir tráfico gradual; TTL largo alivia la base pero deja datos viejos. | caso | azure-escalado | "Configure scaling"; cachés en sre-cascadas y azure-cache-aside | Texto. Cifras ilustrativas. |
| p-nginx-tres-backends | Probar los métodos con tres backends locales. | problema | nginx-balanceo | página completa | No lo ejecuté. |
| p-cache-aside-python | Implementar cache-aside. | problema | azure-cache-aside | "Solution", "Problems and considerations" | Texto completo. |

### Fuentes del tema
- `azure-escalado` (ms.date 2023-11-15), `azure-cache-aside` (ms.date 2025-09-11): texto completo.
- `nginx-balanceo`: https://nginx.org/en/docs/http/load_balancing.html. Resumen. No mencioné `hash`, `random` ni `least_time` porque esa página no los cubre o no los verifiqué.
- `sre-cascadas`: Beyer et al. (eds.), *Site Reliability Engineering*, O'Reilly, 2016, cap. 22 (el número de capítulo lo confirmé en el índice de sre.google). Resumen.
- `aws-disponibilidad`: ver tema 1.

### Números y datos inventados para ejemplos
- Caso real: 60 pedidos/s normales, 50 por servidor, ×10, autoscaler de 4 minutos, p95 de 300 ms a 12 s: ilustrativo.
- Caso de guardia: 23:55, tres servidores de 50: ilustrativo.

## resiliencia-y-cap
| # | Afirmación clave (tu paráfrasis) | Dónde está | Fuente (id) | Ubicación exacta | Cómo la verificaste |
|---|---|---|---|---|---|
| 1 | Sin timeout, los pedidos bloqueados retienen hilos, memoria y conexiones y pueden agotar recursos de otras partes. | Formal, Timeouts | azure-circuit-breaker | "Context and problem" | Texto completo. |
| 2 | El timeout debe ser corto pero suficiente para que la operación funcione la mayoría de las veces. | Formal | azure-circuit-breaker | "Context and problem" | Texto completo. |
| 3 | Propagar el plazo restante: 30 s con 7 gastados deja 23. | Formal | sre-cascadas | "Latency and Deadlines" | Resumen. |
| 4 | Retry: cancelar, reintentar de inmediato o con demora (que puede crecer exponencialmente). | Formal, Reintentos | azure-retry | "Retry strategies" | Texto completo. |
| 5 | Una política agresiva degrada más a un servicio al límite. | Formal | azure-retry | "Impact on performance" | Texto completo. |
| 6 | Usar siempre backoff exponencial aleatorizado; el azar evita sincronización. Fórmula `espera = aleatorio(0, min(tope, base·2^n))`: es la variante "Full Jitter" del artículo de Brooker (para ver más). | Formal | sre-cascadas | "Retries" (concepto); la fórmula, en brooker-jitter (blog, sin `Cita`) | Concepto: resumen de SRE. Fórmula: confirmada por el verificador F4 contra el artículo de Brooker (sleep = random_between(0, min(cap, base * 2 ** attempt))); el texto del tema ahora nombra la fuente. |
| 7 | 3 reintentos (4 intentos) en 3 capas = 64 intentos en la base. | Formal | sre-cascadas | "Retries" | Resumen; Python: 4**3 = 64. |
| 8 | Reintentar solo en la capa inmediatamente superior, máx. 3 intentos por pedido, presupuesto por cliente de 10 %. | Formal | sre-sobrecarga | "Deciding to Retry" | Resumen. |
| 9 | Reintento solo donde se conoce el contexto: capas anidadas agregan demoras. | Formal | azure-retry | "General guidance" | Texto completo. |
| 10 | Idempotente = seguro de reintentar; si no, puede ejecutarse dos veces. | Formal, Idempotencia | azure-retry | "Idempotency" | Texto completo. |
| 11 | HTTP: PUT, DELETE y métodos seguros son idempotentes; un cliente no debe reintentar automáticamente un método no idempotente salvo que sepa que lo es o que no se aplicó. | Formal | rfc9110 | §9.2.2 | Resumen del texto de la RFC. Que POST no es idempotente se deduce de que no está en la lista. |
| 12 | Clave de negocio estable (id de la orden) para descartar duplicados. | Formal | azure-idempotente | "Choose a stable deduplication key" | Texto completo. Aplicado a un cobro por analogía: el patrón habla de mensajes. |
| 13 | Circuit breaker con tres estados y sus transiciones. | Formal | azure-circuit-breaker | "Solution" | Texto completo. |
| 14 | Contador temporal en cerrado; semiabierto evita inundar al servicio que se recupera. | Formal | azure-circuit-breaker | "Solution" | Texto completo. |
| 15 | No usar para recursos locales ni como sustituto del manejo de excepciones; quien llama necesita plan (degradar, alternativa, avisar). | Formal | azure-circuit-breaker | "Problems and considerations" (Exception handling) y "When to use this pattern" | Texto completo. |
| 16 | Suele convenir una alerta de monitoreo cada vez que se abre el breaker, y los cambios de estado deberían registrarse. | Formal | fowler-circuit-breaker | sección de monitoreo del artículo | Resumen; verbo ajustado tras F4 (R-H5). |
| 17 | CAP (Gilbert-Lynch): consistencia atómica, disponibilidad = todo pedido recibe respuesta eventualmente, partición = red que demora o pierde mensajes; imposible garantizar respuesta a todo pedido con atomicidad en una red con fallas. | Formal, CAP | gilbert-lynch-cap | §2 (Consistency, Availability, Partition-tolerance y "The CAP Theorem" con el esquema de prueba) | Leí el texto completo (pdftotext del PDF). |
| 18 | Brewer: "2 de 3" engaña; solo se renuncia a una de las dos durante la partición; la partición es un timeout; la decisión es por operación/dato/usuario; manejo: detectar, modo de partición, recuperar. | Formal; Intuición, Ojo | brewer-cap | "Why '2 of 3' is misleading", "CAP-latency connection" (partición = timeout), "Managing partitions" | Resumen de la reproducción en InfoQ; sección corregida tras F4 (R-H2). |
| 19 | Carrito disponible aunque pierda una actualización; info de producto algo vieja; cobro y facturación fuertemente consistentes. | Formal | gilbert-lynch-cap | §4.4 "Segmenting Consistency and Availability" (Data partitioning) | Leí el texto completo. |
| 20 | La consistencia del teorema CAP es la atómica (no la "C" de ACID). Kleppmann argumenta que por eso muchos sistemas no entran en CP/AP (solo "para ver más", sin `Cita`). | Formal, Profundizar | gilbert-lynch-cap, brewer-cap | §2 de Gilbert-Lynch (definición de consistencia) y "ACID, BASE, and CAP" de Brewer (contraste con ACID, sección indicada por el verificador F4); kleppmann-cap solo como lectura adicional | Texto completo del PDF; reescrito tras F4 (R-H3). |
| 21 | El breaker del simulador mide el umbral sobre los últimos 20 pedidos; abierto: las llamadas al servicio dejan de crecer; pasa por semiabierto. | Intuición; Formal | — | SIMULADORES.md §2.9 | Contrato del simulador; falta verificar contra el real. |
| t-timeout-sin-limite | ver #1 | tarjeta | azure-circuit-breaker | idem | idem |
| t-breaker-abierto-rapido, t-breaker-semiabierto, t-breaker-contador-temporal | ver #13 y #14 | tarjetas | azure-circuit-breaker | idem | idem |
| t-jitter-para-que | ver #6 | tarjeta | sre-cascadas | idem | idem |
| t-reintentos-capas | ver #7 | tarjeta | sre-cascadas | idem | idem |
| t-reintento-idempotente | ver #10 | tarjeta | azure-retry | idem | idem |
| t-http-idempotentes | ver #11 | tarjeta | rfc9110 | §9.2.2 | idem |
| t-presupuesto-reintentos | ver #8 | tarjeta | sre-sobrecarga | idem | idem |
| t-cap-eleccion-real, t-cap-particion-timeout | ver #18 | tarjetas | brewer-cap | idem | idem |
| t-cap-cobro-consistente, t-cap-carrito-disponible | ver #19 (una tarjeta por dato, tras F4 R-H4) | tarjetas | gilbert-lynch-cap | §4.4 | idem |
| e-intentos-multiplicados | 4³ = 64. | ejercicio | sre-cascadas | ver #7 | Python. |
| e-carga-por-reintentos | 400 · 4 = 1600. | ejercicio | azure-retry | ver #5 (política agresiva) | Python. |
| e-espera-backoff | 200 · 2³ = 1600 ms. | ejercicio | azure-retry | ver #4 | Python. |
| e-cap-decision-real | Responder con datos posiblemente viejos o negarse a responder, durante la partición. | ejercicio | gilbert-lynch-cap | §2 (prueba) | Texto completo. |
| e-vf-reintentar-post | Un timeout no dice si se aplicó; hace falta clave de idempotencia. | ejercicio | rfc9110 | §9.2.2 | Resumen; ver #12. |
| c-proveedor-pagos-cuelga | Timeout largo retiene hilos; breaker + backoff con jitter + idempotencia; reproducir todo de golpe satura. | caso | azure-circuit-breaker | "Context and problem", "Solution" | Texto completo. Cifras ilustrativas. |
| p-circuit-breaker-propio | Implementar los tres estados. | problema | azure-circuit-breaker | "Solution" | Texto completo. |
| p-cuenta-reintentos | Rehacer la cuenta del libro SRE. | problema | sre-cascadas | cap. 22, "Retries" | Resumen. |
| p-cap-por-operacion | Tabla por operación. | problema | gilbert-lynch-cap | §2 y §4.4 | Texto completo. |

### Fuentes del tema
- `azure-circuit-breaker` (ms.date 2025-02-05), `azure-retry` (ms.date 2024-07-18), `azure-idempotente`: texto completo.
- `fowler-circuit-breaker`: Martin Fowler, 6 de marzo de 2014. Resumen.
- `sre-cascadas` (cap. 22) y `sre-sobrecarga` (cap. 21, confirmado en el índice de sre.google): resumen.
- `rfc9110`: IETF, RFC 9110 "HTTP Semantics" (2022), §9.2.2. Resumen de la sección.
- `gilbert-lynch-cap`: Seth Gilbert y Nancy A. Lynch, "Perspectives on the CAP Theorem", 2012 (*Computer* (IEEE) 45(2), feb. 2012, pp. 30–36, dato aportado por el verificador F4; PDF en groups.csail.mit.edu). PDF leído completo. Nota: es el artículo de revisión de 2012, no el de 2002 (el PDF del paper original no pude extraerlo: la fuente embebida está codificada y no se lee). Por eso no cito el paper original.
- `brewer-cap`: Eric Brewer, "CAP Twelve Years Later", IEEE Computer, 2012, reproducido por InfoQ. Resumen. Datos bibliográficos (Computer 45(2), feb. 2012, pp. 23-29, DOI 10.1109/MC.2012.37) confirmados contra Crossref el 2026-11-12.
- `brooker-jitter`, `kleppmann-cap` (blogs, para ver más), `kleppmann-ddia` (libro, para ver más, sin capítulo).

### Números y datos inventados para ejemplos
- Caso real: 100 compras/s, timeout de 30 s, 3 reintentos, 400 ms a 20 s: ilustrativo.
- Ejercicios: 400 compras/s, 200 ms de base de backoff: ilustrativos.

## Libros que conviene pedirle al dueño
- Sam Newman, *Building Microservices* (2.ª ed., O'Reilly, 2021): para confirmar y citar con capítulo lo que hoy respaldan Fowler, Richardson y Azure en monolito vs microservicios (descomposición, datos por servicio, resiliencia).
- Martin Kleppmann, *Designing Data-Intensive Applications* (O'Reilly, 2017): capítulos sobre fallas parciales, consistencia y CAP; sería la cita ideal de CAP, que hoy se apoya en Gilbert-Lynch y Brewer.
- Michael T. Nygard, *Release It!* (2.ª ed., 2018): timeouts, circuit breaker, bulkheads y patrones de estabilidad.
- Mark Richards y Neal Ford, *Fundamentals of Software Architecture* (O'Reilly): estilos arquitectónicos y trade-offs, útil para 3653.
- Tanenbaum y van Steen, *Distributed Systems* (distributed-systems.net, versión descargable): no lo consulté para este tema.

## Pedidos al director
- RESUELTO en F6a: los artículos de Fowler, las páginas de microservices.io (Richardson), el paper de Gilbert y Lynch y el artículo de Brewer pasaron al tipo `articulo` (con `edicion`).
- Los sitios `sre.google` (libro SRE) están tipados como `libro` porque tienen capítulo, con URL.
- Los simuladores aún no existen en este worktree ("simulador en construcción"): sus lecturas están tomadas del contrato `SIMULADORES.md`. Verificar contra el real cuando F2 los termine, sobre todo: `cadena` (99,50 % con 5 saltos), `propagar-falla` (con timeouts, tirar antifraude deja pagos degradado y gateway ok), `cola` (2 consumidores a 0,5 s con llegada 5), `balanceador` (servidor lento y caché) y `circuit-breaker`.
- Prerrequisitos: los 4 temas encadenan entre sí (`arquitecturas/monolito-y-microservicios` ← `sincrono-vs-asincrono` ← los otros dos); no hay prerrequisitos a otras áreas.
- Pedido de simulador para v2: un simulador de reintentos con y sin jitter (clientes reintentando contra un servicio saturado) y otro de partición de red para CAP (dos réplicas con un corte). Hoy el tema 4 cubre CAP solo con texto y analogía.
- `minutos` quedó en 15 en los cuatro temas siguiendo la fórmula de la guía de estilo; el tema 4 es el más denso y su sección formal (≈840 palabras) pasa de las 700 sugeridas.
- La URL de Kafka `design` apunta a la versión 4.4 de la documentación (`/44/`), la vigente el 2026-11-11.
