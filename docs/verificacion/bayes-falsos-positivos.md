# Verificación — bayes-falsos-positivos

- **Tema:** `probabilidad-estadistica/bayes-falsos-positivos` (Bayes y los falsos positivos)
- **Fecha:** 2026-11-11
- **Verificador:** F4 (agente distinto del autor)
- **Veredicto:** OBSERVADO (un hallazgo de severidad media sobre la independencia condicional; el resto es menor)
- **Commit revisado:** 9eb3c4b
- **Afirmaciones revisadas:** 39 (16 del cuerpo, 12 tarjetas, 7 ejercicios, 1 caso, 3 problemas)

Método. MIT 18.05 Readings 3 y 12b, y los psets de las clases 11 y 5, descargados y leídos; Mendenhall (página impresa = PDF − 24) y Soong (PDF − 17) leídos con `pdftotext`. Cuentas recalculadas con Python estándar. Soong §2.4: la ecuación 2.28 sale con símbolos degradados en la extracción, pero el enunciado del Teorema 2.2 y las ecuaciones 2.28-2.29 están en la p. 25 y coinciden con la fórmula del texto.

## Afirmaciones revisadas

| # | Afirmación | Fuente | Ubicación | Res. | Nota |
|---|---|---|---|---|---|
| 1 | Bayes: P(B\|A)=P(A\|B)P(B)/P(A), P(A) por probabilidad total | MIT | Reading 3 §7 | ✅ | LaTeX correcto. |
| 2 | Sirve para "dar vuelta" condicionales | Soong | §2.4 Teorema 2.2 p. 25 (ecs. 2.28-2.29) | ✅ | |
| 3 | Bayes con subpoblaciones S_i y ley de probabilidad total | Mendenhall | §4.7 p. 159-160 | ✅ | La fórmula del texto es la del recuadro "Regla de Bayes". |
| 4 | Falso positivo y falso negativo son probabilidades condicionales | Mendenhall | §4.7 p. 160 | ✅ | |
| 5 | Sensibilidad, especificidad = 1−tasa de FP | MIT | Reading 3 §7.1 (ej. 11) | ✅ | La lectura dice true positive/negative rate; los nombres en castellano son los usuales. |
| 6 | VPP=P(D+\|T+) con Bayes | MIT | 3 §7.1 | ✅ | |
| 7 | Caso: 0,5 %, 98 %, 2 % → 0,0049/0,0248 = 19,76 % | cálculo propio | Python | ✅ | 0,19758. |
| 8 | Falacia de la tasa base | MIT | 3 §7.1 | ✅ | La lectura la ilustra con 8,3 %. |
| 9 | Tabla de 10.000: 49/199/248; 1/9751/9752 | cálculo propio | Python | ✅ | 49+1=50; 9950·0,02=199; 9950−199=9751; totales 248 y 9752. |
| 10 | Odds posteriores = factor de Bayes × odds previos | MIT | Reading 12b §4 | ✅ | Fórmula con `underbrace` correcta. |
| 11 | Odds previos ≈0,005; BF=49; odds posteriores ≈0,246 ⇒ 19,8 % | cálculo propio | Python | ✅ | 0,24623 → 0,19758. |
| 12 | Segunda alerta "independiente": VPP 19,8 % → ≈92,3 %; solo se multiplican evidencias independientes | MIT; cálculo propio | 12b §4 y §4.1 | ⚠️ | Cuenta correcta (0,92346); la condición correcta es independencia **condicional** (H1). |
| 13 | Con prevalencia baja, la especificidad pesa más que la sensibilidad | cálculo propio | Python | ✅ | Sensibilidad 98→99,9 %: VPP 20,1 %; FP 2→0,1 %: VPP 83,1 %. Sin cita en el texto (H2). |
| 14 | Analogía del detector de humo y las tostadas | — | analogía propia | ✅ | Mapea la estructura (alarmas por eventos comunes vs. incendios raros). |
| 15 | Intuición: "49 detectados + 199 falsas = 248; menos de 1 de cada 5" | cálculo propio | Python | ✅ | 49/248=19,76 %. |
| 16 | Definición de probabilidad condicional; regla de la multiplicación | MIT | Reading 3 §2-§3 | ✅ | |
| 17 | Tarjeta t-p-a-dado-b-vs-b-dado-a | MIT | 3 §7 | ✅ | |
| 18 | Tarjeta t-bayes-formula | Soong | p. 25 | ✅ | |
| 19 | Tarjeta t-ley-prob-total | Mendenhall | p. 159-160 | ✅ | |
| 20 | Tarjeta t-falso-positivo | Mendenhall | p. 160 | ✅ | |
| 21 | Tarjeta t-sensibilidad (98 % de 200 = 196) | MIT | 3 §7.1 | ✅ | |
| 22 | Tarjeta t-especificidad (2 % de 1000 = 20) | MIT | 3 §7.1 | ✅ | |
| 23 | Tarjeta t-vpp-definicion | MIT | 3 §7.1 | ✅ | |
| 24 | Tarjeta t-falacia-tasa-base | MIT | 3 §7.1 | ✅ | |
| 25 | Tarjeta t-vpp-baja-prevalencia | MIT | 3 §7.1 | ✅ | |
| 26 | Tarjeta t-frecuencias-naturales | MIT | 3 §7.1 (método de tabla) | ✅ | |
| 27 | Tarjeta t-factor-bayes (98/2=49) | MIT | 12b §4 | ✅ | |
| 28 | Tarjeta t-evidencia-independiente | MIT | 12b §4.1 | ⚠️ | Ver H1. |
| 29 | Ejercicio e-vpp-antivirus: 19,8 % (tol. 0,2) | cálculo propio | Python | ✅ | 19,758. Errores 98 y 2 correctos. |
| 30 | Ejercicio e-falsas-alarmas-dia: 199 (tol. 1) | cálculo propio | Python | ✅ | Errores 49 y 248 correctos. |
| 31 | Ejercicio e-vpp-prevalencia-alta: 84,5 % (tol. 0,2) | cálculo propio | Python | ✅ | 980/1160=84,48 %. Error 19,8 correcto. |
| 32 | Ejercicio e-prevalencia-minima: 2,0 % (tol. 0,05) | cálculo propio | Python | ✅ | odds previos 1/49 → p=1/50; VPP(0,02; 0,98; 0,98)=0,5. Error 50 correcto. |
| 33 | Ejercicio e-mejorar-especificidad: 83,1 % (tol. 0,2) | cálculo propio | Python | ✅ | 49/58,95=83,12 %. Error 19,8 correcto. |
| 34 | Ejercicio e-leer-sensibilidad (opción 1) | MIT | 3 §7.1 | ✅ | Distractores: VPP y prevalencia, bien explicados. |
| 35 | Ejercicio e-vf-99-99 (falso; VPP≈9 % con prevalencia 1/1000) | cálculo propio | Python | ✅ | 0,09016. La fórmula en la justificación está bien escrita. |
| 36 | Caso c-alerta-del-edr: VPP casi 20 %; "falsa cuatro veces de cinco"; repetir el mismo escaneo no suma | MIT; cálculo propio | 3 §7.1; 12b §4 | ✅ | 80,2 % falsas. Opciones de la guardia plausibles, con desenlaces `bien`, `regular` y `mal`. |
| 37 | Problema p-soong-2-31 | Soong | cap. 2 prob. 2.31 p. 34 | ✅ | Texto: test 95 % de acierto en ambos sentidos, prevalencia 0,005. |
| 38 | Problema p-mit-screening (Class 11, Problem 1) | MIT | pset class11 | ✅ | Prevalencia 0,005, 2 % FP, 1 % FN; pide árbol, Bayes y tabla. |
| 39 | Problema p-mendenhall-bayes (4.74 y 4.77) | Mendenhall | p. 162 | ✅ | 4.74 aeropuertos (Bayes con 3 subpoblaciones) y 4.77 diagnóstico médico. |

## Otros controles

- **Criterio 7 del SPEC:** este tema no usa la palabra "varianza"; la cubre `variables-y-distribuciones`. ✅
- **Errores clásicos:** el error central del tema (confundir P(T+\|D+) con P(D+\|T+)) está bien tratado en todos los lugares. Ninguna confusión entre sensibilidad, especificidad y VPP. Frecuencias naturales, como pedía el brief.
- **SimBayes:** props válidas (`prevalencia`, `sensibilidad`, `especificidad`, `poblacion`, `contexto="alerta-seguridad"`); la consigna usa especificidad 99,9 % (tope del slider) y prevalencia hasta 10 % (rango 0,1-50 %).
- **Plagio:** sin secuencias de 8 palabras copiadas (solo cadenas bibliográficas).
- **Estilo:** caso real → intuición → formal; voz criolla; cuerpo ≈ 1050 palabras.

## Hallazgos abiertos

**H1 (media)**
- **Archivo y campo:** `bayes-falsos-positivos/tema.mdx` → Formal, `<Profundizar>` ("Si una segunda alerta fuera evidencia independiente de la primera…" y "La palabra clave es independiente"); `bayes-falsos-positivos/practica.yaml` → `tarjetas[id=t-evidencia-independiente]` (frente y dorso); `casos[c-alerta-del-edr]` (consecuencias y lección, "evidencia que sea de verdad independiente").
- **Qué está mal:** la condición para multiplicar factores de Bayes no es que las dos alertas sean independientes (sin condicionar), sino condicionalmente independientes dadas las hipótesis (H y Hᶜ). Dos alertas sobre el mismo archivo nunca son independientes a secas: las dos dependen de que el archivo sea o no malware. Escrito así, un lector cuidadoso puede concluir que la regla nunca se aplica, o que "independientes" significa "dos productos distintos" aunque compartan firmas o heurística, que es justo lo que el texto quiere evitar.
- **Qué dice la fuente:** MIT 18.05 Reading 12b §4.1: se pueden multiplicar los factores de Bayes "if D₁ and D₂ are conditionally independent for H and Hᶜ", es decir P(D₁,D₂\|H)=P(D₁\|H)P(D₂\|H) para cada hipótesis; y aclara que los datos pueden ser condicionalmente independientes sin ser independientes (ejemplo de los dados).
- **Corrección propuesta:** reemplazar "independiente" por "condicionalmente independiente (dado que el archivo sea o no malware: que el segundo motor falle o acierte no dependa de lo que hizo el primero)". Frente de la tarjeta: "…¿Se pueden multiplicar sus factores de Bayes?"; dorso: "No; hace falta que los errores de cada motor sean independientes entre sí dado el estado real del archivo, y con las mismas firmas se equivocan juntos." Lección del caso: "…confirmá con una evidencia cuyos errores no estén correlacionados con los del primer motor". La cuenta (92,3 %) queda igual.

**H2 (menor)**
- **Archivo y campo:** `bayes-falsos-positivos/tema.mdx` → Intuición, párrafo posterior al simulador ("la especificidad … pesa mucho más que la sensibilidad").
- **Qué está mal:** es una afirmación clave (propiedad) sin cita ni número en el cuerpo; FUENTES la respalda con "cálculo propio" pero el texto no lo dice.
- **Qué dice la fuente:** sin fuente; mi recálculo coincide con el del autor: sensibilidad 98→99,9 % deja el VPP en 20,1 %; falsa alarma 2→0,1 % lo lleva a 83,1 %. El ejercicio e-mejorar-especificidad ya contiene la segunda cuenta.
- **Corrección propuesta:** agregar "(con estos números, subir la sensibilidad de 98 a 99,9 % deja el VPP en 20 %; bajar las falsas alarmas de 2 % a 0,1 % lo sube a 83 %: cuenta propia)".
