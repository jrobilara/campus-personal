# Verificación — tcl-e-intervalos

- **Tema:** `probabilidad-estadistica/tcl-e-intervalos` (Teorema central del límite e intervalos de confianza)
- **Fecha:** 2026-11-11
- **Verificador:** F4 (agente distinto del autor)
- **Veredicto:** APROBADO (tres hallazgos menores, no bloquean)
- **Commit revisado:** 9eb3c4b
- **Afirmaciones revisadas:** 46 (23 del cuerpo, 12 tarjetas, 7 ejercicios, 1 caso, 3 problemas)

Método. Mendenhall (página impresa = PDF − 24) y Soong (PDF − 17) leídos con `pdftotext`; MIT 18.05 Readings 6b, 22, 23a y 23b descargados. Cuentas recalculadas con Python. La interpretación del intervalo (lo más delicado del tema) está bien dicha en todos los lugares revisados.

## Afirmaciones revisadas

| # | Afirmación | Fuente | Ubicación | Res. | Nota |
|---|---|---|---|---|---|
| 1 | X̄ de n iid tiene media μ y varianza σ²/n | Soong | §9.1.1 p. 261, ecs. 9.5-9.6 | ✅ | |
| 2 | Su desvío σ/√n es el error estándar | Mendenhall | §7.5 p. 267 | ✅ | Definición textual del libro (parafraseada). |
| 3 | Ley de grandes números: P(\|X̄n−μ\|<a)→1 | MIT | 6b §3 y §3.1 | ✅ | |
| 4 | TCL: X̄≈N(μ,σ²/n), Z_n≈N(0,1), iid con media y varianza finitas | MIT | 6b §5.2 | ✅ | LaTeX correcto. La lectura exige iid con media y σ; "finitas" es la condición estándar (MIT 23b §4 la dice). |
| 5 | Versión formal: F_{Z_n} converge a Φ | Soong | §7.2.1 Teorema 7.1 p. 199 | ✅ | |
| 6 | Normal→X̄ normal ∀n; simétrica→n chico; asimétrica→n≥30 | Mendenhall | §7.4 p. 266-267 | ✅ | Ver H2 (matiz). |
| 7 | IC 95 % con exponencial cubre 90,5 % (n=20) y 93,8 % (n=100) | MIT | 23b §4 ej. 3 | ✅ | Tabla de la lectura: 0,905 y 0,938. Ojo: la tabla usa σ estimada con s (intervalo de muestra grande), no σ conocida; el texto dice "aproximación normal", correcto. |
| 8 | IC z: x̄ ± z_{α/2}σ/√n (datos normales, σ conocida); 1,96 | MIT; Mendenhall | MIT 22 §4.1; Mendenhall §8.5 p. 310 | ✅ | |
| 9 | σ desconocida y n≥30 → usar s | Mendenhall | §8.5 p. 310 | ✅ | |
| 10 | Datos normales y n chico → t con n−1 g.l. | MIT | 23a §3.2 | ✅ | |
| 11 | Caso: SE=3,48; margen 6,8; IC [31,2; 44,8] | cálculo propio | Python | ✅ | 3,4785; 6,8179; 31,18-44,82. |
| 12 | SE de la diferencia √(s₁²/n₁+s₂²/n₂) | Mendenhall | §8.6 p. 318-319 | ✅ | |
| 13 | 40+40, s=22: SE=4,92; 3 ± 9,6 (incluye 0) | cálculo propio | Python | ✅ | 4,9193; 9,6419 → [−6,64; 12,64]. |
| 14 | El 95 % describe al procedimiento: 19 de 20 | Mendenhall | §8.5 p. 311-312 | ✅ | |
| 15 | La media es fija, el intervalo aleatorio | Soong | §9.3.2 p. 295 | ✅ | |
| 16 | La confianza nunca es la probabilidad de que el parámetro esté en el intervalo ya calculado | MIT | 22 §3 (advertencia 4); 23a §7 | ✅ | Formulación correcta. |
| 17 | n se despeja de z·SE=B | Mendenhall | §8.9 p. 330-331 | ✅ | |
| 18 | σ=22, B=2, 95 %: n≥464,8 → 465 | cálculo propio | Python | ✅ | 464,83. |
| 19 | Márgenes n=40,100,465,1000: 6,8; 4,3; 2,0; 1,4 | cálculo propio | Python | ✅ | 6,818; 4,312; 1,9996; 1,3636. |
| 20 | IC conservador de proporción p̂±z/(2√n); regla ±1/√n | MIT | 23b §3.1 y §3.3 | ✅ | |
| 21 | Promedio mejora con más lecturas; el sesgo de muestreo no se corrige | MIT | 6b §2 y §2.1 | ✅ | Termómetro es analogía propia, sin datos. |
| 22 | Cuadruplicar n reduce el margen a la mitad | Mendenhall | §8.9 p. 330; ej. 8.28 p. 316 | ✅ | |
| 23 | Intuición: slider/consignas de SimInferencia (`tcl`, `intervalos`) | SIMULADORES.md §2.4 | props `modo`, `poblacion`, `n`, `confianza` | ✅ | Props válidas; consignas son acción + pregunta; coinciden con lo que dibuja el simulador (desvío de medias ≈ σ/√n; cobertura; ancho 90 → 99 %). |
| 24 | Tarjeta t-media-es-aleatoria | Soong | §9.1.1 p. 261 | ✅ | |
| 25 | Tarjeta t-error-estandar (22/√100=2,2) | Mendenhall | p. 267 | ✅ | |
| 26 | Tarjeta t-media-varianza-sobre-n | Soong | p. 261 | ✅ | |
| 27 | Tarjeta t-cuadruplicar-n | Mendenhall | p. 330 | ✅ | |
| 28 | Tarjeta t-tcl-enunciado | MIT | 6b §5.2 | ⚠️ | Ver H1. |
| 29 | Tarjeta t-tcl-poblacion-asimetrica (n≥30) | Mendenhall | p. 266 | ✅ | Ver H2. |
| 30 | Tarjeta t-ic-formula (50±1,96·10/√100 → 48,0 a 52,0) | MIT | 22 §4.1 | ✅ | 48,04-51,96. |
| 31 | Tarjeta t-ic-interpretacion | Mendenhall | p. 311-312 | ✅ | |
| 32 | Tarjeta t-ic-ancho-confianza (el z crece) | Mendenhall | p. 313 | ✅ | z=2,58 para 99 %. |
| 33 | Tarjeta t-t-student | MIT | 23a §3.2 | ✅ | |
| 34 | Tarjeta t-regla-pulgar-proporcion (1/√100=0,1) | MIT | 23b §3.3 | ✅ | |
| 35 | Tarjeta t-sesgo-muestreo | MIT | 6b §2.1 | ✅ | |
| 36 | Ejercicio e-error-estandar-tickets: 3,48 (tol. 0,01) | cálculo propio | Python | ✅ | 3,4785. Errores 0,55 (22/40) y 22 correctos. |
| 37 | Ejercicio e-margen-95: 6,8 (tol. 0,1) | cálculo propio | Python | ✅ | 6,818. Error 3,5 (SE sin z) correcto. |
| 38 | Ejercicio e-tamano-muestra: 465 (tol. 1) | cálculo propio | Python | ✅ | 464,83 → 465. Errores 21,56 y 327 (z=1,645: 327,4) correctos. |
| 39 | Ejercicio e-regla-pulgar-reabiertos: 5 puntos | MIT | 23b §3.3 | ✅ | 1/√400=0,05; error 0,25 (1/400·100) correcto. Ver H3. |
| 40 | Ejercicio e-interpretar-ic (opción 2 correcta) | Mendenhall | p. 311-312 | ✅ | Las tres incorrectas son los errores típicos y cada explicación es correcta. |
| 41 | Ejercicio e-vf-tcl-n5 (falso) | Mendenhall | p. 266 | ✅ | |
| 42 | Ejercicio e-vf-cuadruplicar (verdadero) | Mendenhall | p. 330 | ✅ | |
| 43 | Caso c-informe-del-jueves: IC dif. [−6,6; 12,6]; ≈930 por mes | cálculo propio | Python | ✅ | n=2·464,8=929,7; con 930 el margen es 1,9996. Moraleja correcta ("incluye el cero" ≠ "no hay efecto"). |
| 44 | Problema p-mit-polling (Class 22, Problem 3) | MIT | pset class22 | ✅ | Existe y es de encuestas con margen 0,01 al 95 % y 80 %, n=900. |
| 45 | Problema p-mendenhall-ancho-ic (8.27-8.29) | Mendenhall | p. 316 | ✅ | Pide anchos con n=100/200/400 y 90/95/99 %. |
| 46 | Problema p-simular-cobertura | MIT | 23b §4 ej. 3 | ✅ | URL responde. |

## Otros controles

- **Criterio 7 del SPEC:** "varianza" aparece en el cuerpo (Formal, TCL, SE) y en tarjetas. ✅ (además lo cubre el tema 1).
- **Errores clásicos:** ninguno. La interpretación del 95 % está bien (procedimiento, no probabilidad de este intervalo), se aclara que el sesgo no se arregla con intervalos, y el caso no toma "incluye el cero" como prueba de ausencia.
- **Plagio:** sin secuencias de 8 palabras copiadas más allá de terminología ("intervalo de confianza de 95 % para el…") y bibliografía.
- **Estilo:** orden y voz correctos; cuerpo ≈ 1120 palabras.

## Hallazgos abiertos

**H1 (menor)**
- **Archivo y campo:** `tcl-e-intervalos/practica.yaml` → `tarjetas[id=t-tcl-enunciado].dorso`.
- **Qué está mal:** dice que la media "se acerca a una normal … sea cual sea la forma de la población", sin la condición de que n sea grande ni que haya media y varianza finitas. Quien lo lee solo, lo toma como válido para cualquier n o cualquier distribución.
- **Qué dice la fuente:** MIT 6b §5.2 "For large n"; MIT 23b §4: "si la distribución tiene media y varianza finitas y n es suficientemente grande".
- **Corrección propuesta:** "Que, para n grande, su distribución se acerca a una normal con media μ y varianza σ²/n, sea cual sea la forma de la población (con media y varianza finitas)."

**H2 (menor)**
- **Archivo y campo:** `tcl-e-intervalos/tema.mdx` → Formal, "¿Qué tan grande es 'grande'?" (y tarjeta `t-tcl-poblacion-asimetrica`).
- **Qué está mal:** "si es asimétrica, conviene n de al menos 30" se presenta como umbral; el propio dato que el texto cita a continuación (MIT 23b: 90,5 % de cobertura con n=20 y 93,8 % con n=100 para el 95 % nominal) muestra que con exponencial n=30 sigue algo por debajo del nominal.
- **Qué dice la fuente:** Mendenhall p. 266 da n≥30 como guía ("no hay una respuesta clara"); MIT 23b concluye que para exp(1) "n entre 50 y 100 es suficiente para la mayoría de los usos".
- **Corrección propuesta:** agregar "30 es una guía práctica; con asimetría fuerte conviene más (50-100 en el ejemplo exponencial)".

**H3 (menor)**
- **Archivo y campo:** `tcl-e-intervalos/practica.yaml` → `ejercicios[id=e-regla-pulgar-reabiertos].explicacion`.
- **Qué está mal:** la respuesta (5 puntos) es correcta para la regla pedida, pero la explicación no avisa que es el peor caso (p=0,5). Con p̂=0,18 el margen "común" es 1,96·√(0,18·0,82/400)=3,8 puntos; quien lo compare con su planilla verá una diferencia sin entender por qué.
- **Qué dice la fuente:** MIT 23b §3.1: el intervalo es "conservador", da "al menos 1−α".
- **Corrección propuesta:** sumar a la explicación "(es una cota conservadora: con p̂=18 % el margen exacto ronda 3,8 puntos)".
