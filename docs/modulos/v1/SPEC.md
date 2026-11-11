# SPEC-0: campus-personal
Sistema personal de apuntes y repaso interactivo (gráficos, animaciones, explicaciones en criollo) por área y contenido, para mantenerse afilado en Ing. en Informática y Lic. en Gestión de Tecnología (UNLaM).
- Estado: READY
- Fecha: 2026-11-11
- Sello del Arquitecto: `arquitecto: 2026-11-11 · kit 3.0.0-rc.6 · chequeos: tamaño ✅ · entorno ✅ · tope ✅ · hash 3e797a169430`

## Por qué (el dolor)
Lo cursado se olvida a los meses, los apuntes están desparramados, la teoría llega demasiado estructurada y sin aplicación visible, y falta el salto de la facultad al laburo. Con el sistema funcionando: un solo lugar por área y tema, repaso espaciado que trae cada concepto antes de olvidarlo, y explicaciones en criollo con gráficos, animaciones y analogías con casos reales del trabajo.

## Entidades del dominio
- Área — agrupa Temas (6 en v1). Definidas en un archivo de configuración, nunca en el código de las pantallas.
- Tema — pertenece a un Área. Tiene la lección (caso real → intuición → formal), Fuentes, y sus piezas de práctica.
- Tarjeta — pertenece a un Tema. Pregunta/respuesta con su estado de repaso espaciado (próxima fecha, dificultad).
- Ejercicio — pertenece a un Tema. Autocorregible (numérico con tolerancia u opción múltiple), con explicación del error.
- Caso de guardia — pertenece a un Tema. Escenario con pasos, decisiones y consecuencias.
- Problema recomendado — pertenece a un Tema. Enunciado + fuente o enlace para resolver fuera de la app.
- Simulador — un componente interactivo que un Tema incrusta.
- Fuente — libro, documentación oficial o curso abierto citado por un Tema (con capítulo, sección o URL).
- Progreso — vive en el navegador: historial de repasos, resultados de ejercicios y días de estudio. Se exporta e importa como JSON.

## Nivel y stack, y por qué
Nivel: `estandar` (con código).
Tipo: web instalable (PWA) que anda sin internet, en PC y celular. Sin servidor ni login: el progreso vive en cada dispositivo y se pasa con exportar/importar. (Decidido en la entrevista.) Contenido: lo arman agentes con fuentes citadas y verificadas; el dueño suma o corrige apuntes en archivos Markdown dentro del repo, que la app levanta sola (sin editor dentro de la app). Stack (verificado 2026-11-11, detalle en `docs/modulos/v1/investigacion/stack-verificado.md`): Astro 7.4 + MDX + islas de React 19; KaTeX 0.16.47 con remark-math/rehype-katex vía `markdown.processor: unified(...)`; ts-fsrs 6 (API nueva `DefaultScheduler`/`review`); Mafs + Observable Plot para gráficos y simuladores; `motion` para animaciones; Pagefind para el buscador; @vite-pwa/astro 2.0.2 (export nombrado) para offline; idb-keyval para el progreso; Zod (content collections) para validar el contenido; Vitest + Playwright; deploy con withastro/action en Node 24. Versiones exactas fijadas, nunca `latest`.
Por qué: el sitio estático sale gratis y anda offline; Astro arma una página por tema y valida el contenido; la interactividad solo carga donde hace falta. Sin Python ni backend porque no hay cálculo pesado del lado del servidor.

## Concerns activados
- Dashboards: SÍ. Panel de progreso (dominio por área, calendario de días repasados, tarjetas que tocan hoy).
- Listas configurables: SÍ, adaptado. Áreas y temas salen de archivos de contenido y configuración validados con un esquema; sumar un tema = sumar un archivo, sin tocar código de pantallas.
- Errores estándar: SÍ, adaptado. Un archivo de contenido mal formado rompe el build con un mensaje que dice qué archivo y qué campo; importar un JSON de progreso inválido avisa claro y no pisa el progreso actual.
- Settings: SÍ, mínimo. Tema claro/oscuro/sistema, guardado en el navegador.
- Roles/permisos: NO APLICA, no hay login.
- Auditoría: NO APLICA, no hay datos de terceros ni plata.
- Logging/Sentry: DIFERIDO. Sitio estático personal; lo dispararía tener usuarios reales que reporten fallas.
- Notificaciones: DIFERIDO. El recordatorio diario de repaso es candidato a v2.
- Feature flags: NO APLICA.
- ⚠️ Multi-tenant: NO (ver Riesgos). ⚠️ i18n: NO, solo español (ver Riesgos).

## Alcance v1 (qué entra)
- 6 áreas con 3-4 temas clave cada una (~20 temas), completos y con fuentes citadas, y una plantilla para sumar temas fácil.
- Por tema, cinco formatos de práctica:
  1. Tarjetas de repaso espaciado (fácil/difícil → próxima fecha).
  2. Simuladores interactivos (mover un control y ver el efecto).
  3. Ejercicios autocorregibles (numéricos u opción múltiple) con explicación del error.
  4. Casos de guardia: escenarios con decisiones y consecuencias (servidores, soporte, arquitectura).
  5. Problemas recomendados para hacer por cuenta propia, fuera de la app (enunciado + fuente/enlace, sin corrección integrada).
- Fuentes válidas: bibliografía de cátedra y libros clásicos (Stewart, Grossman, Tanenbaum, Ross, etc.), documentación oficial (Linux, Docker, Kubernetes, ITIL…) y cursos universitarios abiertos (MIT OCW, Khan Academy). Videos y blogs solo como "para ver más", nunca como fuente de un dato.
- Cada afirmación lleva su cita; un segundo agente la revisa contra la fuente antes de publicarla.
- Temas: los elige el director cruzando los planes de UNLaM (Ing. en Informática y Lic. en Gestión de Tecnología) con lo que más rinde en el laburo; la lista queda escrita en este plano para que el dueño la vete al volver.
- Panel de progreso: dominio por área (gráficos), calendario de días repasados y tarjetas que tocan hoy.
- Buscador sobre temas, tarjetas y ejercicios.
- Tema claro/oscuro/del sistema, con lectura cómoda en celular.
- Publicado en GitHub Pages (público, link fijo, deploy automático con cada push). Contenido con citas y paráfrasis propia, nunca texto copiado de libros.
- Estructura de cada tema, siempre en este orden: caso real (laburo o vida cotidiana) → intuición en criollo con gráfico, animación o simulador → definición formal → práctica (tarjetas, ejercicios, caso de guardia, problemas para hacer por cuenta propia) → fuentes.
- Autonomía: el director puede crear el repo público `campus-personal` en la cuenta de GitHub del dueño, subirlo y prender GitHub Pages sin volver a preguntar (autorizado en la entrevista, 2026-11-11).

### Temas de v1 (elegidos por el director; el dueño los veta al volver)
Mínimo 3 por área, el 4.º si pasa la verificación. Entre paréntesis, la materia UNLaM de anclaje (Ing. en Informática, plan 2023-2).
1. **Análisis de datos**: limpieza y exploración (EDA) · elegir el gráfico correcto · SQL analítico (agregaciones y funciones de ventana) · regresión lineal y correlación ≠ causalidad (Ciencia de Datos, Bases de Datos Aplicada).
2. **Arquitecturas y microservicios**: monolito, monolito modular y microservicios · comunicación síncrona (REST) vs asíncrona (colas/Kafka) · escalabilidad, balanceo de carga y caché · resiliencia (timeouts, reintentos, circuit breaker, CAP) (Arquitecturas de Sistemas Software, SO Avanzados).
3. **Servidores**: Linux, procesos, servicios (systemd) y logs · monitoreo (CPU, memoria, disco, load average) y alertas · backups 3-2-1, RPO/RTO y restauración probada · contenedores (Docker) y orquestación básica (Virtualización de Hardware, Sistemas Operativos, Redes).
4. **Matemática y física aplicadas**: derivadas y descenso por gradiente · vectores y matrices como transformaciones · grafos (rutas, dependencias) · señales: frecuencia, ancho de banda y ruido (Análisis Matemático I/II, Álgebra y Geometría Analítica, Matemática Discreta, Física II).
5. **Probabilidad y estadística**: variables aleatorias y distribuciones (binomial, Poisson, normal) · teorema central del límite e intervalos de confianza · pruebas de hipótesis y A/B testing · Bayes (falsos positivos) (Probabilidad y Estadística, Estadística Aplicada).
6. **Soporte técnico**: ITIL 4 (incidente, problema, cambio) · troubleshooting metódico (capas OSI, dividir para encontrar) · priorización por impacto × urgencia y SLA · comunicación con el usuario, base de conocimiento y post-mortem sin culpables (Seguridad de la Información u.10, Gestión de la Calidad; mayormente docs oficiales).

## FUERA de alcance (qué NO entra)
- Mapa de conexiones entre temas (grafo): no entra en v1, candidato a v2.
- Sincronización automática entre dispositivos (login + nube): descartada en la entrevista, alcanza con exportar/importar.

## Criterios de aceptación (5-8, verificables)
1. CUANDO se hace push a `main`, el workflow DEBE construir y publicar en `https://jrobilara.github.io/campus-personal/`, y la portada publicada DEBE listar las 6 áreas.
2. Cada área DEBE tener ≥3 temas publicados. Cada tema DEBE tener las 5 partes en orden (caso real, intuición con ≥1 gráfico/animación/simulador, formal, práctica, fuentes) y ≥2 fuentes válidas citadas. Cada área DEBE tener ≥2 simuladores interactivos. El build DEBE fallar si un archivo de contenido no cumple el esquema.
3. Cada tema DEBE tener ≥6 tarjetas, ≥3 ejercicios autocorregibles y ≥2 problemas recomendados. Cada tema de las áreas Arquitecturas, Servidores y Soporte DEBE tener ≥1 caso de guardia.
4. CUANDO se califica una tarjeta, el sistema DEBE agendar la próxima fecha con FSRS, y la tarjeta DEBE volver a "para hoy" recién en esa fecha (test unitario con reloj fijo).
5. CUANDO se exporta el progreso y se importa en un navegador limpio, el panel DEBE mostrar los mismos números. SI el JSON es inválido, ENTONCES el sistema DEBE avisar y no tocar el progreso actual.
6. CUANDO no hay red, después de una primera visita, la app DEBE abrir la portada y un tema ya visitado (test Playwright offline).
7. CUANDO se busca "varianza" en el sitio publicado bajo el subpath, el buscador DEBE devolver el tema que la trata.
8. Cada tema publicado DEBE tener su informe de verificación (`docs/verificacion/<tema>.md`), hecho por un agente distinto del autor, sin hallazgos abiertos.

## Ejecución
Tamaño: módulo solo
- Sesiones: una, esta misma. Por pedido explícito del dueño, la sesión del Arquitecto pasa a director después del sello: no escribe código ni contenido, lanza subagentes y verifica.
- Modelo: subagentes que planifican (esquema de contenido, plantilla de tema, guía de estilo, plan de simuladores) con Opus en esfuerzo medio; los que ejecutan (construir la app, investigar y escribir contenido por área, verificar fuentes, tests, deploy) con Sonnet en esfuerzo alto. Opus para ejecutar solo con motivo avisado al dueño.
- Fases: F1 plan (esquema Zod, plantilla de tema, guía de estilo en criollo, plan de simuladores) → F2 app (un constructor) en paralelo con F3 contenido (un escritor por área, cada uno en su carpeta de área dentro de las content collections) → F4 verificación (un verificador por área, distinto del autor) → F5 correcciones → F6 tests, deploy y prueba en el sitio vivo → F7 revisión de código y de UI.
- Para abrir: `inicio — ejecutá docs/modulos/v1/SPEC.md (está READY)` (solo si esta sesión se corta: la sesión nueva retoma como director desde la ficha).
- Cómo se prueba: ver "Entorno de prueba".

## Entorno de prueba
- Cómo se levanta: `npm run dev` (local) o `npm run build && npx astro preview --port 4321 --ignore-lock`.
- Datos semilla: el propio contenido de las content collections. El progreso vive en el navegador; en los tests, Playwright arranca con perfil limpio. Cómo se resetea: borrar los datos del sitio en el navegador o usar el botón "reiniciar progreso".
- Chequeo base (verde antes de tocar código): `npm run build`. Cuando estén instalados, el chequeo completo es `npx astro check && npm run build && npx vitest run && npx playwright test`.
- Compartido entre carriles: un solo repo. Cada escritor de contenido toca solo su carpeta de área; el código de la app lo toca solo el constructor.
- Herramientas: Node 24 LTS (`node -v` → v24.x; local con nvm y `.nvmrc`), npm (`npm -v`), Chromium de Playwright (`npx playwright --version`), gh autenticado (`gh auth status`). No hay entornos reales ni datos de terceros.

## Supuestos
- [MEDIO] Las tarjetas usan la escala de 4 botones de FSRS (otra vez, difícil, bien, fácil) con los parámetros por defecto. Si se quiere solo fácil/difícil, cambia la UI, no el modelo.
- [MEDIO] El formato del JSON de progreso lleva número de versión desde el día uno, para que el export/import sobreviva a cambios de ts-fsrs.
- [BAJO] Mobile-first y legible de 360 px de ancho para arriba.
- [BAJO] La lista de temas la armó el director; el dueño puede vetar o cambiar temas al volver (es contenido, no rompe la app).
- [BAJO] Esta PC tiene Node 25 (versión impar que Astro no soporta); se trabaja con Node 24 vía nvm, igual que en el CI.
- [BAJO] [SIN CONTRASTAR] Los contenidos de la Lic. en Gestión de Tecnología no están publicados; el anclaje curricular usa Ing. en Informática.

## Riesgos y decisiones ⚠️
- ⚠️ i18n: NO, solo español rioplatense; los términos técnicos llevan su nombre en inglés entre paréntesis y las fuentes pueden estar en inglés. Consecuencia: traducir después obliga a reescribir cada texto de la app y del contenido.
- ⚠️ Multi-tenant / cuentas: NO. Es de uso personal, pero se puede pasar el link: como el progreso vive en cada navegador, cada persona tiene el suyo sin login ni base. Consecuencia: si algún día se quieren grupos con cuentas, progreso en la nube o ranking, hay que sumar login y base (otro módulo, con migración del progreso exportado).
- Contexto curricular: ver `docs/modulos/v1/investigacion/unlam-planes.md`. Ing. en Informática (plan 2023-2) cubre las 6 áreas con contenidos mínimos verificados. La Lic. en Gestión de Tecnología (ciclo de complementación, EFC, plan 2011-1) no publica programas, así que su mapeo es solo por nombre de materia (NO VERIFICADO). Las áreas 3 (servidores) y 6 (soporte) tienen poca cobertura en la facultad, así que su contenido se apoya en documentación oficial (Linux, Docker, Kubernetes, ITIL 4, etc.).

### Alternativas evaluadas y descartadas
- PC y celular sincronizados (login + base en la nube): descartado porque suma mantenimiento y costo para un uso de una sola persona.
- Vite + React SPA: descartado frente a Astro porque no arma una página por tema, no valida el contenido y le cuesta el subpath de GitHub Pages.
- Editor de apuntes dentro de la app: descartado porque suma mucha construcción; los apuntes propios van en Markdown dentro del repo.
- Solo en la PC: descartado porque se quiere repasar también desde el celular.
