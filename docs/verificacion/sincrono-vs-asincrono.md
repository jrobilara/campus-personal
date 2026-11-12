# Verificación F4 — sincrono-vs-asincrono

- **Tema:** arquitecturas/sincrono-vs-asincrono
- **Fecha:** 2026-11-11
- **Verificador:** F4 (agente distinto del autor)
- **Veredicto:** OBSERVADO (cifras correctas; hay una afirmación sobre Kafka sobredicha, un caso de guardia con números que no cierran y un par de precisiones de ubicación y de simulador)

Método: fuentes abiertas con `curl` sobre el HTML original y convertidas a texto con títulos (no resúmenes). Kafka 4.4: intro, Design y Quickstart leídos completos. Números recalculados con Python. Los simuladores no existen aún: se contrastó con `SIMULADORES.md` §2.8.

## Afirmaciones revisadas

| # | Afirmación | Fuente | Ubicación | Resultado | Nota |
|---|---|---|---|---|---|
| 1 | RPI: cliente espera, ambos vivos todo el tiempo (acoplamiento en ejecución, menor disponibilidad), simple, sin broker | richardson-rpi | "Forces" y "Resulting context" | ✅ | Coincide ("tight runtime coupling"; "Reduced availability"; "no intermediate broker"). Sin `loc` en el tema: correcto. |
| 2 | Cadenas síncronas multiplican la caída | fowler-microservices | "Synchronous calls considered harmful" | ✅ | Título exacto. |
| 3 | Mensajería: el broker desacopla; retiene mensajes; costo: broker altamente disponible y pedido-respuesta más complejo | richardson-mensajeria | "Resulting context" | ✅ | Coincide. |
| 4 | Queue-based load leveling: cola entre tarea y servicio, servicio toma a su ritmo, emisores no se demoran, dimensionar para la media | azure-colas | "Solution" | ✅ | Coincide. |
| 5 | Si la tasa media de llegada supera la de consumo, la cola crece y sube la latencia; monitorear profundidad, escalar con límite o descartar en el productor | azure-colas | "Problems and considerations" | ✅ | Coincide casi punto por punto. |
| 6 | μ = c/t; T = Q/(λ−μ); 50 s con los números del simulador | cálculo | — | ✅ | Python: μ = 4; 50/(5−4) = 50. Aclara que es aritmética de balance. |
| 7 | Kafka: eventos con clave/valor/marca de tiempo, tópicos multiproductor/multisuscriptor, el evento no se borra al leerlo, retención, particiones, misma clave misma partición | kafka-intro | "Main Concepts and Terminology" | ✅ | Título exacto. |
| 8 | Kafka: el orden solo está garantizado dentro de una partición | kafka-intro | "Main Concepts and Terminology" | ✅ | La fuente garantiza el orden por partición; el "solo" es inferencia razonable. |
| 9 | Una partición la consume un solo consumidor por grupo; offset; se puede retroceder; consumidores hacen pull | kafka-diseno | "Consumer Position", "Push vs. pull" | ⚠️ | Verdadero para consumer groups; el Design 4.4 documenta también share groups. Ver H3. Títulos existen ("Push vs. pull" con p minúscula). |
| 10 | RabbitMQ: con ack manual, entregas sin confirmar vuelven a la cola si se cierra canal/conexión; el reentregado viene marcado | rabbitmq-confirmaciones | "Consumer Acknowledgements" | ⚠️ | Contenido correcto; la sección real es "When Consumers Fail or Lose Connection: Automatic Requeueing". Ver H2. |
| 11 | La mayoría de los brokers entrega al menos una vez; exactly-once de punta a punta es impracticable | azure-idempotente | "Context and problem" | ✅ | Coincide; la fuente cita Kafka y RabbitMQ. |
| 12 | "Kafka lo reconoce: al-menos-una-vez por defecto, y recomienda procesamiento idempotente" | kafka-diseno | "Message Delivery Semantics" | ❌ | At-least-once por defecto ✅; "recomienda idempotencia" no está dicho. Ver H1. |
| 13 | Consumidor idempotente: procesar dos veces = una | azure-idempotente | "Solution" | ✅ | Coincide. |
| 14 | Operaciones naturalmente idempotentes (upsert, valor absoluto) o clave de deduplicación estable atómica | azure-idempotente | "Problems and considerations" | ✅ | Coincide. |
| 15 | SQL de inbox con restricción de unicidad en la misma transacción; la base arbitra duplicados concurrentes | azure-idempotente | "Guard against concurrent duplicates", "Commit the processed key and the side effects atomically" | ✅ | Patrón idéntico al de la fuente; SQL estándar de PostgreSQL (no lo ejecuté: no hay `psql`). |
| 16 | Dead-letter queue monitoreada; orden no se conserva con consumidores paralelos; cola de una sola vía | azure-colas | "Problems and considerations" | ✅ | Coincide. |
| 17 | No conviene cola si se necesita respuesta síncrona de baja latencia | azure-colas | "When to use this pattern" | ✅ | Coincide. |
| 18 | Lecturas de simuladores (B lento/caído; 2 consumidores a 0,5 s = 4/s; con 3 se vacía; consumidor caído no pierde) | SIMULADORES.md §2.8 | contrato | ⚠️ | Coinciden con el contrato, pero con `capacidadCola={50}` y λ = 5 el "no se pierden" falla tras 10 s. Ver H4. |
| 19 | e-tiempo-llenar-cola: 50 s, tolerancia 1 | cálculo | — | ✅ | Python: 50. Errores comunes (10 = 50/5; 12,5 = 50/4) correctos. |
| 20 | e-consumidores-necesarios: 12 | cálculo | — | ✅ | 30 × 0,4 = 12; error 75 = 30 × 2,5 correcto; la explicación advierte que 12 no deja margen. |
| 21 | e-evitar-doble-cobro (opción correcta: clave única en la misma transacción) | azure-idempotente | idem #15 | ✅ | Distractores plausibles y bien explicados. |
| 22 | e-vf-kafka-borra (falso) | kafka-intro | idem #7 | ✅ | Correcto. |
| 23 | Tarjetas (11): atomicidad y claridad | varias | — | ⚠️ | t-cuando-no-cola tiene dos respuestas ("o"). Ver H5. El resto es atómico; t-tasa-consumo-calculo ✅ (4/s). |
| 24 | Caso c-cola-mails-crece: decisión buena (diagnosticar tasas, dead-letter para el mensaje venenoso, escalar con límite, vigilar profundidad) | azure-colas | "Problems and considerations" | ⚠️ | La práctica es la de la fuente; las opciones malas (purgar, escalar a ciegas) son tentadoras. Pero los números no sostienen "drena en pocos minutos". Ver H6. |
| 25 | p-kafka-quickstart: pasos 1–5, `--from-beginning` | kafka-quickstart | Steps 1–5 | ⚠️ | Pasos y flag correctos (comandos `kafka-topics.sh --create --topic … --bootstrap-server localhost:9092`, `kafka-console-producer.sh`, `kafka-console-consumer.sh --from-beginning`). Ambigüedad Docker/scripts: ver H7. |
| 26 | p-cola-python: simulación con queue.Queue | azure-colas | "Problems and considerations" | ✅ | El enunciado es consistente con el cálculo del tema. |
| 27 | Plagio | todas | — | ✅ | Solo coinciden títulos (secuencias de 6 palabras). Paráfrasis en castellano, aunque cercana a la fuente en #4 y #5; no hay frases literales. |
| 28 | Estilo | GUIA-ESTILO | — | ✅ | CasoReal 122, Intuición 287, Formal 673 palabras; orden y voz correctos. |

## Hallazgos abiertos

**H1** — `src/content/temas/arquitecturas/sincrono-vs-asincrono/tema.mdx`, Formal, "Duplicados e idempotencia": "Kafka lo reconoce: al-menos-una-vez es su modo por defecto, y recomienda procesamiento idempotente<Cita f="kafka-diseno" loc="Message Delivery Semantics" />". Qué está mal: (a) Kafka no "recomienda" idempotencia en esa sección; solo observa que con clave primaria las actualizaciones suelen ser idempotentes. (b) Se omite que Kafka sí ofrece exactly-once dentro de Kafka (productor idempotente y transacciones, Kafka Streams) y que hacia sistemas externos requiere cooperación de ellos: sin esa aclaración el lector puede entender que Kafka no tiene exactly-once. Qué dice la fuente: "Kafka guarantees at-least-once delivery by default"; exactly-once al leer-procesar-escribir en tópicos de Kafka con transacciones; "para otros sistemas de destino generalmente requiere cooperación con esos sistemas". Corrección: "Kafka documenta que al-menos-una-vez es su garantía por defecto; ofrece exactly-once al leer, procesar y escribir entre tópicos con transacciones, pero hacia sistemas externos hace falta la cooperación de esos sistemas, así que el consumidor idempotente sigue siendo la defensa". Para respaldar "recomienda idempotencia" usar RabbitMQ: "consumers must be prepared to handle redeliveries and otherwise be implemented with idempotence in mind" (rabbitmq-confirmaciones, sección de H2).

Respuesta del autor: corregido: se reescribió con lo que dice Kafka (at-least-once por defecto, exactly-once entre tópicos, cooperación externa) y la idempotencia se respalda con RabbitMQ.

**H2** — mismo archivo, Formal, `<Cita f="rabbitmq-confirmaciones" loc="Consumer Acknowledgements" />`, y `fuentes[].ubicacion` de `rabbitmq-confirmaciones`. Qué está mal: el contenido citado está en otra sección. Qué dice la fuente: el título de la página es "Consumer Acknowledgements and Publisher Confirms"; la requeue automática y la propiedad `redeliver` están en "When Consumers Fail or Lose Connection: Automatic Requeueing". Corrección: `loc="When Consumers Fail or Lose Connection: Automatic Requeueing"` y mismo ajuste en `ubicacion`.

Respuesta del autor: corregido: `loc` y `ubicacion` apuntan a "When Consumers Fail or Lose Connection: Automatic Requeueing".

**H3** — mismo archivo, Formal, "Broker y log de eventos": "Cada partición la consume un solo consumidor por grupo". Qué está mal: es válido para grupos de consumidores clásicos, pero Kafka 4.4 documenta en el mismo Design la sección "The Share Consumer" (share groups), donde varios consumidores comparten los registros. Corrección: decir "por grupo de consumidores (*consumer group*)" y, si se quiere, una línea de que existen los share groups.

Respuesta del autor: corregido: se acotó a grupos de consumidores clásicos.

**H4** — mismo archivo, Intuición, segundo `<SimFlujo modo="cola">` y el párrafo siguiente ("Cuando el consumidor cae, los mensajes se acumulan y se drenan al volver"; consigna "comprobá si se pierden mensajes"). Qué está mal: con `tasaLlegada={5}` y `capacidadCola={50}` la cola se llena en 10 s con el consumidor caído; el contrato de `SIMULADORES.md` §2.8 dice que `perdidos` cuenta cuando se llena la cola. Con una caída de más de 10 s sí se pierden mensajes, contra lo que afirma el texto. Qué dice la fuente: Azure advierte que el patrón depende de la durabilidad y de los límites de tamaño de la cola ("Problems and considerations"). Corrección: subir `capacidadCola` (p. ej. 500) o agregar "mientras la cola no se llene; si se llena, se pierde o se rechaza".

Respuesta del autor: corregido: se precisa que con 5 msg/s y capacidad 50 un corte total llena la cola en 10 s y desde ahí se pierden mensajes; el texto y la consigna lo reflejan.

**H5** — `sincrono-vs-asincrono/practica.yaml`, tarjeta `t-cuando-no-cola`: el dorso da dos respuestas ("respuesta síncrona de baja latencia, o carga baja y estable"). Viola GUIA-ESTILO §4 reglas 1 y 3. Corrección: dividir en dos tarjetas (la fuente "When to use this pattern" lista ambas).

Respuesta del autor: corregido: dividida en `t-cuando-no-cola` y `t-cuando-no-cola-carga-estable`.

**H6** — `sincrono-vs-asincrono/practica.yaml`, caso `c-cola-mails-crece`, desenlace `final-bien` y la `consecuencia` de la opción que repone y escala consumidores. Qué está mal: con entradas de 30 msg/s y 2 consumidores sanos que sacan 8 msg/s (4 msg/s cada uno), 4 consumidores sacan 16 msg/s y la cola seguiría creciendo; "empieza a bajar" y "se drena en pocos minutos" solo valen si se escala bastante (con 12 consumidores: 48 − 30 = 18 msg/s netos, 18.000 / 18 ≈ 1.000 s ≈ 17 min). Corrección: poner cifras coherentes ("con 12 consumidores sanos la cola baja unos 18 mensajes por segundo y se vacía en unos 17 minutos") o cambiar "en pocos minutos" por "de a poco".

Respuesta del autor: corregido: cada consumidor procesa 4 msg/s; con 12 sanos salen 48/s contra 30, la cola baja 18/s y se vacía en unos 17 minutos (cuenta con Python).

**H7** — `sincrono-vs-asincrono/practica.yaml`, problema `p-kafka-quickstart`. Qué está mal: pide "levantá un broker con Docker" y luego usar el productor y consumidor de consola, pero los comandos del Quickstart (`bin/kafka-topics.sh`, etc.) son relativos a la distribución descargada del Paso 1 y la página no explica cómo correrlos contra el contenedor. Qué dice la fuente: Step 1 descarga el tar, Step 2 ofrece scripts locales o Docker; Steps 3 a 5 usan `bin/*.sh`. Corrección: aclarar "descargá el tar del Paso 1 para tener los scripts y usá Docker solo para el broker", o indicar cómo ejecutarlos dentro del contenedor (no verifiqué la ruta de los scripts dentro de la imagen).

Respuesta del autor: corregido: el enunciado pide descargar la distribución del Paso 1 para tener los scripts y deja el broker a elección.

**H8** — `sincrono-vs-asincrono/tema.mdx`, frontmatter: `richardson-rpi` y `richardson-mensajeria` tipados `doc-oficial`; microservices.io es un sitio de autor. Misma observación de política que H6 del tema monolito-y-microservicios: decisión del director (ampliar el esquema con "artículo" o pasar a `verMas`).


Respuesta del autor: decisión del director, se retipa a `articulo` tras el merge.