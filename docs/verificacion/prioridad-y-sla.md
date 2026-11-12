# Verificación F4: Prioridad por impacto × urgencia y SLA

- **Tema:** `soporte/prioridad-y-sla`
- **Fecha:** 2026-11-11
- **Verificador:** F4 (agente distinto del autor)
- **Veredicto:** OBSERVADO

**Método.** Abrí el artículo de la matriz y la guía de severidades de PagerDuty, las páginas de Atlassian (incidentes, SLO/SLA/SLI), los capítulos 4 y el Apéndice A del libro de SRE, el PDF del temario DevOps de PeopleCert (glosario p. 16), el artículo de PeopleCert 2023 y el glosario ITIL 4 Foundation de PeopleCert. Recalculé todas las respuestas numéricas con Python sin mirar las del autor. Contrasté la matriz y los SLA con `SIMULADORES.md` §2.12. No hay frases copiadas (fuentes en inglés, paráfrasis propia).

## Afirmaciones revisadas

| # | Afirmación | Fuente | Ubicación | Resultado | Nota |
|---|---|---|---|---|---|
| 1 | Una matriz de prioridad rankea los incidentes por impacto y urgencia; la combinación dice cuáles atender primero (tarjeta `t-prioridad-dos-factores`, "matriz ITIL") | pagerduty-matriz | "What is the incident priority matrix?" | ⚠️ | Dicho por PagerDuty ("An ITIL incident priority matrix ranks incidents by two factors"). La tarjeta lo presenta como ITIL con respaldo solo de un proveedor. Ver H1. |
| 2 | Impacto y urgencia pesan igual | pagerduty-matriz | "Assigning incident impact" | ✅ | "Impact and urgency carry equal weight". |
| 3 | La gestión se enfoca en el impacto, no en el orden de llegada (tarjeta `t-orden-de-llegada`) | pagerduty-matriz | "Incident urgency and impact" | ✅ | Textual. |
| 4 | Impacto: efecto en el negocio, personas afectadas, SLA aplicables, implicaciones financieras, de seguridad y de cumplimiento (tarjeta `t-impacto-que-mide`) | atlassian-incidentes | paso "Prioritize" | ✅ | |
| 5 | Urgencia: criticidad, sensibilidad al tiempo, propagación y visibilidad ante la dirección (tarjeta `t-urgencia-que-mide`) | pagerduty-matriz | tabla de "Incident urgency and impact" | ✅ | Las cuatro filas de la tabla; "C-suite" se traduce como dirección. |
| 6 | Tabla 3 × 3 con P1 a P5 | SIMULADORES.md §2.12 | definición de la matriz | ⚠️ | Las 9 celdas coinciden con el simulador. Pero la página de PagerDuty no contiene esa tabla. Ver H1. |
| 7 | "Los propios materiales que la presentan son recomendaciones de alto nivel que cada organización adapta" (Ojo; tarjeta `t-matriz-no-universal`) | pagerduty-matriz | nota inicial de la página | ⚠️ | La nota existe ("These are high-level recommendations. Customize them"). El `loc` "Introducción" es la nota inicial. La respuesta "No hay matriz oficial" es inferencia, no dicho por la fuente. Ver H1. |
| 8 | Que P1-P5 y sus plazos son un ejemplo y no norma ITIL | tema.mdx; SIMULADORES.md | Intuición ("ejemplo, no una norma"); Formal Ojo | ⚠️ | Dice "ejemplo" y "no una norma", y los valores de SLA "ilustrativos". Nunca dice que la tabla no es de ITIL ni que PagerDuty no la trae. Ver H1. |
| 9 | Niveles SEV: número menor = más urgente; ante la duda, asumir el más alto y discutir después; es regla de una empresa | pagerduty-severidad | intro y "Always Assume The Worst" | ✅ | "treat it as the higher one... review during a postmortem". |
| 10 | SLA para ITIL = acuerdo escrito entre proveedor de TI y negocio con objetivos y responsabilidades clave (tarjeta `t-sla-itil`: "según el glosario de ITIL 4") | peoplecert-glosario | §8, p. 16 | ⚠️ | Coincide con el temario DevOps de PeopleCert (verificado, p. 16). El glosario ITIL 4 Foundation dice "acuerdo documentado entre un proveedor de servicio y un cliente que identifica los servicios requeridos y el nivel esperado". Ver H2. |
| 11 | SLI = medida cuantitativa de un aspecto del servicio (latencia, tasa de error, disponibilidad) | google-sre-slo | cap. 4, "Indicators" | ✅ | |
| 12 | SLO = valor objetivo para un SLI | google-sre-slo | "Objectives" | ✅ | "target value or range of values". |
| 13 | SLA = contrato con consecuencias; "sin consecuencia explícita, es un SLO" (tarjeta `t-slo-vs-sla`) | google-sre-slo | "Agreements" | ⚠️ | La fuente dice "almost certainly an SLO". Ver H5. |
| 14 | Un SLA puede fijar además tiempos de respuesta al usuario | atlassian-slo | "Service level agreement (SLA)" | ✅ | "uptime, response time, and specific responsibilities". |
| 15 | Los valores de SLA del simulador (P1: 15 y 240 min) son ilustrativos | SIMULADORES.md §2.12 | `slas` por defecto | ✅ | P1 15/240. El simulador lleva la nota "Matriz de ejemplo". |
| 16 | ITIL 4 recomienda mirar el incidente desde quien usa el servicio y no esconderse detrás del SLA (tarjeta `t-sla-no-es-satisfaccion`; ejercicio V/F) | peoplecert-practicas-2023 | "Chapter 8" | ✅ | Textual: "not hiding behind SLAs for user-reported incidents". |
| 17 | Disponibilidad se calcula con el tiempo caído sobre un período; fórmula A = (T_total − T_caído)/T_total × 100 % | google-sre-disponibilidad | Apéndice A, primer párrafo | ✅ | La fórmula es la forma explícita de esa definición. La fuente aclara "assuming no planned downtime"; el tema no lo menciona (nota menor). |
| 18 | Tabla mensual: 99 % = 7,2 h; 99,5 % = 3,6 h; 99,9 % = 43,2 min; 99,95 % = 21,6 min; 99,99 % = 4,32 min | google-sre-disponibilidad | Table 1-1, columna "per month" | ✅ | Coincide con la tabla y con Python sobre 43 200 min (432,0 min = 7,2 h; 216,0 min = 3,6 h; 43,2; 21,6; 4,32). |
| 19 | Dos caídas de 25 y 70 min rompen un 99,9 % mensual | cálculo | Python | ✅ | 95 min > 43,2. |
| 20 | La disponibilidad no mide cuánto tardó la mesa de ayuda en contestar | razonamiento | n/a | ✅ | Coherente con SLI de disponibilidad. |
| 21 | Intuición: por orden de llegada, facturación se pasa del plazo; por prioridad se cumplen todos | SIMULADORES.md §2.12 | "Qué tiene que verse" | ✅ | `incumplidos` ≥ 1 y `incumplidos` = 0. |
| 22 | Si llegan más tickets de los que se cierran, la cola crece y se rompen los SLA | SIMULADORES.md §2.8; razonamiento | modo `cola` | ✅ | |
| 23 | Ejercicio `e-espera-facturacion-fifo`: 35 min; errores 50, 95, 20 | cálculo | Python | ✅ | 20 + 30 = 50; 50 − 15 = 35. 95 = 50 + 45 y 20 son errores bien explicados. La `fuente` pagerduty-matriz no respalda la cuenta (menor). |
| 24 | Ejercicio `e-disponibilidad-del-mes`: 99,78 %; error común 0,22 | cálculo | Python | ✅ | (43 200 − 95)/43 200 = 99,7801 %; 95/43 200 = 0,2199 %. |
| 25 | Ejercicio `e-minutos-permitidos-99-95`: 21,6 min; errores 43,2 y 4,32 | cálculo | Python | ✅ | 43 200 × 0,0005 = 21,6. |
| 26 | Ejercicio `e-quien-va-primero` | pagerduty-matriz | | ✅ | Una sola correcta; distractores plausibles. |
| 27 | Ejercicio V/F `e-vf-sla-cumplido-satisfecho`: falso | peoplecert-practicas-2023 | | ✅ | "Un SLA es un piso acordado" es opinión del autor, sin dato falso. |
| 28 | Caso `c-lunes-gerente-enojado`: clasificar por impacto y urgencia, facturación primero, avisar al gerente con hora estimada y alternativa | pagerduty-matriz | | ⚠️ | Decisión buena según fuentes; no inventa técnicas ni asume trato VIP. Defecto de coherencia en la primera opción. Ver H4. |
| 29 | Tarjetas (12): atómicas, una respuesta | GUIA-ESTILO §4 | | ⚠️ | `t-impacto-que-mide` y `t-urgencia-que-mide` tienen dorsos enumerativos (4-5 criterios); `t-p1-matriz-ejemplo` no lleva `fuente`. Menor, sin hallazgo. Definiciones: 2, dentro del tope. |
| 30 | Clasificación de pagerduty-matriz como `doc-oficial` | criterio del director | frontmatter | ⚠️ | Es un artículo de `www.pagerduty.com/resources/learn` con llamado a prueba gratuita, no de `response.pagerduty.com`. Ver H3. |
| 31 | Orden caso real → intuición → formal, voseo, largo | GUIA-ESTILO §1-2 | | ✅ | ≈ 1190 palabras sin código. |

**Afirmaciones revisadas: 31.**

## Hallazgos abiertos

**H1: la tabla P1-P5 queda pegada a citas de PagerDuty y el texto no dice que no es de ITIL ni de PagerDuty.**
- Archivos y campos: `tema.mdx`, Formal §Prioridad = impacto y urgencia (tabla 3 × 3 y `<Ojo>` siguiente); `practica.yaml`, `tarjetas[0]` (`t-prioridad-dos-factores`, `frente`: "en una matriz ITIL").
- Qué está mal: (a) el `<Ojo>` dice "los propios materiales que la presentan son recomendaciones de alto nivel", como si PagerDuty presentara esta tabla. La página de PagerDuty no trae ninguna matriz 3 × 3 ni niveles P1-P5 con plazos. (b) Ninguna frase dice que la tabla y los plazos no vienen de ITIL: solo "de ejemplo" y "no una norma". (c) La tarjeta atribuye a "una matriz ITIL" el dato, con respaldo solo de PagerDuty (que es quien dice "ITIL incident priority matrix"). Por el criterio del director, una atribución a ITIL respaldada solo por un proveedor es hallazgo.
- Qué dice la fuente: PagerDuty: "These are high-level recommendations. Customize them..." y "Impact and urgency carry equal weight"; no incluye tabla. La tabla sale de `SIMULADORES.md` §2.12.
- Corrección propuesta: agregar tras la tabla "Esta tabla, los niveles P1-P5 y los plazos de ejemplo son una construcción del simulador: ni ITIL ni PagerDuty fijan una matriz única; cada organización define la suya". En la tarjeta, quitar "ITIL" del frente ("en una matriz de impacto y urgencia") o respaldar la atribución con glosario o práctica de PeopleCert/AXELOS. Reformular el `<Ojo>` para que la cita de PagerDuty respalde solo la frase de que son recomendaciones de alto nivel.

**H2: la tarjeta de SLA dice "según el glosario de ITIL 4" con la redacción del temario DevOps.**
- Archivos y campos: `tema.mdx`, Formal §SLA, SLO y SLI (primer párrafo, "Para ITIL, un acuerdo de nivel de servicio…"); `practica.yaml`, `tarjetas[7]` (`t-sla-itil`, `frente` y `dorso`).
- Qué está mal: la definición "entre el proveedor de TI y el negocio… objetivos y responsabilidades clave" es la del temario DevOps de PeopleCert (p. 16), que no es el glosario de ITIL 4 Foundation.
- Qué dice la fuente: el glosario ITIL 4 Foundation de PeopleCert (Official Training Materials) y el de AXELOS de 2019: "a documented agreement between a service provider and a customer that identifies both services required and the expected level of service".
- Corrección propuesta: usar la definición del glosario ITIL 4 Foundation y citarlo, o cambiar el frente a "según el temario de PeopleCert (que reproduce ITIL 4)".

**H3: clasificación de `pagerduty-matriz` como `doc-oficial`.**
- Archivo y campo: `tema.mdx`, frontmatter `fuentes[0]` (`pagerduty-matriz`, `tipo: doc-oficial`). Se usa en 5 tarjetas, 2 ejercicios, el caso y un problema.
- Qué está mal: el criterio del director acepta como `doc-oficial` la guía de incident response de PagerDuty (`response.pagerduty.com`). Este artículo está en la sección comercial `www.pagerduty.com/resources/learn` y termina con "Start a free PagerDuty trial". `pagerduty-severidad` sí cumple el criterio.
- Qué dice la fuente: ver arriba; el contenido es consistente con lo que el tema afirma (filas 2, 3, 5, 7).
- Corrección propuesta: decisión del director. O se acepta como práctica del proveedor (y el texto lo presenta así, con la corrección de H1), o se pasa a `tipo: blog` con `verMas: true` y los datos "pesan igual" y "enfoque en impacto" se re-respaldan con `response.pagerduty.com` o PeopleCert.

**H4: opción del caso del gerente incoherente con su consecuencia.**
- Archivo y campo: `practica.yaml`, `casos[0]` (`c-lunes-gerente-enojado`), nodo `primer-paso`, `opciones[0]`.
- Qué está mal: el texto dice "Atiendo por orden de llegada; el gerente, que llamó dos veces, va primero", pero la consecuencia dice "Arrancás por la impresora y seguís con el alta". Son dos criterios distintos (llegada vs. insistencia) en una misma opción, y el desenlace `final-orden-llegada` dice "El gerente queda contento".
- Corrección propuesta: partir en dos opciones o elegir una. Por ejemplo "Atiendo por orden de llegada" con consecuencia actual y desenlace sin el gerente contento, y la insistencia cubierta ya por la decisión posterior.

**H5: la regla "sin consecuencia explícita es un SLO" omite el matiz de la fuente.**
- Archivos y campos: `tema.mdx`, Formal (viñeta SLA); `practica.yaml`, `tarjetas[9]` (`t-slo-vs-sla`, `dorso`).
- Qué está mal: se afirma como categórica.
- Qué dice la fuente: SRE cap. 4: "if there is no explicit consequence, then you are almost certainly looking at an SLO".
- Corrección propuesta: "casi seguro es un SLO".
