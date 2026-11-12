# Verificación F4 — senales-frecuencia-ruido

- **Tema:** `matematica-fisica/senales-frecuencia-ruido` (commit del escritor 3e435d6)
- **Fecha:** 2026-11-11
- **Verificador:** F4 (agente distinto del autor)
- **Veredicto:** OBSERVADO

Criterio: APROBADO = sin hallazgos de severidad media o alta (los menores no bloquean pero quedan anotados). Acá hay uno medio (H1, la generalización del "≈1 bit/s/Hz") y cuatro menores.

## Qué se hizo

- Fuentes abiertas y leídas: Smith *DSP Guide* cap. 3 y cap. 22 (PDF libre de dspguide.com; páginas impresas 40, 42, 48-49, 353 y 358), Shannon 1948 (PDF de Harvard, p. 43 de la reimpresión: §25 y teorema 17), OpenStax Física Universitaria vol. 1 §15.1 y §17.3 y vol. 2 §15.1.
- Build con Node 24 verde, `grep -r katex-error dist/` sin resultados, todos los fragmentos LaTeX pasan KaTeX en modo estricto.
- Cuentas en Python puro: alias, capacidad, comparación de S/N de 0,1 a 1000.
- Plagio: ninguna coincidencia de 5 palabras con Smith ni Shannon traducidos; Smith y Shannon están parafraseados.
- Se contrastó con SIMULADORES §2.1 (modo `senal`): rangos de los sliders y lecturas coinciden con las consignas.

## Las afirmaciones "cuenta propia" de este tema

| Afirmación | Resultado | Nota |
|---|---|---|
| Alias = f_s−f entre f_s/2 y f_s; en general, distancia de f al múltiplo de f_s más cercano | ✅ correcta | Fórmula: alias = |f − round(f/f_s)·f_s|, que da un valor en [0, f_s/2]. Recalculado: (10;12)→2, (5;8)→3, (25;40)→15, (10;40)→10 sin alias. Tiene respaldo en Smith: la fig. 3-4 (p. 42) es la línea en zigzag que muestra que toda frecuencia sobre Nyquist tiene una correspondiente entre 0 y f_s/2. Se puede citar `smith-dsp` "cap. 3, fig. 3-4, p. 42" en vez de decir "cuenta propia". |
| "Doblar S/N suma ≈1 bit/s/Hz" | ✅ numéricamente, ❌ como generalización | Para S/N=100→200: log₂(201)−log₂(101)=0,993 bit/s/Hz (+19,86 Mbit/s en 20 MHz). Pero solo es ≈1 con S/N alto. Recalculado: S/N 0,1 → +0,126; 1 → +0,585; 3 → +0,807; 10 → +0,933; 100 → +0,993; 1000 → +0,999. El texto no dice la condición. Ver H1. |

## Afirmaciones revisadas

| # | Afirmación | Fuente | Ubicación | Resultado | Nota |
|---|---|---|---|---|---|
| 1 | x(t)=A cos(ωt+φ); f=1/T; ω=2πf | openstax-up1 | §15.1, ecs. 15.1 y 15.3 | ✅ | ω=2πf aparece sin numerar (el escritor lo dice). |
| 2 | La red es v=V₀ sin ωt; 60 Hz en EE. UU., 50 Hz en Europa | openstax-up2 | §15.1, ec. 15.1 | ✅ | Las frecuencias están en el texto de introducción de la página, no en la ecuación. No afirma nada sobre Argentina. |
| 3 | Oído humano de ~20 Hz a 20 kHz | smith-dsp | cap. 22, p. 353 | ✅ | "generally considered to be 20 Hz to 20 kHz". |
| 4 | La música necesita ~20 kHz de ancho de banda y la voz natural ~3,2 kHz | smith-dsp | cap. 22, p. 358 | ✅ | |
| 5 | Ancho de banda de una señal = rango de frecuencias que ocupa | smith-dsp | cap. 22, p. 358 | ⚠️ | Smith usa "bandwidth of 20 kHz" como anchura; "rango" es laxo. Ver H5. |
| 6 | Una señal se muestrea bien solo si no tiene frecuencias sobre la mitad de f_s | smith-dsp | cap. 3, p. 40 | ✅ | |
| 7 | f_s>2f_max ⇔ f_max<f_s/2; frecuencia de Nyquist = f_s/2 | smith-dsp | cap. 3, pp. 40 y 42 | ✅ | El libro mezcla "Nyquist frequency/rate" (p. 41-42) y el tema usa solo f_s/2, lo que está bien. |
| 8 | Una frecuencia sobre Nyquist se disfraza de otra menor y se mezcla con la existente | smith-dsp | cap. 3, pp. 40 y 42 | ✅ | "If there happens to be a sinusoid already at this lower frequency, the aliased signal will add to it". |
| 9 | Ejemplo 0,95 f_s → aparece como 0,05 | smith-dsp | cap. 3, p. 40 | ✅ | |
| 10 | Fórmula del alias | cuenta / smith-dsp | fig. 3-4, p. 42 | ✅ | Ver cuadro de arriba. |
| 11 | Filtro pasa-bajos analógico antes del conversor (antialias) | smith-dsp | cap. 3, pp. 48-49 | ✅ | Fig. 3-7 y texto. |
| 12 | Telefonía ≈8 kHz (voz buena, música pobre); alta fidelidad 44,1 kHz | smith-dsp | cap. 22, p. 358 | ✅ | |
| 13 | A 8 kHz solo se guardan frecuencias <4 kHz, los agudos quedan afuera | cuenta | — | ✅ | Aplicación directa de la afirmación 6. |
| 14 | C = W log₂(1+S/N) para ruido blanco térmico y potencia promedio limitada | shannon | §25, teorema 17, p. 43 | ✅ | Shannon: C = W log (P+N)/N con log base 2 en la nota; el tema lo dice. `<Formula>` y símbolos correctos. |
| 15 | Por encima de C hay errores inevitables; por debajo se llega tan cerca como se quiera | shannon | §25, p. 43 | ✅ | "It is not possible to transmit at a higher rate… without a definite positive frequency of errors". |
| 16 | Es un techo teórico, ningún sistema real lo alcanza del todo | — | Formal | ✅ | Prudente. |
| 17 | dB = 10 log₁₀ de un cociente de potencias; S/N=10^(dB/10) | openstax-up1 | §17.3, ec. 17.12 | ⚠️ | La 17.12 define el nivel de intensidad sonora β=10 log₁₀(I/I₀); no habla de potencias en general ni de SNR. Ver H3. |
| 18 | 20 MHz y 20 dB → ≈133 Mbit/s; 10 dB → ≈69 Mbit/s | cuenta / shannon | Profundizar | ✅ | 133,16 y 69,19 Mbit/s. |
| 19 | Con la misma SNR, doblar W duplica C | shannon | — | ⚠️ | Correcto como función de (W, S/N), pero hay que aclarar que con ruido blanco el N crece con W. Ver H2. |
| 20 | Doblar S/N (100→200) suma ≈1 bit/s/Hz, ≈20 Mbit/s | cuenta | Profundizar | ⚠️ | Ver H1. |
| 21 | Tabla comparativa muestreo vs. capacidad | smith-dsp / shannon | Formal | ✅ | Distingue bien las dos fórmulas. |
| 22 | Ojo: Nyquist y Shannon son preguntas distintas | — | Intuición | ✅ | Cumple la advertencia del BRIEF §7.4. |
| 23 | Consigna 1 (bajar f_s de 40 a 12 Hz, alias, cuándo desaparece) | SIMULADORES §2.1 | — | ✅ | A 12 Hz el 10 Hz aparece como 2 Hz; el alias desaparece con f_s≥21 Hz. Slider de f_s: 2-60 Hz. |
| 24 | Consigna 2 (ruido 0,5; filtro; corte hacia 5 Hz) | SIMULADORES §2.1 | — | ✅ | Ruido 0-1; corte 1-30 Hz; con corte 5 desaparece la componente de 10 Hz. |
| 25 | Analogía del acorde de guitarra / espectro | — | Intuición | ✅ | |
| 26 | Analogía de la rueda del carro | — | Intuición | ✅ | Es el efecto estroboscópico correcto (alias temporal). |
| 27 | Caso real: voz clara, música "apagada, metálica" a 8 kHz | smith-dsp | cap. 22, p. 358 | ⚠️ | Ver H4. |
| 28 | t-frecuencia-periodo (50 Hz → 20 ms) | openstax-up1 | §15.1 | ✅ | |
| 29 | t-senoide-parametros | openstax-up1 | §15.1 | ⚠️ | El frente dice "dos datos" y el dorso agrega la fase (H5). |
| 30 | t-ancho-de-banda-senal | smith-dsp | p. 358 | ⚠️ | H5. |
| 31 | t-oido-humano | smith-dsp | p. 353 | ✅ | |
| 32 | t-condicion-nyquist | smith-dsp | p. 40 | ⚠️ | "como mínimo" con desigualdad estricta ("más del doble") es contradictorio (H5). |
| 33 | t-frecuencia-nyquist (8 kHz → 4 kHz) | smith-dsp | p. 42 | ✅ | |
| 34 | t-que-es-alias | smith-dsp | p. 40 | ✅ | |
| 35 | t-antialias | smith-dsp | pp. 48-49 | ✅ | |
| 36 | t-audio-metalico | smith-dsp | p. 40; p. 358 | ⚠️ | H4. |
| 37 | t-capacidad-formula | shannon | §25 | ⚠️ | Pregunta "dos cosas" y el dorso también trae la fórmula; aceptable, ver H5. |
| 38 | t-capacidad-ancho-doble | shannon | §25 | ⚠️ | Correcta con "misma S/N"; ver H2. |
| 39 | t-snr-db (20 dB → 100) | openstax-up1 | ec. 17.12 | ⚠️ | Aritmética correcta (10^2); la fuente es débil (H3). |
| 40 | e-muestras-por-ciclo: 8 | openstax-up1 | §15.1 | ✅ | 400/50=8. Distractores 0,125 y 20 (período en ms) ✔. |
| 41 | e-frecuencia-de-alias: 3 kHz | smith-dsp | cap. 3, pp. 40 y 42 | ✅ | 8−5=3. Distractores 5 y 4 ✔. |
| 42 | e-capacidad-wifi: 133,2 Mbit/s (tolerancia relativa 1 %) | shannon | §25 | ✅ | 133,164. Distractores 87,8 (log₂(21)) y 40,1 (log₁₀) recalculados: 87,85 y 40,09 ✔. |
| 43 | e-om-duplicar-potencia: ≈+15 % (133,2→153,0) | shannon | §25 | ✅ | 153,02 Mbit/s, +14,9 %. Correcta para S/N=100; la explicación "el logaritmo comprime el efecto" es válida solo con S/N alto (H1). |
| 44 | e-vf-nyquist-capacidad: falso | smith-dsp | cap. 3, p. 40 | ✅ | La fuente respalda solo la mitad del muestreo; la mitad de la capacidad es de Shannon (teorema 17). Aceptable. |
| 45 | e-vf-muestrear-mas-no-pierde: verdadero | smith-dsp | cap. 3, p. 40 | ✅ | 10>2·4. |
| 46 | p-smith-muestreo | smith-dsp | cap. 3, pp. 39-42 | ✅ | Alias esperados: 40 Hz → ninguno, 25 Hz → ninguno, 20 Hz → 10 Hz (borde exacto de Nyquist), 12 Hz → 2 Hz. El caso de 20 Hz es instructivo por ser el borde. |
| 47 | p-shannon-calculos | shannon | §25 | ✅ | Tarea práctica. |
| 48 | p-smith-audio-calidad | smith-dsp | cap. 22, pp. 358-359 | ✅ | Tabla 22-2 existe en esas páginas. |
| 49 | Orden caso → intuición → formal, voz criolla | GUIA-ESTILO | — | ✅ | La nota visible "(cuenta propia que coincide…)" en el cuerpo es jerga de proceso (H2 de estilo en el punto de abajo). |

## Hallazgos abiertos

**H1 (media) — "doblar la potencia suma ≈1 bit/s/Hz" y "el logaritmo hace que cada mejora cueste más" valen solo con S/N alto, y el texto no lo dice.**
- Archivos y campos: `src/content/temas/matematica-fisica/senales-frecuencia-ruido/tema.mdx` → `<Formal>` → `<Profundizar>` ("doblar la potencia de señal (S/N de 100 a 200) agrega solo alrededor de 1 bit… el logaritmo hace que cada mejora cueste más"); `practica.yaml` → `e-om-duplicar-potencia` (opción correcta y su `explicacion`: "El logaritmo comprime el efecto… agrega casi 1 bit").
- Qué está mal: con S/N=100→200 es cierto (+0,993 bit/s/Hz), pero el lector puede generalizar. Doblar S/N suma log₂((1+2s)/(1+s)), que tiende a 1 solo cuando s≫1: con s=0,1 suma 0,126; con s=1, 0,585; con s=10, 0,933. Con S/N bajo, C≈W·(S/N)/ln 2 es casi lineal en la potencia y duplicarla casi duplica C: ahí el logaritmo no "comprime" nada.
- Qué dice la fuente: Shannon, teorema 17, p. 43 solo da la fórmula; el comportamiento asintótico es consecuencia matemática (ln(1+x)≈x si x es chico; ln(1+x)≈ln x si x es grande).
- Corrección propuesta: en Profundizar agregar "(esto vale cuando la SNR ya es alta, como en este canal; con SNR baja la capacidad crece casi en proporción a la potencia)", y en la `explicacion` de la opción correcta empezar con "Con S/N alto, el logaritmo comprime el efecto…".

**H2 (menor) — "con la misma SNR, doblar W duplica C" necesita la salvedad del ruido blanco.**
- Archivos y campos: `tema.mdx` → `<Profundizar>`; `practica.yaml` → tarjeta `t-capacidad-ancho-doble` y distractor "Se duplica" de `e-om-duplicar-potencia`.
- Qué está mal: es correcto como función de (W, S/N), pero en un canal real con ruido blanco la potencia de ruido es N=N₀·W, así que al ensanchar el canal con la misma potencia de señal la SNR baja. El lector puede creer que "ensanchar el canal siempre duplica la capacidad".
- Qué dice la fuente: Shannon define N como la potencia del ruido blanco dentro de la banda W (p. 43).
- Corrección propuesta: sumar una oración: "(si el ruido es blanco, un canal más ancho recoge más ruido, así que mantener la misma SNR exige más potencia)". La tarjeta puede quedar igual porque ya dice "con la misma relación señal/ruido".
- Estilo, en el mismo tema: el cuerpo exhibe "(cuenta propia que coincide con el ejemplo del libro…)" en `<Formal>` → "Teorema de muestreo". Es jerga de proceso; reemplazar por la cita a `smith-dsp` fig. 3-4, p. 42.

**H3 (menor) — el decibel está citado a una definición acústica.**
- Archivos y campos: `tema.mdx` → `<Formal>` → "Capacidad de un canal con ruido" (`<Cita f="openstax-up1" loc="§17.3, ec. 17.12" />`); `practica.yaml` → tarjeta `t-snr-db` (`fuente: openstax-up1`).
- Qué está mal: la ec. 17.12 define β=10 log₁₀(I/I₀) para el nivel de intensidad de un sonido (I en W/m², I₀=10⁻¹² W/m²). El tema afirma que esa es "la misma" definición que para un cociente de potencias y la aplica a la SNR; es la convención correcta de comunicaciones (SNR_dB=10 log₁₀(P_señal/P_ruido)), pero esa fuente no la enuncia.
- Qué dice la fuente: ver arriba; la página trata el decibel como razón de intensidades.
- Corrección propuesta: presentar la convención como tal ("en comunicaciones se usa la misma escala: SNR en dB = 10 log₁₀ de S/N") y buscar una cita de redes o comunicaciones que la enuncie (Tanenbaum, Feamster y Wetherall, *Computer Networks*, capítulo de la capa física, es candidato del BRIEF; no lo pude abrir). Mientras tanto, bajar la fuente de la tarjeta a "convención" o dejarla con `openstax-up1` pero reescribiendo el texto para que cite solo lo que la página dice.

**H4 (menor) — "apagada" y "metálica" se usan como sinónimos y no lo son.**
- Archivos y campos: `tema.mdx` → `resumen` ("suena metálico"), `<CasoReal>` ("apagada, 'metálica'"); `practica.yaml` → tarjeta `t-audio-metalico`.
- Qué está mal: con un filtro antialias correcto, grabar a 8 kHz recorta los agudos y la música suena apagada (Smith p. 358: "greatly reduced music quality… weak and unsatisfying"), no metálica. El timbre metálico o inarmónico es lo que produce el alias cuando entra contenido sobre 4 kHz sin filtrar. El tema explica solo la primera causa (agudos fuera) pero la rotula con la segunda.
- Corrección propuesta: en el caso real y en la tarjeta decir "apagada" para la pérdida de agudos y agregar una frase: "si además el equipo no filtra antes de muestrear, los agudos que sobran vuelven como alias y suenan metálicos". Así también se enlaza con la rueda del carro.

**H5 (menor) — tres tarjetas con definiciones o enunciados imprecisos.**
- Archivo: `practica.yaml`. (a) `t-senoide-parametros` → `frente` dice "dos datos" y `dorso` agrega "además de la fase" (la senoide tiene tres parámetros; el `tema.mdx` también dice "dos datos" en `<Intuicion>`, aunque en `<Formal>` sí aparece φ). Proponer "¿Qué tres parámetros describen una senoide?" o "¿Qué dos de ellos son los que se ven en el espectro?". (b) `t-condicion-nyquist` → `frente` dice "como mínimo" y el dorso exige "más del doble" (desigualdad estricta, no hay mínimo): cambiar a "¿Qué condición tiene que cumplir f_s respecto de f_max?". (c) `t-ancho-de-banda-senal` → `dorso` "el rango de frecuencias que ocupa": el ancho de banda es la anchura de ese rango (Smith: música 20 kHz); decir "la anchura del rango de frecuencias que ocupa (por ejemplo, de 0 a 3,2 kHz son 3,2 kHz)". `tema.mdx` → `<Formal>` → "Frecuencias y ancho de banda" tiene la misma definición; además conviene una frase que avise que en redes "ancho de banda" también se usa para la velocidad en bit/s, justo lo que el caso real mezcla.
- Qué dice la fuente: Smith cap. 22, p. 358, usa "bandwidth of 20 kHz" para la música.
