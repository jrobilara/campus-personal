# Verificación F4 — analisis-datos/sql-analitico

- **Tema:** analisis-datos/sql-analitico
- **Fecha:** 2026-11-11
- **Verificador:** F4 (agente distinto del autor)
- **Veredicto:** OBSERVADO

Archivos revisados: `src/content/temas/analisis-datos/sql-analitico/tema.mdx` y `practica.yaml` (commit b885f09).
Método: páginas de PostgreSQL 18 (§3.5, §4.2.8, §7.2.3, §7.2.5, §9.22, tutorial §2.7) descargadas en crudo; EMC §11.3.1 leído en el PDF local (pp. 343-344); todas las consultas corridas por mí con `sqlite3` 3.50.6 sobre la tabla de 12 filas; cálculos rehechos aparte; búsqueda de secuencias de 6 palabras iguales a las fuentes.
No hay PostgreSQL en esta máquina (igual que el autor): la equivalencia con PostgreSQL se contrastó leyendo la documentación de la versión 18, no ejecutando.

## Afirmaciones revisadas

| # | Afirmación | Fuente | Ubicación | Resultado | Nota |
|---|---|---|---|---|---|
| 1 | GROUP BY colapsa filas; una ventana calcula sobre filas relacionadas sin colapsarlas | pg-ventana | §3.5 | ✅ | "the rows retain their separate identities". |
| 2 | Tarjetas t-group-by-colapsa, t-ventana-conserva-filas; e-vf-mismas-filas; e-filas-con-ventana (12) | pg-ventana, pg-agrupar | §3.5, §7.2.3 | ✅ | Corrí ambas consultas: 3 filas vs 12 filas. |
| 3 | Sin OVER es agregado común; OVER marca la ventana | pg-ventana | §3.5 | ✅ | |
| 4 | Sin PARTITION BY hay una sola partición | pg-ventana / pg-sintaxis | §3.5, §4.2.8 | ✅ | |
| 5 | Sintaxis: PARTITION BY, ORDER BY y marco (RANGE/ROWS/GROUPS) | pg-sintaxis | §4.2.8 | ✅ | |
| 6 | Marco por defecto con ORDER BY: hasta la fila actual y sus pares; sin ORDER BY, toda la partición | pg-sintaxis | §4.2.8 | ✅ | "all rows from the partition start up through the current row's last ORDER BY peer". Tutorial §3.5 muestra 4800 → 25700 duplicado. |
| 7 | Tarjeta t-marco-por-defecto; e-acumulado-empatadas (opción correcta y distractores) | pg-sintaxis | ídem | ✅ | Corrí el acumulado global: las dos filas del 27/03 dan 8600. |
| 8 | row_number: números únicos, empates en orden arbitrario | pg-funciones | citado §9.22 | ⚠️ | Lo de "orden no especificado para empates" está en el tutorial §3.5 ("tied rows numbered in an unspecified order"), no en §9.22. Ver H2. |
| 9 | rank da el mismo número a empatados y deja hueco; dense_rank no | pg-funciones | §9.22, Tabla 9.67 | ✅ | "rank… with gaps"; "dense_rank… without gaps". |
| 10 | Tarjetas t-rank-hueco, t-row-number-desempate; e-rank-con-empate (5, error 4) | pg-funciones | ídem | ✅ | Corrí la tabla del Norte: rn 1-5, rank 1,2,3,3,5, dense 1,2,3,3,4. Tarjeta t-rank-hueco tiene dos preguntas, ver H3. |
| 11 | lag trae el valor de la fila anterior; en la primera devuelve NULL (offset 1, default NULL) | pg-funciones | §9.22 | ✅ | |
| 12 | En consulta agrupada, toda columna fuera del GROUP BY va dentro de un agregado | pg-agrupar | §7.2.3 | ⚠️ | El manual dice "in general" y agrega una excepción (dependencia funcional con clave primaria, "but see below"). Simplificación aceptable pero presentada como "regla del manual". Ver H1. |
| 13 | WHERE filtra filas antes de agrupar, HAVING filtra grupos; no hay agregados en WHERE | pg-agrupar | tutorial §2.7 | ✅ | Texto literal del tutorial. Tarjeta t-where-vs-having ✅. |
| 14 | Las ventanas se evalúan después de GROUP BY y HAVING (ven filas agrupadas) | pg-agrupar | §7.2.5 | ✅ | También respalda la consulta `rank() OVER (… ORDER BY sum(monto))` con GROUP BY. |
| 15 | Las ventanas solo en SELECT y ORDER BY; para filtrar, subconsulta | pg-ventana | §3.5 | ✅ | Texto del tutorial, incluido el ejemplo `pos < 3`. |
| 16 | Tarjetas t-ventana-no-en-where, t-top-n-subconsulta; e-top2-por-region; e-vf-ventana-en-where | pg-ventana | ídem | ✅ | Contenido correcto; t-ventana-no-en-where junta dos preguntas, ver H3. Los 3 distractores de e-top2 son plausibles y sus explicaciones, correctas. |
| 17 | Orden mental FROM/WHERE → GROUP BY/HAVING → ventanas → ORDER BY; el orden de salida solo se garantiza con ORDER BY | pg-agrupar | §7.2.5 | ✅ | "It is not recommended to rely on this. Use an explicit top-level ORDER BY". |
| 18 | EMC arma un ranking con RANK() OVER (PARTITION BY…) sobre subconsulta con SUM y GROUP BY | emc-ds | cap. 11 §11.3.1, pp. 343-344 | ✅ | PDF pp. 363-364. |
| 19 | Totales por región (Centro 2500, Norte 4300, Sur 4500) y HAVING > 4000 | consulta | — | ✅ | Corrida. Norte 5 ventas, Sur 4. |
| 20 | pct de Eva 23/03 = 44,0; salen 12 filas | consulta | — | ✅ | Ver nota SQLite/PostgreSQL abajo. |
| 21 | Ranking por vendedor: Centro Eva 1800 / Fabi 700; Norte Ana 2700 / Bruno 1600; Sur Diego 2400 / Carla 2100 | consulta | — | ✅ | Corrida. |
| 22 | Acumulado del Norte: 1200, 2000, 3000, 3800, 4300 | consulta | — | ✅ | Corrida. e-acumulado-fila = 3800, error 4300 ✅. |
| 23 | Promedio móvil 3 filas; e-promedio-movil = 1133,33 (tol. 0,05), error 1080 | consulta | — | ✅ | Con `ORDER BY fecha ROWS BETWEEN 2 PRECEDING AND CURRENT ROW`, la 5.ª fila = (1500+900+1000)/3 = 1133,33; promedio de las cinco = 1080. |
| 24 | Top 2 por región con row_number y desempate por fecha | consulta | — | ✅ | Corrida; resultado determinista. |
| 25 | `numeric(10,2)` hace que PostgreSQL muestre dos decimales | PostgreSQL | tipos numéricos | ✅ | Comportamiento conocido de `sum` sobre numeric(10,2). |
| 26 | Problemas p-pg-tutorial-ventanas, p-pg-marco, p-emc-ranking | pg-ventana, pg-sintaxis, emc-ds | §3.5/§9.22; §4.2.8; pp. 343-344 | ✅ | Ubicaciones y URLs existen. Hacibles con datos propios. |
| 27 | Plagio | todas | — | ✅ | 0 secuencias de 6 palabras iguales en prosa; solo coinciden sintaxis SQL (`BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`) y títulos. |
| 28 | Estilo | GUIA-ESTILO | — | ✅ | Voz y orden correctos; ≈ 945 palabras. 2 V/F de 8 ejercicios. |
| 29 | `minutos: 25` | GUIA-ESTILO §2 | frontmatter | ⚠️ | Ver H4. |

Nota sobre SQL (SQLite vs PostgreSQL): todas las consultas del tema se ejecutan sin error en SQLite y dan los números del texto y del YAML. Ninguna usa sintaxis exclusiva de PostgreSQL; las ventanas, `ROWS BETWEEN`, `lag`, `rank` y `HAVING` son estándar. Diferencia a tener presente: `100 * monto / sum(...)` hace división entera en SQLite (Norte/Ana da 27,0) y decimal en PostgreSQL por el tipo `numeric` (27,9); el texto solo cita la fila de Eva (44,0), que es exacta en ambos, así que no hay error en el contenido. Conviene que el autor no agregue otros porcentajes sin recalcularlos con `numeric`.

Piezas revisadas: 29 filas (11 tarjetas, 8 ejercicios, 3 problemas, 7 consultas SQL y el cuerpo; sin casos, el área no los exige).

## Hallazgos abiertos

**H1 — Regla de GROUP BY presentada sin su excepción (baja/media).**
- Archivo/campo: `tema.mdx`, `<Formal>`, "Agregar: GROUP BY, WHERE y HAVING" ("Tres reglas del manual: … toda columna que no esté en el GROUP BY solo puede aparecer dentro de un agregado").
- Qué dice la fuente: §7.2.3: "In general, if a table is grouped, columns that are not listed in GROUP BY cannot be referenced except in aggregate expressions", y más abajo admite columnas funcionalmente dependientes cuando se agrupa por clave primaria.
- Corrección propuesta: "en general" o agregar "(salvo columnas que dependen funcionalmente de la clave por la que agrupás)".

**H2 — Ubicación del empate "arbitrario" de row_number (baja).**
- Archivo/campo: `tema.mdx`, `<Formal>` "Rankings", `<Cita f="pg-funciones" loc="§9.22" />` (la oración dice que row_number "desempata de forma arbitraria"); `practica.yaml`, tarjeta t-row-number-desempate (`fuente: pg-funciones`).
- Qué dice la fuente: §9.22 describe row_number solo como "the number of the current row within its partition". La frase "tied rows numbered in an unspecified order" está en el tutorial §3.5.
- Corrección propuesta: citar `pg-ventana` §3.5 para lo del desempate (en el texto y en la tarjeta).

**H3 — Tarjetas no atómicas (baja).**
- Archivo/campo: `practica.yaml`, `tarjetas` t-ventana-no-en-where (frente: "¿En qué cláusulas se permiten… y por qué no en WHERE?") y t-rank-hueco (frente pide dos respuestas, `rank()` y `dense_rank()`).
- Regla: GUIA-ESTILO §4.1 y §4.3 (una idea, respuesta única).
- Corrección propuesta: partir t-ventana-no-en-where en "¿En qué dos cláusulas se permiten las funciones de ventana?" y "¿Por qué no se pueden usar en WHERE?"; t-rank-hueco: dejar solo `rank()` (dorso "el 3") y, si importa, otra tarjeta para `dense_rank()`.

**H4 — `minutos` no cuadra con la fórmula (baja, no bloqueante).**
- Archivo/campo: `tema.mdx`, `minutos: 25`. Fórmula de la guía: 945/200 = 4,7 + 4 (2 simuladores) + 8 ejercicios = 16,7 → 15.
- Corrección propuesta: `minutos: 15`, o justificar contando el código.
