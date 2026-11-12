# FUENTES — Matemática y física aplicadas
- Escritor: F3-matematica-fisica · Fecha: 2026-11-11

Convenciones de este archivo. Las páginas de libros son las **impresas**, no el índice del PDF. "PDF libre" = descargado de la página oficial y leído con `pdftotext`; "biblioteca del dueño" = PDF local leído con `pdftotext` y, para Stewart y Zill, además se miró la imagen de la página para confirmar el número impreso. "Cuenta propia" = derivación mía, verificada con Python (`python3 -I`), no tomada de la fuente: F4 puede mirarla con ojo crítico. Ninguna cita de este archivo copia texto: son paráfrasis.

---

## derivadas-y-gradiente

| # | Afirmación clave (tu paráfrasis) | Dónde está | Fuente (id) | Ubicación exacta | Cómo la verificaste |
|---|---|---|---|---|---|
| 1 | La derivada en a es el límite del cociente incremental, si existe. | Formal §La derivada | openstax-calc1 | §3.1 | Abrí la página; da las dos formas del límite. |
| 2 | Es la pendiente de la tangente y la razón de cambio instantánea. | Formal §La derivada | openstax-calc1 | §3.1 | Ídem; define tangente e instantánea con el mismo límite. |
| 3 | La derivada de x^n es n·x^(n−1) y la de x² es 2x. | Formal §La derivada | mml | §5.1, ejemplo 5.2, p. 142 | Leí el ejemplo en el PDF libre. El caso x² es el n=2. |
| 4 | El gradiente junta las derivadas parciales en un vector (Stewart lo define para 2 variables y lo extiende a 3; para n variables, MML). | Formal §Varias variables | stewart-multi / mml | stewart §14.6, def. 8, p. 936 y ec. 13, p. 938; mml §5.2, def. 5.5, p. 146 | Biblioteca del dueño; imagen de la p. 936 y texto de la p. 938. MML: def. 5.5 para n variables. |
| 5 | Libros distintos escriben el gradiente como fila o columna. | Formal (fórmula Gradiente) | mml | §5.2, def. 5.5 y observación, pp. 146-147 | Leí la observación "Gradient as a Row Vector". |
| 6 | El gradiente señala hacia donde f crece más rápido y esa rapidez es su norma. | Formal §Varias variables | stewart-multi | §14.6, teorema 15, p. 939 | Imagen de la p. 939; el teorema lo dice. |
| 7 | En la dirección contraria al gradiente decrece más rápido. | Formal §Varias variables | openstax-calc3 | §4.6, teorema 4.13 | Abrí la página; el mínimo de la derivada direccional es −‖∇f‖. |
| 8 | El gradiente es perpendicular a las curvas de nivel. | Formal §Varias variables | openstax-calc3 | §4.6, teorema 4.14 | Ídem. |
| 9 | Paso del descenso: x_{k+1} = x_k − γ∇f(x_k). | Formal §El algoritmo | mml | §7.1, ec. 7.6, p. 228 | Leí la ecuación y el texto (el libro usa gradiente fila y lo transpone). |
| 10 | Con tasa adecuada converge a un mínimo local, no necesariamente global. | Formal §El algoritmo | mml | §7.1, p. 228 | Leí "converges to a local minimum". |
| 11 | Tasa muy chica es lenta; muy grande se pasa, no converge o diverge. | Formal §El algoritmo | mml | §7.1.1, p. 229 | Leído. |
| 12 | Regla de la cadena para E'(w) del error cuadrático medio. | Formal §Un caso concreto | mml | §5.2, ejemplo 5.6, pp. 146-147 | El ejemplo usa la regla de la cadena; la derivada de E es cuenta propia, verificada numéricamente (E'(0) = −19,667 con los datos del ejercicio). |
| 13 | Caso de mínimos cuadrados con gradiente 2(Ax−b)ᵀA. | Formal §Un caso concreto | mml | §7.1, ejemplo 7.2, p. 230 | Leído. |
| 14 | Con f=x² el gradiente es 2x y, en la ecuación del paso, x_{k+1}=x_k−γ·2x_k=(1−2γ)x_k; de ahí la tabla (γ<0,5; 0,5-1; =1; >1). | Formal §Cuándo anda | mml | §7.1, ec. 7.6, p. 228 | La derivación se muestra en el cuerpo (sustituir el gradiente en la ec. 7.6). Chequeé con Python los cuatro regímenes y el valor −0,15552 del ejercicio. |
| 15 | Para f=(a/2)x² el gradiente es ax, el paso es (1−γa)x_k y converge si 0<γ<2/a. | Formal, Profundizar | mml | §7.1, ec. 7.6, p. 228 | Misma sustitución, mostrada en el cuerpo. |
| 16 | En valles largos y angostos el descenso hace zigzag y avanza despacio. | Formal, Profundizar | mml | §7.1, p. 229 | Leí la observación sobre mal condicionamiento. |
| 17 | Gradiente cero = punto crítico: puede ser mínimo local, máximo local o silla (origen de z=x²−y²); en una variable, x³ en 0. | Formal, cierre | openstax-calc3 | §4.7 (def. de punto crítico y de silla, ejemplo z=x²−y², teorema 4.17) | Abrí la página. El ejemplo x³ en 0 es mío (derivada 0 sin extremo). MML ej. 7.1 queda como complemento. |
| 18 | Con doble pozo, x0=2 y tasa 0,01 baja al mínimo local (≈1,13); con x0=−2 al global (≈−1,30). | Intuición (consigna del simulador) | (cuenta propia) | — | Python: 1,1309 y −1,3008. Coincide con SIMULADORES.md §2.1. |
| 19 | Tarjeta t-derivada-pendiente | tarjeta | openstax-calc1 | §3.1 | = fila 2. |
| 20 | Tarjeta t-derivada-limite | tarjeta | openstax-calc1 | §3.1 | = fila 1. |
| 21 | Tarjeta t-derivada-fondo-parabola (ahora solo pregunta cuánto vale la derivada en 0) | tarjeta | mml | §5.1, ej. 5.2, p. 142 | Derivada de x² = 2x; en 0 vale 0. |
| 22 | Tarjeta t-gradiente-definicion | tarjeta | stewart-multi | def. 8, p. 936 | = fila 4. |
| 23 | Tarjeta t-gradiente-direccion | tarjeta | stewart-multi | teorema 15, p. 939 | = fila 6. |
| 24 | Tarjeta t-gradiente-norma | tarjeta | stewart-multi | teorema 15, p. 939 | = fila 6. |
| 25 | Tarjeta t-descenso-signo | tarjeta | mml | §7.1, p. 228 | El gradiente apunta a la máxima subida (§5.1) y el paso resta. |
| 26 | Tarjeta t-tasa-chica | tarjeta | mml | §7.1.1, p. 229 | = fila 11. |
| 27 | Tarjeta t-tasa-grande | tarjeta | mml | §7.1.1, p. 229 | = fila 11. |
| 28 | Tarjeta t-factor-cuadratica | tarjeta | mml | §7.1, ec. 7.6, p. 228 | = fila 14. |
| 29 | Tarjeta t-minimo-local | tarjeta | mml | §7.1, p. 228 | = fila 10. |
| 30 | Tarjeta t-gradiente-cero | tarjeta | openstax-calc3 | §4.7 | = fila 17. |
| 31 | Ejercicio e-razon-de-cambio-costo: T'(500)=0,004·500=2. | ejercicio | openstax-calc1 | §3.1 | Python: cociente incremental con h=0,01 da 2,00002. |
| 32 | Ejercicio e-tres-pasos-de-descenso: x3=1,536. | ejercicio | mml | §7.1 | Python: 2,4; 1,92; 1,536. Errores: 5,184 (suma del gradiente). |
| 33 | Ejercicio e-tasa-que-rebota: x5=−0,15552. | ejercicio | mml | §7.1.1 | Python: −1,2; 0,72; −0,432; 0,2592; −0,15552. |
| 34 | Ejercicio e-paso-de-error-cuadratico: w1=0,983. | ejercicio | mml | §7.1, ej. 7.2 | Python: E'(0)=−19,667; w1=0,98333. |
| 35 | Ejercicio e-vf-gradiente-cero-minimo: falso. | ejercicio | openstax-calc3 | §4.7 | = fila 17. |
| 36 | Ejercicio e-om-que-hacer-si-diverge: bajar la tasa. | ejercicio | mml | §7.1.1, p. 229 | = fila 11. |
| 37 | Problema p-stewart-gradiente-evaluado | problema | stewart-multi | §14.6, ejercicios 7-10, p. 943 | Imagen de la p. 943: esos ejercicios piden gradiente, evaluarlo en P y razón de cambio. |
| 38 | Problema p-mml-puntos-estacionarios | problema | mml | ejercicio 7.1, p. 247 | Texto leído. Python: puntos estacionarios en −2±√5; desde x0=0 con tasa 0,01 converge a 0,236; desde −5 se escapa a −∞. |
| 39 | Problema p-planilla-mse (tasas 0,01; 0,05; 0,15; 0,25) | problema | mml | §7.1, ej. 7.2 | Python: w* = 29,5/14 = 2,107. E''(w)=28/3, factor por paso 1−γ·28/3 (0,907; 0,533; −0,400; −1,333). Tras 30 pasos: 1,9957; 2,10714; 2,10714; −11 797 (diverge). Límite 2/(28/3)=0,214. |

### Fuentes del tema
- `openstax-calc1`: Strang y Herman, *Calculus Volume 1*, OpenStax, 2016, §3.1. Acceso: página web abierta.
- `openstax-calc3`: Strang y Herman, *Calculus Volume 3*, OpenStax, 2016, §4.6 y §4.7. Acceso: página web abierta.
- `stewart-multi`: Stewart, *Cálculo de varias variables. Trascendentes tempranas*, 7.ª ed., Cengage, 2012, §14.6. Acceso: biblioteca del dueño (PDF).
- `mml`: Deisenroth, Faisal y Ong, *Mathematics for Machine Learning*, Cambridge University Press, 2020. Acceso: PDF libre (borrador del 15/01/2024); la numeración de páginas es la de ese PDF y puede diferir de la edición impresa.
- `khan-derivadas` y `3b1b-descenso` (para ver más): la URL de Khan salió de una búsqueda y no se abrió la página completa; del video confirmé el título, no el canal.

### Números y datos inventados para ejemplos
- Los ocho reportes (2 s por mil filas) del caso real y los tres puntos (1; 2), (2; 4), (3; 6,5) del ejercicio: ilustrativos.
- T(n)=0,002n² ms: ilustrativo.

---

## vectores-y-matrices

| # | Afirmación clave (tu paráfrasis) | Dónde está | Fuente (id) | Ubicación exacta | Cómo la verificaste |
|---|---|---|---|---|---|
| 1 | Las columnas de la matriz son las imágenes de los vectores de la base. | Formal §La matriz por un vector; Intuición | mml | §2.7, def. 2.19, p. 51 | Leí la definición: la columna j son las coordenadas de Φ(b_j). |
| 2 | Multiplicar una matriz por un vector es una transformación que lleva vectores a vectores. | Formal §La matriz por un vector | ocw-1806 | Lecture 30 | Solo leí la página de la clase (descripción); no vi el video ni la transcripción. |
| 3 | Matriz de rotación R(θ) (antihoraria). | Formal §Rotaciones | mml | §3.9.1, ec. 3.76, p. 92 | Leí las ecuaciones 3.75-3.76. |
| 4 | Las rotaciones conservan distancias y ángulos. | Formal §Rotaciones | mml | §3.9.4, p. 94 | Leído. |
| 5 | Matriz de escala diag(sx, sy). | Formal §Rotaciones | (cuenta propia) | — | Sale de aplicarla a î y ĵ. Python: S·(4,6)=(8;3). |
| 6 | Definición del producto fila por columna. | Formal §Componer | zill | §14.2, def. 14.2.3, p. 606 | Imagen de la p. 606. |
| 7 | (AB)v = A(Bv): primero actúa B. | Formal §Componer | (cuenta propia) | — | Consecuencia de la definición; Python: R·S·v=(−3;8) y S·R·v=(−12;2). |
| 8 | AB ≠ BA en general. | Formal §Componer | zill | §14.2, ejemplo 8, p. 607 | Imagen de la p. 607: el ejemplo 8 lo muestra. |
| 9 | Con escala igual en los dos ejes sí conmuta con la rotación. | Formal §Componer | (cuenta propia) | — | Una escala por un número c es cI y conmuta con cualquier matriz. |
| 10 | det A = ad − bc. | Formal §Determinante | zill / mml | zill §14.3, def. 14.3.1, p. 612; mml §4.1, ec. 4.6, p. 100 | Imagen de la p. 612; texto de MML. |
| 11 | |det| es el área del paralelogramo de las columnas; el signo es la orientación. En la intuición: el determinante es el factor exacto por el que se multiplica cualquier área (ya no "en promedio"). | Formal §Determinante; Intuición | mml | §4.1, ejemplo 4.2, p. 101 | Leído. |
| 12 | El |det| multiplica el área de cualquier figura (caso lineal del jacobiano). | Formal §Determinante | openstax-calc3 | §5.7 | Abrí la página: el área de la imagen de un rectángulo chico es ≈|J|·ΔuΔv. Que para x=au+bv, y=cu+dv el jacobiano es ad−bc es cuenta mía (2×2 de derivadas parciales). Python: pentágono, razón 10. |
| 13 | Matriz cuadrada invertible si y solo si det ≠ 0. | Formal §Determinante | mml | §4.1, teorema 4.1, p. 100 | Leído. |
| 14 | Tabla: rotación det 1, escala diag(2;0,5) det 1, reflexión −1, proyección 0. | Formal §Determinante | (cuenta propia) | — | Cuentas con la fórmula ad−bc. |
| 15 | Definición de autovector y autovalor: Ax=λx, x≠0. | Formal §Autovalores | mml | §4.2, def. 4.6, p. 105 | Leído. |
| 16 | El autovector no se gira, solo se escala por λ (λ puede ser 0 o negativo; x no puede ser el vector nulo). | Formal §Autovalores | ocw-1806 / mml | Lecture 21; mml def. 4.6, p. 105 | La página dice que Ax apunta en la misma dirección que x. Los casos |λ|>1, <1, λ<0 y λ=0 son lectura directa de Ax=λx; λ=0 ⇒ det A=0 por det(A−λI)=0. |
| 17 | Existe autovector cuando det(A−λI)=0. | Formal §Autovalores | mml | §4.2, p. 105 | Lista de equivalencias leída. |
| 18 | Para [[3,1],[1,3]]: λ²−6λ+8=0, λ=4 y 2; (1,1)→(4,4), (1,−1)→(2,−2). | Formal §Autovalores | (cuenta propia) | — | Python: autovalores 4 y 2, productos comprobados. |
| 19 | La rotación de 90° da λ²+1=0 y no tiene autovalores reales. | Formal §Autovalores | (cuenta propia) | — | det([[−λ,−1],[1,−λ]])=λ²+1. El simulador dice "complejos" según SIMULADORES.md §2.2. |
| 20 | PCA proyecta sobre un subespacio y el libro lo deriva con proyecciones y autovalores. | Formal, Profundizar | mml | cap. 10, p. 318 | Leí la introducción del capítulo. |
| 21 | Tarjeta t-columnas-son-imagenes | tarjeta | mml | def. 2.19, p. 51 | = fila 1. |
| 22 | Tarjeta t-origen-quieto | tarjeta | (cuenta propia) | — | Una transformación lineal manda 0 a 0 (A·0=0). Sin cita puntual. |
| 23 | Tarjeta t-matriz-rotacion (ahora dice "antihorario") | tarjeta | mml | ec. 3.76, p. 92 | = fila 3. |
| 24 | Tarjeta t-rotacion-conserva | tarjeta | mml | p. 94 | = fila 4. |
| 25 | Tarjeta t-orden-composicion | tarjeta | zill | def. 14.2.3, p. 606 | = fila 7. |
| 26 | Tarjeta t-no-conmutativo | tarjeta | zill | ejemplo 8, p. 607 | = fila 8. |
| 27 | Tarjeta t-determinante-formula | tarjeta | zill | def. 14.3.1, p. 612 | = fila 10. |
| 28 | Tarjeta t-determinante-area | tarjeta | mml | ej. 4.2, p. 101 | = fila 11. |
| 29 | Tarjeta t-determinante-negativo | tarjeta | mml | ej. 4.2, p. 101 | = fila 11. |
| 30 | Tarjeta t-determinante-cero | tarjeta | mml | teorema 4.1, p. 100 | = fila 13. |
| 31 | Tarjeta t-autovector-definicion (x≠0; λ puede ser 0 o negativo) | tarjeta | mml | def. 4.6, p. 105 | = filas 15-16. |
| 32 | Tarjeta t-rotacion-sin-autovectores | tarjeta | mml | def. 4.6, p. 105 | = fila 19 (apoyada en la definición). |
| 33 | Ejercicio e-componer-escala-y-giro: x = −3. | ejercicio | zill | def. 14.2.3, p. 606 | Python: (8;3) → (−3;8). |
| 34 | Ejercicio e-area-del-poligono: 70 cm². | ejercicio | openstax-calc3 | §5.7 | det=3·4−1·2=10; 7·10=70. |
| 35 | Ejercicio e-autovalor-mayor: 4. | ejercicio | mml | def. 4.6, p. 105 | = fila 18. |
| 36 | Ejercicio e-om-reflexion: diag(1,−1) espeja y conserva el área. | ejercicio | mml | ej. 4.2, p. 101 | det=−1 → orientación invertida, |det|=1. |
| 37 | Ejercicio e-vf-toda-matriz-se-deshace: falso. | ejercicio | mml | teorema 4.1, p. 100 | = fila 13. |
| 38 | Ejercicio e-vf-orden-no-importa: falso. | ejercicio | zill | ejemplo 8, p. 607 | = fila 8; Python confirma RS≠SR. |
| 39 | Problema p-mml-autoespacios | problema | mml | ejercicio 4.3, p. 137 | Texto del ejercicio leído. |
| 40 | Problema p-area-con-python | problema | mml | ej. 4.2, p. 101 y §3.9.1, p. 92 | Tarea práctica sin respuesta numérica. |
| 41 | Problema p-zill-producto-matrices | problema | zill | def. 14.2.3 y ejemplo 8, pp. 606-607 | Tarea práctica sin respuesta numérica. |

### Fuentes del tema
- `mml`: ver arriba (mismo PDF libre, borrador del 15/01/2024).
- `openstax-calc3`: Strang y Herman, *Calculus Volume 3*, OpenStax, 2016, §5.7. Acceso: página web abierta.
- `zill`: Zill y Dewar, *Álgebra, trigonometría y geometría analítica*, 3.ª ed. en español, McGraw-Hill, 2012. Acceso: biblioteca del dueño. Páginas confirmadas mirando la imagen (606, 607, 612).
- `ocw-1806`: Strang, MIT 18.06, Spring 2010, lecciones 30 y 21. Acceso: solo la página descriptiva de cada clase; no vi ni el video ni la transcripción, así que lo que cito es únicamente lo que dicen esas páginas.
- `3b1b-matrices` (para ver más): confirmé la existencia de la lección en 3blue1brown.com por una búsqueda.

### Números y datos inventados para ejemplos
- Píxel (4; 6), figura de 7 cm²: ilustrativos.

---

## grafos

| # | Afirmación clave (tu paráfrasis) | Dónde está | Fuente (id) | Ubicación exacta | Cómo la verificaste |
|---|---|---|---|---|---|
| 1 | Grafo dirigido = vértices + aristas con cola y cabeza. | Formal §Qué es un grafo | mcs | def. 10.0.1, p. 423 | PDF libre leído. |
| 2 | Grafo simple: aristas sin sentido entre dos vértices distintos. | Formal §Qué es un grafo | mcs | def. 12.1.1, p. 502 | Leído. |
| 3 | Recorrido (walk) = sucesión alternada de vértices y aristas; es camino (path) si no repite vértices; distancia = largo del camino más corto. | Formal §Qué es un grafo | mcs | def. 10.2.1 y texto siguiente (pp. 424-425); def. 10.2.4 (p. 426) | Leído: "the walk is a path iff all the vertices are different" está en p. 425. |
| 4 | En grafos con pesos se busca el camino de menor peso. | Formal §Qué es un grafo | mcs | §10.3.1, pp. 429-430 | Leído (se menciona sin desarrollar Dijkstra). |
| 5 | Sin pesos, BFS da caminos mínimos en tiempo |V|+|E|. | Formal §Camino mínimo | ocw-6006 | Lecture 13, p. 1 (tabla) | Apuntes PDF leídos. |
| 6 | Dijkstra expande como una esfera desde el origen (pesos no negativos). | Formal §Camino mínimo; Intuición | ocw-6006 | p. 1 | Leído. |
| 7 | Mantiene d(v), saca el mínimo y relaja las aristas salientes. | Formal §Camino mínimo | ocw-6006 | p. 2 | Leído. |
| 8 | Fórmula de relajación. | Formal (fórmula) | ocw-6006 | p. 2 | Leído. |
| 9 | Ejemplo Q,R,S,T (tabla): distancias 0, 2, 3, 5. | Formal §Camino mínimo | (cuenta propia) | — | Ejemplo mío, resuelto con `heapq`: coincide con la tabla. |
| 10 | Dijkstra funciona porque los pesos no son negativos. | Formal §Camino mínimo | ocw-6006 | pp. 1 y 3 | Leído (observación 1 y paso "no-negative edge weights" de la demostración). |
| 11 | Con pesos negativos hay que usar Bellman-Ford, O(|V||E|). | Formal §Camino mínimo | ocw-6006 | p. 1 (tabla) | Leído. |
| 12 | Costo: arreglo ≈ |V|², montículo binario ≈ |E|log|V|. | Formal §Camino mínimo | ocw-6006 | p. 4 | Leído (tabla de tiempos). |
| 13 | DAG = grafo dirigido sin ciclos. | Formal §Orden topológico | mcs | def. 10.5.1, p. 431 | Leído. |
| 14 | Orden topológico: cada vértice antes que todos los alcanzables desde él. | Formal §Orden topológico | mcs | def. 10.5.2, p. 433 | Leído. La versión "para cada flecha u→v, u antes que v" es equivalente y propia. |
| 15 | Todo DAG finito tiene un orden topológico. | Formal §Orden topológico | mcs | teorema 10.5.4, p. 435 | Leído. |
| 16 | Se arma sacando vértices minimales (sin flechas entrantes pendientes) uno por uno. | Formal §Orden topológico | mcs | §10.5.1, p. 434 | Leído. |
| 17 | Suele haber varios órdenes válidos. | Formal §Orden topológico | mcs | figura 10.8, p. 434 | Leído (dos órdenes para el ejemplo de la ropa). |
| 18 | Con un ciclo el procedimiento se frena y el ciclo se detecta así. | Formal §Orden topológico | (cuenta propia) | — | Consecuencia de la definición (los vértices del ciclo siempre tienen una flecha entrante pendiente). Python: el orden de [a,b,c,d] con ciclo b↔c termina con solo a. |
| 19 | Demostración de corrección de Dijkstra (idea). | Formal, Profundizar | ocw-6006 | p. 3 | Leí la demostración por inducción y la resumí. |
| 20 | Tarjeta t-grafo-que-es | tarjeta | mcs | def. 10.0.1, p. 423; def. 12.1.1, p. 502 | = filas 1-2. Que las aristas "pueden tener peso" sale de §10.3.1, p. 430. |
| 21 | Tarjeta t-distancia-definicion | tarjeta | mcs | def. 10.2.4, p. 426 | = fila 3. |
| 22 | Tarjeta t-bfs-sin-pesos | tarjeta | ocw-6006 | p. 1 | = fila 5. |
| 23 | Tarjeta t-dijkstra-que-saca | tarjeta | ocw-6006 | p. 2 | = fila 7. |
| 24 | Tarjeta t-relajar-arista | tarjeta | ocw-6006 | p. 2 | = fila 8. |
| 25 | Tarjeta t-dijkstra-negativos | tarjeta | ocw-6006 | pp. 1 y 3 | = fila 10. |
| 26 | Tarjeta t-menos-aristas-no-es-barato | tarjeta | ocw-6006 | p. 1 | BFS cuenta aristas (sin pesos); con pesos hace falta Dijkstra. Ejemplo numérico propio verificado con Python (S–A–T cuesta 15 y el mínimo es 11). |
| 27 | Tarjeta t-dijkstra-heap | tarjeta | ocw-6006 | p. 4 | = fila 12. |
| 28 | Tarjeta t-dag-definicion | tarjeta | mcs | def. 10.5.1, p. 431 | = fila 13. |
| 29 | Tarjeta t-orden-topologico-definicion | tarjeta | mcs | def. 10.5.2, p. 433 | = fila 14. |
| 30 | Tarjeta t-orden-topologico-unico | tarjeta | mcs | fig. 10.8, p. 434 | = fila 17. |
| 31 | Tarjeta t-ciclo-sin-orden | tarjeta | mcs | def. 10.5.2, p. 433 | = fila 18. |
| 32 | Ejercicio e-camino-minimo-costo: 11 min. | ejercicio | ocw-6006 | p. 2 | Python (Dijkstra): S 0, B 1, A 3, C 8, T 11; camino S,B,A,C,T. S–A–T = 15, S–B–C–T = 12. |
| 33 | Ejercicio e-atasco-en-la-avenida: 12 min. | ejercicio | ocw-6006 | p. 2 | Python con A–C = 15: T = 12 por S,B,C,T; el camino anterior cuesta 21. |
| 34 | Ejercicio e-cantidad-de-ordenes: 3. | ejercicio | mcs | def. 10.5.2, p. 433 | Python: enumeré las 120 permutaciones; 3 cumplen. |
| 35 | Ejercicio e-vf-dijkstra-pesos-negativos: falso. | ejercicio | ocw-6006 | pp. 1 y 3 | = fila 10. |
| 36 | Ejercicio e-om-ciclo-de-dependencias. | ejercicio | mcs | def. 10.5.1-10.5.2, pp. 431-433 | = fila 18. |
| 37 | Problema p-mcs-prerrequisitos | problema | mcs | problema 10.21, pp. 459-460 | Leí el enunciado: tabla de prerrequisitos del MIT y la afirmación de seis cuatrimestres. |
| 38 | Problema p-dijkstra-a-mano-y-codigo | problema | ocw-6006 | p. 2 y p. 3 | Leí el algoritmo y la tabla de ejemplo. |
| 39 | Problema p-detectar-ciclos | problema | mcs | §10.5.1, p. 434 | = fila 16. |

### Fuentes del tema
- `mcs`: Lehman, Leighton y Meyer, *Mathematics for Computer Science*, revisión del 6/6/2018 (texto de MIT 6.042J). Acceso: PDF libre del sitio del curso (courses.csail.mit.edu/6.042/spring18). Páginas = las impresas del PDF.
- `ocw-6006`: Demaine, Ku y Solomon, MIT 6.006, Spring 2020, apuntes de la Lecture 13. Acceso: PDF libre de OCW; "p. N" es la página de los apuntes.
- `ocw-6006-video` (para ver más): página del video en OCW, no la vi.
- Miré también *Introducción a la Matemática Discreta* (Murillo Tsijli, 4.ª ed., 2010) de la biblioteca del dueño: no tiene capítulo de grafos (cap. 1 a 7: lógica, conjuntos, relaciones, funciones, inducción, estructuras algebraicas, congruencias), por eso no la cito.

### Números y datos inventados para ejemplos
- Mapa S, A, B, C, T con tiempos, grafo Q, R, S, T, el monorepo de cinco paquetes y el choque en la avenida: ilustrativos.

---

## senales-frecuencia-ruido

| # | Afirmación clave (tu paráfrasis) | Dónde está | Fuente (id) | Ubicación exacta | Cómo la verificaste |
|---|---|---|---|---|---|
| 1 | Senoide x(t)=A cos(ωt+φ), f=1/T, ω=2πf; tres parámetros: amplitud, frecuencia, fase. | Formal §La senoide; Intuición | openstax-up1 | §15.1 (ec. 15.1 y 15.3) | Abrí la página; ω=2πf lo da sin numerar. |
| 2 | La red eléctrica es v=V0 sin ωt: 60 Hz en EE. UU. y 50 Hz en Europa. | Formal §La senoide | openstax-up2 | §15.1 | Abrí la página. No afirmo nada sobre Argentina. |
| 3 | El oído humano va de ~20 Hz a 20 kHz. | Formal §Frecuencias | smith-dsp | cap. 22, p. 353 | PDF del capítulo leído. |
| 4 | La música necesita ~20 kHz de ancho de banda y la voz ~3,2 kHz. | Formal §Frecuencias | smith-dsp | cap. 22, p. 358 | Leído. |
| 5 | Ancho de banda de una señal = anchura del rango de frecuencias que ocupa, en Hz (música 20 kHz, voz 3,2 kHz). | Formal §Frecuencias | smith-dsp | cap. 22, p. 358 | El libro usa "bandwidth of 20 kHz" como anchura; no da una definición formal textual. El aviso sobre el uso de la palabra para velocidad en bit/s es una aclaración de vocabulario, sin cita. |
| 6 | Una señal se muestrea bien solo si no tiene frecuencias sobre la mitad de la de muestreo. | Formal §Teorema | smith-dsp | cap. 3, p. 40 | Leído. |
| 7 | Condición f_s > 2 f_max; frecuencia de Nyquist = f_s/2. | Formal (fórmula) | smith-dsp | cap. 3, pp. 40 y 42 | Leído; el libro usa "Nyquist frequency/rate" con significados mezclados (p. 42): usé solo "frecuencia de Nyquist = f_s/2". |
| 8 | Una frecuencia mayor se disfraza de otra menor y se mezcla con la existente. | Formal §Teorema | smith-dsp | cap. 3, pp. 40 y 42 | Leído (ejemplo del 0,95 → 0,05 en p. 40; descripción general en p. 42). |
| 9 | Cada frecuencia sobre f_s/2 se corresponde con una entre 0 y f_s/2 (alias = f_s−f entre f_s/2 y f_s; en general, distancia al múltiplo de f_s más cercano). | Formal §Teorema | smith-dsp | cap. 3, fig. 3-4, p. 42 | La figura 3-4 (zigzag) y el ejemplo 0,95→0,05 respaldan la correspondencia; la fórmula general es mía y coincide. Python: alias(10;12)=2, (5;8)=3, (25;40)=15. |
| 10 | Filtro pasa-bajos analógico antes del conversor (antialias). | Formal §Teorema | smith-dsp | cap. 3, pp. 48-49 | Leído (figura 3-7 y texto). |
| 11 | Telefonía ≈ 8 kHz (voz buena, música pobre); alta fidelidad 44,1 kHz. | Formal §Teorema | smith-dsp | cap. 22, p. 358 | Leído. |
| 12 | A 8 kHz solo se guardan frecuencias menores que 4 kHz y los agudos de la música quedan afuera (música apagada). Sin filtro antialias, los agudos vuelven como alias, tonos que no estaban, y es de esperar que suenen metálicos. | Formal §Teorema; Caso real | smith-dsp | cap. 3, p. 40; cap. 22, p. 358 | Aplicación de la fila 6 a 8 kHz (apagado: Smith p. 358 dice que la música pierde calidad). "Timbre metálico" es mi inferencia perceptual a partir de que el alias agrega frecuencias que no estaban; Smith no usa esa palabra. F4, mirar. |
| 13 | Capacidad: C = W log2(1+S/N) para ruido blanco térmico y potencia limitada. | Formal §Capacidad | shannon | §25, teorema 17, p. 43 (de la reimpresión) | PDF leído. El artículo lo escribe W log((P+N)/N), con log base 2. |
| 14 | Por debajo de C se puede llegar con error tan chico como se quiera; por encima no. | Formal §Capacidad | shannon | §25, p. 43 | Leído. |
| 15 | Para cocientes de potencias, dB = 10 log10(P2/P1) (10 dB = factor 10, 20 dB = factor 100); por eso S/N = 10^(dB/10). | Formal §Capacidad | smith-dsp | cap. 14, ec. 14-1, p. 264 | Leí el repaso de decibeles de Smith (potencia: 10 log10; amplitud: 20 log10). Tomar S/N como cociente de potencias es la definición del teorema 17 (P/N). |
| 16 | Ejemplo: 20 MHz y 20 dB → ≈133 Mbit/s; con 10 dB ≈69 Mbit/s. | Formal, Profundizar | shannon | §25, p. 43 | Python: 133,16 y 69,19 Mbit/s. |
| 17 | Con la misma SNR, doblar W duplica C (con ruido blanco, mantener la SNR exige más potencia). Doblar S/N suma log2((1+2s)/(1+s)) bit/s/Hz: ≈1 solo con SNR alta (s=10: 0,93; 100: 0,99); con SNR baja casi duplica C (s=1: 0,585; s=0,1: 0,126). | Formal, Profundizar | shannon | §25, p. 43 | Fórmula del teorema 17 y cuentas mías con Python: s=0,1 → +0,126; 1 → +0,585; 10 → +0,933; 100 → +0,993; en 20 MHz y s=100, +19,86 Mbit/s (14,9 %). El ruido blanco proporcional a W sale de que N es la potencia del ruido blanco dentro de la banda W (Shannon, p. 43). |
| 18 | Tarjeta t-frecuencia-periodo | tarjeta | openstax-up1 | §15.1 | = fila 1. T=1/50=20 ms. |
| 19 | Tarjeta t-senoide-parametros (tres parámetros) | tarjeta | openstax-up1 | §15.1 | = fila 1. |
| 20 | Tarjeta t-ancho-de-banda-senal | tarjeta | smith-dsp | cap. 22, p. 358 | = fila 5. |
| 21 | Tarjeta t-oido-humano | tarjeta | smith-dsp | cap. 22, p. 353 | = fila 3. |
| 22 | Tarjeta t-condicion-nyquist (f_s mayor que el doble de f_max) | tarjeta | smith-dsp | cap. 3, p. 40 | = fila 6-7. |
| 23 | Tarjeta t-frecuencia-nyquist | tarjeta | smith-dsp | cap. 3, p. 42 | 8/2 = 4 kHz. |
| 24 | Tarjeta t-que-es-alias | tarjeta | smith-dsp | cap. 3, p. 40 | = fila 8. |
| 25 | Tarjeta t-antialias | tarjeta | smith-dsp | cap. 3, pp. 48-49 | = fila 10. |
| 26 | Tarjetas t-audio-apagado (pérdida de agudos a 8 kHz) y t-audio-metalico (alias sin filtro) | tarjeta | smith-dsp | cap. 3, p. 40; cap. 22, p. 358 | = fila 12. |
| 27 | Tarjeta t-capacidad-formula | tarjeta | shannon | §25, p. 43 | = fila 13. |
| 28 | Tarjeta t-capacidad-ancho-doble | tarjeta | shannon | §25, p. 43 | = fila 17. |
| 29 | Tarjeta t-snr-db | tarjeta | smith-dsp | cap. 14, p. 264 | = fila 15. 10^(20/10)=100. |
| 30 | Ejercicio e-muestras-por-ciclo: 8. | ejercicio | openstax-up1 | §15.1 | 400/50 = 8 (Python). |
| 31 | Ejercicio e-frecuencia-de-alias: 3 kHz. | ejercicio | smith-dsp | cap. 3, pp. 40 y 42 | = fila 9. Python: alias(5;8)=3. |
| 32 | Ejercicio e-capacidad-wifi: 133,2 Mbit/s (tolerancia relativa 1 %). | ejercicio | shannon | §25, p. 43 | Python: 133,164. Errores: 87,8 (usó 20 como S/N) y 40,1 (log10). |
| 33 | Ejercicio e-om-duplicar-potencia: sube ≈15 % (133,2 → 153,0); la explicación aclara que vale con SNR alta. | ejercicio | shannon | §25, p. 43 | Python: 153,02 Mbit/s, +14,9 %. |
| 34 | Ejercicio e-vf-nyquist-capacidad: falso. | ejercicio | smith-dsp | cap. 3, p. 40 | Smith atribuye el teorema de muestreo a Nyquist/Shannon; la capacidad es el teorema 17 de Shannon. |
| 35 | Ejercicio e-vf-muestrear-mas-no-pierde: verdadero. | ejercicio | smith-dsp | cap. 3, p. 40 | 4 kHz < 10/2 = 5 kHz. |
| 36 | Problema p-smith-muestreo | problema | smith-dsp | cap. 3, pp. 39-42 | Tarea práctica. Alias esperados (Python): 40 Hz → ninguno, 25 Hz → ninguno, 20 Hz → 10 Hz en el borde, 12 Hz → 2 Hz. |
| 37 | Problema p-shannon-calculos | problema | shannon | §25, p. 43 | Tarea práctica. |
| 38 | Problema p-smith-audio-calidad | problema | smith-dsp | cap. 22, pp. 358-359 | Leí la tabla de calidad de audio (p. 359). |

### Fuentes del tema
- `smith-dsp`: Smith, *The Scientist and Engineer's Guide to Digital Signal Processing*, California Technical Publishing, © 1997-2011. Acceso: PDF libre de los capítulos 3, 14 y 22 (dspguide.com); la edición exacta no figura en el sitio. Páginas = las impresas.
- `shannon`: Shannon, "A Mathematical Theory of Communication", *Bell System Technical Journal* 27, 1948. Acceso: reimpresión con correcciones (PDF de Harvard). La p. 43 es la de la reimpresión, no la de la revista. Tipo `articulo` en el frontmatter (retipado F6a; antes `libro`, cuando el contrato no tenía ese tipo).
- `openstax-up1`, `openstax-up2`: *University Physics* vol. 1 (§15.1) y vol. 2 (§15.1), OpenStax. Acceso: páginas web abiertas. Ya no se cita §17.3.

### Números y datos inventados para ejemplos
- Call center a 8 kHz, enlace de 100 Mbit/s, wifi de 300 Mbit/s con 40 reales: ilustrativos.
- Canal wifi de 20 MHz con SNR de 20 dB y 10 dB: supuestos para la cuenta, no mediciones.

---

## Libros que conviene pedirle al dueño
- Stewart, *Cálculo de una variable. Trascendentes tempranas* (la de varias variables la tenía): para citar con capítulo la derivada de una variable, reglas y razón de cambio (§2.7 y cap. 3). Hoy el tema las respalda con OpenStax y MML.
- Strang, *Introduction to Linear Algebra* (5.ª ed.), el libro que acompaña a 18.06: para citar con página lo de transformaciones lineales y autovalores, hoy respaldado con MML, Zill y la página de OCW.
- Grossman, *Álgebra lineal* (McGraw-Hill, 7.ª ed.): bibliografía de cátedra de Álgebra y Geometría Analítica.
- Rosen, *Matemática discreta y sus aplicaciones* (McGraw-Hill, 7.ª ed.) y Cormen, Leiserson, Rivest y Stein, *Introduction to Algorithms* (4.ª ed.): grafos, BFS, Dijkstra y orden topológico con capítulo y ejercicios; hoy se apoya en MCS y en 6.006.
- Tanenbaum, Feamster y Wetherall, *Computer Networks* (6.ª ed.): capa física, Nyquist y Shannon en contexto de redes. Hoy respaldado con Smith y el artículo original de Shannon.
- Oppenheim y Willsky, *Signals and Systems* (2.ª ed.): señales y muestreo con rigor de cátedra.
- Bird, *Electrical Circuit Theory and Technology* (el dueño ya lo tiene, 5.ª ed. 2014): lo encontré pero no lo usé; sirve para ampliar corriente alterna (Física II).

## Pedidos al director
- Los simuladores figuran "en construcción" y no pude ver su comportamiento: las `consigna` salen de `SIMULADORES.md` §2.1, §2.2 y §2.11. En descenso por gradiente, lo que digo de la tasa (converge / cruza de lado / rebota / diverge) es matemática de f(x)=x² (factor 1−2γ) y no usa los nombres de la lectura `estado`: conviene que F2 confirme cómo etiqueta el tramo 0,5 < γ < 1 (zigzag que converge: ¿"oscilando" o "convergiendo"?). El tema pide al lector "mirar la lectura estado" sin prometer un valor.
- No vi cómo son los grafos `red-ciudad` y `dependencias-paquetes`; los ejercicios del tema usan grafos propios y no dependen de los del simulador.
- `rehype-katex` no rompe el build con LaTeX inválido en el cuerpo (solo `<Formula>` usa `throwOnError`): revisé a mano que ningún `dist/.../index.html` de mis temas tenga la clase `katex-error` (0 ocurrencias).
- Mis temas no declaran prerrequisitos (`prerrequisitos: []`), así que el modo estricto no depende de otras áreas.
- Para F4: quedan como derivación mía (sin rótulo en el cuerpo) la fórmula general del alias, el cierre sobre ciclos en el orden topológico y el comportamiento de "doblar S/N" según la SNR. Las páginas de MML son las del borrador de 2024; la edición impresa de 2020 podría numerar distinto.

- Correcciones F5 (verificación F4): todos los hallazgos se aceptaron y se corrigieron; no hay "Respuesta del autor" en los informes. Lo único no respaldado por cita directa que sigue en el cuerpo es el adjetivo "metálico" para el alias (fila 12 de señales).
