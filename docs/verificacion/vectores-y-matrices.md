# Verificación F4 — vectores-y-matrices

- **Tema:** `matematica-fisica/vectores-y-matrices` (commit del escritor 3e435d6)
- **Fecha:** 2026-11-11
- **Verificador:** F4 (agente distinto del autor)
- **Veredicto:** OBSERVADO

Criterio: APROBADO = sin hallazgos de severidad media o alta (los menores no bloquean pero quedan anotados). Acá hay dos medios (H1 y H2, afirmaciones de la intuición que enseñan algo impreciso) y dos menores.

## Qué se hizo

- Fuentes abiertas y leídas: Zill *Álgebra, trigonometría y geometría analítica* 3.ª (PDF del dueño; páginas impresas 606, 607 y 612 confirmadas, el PDF tiene +17 sobre la numeración impresa), MML (PDF libre, borrador 2024-01-15; impresas pp. 51, 92, 94, 100, 101, 105, 137, 318), OCW 18.06 Spring 2010 (páginas de las lecciones 21 y 30), OpenStax Cálculo 3 §5.7 y Stewart (para la propuesta de H3).
- Build con Node 24 verde, `grep -r katex-error dist/` sin resultados, y todos los fragmentos LaTeX pasan KaTeX en modo estricto.
- Cuentas en Python puro (sin numpy): productos de matrices, determinantes, autovalores, razón de áreas sobre un pentágono.
- Plagio: sin coincidencias salvo términos estándar de Zill ("el producto AB de dos matrices", "determinante de una matriz de 2×2") que son nombres de definición.

## Las afirmaciones "cuenta propia" de este tema

| Afirmación | Resultado | Nota |
|---|---|---|
| Un polígono cambia su área por |det A| | ✅ correcta, ⚠️ sin cita | Verificado: pentágono (0,0),(3,0),(4,2),(2,4),(−1,2) con A=[[3,1],[2,4]] → razón 10,0 = det. Vale para cualquier región medible (caso lineal del jacobiano). MML ej. 4.2 solo trata el paralelogramo. Ver H3. |
| Escala igual en ambos ejes conmuta con la rotación | ✅ correcta | cI conmuta con toda matriz. |
| Los det de la tabla (rotación 1, diag(2;0,5) 1, reflexión −1, proyección 0) | ✅ | ad−bc. |

## Afirmaciones revisadas

| # | Afirmación | Fuente | Ubicación | Resultado | Nota |
|---|---|---|---|---|---|
| 1 | Las columnas de la matriz son las imágenes de la base | mml | §2.7, def. 2.19, p. 51 | ✅ | "The coordinates of Φ(bⱼ) … are the j-th column of A_Φ". |
| 2 | Matriz × vector es una transformación que lleva vectores a vectores | ocw-1806 | Lecture 30 | ✅ | Página de la clase (Spring 2010): "we get an output vector". Solo se usó la descripción, y el tema dice exactamente eso. |
| 3 | A·v = x·col₁ + y·col₂ (`<Formula>`) | mml / cuenta | — | ✅ | LaTeX y símbolos correctos. |
| 4 | Matriz de rotación R(θ) antihoraria | mml | §3.9.1, ecs. 3.75-3.76, p. 92 | ✅ | Φ(e₁)=(cosθ, sinθ), Φ(e₂)=(−sinθ, cosθ). |
| 5 | R(90°)=[[0,−1],[1,0]] | mml | ídem | ✅ | |
| 6 | Las rotaciones conservan distancias y ángulos | mml | §3.9.4, p. 94 | ✅ | |
| 7 | Escala diag(sx, sy) | cuenta | — | ✅ | Se lee mirando a dónde van î y ĵ. |
| 8 | Definición del producto fila por columna | zill | §14.2, def. 14.2.3, p. 606 | ✅ | El tema dice "fila i de A por columna j de B" (correcto; el texto de Zill trae un error tipográfico, "fila j de B"). |
| 9 | (AB)v = A(Bv): primero actúa B | cuenta | — | ✅ | Consecuencia de la definición. R·S·v=(−3; 8) y S·R·v=(−12; 2) recalculados. |
| 10 | AB ≠ BA en general | zill | §14.2, ej. 8, p. 607 | ✅ | El ejemplo 8 da AB=[[−4,6],[−10,12]], BA=[[−2,−4],[8,10]]. |
| 11 | Con escala igual en ambos ejes sí conmuta | cuenta | — | ✅ | |
| 12 | det A = ad−bc | zill / mml | zill §14.3, def. 14.3.1, p. 612; mml ec. 4.6, p. 100 | ✅ | Zill: `det A = a11a22 − a12a21`. |
| 13 | |det| es el área del paralelogramo de las columnas; el signo, la orientación | mml | §4.1, ej. 4.2, p. 101 | ✅ | Ej. 4.2 habla de "signed volume" y de |det| como área. La lectura "signo negativo = espejado" es estándar. |
| 14 | Un polígono cualquiera cambia su área por |det A| | cuenta | — | ⚠️ | Correcta; ver H3. |
| 15 | Invertible ⇔ det ≠ 0 | mml | teorema 4.1, p. 100 | ✅ | |
| 16 | Tabla de determinantes | cuenta | — | ✅ | |
| 17 | Autovector: Ax=λx, x≠0 | mml | §4.2, def. 4.6, p. 105 | ✅ | MML toma λ real, coherente con "no tiene autovalores reales". |
| 18 | "No lo gira, solo lo estira por λ (si λ<0 también lo invierte)" | ocw-1806 | Lecture 21 | ✅ | La página (Spring 2010) dice: "If the product Ax points in the same direction as the vector x, we say that x is an eigenvector". Nota menor en H4 sobre λ=0. |
| 19 | Existe x cuando det(A−λI)=0 | mml | §4.2, p. 105 | ✅ | Lista de equivalencias. |
| 20 | [[3,1],[1,3]]: λ²−6λ+8=0, λ=4 y 2; (1,1)→(4,4), (1,−1)→(2,−2) | cuenta | — | ✅ | Recalculado. |
| 21 | Rotación de 90°: λ²+1=0, sin raíces reales; el simulador marca "complejos" | cuenta / SIMULADORES §2.2 | — | ✅ | La lectura `autovalores` admite "complejos". |
| 22 | PCA proyecta sobre un subespacio; el libro lo deriva con proyecciones y autovalores | mml | cap. 10, p. 318 | ✅ | La introducción lista exactamente eso. |
| 23 | Consigna 1 (rotacion-90, comparar columnas) | SIMULADORES §2.2 | — | ✅ | |
| 24 | Consigna 2 (proyeccion, v=(2,1), misma x) | SIMULADORES §2.2 | — | ✅ | La proyección [[1,0],[0,0]] manda (x,y)→(x,0). |
| 25 | Consigna 3 (matriz [[3,1],[1,3]], autovectores) | SIMULADORES §2.2 | — | ✅ | Factores 4 y 2. |
| 26 | Intuición: "el área del paralelogramo dice cuánto se estiró o se achicó el plano en promedio" | — | Intuición | ❌ | Ver H1. |
| 27 | Intuición/analogía: "nunca dobla el plano: las rectas siguen siendo rectas, las paralelas siguen paralelas" | — | Intuición | ❌ | Ver H2. |
| 28 | Analogía de la hoja de goma (î, ĵ → columnas) | — | Intuición | ✅ | Salvo lo anotado en H2. |
| 29 | Ojo: si dos puntos van al mismo lugar no hay inversa | — | Intuición | ✅ | |
| 30 | t-columnas-son-imagenes | mml | def. 2.19 | ✅ | |
| 31 | t-origen-quieto | cuenta | — | ✅ | A·0=0. |
| 32 | t-matriz-rotacion | mml | ec. 3.76 | ⚠️ | El frente no dice "antihoraria"; la convención de signo depende de eso (H4). |
| 33 | t-rotacion-conserva | mml | p. 94 | ✅ | |
| 34 | t-orden-composicion | zill | def. 14.2.3 | ✅ | |
| 35 | t-no-conmutativo | zill | ej. 8 | ✅ | |
| 36 | t-determinante-formula | zill | def. 14.3.1 | ✅ | |
| 37 | t-determinante-area | mml | ej. 4.2 | ✅ | |
| 38 | t-determinante-negativo | mml | ej. 4.2 | ✅ | |
| 39 | t-determinante-cero | mml | teorema 4.1 | ✅ | |
| 40 | t-autovector-definicion | mml | def. 4.6 | ⚠️ | "Solo lo estira o lo invierte" omite λ=0, que lo aplasta al origen (H4). |
| 41 | t-rotacion-sin-autovectores | mml | def. 4.6 | ✅ | Precisa "reales". |
| 42 | e-componer-escala-y-giro: x=−3 | zill | def. 14.2.3 | ✅ | S(4,6)=(8;3); R(8;3)=(−3;8). Distractor −12 = S(R(4,6))=(−12;2) ✔; 8 es la y ✔. |
| 43 | e-area-del-poligono: 70 cm² | mml | ej. 4.2 | ✅ | det=3·4−1·2=10; 7·10=70. Distractor 98 = 7·(ad+bc)=7·14 ✔; 10 ✔. Depende de la afirmación 14 (H3). |
| 44 | e-autovalor-mayor: 4 | mml | def. 4.6 | ✅ | Distractores 6 (suma) y 8 (producto=det) ✔. |
| 45 | e-om-reflexion | mml | ej. 4.2 | ✅ | Opciones incorrectas explicadas con î, ĵ y det. |
| 46 | e-vf-toda-matriz-se-deshace: falso | mml | teorema 4.1 | ✅ | |
| 47 | e-vf-orden-no-importa: falso | zill | ej. 8 | ✅ | Con diag(2;0,5) y R el resultado cambia (afirmación 9). |
| 48 | p-mml-autoespacios | mml | ej. 4.3, p. 137 | ✅ | El ejercicio tiene exactamente A=[[1,0],[1,1]] y B=[[−2,2],[2,1]]. A: λ=1 doble con una sola recta; B: λ=2 y −3, dos rectas ✔. |
| 49 | p-area-con-python | mml | ej. 4.2 y §3.9.1 | ✅ | El "cordón de zapatero" (shoelace) se nombra sin cita; es una fórmula estándar y es tarea práctica. |
| 50 | p-zill-producto-matrices | zill | def. 14.2.3 y ej. 8 | ✅ | Dos rotaciones del plano conmutan (MML p. 94). |
| 51 | Estilo: orden caso → intuición → formal, voz criolla | GUIA-ESTILO | — | ✅ | |

## Hallazgos abiertos

**H1 (media) — "cuánto se estiró el plano en promedio" es impreciso.**
- Archivo y campo: `src/content/temas/matematica-fisica/vectores-y-matrices/tema.mdx` → `<Intuicion>`, párrafo "Ahora el 'área'…".
- Qué está mal: el determinante no es un promedio: es el factor exacto por el que se multiplica el área de cualquier región, en todos los puntos del plano (el propio `<Formal>` lo dice con "exactamente"). "En promedio" sugiere que hay zonas que se estiran más que otras, que es falso para una transformación lineal.
- Qué dice la fuente: MML ej. 4.2, p. 101: |det| es el área del paralelogramo formado por las columnas.
- Corrección propuesta: reemplazar "cuánto se estiró o se achicó el plano en promedio" por "por cuánto se multiplica cualquier área" (el cuadrado de lado 1 es solo el caso que se puede dibujar).

**H2 (media) — la analogía de la goma afirma que nunca se pierde la rectitud ni el paralelismo, pero la proyección lo rompe.**
- Archivo y campo: `tema.mdx` → `<Intuicion>`, primer párrafo ("nunca dobla el plano: las rectas siguen siendo rectas, las paralelas siguen siendo paralelas") y `<Analogia titulo="La hoja cuadriculada de goma">` ("Mientras no la rompas ni la dobles…").
- Qué está mal: vale para matrices con det≠0. Con la proyección [[1,0],[0,0]] (que el mismo tema usa dos párrafos después) una recta vertical se convierte en un punto y dos rectas paralelas distintas pueden terminar como dos puntos o como la misma recta. La analogía también lista "aplastarla" como una de las acciones permitidas, lo que contradice "siguen rectas y parejas".
- Qué dice la fuente: una transformación lineal conserva rectas que pasan a rectas o puntos; MML §2.7 y teorema 4.1 distinguen el caso invertible.
- Corrección propuesta: "Si el determinante no es cero, las rectas siguen siendo rectas, las paralelas siguen paralelas y el origen se queda quieto; si es cero, la hoja se aplasta sobre una recta (o un punto)". Alcanza con mover el caso aplastado a la frase siguiente del "Ojo".

**H3 (menor) — "un polígono cualquiera cambia su área por |det A|" no tiene cita.**
- Archivos y campos: `tema.mdx` → `<Formal>` → "Determinante: área, orientación e inversa" ("resultado que se deduce de lo anterior descomponiendo la figura en cuadraditos"); `practica.yaml` → `e-area-del-poligono` (`fuente: mml`, ej. 4.2).
- Qué está mal: es correcto (verificado con un pentágono, razón 10,0), pero MML ej. 4.2 solo habla del paralelogramo; el ejercicio de los 7 cm² depende de la extensión a cualquier figura.
- Qué dice la fuente: OpenStax Cálculo 3 §5.7 (Jacobianos): para una transformación C¹ el área de la imagen de un rectángulo pequeño es ≈ |J|·ΔuΔv; para x=au+bv, y=cu+dv el jacobiano es la constante ad−bc (esa última cuenta no está escrita en la página). Stewart varias variables trata el cambio de variables en el cap. 15 (no verifiqué la página).
- Corrección propuesta: agregar `<Cita f="openstax-calc3" loc="§5.7" />` (es una fuente nueva del tema, con `verMas: false` si se cita) o reformular: "el valor absoluto del determinante multiplica el área de cualquier figura (es el caso lineal del jacobiano)". Para el ejercicio, dejar `mml` para el paralelogramo y mencionar esa extensión en la `explicacion`.

**H4 (menor) — dos tarjetas con matices que conviene precisar.**
- Archivo: `practica.yaml`. (a) `t-matriz-rotacion` → `frente`: decir "antihoraria" (el signo de −sin θ depende de la convención). (b) `t-autovector-definicion` → `dorso`: "solo lo estira o lo invierte" omite λ=0 (lo manda al origen); mejor "…solo cambia su largo (y el sentido si λ<0)" o aclarar λ≠0. Lo mismo vale para la frase "solo lo estira por λ" en `tema.mdx` → `<Formal>` → "Autovalores y autovectores".
- Qué dice la fuente: MML def. 4.6 admite cualquier λ real; el caso λ=0 corresponde a matrices singulares.
