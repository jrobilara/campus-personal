# Verificación F4 — derivadas-y-gradiente

- **Tema:** `matematica-fisica/derivadas-y-gradiente` (commit del escritor 3e435d6)
- **Fecha:** 2026-11-11
- **Verificador:** F4 (agente distinto del autor)
- **Veredicto:** OBSERVADO

Criterio: APROBADO = sin hallazgos de severidad media o alta (los menores no bloquean pero quedan anotados). Acá hay uno medio (H1, un enunciado de problema que contradice la cuenta) y cuatro menores.

## Qué se hizo

- Fuentes abiertas y leídas: Stewart *Cálculo de varias variables* 7.ª (PDF del dueño, páginas impresas 936, 938, 939 y 943), Deisenroth et al. *MML* (PDF libre, borrador 2024-01-15, descargado de nuevo; pp. 141-147, 227-230, 247), OpenStax Cálculo 1 §3.1, OpenStax Cálculo 3 §4.6 y §4.7.
- Build con Node 24: `npm run build` verde; `grep -r katex-error dist/` sin resultados. Además se renderizó con KaTeX en modo estricto cada fragmento `$…$`, `$$…$$` y `tex="…"` de `tema.mdx` y `practica.yaml` (368 fragmentos entre los cuatro temas, 0 errores) y no queda ningún `$` suelto en el HTML.
- Todas las cuentas se rehicieron en Python sin mirar las del autor.
- Plagio: comparación de secuencias de 5 palabras contra las páginas de Stewart y Zill del dueño; solo aparecen términos estándar ("pendiente de la recta tangente", "regla de la cadena", "curvas de nivel"). Las fuentes en inglés están parafraseadas; no hay frases literales.

## Las afirmaciones "cuenta propia" de este tema

| Afirmación | Resultado | Nota |
|---|---|---|
| Factor 1−2γ para f=x² | ✅ correcta | Con ∇f=2x, x_{k+1}=x_k−γ·2x_k=(1−2γ)x_k. Los cuatro regímenes de la tabla (0<γ<0,5; 0,5<γ<1; γ=1; γ>1) están bien. Falta ligarla a la fuente: ver H3. |
| (a/2)x² converge si 0<γ<2/a | ✅ correcta | Factor 1−γa, |1−γa|<1 ⇔ 0<γ<2/a. Es una derivación directa; está en Profundizar. |
| "Gradiente cero puede ser mínimo, máximo o silla" | ✅ correcta, ⚠️ respaldo débil | MML ej. 7.1 es solo un enunciado de ejercicio. OpenStax Cálculo 3 §4.7 la respalda de verdad (ver H2). |

## Afirmaciones revisadas

| # | Afirmación | Fuente | Ubicación | Resultado | Nota |
|---|---|---|---|---|---|
| 1 | f'(a) = límite del cociente incremental, si existe | openstax-calc1 | §3.1, ecs. 3.5 y 3.6 | ✅ | Coincide. |
| 2 | Es pendiente de la tangente y razón de cambio instantánea | openstax-calc1 | §3.1 | ✅ | La página define ambas con el mismo límite. |
| 3 | Fórmula `<Formula>` de la derivada con h | openstax-calc1 | §3.1, ec. 3.6 | ✅ | LaTeX correcto, símbolos explicados. |
| 4 | d/dx xⁿ = n·xⁿ⁻¹ y d/dx x² = 2x | mml | §5.1, ej. 5.2, p. 142 (pdf 148) | ✅ | Página impresa confirmada (+6 sobre el índice del PDF). |
| 5 | En x=0 la derivada de x² vale 0, positiva a la derecha, negativa a la izquierda | cuenta | — | ✅ | Trivial. |
| 6 | El gradiente junta las derivadas parciales en un vector | stewart-multi | §14.6, def. 8, p. 936 | ⚠️ | La def. 8 es para 2 variables; la de 3 es la ec. 13, p. 938. El tema escribe n variables (ver H4). |
| 7 | Gradiente fila o columna según el libro | mml | §5.2, def. 5.5 y observación, pp. 146-147 | ✅ | MML usa fila (ec. 5.40) y lo explica en la observación "Gradient as a Row Vector". |
| 8 | El gradiente señala hacia donde f crece más rápido y su norma es esa rapidez | stewart-multi | §14.6, teorema 15, p. 939 | ✅ | "El valor máximo de D_u f es |∇f| y se presenta cuando u tiene la misma dirección". |
| 9 | En la dirección contraria decrece más rápido | openstax-calc3 | §4.6, teorema 4.13 | ✅ | Confirmado (mínimo en la dirección opuesta, valor −‖∇f‖). |
| 10 | Es perpendicular a las curvas de nivel | openstax-calc3 | §4.6, teorema 4.14 | ✅ | "Gradient Is Normal to the Level Curve". |
| 11 | Paso x_{k+1}=x_k−γ∇f(x_k) | mml | §7.1, ec. 7.6, p. 228 | ✅ | MML usa gradiente fila y transpone; el tema lo aclara. Fórmula y símbolos bien. |
| 12 | Con tasa adecuada converge a un mínimo local, no necesariamente al global | mml | §7.1, p. 228 | ✅ | Dice "converges to a local minimum"; el "no necesariamente al global" es consecuencia directa. |
| 13 | Tasa chica lenta; grande se pasa, no converge o diverge | mml | §7.1.1, p. 229 | ✅ | "overshoot, fail to converge, or even diverge". |
| 14 | E(w)=(1/m)Σ(tᵢ−w·nᵢ)² y E'(w)=−(2/m)Σ nᵢ(tᵢ−w·nᵢ) | mml / cuenta | §5.2, ej. 5.6, p. 146 | ✅ | La derivada es correcta (recalculada: E'(0)=−19,667). El ej. 5.6 de MML es sobre otra función, (x+2y³)²; solo respalda el uso de la regla de la cadena. Aceptable porque el texto dice eso. |
| 15 | Es el caso 1-D del problema de mínimos cuadrados con gradiente 2(Ax−b)ᵀA | mml | §7.1, ej. 7.2, p. 230 | ✅ | Ec. 7.10. Con el 1/m queda consistente con la fórmula del tema. |
| 16 | Tabla de regímenes según γ | cuenta | — | ✅ | Ver arriba. γ=1 rebota entre x₀ y −x₀: correcto. |
| 17 | En valles largos y angostos hay zigzag | mml | §7.1, p. 229 | ✅ | Observación sobre mal condicionamiento. |
| 18 | Doble pozo: x₀=2, γ=0,01 → mínimo local ≈1,13; x₀=−2 → global ≈−1,30 | SIMULADORES §2.1 | — | ✅ | Python: 1,1309 y −1,3008, con f=x⁴−3x²+x. Coincide con la consigna del simulador. |
| 19 | Consigna 1 (tangente, h→0,01, x₀=0) | SIMULADORES §2.1 | — | ✅ | Los controles existen y la derivada en 0 es 0,00. |
| 20 | Consigna 2 (tasas 0,1; 0,6; 1; 1,1) | SIMULADORES §2.1 | — | ✅ | Rango del slider 0,001-1,5; el tema no promete el nombre de la lectura `estado`, bien. |
| 21 | Analogía del velocímetro | — | Intuición | ✅ | Mapea estructura (velocidad media → instantánea). |
| 22 | Analogía de la loma con los ojos cerrados | — | Intuición | ✅ | El paso es proporcional a la pendiente, igual que en el algoritmo. |
| 23 | Gradiente cero ⇒ punto estacionario (mín, máx o silla) | mml | ej. 7.1, p. 247 | ⚠️ | Correcta; respaldo débil (H2). |
| 24 | t-derivada-pendiente | openstax-calc1 | §3.1 | ✅ | |
| 25 | t-derivada-limite | openstax-calc1 | §3.1 | ✅ | |
| 26 | t-derivada-fondo-parabola | mml | ej. 5.2 | ⚠️ | El frente pregunta dos cosas ("cuánto vale" y "qué dice del dibujo") y el dorso junta tres ideas; ver H5. |
| 27 | t-gradiente-definicion | stewart-multi | def. 8, p. 936 | ✅ | |
| 28 | t-gradiente-direccion | stewart-multi | teorema 15 | ✅ | |
| 29 | t-gradiente-norma | stewart-multi | teorema 15 | ✅ | |
| 30 | t-descenso-signo | mml | §7.1, p. 228 | ✅ | "gradient points in the direction of the steepest ascent". |
| 31 | t-tasa-chica | mml | §7.1.1 | ✅ | |
| 32 | t-tasa-grande | mml | §7.1.1 | ✅ | Dorso con varias consecuencias pero una sola idea. |
| 33 | t-factor-cuadratica (1−2γ) | cuenta | — | ✅ | Correcta; la tarjeta no tiene `fuente` (H3). |
| 34 | t-minimo-local | mml | §7.1 | ✅ | |
| 35 | t-gradiente-cero | mml | ej. 7.1 | ⚠️ | Ver H2. |
| 36 | e-razon-de-cambio-costo: T'(500)=2 ms/elemento | openstax-calc1 | §3.1 | ✅ | T'=0,004n → 2. Cociente incremental (T(501)−T(500))=2,002 ✔. Distractores: T(500)/500=1 ✔, T(500)=500 ✔. Tolerancia 0,01 razonable. |
| 37 | e-tres-pasos-de-descenso: x₃=1,536 | mml | §7.1 | ✅ | 2,4; 1,92; 1,536. Distractor 5,184=3·1,2³ ✔; 2,4=x₁ ✔. |
| 38 | e-tasa-que-rebota: x₅=−0,156 | mml | §7.1.1 | ✅ | −0,15552; tolerancia 0,002 cubre. Distractores 0,156 y 1,2 (|x₁|) ✔. |
| 39 | e-paso-de-error-cuadratico: w₁=0,983 | mml | §7.1, ej. 7.2 | ✅ | E'(0)=−19,667; w₁=0,98333 ✔. Distractores 19,667 y −0,983 ✔. |
| 40 | e-vf-gradiente-cero-minimo: falso | mml | ej. 7.1 | ✅ | Correcto; justificación no repite el enunciado. |
| 41 | e-om-que-hacer-si-diverge: bajar la tasa | mml | §7.1.1 | ✅ | Las tres opciones incorrectas explican bien por qué fallan. |
| 42 | p-stewart-gradiente-evaluado | stewart-multi | §14.6, ejs. 7-10, p. 943 | ✅ | Esos ejercicios piden gradiente, evaluarlo en P y razón de cambio en la dirección u (los 9 y 10 son de 3 variables). |
| 43 | p-mml-puntos-estacionarios | mml | cap. 7, ej. 7.1, p. 247 | ✅ | La función del ejercicio es exactamente x³+6x²−3x−5. Puntos −2±√5; x₀=0 → 0,236 y x₀=−5 se escapa a −∞ (verificado). |
| 44 | p-planilla-mse (tasas 0,01; 0,05; 0,15) | mml | §7.1, ej. 7.2 | ❌ | Ver H1. |
| 45 | Lenguaje: voz criolla, orden caso → intuición → formal, largos | GUIA-ESTILO | — | ✅ | Cumple. Salvedad de estilo en H3. |

## Hallazgos abiertos

**H1 (media) — el problema p-planilla-mse presupone algo que la cuenta desmiente.**
- Archivo y campo: `src/content/temas/matematica-fisica/derivadas-y-gradiente/practica.yaml` → `problemas` → `p-planilla-mse` → `enunciado`.
- Qué está mal: pide correr 30 filas con tasas 0,01, 0,05 y 0,15 y anotar "cuál tasa llega más rápido y cuál no converge". Con los datos del propio ejercicio, E''(w)=(2/m)Σnᵢ²=28/3≈9,333, así que el factor por paso es 1−γ·9,333: 0,907 (γ=0,01), 0,533 (γ=0,05) y −0,400 (γ=0,15). Las tres convergen a w*=2,107 (recalculado: tras 30 pasos 1,9957; 2,10714; 2,10714). El límite está en γ<2/9,333≈0,214. El lector va a buscar una que no converge y no la va a encontrar.
- Qué dice la fuente: MML §7.1.1 dice que una tasa demasiado grande puede no converger, pero no fija el umbral para este problema; el umbral sale de la propia cuenta del tema (Profundizar: γ<2/a).
- Corrección propuesta: cambiar las tasas a 0,01, 0,05, 0,15 y 0,25 (0,25 da factor −1,33 y diverge), o reformular la consigna a "cuál llega más rápido, y calculá la tasa límite 2/E'' y verificala corriendo una tasa apenas por encima".

**H2 (menor) — "gradiente cero puede ser mínimo, máximo o silla" tiene respaldo débil.**
- Archivos y campos: `tema.mdx` → `<Formal>`, párrafo final (`<Cita f="mml" loc="ejercicio 7.1, p. 247" />`); `practica.yaml` → tarjeta `t-gradiente-cero` (`fuente: mml`) y ejercicio `e-vf-gradiente-cero-minimo` (`fuente: mml`).
- Qué está mal: la matemática es correcta, pero MML ej. 7.1 solo pide "hallá los puntos estacionarios e indicá si son máximo, mínimo o silla". No es una afirmación del libro.
- Qué dice una fuente que sí la respalda: OpenStax Cálculo 3 §4.7 define punto crítico (fx=fy=0), define punto silla (derivadas parciales cero pero sin extremo local), da el ejemplo z=x²−y² y el criterio de la segunda derivada (Teorema 4.17: mín, máx, silla o inconcluso).
- Corrección propuesta: citar `openstax-calc3` §4.7 (agregarla a la lista de `loc` y a la `fuente` de la tarjeta y del ejercicio) y dejar MML ej. 7.1 como complemento. Aclarar que en una variable la "silla" es un punto de inflexión de tangente horizontal (por ejemplo x³ en 0).

**H3 (menor) — el factor 1−2γ es correcto pero se presenta como "cuenta propia".**
- Archivos y campos: `tema.mdx` → `<Formal>` → "Cuándo anda…" ("Es una cuenta propia que se verifica a mano"); `practica.yaml` → tarjeta `t-factor-cuadratica` (sin `fuente`).
- Qué está mal: es jerga de proceso del autor dentro de la lección, y la tarjeta queda sin fuente aunque se deriva en una línea de una fuente.
- Qué dice la fuente: MML ec. 7.6 da el paso con (∇f)ᵀ; con f=x² resulta 2x.
- Corrección propuesta: escribir "Para f(x)=x² el gradiente es 2x; reemplazado en la ecuación del paso queda x_{k+1}=(1−2γ)x_k" con `<Cita f="mml" loc="§7.1, ec. 7.6, p. 228" />`, y poner `fuente: mml` en la tarjeta. Lo mismo para la parábola (a/2)x² en Profundizar. Si se quiere una cita para "γ<2/L en general", Boyd y Vandenberghe cap. 9 (lo menciona MML p. 230); no lo abrí.

**H4 (menor) — Stewart def. 8 es de dos variables y el tema define el gradiente para n.**
- Archivos y campos: `tema.mdx` → `<Formal>` → "Varias variables: el gradiente" (cita `stewart-multi` def. 8, p. 936); `practica.yaml` → tarjeta `t-gradiente-definicion`.
- Qué está mal: la definición 8 de Stewart cubre f(x, y); la de tres variables es la ec. 13 (p. 938). Para n variables el respaldo es MML def. 5.5 (ec. 5.40).
- Corrección propuesta: citar Stewart "def. 8 (p. 936) y ec. 13 (p. 938)" y agregar `<Cita f="mml" loc="§5.2, def. 5.5, p. 146" />` para n variables. Ambos están dentro de las fuentes ya declaradas.

**H5 (menor) — tarjeta no atómica.**
- Archivo y campo: `practica.yaml` → tarjeta `t-derivada-fondo-parabola` → `frente` y `dorso`.
- Qué está mal: el frente pregunta "cuánto vale y qué dice del dibujo"; el dorso responde tres cosas ("vale 0, la tangente es horizontal, y es el fondo de la parábola"). La guía (§4) pide una idea por tarjeta y dorso corto.
- Corrección propuesta: frente "¿Cuánto vale la derivada de x² en x=0?" dorso "0: la tangente es horizontal, en el fondo de la parábola." (o separar en dos tarjetas).
