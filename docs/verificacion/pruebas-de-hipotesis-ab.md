# Verificación — pruebas-de-hipotesis-ab

- **Tema:** `probabilidad-estadistica/pruebas-de-hipotesis-ab` (Pruebas de hipótesis y A/B testing)
- **Fecha:** 2026-11-11
- **Verificador:** F4 (agente distinto del autor)
- **Veredicto (re-verificación sobre ee0ff26):** OBSERVADO (H1, H3, H4 y H5 cerrados; H2 reabierto y dos hallazgos nuevos, H6 y H7)
- **Veredicto de la primera pasada (9eb3c4b):** OBSERVADO (dos hallazgos de severidad media que conviene corregir antes de publicar; el resto es menor)
- **Commit revisado:** 9eb3c4b
- **Afirmaciones revisadas:** 43 (19 del cuerpo, 13 tarjetas, 7 ejercicios, 1 caso, 3 problemas)

Método. Mendenhall (página impresa = PDF − 24) y MIT 18.05 Readings 17b, 20, 22 leídos; NIST e-Handbook §7.2.4.2 y el preprint de Johari et al. (resumen e introducción) descargados. Todas las cuentas y la simulación de peeking recalculadas con Python estándar.

## Lo que el escritor pidió mirar con cuidado

**1. Peeking (28 % con 30 miradas, 14 % con 5).**
- *Reproducción.* Armé mi propia simulación (Python 3.12, `random`, semilla 2026, 40.000 repeticiones): test A/A con 10 % en los dos grupos, hasta 3000 por grupo, bloques de 100 visitas, z de dos proporciones con p̂ conjunta, dos colas, α=0,05, cortando en la primera mirada con p<0,05, miradas equiespaciadas. Resultado: 1 mirada 4,9 %; 2 miradas 8,2 %; 5 miradas 14,0 %; 30 miradas 28,1 %. La tabla del texto dice 4,9 / 8,4 / 13,8 / 28,1: coincide dentro del ruido de simulación (≈±0,3 puntos). ✅
- *Presentación.* El texto sí la declara "resultado propio, 40.000 repeticiones con semilla fija". Falta explicitar el diseño para poder reproducirla (ver H3) y la tarjeta/ejercicio la atribuyen a Johari (ver H3).
- *Respaldo de la idea general.* El resumen del preprint (arXiv:1512.04922, v3 2019-07-16, Johari, Pekelis y Walsh) dice que los p-valores e intervalos habituales "are wholly unreliable if users endogenously choose sample sizes by continuously monitoring their tests". ✅ Además la introducción (p. 3 del PDF) afirma que, "even with 10,000 samples", el error tipo I "can easily increase fivefold", lo que es consistente con 28 % vs 5 %. Se puede citar con `loc` "Introducción".

**2. Fórmula de tamaño de muestra.** La fórmula del Profundizar, n ≈ (z_{α/2}√(2p̄(1−p̄)) + z_β√(p_A q_A + p_B q_B))² / (p_B−p_A)², es la fórmula estándar para comparar dos proporciones (la que se usa en Fleiss, Levin y Paik). NIST e-Handbook §7.2.4.2 trae el caso de una muestra, N ≥ ((z_{1−α/2}√(p₀q₀) + z_{1−β}√(p₁q₁))/δ)², y remite a Fleiss, Levin y Paik pp. 30-34 para la derivación. Recalculé: n=1498,4 con z_β=0,8416 (1496,7 con 0,84) y potencia con 300 por grupo 24,0 %; con 1500 por grupo 80,04 %. La regla práctica de Kohavi (16·p̄q̄/δ²) da 1528. Los números del texto son correctos; lo que no es cierto es que sea "una derivación propia … no una fórmula de un libro" (ver H2).

**3. Soong.** Este tema no cita a Soong.

## Afirmaciones revisadas

| # | Afirmación | Fuente | Ubicación | Res. | Nota |
|---|---|---|---|---|---|
| 1 | Prueba z de dos proporciones con p̂ conjunta en el SE | Mendenhall | §9.6 p. 373-374 | ✅ | LaTeX correcto. |
| 2 | Condiciones: muestras independientes y n·p̂, n·q̂ > 5 en ambos grupos | Mendenhall | §9.6 p. 374 | ✅ | |
| 3 | Caso: p̂=0,095; SE=0,0239; z≈1,25 | cálculo propio | Python | ✅ | z=1,2531; SE=0,02394. |
| 4 | Definición de p-valor y regla p<α | MIT | 17b §7 | ✅ | Definición correcta ("suponiendo la nula, datos al menos tan extremos"). |
| 5 | p≈0,21 (dos colas): "una de cada cinco veces" | cálculo propio | Python | ✅ | 0,2102. |
| 6 | El p-valor no es P(H0\|datos); los métodos frecuentistas no dan probabilidad de hipótesis | MIT | Reading 20 §5 ("Mind your p's") | ✅ | Está bien dicho en cuerpo, tarjeta y ejercicio. |
| 7 | No rechazar ≠ aceptar | Mendenhall; MIT | §9.3 p. 356; MIT 17b §3.1 | ✅ | |
| 8 | Error tipo I (α), II (β), potencia=1−β | MIT; Mendenhall | MIT 17b §4.2-4.3; Mendenhall p. 356 | ✅ | |
| 9 | La potencia sube con más datos y efectos más grandes; n se calcula antes | MIT | 17b §4.3 y §4.4.2 | ⚠️ | Contenido correcto; la ubicación está incompleta (H5). |
| 10 | 8 % vs 11 %, 300 por grupo: potencia ≈24 %; 80 % con ≈1500 | cálculo propio | Python | ✅ | 24,02 % y 80,04 % con n=1500. |
| 11 | Profundizar: fórmula de n y su número 1498 | NIST §7.2.4.2 (análoga) | Python | ⚠️ | Fórmula y cuenta correctas; mal atribuida como "propia" (H2). |
| 12 | Monte Carlo: 23 % con 300 por grupo | cálculo propio | declarado en FUENTES (8.000 réplicas: 0,234) | ✅ | Consistente con 24 % teórico. |
| 13 | Significativo no es importante | Mendenhall | §9.5 p. 370 | ⚠️ | Idea correcta; la redacción "probablemente no ocurrió por casualidad" no (H1). |
| 14 | 20 métricas independientes α=0,05: P(≥1)=1−0,95²⁰≈0,64 | MIT; cálculo propio | 17b §4.3 | ✅ | 0,6415; el texto aclara "independientes". |
| 15 | El p-valor depende de la regla de parada: 0,11 vs 0,03 | MIT | Reading 20 §6 | ✅ | 0,1094 y 0,0313. |
| 16 | Con monitoreo continuo, p-valores e IC habituales no son confiables | Johari et al. | resumen (abstract) | ✅ | Texto del resumen verificado. |
| 17 | Simulación peeking: 4,9 / 8,4 / 13,8 / 28,1 % | cálculo propio | Python | ✅ | Reproducido: 4,9 / 8,2 / 14,0 / 28,1 %. Detalles de diseño faltan (H3). |
| 18 | Ojo: el umbral de 5 % vale con tamaño de muestra fijado de antemano | Johari et al. | resumen | ⚠️ | Correcto, pero el resumen no dice exactamente eso; ver H3. |
| 19 | Analogía del juicio (nula = acusado inocente) | MIT | 17b §4.3 (analogía) | ✅ | La lectura usa el mismo mapeo; redacción propia. |
| 20 | Tarjeta t-hipotesis-nula | MIT | 17b §3.1 | ✅ | |
| 21 | Tarjeta t-pvalor-definicion | MIT | 17b §7 | ✅ | |
| 22 | Tarjeta t-pvalor-no-es | MIT | 20 §5 | ✅ | |
| 23 | Tarjeta t-nivel-significancia (≈50 de 1000) | MIT | 17b §4.3 | ✅ | |
| 24 | Tarjeta t-error-tipo-ii | MIT | 17b §4.2 | ✅ | |
| 25 | Tarjeta t-potencia (24 % ≈ 1 de 4) | MIT | 17b §4.3 | ✅ | |
| 26 | Tarjeta t-potencia-n | Mendenhall | §9.3 p. 356 | ✅ | |
| 27 | Tarjeta t-no-rechazar | Mendenhall | p. 356 | ✅ | |
| 28 | Tarjeta t-significativo-importante | Mendenhall | p. 370 | ❌ | Mismo problema que #13 (H1). |
| 29 | Tarjeta t-condicion-prueba-z | Mendenhall | p. 374 | ✅ | |
| 30 | Tarjeta t-peeking | Johari et al. | resumen | ✅ | No afirma números. |
| 31 | Tarjeta t-metricas-multiples (≈64 %) | MIT; cálculo propio | 17b §4.3 | ✅ | No dice "independientes" en el dorso pero sí en el frente. |
| 32 | Tarjeta t-regla-de-parada | MIT | 20 §6 | ✅ | |
| 33 | Ejercicio e-z-boton-verde: 1,25 (tol. 0,02) | cálculo propio | Python | ✅ | 1,2531. Error 1,77 (SE de un grupo: 1,7721) y 0,03 correctos. |
| 34 | Ejercicio e-pvalor-boton-verde: 21,1 % (tol. 0,5) | cálculo propio | Python | ✅ | Con z=1,25 exacto: 21,13 %; con 1,2531: 21,02 %; dentro de tolerancia. Error 10,6 % (una cola) correcto. |
| 35 | Ejercicio e-z-test-grande: 2,86 (tol. 0,02) | cálculo propio | Python | ✅ | 2,8586; p=0,0043. Error 4,04 (4,0427, SE de un grupo) correcto. |
| 36 | Ejercicio e-metricas-multiples: 64,2 % (tol. 0,5) | cálculo propio | Python | ✅ | 64,15 %. Errores 5 y 100 correctos. |
| 37 | Ejercicio e-interpretar-pvalor (opción 2) | MIT | 17b §7; 20 §5 | ✅ | Distractores bien explicados; la 3.ª dice "eso requeriría un enfoque bayesiano", correcto. |
| 38 | Ejercicio e-peeking-falsos-positivos (opción 2) | Johari; cálculo propio | resumen; simulación | ⚠️ | Respuesta correcta; atribución a Johari de un 28 % que es propio (H3). |
| 39 | Ejercicio e-vf-no-significativo-iguales (falso) | Mendenhall | p. 356 | ✅ | |
| 40 | Caso c-cortar-el-test: z=2,13/p=0,033 (día 3); z=2,41/p=0,016; IC dif. 0,5-4,7 puntos | cálculo propio | Python | ⚠️ | Todas las cifras correctas (2,1328; 0,0329; 2,4059; 0,0161; IC 0,48-4,72). Incoherencia de calendario (H4). |
| 41 | Problema p-mendenhall-9-44 (9.42-9.44) | Mendenhall | p. 376 | ✅ | 9.44: 280 vs 350, 132 y 178 éxitos, "menor que". |
| 42 | Problema p-mit-monedas (Class 17, Problem 1) | MIT | pset class17 | ✅ | Existe: moneda, 10 tiros, significancia. |
| 43 | Problema p-simular-peeking | Johari | arXiv abs | ✅ | URL responde; se puede hacer con una planilla. |

## Otros controles

- **Criterio 7 del SPEC:** este tema no necesita la palabra "varianza"; la cubre `variables-y-distribuciones` (16 apariciones en el cuerpo). ✅
- **p-valor vs P(H0\|datos):** la confusión clásica está evitada en el cuerpo, en la tarjeta, en el ejercicio y en el caso. Ninguna aparición del error, salvo la redacción de H1.
- **Plagio:** sin secuencias de 8 palabras copiadas (solo cadenas bibliográficas).
- **Estilo:** orden caso real → intuición → formal correcto; voz criolla. Cuerpo ≈ 1210 palabras.
- **SimInferencia `ab`:** props (`tasaA`, `tasaB`, `nPorGrupo`, `alfa`) válidas; la consigna coincide con lo que dibuja (potencia, tasa de rechazo ≈ α cuando tasaA=tasaB).

## Hallazgos abiertos

**H1 (media)**
- **Archivo y campo:** `pruebas-de-hipotesis-ab/tema.mdx` → Formal, sección "Significativo no es importante" (primera oración); `pruebas-de-hipotesis-ab/practica.yaml` → `tarjetas[id=t-significativo-importante].dorso`.
- **Qué está mal:** "solo dice que probablemente no ocurrió por casualidad" / "el resultado probablemente no fue casualidad". Es la lectura popular y errónea del p-valor: una probabilidad sobre la causa ("casualidad") dada la evidencia. En un tema que se juega a no confundir P(datos | H0) con P(H0 | datos), esa frase contradice lo que el mismo tema enseña dos secciones antes.
- **Qué dice la fuente:** Mendenhall p. 370: significativo "sólo [quiere decir] que los resultados podrían no haber ocurrido por casualidad" (sin "probablemente" y sin cuantificar); MIT 17b §7: el p-valor es la probabilidad, suponiendo la nula, de datos al menos tan extremos; MIT 20 §4.3: "many … erroneously think a p-value of 0.05 means that the probability of the null hypothesis is 5%".
- **Corrección propuesta:** "Que sea estadísticamente significativo solo dice que, si no hubiera ningún efecto, un resultado tan extremo sería poco común (p menor que α); no dice que el efecto sea grande ni que valga la pena." Dorso de la tarjeta: "No; solo dice que un resultado así sería raro si no hubiera efecto, aunque la diferencia pueda ser chica."

**H2 (media)**
- **Archivo y campo:** `pruebas-de-hipotesis-ab/tema.mdx` → `<Profundizar titulo="¿De dónde salen esas 1500 visitas?">`, primer párrafo ("Es una derivación propia … no una fórmula tomada de un libro"); más `docs/modulos/v1/fuentes/FUENTES-probabilidad-estadistica.md`, pruebas-de-hipotesis-ab #9 y "Lo que no pude verificar".
- **Qué está mal:** la fórmula es correcta pero es la fórmula estándar de potencia para dos proporciones, no propia. Presentarla como "derivación propia" resta confianza donde hay respaldo disponible, y una fórmula clave del tema queda sin cita (la regla de la guía de estilo pide citar números y reglas).
- **Qué dice la fuente:** NIST e-Handbook §7.2.4.2 (https://www.itl.nist.gov/div898/handbook/prc/section2/prc242.htm): N ≥ ((z_{1−α/2}√(p₀(1−p₀)) + z_{1−β}√(p₁(1−p₁)))/δ)², con derivación en Fleiss, Levin y Paik, pp. 30-34. El caso de dos muestras reemplaza el término de la nula por √(2p̄(1−p̄)), que es lo que usa el texto. Mi recálculo da 1498,4.
- **Corrección propuesta:** (a) agregar `nist-handbook` como fuente (`doc-oficial`, `verMas: false`, URL anterior, §7.2.4.2) y citarla en el Profundizar; (b) reescribir: "Es la fórmula usual de tamaño de muestra por potencia; NIST trae la versión de una muestra y para dos proporciones se usa la proporción conjunta bajo la nula. El 1498 es mi cuenta con esta fórmula, verificada con Monte Carlo"; (c) actualizar FUENTES.

**H3 (media-menor)**
- **Archivo y campo:** (a) `pruebas-de-hipotesis-ab/practica.yaml` → `ejercicios[id=e-peeking-falsos-positivos].fuente` y `.opciones[1].explicacion`; `casos[c-cortar-el-test].fuente`; (b) `tema.mdx` → Formal, "Mirar a cada rato" (párrafo de la simulación y tabla) y `<Ojo>` de Intuición.
- **Qué está mal:** (a) el ejercicio cita `johari-peeking` como fuente y la explicación dice "En una simulación con 30 miradas llegó a cerca de 28 %": el 28 % no está en Johari, es de la simulación propia del autor, y la explicación no lo dice. (b) El texto avisa "resultado propio, 40.000 repeticiones con semilla fija" pero no da el diseño (miradas equiespaciadas, z de dos proporciones con p̂ conjunta, α=0,05, dos colas, 3000 por grupo), ni la semilla, y la fila de 2 y 5 miradas no aclara cada cuánto se mira. El Ojo dice que el 5 % "vale para un test con tamaño de muestra decidido de antemano" citando solo el resumen, que dice algo parecido pero no eso.
- **Qué dice la fuente:** Johari, Pekelis y Walsh (arXiv:1512.04922): resumen, "wholly unreliable if users endogenously choose sample sizes by continuously monitoring"; introducción (p. 3 del PDF): "Even with 10,000 samples … Type I error can easily increase fivefold". Ningún número de la tabla es de ahí. Mi reproducción (semilla 2026): 4,9 / 8,2 / 14,0 / 28,1 %, compatible con la tabla.
- **Corrección propuesta:** (a) en la explicación: "En una simulación propia (ver la tabla del tema) con 30 miradas llegó a cerca de 28 %"; dejar `fuente: johari-peeking` solo para la idea general, o citar también mit1805 17b/20 para "el umbral vale con n fijo" (MIT 20 §4.4 punto 3 describe el diseño fijado de antemano); (b) agregar una línea con el diseño ("miradas cada 100/600/1500 visitas…, p̂ conjunta, dos colas") y la semilla (2026); (c) opcional: ampliar `ubicacion` de la fuente a "resumen e introducción".

**H4 (menor)**
- **Archivo y campo:** `pruebas-de-hipotesis-ab/practica.yaml` → `casos[id=c-cortar-el-test].nodos[id=primer-paso].opciones[1].consecuencia` ("A los 12 días llegan 1500 por versión").
- **Qué está mal:** el contexto dice que el tercer día hay 600 por versión (200 por día); a ese ritmo las 1500 llegan en 7,5 días, no a los 12.
- **Qué dice la fuente:** no aplica (coherencia interna del caso).
- **Corrección propuesta:** "A los 8 días llegan 1500 por versión" (o cambiar el contexto a "el tercer día, con 360 por versión", y reajustar p y z).

**H5 (menor)**
- **Archivo y campo:** `pruebas-de-hipotesis-ab/tema.mdx` → Formal, "Errores y potencia", segunda cita (`<Cita f="mit1805" loc="Reading 17b, §4.3" />`); FUENTES pruebas #8.
- **Qué está mal:** la ubicación es incompleta. "Sube con más datos" y "determinar de antemano el número de pruebas" están en §4.4.2 (Conceptual sketches); "más grande cuando la alternativa está más lejos" está en §4.3.
- **Qué dice la fuente:** MIT 17b §4.3 y §4.4.2.
- **Corrección propuesta:** `loc="Reading 17b, §4.3 y §4.4.2"`.

## Re-verificación (diff 9eee9c2..ee0ff26, fecha 2026-11-11)

| Hallazgo | Estado | Comprobación |
|---|---|---|
| H1 | **CERRADO (ee0ff26)** | Formal: "si no hubiera ningún efecto, un resultado tan extremo sería poco común (el p-valor es menor que α)", con cita a MIT 17b §7 (definición del p-valor: probabilidad, suponiendo la nula, de datos al menos tan extremos; se rechaza si p<α). Es la lectura correcta y ya no dice "probablemente no fue casualidad". Dorso de `t-significativo-importante` corregido en el mismo sentido. La nueva tarjeta `t-pvalor-no-es-prob-nula` es correcta en contenido (MIT 20 §5) pero tiene un problema de forma: ver H6. |
| H2 | **REABIERTO** | La atribución quedó bien: "fórmula usual", NIST §7.2.4.2 para una proporción, proporción conjunta para dos grupos (Mendenhall §9.6), y "cuenta mía". La adaptación a dos grupos es correcta (varianza de la diferencia bajo H0 = 2p̄q̄/n; bajo Ha = (p_A q_A + p_B q_B)/n). Pero el número impreso no sale de los datos impresos: ver H7. |
| H3 | **CERRADO (ee0ff26)** | Explicación del ejercicio dice "simulación propia del tema". El texto ahora da el diseño completo (z de dos proporciones con p̂ conjunta, dos colas, α=0,05, miradas equiespaciadas con su espaciado por fila, 3000 por grupo, 40.000 repeticiones, semilla 2026) y cita la introducción de Johari ("fivefold", p. 3 del PDF). **Corrí el script que el autor pegó en FUENTES con `random.seed(2026)`: da 28,1 / 13,8 / 4,9 / 15,4 / 8,4 % (30, 5, 1, 6 y 2 miradas), idéntico a la tabla.** La cita del Ojo a MIT 17b §4.3 y §4.4.2 respalda "decidido de antemano"; aceptable. |
| H4 | **CERRADO (ee0ff26)** | "A los 8 días llegan 1500 por versión": 600 en el día 3 son 200 por día; 1500/200 = 7,5. |
| H5 | **CERRADO (ee0ff26)** | `loc` ahora "Reading 17b, §4.3 y §4.4.2" en el Formal y en el Ojo; FUENTES #8 ajustado. |

### Hallazgos nuevos o reabiertos

**H2 (reabierto, ver H7)** — se cierra cuando se cierre H7.

**H6 (menor, nuevo)**
- **Archivo y campo:** `pruebas-de-hipotesis-ab/practica.yaml` → `tarjetas[id=t-pvalor-no-es-prob-nula]` (frente y dorso).
- **Qué está mal:** (a) el frente "¿Qué NO es el p-valor?" no tiene respuesta única: hay muchas respuestas ciertas (no es el tamaño del efecto, no es la probabilidad de que B sea mejor, no es la probabilidad de la nula…); la guía de estilo §4 pide "pregunta precisa, respuesta única". (b) La idea es la misma de `t-pvalor-no-es` (que ya dice "No; el p-valor es una probabilidad de los datos dada la nula, no una probabilidad de la hipótesis"): dos tarjetas repetidas.
- **Qué dice la fuente:** el contenido es correcto: MIT 20 §5 ("Frequentist methods only give probabilities of statistics conditioned on hypotheses. They do not give probabilities of hypotheses").
- **Corrección propuesta:** borrar la tarjeta nueva (la idea ya está en `t-pvalor-no-es`) o reformularla con respuesta única: frente "Si p = 0,03, ¿qué probabilidad se calculó y bajo qué suposición?", dorso "La de ver datos al menos tan extremos como los observados, suponiendo cierta la nula."

**H7 (menor, nuevo; mantiene abierto H2)**
- **Archivo y campo:** `pruebas-de-hipotesis-ab/tema.mdx` → Formal, `<Profundizar>`, "Con $p_A = 0{,}08$, … $z_{\alpha/2} = 1{,}96$ y $z_\beta = 0{,}84$ da $n \approx 1498$".
- **Qué está mal:** con esos valores redondeados la fórmula da 1496,7 (≈1497), no 1498. El 1498 sale con $z_\beta = 0{,}8416$ (1498,4). El lector que reproduzca la cuenta con lo impreso no llega al número. Además la cita a NIST pegada a "hacen falta unas 1500 visitas por grupo" puede leerse como que NIST da ese número; NIST da el método de una proporción, y el 1500 es cálculo propio (el Profundizar lo aclara, el párrafo anterior no).
- **Qué dice la fuente:** NIST §7.2.4.2 da la forma de una proporción; el recálculo propio con $z_{\alpha/2}=1{,}95996$ y $z_\beta=0{,}84162$ da 1498,39; con 1,96 y 0,84, 1496,70.
- **Corrección propuesta:** escribir $z_\beta = 0{,}8416$ (queda 1498) o "da $n \approx 1497$ (≈1500)"; y en el párrafo previo mover la cita a "unas 1500 visitas por grupo (cuenta propia con la fórmula usual de NIST, ver abajo)".

`npm run build` en verde sobre ee0ff26.

## Hallazgos abiertos (estado final)

H2 (reabierto, depende de H7), H6, H7.
