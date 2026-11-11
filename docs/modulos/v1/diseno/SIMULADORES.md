# SIMULADORES — catálogo y plan por tema (v1)

> F2 construye estos 12 componentes; F3 los usa por nombre y props dentro de `<Intuicion>` (y, si suma, en `<Formal>`). No hay simuladores a medida por tema: si un tema necesita algo que no está acá, el escritor usa el más cercano y lo anota en su `FUENTES-<area>.md` como "pedido de simulador para v2".
>
> Contrato general en `CONTRATO-CONTENIDO.md` §7.9: todos llevan `consigna` (obligatoria) y `titulo` (opcional); las props son datos serializables y se validan con Zod en el build.

## 1. Reglas comunes para F2

- **Arquitectura.** Cada simulador = una isla React `src/simuladores/<Nombre>.tsx` + un envoltorio `src/components/mdx/<Nombre>.astro`. El envoltorio valida las props con el esquema Zod de este documento (un `z.object` por simulador, en `src/simuladores/props.ts`), dibuja en HTML estático `<figure class="sim" data-testid="sim-<nombre-en-kebab>">` con `titulo` y `consigna`, y adentro la isla con `client:visible`. Si una librería no aguanta SSR (Mafs o Plot tocando `window`), la isla usa `client:only="react"` y el envoltorio igual muestra título y consigna y un `<noscript>` con "Este simulador necesita JavaScript".
- **Interactivo de verdad.** Cada simulador tiene ≥1 control (slider `<input type="range">`, `<select>`, botón, toggle o punto arrastrable) que cambia lo dibujado y al menos una **lectura** numérica. Controles nativos con `<label>` visible.
- **Lecturas testeables.** Cada lectura es un elemento con `data-lectura="<clave>"` y el valor como texto (redondeado como dice la tabla, coma decimal, sin unidad dentro del número; la unidad va en otro `<span>`). El contenedor de lecturas tiene `aria-live="polite"`. Playwright y F4 leen esas claves.
- **Determinismo.** Todo lo aleatorio usa un PRNG con semilla (mulberry32) en `src/simuladores/azar.ts`; prop opcional común `semilla?: number` (por defecto 42). Mismo estado de controles + misma semilla = mismo dibujo y mismas lecturas.
- **Librerías.** Mafs 0.21.0 para curvas, vectores y sliders sobre el plano (importar `mafs/core.css` y `mafs/font.css` una sola vez, en el layout). Observable Plot 0.6.19 para distribuciones, histogramas y series (imperativo: `Plot.plot(...)` dentro de `useEffect` con `ref`, y `replaceChildren` en cada cambio). motion 14.12.0 (`import { motion } from 'motion/react'`) para flujos, colas y máquinas de estado sobre SVG. Nada más: ni d3 directo, ni recharts.
- **Accesibilidad y movimiento.** Con `prefers-reduced-motion: reduce`, las animaciones de motion se reemplazan por saltos de estado (las lecturas siguen iguales). Colores desde las variables CSS del tema (claro/oscuro). Ancho mínimo 320 px: los controles bajan debajo del gráfico.
- **Datos de los presets** en `src/simuladores/presets/*.ts`, como constantes. Los presets sintéticos se generan con la semilla fija; los conteos que figuran en este documento son parte del contrato (los tests los comprueban).
- **Rendimiento.** Simulaciones de flujo a paso fijo de 50 ms de tiempo simulado, pausables (botón ⏸/▶ en todos los de motion), y se pausan solas cuando la isla sale de pantalla (IntersectionObserver).

## 2. Catálogo (12 componentes)

Formato: props en TypeScript (lo que no lleva `?` es obligatorio; los valores por defecto van en comentario), controles, lecturas y **qué tiene que verse** (criterio de prueba).

### 2.1 `SimFuncion` — Mafs

Curva de una función con tres modos: tangente/secante, descenso por gradiente y señal (suma de senoidales).

```ts
type FuncionPreset = 'cuadratica' | 'cubica' | 'seno' | 'exponencial' | 'logistica' | 'doble-pozo' | 'error-cuadratico';
// cuadratica: x²   cubica: x³ − 3x   seno: sin x   exponencial: eˣ   logistica: 1/(1+e^(−x))
// doble-pozo: x⁴ − 3x² + x (un mínimo local cerca de x≈1.13 y el global cerca de x≈−1.30)
// error-cuadratico: E(w) = media de (yᵢ − w·xᵢ)² sobre 8 puntos fijos con pendiente real 2; eje x = w

type SimFuncionProps = { consigna: string; titulo?: string; semilla?: number } & (
  | { modo: 'tangente'; funcion: FuncionPreset; x0?: number /* 1 */; mostrarSecante?: boolean /* true */; rango?: [number, number] /* [-4, 4] */ }
  | { modo: 'descenso'; funcion: 'cuadratica' | 'doble-pozo' | 'error-cuadratico'; x0?: number /* 3 */; tasa?: number /* 0.1 */; pasosMax?: number /* 50 */ }
  | { modo: 'senal'; componentes: Array<{ frecuencia: number /* Hz, 1..20 */; amplitud: number /* 0..2 */ }> /* 1 a 3 */; ruido?: number /* 0..1, 0 */; muestreo?: boolean /* false */; frecuenciaMuestreo?: number /* Hz, 40 */; filtro?: boolean /* false */ }
);
```

- **tangente**: slider `x0` (en `rango`), slider `h` (0.01-2) si hay secante. Dibuja la curva, el punto, la recta tangente y la secante entre `x0` y `x0+h`. Lecturas: `fx0` (2 decimales), `derivada` (f′(x0), 2 dec.), `pendiente-secante` (2 dec.).
  - Qué tiene que verse: al llevar `h` a 0.01 la `pendiente-secante` queda a menos de 0.05 de `derivada`; en `cuadratica` con `x0 = 0` la tangente es horizontal y `derivada` = 0,00.
- **descenso**: sliders `tasa` (0.001-1.5, escala logarítmica) y `x0`; botones "1 paso", "10 pasos", "Reiniciar". Dibuja la curva y la trayectoria de puntos `xₖ₊₁ = xₖ − tasa·f′(xₖ)` unidos por segmentos. Lecturas: `paso` (entero), `x` (3 dec.), `fx` (3 dec.), `estado` (`convergiendo` | `oscilando` | `divergiendo`).
  - Qué tiene que verse: en `cuadratica` con `tasa = 0.1` el punto baja hacia x = 0 y `estado` = convergiendo; con `tasa = 1.1` (factor |1−2·tasa| > 1) los puntos saltan de lado a lado alejándose y `estado` = divergiendo; en `doble-pozo` arrancando en `x0 = 2` con `tasa = 0.01` se queda en el mínimo local (x ≈ 1.13), no en el global.
- **senal**: un par de sliders (frecuencia, amplitud) por componente, slider `ruido`, toggle muestreo con slider `frecuenciaMuestreo` (2-60 Hz), toggle filtro con slider `corte` (1-30 Hz, pasa-bajos ideal). Dibuja 1 s de señal en el tiempo y, abajo, un espectro de barras (amplitud por frecuencia, calculado analíticamente de los componentes, más un piso de ruido). Con muestreo: puntos de muestra y la curva reconstruida (alias) punteada. Lecturas: `frecuencia-max` (Hz), `nyquist` (Hz = fs/2), `alias` (Hz o "—"), `componentes-filtradas` (entero).
  - Qué tiene que verse: con una componente de 10 Hz y `frecuenciaMuestreo` = 12 Hz aparece la curva alias de 2 Hz y `alias` = 2; con fs ≥ 21 Hz (más del doble de 10 Hz) `alias` = "—"; con filtro en `corte` = 5 Hz una componente de 10 Hz desaparece del espectro y de la señal filtrada.

### 2.2 `SimTransformacion2D` — Mafs

Una matriz 2×2 como transformación del plano.

```ts
type SimTransformacion2DProps = {
  consigna: string; titulo?: string;
  preset?: 'identidad' | 'rotacion-90' | 'escala' | 'cizalla' | 'reflexion' | 'proyeccion'; // 'identidad'
  matriz?: [[number, number], [number, number]]; // si viene, pisa al preset
  editable?: boolean;             // true: muestra los 4 sliders a, b, c, d (−3..3, paso 0.1)
  mostrarAutovectores?: boolean;  // false
  vector?: [number, number];      // [1, 1]: vector v arrastrable
};
// presets: rotacion-90 [[0,-1],[1,0]] · escala [[2,0],[0,0.5]] · cizalla [[1,1],[0,1]] · reflexion [[1,0],[0,-1]] · proyeccion [[1,0],[0,0]]
```

Controles: 4 sliders, botones de preset, punto `v` arrastrable. Dibuja la grilla original tenue y la transformada, las imágenes de î y ĵ (flechas de color), el cuadrado unidad y su imagen (paralelogramo), `v` y `Av`, y las rectas de autovectores reales si están prendidas. Lecturas: `det` (2 dec.), `area` (|det|, 2 dec.), `orientacion` (`se mantiene` | `se invierte` | `colapsa`), `av` ("(x; y)", 2 dec.), `autovalores` ("λ₁; λ₂" o "complejos").
- Qué tiene que verse: `proyeccion` → `det` = 0,00, el cuadrado se aplasta en un segmento y `orientacion` = colapsa; `rotacion-90` → `area` = 1,00 y la grilla gira sin deformarse; `reflexion` → `orientacion` = se invierte; con autovectores en `escala`, un `v` sobre el eje x queda sobre el eje x después de aplicar A.

### 2.3 `SimDistribucion` — Observable Plot

```ts
type SimDistribucionProps = {
  consigna: string; titulo?: string;
  distribucion: 'binomial' | 'poisson' | 'normal' | 'exponencial' | 'uniforme';
  parametros?: { n?: number; p?: number; lambda?: number; mu?: number; sigma?: number; a?: number; b?: number };
  // por defecto: binomial n=10 p=0.5 · poisson lambda=4 · normal mu=0 sigma=1 · exponencial lambda=1 · uniforme a=0 b=1
  mostrarIntervalo?: boolean;     // true: sliders desde/hasta y área sombreada
  aproximacionNormal?: boolean;   // false: superpone la normal con la misma media y varianza (binomial/poisson)
  permitirCambiarDistribucion?: boolean; // false: muestra un <select> con las 5
};
```

Controles: un slider por parámetro (n 1-100, p 0-1, λ 0.1-20, μ −5..5, σ 0.1-5), sliders `desde`/`hasta` si hay intervalo. Dibuja barras (discretas) o curva (continuas), línea vertical en la media y franja media ± desvío. Lecturas: `media`, `varianza`, `desvio` (2 dec.), `probabilidad-intervalo` (P(desde ≤ X ≤ hasta), 4 dec.).
- Qué tiene que verse: binomial n = 10, p = 0.5 → `media` 5,00 y `varianza` 2,50; poisson λ = 4 → `media` = `varianza` = 4,00; normal μ = 0, σ = 1, intervalo [−1, 1] → `probabilidad-intervalo` ≈ 0,6827; al subir σ la campana se aplana y se ensancha.

### 2.4 `SimInferencia` — Observable Plot

Muestreo repetido: teorema central del límite, intervalos de confianza y experimento A/B.

```ts
type Poblacion = 'uniforme' | 'exponencial' | 'bimodal' | 'dado';
type SimInferenciaProps = { consigna: string; titulo?: string; semilla?: number } & (
  | { modo: 'tcl'; poblacion: Poblacion; n?: number /* 5 */ }
  | { modo: 'intervalos'; poblacion: Poblacion; n?: number /* 30 */; confianza?: 0.9 | 0.95 | 0.99 /* 0.95 */ }
  | { modo: 'ab'; tasaA?: number /* 0.10 */; tasaB?: number /* 0.12 */; nPorGrupo?: number /* 1000 */; alfa?: 0.01 | 0.05 | 0.1 /* 0.05 */ }
);
```

- **tcl**: slider `n` (1-100), botones "1 muestra", "100 muestras", "Reiniciar". Arriba el histograma de la población; abajo el histograma de las medias muestrales acumuladas con la normal N(μ, σ/√n) superpuesta. Lecturas: `muestras` (entero), `media-de-medias` (3 dec.), `desvio-de-medias` (3 dec.), `sigma-sobre-raiz-n` (3 dec.).
  - Qué tiene que verse: con `exponencial` y n = 1 el histograma de medias es asimétrico; con n = 30 y 1000 muestras se ve acampanado y `desvio-de-medias` queda a menos de 10 % de `sigma-sobre-raiz-n`.
- **intervalos**: sliders `n` y `confianza` (select), botón "Sacar 20 intervalos" (acumula hasta 100). Dibuja intervalos horizontales apilados y la línea vertical de la media real; los que no la cubren, en el color de error. Lecturas: `intervalos`, `cubren` (enteros), `cobertura` (% 1 dec.).
  - Qué tiene que verse: con 100 intervalos al 95 % la `cobertura` queda entre 88 % y 100 %; al pasar de 90 % a 99 % los intervalos se ven más anchos.
- **ab**: sliders `tasaB` (0.05-0.20) y `nPorGrupo` (100-20 000, logarítmico), select `alfa`, botones "Correr 1 experimento" y "Correr 200". Dibuja la distribución de la diferencia de tasas bajo H0 y bajo H1 (aproximación normal), con la región de rechazo sombreada; marca la diferencia observada del último experimento. Lecturas: `diferencia-observada` (puntos porcentuales, 2 dec.), `z` (2 dec.), `p-valor` (4 dec.), `decision` (`rechazo H0` | `no rechazo H0`), `potencia` (% 1 dec., teórica), `tasa-rechazo` (% de los experimentos corridos).
  - Qué tiene que verse: con `tasaB` = `tasaA` y 200 experimentos, `tasa-rechazo` queda cerca de `alfa` (entre 1 % y 10 % para α = 0.05); al subir `nPorGrupo` la `potencia` sube y las dos campanas se separan.

### 2.5 `SimBayes` — SVG + Observable Plot

```ts
type SimBayesProps = {
  consigna: string; titulo?: string;
  prevalencia?: number;   // 0.01
  sensibilidad?: number;  // 0.99
  especificidad?: number; // 0.95
  poblacion?: 1000 | 10000; // 1000
  contexto?: 'medico' | 'alerta-seguridad' | 'spam'; // 'medico': cambia las etiquetas (enfermo/sano, ataque/normal, spam/legítimo)
};
```

Controles: sliders `prevalencia` (0.1 %-50 %, logarítmico), `sensibilidad` y `especificidad` (50 %-99.9 %). Dibuja una grilla de íconos (1000 puntos; con 10 000, cada punto = 10) coloreada en VP, FP, FN, VN, y un árbol con los conteos. Lecturas: `vp`, `fp`, `fn`, `vn` (enteros sobre la población), `vpp` (P(condición | positivo), % 1 dec.), `vpn` (% 1 dec.).
- Qué tiene que verse: prevalencia 1 %, sensibilidad 99 %, especificidad 95 % → `vpp` ≈ 16,7 % (de unos 59 positivos, unos 10 son verdaderos); con prevalencia 50 % → `vpp` ≈ 95,2 %.

### 2.6 `SimDatos` — Observable Plot

Un dataset, varias vistas, limpieza y regresión.

```ts
type Vista = 'tabla' | 'histograma' | 'caja' | 'barras' | 'lineas' | 'dispersion' | 'torta';
type SimDatosProps = {
  consigna: string; titulo?: string; semilla?: number;
  dataset: 'tickets-sucios' | 'ventas-mensuales' | 'latencias' | 'anscombe' | 'confusora-temperatura' | 'horas-y-notas';
  vistas: Vista[];          // 1 a 4; si hay más de una, se elige con botones
  vistaInicial?: Vista;     // la primera de `vistas`
  limpieza?: boolean;       // false: muestra los toggles de limpieza (solo tickets-sucios)
  regresion?: boolean;      // false: en 'dispersion', recta de mínimos cuadrados + r + R²
  veredictos?: Partial<Record<Vista, { nota: 'bien' | 'regular' | 'mal'; porque: string }>>; // lo escribe el escritor (con cita en el texto)
};
```

Datasets (contrato; F2 los genera con la semilla fija):
- `tickets-sucios`: 200 filas de tickets (`id`, `categoria`, `minutos_resolucion`, `fecha`). Trae 8 filas duplicadas, 6 con `minutos_resolucion` vacío, 3 cargadas en horas en vez de minutos (valores 1-5) y 2 outliers de más de 2000 minutos. Las 6 filas con faltantes no están entre las duplicadas. Toggles: "quitar duplicados", "quitar faltantes", "corregir unidades" (×60 a las 3), "marcar outliers" (regla 1.5·IQR).
- `ventas-mensuales`: 24 meses × 3 regiones (`mes`, `region`, `ventas`), con tendencia creciente en una región y estacionalidad en otra.
- `latencias`: 500 latencias en ms, lognormal con mediana 120 ms y σ = 0.5 en escala logarítmica. Toggle "agregar valores extremos" suma 5 valores de 30 000 ms.
- `anscombe`: los cuatro conjuntos de Anscombe (1973), valores publicados; un selector I-IV.
- `confusora-temperatura`: 120 días con `temperatura`, `ventas_helado`, `golpes_de_calor`; las dos últimas dependen de la temperatura y no entre sí. Toggle "colorear por temperatura" (3 franjas).
- `horas-y-notas`: 60 alumnos, nota ≈ 2 + 0.8·horas + ruido. Toggle "agregar un outlier".

Controles: botones de vista, slider `bins` (5-50) en histograma, selector de cuarteto en `anscombe`, los toggles del dataset. Lecturas: `filas` (entero), `media`, `mediana`, `desvio` (2 dec., de la variable numérica principal), `faltantes` (entero), `r` y `r2` (2 dec., si hay regresión), `pendiente` (2 dec.). Si hay `veredictos`, la vista activa muestra una etiqueta "bien/regular/mal" con el `porque`.
- Qué tiene que verse: en `tickets-sucios`, "quitar duplicados" baja `filas` de 200 a 192 y "quitar faltantes" a 186; en `latencias` la línea de la media queda a la derecha de la mediana y con "agregar valores extremos" la `media` sube más de 200 ms mientras la `mediana` cambia menos de 2 ms; en `anscombe` los cuatro cuartetos muestran `r` = 0,82 con nubes de puntos muy distintas; en `confusora-temperatura` la dispersión helado-vs-golpes da `r` alto y, coloreada por temperatura, se ve que dentro de cada franja casi no hay relación.

### 2.7 `SimTablaSQL` — HTML + motion

```ts
type SimTablaSQLProps = {
  consigna: string; titulo?: string;
  tabla: 'ventas' | 'tickets' | 'logins';
  // ventas: 12 filas (fecha, region, vendedor, monto) · tickets: 12 filas (fecha, prioridad, agente, minutos) · logins: 12 filas (usuario, fecha_hora, resultado)
  operacion: 'group-by' | 'ventana';
  funcion?: 'count' | 'sum' | 'avg' | 'max' | 'row_number' | 'rank' | 'lag' | 'suma-acumulada' | 'promedio-movil';
  // group-by admite count|sum|avg|max (por defecto sum); ventana admite row_number|rank|lag|suma-acumulada|promedio-movil (por defecto row_number)
  particionarPor?: string;  // columna; en group-by es la columna del GROUP BY
  ordenarPor?: string;      // columna del ORDER BY de la ventana
  marco?: number;           // filas hacia atrás para promedio-movil (1..5, por defecto 2)
  editable?: boolean;       // true: selects para función, partición, orden y marco
};
```

Dibuja el SQL generado en vivo (bloque de código), la tabla de entrada con las filas coloreadas por partición y la tabla de salida. Botón "Animar": en `group-by` las filas se juntan por grupo y colapsan en una; en `ventana` las filas se quedan y aparece la columna nueva, celda por celda, resaltando el marco de cada cálculo. Lecturas: `filas-entrada`, `filas-salida` (enteros), `sql` (el texto de la consulta).
- Qué tiene que verse: `group-by` por `region` sobre `ventas` deja tantas `filas-salida` como regiones; `ventana` deja `filas-salida` = `filas-entrada` = 12; `row_number` particionado por `region` vuelve a 1 al empezar cada región; `promedio-movil` con `marco` = 2 resalta la fila actual y las 2 anteriores.

### 2.8 `SimFlujo` — motion sobre SVG

Pedidos o mensajes que viajan entre piezas. Cuatro modos.

```ts
type SimFlujoProps = { consigna: string; titulo?: string; semilla?: number } & (
  | { modo: 'balanceador'; servidores?: number /* 3, 1..8 */; algoritmo?: 'round-robin' | 'menos-conexiones' | 'aleatorio'; tasaLlegada?: number /* pedidos/s, 20 */; capacidadPorServidor?: number /* pedidos/s, 10 */; servidorLento?: boolean /* false */; cache?: boolean /* false */; aciertoCache?: number /* 0..0.95, 0.5 */ }
  | { modo: 'cola'; tasaLlegada?: number /* 5 */; consumidores?: number /* 2 */; tiempoProceso?: number /* s, 0.5 */; capacidadCola?: number /* 50 */; etiquetas?: 'mensajes' | 'tickets'; slaMinutos?: number /* solo tickets */; kb?: boolean /* false: slider "% resuelto con la base de conocimiento" que baja el tiempo de proceso */ }
  | { modo: 'sincrono-vs-asincrono'; latenciaServicioB?: number /* ms, 200 */ }
  | { modo: 'cadena'; saltos?: number /* 1..8, 4 */; latenciaPorSalto?: number /* ms, 20 */; disponibilidadPorServicio?: number /* 0.9..0.99999, 0.999 */ }
);
```

- **balanceador**: sliders `tasaLlegada`, `servidores`, `aciertoCache` (si `cache`); select `algoritmo`; toggles "servidor lento" (uno atiende a la mitad de velocidad) y botón "Tirar un servidor". Puntos que van de clientes → balanceador → (caché) → servidores, con una barra de cola por servidor. Lecturas: `utilizacion` (% 0 dec.), `latencia-p50`, `latencia-p95` (ms, 0 dec.), `rechazados` (entero), `aciertos-cache` (%).
  - Qué tiene que verse: con `tasaLlegada` mayor que `servidores × capacidadPorServidor` las colas crecen sin parar y `latencia-p95` sube todo el tiempo; prender caché al 80 % baja la `utilizacion` de los servidores; con un servidor lento, `menos-conexiones` muestra `latencia-p95` menor que `round-robin`.
- **cola**: sliders `tasaLlegada`, `consumidores`, `tiempoProceso`; toggle "consumidor caído"; slider `% resuelto con KB` si `kb`. Productor → cola (bloques apilados) → consumidores. Lecturas: `en-cola` (entero), `espera-media` (s o min según `etiquetas`, 1 dec.), `perdidos` (entero, si se llena la cola), `fuera-de-sla` (entero, solo tickets).
  - Qué tiene que verse: si la llegada supera lo que procesan los consumidores, `en-cola` crece; al sumar consumidores se vacía; con "consumidor caído" los mensajes no se pierden: se acumulan y se drenan al volver; con `kb` y 40 % resuelto con KB, `espera-media` baja.
- **sincrono-vs-asincrono**: dos carriles lado a lado: arriba Cliente → A → B en cadena síncrona; abajo Cliente → A → cola → B. Slider `latenciaServicioB` (50-3000 ms), toggle "B caído". Lecturas por carril: `espera-cliente-sinc`, `espera-cliente-asinc` (ms), `errores-sinc`, `pendientes-asinc` (enteros).
  - Qué tiene que verse: al subir la latencia de B, `espera-cliente-sinc` sube igual y `espera-cliente-asinc` no; con "B caído", el carril síncrono acumula `errores-sinc` y el asíncrono acumula `pendientes-asinc`, que bajan a 0 cuando B vuelve.
- **cadena**: sliders `saltos`, `latenciaPorSalto`, `disponibilidadPorServicio`; toggle "monolito" (un solo salto en memoria, latencia 1 ms). Lecturas: `latencia-total` (ms), `disponibilidad-compuesta` (% 2 dec. = Π disponibilidades).
  - Qué tiene que verse: con 5 saltos de 99,9 % la `disponibilidad-compuesta` es 99,50 %; cada salto suma `latenciaPorSalto` a `latencia-total`.

### 2.9 `SimMaquinaEstados` — motion sobre SVG

Estados, eventos y log. Cada preset trae su diagrama fijo.

```ts
type SimMaquinaEstadosProps = {
  consigna: string; titulo?: string; semilla?: number;
  preset: 'circuit-breaker' | 'unidad-systemd' | 'proceso-linux' | 'contenedor-docker' | 'incidente-itil';
  mostrarLog?: boolean; // true
};
```

Dibuja los estados como nodos y las transiciones como flechas; el estado actual resaltado (la transición se anima). Botones de eventos: solo están habilitados los válidos desde el estado actual. Abajo, un log de texto (una línea por transición, con hora simulada). Lecturas: `estado` (nombre del estado actual), `transiciones` (entero) y las propias de cada preset.

Presets (contrato):
- `circuit-breaker`: estados `cerrado`, `abierto`, `semi-abierto`. Tráfico automático (10 pedidos/s simulados). Sliders: `tasa de falla del servicio` (0-100 %), `umbral` (10-90 %, sobre los últimos 20 pedidos), `espera en abierto` (1-30 s). En `abierto` los pedidos se rechazan al instante sin llamar al servicio; al vencer la espera pasa a `semi-abierto` y deja pasar 1 pedido de prueba: si anda, `cerrado`; si falla, `abierto`. Lecturas extra: `fallas-ventana` (%), `rechazados-rapido`, `llamadas-al-servicio` (enteros).
  - Qué tiene que verse: con falla 80 % y umbral 50 % pasa a `abierto` y `llamadas-al-servicio` deja de crecer mientras `rechazados-rapido` sube; al bajar la falla a 0 %, tras la espera pasa por `semi-abierto` y vuelve a `cerrado`.
- `unidad-systemd`: estados `inactive`, `activating`, `active`, `deactivating`, `failed`. Eventos: `systemctl start`, `systemctl stop`, `systemctl restart`, `el proceso muere (exit 1)`, `systemctl reset-failed`. Toggle `Restart=on-failure` y límite `StartLimitBurst=5` en `StartLimitIntervalSec=10`. El log imita `journalctl` (`app.service: Main process exited, code=exited, status=1/FAILURE`). Lecturas extra: `reinicios` (entero).
  - Qué tiene que verse: con `Restart=on-failure`, "el proceso muere" pasa por `activating` y vuelve a `active` sumando 1 a `reinicios`; 5 muertes en menos de 10 s simulados dejan la unidad en `failed` con una línea de log `start-limit-hit`; sin `Restart`, una muerte deja `failed` directo.
- `proceso-linux`: estados con la letra de `ps`: `R` (ejecutable), `S` (durmiendo), `D` (espera de E/S no interrumpible), `T` (detenido), `Z` (zombie). Eventos: `pide disco`, `llega el dato`, `espera una tecla`, `SIGSTOP`, `SIGCONT`, `termina (exit)`, `el padre hace wait()`. Lecturas extra: `pid` (fijo), `estado-ps` (la letra).
  - Qué tiene que verse: `termina (exit)` lleva a `Z` y el proceso sigue en la tabla hasta `el padre hace wait()`; en `D`, `SIGSTOP` queda pendiente (el log dice "señal pendiente") y se aplica recién cuando el proceso sale de `D`.
- `contenedor-docker`: estados `created`, `running`, `paused`, `exited`, `restarting`, `removed`. Eventos: `docker create`, `docker start`, `docker stop`, `docker pause`, `docker unpause`, `docker kill`, `docker rm`, `el proceso principal sale con código 1`, `reiniciar el daemon`. Select de política: `no`, `on-failure`, `always`, `unless-stopped`. Lecturas extra: `reinicios`, `codigo-salida`.
  - Qué tiene que verse: con `no`, salir con código 1 deja `exited`; con `on-failure` pasa por `restarting` y vuelve a `running`; con `always`, después de `docker stop` queda en `exited` y vuelve a `running` recién con `reiniciar el daemon`; con `unless-stopped`, después de `docker stop` no vuelve ni con `reiniciar el daemon`.
- `incidente-itil`: estados `registrado`, `clasificado`, `en-curso`, `en-espera-usuario`, `resuelto`, `cerrado`, `reabierto`. Eventos: `clasificar (impacto × urgencia)`, `asignar y empezar`, `pedir datos al usuario`, `el usuario responde`, `aplicar solución`, `el usuario confirma`, `el usuario dice que sigue fallando`, `es recurrente: abrir problema`, `la solución necesita un cambio: pedir cambio`. Los dos últimos no cambian el estado: suman un registro vinculado (`problemas-abiertos`, `cambios-pedidos`). El diagrama lleva la nota fija "Flujo típico de una herramienta de mesa de ayuda; ITIL 4 no fija estos estados".
  - Qué tiene que verse: `el usuario dice que sigue fallando` desde `resuelto` pasa a `reabierto`; `es recurrente: abrir problema` suma 1 a `problemas-abiertos` sin cerrar el incidente.

### 2.10 `SimSerieTemporal` — Observable Plot

Métricas en el tiempo: alertas y respaldos.

```ts
type SimSerieTemporalProps = { consigna: string; titulo?: string; semilla?: number } & (
  | { modo: 'alertas'; escenario: 'pico-breve' | 'fuga-memoria' | 'disco-llenandose' | 'carga-sostenida'; nucleos?: number /* 4, solo carga-sostenida */; umbral?: number; duracionMin?: number /* 0 */ }
  | { modo: 'respaldo'; frecuenciaHoras?: number /* 24 */; rpoObjetivoHoras?: number /* 4 */; rtoObjetivoHoras?: number /* 2 */; duracionRestauracionHoras?: number /* 3 */; respaldoProbado?: boolean /* true */ }
);
// escenarios (24 h, un punto por minuto):
// pico-breve: CPU % estable en 30 con un pico de 3 min a 95
// fuga-memoria: memoria % que sube lineal de 40 a 97 en 20 h y el proceso se reinicia
// disco-llenandose: disco % estable en 70 hasta la hora 16; desde ahí sube 5 puntos por hora y llega a 100 % en la hora 22
// carga-sostenida: load average de 1 min, 5 min y 15 min, con una hora sostenida en 6 sobre `nucleos` = 4
```

- **alertas**: sliders `umbral` (en la unidad de la métrica), `duracionMin` (0-30, como el `for:` de una regla de alerta: dispara solo si la condición se sostiene ese tiempo) y `ventana de promedio` (1-15 min). Dibuja la serie, la línea de umbral y franjas sombreadas donde la alerta está disparada. En `disco-llenandose`, toggle "alerta predictiva" (regresión lineal sobre la última hora: avisa si se llena en menos de 4 h). En `carga-sostenida`, línea de referencia en `nucleos`. Lecturas: `alertas` (cantidad de disparos), `minutos-en-alerta`, `primer-aviso` (hh:mm o "—"), `horas-de-anticipacion` (1 dec., disco).
  - Qué tiene que verse: en `pico-breve` con umbral 90 y `duracionMin` = 0 hay 1 alerta; con `duracionMin` = 5, 0 alertas; en `disco-llenandose` la alerta predictiva avisa con ≥ 3 h de anticipación y una alerta de umbral en 95 % avisa con 1 h (se dispara en la hora 21).
- **respaldo**: sliders `frecuenciaHoras` (1-48), `momento del incidente` (0-72 h), `duracionRestauracionHoras` (0.5-12); toggle `respaldoProbado`. Dibuja 72 h de "datos acumulados" como área, marcas verticales en cada respaldo, el incidente y la restauración. Si el respaldo no está probado, el último respaldo antes del incidente aparece corrupto (tachado) y se restaura el anterior. Sombrea los datos perdidos (RPO real) y la caída (RTO real). Lecturas: `rpo-real-horas`, `rto-real-horas` (1 dec.), `cumple-rpo`, `cumple-rto` (`sí` | `no`).
  - Qué tiene que verse: con respaldo cada 24 h y el incidente 23 h después de un respaldo, `rpo-real-horas` = 23,0 y `cumple-rpo` = no contra 4 h; con respaldo cada 4 h cumple; con `respaldoProbado` apagado la pérdida salta un respaldo hacia atrás (suma `frecuenciaHoras`).

### 2.11 `SimGrafo` — SVG + motion

Grafos con posiciones fijas (sin layout automático).

```ts
type SimGrafoProps = {
  consigna: string; titulo?: string; semilla?: number;
  grafo: 'red-ciudad' | 'dependencias-paquetes' | 'microservicios-tienda' | 'cadena-red';
  modo: 'recorrido' | 'camino-minimo' | 'orden-topologico' | 'propagar-falla' | 'buscar-falla';
};
// red-ciudad: 8 nodos (barrios), aristas no dirigidas con peso (minutos) · modos recorrido y camino-minimo
// dependencias-paquetes: DAG de 8 paquetes · modo orden-topologico
// microservicios-tienda: gateway → catalogo, carrito, pagos, envios, usuarios; pagos → antifraude; envios → inventario · modo propagar-falla
// cadena-red: PC → placa de red → cable → switch → router → firewall → proveedor → DNS → servidor (8 tramos) · modo buscar-falla
```

- **recorrido**: select BFS/DFS, clic en nodo inicial, botones "Paso" y "Auto". Pinta visitados y frontera (cola o pila visible al costado). Lecturas: `orden-visita` (lista), `en-frontera` (lista).
- **camino-minimo** (Dijkstra): clic en origen y destino; slider "tráfico en la avenida central" que multiplica el peso de una arista marcada (×1 a ×5); botón "Paso". Lecturas: `costo` (min), `camino` (lista de nodos).
- **orden-topologico** (Kahn): botón "Paso"; resalta los nodos sin dependencias pendientes. Lecturas: `orden` (lista), `disponibles` (lista).
- **propagar-falla**: clic en un servicio para tirarlo; toggle "con timeouts y circuit breaker" (los que dependen quedan `degradado` en vez de `caído`). Colores por estado. Lecturas: `caidos`, `degradados` (enteros), `gateway` (`ok` | `degradado` | `caído`).
- **buscar-falla**: hay una falla escondida en un tramo; clic en un nodo = "probar hasta acá" (responde si la señal llega). Botón "Nueva falla". Lecturas: `pruebas` (entero), `minimo-teorico` (= ⌈log₂ 8⌉ = 3), `encontrada` (`sí` | `no`).
- Qué tiene que verse: Dijkstra resalta el camino de menor `costo` y lo cambia cuando el tráfico encarece la avenida central; el orden topológico nunca pone un paquete antes de sus dependencias; con timeouts, tirar `antifraude` deja `pagos` degradado y el `gateway` ok; en `buscar-falla`, probar siempre en la mitad del tramo que queda encuentra la falla en ≤ 3 `pruebas`.

### 2.12 `SimMatrizPrioridad` — HTML + motion

```ts
type SimMatrizPrioridadProps = {
  consigna: string; titulo?: string;
  tickets?: 'mesa-lunes' | 'caida-parcial'; // 'mesa-lunes'
  // mesa-lunes: 6 tickets de un lunes (impresora, VPN de un gerente, sistema de facturación caído, alta de usuario, lentitud general, correo de un usuario)
  // caida-parcial: 5 tickets durante una caída del ERP en una sucursal
  slas?: Record<'P1' | 'P2' | 'P3' | 'P4' | 'P5', { respuestaMin: number; resolucionMin: number }>;
  // por defecto: P1 15/240 · P2 30/480 · P3 120/1440 · P4 480/4320 · P5 1440/7200
};
// Matriz impacto × urgencia (alta/media/baja) → prioridad:
// (A,A)=P1 · (A,M)=P2 · (M,A)=P2 · (A,B)=P3 · (M,M)=P3 · (B,A)=P3 · (M,B)=P4 · (B,M)=P4 · (B,B)=P5
```

Arriba la matriz 3×3 con las prioridades. Abajo la lista de tickets: para cada uno, selects de impacto y urgencia (el sistema calcula la prioridad y la ubica en la matriz). Botones para reordenar la cola de atención y "Avanzar el reloj" (cada ticket consume su tiempo fijo de atención; un agente). La matriz y los SLA llevan la nota fija "Matriz de ejemplo; cada organización define la suya". Lecturas: `prioridad-<id-ticket>` (P1-P5), `incumplidos` (entero), `reloj` (hh:mm).
- Qué tiene que verse: impacto alto y urgencia alta da P1; en `mesa-lunes`, atender en orden de llegada deja `incumplidos` ≥ 1 (el sistema de facturación espera detrás de la impresora) y atender por prioridad deja `incumplidos` = 0.

## 3. Plan por tema (24 temas)

| Área | Tema (slug) | Simulador(es) y props clave | Qué mueve el lector |
|---|---|---|---|
| Análisis de datos | `limpieza-y-eda` | `SimDatos dataset="tickets-sucios" vistas={["tabla","histograma","caja"]} limpieza` | Toggles de limpieza; ve cómo cambian filas, media y mediana. |
| Análisis de datos | `elegir-el-grafico` | `SimDatos dataset="ventas-mensuales" vistas={["barras","lineas","torta","dispersion"]} veredictos={…}` | Cambia de vista y ve qué pregunta responde cada una. |
| Análisis de datos | `sql-analitico` | `SimTablaSQL tabla="ventas" operacion="group-by"` + `SimTablaSQL tabla="ventas" operacion="ventana" funcion="suma-acumulada"` | Cambia función, partición y marco; ve GROUP BY colapsar y la ventana conservar filas. |
| Análisis de datos | `regresion-y-causalidad` | `SimDatos dataset="anscombe" vistas={["dispersion"]} regresion` + `SimDatos dataset="confusora-temperatura" vistas={["dispersion"]} regresion` | Cuartetos con el mismo r; colorea por la variable confusora. |
| Arquitecturas | `monolito-y-microservicios` | `SimFlujo modo="cadena"` + `SimGrafo grafo="microservicios-tienda" modo="propagar-falla"` | Suma saltos y ve caer la disponibilidad; tira un servicio y ve la propagación. |
| Arquitecturas | `sincrono-vs-asincrono` | `SimFlujo modo="sincrono-vs-asincrono"` + `SimFlujo modo="cola" etiquetas="mensajes"` | Sube la latencia de B o lo tira; ve quién espera. |
| Arquitecturas | `escalabilidad-balanceo-cache` | `SimFlujo modo="balanceador" cache` | Servidores, algoritmo, caché y tasa de llegada; mira p95 y colas. |
| Arquitecturas | `resiliencia-y-cap` | `SimMaquinaEstados preset="circuit-breaker"` | Tasa de falla y umbral; ve abrirse y cerrarse el breaker. |
| Servidores | `linux-procesos-systemd-logs` | `SimMaquinaEstados preset="unidad-systemd"` (+ opcional `preset="proceso-linux"`) | Mata el proceso con y sin `Restart=`; lee el log. |
| Servidores | `monitoreo-y-alertas` | `SimSerieTemporal modo="alertas" escenario="pico-breve"` + `escenario="disco-llenandose"` | Umbral y duración; alerta predictiva. |
| Servidores | `backups-rpo-rto` | `SimSerieTemporal modo="respaldo"` | Frecuencia de respaldo, momento del incidente, respaldo probado. |
| Servidores | `contenedores-docker` | `SimMaquinaEstados preset="contenedor-docker"` | Políticas de reinicio contra eventos. |
| Matemática y física | `derivadas-y-gradiente` | `SimFuncion modo="tangente" funcion="cuadratica"` + `SimFuncion modo="descenso" funcion="doble-pozo"` | h hacia 0; tasa de aprendizaje. |
| Matemática y física | `vectores-y-matrices` | `SimTransformacion2D editable mostrarAutovectores` | Sliders de la matriz y presets; det y autovectores. |
| Matemática y física | `grafos` | `SimGrafo grafo="red-ciudad" modo="camino-minimo"` + `SimGrafo grafo="dependencias-paquetes" modo="orden-topologico"` | Tráfico en la avenida; paso a paso. |
| Matemática y física | `senales-frecuencia-ruido` | `SimFuncion modo="senal" componentes={[{frecuencia:3,amplitud:1},{frecuencia:10,amplitud:0.5}]} muestreo filtro` | Ruido, corte del filtro, frecuencia de muestreo (alias). |
| Probabilidad y estadística | `variables-y-distribuciones` | `SimDistribucion distribucion="binomial" aproximacionNormal permitirCambiarDistribucion` | Parámetros; media, **varianza** y desvío. |
| Probabilidad y estadística | `tcl-e-intervalos` | `SimInferencia modo="tcl" poblacion="exponencial"` + `SimInferencia modo="intervalos" poblacion="dado"` | n; confianza; cobertura. |
| Probabilidad y estadística | `pruebas-de-hipotesis-ab` | `SimInferencia modo="ab"` | Tasa de B, n por grupo, α; potencia y falsos positivos. |
| Probabilidad y estadística | `bayes-falsos-positivos` | `SimBayes contexto="medico"` (+ opcional `contexto="alerta-seguridad"`) | Prevalencia, sensibilidad, especificidad; VPP. |
| Soporte técnico | `itil-incidente-problema-cambio` | `SimMaquinaEstados preset="incidente-itil"` | Recorre el ciclo, reabre, abre problema y pide cambio. |
| Soporte técnico | `troubleshooting-metodico` | `SimGrafo grafo="cadena-red" modo="buscar-falla"` | Elige dónde probar; compara con el mínimo teórico. |
| Soporte técnico | `prioridad-y-sla` | `SimMatrizPrioridad tickets="mesa-lunes"` + `SimFlujo modo="cola" etiquetas="tickets" slaMinutos={240}` | Clasifica y reordena; ve SLA incumplidos. |
| Soporte técnico | `comunicacion-kb-postmortem` | `SimFlujo modo="cola" etiquetas="tickets" kb` | % resuelto con base de conocimiento contra espera media. |

Cobertura: todas las áreas tienen ≥ 4 usos de simulador interactivo (mínimo exigido: 2, regla I13). Los 12 componentes se usan al menos una vez.

## 4. Orden sugerido de construcción para F2

1. Stubs de los 12 envoltorios con validación de props (hito 0 de `BRIEF-CONSTRUCTOR.md`): dibujan título, consigna y una caja "simulador en construcción". Con esto los escritores ya validan sus props en el build.
2. `SimDatos` (lo usa el tema de ejemplo), `SimDistribucion`, `SimFuncion`.
3. `SimFlujo`, `SimMaquinaEstados` (los de motion, los más caros).
4. El resto.

Cada simulador terminado lleva un test de Playwright que mueve un control y comprueba una línea de "qué tiene que verse" leyendo sus `data-lectura` (ver `BRIEF-CONSTRUCTOR.md` §6).
