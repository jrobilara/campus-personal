# GUÍA DE ESTILO — cómo se escribe un tema del campus (v1)

> Para los escritores de F3 y los verificadores de F4. La forma técnica (archivos, campos, componentes) está en `CONTRATO-CONTENIDO.md`; acá está **cómo** se escribe. El lector es el dueño: cursó Ing. en Informática en UNLaM, labura en sistemas y se cansa de la teoría demasiado estructurada. Quiere entender rápido, ver para qué sirve y recordar.

## 1. La voz

- **Criollo rioplatense, con voseo**: "fijate", "mirá", "si tenés", "pensalo así". Tono de un buen compañero de laburo que te explica algo en el pizarrón, no de un manual.
- **Sin lunfardo forzado.** Nada de "chabón", "posta", "re" cada dos frases. Una expresión coloquial de vez en cuando ("se te llena el disco un viernes a la noche") alcanza.
- **Segunda persona** y oraciones cortas. Una idea por oración. Párrafos de 2-5 oraciones.
- **Término técnico en inglés entre paréntesis la primera vez**: "la mediana (*median*)", "el balanceador de carga (*load balancer*)". Después, el término en castellano, o el inglés si es el que se usa en el laburo (`systemd`, *circuit breaker*, *p-value*): elegí uno y sostenelo en todo el tema.
- **Nada de relleno**: ni "es importante destacar que", ni "en el mundo actual", ni "como vimos anteriormente". Ni signos de exclamación en serie, ni emojis.
- **Precisión antes que gracia.** Una analogía que confunde es peor que ninguna. Si una simplificación deja algo afuera, decilo en un `<Ojo>` o en `<Formal>`.

Bueno:
> Si tu API tarda 120 ms casi siempre y de vez en cuando se cuelga 30 segundos, el promedio te va a mentir. La mediana (*median*) no.

Malo:
> Es fundamental comprender que la media aritmética constituye una medida de tendencia central que, en presencia de valores atípicos, puede verse significativamente afectada.

Malo (lunfardo forzado):
> Mirá chabón, el promedio es re trucho posta, la mediana es la que va.

## 2. El orden del tema (fijo) y el largo

El gancho va primero. Lo formal llega cuando el lector ya sabe para qué lo quiere.

| Sección | Qué lleva | Largo objetivo |
|---|---|---|
| `<CasoReal>` | Una situación concreta del laburo (o de la vida cotidiana) donde el tema importa. Con números, horario, sistema, consecuencia. Termina en una pregunta o en una tensión, **sin** resolverla del todo. | 100-250 palabras |
| `<Intuicion>` | La idea sin fórmulas (o con una muy simple), ≥1 `<Analogia>`, ≥1 simulador con una `consigna` que diga qué probar, y lo que el lector tiene que notar al mover los controles. Puede llevar un `<Ojo>`. | 250-500 palabras + simulador(es) |
| `<Formal>` | Definiciones precisas, fórmulas, condiciones de validez, comandos o configuración real. Con citas. Lo largo o demostrativo va en `<Profundizar>`. | 250-700 palabras |
| Práctica | La arma el layout desde `practica.yaml`. | ≥6 tarjetas, ≥3 ejercicios, ≥2 problemas (+ casos de guardia según el área) |
| Fuentes | La arma el layout desde el frontmatter. | ≥2 fuentes principales |

Total del cuerpo: 700-1500 palabras. `minutos` en el frontmatter = tiempo de lectura del cuerpo (≈ 200 palabras por minuto) + 2 minutos por simulador + 1 minuto por ejercicio, redondeado a 5.

### 2.1 El caso real

- Que sea creíble para alguien que labura en sistemas en Argentina: una mesa de ayuda, un tablero de Grafana, un Excel de ventas, un servidor que se llena, un A/B de un e-commerce, una red de oficina.
- Con detalle: "lunes 9:10", "el disco de `/var` está al 93 %", "3 de cada 100 compras".
- Sin nombres de empresas reales ni de personas reales.
- Sin resolverlo del todo: la resolución aparece en la intuición o en lo formal.

Bueno:
> Viernes, 19:40. El servicio de facturación se reinició cuatro veces en diez minutos y ahora `systemctl status` dice `failed`. Nadie tocó nada. ¿Por qué systemd dejó de levantarlo?

Malo:
> En este tema vamos a estudiar los servicios de systemd, que son muy importantes para la administración de servidores Linux.

### 2.2 La intuición

- Primero la idea en una oración. Después la analogía. Después el simulador con su consigna. Después qué mirar.
- La analogía tiene que mapear **la estructura**, no solo el nombre: si decís "la cola es como la fila del banco", que lo que pasa con la fila (llegan más de los que atienden → crece sin parar) sea lo que pasa con la cola.
- La `consigna` del simulador es una acción y una pregunta: "Subí la tasa de llegada por encima de lo que atienden los servidores y mirá qué pasa con el p95". No "Explorá el simulador".

### 2.3 Lo formal

- Definiciones con las palabras del área, citadas.
- Fórmulas con `$…$` en línea, `$$…$$` en bloque o `<Formula>` para las centrales, siempre explicando cada símbolo.
- En Servidores y Soporte, "formal" incluye comandos, archivos de configuración y definiciones de ITIL o de la documentación oficial, en bloques de código con lenguaje.
- Condiciones de validez: cuándo vale y cuándo no ("la aproximación normal sirve si…").

## 3. Fuentes y citas

- **Toda afirmación clave lleva cita.** Afirmación clave = una definición, un número, una propiedad, una regla, un comportamiento de una herramienta. Las frases de transición o las analogías no necesitan cita.
- La marca va pegada al final de la oración que respalda, antes del punto: `…no se mueve<Cita f="ross" loc="§2.3" />.` Si dos oraciones seguidas salen del mismo lugar, alcanza con una cita al final de la segunda.
- `loc` cuando la ubicación es más fina que la de la fuente (sección, página, nombre de la opción).
- **Fuentes válidas como respaldo de un dato**: bibliografía de cátedra y libros clásicos (Stewart, Grossman, Tanenbaum, Ross, etc.), documentación oficial (man pages de Linux, systemd, Docker, Kubernetes, PostgreSQL, Axelos/ITIL 4, NIST, RFC de la IETF), cursos universitarios abiertos (MIT OpenCourseWare, Khan Academy), y artículos o papers de autor (`tipo: articulo`, con `edicion`: revista, volumen y año, o fecha de publicación), p. ej. Brewer, Shannon 1948, los artículos de Fowler.
- **Videos y blogs solo como "para ver más"** (`tipo: video` o `blog`, `verMas: true`). Nunca se citan con `<Cita>`.
- **Libro**: autor, título, edición y año, capítulo o sección. **Doc oficial y curso**: URL estable (la de la versión, si existe) y sección.
- **Prohibido copiar texto de libros o de documentación.** Siempre paráfrasis propia: leé, cerrá la fuente, escribí con tus palabras y después volvé a chequear que dice lo mismo. Cero frases de más de 8 palabras seguidas iguales a la fuente. Una definición normativa corta (por ejemplo, la de "incidente" en ITIL 4) se parafrasea igual; si hace falta la letra exacta, va entre comillas, en inglés, en ≤ 25 palabras y con cita de página o sección.
- Nada de datos inventados que parezcan reales. Si un número es ilustrativo, el texto lo dice ("supongamos 200 tickets por día").

## 4. Tarjetas

Las tarjetas son para recordar, no para estudiar de cero. Una buena tarjeta se responde en 5-15 segundos.

Reglas:
1. **Atómica**: una idea por tarjeta. Si el dorso tiene "y", probablemente son dos tarjetas.
2. **Nada de listas**: prohibido "Listá los 5 …", "Nombrá las 7 capas…". Si la lista importa, una tarjeta por elemento con contexto ("¿En qué capa OSI vive la dirección IP?").
3. **Pregunta precisa, respuesta única**: que no haya dos respuestas correctas distintas.
4. **Dorso corto**: una oración (máx. 2). Lo que hace falta para entender va en la lección, no en la tarjeta.
5. **Mezclá tipos**: definición (≤ 2 por tema), "¿por qué…?", "¿qué pasa si…?", aplicación a un caso ("Tu alerta salta 40 veces por día por picos de 1 minuto: ¿qué parámetro tocás?"), cálculo mental corto.
6. **Sin pistas en el frente** que regalen la respuesta, y sin "verdadero o falso" (eso es un ejercicio).
7. **El id describe la idea**: `t-mediana-robusta`.

Bueno:
- Frente: "¿Por qué un circuit breaker abierto responde rápido aunque el servicio de atrás esté caído?" — Dorso: "Porque rechaza el pedido sin llamar al servicio: no espera ningún timeout."

Malo:
- Frente: "Circuit breaker" — Dorso: "Patrón de resiliencia que tiene tres estados (cerrado, abierto y semiabierto), se usa en microservicios, evita fallas en cascada y fue popularizado por…" (no es pregunta, el dorso es un párrafo, mezcla cuatro ideas).
- Frente: "Listá los estados de una unidad de systemd." (lista).

## 5. Ejercicios

- **Datos realistas**: números que podrías ver en el laburo (latencias en ms, discos en GB, tickets por hora, conversiones de 2-5 %), con unidades. Nada de "sea x = 3,7182 un número".
- **Enunciado autosuficiente**: se entiende sin leer la lección de nuevo, en 2-5 oraciones.
- **Numérico**: tolerancia razonable al redondeo (absoluta del orden de la última cifra que pedís, o relativa del 1-2 %). Decí en el enunciado con cuántos decimales o en qué unidad ("en %", "en horas"). Cargá en `erroresComunes` los 1-3 errores típicos (dividir por n en vez de n−1, olvidarse de convertir minutos a horas, confundir sensibilidad con VPP), cada uno con su explicación.
- **Opción múltiple**: 3-5 opciones plausibles (distractores que alguien que entendió a medias elegiría). Cada opción con explicación. Nada de "todas las anteriores" ni "ninguna".
- **Verdadero/falso**: afirmaciones que valga la pena pensar (un error común dicho como verdad, o una verdad que suena rara). La justificación explica el porqué, no repite la afirmación. Como máximo 1 de cada 3 ejercicios del tema es V/F.
- La `explicacion` del numérico muestra la cuenta, paso a paso, corta.

Bueno:
> El disco de `/var` tiene 500 GB, está al 82 % y crece 6 GB por día. ¿En cuántos días se llena? (respuesta 15, unidad "días", tolerancia absoluta 0.5)

Malo:
> Calcule el tiempo de llenado de un disco. (faltan datos, unidad, contexto)

## 6. Casos de guardia

- Se escriben en segunda persona y presente: "Son las 3:12. Te suena el teléfono."
- El `rol` dice quién sos ("Sos el de guardia de la API de pagos").
- Cada decisión tiene opciones que alguien con experiencia de verdad consideraría, incluida al menos una tentadora y mala (reiniciar todo, culpar al usuario, tocar producción sin backup).
- Cada `consecuencia` es concreta y se ve enseguida ("El p95 baja a 300 ms pero a los 10 minutos vuelve").
- Los desenlaces `regular` existen: arreglar el síntoma sin entender la causa es un clásico.
- La `leccion` es una idea, en 1-3 oraciones, que el lector se lleva a su próxima guardia.
- Mínimo 2 decisiones de profundidad en el mejor camino; máximo 6 nodos de decisión por caso (que se juegue en 3-5 minutos).

## 7. Problemas recomendados

- Para hacer por cuenta propia, fuera de la app. Enunciado que diga qué hacer y qué entregar(te) a vos mismo ("calculá… y compará…").
- Apuntá a problemas concretos de la fuente (`ubicacion`: capítulo + número de problema, o el problem set del curso). Si la fuente no numera problemas, describí la tarea en el enunciado y en `ubicacion` poné la sección que da el material.
- Al menos uno de los dos tiene que poder hacerse con datos o herramientas que el lector tiene a mano (su terminal, una planilla, un `docker run`).

## 8. Errores frecuentes que rompen el build (y cómo evitarlos)

- `<` o `{` sueltos en el texto del MDX: escribí "menor que" o metelo en `$…$` o en `código`.
- Falta la línea en blanco después de `<Intuicion>`, `<Analogia>`, etc.: el markdown de adentro no se procesa.
- LaTeX en YAML entre comillas dobles: usá bloque `|`.
- `tex={"\frac..."}` en `<Formula>`: usá `tex="\frac..."` (barras simples).
- Encabezados `#` o `##` dentro del cuerpo: usá `###`.
- Una fuente principal que no citaste en ningún lado (regla I11): citala o marcala `verMas: true`.
- `<Cita f="...">` a una fuente `verMas`: no se puede.
