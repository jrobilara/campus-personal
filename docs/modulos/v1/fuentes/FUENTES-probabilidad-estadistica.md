# FUENTES — Probabilidad y estadística
- Escritor: F3-probabilidad-estadistica · Fecha: 2026-11-11

Convenciones. Las páginas de **Mendenhall** son las impresas del libro (la copia en PDF tiene 24 páginas de adelanto). Las de **Soong** son las impresas (el PDF tiene 17 de adelanto). Las lecturas de **MIT 18.05** se citan por número de lectura y sección. "Cálculo propio" = hecho con Python (`math`, sin scipy) y chequeado a mano o con una simulación; no sale de ninguna fuente.

## variables-y-distribuciones
| # | Afirmación clave (tu paráfrasis) | Dónde está | Fuente (id) | Ubicación exacta | Cómo la verificaste |
|---|---|---|---|---|---|
| 1 | Una variable aleatoria discreta asigna un número a cada resultado; su pmf es p(a)=P(X=a). | Formal, Variable aleatoria | mit1805 | Reading 4a, §2.2 y §2.4 | Leí las definiciones; coinciden. |
| 2 | Var(X)=E[(X−μ)²]=Σp(x_i)(x_i−μ)²; el desvío es su raíz. | Formal, Formula varianza | mendenhall; mit1805 | Mendenhall §4.8, p. 167; MIT Reading 5a, §3 | Leí las dos; mismas fórmulas. Soong §4.1.2 (p. 79) la ubica como segundo momento central. |
| 3 | Var(X)=E[X²]−μ². | Formal, Formula y Profundizar | mit1805 | Reading 5a, §3.3 (prop. 3) y §3.5 | Seguí la demostración línea por línea; Mendenhall la da en nota al pie de la p. 167. |
| 4 | La varianza queda en unidades al cuadrado; el desvío vuelve a las originales. | Formal, tras la Formula | mit1805 | Reading 5a, §3 ("Note on units") | Leí la nota. |
| 5 | Var(aX+b)=a²Var(X); la suma de independientes suma varianzas. | Formal | mit1805 | Reading 5a, §3.3 (props. 1 y 2) | Leí; el ejemplo 3 de la lectura lo ilustra. |
| 6 | La varianza muestral divide por n−1. | Formal | mendenhall | §2.3, p. 62 | Leí la definición y el ejemplo numérico (22,80/4=5,70). |
| 7 | Se divide por n−1 para que la media de S² sea σ². | Formal | soong | §9.1.2, p. 262, ec. 9.8 y comentario | Leí el texto. |
| 8 | Un experimento binomial: n intentos idénticos, dos resultados, p constante, independientes. | Formal, Binomial | mendenhall | §5.2, p. 184 | Leí la definición de cinco características. Coincide con NIST §1.3.6.6.18 (dos resultados, p fijo). |
| 9 | Binomial: P(X=k)=C(n,k)p^k(1−p)^(n−k), media np, varianza np(1−p). | Formal, Formula binomial | soong; mit1805 | Soong §6.1.1, p. 162-164 (ecs. 6.2 y 6.8); MIT Reading 5a, §3.4 | Leí; NIST §1.3.6.6.18 da media np y desvío √(np(1−p)). Verifiqué la varianza numéricamente. |
| 10 | Sin reposición de una población chica, los intentos dependen y no es binomial. | Formal | mendenhall | §5.2, ejemplo 5.2, p. 185-186 | Leí el ejemplo de las píldoras. |
| 11 | Flota de 50 servidores, p=0,02: μ=1, Var=0,98, P(X≥3)≈7,8 %. | Formal, Binomial | cálculo propio | Python, binomial exacta | P(X≥3)=0,078428. Datos ilustrativos. |
| 12 | Poisson: eventos en un intervalo; supuestos de azar e independencia. | Formal, Poisson; Ojo de Intuición | mendenhall | §5.3, p. 197-198 | Leí. |
| 13 | Poisson: media = varianza = λ. | Formal, Formula Poisson | soong | §6.3, ecs. 6.46-6.47, p. 176 | Leí la deducción; NIST §1.3.6.6.19 da media λ y desvío √λ. |
| 14 | pmf de Poisson: λ^k e^(−λ)/k!. | Formal | nist-distribuciones | §1.3.6.6.19 | Abrí la página (curl) y leí la fórmula. Coincide con Soong ec. 6.45. |
| 15 | Con λ=12, P(X≥22)≈0,0061 (una hora de cada 165). | Formal, Poisson; Caso de apertura | cálculo propio | Python | 1−P(X≤21)=0,0060651. |
| 16 | Poisson aproxima a la binomial con λ=np; se usa con n mayor que 10 y p menor que 0,1. | Formal | soong | §6.3.2, p. 182-183 | Leí; reproduje el ejemplo 6.15 (0,2206 exacto vs 0,223). |
| 17 | Densidad normal con parámetros μ y σ; μ es la media y σ² la varianza. | Formal, Normal | soong | §7.2, ecs. 7.9 y 7.11, p. 196-198 | Leí. NIST §1.3.6.6.1 da μ y σ como parámetros de ubicación y escala. |
| 18 | Estandarización z=(x−μ)/σ. | Formal | mendenhall | §6.3, p. 225 | Leí. También MIT Reading 6b, §5.1. |
| 19 | En una normal: ≈68 % a 1σ, ≈95 % a 2σ, ≈99,7 % a 3σ. | Formal | mit1805 | Reading 6b, §5.3 | Leí; verifiqué con erf (0,6827; 0,9545; 0,9973). |
| 20 | Proceso con μ=120 ms y σ=20 ms normal: P(X>160)≈2,3 %. | Formal | cálculo propio | Python | z=2 → 0,02275. Datos ilustrativos. |
| 21 | La binomial se aproxima con N(np, √(npq)) si n es grande y p no está cerca de 0 ni 1. | Formal | mendenhall | §6.4, p. 237-238 | Leí; reproduje el ejemplo 6.11 (exacto 0,1905, normal 0,1891; el libro redondea 0,190). |
| 22 | Cajero A siempre 5 min, cajero B 1 o 9 min a partes iguales: medias 5 y 5, varianzas 0 y 16. | Intuición, Analogía | cálculo propio | a mano con la definición de varianza | (1−5)²·½+(9−5)²·½=16. Ilustrativo. |
| 23 | Tarjeta t-variable-aleatoria | tarjeta | mit1805 | Reading 4a, §2.2 | Misma definición que #1. |
| 24 | Tarjetas t-varianza-definicion, t-varianza-unidades, t-varianza-cero | tarjetas | mit1805 | Reading 5a, §3 (cero: Ejemplo 2 (iv), "W doesn't vary") | Leí. |
| 25 | Tarjeta t-varianza-escala: Var(aX)=a²Var(X) → ×10⁶ al pasar de s a ms. | tarjeta | mit1805 | Reading 5a, §3.3 | Cálculo 1000²=10⁶. |
| 26 | Tarjeta t-varianza-muestral-n-menos-1 | tarjeta | soong | §9.1.2, p. 262 | Igual que #7. |
| 27 | Tarjeta t-binomial-sin-reposicion | tarjeta | mendenhall | §5.2, ej. 5.2, p. 185-186 | Igual que #10. |
| 28 | Tarjetas t-binomial-media y t-binomial-varianza (200·0,03=6; np(1−p)) | tarjetas | mit1805 | Reading 5a, §3.4 y §4 (tabla) | Leí la tabla. |
| 29 | Tarjetas t-poisson-media-varianza | tarjeta | soong | §6.3, p. 176 | Igual que #13. |
| 30 | Tarjetas t-poisson-independencia y t-z-score | tarjetas | mendenhall | §5.3, p. 198; §6.3, p. 225 | Igual que #12 y #18. |
| 31 | Tarjeta t-poisson-vs-binomial | tarjeta | soong | §6.3.2, p. 183 | Igual que #16. |
| 32 | Tarjeta t-regla-95 | tarjeta | mit1805 | Reading 6b, §5.3 | Igual que #19. |
| 33 | e-poisson-ticket-raro: P(X≥22)=0,61 %; errores comunes P(X=22)=0,30 % y P(X≥21)=1,16 %. | ejercicio | soong | §6.3, ec. 6.45 (pmf) | Cálculo propio; 1−0,993935=0,0060651; P(22)=0,0030178; P(≥21)=0,011598. |
| 34 | e-binomial-servidores: 7,84 %; errores P(X=3)=6,07 % y Poisson λ=1 → 8,03 %. | ejercicio | mendenhall | §5.2, p. 186 (fórmula binomial) | Cálculo propio: 0,3642+0,3716+0,1858=0,9216. |
| 35 | e-varianza-binomial: 200·0,03·0,97=5,82; errores 6 y 2,41. | ejercicio | mit1805 | Reading 5a, §3.4 | Cálculo directo. √5,82=2,4125. |
| 36 | e-varianza-tabla: μ=1,6; E[X²]=3,4; Var=0,84; errores 3,4 y 0,9165. | ejercicio | mendenhall | §4.8, p. 167 | Cálculo propio con la definición; el libro trae el mismo tipo de tabla. |
| 37 | e-normal-z-score: z=2, P(Z>2)=2,28 %; error 4,55 %. | ejercicio | mendenhall | §6.3, p. 225 | Cálculo propio con erf: 0,02275 y 0,04550. |
| 38 | e-elegir-distribucion: Poisson para tickets por hora. | ejercicio | mendenhall | §5.3, p. 197 (llegadas por minuto, llamadas) | Leí los ejemplos de uso del libro. |
| 39 | e-vf-duplicar-varianza: Var(2X)=4Var(X). | ejercicio | mit1805 | Reading 5a, §3.3 prop. 2 | Leí. |
| 40 | c-rafaga-de-tickets: P(≥22)≈0,6 %; en 40 horas la chance de ver alguna hora así es ≈21,6 %. | caso | mendenhall | §5.3, p. 198 (supuestos Poisson) | Cálculo propio: 1−(1−0,006065)^40=0,2160. Escenario, la VPN y los 17 de 22 tickets son ficticios. |

### Fuentes del tema
- `mit1805`: Orloff y Bloom, *18.05 Introduction to Probability and Statistics*, MIT OpenCourseWare, Spring 2022 (CC BY-NC-SA). Acceso: PDF libre; usé Reading 4a (`mit18_05_s22_class04-prep-a.pdf`), 5a (`…class05-prep-a.pdf`) y 6b (`…class06-prep-b.pdf`) en https://ocw.mit.edu/courses/18-05-introduction-to-probability-and-statistics-spring-2022/. Leídos completos.
- `soong`: T. T. Soong, *Fundamentals of Probability and Statistics for Engineers*, Wiley, 2004. Acceso: copia en PDF de la biblioteca del dueño; leí §4.1.2, §6.1.1, §6.3, §6.3.2, §7.2 y §9.1.2. Ojo: en esa copia las letras griegas y los signos de las fórmulas salieron mal en la extracción de texto, así que verifiqué las fórmulas con las lecturas de MIT, con NIST y con cálculo propio.
- `mendenhall`: Mendenhall, Beaver y Beaver, *Introducción a la probabilidad y estadística*, 13.ª ed. en español, Cengage Learning, 2010 (traducción de *Introduction to Probability and Statistics*, 13th ed.). Acceso: copia en PDF de la biblioteca del dueño; leí §2.3, §4.8, §5.2, §5.3, §6.3 y §6.4.
- `nist-distribuciones`: NIST/SEMATECH e-Handbook of Statistical Methods, §1.3.6.6.18 (`eda366i.htm`) y §1.3.6.6.19 (`eda366j.htm`, es la URL del frontmatter). Acceso: web, leídas.

### Números y datos inventados para ejemplos
- 12 tickets por hora, 22 tickets en la última hora, 17 de 22 con VPN: ilustrativos.
- Flota de 50 servidores con 2 % de falla mensual; 200 pedidos con 3 % de devolución; técnico con 0-3 tickets por turno; proceso batch de 120 ms y σ=20 ms: ilustrativos.

## tcl-e-intervalos
| # | Afirmación clave (tu paráfrasis) | Dónde está | Fuente (id) | Ubicación exacta | Cómo la verificaste |
|---|---|---|---|---|---|
| 1 | La media de n datos independientes tiene media μ y varianza σ²/n. | Formal, La media muestral | soong | §9.1.1, p. 261, ecs. 9.5-9.6 | Leí la deducción. |
| 2 | El desvío de la media, σ/√n, es el error estándar. | Formal | mendenhall | §7.5, p. 267 | Leí la definición. |
| 3 | Ley de los grandes números: P(|X̄n−μ|<a)→1. | Formal | mit1805 | Reading 6b, §3 y §3.1 | Leí. |
| 4 | TCL: X̄≈N(μ,σ²/n) y Z_n≈N(0,1) para n grande, con v.a. i.i.d. de media y varianza finitas. | Formal, Formula TCL | mit1805 | Reading 6b, §5.2 | Leí. |
| 5 | La versión formal: la función de distribución de Z_n converge a la normal estándar. | Formal | soong | §7.2.1, Teorema 7.1, p. 199 | Leí el enunciado y la prueba. |
| 6 | Población normal → X̄ normal para todo n; simétrica → n chico; asimétrica → n≥30 como guía, con más (50-100 en el ejemplo exponencial) si la asimetría es fuerte. | Formal | mendenhall; mit1805 | Mendenhall §7.4, p. 266-267; MIT Reading 23b, §4, ejemplo 3 | Leí las guías y la conclusión de MIT ("n entre 50 y 100 es suficiente para la mayoría de los usos"). |
| 7 | Con exponenciales, el IC de 95 % cubre 90,5 % con n=20 y 93,8 % con n=100. | Formal | mit1805 | Reading 23b, §4, ejemplo 3 (tabla) | Leí la tabla; reproduje con simulación propia: 0,906 (n=20) y 0,937 (n=100), 20.000 réplicas. |
| 8 | IC z para la media: x̄ ± z_{α/2}σ/√n (datos normales, σ conocida). | Formal, Formula IC | mit1805 | Reading 22, §4.1 | Leí. Mendenhall §8.5 p. 310 da la misma fórmula. |
| 9 | Con σ desconocida y n≥30 se usa s. | Formal | mendenhall | §8.5, p. 310 | Leí el recuadro. |
| 10 | Con datos normales y σ desconocida, t con n−1 grados de libertad. | Formal | mit1805 | Reading 23a, §3.2 | Leí. |
| 11 | Caso: SE=22/√40=3,48; margen 6,8; IC [31,2; 44,8]. | Formal y Caso de apertura | cálculo propio | Python (z=1,96) | 3,4785; 6,8177; 31,18-44,82. Datos ilustrativos. |
| 12 | SE de la diferencia de dos medias: √(s₁²/n₁+s₂²/n₂). | Formal | mendenhall | §8.6, p. 318-319 | Leí. |
| 13 | Con 40+40 tickets y s=22: SE=4,92; diferencia 3 ± 9,6 (IC [−6,6; 12,6]). | Formal y caso c-informe-del-jueves | cálculo propio | Python | 4,9193; 9,6417. |
| 14 | El 95 % describe al procedimiento: 19 de 20 intervalos contienen la media. | Formal | mendenhall | §8.5, p. 311-312 | Leí. |
| 15 | La media es fija y el intervalo es aleatorio. | Formal | soong | §9.3.2, p. 295 | Leí el comentario tras la ec. 9.127. |
| 16 | La confianza nunca es la probabilidad de que el parámetro esté en el intervalo ya calculado. | Formal | mit1805 | Reading 22, §3 (advertencia 4) | Leí. |
| 17 | n se obtiene de z_{α/2}·SE=B. | Formal | mendenhall | §8.9, p. 330-331 | Leí el recuadro "Mi entrenador personal". |
| 18 | σ=22, B=2, 95 %: n≥464,8 → 465. | Formal | cálculo propio | Python | (1,96·22/2)²=464,83. |
| 19 | Márgenes para n=40, 100, 465, 1000: 6,8; 4,3; 2,0; 1,4. | Formal, tabla | cálculo propio | Python | 6,818; 4,312; 1,9996; 1,3635. |
| 20 | IC conservador de una proporción x̄ ± z/(2√n); regla práctica ±1/√n. | Formal | mit1805 | Reading 23b, §3.1 y §3.3 | Leí. |
| 21 | El promedio de muchas mediciones es mejor estimación; el sesgo de muestreo no se corrige con más datos. | Intuición, Analogía y Ojo | mit1805 | Reading 6b, §2 y §2.1 | Leí. La analogía del termómetro es mía. |
| 22 | Cuadruplicar n reduce el margen a la mitad. | Intuición, Formal, tarjeta, ejercicio | mendenhall | §8.9, p. 330 (margen=zσ/√n) | Consecuencia directa de la fórmula; Mendenhall ejercicio 8.28 (p. 316) lo pide. |
| 23 | Tarjeta t-media-es-aleatoria y t-media-varianza-sobre-n | tarjetas | soong | §9.1.1, p. 261 | Igual que #1. |
| 24 | Tarjeta t-error-estandar | tarjeta | mendenhall | §7.5, p. 267 | Igual que #2. |
| 25 | Tarjetas t-cuadruplicar-n, t-ic-ancho-confianza (el z crece), t-tcl-poblacion-asimetrica, t-ic-interpretacion | tarjetas | mendenhall | §8.9 p. 330; §8.5 p. 313 (z=2,58 para 99 %); §7.4 p. 266; §8.5 p. 311-312 | Leí. El 99 % usa 2,58 > 1,96, así que el intervalo se ensancha. |
| 26 | Tarjetas t-tcl-enunciado, t-ic-formula, t-t-student, t-regla-pulgar-proporcion, t-sesgo-muestreo | tarjetas | mit1805 | Reading 6b §5.2; Reading 22 §4.1; Reading 23a §3.2; Reading 23b §3.3; Reading 6b §2.1 | Igual que #4, #8, #10, #20, #21. Ejemplo de la tarjeta: 1/√100=0,1. |
| 27 | e-error-estandar-tickets: 3,48; error 0,55 (22/40). | ejercicio | mendenhall | §7.5, p. 267 | Cálculo propio. |
| 28 | e-margen-95: 6,8. | ejercicio | mit1805 | Reading 22, §4.1 | Cálculo propio. |
| 29 | e-tamano-muestra: 465; errores 21,56 y 327 (z=1,645). | ejercicio | mendenhall | §8.9, p. 330-331 | (1,645·22/2)²=327,4. |
| 30 | e-regla-pulgar-reabiertos: 1/√400=0,05 → 5 puntos; error 0,25 puntos. Es cota conservadora: con p̂=18 % el margen exacto es 1,96·√(0,18·0,82/400)=3,8 puntos. | ejercicio | mit1805 | Reading 23b, §3.1 y §3.3 | Cálculo propio (3,76 puntos). |
| 31 | e-interpretar-ic: el 95 % describe el método. | ejercicio | mendenhall | §8.5, p. 311-312 | Igual que #14. |
| 32 | e-vf-tcl-n5 y e-vf-cuadruplicar | ejercicios | mendenhall | §7.4 p. 266; §8.9 p. 330 | Igual que #6 y #22. |
| 33 | c-informe-del-jueves: IC de la diferencia incluye 0; para margen 2 con la diferencia hacen falta ≈930 por mes. | caso | mendenhall | §8.6, p. 318-319; §8.9, p. 331 | Cálculo propio: n=2·(1,96·22/2)²=929,7; con 930 el margen es 1,9996. Datos ficticios. |

### Fuentes del tema
- `mit1805`: Readings 6b (`…class06-prep-b.pdf`), 22 (`…class22-prep.pdf`), 23a (`…class23-prep-a.pdf`) y 23b (`…class23-prep-b.pdf`) en https://ocw.mit.edu/courses/18-05-introduction-to-probability-and-statistics-spring-2022/. Leídas completas.
- `mendenhall`: ver arriba; en este tema, §7.4-7.5, §8.5, §8.6, §8.9 y los ejercicios 8.27-8.29.
- `soong`: ver arriba; en este tema, §7.2.1, §9.1.1 y §9.3.2. Mismo problema con las fórmulas de la copia.
- `mathlets-intervalos` (verMas): MIT Mathlets, applet "Confidence intervals" (https://mathlets.org/mathlets/confidence-intervals/). Lo menciona la propia Reading 22 y la URL respondió 200; no respalda ningún dato.

### Números y datos inventados para ejemplos
- 41 y 38 minutos; 40 tickets; desvío 22 minutos; 400 tickets con 18 % reabiertos: ilustrativos.

## pruebas-de-hipotesis-ab
| # | Afirmación clave (tu paráfrasis) | Dónde está | Fuente (id) | Ubicación exacta | Cómo la verificaste |
|---|---|---|---|---|---|
| 1 | La prueba z de dos proporciones usa p̂ conjunta en el error estándar. | Formal, Formula z | mendenhall | §9.6, p. 373-374 | Leí el recuadro. Reproduje su ejemplo 9.12 (z=3,41). |
| 2 | Requiere muestras aleatorias independientes y n·p̂, n·q̂ mayores que 5 en los dos grupos. | Formal | mendenhall | §9.6, p. 374 ("Suposiciones") | Leí. |
| 3 | Caso: p̂=0,095; SE=0,0239; z=1,25; p de dos colas≈0,21. | Formal | cálculo propio | Python | z=1,2531; p=0,2102 (dos colas), 0,1051 (una cola). |
| 4 | Definición de p-valor: probabilidad, suponiendo la nula, de datos al menos tan extremos; se rechaza si p<α. | Formal | mit1805 | Reading 17b, §7 | Leí la definición y el "P-test". |
| 5 | Los métodos frecuentistas no dan la probabilidad de la hipótesis. | Formal | mit1805 | Reading 20, §5 ("Mind your p's") | Leí. |
| 6 | No rechazar ≠ aceptar. | Formal | mendenhall | §9.3, p. 356 | Leí. MIT 17b §3.1 lo dice igual. |
| 7 | Error tipo I (prob. α), tipo II (β), potencia = 1−β. | Formal | mit1805 | Reading 17b, §4.2-4.3 | Leí. Mendenhall §9.3 p. 356 da las mismas definiciones. |
| 8 | La potencia sube con más datos y con efectos mayores; el n se calcula de antemano. | Formal y Ojo | mit1805 | Reading 17b, §4.3 (efecto más lejos) y §4.4.2 (más datos; determinar el n de antemano) | Leí. |
| 9 | Con 8 % vs 11 % y 300 por grupo la potencia es ≈24 %; para 80 % hacen falta ≈1500 por grupo, con la fórmula usual de tamaño de muestra por potencia. | Formal y Profundizar | nist-handbook; mendenhall; cálculo propio | NIST §7.2.4.2 (fórmula de una proporción, derivación en Fleiss, Levin y Paik pp. 30-34); Mendenhall §9.6 p. 373-374 (proporción conjunta bajo la nula) | Leí la página de NIST. Para dos grupos el término de la nula usa √(2p̄(1−p̄)). Cuenta mía: n=1498,4 con z_β=0,8416; potencia con 300 por grupo 0,2402 y con 1500 por grupo 0,8004; Monte Carlo 8.000 réplicas con n=300: 0,234. |
| 10 | Significativo (p<α) solo dice que, sin efecto, un resultado tan extremo sería poco común; no que el efecto sea grande o valga la pena. | Formal | mit1805; mendenhall | MIT Reading 17b, §7 (definición de p-valor); Mendenhall §9.5, p. 370 | Leí ambos. Corregida la redacción anterior ("probablemente no fue casualidad") por la definición de MIT. El ejemplo de "millones de visitas" es mío. |
| 11 | Cada prueba con α=0,05 rechaza 5 % de las veces una nula verdadera; con 20 métricas independientes, P(al menos una)=1−0,95²⁰≈0,64. | Formal | mit1805 | Reading 17b, §4.3 (definición de α); el 0,64 es cálculo propio | 1−0,95^20=0,6415. Supone independencia, y el texto lo dice. |
| 12 | El p-valor depende de la regla de parada: con los mismos datos, 0,11 vs 0,03. | Formal | mit1805 | Reading 20, §6 | Leí; los p son 0,1094 y 0,0313. |
| 13 | Con monitoreo continuo los p-valores e intervalos habituales no son confiables; incluso con 10.000 muestras el error tipo I puede multiplicarse por cinco. | Formal y Ojo | johari-peeking | resumen e introducción (p. 3 del PDF) | Descargué el PDF y leí el resumen y la introducción. **No leí el resto del paper.** |
| 14 | Simulación A/A (10 % vs 10 %, hasta 3000 por grupo, prueba z de dos proporciones con p̂ conjunta, dos colas, α=0,05, cortar con el primer p<0,05; miradas equiespaciadas): 1 mirada 4,9 %; 2 miradas 8,4 %; 5 miradas 13,8 %; 30 miradas 28,1 %. **El 28 % es de mi simulación, no de Johari.** | Formal, tabla; ejercicio e-peeking-falsos-positivos | cálculo propio | Python, 40.000 repeticiones por fila, semilla 2026 fijada una sola vez (ver el script al final de esta sección) | Ruido de simulación ≈±0,2 puntos; corrí también 1.500 por mirada (2 miradas) y 500 por mirada (6 miradas, 15,4 %). |
| 15 | Hipótesis nula como "acusado inocente"; no culpable no prueba inocencia. | Intuición, Analogía | mit1805 | Reading 17b, §4.3 (analogía del juicio) | La idea es de la lectura; la redacción y el mapeo son míos. |
| 16 | Tarjetas t-hipotesis-nula, t-pvalor-definicion, t-pvalor-no-es, t-pvalor-no-es-prob-nula (qué NO es el p-valor: no es P(H0\|datos)), t-nivel-significancia, t-error-tipo-ii, t-potencia, t-regla-de-parada | tarjetas | mit1805 | Reading 17b §3.1, §7, §4.2-4.3; Reading 20 §5 y §6 | Igual que #4, #5, #7, #12. |
| 17 | Tarjetas t-potencia-n, t-no-rechazar, t-significativo-importante (dorso corregido: "un resultado así sería raro si no hubiera efecto"), t-condicion-prueba-z | tarjetas | mendenhall | §9.3 p. 356; §9.5 p. 370; §9.6 p. 374 | Igual que #2, #6, #10. |
| 18 | Tarjeta t-peeking | tarjeta | johari-peeking | resumen | Igual que #13. |
| 19 | Tarjeta t-metricas-multiples (≈64 %) | tarjeta | mit1805 | Reading 17b, §4.3 | Igual que #11. |
| 20 | e-z-boton-verde: z=1,25; errores 1,77 (SE de un solo grupo) y 0,03. | ejercicio | mendenhall | §9.6, p. 374 | Cálculo propio: 0,03/0,016929=1,772. |
| 21 | e-pvalor-boton-verde: 21,1 % (dos colas); error 10,6 %. | ejercicio | mendenhall | §9.3, p. 352 (p dos colas = 2×cola) | 2·(1−Φ(1,25))=0,2113. |
| 22 | e-z-test-grande: z=2,86 (400/4000 vs 480/4000); error 4,04. | ejercicio | mendenhall | §9.6, p. 374 | Cálculo propio: 0,02/0,006996=2,859; p=0,0043. |
| 23 | e-metricas-multiples: 64,2 %; errores 5 y 100. | ejercicio | mit1805 | Reading 17b, §4.3 | 1−0,95^20=0,6415. |
| 24 | e-interpretar-pvalor | ejercicio | mit1805 | Reading 17b, §7; Reading 20, §5 | Igual que #4 y #5. |
| 25 | e-peeking-falsos-positivos: la respuesta correcta es "queda claramente por encima del 5 %"; el 28 % de la explicación es de la simulación propia #14 (y así lo dice la explicación). | ejercicio | johari-peeking; cálculo propio | resumen e introducción; simulación #14 | Igual que #13 y #14. |
| 26 | e-vf-no-significativo-iguales | ejercicio | mendenhall | §9.3, p. 356 | Igual que #6. |
| 27 | c-cortar-el-test: día 3 con 48 vs 70 sobre 600 (z=2,13; p=0,033); final 126 vs 165 sobre 1500 (z=2,41; p=0,016; IC de la diferencia 0,5 a 4,7 puntos). | caso | johari-peeking | resumen (principio); números: cálculo propio | Python: z=2,1328 (p=0,0329); z=2,4059 (p=0,0161); IC sin conjuntar [0,0048; 0,0472]. Todo ficticio. |

### Fuentes del tema
- `mit1805`: Readings 17b (`…class17-prep-b.pdf`), 20 (`…class20-prep.pdf`) y 22 en https://ocw.mit.edu/courses/18-05-introduction-to-probability-and-statistics-spring-2022/. Leídas.
- `mendenhall`: ver arriba; en este tema, §9.3, §9.5, §9.6 (p. 351-352, 356, 370, 373-376).
- `nist-handbook`: NIST/SEMATECH e-Handbook, §7.2.4.2 "Sample sizes required" (https://www.itl.nist.gov/div898/handbook/prc/section2/prc242.htm). Acceso: web, leída; trae la fórmula de una proporción y remite a Fleiss, Levin y Paik, pp. 30-34, que no abrí.
- `johari-peeking`: R. Johari, L. Pekelis y D. J. Walsh, *Always Valid Inference: Bringing Sequential Analysis to A/B Testing*, preprint arXiv:1512.04922 (v3, 2019), https://arxiv.org/abs/1512.04922. Acceso: PDF descargado; leí resumen e introducción. El esquema de fuentes no tiene un tipo "paper", así que lo cargué como `doc-oficial`.

### Números y datos inventados para ejemplos
- 300 visitas por versión, 24 y 33 compras; 4000 visitas por versión; 20 métricas; test planificado de 1500 por versión y sus resultados parciales: ilustrativos.

Script de la simulación de peeking (tabla del Formal), tal como la corrí:

```python
import random
from math import sqrt
random.seed(2026)                      # una sola vez, antes de las cinco corridas
def peek(p, step, maxn, reps):
    hit = 0
    for _ in range(reps):
        c1 = c2 = n = 0
        while n < maxn:
            c1 += random.binomialvariate(step, p); c2 += random.binomialvariate(step, p); n += step
            pp = (c1 + c2) / (2 * n)
            if pp in (0, 1): continue
            z = (c2 - c1) / n / sqrt(pp * (1 - pp) * 2 / n)
            if abs(z) > 1.96: hit += 1; break   # dos colas, alfa 0,05
    return hit / reps
for step in (100, 600, 3000, 500, 1500):        # 30, 5, 1, 6 y 2 miradas
    print(step, peek(0.10, step, 3000, 40000))
```
Resultado: 28,1 % (30 miradas), 13,8 % (5), 4,9 % (1), 15,4 % (6), 8,4 % (2). El verificador F4 la reprodujo con su propio código: 28,1 / 14,0 / 4,9 / 8,2 %.

## bayes-falsos-positivos
| # | Afirmación clave (tu paráfrasis) | Dónde está | Fuente (id) | Ubicación exacta | Cómo la verificaste |
|---|---|---|---|---|---|
| 1 | Teorema de Bayes: P(B\|A)=P(A\|B)P(B)/P(A); P(A) sale de la ley de probabilidad total. | Formal | mit1805 | Reading 3, §7 | Leí la fórmula y la demostración. |
| 2 | Bayes permite pasar de P(A\|B) a P(B\|A). | Formal | soong | §2.4, Teorema 2.2, p. 25 (ecs. 2.28-2.29) | Leí. |
| 3 | Bayes con subpoblaciones S_i y ley de probabilidad total. | Formal | mendenhall | §4.7, p. 159-160 | Leí; el ejemplo 4.24 del libro reproduce 0,1409 en el cálculo. |
| 4 | Falso positivo y falso negativo son probabilidades condicionales. | Formal | mendenhall | §4.7, p. 160 | Leí. |
| 5 | Especificidad = 1 − tasa de falsos positivos; sensibilidad = tasa de verdaderos positivos. | Formal | mit1805 | Reading 3, §7.1 (ejemplo 11) | Leí. Los nombres "sensibilidad", "especificidad" y "VPP" son los usuales; la lectura dice *true positive rate* y *true negative rate*. |
| 6 | VPP=P(D+\|T+) con la fórmula de Bayes. | Formal, Formula VPP | mit1805 | Reading 3, §7.1 | Leí; es P(D+\|T+) del ejemplo 11. |
| 7 | Caso: prevalencia 0,5 %, sensibilidad 98 %, falsos positivos 2 % → 0,0049/0,0248=19,76 %. | Formal y Caso de apertura | cálculo propio | Python y a mano | 0,19758. Datos ilustrativos. |
| 8 | Falacia de la tasa base: test que acierta 95 % no implica positivos acertados 95 %. | Formal | mit1805 | Reading 3, §7.1 | Leí el ejemplo 11 (8,3 % con 0,5 %, 5 % y 10 %). |
| 9 | Tabla de 10.000: 49 / 199 / 248; 1 / 9751 / 9752. | Formal, tabla | cálculo propio | Python | 49+1=50; 9950·0,02=199; 9950−199=9751. Mismo método de tabla que MIT 3 §7.1. |
| 10 | Odds posteriores = factor de Bayes × odds previos. | Formal, Formula odds | mit1805 | Reading 12b, §4 | Leí la deducción. |
| 11 | Odds previos 0,005/0,995≈0,005; factor 49; odds posteriores 0,246 ⇒ 19,8 %. | Formal | cálculo propio | Python | 0,24623 → 0,19758. |
| 12 | Los factores de Bayes se multiplican si las alertas son condicionalmente independientes dado el estado real (P(D1,D2\|H)=P(D1\|H)P(D2\|H) para cada hipótesis); entonces el VPP pasa de 19,8 % a ≈92,3 %. Dos alertas sobre el mismo archivo no son independientes a secas. | Formal, Profundizar; tarjeta t-evidencia-independiente; caso c-alerta-del-edr | mit1805 | Reading 12b, §4.1 ("Updating again and again") | Leí la definición de independencia condicional y el comentario de los dados. Cálculo propio: 0,92346. La aclaración sobre motores con las mismas firmas (errores correlacionados) es mía. |
| 13 | Con prevalencia baja, la especificidad pesa más que la sensibilidad: con los números del caso, sensibilidad 98→99,9 % deja el VPP en 20 %; falsas alarmas 2→0,1 % lo sube a 83 % (el texto lo dice con esos números y lo rotula "cuenta propia"). | Intuición | cálculo propio | Python | Subir sensibilidad 98→99,9 % deja el VPP en 20,1 %; bajar falsas alarmas 2→0,1 % lo lleva a 83,1 %. |
| 14 | Detector de humo y tostadas. | Intuición, Analogía | — | analogía propia | No afirma datos. |
| 15 | Tarjetas t-p-a-dado-b-vs-b-dado-a, t-sensibilidad, t-especificidad, t-vpp-definicion, t-falacia-tasa-base, t-vpp-baja-prevalencia, t-frecuencias-naturales | tarjetas | mit1805 | Reading 3, §7 y §7.1 | Igual que #1, #5, #6, #8, #9. |
| 16 | Tarjetas t-bayes-formula | tarjeta | soong | §2.4, p. 25 | Igual que #2. |
| 17 | Tarjetas t-ley-prob-total y t-falso-positivo | tarjetas | mendenhall | §4.7, p. 159-160 | Igual que #3 y #4. |
| 18 | Tarjetas t-factor-bayes y t-evidencia-independiente | tarjetas | mit1805 | Reading 12b, §4 y §4.1 | Igual que #10 y #12. |
| 19 | e-vpp-antivirus: 49/248=19,8 %; errores 98 y 2. | ejercicio | mit1805 | Reading 3, §7.1 | Cálculo propio. |
| 20 | e-falsas-alarmas-dia: 9950·0,02=199; errores 49 y 248. | ejercicio | mit1805 | Reading 3, §7.1 (método de tabla) | Cálculo propio. |
| 21 | e-vpp-prevalencia-alta: 980/(980+180)=84,5 %. | ejercicio | mit1805 | Reading 3, §7.1 | 0,84483. |
| 22 | e-prevalencia-minima: VPP 50 % ⇒ prevalencia 2,0 %. | ejercicio | mit1805 | Reading 12b, §4 (odds posteriores = BF × odds previos) | Despeje propio: prior odds=1/49 ⇒ p=1/50=0,02; chequeado con ppv(0,02, 0,98, 0,98)=0,5. |
| 23 | e-mejorar-especificidad: 49/(49+9,95)=83,1 %. | ejercicio | mit1805 | Reading 3, §7.1 | 0,83121. |
| 24 | e-leer-sensibilidad | ejercicio | mit1805 | Reading 3, §7.1 | Igual que #5. |
| 25 | e-vf-99-99: con prevalencia 1/1000, el VPP ≈ 9,0 %. | ejercicio | mit1805 | Reading 3, §7.1 | 0,09016. |
| 26 | c-alerta-del-edr: VPP casi 20 %; reaccionar según la tasa base; repetir el mismo escaneo no suma evidencia nueva porque sus errores están correlacionados con los del primero. | caso | mit1805 | Reading 3, §7.1 y Reading 12b, §4.1 | Cálculo propio. Escenario ficticio. |

### Fuentes del tema
- `mit1805`: Readings 3 (`…class03-prep.pdf`) y 12b (`…class12-prep-b.pdf`) en https://ocw.mit.edu/courses/18-05-introduction-to-probability-and-statistics-spring-2022/. Leídas completas. Problema recomendado: Class 11 in-class problems, Problem 1 (`…class11_pset.pdf`).
- `mendenhall`: ver arriba; en este tema, §4.7 (p. 158-162). El ejercicio 4.79 ("exámenes de selección") no lo recomiendo porque la tabla de su enunciado salió ilegible en la copia; recomiendo 4.74 y 4.77.
- `soong`: ver arriba; en este tema, §2.4 (p. 24-25) y el problema 2.31 (p. 34).

### Números y datos inventados para ejemplos
- Prevalencia de 0,5 %, sensibilidad de 98 % y 2 % de falsa alarma de un antivirus: ilustrativos (no corresponden a ningún producto).

## Lo que no pude verificar
- **Peeking**: leí el resumen y la introducción del preprint de Johari, Pekelis y Walsh, no el resto. El libro de referencia, Kohavi, Tang y Xu, *Trustworthy Online Controlled Experiments* (Cambridge, 2020), no lo tuve. Los porcentajes de falsos positivos con miradas repetidas son de mi simulación.
- **Fórmula del tamaño de muestra por potencia** (Profundizar de pruebas-de-hipotesis-ab): es la fórmula usual (NIST §7.2.4.2 da la de una proporción); la adaptación a dos grupos con proporción conjunta la comprobé con Monte Carlo y no abrí Fleiss, Levin y Paik, que NIST cita para la derivación.
- **Soong**: la extracción de texto de la copia perdió símbolos matemáticos; las fórmulas las contrasté con MIT, NIST y cálculo propio.
- **Khan Academy**: su sitio no devuelve contenido a un lector automático, así que no la cité.
- **OpenIntro Statistics, Blitzstein-Hwang y OpenStax**: no los abrí; no están citados.

## Libros que conviene pedirle al dueño
- Kohavi, Tang y Xu, *Trustworthy Online Controlled Experiments* (Cambridge University Press, 2020): para respaldar con un libro lo de mirar el test a cada rato (*peeking*) y otros problemas de A/B (efecto de novedad, tamaño de muestra, SRM).
- Ross, *A First Course in Probability* (Pearson, 10.ª ed., 2019) o Ross, *Introduction to Probability and Statistics for Engineers and Scientists* (6.ª ed., 2021): es la bibliografía clásica citada en el plan y no la pude abrir.
- Walpole, Myers, Myers y Ye, *Probabilidad y estadística para ingeniería y ciencias* (Pearson, 9.ª ed.): como segundo libro de cátedra.
- Montgomery y Runger, *Applied Statistics and Probability for Engineers*: para intervalos, pruebas y tamaño de muestra con ejemplos de ingeniería.

## Pedidos al director
- **Tipo de fuente para papers**: el esquema solo tiene libro, doc-oficial, curso-abierto, video y blog. Cargué el preprint de arXiv de Johari et al. como `doc-oficial`. Si querés distinguirlo, haría falta un tipo `paper`.
- **Simuladores**: usé `SimDistribucion` (2 usos), `SimInferencia` (3 usos: `tcl`, `intervalos`, `ab`) y `SimBayes` (1 uso). No pedí ningún simulador nuevo. Para v2, útil: un modo de `SimInferencia` con "mirar a cada rato" (peeking) que corra tests A/A con cortes tempranos.
- **Prerrequisitos**: `tcl-e-intervalos` depende de `variables-y-distribuciones` y `pruebas-de-hipotesis-ab` de `tcl-e-intervalos`; los tres existen en esta área. `bayes-falsos-positivos` no tiene prerrequisitos.
- **Modo estricto** (`CAMPUS_ESTRICTO=1 npm run build`): en este worktree solo falla por las otras cinco áreas, que todavía no tienen temas (reglas I12 e I13). Esta área no genera ningún error.
- **Valores numéricos en los ejercicios**: usé `unidad: ""` para los adimensionales y `unidad: "%"` cuando la respuesta se da en porcentaje.
