# Verificación — variables-y-distribuciones

- **Tema:** `probabilidad-estadistica/variables-y-distribuciones` (Variables aleatorias y distribuciones: binomial, Poisson y normal)
- **Fecha:** 2026-11-11
- **Verificador:** F4 (agente distinto del autor)
- **Veredicto (re-verificación sobre ee0ff26):** APROBADO (todos los hallazgos cerrados)
- **Veredicto de la primera pasada (9eb3c4b):** APROBADO (un hallazgo menor, no bloquea)
- **Commit revisado:** 9eb3c4b
- **Afirmaciones revisadas:** 48 (23 del cuerpo, 14 tarjetas, 7 ejercicios, 1 caso, 3 problemas)

Método. Libros del dueño leídos con `pdftotext` (Mendenhall: página impresa = página del PDF − 24; Soong: − 17). MIT 18.05 (Spring 2022) y NIST descargados de la web. Todas las cuentas recalculadas con Python estándar (`math`), sin mirar las del autor. Soong: las letras griegas y los signos se pierden en la extracción, pero los números de ecuación, los títulos de sección, los enunciados y la estructura se leen bien; confirmé cada página citada contra esa estructura y contra MIT/NIST/Mendenhall para las fórmulas.

## Afirmaciones revisadas

| # | Afirmación | Fuente | Ubicación | Res. | Nota |
|---|---|---|---|---|---|
| 1 | Variable aleatoria discreta asigna un número a cada resultado; pmf p(a)=P(X=a) | MIT 18.05 | Reading 4a §2.2 y §2.4 | ✅ | Coincide. |
| 2 | Var(X)=E[(X−μ)²]=Σp(x_i)(x_i−μ)²; σ=√Var | Mendenhall; MIT | Mendenhall §4.8 p. 167; MIT 5a §3 | ✅ | Idéntica en ambos. Soong §4.1.2 p. 79 la ubica como 2.º momento central. |
| 3 | Var(X)=E[X²]−μ² y su demostración | MIT; Mendenhall | MIT 5a §3.3 (prop. 3) y §3.5; Mendenhall nota al pie p. 167 | ✅ | Desarrollo del cuadrado igual al de la lectura. |
| 4 | La varianza queda en unidades al cuadrado; σ vuelve a las originales | MIT; Mendenhall | MIT 5a §3 ("Note on units"); Mendenhall §2.3 p. 62 | ✅ | |
| 5 | Var(aX+b)=a²Var(X); independientes suman varianzas | MIT | Reading 5a §3.3 (props. 1 y 2) | ✅ | |
| 6 | s²=Σ(x−x̄)²/(n−1) | Mendenhall | §2.3 p. 62 | ✅ | Ejemplo 22,80/4=5,70. |
| 7 | Se divide por n−1 para que E[S²]=σ² | Soong | §9.1.2 p. 262, ec. 9.8 y comentario | ✅ | |
| 8 | Experimento binomial: n intentos idénticos, 2 resultados, p constante, independientes | Mendenhall; NIST | §5.2 p. 184; NIST §1.3.6.6.18 | ✅ | |
| 9 | Binomial: P(X=k)=C(n,k)p^k(1−p)^(n−k); media np; Var np(1−p) | Soong; MIT; Mendenhall | Soong §6.1.1 p. 162-164 (ecs. 6.2, 6.8); MIT 5a §3.4; Mendenhall p. 186 | ✅ | LaTeX correcto. |
| 10 | Sin reposición de población chica no es binomial | Mendenhall | §5.2 ej. 5.2 p. 185-186 | ✅ | Mendenhall además da la regla n/N ≥ 0,05; no hace falta. |
| 11 | Flota 50 servidores, p=0,02: μ=1, Var=0,98, P(X≥3)≈7,8 % | cálculo propio | Python | ✅ | P(X≥3)=0,078428; P(0)+P(1)+P(2)=0,3642+0,3716+0,1858. |
| 12 | Poisson: eventos en un intervalo, al azar e independientes | Mendenhall | §5.3 p. 197-198 | ✅ | |
| 13 | Poisson: media = varianza = λ | Soong; NIST | §6.3 ecs. 6.46-6.47 p. 176; NIST §1.3.6.6.19 | ✅ | NIST da media λ, desvío √λ. |
| 14 | pmf de Poisson λ^k e^(−λ)/k! | NIST | §1.3.6.6.19 | ✅ | Abrí la página. |
| 15 | λ=12: P(X≥22)≈0,0061; "una de cada 165" | cálculo propio | Python | ✅ | 0,0060651; 1/p=164,9. |
| 16 | Aproximación Poisson a la binomial con λ=np; n>10 y p<0,1 | Soong | §6.3.2 p. 183 | ✅ | Mendenhall §6.4 p. 237 usa otra regla (np<7); no contradice. |
| 17 | Densidad normal; μ media y σ² varianza | Soong; NIST | §7.2 ecs. 7.9 y 7.11 p. 196-198 | ✅ | Fórmula del texto correcta. |
| 18 | Estandarización z=(x−μ)/σ | Mendenhall | §6.3 p. 225 | ✅ | |
| 19 | Normal: ≈68 %, 95 %, 99,7 % a 1, 2, 3 σ | MIT | Reading 6b §5.3 | ✅ | Calculé 0,6827; 0,9545; 0,9973. |
| 20 | μ=120, σ=20: P(X>160)≈2,3 % | cálculo propio | Python | ✅ | z=2 → 0,02275. |
| 21 | Binomial ≈ N(np, √(npq)) si n grande y p no cerca de 0 ni 1 | Mendenhall | §6.4 p. 237-238 | ✅ | Ejemplo 6.11 reproducido (exacto 0,1905; normal 0,1891). |
| 22 | Cajeros: medias 5 y 5, varianzas 0 y 16 | cálculo propio | a mano | ✅ | (1−5)²½+(9−5)²½=16. |
| 23 | Tabla resumen Binomial/Poisson/Normal (media y varianza) | Soong; MIT | ídem 9, 13, 17 | ✅ | |
| 24 | Tarjeta t-variable-aleatoria | MIT | 4a §2.2 | ✅ | Atómica. |
| 25 | Tarjeta t-varianza-definicion | MIT | 5a §3 | ✅ | "promedio de las distancias al cuadrado" es una paráfrasis aceptable de esperanza del cuadrado de la desviación. |
| 26 | Tarjeta t-varianza-unidades | MIT | 5a §3 | ✅ | |
| 27 | Tarjeta t-varianza-escala (×1000 → ×10⁶) | MIT | 5a §3.3 | ✅ | 1000²=10⁶. |
| 28 | Tarjeta t-varianza-cero | MIT | 5a Ej. 2 (iv) | ✅ | "W doesn't vary". |
| 29 | Tarjeta t-varianza-muestral-n-menos-1 | Soong | §9.1.2 p. 262 | ✅ | |
| 30 | Tarjeta t-binomial-sin-reposicion (2 pastillas, 20, 2 genéricas) | Mendenhall | ej. 5.2 p. 185-186 | ✅ | Coincide con el ejemplo del libro. |
| 31 | Tarjeta t-binomial-media (200·0,03=6) | MIT | 5a §3.4 | ✅ | |
| 32 | Tarjeta t-binomial-varianza (100·0,5·0,5=25) | MIT | 5a §3.4 | ✅ | |
| 33 | Tarjeta t-poisson-media-varianza (√12≈3,5) | Soong | p. 176 | ✅ | 3,4641. |
| 34 | Tarjeta t-poisson-independencia | Mendenhall | p. 198 | ✅ | |
| 35 | Tarjeta t-poisson-vs-binomial | Soong | §6.3.2 p. 183 | ✅ | |
| 36 | Tarjeta t-z-score | Mendenhall | p. 225 | ✅ | |
| 37 | Tarjeta t-regla-95 | MIT | 6b §5.3 | ✅ | |
| 38 | Ejercicio e-poisson-ticket-raro: 0,61 % (tol. 0,05) | cálculo propio | Python | ✅ | 0,6065 %. Errores 0,30 (P(X=22)=0,3018 %; P(X≥23)=0,3047 %) y 1,16 (P(X≥21)=1,1598 %) correctos y fuera de tolerancia. |
| 39 | Ejercicio e-binomial-servidores: 7,84 % (tol. 0,1) | cálculo propio | Python | ✅ | 7,8428 %. Errores 6,07 (P(X=3)) y 8,03 (Poisson λ=1: 8,0301 %) correctos. |
| 40 | Ejercicio e-varianza-binomial: 5,82 (tol. 0,01) | cálculo propio | Python | ✅ | 200·0,03·0,97; errores 6 y 2,41 (√5,82=2,4125) correctos. |
| 41 | Ejercicio e-varianza-tabla: 0,84 | cálculo propio | Python | ✅ | μ=1,6; E[X²]=3,4; Var=0,84; σ=0,9165. |
| 42 | Ejercicio e-normal-z-score: 2,28 % | cálculo propio | Python | ✅ | 0,02275; el error 4,55 es dos colas (0,0455). |
| 43 | Ejercicio e-elegir-distribucion (Poisson) | Mendenhall | §5.3 p. 197 | ✅ | Opciones incorrectas plausibles y bien explicadas. |
| 44 | Ejercicio e-vf-duplicar-varianza (falso, ×4) | MIT | 5a §3.3 | ✅ | |
| 45 | Caso c-rafaga-de-tickets: 0,6 %; en 40 h, ≈22 % | cálculo propio | Python | ✅ | 1−(1−0,006065)^40=0,2160; el texto dice "cerca de 22 %". Nodos y consecuencias coherentes. |
| 46 | Problema p-mit-varianza-bernoulli (Class 5, Board Q. 1) | MIT | pset class05a | ✅ | Existe y pide Var Bernoulli y binomial (más el SD de un promedio). |
| 47 | Problema p-soong-poisson (6.23 y 6.24) | Soong | cap. 6 p. 187 | ✅ | Ambos son de accidentes con tasa promedio. |
| 48 | Problema p-simular-poisson | NIST | §1.3.6.6.19 | ✅ | URL eda366j.htm responde. |

## Otros controles

- **Criterio 7 del SPEC:** la palabra "varianza" aparece 16 veces en `tema.mdx` (resumen, Intuición, Fórmula, tabla, Profundizar) y 27 en `practica.yaml` (tarjetas y ejercicios). ✅
- **Errores clásicos:** ninguno. Var(X)=E[(X−μ)²], σ² con unidades al cuadrado, np(1−p) y λ correctos; no hay confusión entre media y varianza ni entre Poisson y binomial.
- **Plagio:** búsqueda automática de secuencias de 8 palabras contra Mendenhall, Soong y las lecturas MIT: solo coinciden cadenas bibliográficas del frontmatter. Sin frases copiadas.
- **Estilo:** orden caso real → intuición → formal respetado; voseo y tono criollo; términos en inglés entre paréntesis. Cuerpo ≈ 1325 palabras (dentro de 700-1500).

## Hallazgos abiertos

**H1 (menor)**
- **Archivo y campo:** `src/content/temas/probabilidad-estadistica/variables-y-distribuciones/tema.mdx` → frontmatter `fuentes[id=nist-distribuciones].url`.
- **Qué está mal:** apunta a `eda366.htm` (índice de la Galería de distribuciones), pero `ubicacion` y las citas hablan de §1.3.6.6.18 y §1.3.6.6.19.
- **Qué dice la fuente:** la binomial está en `eda366i.htm` y la Poisson en `eda366j.htm` (ambas respondieron y contienen lo citado).
- **Corrección propuesta:** poner la URL de la sección (`…/eda366j.htm`, o la binomial) o aclarar en `ubicacion` que se llega desde el índice. No cambia ningún dato.

## Re-verificación (diff 9eee9c2..ee0ff26, fecha 2026-11-11)

| Hallazgo | Estado | Comprobación |
|---|---|---|
| H1 | **CERRADO (ee0ff26)** | `fuentes[nist-distribuciones].url` ahora es `…/eda366j.htm` (Poisson, §1.3.6.6.19, que respondió y contiene la fórmula, media λ y desvío √λ) y `ubicacion` aclara que la binomial §1.3.6.6.18 está en `eda366i.htm` (también abierta y verificada). FUENTES actualizado de forma coherente. |

Hallazgos nuevos por los cambios: ninguno. `npm run build` en verde sobre ee0ff26.

## Hallazgos abiertos (estado final)

Ninguno.
