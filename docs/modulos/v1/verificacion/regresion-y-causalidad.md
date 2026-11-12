# Verificación F4 — analisis-datos/regresion-y-causalidad

- **Tema:** analisis-datos/regresion-y-causalidad
- **Fecha:** 2026-11-11
- **Verificador:** F4 (agente distinto del autor)
- **Veredicto:** APROBADO (re-verificado en 75bc28a)
- **Veredicto de la primera pasada (f3ad672):** OBSERVADO

Archivos revisados: `src/content/temas/analisis-datos/regresion-y-causalidad/tema.mdx` y `practica.yaml` (commit b885f09).
Método: OpenIntro Statistics 4e (LibreTexts §1.3, §1.4, §8.1, §8.2, §8.3, §8.5) descargado en crudo; EMC leído en el PDF local (cap. 3 pp. 82-84; cap. 6 pp. 163-164, 173-175, 188-189); todos los cálculos rehechos con Python (`statistics.linear_regression`, `correlation`) usando los datos de Anscombe de la p. 84 del libro; búsqueda de secuencias de 6 palabras iguales a las fuentes.

## Afirmaciones revisadas

| # | Afirmación | Fuente | Ubicación | Resultado | Nota |
|---|---|---|---|---|---|
| 1 | Residuo = observado − predicho | openintro | §8.1 | ✅ | "difference of the observed response and the response we would predict". Tarjeta t-residuo-definicion ✅. |
| 2 | Mínimos cuadrados minimiza la suma de cuadrados de los residuos | emc-ds | citado §6.1.1, p. 164 | ⚠️ | El contenido es correcto (ec. 6-3, p. 164). Pero esa página está en §6.1.2 "Model Description" (el índice del libro: 6.1.1 Use Cases p. 162, 6.1.2 Model Description p. 163). Ver H1. Tarjeta t-minimos-cuadrados, igual. |
| 3 | b1 = r·sy/sx; b0 = ȳ − b1·x̄; la recta pasa por (x̄, ȳ) | openintro | §8.2 | ✅ | Texto: "b1 = (sy/sx)R" y "the point (x̄, ȳ) is on the least squares line". Tarjetas t-pendiente-desde-r, t-recta-pasa-por-medias ✅. |
| 4 | r va de −1 a 1, mide fuerza lineal; no capta bien relaciones curvas | openintro | §8.1 | ✅ | Tarjeta t-r-solo-lineal ✅ (junta "qué mide" y "qué no capta", leve). |
| 5 | R² = proporción de variación explicada; con r = −0,499, R² ≈ 0,25 | openintro | §8.2 | ✅ | Ejemplo Elmhurst textual. R² = r² en regresión simple: consistente con el ejemplo y con el cálculo propio. Tarjeta t-r-cuadrado-significado ✅. |
| 6 | Interpretación de la pendiente; el intercepto solo tiene sentido si x = 0 es razonable | openintro | §8.2 | ✅ | |
| 7 | Condiciones: linealidad, residuos casi normales, dispersión constante, independencia (series temporales) | openintro | §8.2 | ✅ | |
| 8 | Diagnóstico: residuos contra ajustados; curvas o dispersión creciente = problema | emc-ds | §6.1.3, pp. 173-175 | ✅ | PDF pp. 193-195: tendencia no lineal (Fig. 6-7) y varianza creciente (Fig. 6-10). |
| 9 | Anscombe armó el cuarteto en 1973 para mostrar la importancia de graficar | emc-ds | §3.2.1, p. 82 | ✅ | Textual. Tarjeta t-anscombe-leccion ✅. |
| 10 | Tabla: media x = 9, media y = 7,50, var y ≈ 4,12, r = 0,816, recta y = 3,00 + 0,50x | emc-ds | Tabla 3-3, pp. 82-83 | ✅ | El libro: "4.12 or 4.13". Recalculé con los datos de la p. 84: var y 4,123-4,128, r 0,8162-0,8165, recta 3,000-3,003 + 0,4997-0,5001x en los cuatro. (La tabla del libro tiene una errata, "Variance of y 11" en vez de x; el tema no la reproduce.) |
| 11 | Descripción de cada conjunto: I razonable, II no lineal, III un atípico en x = 13, IV casi todo en un x | emc-ds | §3.2.1, p. 83 | ✅ | El libro: "only points at two x values". |
| 12 | Alto apalancamiento: punto lejos en x que tira de la recta; influyente si al sacarlo la recta cambia | openintro | §8.3 | ✅ | |
| 13 | Sin el punto (13; 12,74) del conjunto III: pendiente 0,50 → 0,35, r ≈ 1 | cálculo propio | — | ✅ | Recalculé: pendiente 0,3454, intercepto 4,0056, r = 0,99999. |
| 14 | Estudio observacional: solo asociaciones o hipótesis; confusora = relacionada con la explicativa y la respuesta; ejemplo protector solar | openintro | §1.3 | ✅ | Textual casi: "correlated with both the explanatory and response variables". Tarjetas t-confusora-definicion, t-observacional-limite ✅. |
| 15 | La asignación al azar reparte diferencias no controladas y permite atribuir la diferencia al tratamiento | openintro | §1.4 | ✅ | "Randomization… to account for variables that cannot be controlled"; "fundamentally important when trying to show a causal connection". Tarjeta t-azar-causalidad ✅. |
| 16 | Variables que predicen no implican que causen (dentista) | emc-ds | citado §6.4, p. 188 | ❌ | El pasaje del dentista y "Correlation does not imply causation" está en la p. 189, dentro de §6.3 "Reasons to Choose and Cautions" (la p. 188 trae §6.3 apenas empezada; §6.4 empieza más abajo en la p. 189, después del pasaje). Ver H2. |
| 17 | No extrapolar fuera del rango de los datos | openintro, emc-ds | openintro §8.2; emc-ds citado §6.4 p. 188 | ⚠️ | OpenIntro §8.2 ("Extrapolation is treacherous") ✅. EMC: mismo pasaje de la p. 189, §6.3. Tarjeta t-extrapolar-riesgo usa openintro ✅. |
| 18 | Ignorar casos inusuales pero reales da modelos pobres | openintro | §8.3 | ✅ | "Models that ignore exceptional (and interesting) cases often perform poorly". |
| 19 | e-pendiente-vpn = 0,10 (tol. 0,005); error común 5,625 | cálculo | — | ✅ | 0,75·8/60 = 0,10; 0,75·60/8 = 5,625. |
| 20 | e-prediccion-vpn = 25 (tol. 0,5); error común 35 | cálculo | — | ✅ | b0 = 20 − 0,10·300 = −10; −10 + 35 = 25; sin intercepto 35. |
| 21 | e-residuo-anscombe = −1,92 (tol. 0,05); errores 1,92 y 9,5 | cálculo | — | ✅ | 7,58 − (3 + 0,5·13) = −1,92. |
| 22 | e-r-cuadrado = 36 % (tol. 0,5); error 60 | cálculo | — | ✅ | (−0,6)² = 0,36. |
| 23 | e-causa-helado, e-evidencia-causal: opción correcta y explicaciones de distractores | openintro | §1.3, §1.4 | ✅ | Los distractores son los que elegiría alguien que entendió a medias; sus explicaciones son correctas. |
| 24 | e-vf-mismo-r-mismo-grafico | emc-ds | Tabla 3-3, p. 83 | ✅ | |
| 25 | e-vf-r2-linealidad: R² de los cuatro conjuntos ≈ 0,67 | emc-ds | Tabla 3-3 | ✅ | Recalculé: 0,666-0,667. Justificación correcta. |
| 26 | Caso c-vpn-incidentes: decisiones buenas (buscar confusora, piloto aleatorio chico y reversible) | openintro | §1.3, §1.4 | ✅ | Los desenlaces regular/mal (extrapolar a 1000 sesiones, "concluir que no hay relación", sumar variables hasta subir R²) son errores reales. Mejor camino: 2 decisiones de profundidad. |
| 27 | Problemas p-openintro-regresion (cap. 8, ejercicios §8.5), p-anscombe-propio (pp. 82-84), p-confusora-propia (§1.3) | openintro, emc-ds | ídem | ✅ | La sección 8.5 y las URLs existen. Los tres hacibles con datos propios (planilla/Python). |
| 28 | Plagio | todas | — | ✅ | 0 secuencias de 6 palabras iguales en prosa (solo títulos y la notación `\bar{y} - b_1 \bar{x}`). |
| 29 | Estilo | GUIA-ESTILO | — | ✅ | Voz y orden correctos; ≈ 1020 palabras; 2 V/F de 8 ejercicios. Definiciones: 2 tarjetas (t-residuo-definicion, t-confusora-definicion). |
| 30 | `minutos: 25` | GUIA-ESTILO §2 | frontmatter | ⚠️ | Ver H3. |

Piezas revisadas: 30 filas (11 tarjetas, 8 ejercicios, 1 caso, 3 problemas y el cuerpo).

## Hallazgos abiertos

**H1 — EMC: sección equivocada para la definición de mínimos cuadrados (baja/media).**
- Archivo/campo: `tema.mdx`, `<Formal>` "La recta de mínimos cuadrados", `<Cita f="emc-ds" loc="§6.1.1, p. 164" />`; `tema.mdx` frontmatter `fuentes[1].ubicacion` ("§6.1 (pp. 163-165…" está bien); `FUENTES-analisis-datos.md` fila 2 de regresion.
- Qué dice la fuente: la p. 164 (ec. 6-3, "minimizes the sum of the squares of the difference between each point and the line") pertenece a §6.1.2 Model Description (índice: 6.1.1 Use Cases p. 162; 6.1.2 Model Description p. 163).
- Corrección propuesta: `loc="§6.1.2, p. 164"`. El libro habla de OLS; "mínimos cuadrados (OLS)" es una equivalencia directa, no hace falta cambiar el texto.

**H2 — EMC: sección y página equivocadas para "correlación no implica causa" y extrapolación (media).**
- Archivo/campo: `tema.mdx`, `<Formal>` "De la correlación a la causa" (`<Cita f="emc-ds" loc="§6.4, p. 188" />` tras "…no demuestra que la causen"); `tema.mdx` frontmatter `fuentes[1].ubicacion` ("…y §6.4 (p. 188)"); `FUENTES-analisis-datos.md` filas 16-17 de regresion.
- Qué está mal: el pasaje del dentista y la advertencia de extrapolación están en la p. 189, dentro de §6.3 "Reasons to Choose and Cautions". La p. 188 solo tiene el comienzo de §6.3; §6.4 "Additional Regression Models" (ridge/lasso) empieza después de ese pasaje.
- Corrección propuesta: `loc="§6.3, p. 189"` y, en el frontmatter, "§6.3 (p. 189)". Corregir las filas 16-17 de FUENTES.

**H3 — `minutos` no cuadra con la fórmula (baja, no bloqueante).**
- Archivo/campo: `tema.mdx`, `minutos: 25`. Guía §2: 1020/200 = 5,1 + 4 (2 simuladores) + 8 ejercicios = 17,1 → 15.
- Corrección propuesta: `minutos: 15`, o justificar.

**H4 — Tarjeta con dos ideas (baja, no bloqueante).**
- Archivo/campo: `practica.yaml`, tarjeta t-r-solo-lineal (frente "¿Qué mide… y qué no capta bien?").
- Regla: GUIA-ESTILO §4.1. Corrección propuesta: dos tarjetas, o dejar solo "¿Por qué r puede ser engañoso con una relación curva?".

## Re-verificación (cierre de F4) — commit 75bc28a

| Hallazgo | Estado | Evidencia |
|---|---|---|
| H1 — §6.1.1 → §6.1.2 | CERRADO (75bc28a) | `loc="§6.1.2, p. 164"` en el cuerpo y FUENTES fila 2. Coincide con el índice del libro. |
| H2 — §6.4 p. 188 → §6.3 p. 189 | CERRADO (75bc28a) | `loc="§6.3, p. 189"` en el cuerpo, frontmatter "§6.3 (p. 189)" y FUENTES filas 16-17 y lista de fuentes. Releí el PDF: el pasaje del dentista y la extrapolación están en la p. 189, antes del encabezado §6.4. |
| H3 — `minutos` | CERRADO (75bc28a) | `minutos: 15`, igual que la fórmula. |
| H4 — tarjeta con dos ideas | CERRADO (75bc28a) | Partida en t-r-mide-que ("fuerza y dirección de una relación lineal, entre −1 y 1": OpenIntro §8.1, correlación −1 a 1 y signo positivo/negativo) y t-r-engana-con-curvas ("solo mide fuerza lineal": OpenIntro §8.1, relaciones no lineales). Ambas con `fuente: openintro`, atómicas, ids únicos (29 en el archivo) y 12 tarjetas. |

Los ejercicios, el caso y las tablas no cambiaron. `npx vitest run`: 78 pruebas pasan.

Hallazgos abiertos: ninguno.
