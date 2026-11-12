# Verificación F4 — grafos

- **Tema:** `matematica-fisica/grafos` (commit del escritor 3e435d6)
- **Fecha:** 2026-11-11
- **Verificador:** F4 (agente distinto del autor)
- **Veredicto:** APROBADO (re-verificación sobre 13662ed: cero hallazgos abiertos)

Criterio: APROBADO = sin hallazgos de severidad media o alta (los menores no bloquean pero quedan anotados). Toda la matemática y todas las respuestas numéricas coinciden con mi recálculo.

## Qué se hizo

- Fuentes abiertas y leídas: Lehman, Leighton y Meyer *Mathematics for Computer Science* (revisión 6/6/2018, PDF del sitio del curso, descargado de nuevo; páginas impresas 423-435, 459-460 y 502) y los apuntes de MIT 6.006 Spring 2020, Lecture 13 (PDF de OCW, pp. 1-4).
- Build con Node 24 verde, `grep -r katex-error dist/` sin resultados, todos los fragmentos LaTeX pasan KaTeX en modo estricto.
- Dijkstra, enumeración de órdenes topológicos y el procedimiento de Kahn sobre un grafo con ciclo, recalculados con Python puro.
- Plagio: cero coincidencias de 5 palabras con los textos en español; las fuentes están en inglés y el tema las parafrasea.
- El libro de Matemática Discreta del dueño (Murillo Tsijli) no se cita, correcto: no tiene capítulo de grafos (lo declara el escritor).

## Las afirmaciones "cuenta propia" de este tema

| Afirmación | Resultado | Nota |
|---|---|---|
| Con un ciclo el procedimiento del orden topológico se frena con vértices sin ubicar, y así se detecta | ✅ correcta | Es el algoritmo de Kahn. Cada vértice de un ciclo tiene siempre una flecha entrante desde otro vértice del ciclo que no se saca antes que él, así que nunca es elegible. Para [a→b, b→c, c→b, c→d] el procedimiento termina con solo `a` (recalculado). El recíproco también vale: si no hay ciclo se puede vaciar (teorema 10.5.4). Respaldo propuesto: MCS p. 430, que dice que un "closed walk" de largo positivo hace imposible el orden y que por el lema 10.2.6 eso equivale a un ciclo, más la def. 10.5.2. |
| Ejemplo Q,R,S,T con distancias 0, 2, 3, 5 | ✅ | Recalculado con `heapq`. |
| Versión "para cada flecha u→v, u antes que v" | ✅ | Equivalente a la def. 10.5.2 de MCS en un DAG. |

## Afirmaciones revisadas

| # | Afirmación | Fuente | Ubicación | Resultado | Nota |
|---|---|---|---|---|---|
| 1 | Grafo dirigido: vértices y aristas con cola y cabeza | mcs | def. 10.0.1, p. 423 | ✅ | "tail" y "head", como el tema. |
| 2 | Grafo simple: aristas sin sentido, entre vértices distintos, {u,v}={v,u} | mcs | def. 12.1.1, p. 502 | ✅ | |
| 3 | Camino y distancia = largo del camino más corto | mcs | defs. 10.2.1 (p. 424) y 10.2.4 (p. 426) | ⚠️ | La 10.2.1 define "walk"; MCS distingue walk de path. La distancia sí se define sobre el camino más corto (10.2.4). Ver H2. |
| 4 | Con pesos, "largo" = suma de pesos; se busca el de menor peso | mcs | §10.3.1, pp. 429-430 | ✅ | Lo menciona sin desarrollar Dijkstra. |
| 5 | BFS halla caminos mínimos sin pesos en O(|V|+|E|) | ocw-6006 | L13, p. 1 (tabla) | ✅ | Fila "General / Unweighted / BFS". |
| 6 | Dijkstra expande como una esfera desde el origen (pesos ≥0) | ocw-6006 | p. 1 | ✅ | "Grow a sphere centered at source s". |
| 7 | Mantiene d(v) (∞ y 0 en el origen), saca el mínimo y relaja las salientes | ocw-6006 | p. 2 | ✅ | |
| 8 | Fórmula de relajación `si d(v)>d(u)+w(u,v) entonces d(v)←d(u)+w(u,v)` | ocw-6006 | p. 2 | ✅ | Idéntica a la del algoritmo. LaTeX y símbolos bien. |
| 9 | Tabla del ejemplo Q-R-S-T | cuenta | — | ✅ | Q 0, R 2, S 3 (vía R, mejora 5→3), T 5 (vía S, mejora 8→5). Camino Q→R→S→T=5 ✔. |
| 10 | Dijkstra funciona porque los pesos no son negativos | ocw-6006 | pp. 1 y 3 | ✅ | Observación 1 y paso "non-negative edge weights" de la demostración. |
| 11 | Con pesos negativos, Bellman-Ford, O(|V||E|) | ocw-6006 | p. 1 | ✅ | |
| 12 | Arreglo ≈|V|²; montículo binario ≈|E|log|V|, conviene en grafos con pocas aristas | ocw-6006 | p. 4 | ✅ | La tabla dice igual y comenta "sparse" → binary heap. |
| 13 | DAG = grafo dirigido sin ciclos | mcs | def. 10.5.1, p. 431 | ✅ | |
| 14 | Orden topológico: cada vértice antes que todos los alcanzables desde él | mcs | def. 10.5.2, p. 433 | ✅ | |
| 15 | Todo DAG finito tiene al menos uno | mcs | teorema 10.5.4, p. 435 | ✅ | |
| 16 | Se arma sacando un vértice sin flechas entrantes y repitiendo | mcs | §10.5.1, p. 434 | ✅ | MCS: se elige un elemento "minimal". |
| 17 | Casi siempre hay varios órdenes válidos | mcs | fig. 10.8, p. 434 | ✅ | "Casi siempre" es prudente: hay DAG con un único orden (una cadena). |
| 18 | Con un ciclo se frena y así se detecta | cuenta | — | ✅ | Ver arriba. |
| 19 | Esquema de la demostración de Dijkstra (Profundizar) | ocw-6006 | p. 3 | ✅ | La cadena de desigualdades está fielmente resumida (d(y)≤δ(x)+w=δ(y)≤δ(v')≤d(v')≤d(y)). |
| 20 | Consigna 1 (origen/destino, "Paso", tráfico ×1 a ×5) | SIMULADORES §2.11 | — | ✅ | Controles existen (modo camino-minimo). |
| 21 | Consigna 2 ("Paso" y "repetí eligiendo otro") | SIMULADORES §2.11 | — | ⚠️ | Ver H1. |
| 22 | Analogía de la mancha de tinta | — | Intuición | ✅ | Mapea la estructura (frontera que crece por distancia). |
| 23 | Analogía de vestirse | — | Intuición | ✅ | Varios órdenes válidos y el ciclo imposible; es el mismo ejemplo de MCS fig. 10.7. |
| 24 | Ojo: menos aristas ≠ más barato | — | Intuición | ✅ | |
| 25 | t-grafo-que-es | mcs | defs. 10.0.1 y 12.1.1 | ✅ | |
| 26 | t-distancia-definicion | mcs | def. 10.2.4 | ✅ | |
| 27 | t-bfs-sin-pesos | ocw-6006 | p. 1 | ✅ | |
| 28 | t-dijkstra-que-saca | ocw-6006 | p. 2 | ✅ | |
| 29 | t-relajar-arista | ocw-6006 | p. 2 | ✅ | |
| 30 | t-dijkstra-negativos | ocw-6006 | pp. 1 y 3 | ✅ | |
| 31 | t-menos-aristas-no-es-barato | ocw-6006 | p. 1 | ✅ | |
| 32 | t-dijkstra-heap | ocw-6006 | p. 4 | ✅ | |
| 33 | t-dag-definicion | mcs | def. 10.5.1 | ✅ | |
| 34 | t-orden-topologico-definicion | mcs | def. 10.5.2 | ✅ | |
| 35 | t-orden-topologico-unico | mcs | fig. 10.8 | ✅ | |
| 36 | t-ciclo-sin-orden | mcs | def. 10.5.2 | ✅ | |
| 37 | e-camino-minimo-costo: 11 min | ocw-6006 | p. 2 | ✅ | S0, B1, A3, C8, T11, camino S-B-A-C-T. S-A-T=15 ✔, S-B-C-T=12 ✔. Las explicaciones de los distractores 15 y 12 son correctas. |
| 38 | e-atasco-en-la-avenida: 12 min | ocw-6006 | p. 2 | ✅ | Con A-C=15: S-B-C-T=12, S-B-A-T=14, anterior=21 ✔. |
| 39 | e-cantidad-de-ordenes: 3 | mcs | def. 10.5.2 | ✅ | Enumeradas las 120 permutaciones: 3 cumplen. Distractor 6 = 3! ✔. |
| 40 | e-vf-dijkstra-pesos-negativos: falso | ocw-6006 | pp. 1 y 3 | ✅ | |
| 41 | e-om-ciclo-de-dependencias | mcs | defs. 10.5.1-10.5.2 | ✅ | La respuesta correcta incluye "o dependen de uno", que cubre los vértices bloqueados aguas abajo del ciclo. |
| 42 | p-mcs-prerrequisitos | mcs | problema 10.21, pp. 459-460 | ✅ | La tabla del MIT y "exactly six terms" figuran en el enunciado (a). |
| 43 | p-dijkstra-a-mano-y-codigo | ocw-6006 | pp. 2-3 | ✅ | |
| 44 | p-detectar-ciclos | mcs | §10.5.1, p. 434 | ✅ | |
| 45 | Caso real y orden caso → intuición → formal, voz criolla | GUIA-ESTILO | — | ✅ | Los números son declarados ilustrativos. |

## Hallazgos abiertos

> Estado actual: ninguno abierto. Los hallazgos de abajo son los de la verificación inicial (3e435d6) y figuran como CERRADOS en la sección "Re-verificación" al final de este informe.

**H1 (menor) — la consigna del segundo simulador pide algo que el catálogo no promete.**
- Archivo y campo: `src/content/temas/matematica-fisica/grafos/tema.mdx` → segundo `<SimGrafo … modo="orden-topologico">` → `consigna` ("Cuando haya más de un paquete disponible, repetí eligiendo otro").
- Qué está mal: `SIMULADORES.md` §2.11 describe el modo `orden-topologico` con solo el botón "Paso", que resalta los nodos sin dependencias pendientes, y las lecturas `orden` y `disponibles`; no dice que se pueda elegir cuál de los disponibles se procesa. Si F2 lo implementa sin esa elección, el lector no puede hacer lo que la consigna le pide.
- Qué dice la fuente: es una dependencia del simulador, no de un libro. Hay que confirmar con F2 (o probar el simulador terminado).
- Corrección propuesta: si el simulador permite elegir, nada; si no, reformular como "Apretá 'Paso' hasta terminar y anotá el orden y los `disponibles` en cada paso; cuando haya más de uno, pensá cuántos órdenes distintos admitiría el grafo" (es decir, que la variación sea mental).

**H2 (menor) — "camino" citado a una definición que es de "walk".**
- Archivo y campo: `tema.mdx` → `<Formal>` → "Qué es un grafo" ("Un camino (*path*) es una sucesión de aristas… `<Cita f="mcs" loc="def. 10.2.1 y 10.2.4, pp. 424-426" />`").
- Qué está mal: la def. 10.2.1 de MCS es la de *walk* (se pueden repetir vértices); *path* es un walk sin vértices repetidos y está definido en el texto cercano. El tema traduce los dos como "camino". No cambia ninguna cuenta, pero el término inglés entre paréntesis no coincide con la definición citada.
- Qué dice la fuente: MCS def. 10.2.1 "A walk in a digraph is an alternating sequence of vertices and edges…"; def. 10.2.4 define la distancia como el largo de "a shortest path".
- Corrección propuesta: "Un recorrido (*walk*) es… y un camino (*path*) es un recorrido que no repite vértices; la distancia es el largo del camino más corto". O, para no sumar vocabulario, dejar "camino (*walk*)".

## Re-verificación (commit 13662ed contra 02c87f5)

Se revisó solo `git diff 02c87f5..13662ed`: cada hallazgo, las tarjetas y fuentes nuevas. Build con Node 24 verde, `grep -r katex-error dist/` sin resultados y 388 fragmentos LaTeX de los cuatro temas pasan KaTeX en modo estricto (0 errores). Criterio 8: cero hallazgos abiertos, también los menores.

| Hallazgo | Estado | Evidencia |
|---|---|---|
| H1 consigna del orden topológico | CERRADO (13662ed) | La consigna ya no pide elegir nodos: pide anotar el orden y los paquetes disponibles en cada paso (lecturas `orden` y `disponibles` de SIMULADORES §2.11) y razonar cuántos órdenes admite el grafo. Es realizable con lo que promete el catálogo. |
| H2 walk/path | CERRADO (13662ed) | Ahora: recorrido (*walk*) = sucesión alternada de vértices y aristas (def. 10.2.1), camino (*path*) cuando no repite vértices (texto siguiente, p. 425, verificado: "The walk is a path iff all the vᵢ's are different"), y la distancia usa la def. 10.2.4, p. 426. Citas y páginas correctas. |

Hallazgos nuevos por los cambios: ninguno.
