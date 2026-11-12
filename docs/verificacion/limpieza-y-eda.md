# Verificación F4 — analisis-datos/limpieza-y-eda

- **Tema:** analisis-datos/limpieza-y-eda
- **Fecha:** 2026-11-11
- **Verificador:** F4 (agente distinto del autor)
- **Veredicto:** OBSERVADO

Archivos revisados: `src/content/temas/analisis-datos/limpieza-y-eda/tema.mdx` y `practica.yaml` (commit b885f09).
Método: fuentes web descargadas en crudo (NIST, pandas 3.1.1, R4DS cap. 10, McKinney cap. 7); libro EMC leído en el PDF local (`pdftotext`; página impresa = página del PDF − 20); cálculos rehechos con Python (`statistics`); búsqueda automática de secuencias de 6 palabras iguales a las fuentes (plagio).

## Afirmaciones revisadas

| # | Afirmación | Fuente | Ubicación | Resultado | Nota |
|---|---|---|---|---|---|
| 1 | EDA = enfoque/actitud para conocer los datos, sobre todo gráfico, que detecta atípicos y supuestos | nist-eda | §1.1.1 | ✅ | NIST: "approach/philosophy… mostly graphical… detect outliers and anomalies". "Antes de calcular nada importante" es paráfrasis algo libre, pero compatible. |
| 2 | Tarjeta t-eda-objetivo | nist-eda | §1.1.1 | ✅ | |
| 3 | `drop_duplicates` compara todas las columnas o `subset`, conserva la primera | pandas-docs | DataFrame.drop_duplicates | ✅ | `subset=None`, `keep='first'`. |
| 4 | Tarjeta t-drop-duplicates-primero | pandas-docs | ídem | ✅ | |
| 5 | `dropna` descarta por defecto filas con algún NA; `subset` limita columnas | pandas-docs | DataFrame.dropna | ✅ | `axis=0`, `how` por defecto 'any'. |
| 6 | `isna` marca faltantes | pandas-docs | guía Working with missing data | ✅ | |
| 7 | Los descriptivos de pandas ignoran faltantes salvo `skipna=False` | pandas-docs | guía missing data | ⚠️ | El contenido es correcto (ejemplo con `std`). El `loc` dice "Calculations with NA"; la sección se llama "Calculations with missing data". Cosmético. |
| 8 | Tarjeta t-pandas-skipna | pandas-docs | ídem | ✅ | |
| 9 | En R `mean(x)` da NA con un faltante; `na.rm=TRUE` lo arregla | emc-ds | cap. 3 §3.2.2, p. 86 | ✅ | PDF p. 106: `mean(x)` → NA; `na.rm=TRUE` → 2.5. |
| 10 | Tarjeta t-r-mean-na | emc-ds | ídem | ✅ | |
| 11 | Pico de edades en 0 o negativas = faltante guardado como 0/−1 | emc-ds | §3.2.2, pp. 85-86 | ✅ | El libro lo plantea como probable ("likely evidence of missing data") y menciona NULL, NA, 0, −1, −2. |
| 12 | Tarjeta t-faltante-disfrazado | emc-ds | ídem | ✅ | |
| 13 | Contrastar datos raros con conocimiento del dominio antes de eliminar | emc-ds | §3.2.2, p. 87 | ✅ | "sanity checks against domain knowledge". |
| 14 | Vallas Q1−1,5·IQR y Q3+1,5·IQR; marcado fuera de ellas | nist-eda | §1.3.3.7 Box Plot | ✅ | NIST: L1/U1 (inner fences), "box plots with fences". |
| 15 | Tarjeta t-valla-superior | nist-eda | ídem | ✅ | |
| 16 | Investigar por qué aparece un atípico antes de sacarlo; puede ser informativo | nist-outliers | §7.1.6 | ✅ | |
| 17 | Tarjeta t-marcar-no-borrar y e-vf-outlier-se-borra | nist-outliers | ídem | ✅ | Justificación del V/F correcta. |
| 18 | Preferir reemplazar el valor inválido por NA antes que borrar la fila | r4ds | §10.4 | ✅ | "We don't recommend this option because one invalid value doesn't imply…". |
| 19 | Tarjeta t-reemplazar-por-na | r4ds | §10.4 | ✅ | |
| 20 | Repetir el análisis con y sin extremos | r4ds | citado §10.4 | ⚠️ | Está en §10.3.2 (Unusual values), no en §10.4. Ver H1. |
| 21 | Tarjeta t-sensibilidad-extremos; ejercicio e-media-sin-cuelgue (fuente r4ds) | r4ds | sin `loc` | ⚠️ | Mismo problema que la fila 20. |
| 22 | Un faltante puede ser informativo (ticket sin minutos = abierto) | r4ds | §10.4 | ✅ | R4DS: `dep_time` NA = vuelo cancelado. |
| 23 | Un 0 puede ser un faltante mal codificado (diamonds x,y,z = 0) | r4ds / emc-ds | FUENTES dice r4ds §10.4 | ⚠️ | En R4DS está en §10.3.2. En EMC pp. 85-86 está bien. Afecta la explicación de e-que-hacer-con-ceros ("lo muestran EMC y R4DS": verdadero, solo cambia la sección). Ver H1. |
| 24 | `Series.quantile` interpola linealmente por defecto | pandas-docs | Series.quantile | ✅ | `interpolation='linear'`. |
| 25 | Otras herramientas usan otra convención de cuartiles | nist-outliers | (implícito) | ✅ | NIST usa posición (N+1)·p; pandas, la lineal. Coherente. |
| 26 | "Un '3' que en realidad es 180 cae bajo la valla inferior y lo tomás por un error" | propia | Formal, párrafo tras el código | ❌ | Con tiempos en minutos y Q1 > 0 la valla inferior es negativa (con los propios Q1 = 40, Q3 = 130: 40 − 135 = −95), así que un "3" no cae bajo ella. Ver H2. |
| 27 | Tarjeta t-unidades-antes-que-outliers | sin fuente (criterio) | — | ⚠️ | Dorso hedgeado ("puede parecer un extremo, o esconderse entre los normales"): aceptable. Sin respaldo, como el autor declara. |
| 28 | Dataset tickets-sucios: 200 → 192 → 186 filas | SIMULADORES.md | contrato | ✅ | 8 duplicados, 6 vacíos no duplicados. |
| 29 | e-media-sin-cuelgue = 53,56 (tol. 0,05) | cálculo | — | ✅ | Recalculé: 482/9 = 53,5556. Errores comunes 288,2 (con 2400) y 52,5 (mediana de los diez) verificados. |
| 30 | e-media-con-horas = 85,8 (tol. 0,1) | cálculo | — | ✅ | 515/6 = 85,833; error común 36,7 (220/6) verificado. |
| 31 | e-valla-superior = 265 (tol. 0,5) | cálculo | — | ✅ | 130 + 1,5·90 = 265; errores 220 y 135 verificados. |
| 32 | e-que-hacer-con-ceros: opción correcta y explicaciones de distractores | emc-ds | pp. 85-86 | ✅ | Los 3 distractores son plausibles y sus explicaciones, correctas. |
| 33 | Caso c-excel-listo-para-analizar: decisiones "buenas" (preguntar causas, informar con y sin los 2 tickets) | r4ds, emc-ds, nist-outliers | — | ✅ | Coincide con lo que recomiendan las tres fuentes. 181 de 200 = 200 − 8 − 6 − 3 − 2 ✅. Profundidad del mejor camino: 3 decisiones. |
| 34 | Problemas p-limpieza-pandas, p-r4ds-preguntas, p-emc-dirty-data: ubicaciones | mckinney, r4ds, emc-ds | §7.1/§7.2; §10.3-10.5; pp. 85-87 | ✅ | Las secciones existen con esos títulos; URLs responden 200. Uno es hacible con datos propios. |
| 35 | Plagio | todas | — | ✅ | 0 secuencias de 6 palabras iguales en el cuerpo y en el YAML (solo coinciden títulos de libros y URLs). |
| 36 | Estilo: orden caso real → intuición → formal; voseo; largos | GUIA-ESTILO | — | ✅ | Cuerpo ≈ 890 palabras (700-1500). Voz correcta. |
| 37 | `minutos: 15` | GUIA-ESTILO §2 | frontmatter | ⚠️ | Ver H3. |

Afirmaciones y piezas revisadas: 37 filas (cubren 10 tarjetas, 5 ejercicios, 1 caso, 3 problemas y el cuerpo).

## Hallazgos abiertos

**H1 — Ubicación de R4DS (media).**
- Archivo/campo: `tema.mdx`, `<Formal>` cuarto problema ("Marcado no es borrado…", la `<Cita f="r4ds" loc="§10.4" />` al final); también `tema.mdx` frontmatter `fuentes[0].ubicacion` y `docs/modulos/v1/fuentes/FUENTES-analisis-datos.md` filas 10-11.
- Qué está mal: la oración conjunta cita §10.4 para "reemplazar por NA" (correcto) y para "repetir el análisis con y sin los extremos" (incorrecto). Lo segundo, y el ejemplo de los 0 en diamonds, están en §10.3.2.
- Qué dice la fuente: §10.3.2: "It's good practice to repeat your analysis with and without the outliers…" y "discovered missing data that was coded as 0". §10.4: no borrar la fila, reemplazar por NA, y el ejemplo de vuelos cancelados.
- Corrección propuesta: `loc="§10.3.2 y §10.4"` en esa cita, ubicación del frontmatter "cap. 10, §10.3.2 y §10.4", y corregir la fila 11 de FUENTES.

**H2 — Afirmación técnica incorrecta sobre la valla inferior (media).**
- Archivo/campo: `tema.mdx`, `<Formal>`, párrafo "Corregir unidades va antes de buscar extremos…".
- Qué está mal: dice que un "3" (en realidad 180 min) "cae bajo la valla inferior y lo tomás por un error". Con tiempos de resolución positivos, Q1 − 1,5·IQR suele ser negativo; con los datos del propio tema (Q1 = 40, Q3 = 130) es −95, y el 3 no queda marcado.
- Qué dice la fuente: NIST §1.3.3.7 define L1 = Q1 − 1,5·IQ; nada garantiza que sea positiva.
- Corrección propuesta: reescribir el motivo real del orden: "un valor en la unidad equivocada puede quedar escondido entre los normales (un 3 no se ve como extremo) y, a la vez, los 2000+ inflan el IQR y las vallas; conviene corregir unidades primero para que las vallas se calculen sobre datos comparables". Ajustar en consecuencia el dorso de t-unidades-antes-que-outliers (ya es prudente).

**H3 — `minutos` no cuadra con la fórmula de la guía (baja, no bloqueante).**
- Archivo/campo: `tema.mdx`, frontmatter `minutos: 15`.
- Qué está mal: guía §2: lectura (≈ 890 palabras / 200 ≈ 4,5) + 2 por simulador (1) + 1 por ejercicio (5) ≈ 11,5, redondeado a 5 → 10.
- Corrección propuesta: `minutos: 10`, o dejar 15 si el escritor justifica contar el código.

**H4 — `loc` cosmético (baja, no bloqueante).**
- Archivo/campo: `tema.mdx`, `<Cita f="pandas-docs" loc="Calculations with NA" />`.
- La sección se llama "Calculations with missing data" en pandas 3.1.1. Corregir el `loc`.
