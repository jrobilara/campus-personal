# FUENTES — Análisis de datos
- Escritor: F3-analisis-datos · Fecha: 2026-11-11

Cómo leí las fuentes: las páginas web las abrí con WebFetch el 2026-11-11 (la herramienta devuelve un resumen de la página, no el HTML crudo, así que F4 conviene que abra las ubicaciones puntuales). El libro de EMC lo leí en un PDF de la biblioteca del dueño (435 páginas; las páginas que cito son las **impresas**, no el índice del PDF). Ningún texto fue copiado: todo es paráfrasis.

## limpieza-y-eda
| # | Afirmación clave (tu paráfrasis) | Dónde está | Fuente (id) | Ubicación exacta | Cómo la verificaste |
|---|---|---|---|---|---|
| 1 | El EDA es un enfoque para conocer los datos (estructura, rarezas) antes de concluir, sobre todo con gráficos. | Intuición | nist-eda | §1.1.1 What is EDA? | Abrí la página; dice que es una actitud/filosofía, con metas como detectar outliers, y mayormente gráfica. |
| 2 | `drop_duplicates` compara todas las columnas (o `subset`) y conserva la primera aparición. | Formal §1 | pandas-docs | DataFrame.drop_duplicates (pandas 3.1.1) | Abrí la referencia de la API: `keep='first'`, `subset=None`. |
| 3 | `dropna` descarta por defecto filas con algún NA; `subset` limita las columnas a mirar. | Formal §2 | pandas-docs | DataFrame.dropna | Abrí la referencia: `how='any'`, `axis=0`, `subset`. |
| 4 | Los estadísticos descriptivos de pandas ignoran los faltantes salvo `skipna=False`. | Formal §2; tarjeta t-pandas-skipna | pandas-docs | guía "Working with missing data", sección Calculations with NA | La página lo dice para `std` y para los descriptivos en general (no muestra un ejemplo de `mean`). |
| 5 | En R, `mean(x)` da `NA` si hay un faltante; se arregla con `na.rm=TRUE`. | Formal §2; tarjeta t-r-mean-na | emc-ds | cap. 3, §3.2.2, p. 86 | Leí la página impresa 86 en el PDF: ejemplo `mean(x)` → NA, `mean(x, na.rm=TRUE)` → 2.5. |
| 6 | Un pico de edades en cero o negativas suele ser un faltante guardado como 0/−1 por algún sistema. | Formal §2; tarjeta t-faltante-disfrazado | emc-ds | cap. 3, §3.2.2, pp. 85-86 | Leí las pp. 85-86: lo plantea como explicación probable y menciona NULL, NA, 0, −1, −2 entre sistemas. |
| 7 | Los datos raros se contrastan con el conocimiento del dominio antes de decidir si se eliminan. | Formal §3 | emc-ds | cap. 3, §3.2.2, p. 87 | Leí la p. 87 ("sanity checks against domain knowledge"). |
| 8 | Las vallas del diagrama de caja son Q1 − 1,5·IQR y Q3 + 1,5·IQR. | Formal §4, Formula; tarjeta t-valla-superior; ejercicio e-valla-superior | nist-eda | §1.3.3.7 Box Plot | Abrí la página: L1 = Q1 − 1.5·IQ, U1 = Q3 + 1.5·IQ. |
| 9 | Hay que investigar por qué aparece un atípico antes de sacarlo; puede ser informativo. | Formal §4; tarjeta t-marcar-no-borrar; ejercicio e-vf-outlier-se-borra | nist-outliers | §7.1.6 What are outliers in the data? | Abrí la página: advierte investigar antes de eliminar. |
| 10 | Conviene reemplazar el valor inválido por NA en vez de borrar la fila; y repetir el análisis con y sin extremos. | Formal §4; tarjetas t-reemplazar-por-na, t-sensibilidad-extremos; ejercicio e-media-sin-cuelgue | r4ds | cap. 10, §10.4 | Abrí el capítulo: desaconseja borrar la fila, recomienda NA y chequear sensibilidad. |
| 11 | Un faltante puede ser informativo; un 0 puede ser un faltante mal codificado. | Ojo (Intuición); ejercicio e-que-hacer-con-ceros | r4ds, emc-ds | r4ds §10.4; emc-ds §3.2.2 pp. 85-86 | R4DS: dimensiones 0 en diamonds eran faltantes; vuelos sin hora de salida = cancelados. |
| 12 | `Series.quantile` interpola linealmente por defecto. | Formal (Profundizar) | pandas-docs | Series.quantile | Abrí la referencia: `interpolation='linear'`. |
| 13 | Tarjeta t-unidades-antes-que-outliers (corregir unidades antes de buscar extremos). | tarjeta | — | — | Razonamiento propio (práctica), sin fuente puntual; F4 puede marcarla como criterio. |
| 14 | Ejercicios numéricos: media sin el 2400 = 482/9 = 53,56; media con horas corregidas = 515/6 = 85,8; valla superior = 130 + 1,5·90 = 265. | e-media-sin-cuelgue, e-media-con-horas, e-valla-superior | — | cálculo | Calculé en Python (`statistics`); el cálculo está como comentario en el YAML. |
| 15 | Caso c-excel-listo-para-analizar. | casos | r4ds, emc-ds | ídem 10-11 | La lección se apoya en las filas 6, 7, 9 y 10; los datos del escenario son inventados. |

### Fuentes del tema
- `r4ds`: Wickham, Çetinkaya-Rundel y Grolemund, *R for Data Science*, 2.ª ed., cap. 10. Acceso: versión abierta r4ds.hadley.nz/EDA.html. No pude confirmar el año de edición en la página.
- `emc-ds`: EMC Education Services, *Data Science and Big Data Analytics*, Wiley, 2015, cap. 3 §3.2.2. Acceso: PDF de la biblioteca del dueño. La página no dice número de edición.
- `nist-eda`: NIST/SEMATECH e-Handbook, §1.1.1 y §1.3.3.7. Acceso: web.
- `nist-outliers`: NIST/SEMATECH e-Handbook, §7.1.6. Acceso: web.
- `pandas-docs`: documentación de pandas 3.1.1 (guía de datos faltantes y referencia de `drop_duplicates`, `dropna`, `Series.quantile`). Acceso: web.
- `mckinney` (para ver más): McKinney, *Python for Data Analysis*, 3.ª ed., cap. 7 (§7.1 y §7.2). Acceso: versión abierta wesmckinney.com/book. Solo leí el índice de secciones y el resumen de `isna`, `dropna`, `drop_duplicates` y filtrado de outliers.

### Números y datos inventados para ejemplos
- "200 tickets", 8 repetidos, 6 vacíos, 3 en horas y 2 de más de 2000 min: son los del dataset `tickets-sucios` del simulador (contrato de SIMULADORES.md); el tema los usa como ilustrativos.
- Los 10 tiempos del ejercicio e-media-sin-cuelgue, los 6 de e-media-con-horas y Q1 = 40 / Q3 = 130: inventados.
- Escenario del caso c-excel-listo-para-analizar (los 2 tickets de 2000 minutos como caída de fin de semana): inventado.

## elegir-el-grafico
| # | Afirmación clave (tu paráfrasis) | Dónde está | Fuente (id) | Ubicación exacta | Cómo la verificaste |
|---|---|---|---|---|---|
| 1 | Cada pregunta (cantidades, distribuciones, proporciones, relaciones x-y, tiempo) tiene su gráfico natural. | Intuición; Formal (tabla); tarjeta t-pregunta-decide | wilke | cap. 5 (Directory of visualizations), §5.1-§5.4 | Abrí el capítulo: barras para cantidades, histogramas/cajas para distribuciones, tortas/barras para proporciones, dispersión para x-y, líneas si x es tiempo. |
| 2 | La barra empieza en cero porque su largo es el valor; si no, exagera diferencias. | Formal; tarjeta t-barras-cero; ejercicios e-barra-truncada, e-vf-barra-recortada | wilke | cap. 17, §17.1 | Abrí el capítulo (principio de la tinta proporcional). |
| 3 | Sin orden natural, ordenar barras por valor; etiquetas largas → barras horizontales. | Formal; tarjetas t-orden-barras, t-etiquetas-largas; ejercicio e-barras-sucursales | wilke | cap. 6, §6.1 | Abrí el capítulo. |
| 4 | El gráfico de puntos no necesita cero. | Formal; tarjeta t-puntos-sin-cero | wilke | cap. 6, §6.3; cap. 17 | Abrí cap. 6 (dot plots no requieren cero) y cap. 17 (el principio no aplica a puntos). |
| 5 | Las líneas resaltan el orden; con varias series conviene etiquetar directo; el área rellena exige eje en cero. | Formal; tarjetas t-etiqueta-directa; veredicto de líneas | wilke | cap. 13, §13.1 y §13.2 | Abrí el capítulo. |
| 6 | La torta sirve para fracciones simples y pocas porciones; falla para comparar rebanadas parecidas y entre años. | Formal; tarjetas t-torta-cuando, t-torta-falla; ejercicio e-vf-torta-nunca; veredicto de torta | wilke | cap. 10, §10.1 y §10.2 | Abrí el capítulo (ejemplos del Bundestag y de cinco empresas). |
| 7 | Se juzgan mejor distancias que áreas; las tortas hacen parecer menores las diferencias que las barras. | Formal; tarjeta t-distancia-vs-area | wilke | cap. 17, §17.3 | Abrí el capítulo. |
| 8 | El ángulo de una rebanada es 360° × proporción. | Formal | wilke | cap. 17, §17.3 (rebanada proporcional al valor) | Geometría; ejercicio e-angulo-rebanada calculado en Python: 520/1500·360 = 124,8°. |
| 9 | Exploración (técnica) y presentación (simple, centrada en el mensaje) son públicos distintos. | Formal; tarjeta t-explorar-vs-presentar | emc-ds | cap. 3, §3.2.5, pp. 99-100 | Leí las pp. 99-100 en el PDF. |
| 10 | Veredictos de SimDatos (barras regular, líneas bien, torta mal, dispersión regular). | Intuición (props del simulador) | wilke | cap. 5 §5.1 y §5.4; cap. 10 §10.2; cap. 13 §13.1-13.2 | Cada veredicto lleva la cita en su texto. "72 barras" = 24 meses × 3 regiones. Son criterio de diseño respaldado en esas secciones. |
| 11 | Ejercicio e-barra-truncada: con eje desde 90, alturas 20 y 10 → razón 2; razón real 1,1. | ejercicio | wilke | cap. 17 | Cálculo en Python (comentario en el YAML). |

### Fuentes del tema
- `wilke`: Claus O. Wilke, *Fundamentals of Data Visualization*, O'Reilly, cap. 5, 6, 10, 13 y 17. Acceso: versión abierta clauswilke.com/dataviz. La página no muestra el año; no lo puse en el frontmatter.
- `emc-ds`: ver arriba (cap. 3, §3.2.5; la tabla 3-4 de §3.2.3, p. 88, la leí pero no la cito).

### Números y datos inventados para ejemplos
- Ventas de 24 meses y 3 regiones: coinciden con `ventas-mensuales` del simulador (no inventé valores).
- Norte 520, Sur 480 y Centro 500 (e-angulo-rebanada); 34,7 % y 32 % en el texto: inventados.

## sql-analitico
| # | Afirmación clave (tu paráfrasis) | Dónde está | Fuente (id) | Ubicación exacta | Cómo la verificaste |
|---|---|---|---|---|---|
| 1 | GROUP BY colapsa filas por grupo; una función de ventana calcula sobre filas relacionadas sin colapsarlas. | Intuición; tarjetas t-group-by-colapsa, t-ventana-conserva-filas; ejercicios e-filas-con-ventana, e-vf-mismas-filas | pg-ventana | §3.5 | Abrí el tutorial: "rows retain their separate identities". |
| 2 | Sin OVER es un agregado común; OVER marca la función de ventana. | Formal; tarjeta t-over-define-ventana | pg-ventana | §3.5 | Ídem. |
| 3 | Sin PARTITION BY hay una sola partición con todas las filas. | Formal; tarjeta t-partition-by-omitido | pg-ventana | §3.5 | Ídem. |
| 4 | Sintaxis: PARTITION BY, ORDER BY y marco (RANGE/ROWS/GROUPS). | Formal | pg-sintaxis | §4.2.8 | Abrí la sección con la gramática. |
| 5 | Marco por defecto con ORDER BY: desde el inicio hasta la fila actual y sus pares; sin ORDER BY, toda la partición. | Formal (acumulados); tarjeta t-marco-por-defecto; ejercicio e-acumulado-empatadas | pg-sintaxis | §4.2.8, "default framing option" | Abrí la sección; además el tutorial §3.5 muestra el caso de los empatados (4800 → 25700 en ambas filas). |
| 6 | row_number da números únicos (desempate arbitrario); rank da el mismo número a empatados y deja hueco; dense_rank no deja hueco. | Formal (rankings); tarjetas t-rank-hueco, t-row-number-desempate; ejercicio e-rank-con-empate | pg-funciones | §9.22, Tabla 9.67 y notas | Abrí la página (PostgreSQL 18.6). |
| 7 | lag trae el valor de la fila anterior; con offset 1 y default NULL devuelve NULL en la primera fila. | Formal; tarjeta t-lag-primera-fila | pg-funciones | §9.22, Tabla 9.67 | Ídem. |
| 8 | En una consulta agrupada, toda columna fuera del GROUP BY va dentro de un agregado. | Formal (Agregar) | pg-agrupar | §7.2.3 | Abrí la sección. |
| 9 | WHERE filtra filas antes de agrupar; HAVING filtra grupos; no hay agregados en WHERE. | Formal; tarjeta t-where-vs-having | pg-agrupar | tutorial §2.7 | Abrí el tutorial (ejemplo de weather con HAVING max(temp_lo) < 40). |
| 10 | Las ventanas se evalúan después de GROUP BY y HAVING (ven las filas agrupadas). | Formal (ranking agrupado y Profundizar) | pg-agrupar | §7.2.5 | Abrí la sección. |
| 11 | Las ventanas solo van en SELECT y ORDER BY; para filtrar por ellas, subconsulta. | Formal (Filtrar por una ventana); tarjetas t-ventana-no-en-where, t-top-n-subconsulta; ejercicios e-top2-por-region, e-vf-ventana-en-where | pg-ventana | §3.5 | Abrí el tutorial (ejemplo top 2 por departamento con `pos < 3`). |
| 12 | El libro de EMC arma un ranking con RANK() OVER (PARTITION BY ...) sobre una subconsulta con SUM y GROUP BY. | Formal (ranking agrupado); problema p-emc-ranking | emc-ds | cap. 11, §11.3.1, pp. 343-344 | Leí esas páginas en el PDF. |
| 13 | Todos los resultados de las consultas (totales, rankings, acumulados, promedios móviles, lag, top 2, porcentajes). | Formal; ejercicios numéricos | — | cálculo | Corrí las consultas sobre la tabla de 12 filas en **SQLite 3.45**, no en PostgreSQL (no tengo PostgreSQL ni acceso a Docker en esta PC). La sintaxis usada es estándar (ventanas, `ROWS BETWEEN`, `lag`, `rank`) y la contrasté con las páginas de PostgreSQL 18. Comentario en el YAML. |

### Fuentes del tema
- `pg-ventana`, `pg-funciones`, `pg-sintaxis`, `pg-agrupar`: documentación de PostgreSQL 18 (versión "current" al 2026-11-11), secciones indicadas. Acceso: web.
- `emc-ds`: ver arriba (cap. 11, §11.3.1).

### Números y datos inventados para ejemplos
- La tabla `ventas` de 12 filas (marzo 2026, 6 vendedores, montos en miles de pesos) es inventada. **No es la tabla del simulador** (`SimTablaSQL tabla="ventas"`, 12 filas definidas por F2): usa las mismas columnas (`fecha`, `region`, `vendedor`, `monto`) pero los valores de F2 pueden diferir. El texto no promete lecturas del simulador.

## regresion-y-causalidad
| # | Afirmación clave (tu paráfrasis) | Dónde está | Fuente (id) | Ubicación exacta | Cómo la verificaste |
|---|---|---|---|---|---|
| 1 | El residuo es observado menos predicho. | Formal; tarjeta t-residuo-definicion; ejercicio e-residuo-anscombe | openintro | §8.1 | Abrí la sección. |
| 2 | Mínimos cuadrados minimiza la suma de cuadrados de los residuos. | Formal; tarjeta t-minimos-cuadrados | emc-ds | cap. 6, §6.1.1, p. 164 (ec. 6-3) | Leí la p. 164 en el PDF. |
| 3 | b1 = r·sy/sx; b0 = ȳ − b1·x̄; la recta pasa por (x̄, ȳ). | Formal (Formula); tarjetas t-pendiente-desde-r, t-recta-pasa-por-medias; ejercicios e-pendiente-vpn, e-prediccion-vpn | openintro | §8.2 | Abrí la sección: fórmula de la pendiente y del punto de medias. |
| 4 | r va de −1 a 1 y mide fuerza lineal; no capta bien relaciones curvas. | Formal; tarjeta t-r-solo-lineal | openintro | §8.1 | Abrí la sección. |
| 5 | R² = proporción de variación explicada; con R = −0,499, R² ≈ 0,25. | Formal; tarjeta t-r-cuadrado-significado; ejercicio e-r-cuadrado | openintro | §8.2 | Abrí la sección (ejemplo Elmhurst). Que R² = r² en la simple lo infiero del mismo ejemplo y del ejercicio con R = −0,97 → 0,9409. |
| 6 | Interpretación de la pendiente; el intercepto solo tiene sentido si x = 0 es razonable. | Formal | openintro | §8.2 | Abrí la sección. |
| 7 | Condiciones: tendencia lineal, residuos casi normales, dispersión constante, independencia (cuidado con series temporales). | Formal | openintro | §8.2 | Abrí la sección. |
| 8 | Diagnóstico: graficar residuos contra ajustados; curvas o dispersión creciente = problema. | Formal | emc-ds | cap. 6, §6.1.3, pp. 173-175 | Leí esas páginas. |
| 9 | Anscombe armó el cuarteto en 1973 para mostrar la importancia de graficar. | Formal; tarjeta t-anscombe-leccion | emc-ds | cap. 3, §3.2.1, p. 82 | Leí la página. El brief pedía citar Anscombe vía libro o curso: lo hago por EMC. |
| 10 | Los cuatro conjuntos: media x = 9, media y = 7,50, var y ≈ 4,12-4,13, r = 0,816, recta y = 3,00 + 0,50x. | Formal (tabla); ejercicios e-residuo-anscombe, e-vf-mismo-r-mismo-grafico, e-vf-r2-linealidad | emc-ds | cap. 3, Tabla 3-3, pp. 82-83 | Leí la tabla; además recalculé con los datos de la p. 84 en Python: r = 0,816-0,817 y recta 3,00 + 0,50x en los cuatro. |
| 11 | Descripción de cada conjunto: I razonable, II no lineal, III un atípico en x = 13, IV solo dos valores de x. | Formal; Intuición | emc-ds | cap. 3, §3.2.1, p. 83 | Leí la página. |
| 12 | Alto apalancamiento: punto lejos en x que tira de la recta; es influyente si al sacarlo la recta cambia. | Formal | openintro | §8.3 | Abrí la sección. |
| 13 | Sin el punto (13; 12,74) del conjunto III, la pendiente baja de 0,50 a 0,35 y r ≈ 1. | Formal | — | cálculo propio | Calculé con `statistics.linear_regression` sobre los datos publicados (pendiente 0,3454; intercepto 4,0056; r = 0,99999). |
| 14 | Estudio observacional: solo asociaciones o hipótesis; variable confusora = relacionada con la explicativa y la respuesta; ejemplo protector solar / exposición al sol. | Intuición; Formal; tarjetas t-confusora-definicion, t-observacional-limite; ejercicio e-causa-helado | openintro | §1.3 (subsección Observational studies) | Abrí la sección. El ejemplo helado/golpes de calor es mío (análogo). |
| 15 | La asignación al azar reparte las diferencias no controladas y permite atribuir la diferencia al tratamiento. | Formal; tarjeta t-azar-causalidad; ejercicio e-evidencia-causal; caso c-vpn-incidentes | openintro | §1.4 (Experiments) | Abrí la sección (principios de diseño, aleatorización). |
| 16 | Que variables sirvan para predecir no implica que causen ("correlation does not imply causation", ejemplo del dentista). | Formal | emc-ds | cap. 6, §6.4, p. 188 | Leí la página. |
| 17 | No extrapolar fuera del rango de los datos. | Formal; tarjeta t-extrapolar-riesgo | openintro, emc-ds | openintro §8.2; emc-ds §6.4 p. 188 | Ambos lo advierten. |
| 18 | Ignorar casos inusuales pero reales suele dar modelos pobres. | Formal | openintro | §8.3 | Abrí la sección. |
| 19 | Los R² de los cuatro conjuntos de Anscombe son ≈ 0,67 (0,666-0,667). | ejercicio e-vf-r2-linealidad | emc-ds | cap. 3, Tabla 3-3 | Derivado de r = 0,816; recalculado en Python sobre los datos de la p. 84. |
| 20 | Ejercicios VPN: b1 = 0,75·8/60 = 0,10; b0 = 20 − 0,10·300 = −10; predicción a 350 = 25; R² = 0,36. | ejercicios | — | cálculo | Python; comentario en el YAML. |
| 21 | Caso c-vpn-incidentes. | casos | openintro | §1.3, §1.4 | Lección apoyada en filas 14-15 y 17; escenario inventado. |

### Fuentes del tema
- `openintro`: Diez, Barr y Çetinkaya-Rundel, *OpenIntro Statistics*, 4.ª ed. Acceso: versión abierta en LibreTexts (stats.libretexts.org, "Introduction to Statistics 4e (Diez et al.)"). La página no indica el año ni la editorial; no los puse. Los números de subsección dentro de §8.2 que usé son los títulos de la página, sin numerar.
- `emc-ds`: ver arriba (cap. 3 §3.2.1; cap. 6 §6.1 y §6.4).

### Números y datos inventados para ejemplos
- La VPN (90 días, medias 300 y 20, desvíos 60 y 8, r = 0,75/0,8) y todo el escenario del caso: inventados.
- Ventas de helado y golpes de calor: del dataset `confusora-temperatura` del simulador; no inventé valores.
- Datos de Anscombe: publicados en EMC p. 84.

## Pedidos al director
- Prop `veredictos` de `SimDatos`: la escribí como objeto literal en MDX (`veredictos={{ barras: {...} }}`) y valida. Cada `porque` lleva la cita de Wilke en el texto, como pedía el brief.
- `SimTablaSQL`: el contrato dice que la tabla `ventas` es de 12 filas definidas por F2. Mi tabla de ejemplo (12 filas) tiene valores propios; si F2 genera otros, las lecturas del simulador no coinciden con los números del texto (el texto no los cita).
- No pude ejecutar PostgreSQL, pandas ni R (no están instalados y Docker no responde por permisos): las consultas se probaron en SQLite 3.45 y el código pandas del tema 1 se revisó contra la documentación, sin ejecutarse. F4 podría correr ambos.
- El esquema `edicion` es obligatorio en libros; para R4DS, Wilke, McKinney y OpenIntro no pude confirmar el año en la página, así que la edición va sin año.
- El `<Formula>` del tema 1 usa `{,}` dentro de `tex`; compiló en KaTeX sin error.

## Libros que conviene pedirle al dueño
- Silberschatz, Korth y Sudarshan, *Database System Concepts* (7.ª ed., 2019): capítulo de SQL avanzado, para respaldar `sql-analitico` con un libro de cátedra (hoy se apoya en la documentación de PostgreSQL y en el libro de EMC).
- Freedman, Pisani y Purves, *Statistics* (4.ª ed., 2007): capítulos de correlación, regresión y observación vs experimento, para `regresion-y-causalidad` (hoy: OpenIntro y EMC).
- Montgomery y Runger, *Applied Statistics and Probability for Engineers*: capítulo de regresión lineal simple (fórmulas y diagnóstico con rigor de ingeniería).
- Un libro clásico de visualización con capítulos citables (Cleveland, *The Elements of Graphing Data*, o Tufte, *The Visual Display of Quantitative Information*): refuerza `elegir-el-grafico`, hoy apoyado casi todo en Wilke.
