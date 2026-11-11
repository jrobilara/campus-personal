# BRIEF PARA EL CONSTRUCTOR (F2) — campus-personal v1

> Encargo para quien construye la app. No ves a los escritores de contenido (F3): trabajan en paralelo, cada uno en su carpeta de área, siguiendo el mismo contrato que vos. Si el contrato no te alcanza, no lo cambies por tu cuenta: avisale al director con la propuesta y seguí con la opción más conservadora.

## 1. Qué leer, en este orden

1. `docs/modulos/v1/SPEC.md` — sobre todo "Criterios de aceptación" (1-8) y "Entorno de prueba".
2. `docs/modulos/v1/investigacion/stack-verificado.md` — versiones y **trampas** (§8 de este brief las resume; leé el original igual).
3. `docs/modulos/v1/diseno/CONTRATO-CONTENIDO.md` — carpetas, esquemas Zod (los copiás tal cual), reglas de integridad, componentes MDX y el tema de ejemplo.
4. `docs/modulos/v1/diseno/SIMULADORES.md` — los 12 simuladores: props, lecturas y "qué tiene que verse".
5. `docs/modulos/v1/diseno/PROGRESO-JSON.md` — progreso, FSRS, export/import, métricas del panel.
6. `docs/modulos/v1/diseno/GUIA-ESTILO.md` — para los textos de la interfaz (voseo, criollo, sin relleno).
7. `CLAUDE.md` — reglas del proyecto.

## 2. Qué tocás y qué no

Tocás: todo `src/` **salvo** las 6 carpetas de área, `public/`, `astro.config.mjs`, `package.json`/`package-lock.json`, `tsconfig.json`, `vitest.config.ts`, `playwright.config.ts`, `tests/`, `e2e/`, `.github/workflows/`, `.nvmrc`.

Creás vos (y después no los toca nadie más): `src/content/areas.yaml` (CONTRATO §1.1) y `src/content/temas/ejemplo/media-y-mediana/` (CONTRATO §9).

No tocás: `src/content/temas/{analisis-datos,arquitecturas,servidores,matematica-fisica,probabilidad-estadistica,soporte}/` (son de los escritores), `docs/modulos/v1/fuentes/`, `docs/modulos/v1/SPEC.md`, `docs/modulos/v1/diseno/`. No pusheás ni creás el repo en GitHub (eso es F6, del director).

## 3. Cómo se reparte con los escritores

- **Hito 0 primero y rápido.** Es lo único que bloquea a F3: con el hito 0 en `main`, cada escritor puede correr `npm run build` y validar sus archivos. Lo terminás, corrés `npm run build` en verde, commiteás y avisás al director, que lo mergea a `main` y recién ahí lanza a los escritores en sus worktrees.
- Después seguís en tu rama/worktree contra el **tema de ejemplo** (`/ejemplo/`). No esperes contenido real: todo lo que necesitás probar está en el ejemplo (las 3 secciones, `Analogia`, `Ojo`, `Formula`, `Cita`, tabla GFM, `$…$`, `$$…$$`, `SimDatos`, los 3 tipos de ejercicio, un caso de guardia, problemas y fuentes con "ver más").
- Para los tests unitarios de reglas armá **fixtures** en `tests/fixtures/contenido/` (copias del ejemplo con otros ids), que lee solo Vitest. Para los e2e, el build se corre con `CAMPUS_INCLUIR_EJEMPLO=1` (CONTRATO §4, regla I14): el ejemplo aparece como un tema de Análisis de datos y sus tarjetas entran al repaso y al panel. No crees temas falsos dentro de las carpetas de área.
- Cuando el director mergee el contenido de F3, el build en modo estricto tiene que dar verde sin tocar código. Si no da, el problema es del contenido (lo arregla F5) o del contrato (avisás).

## 4. Qué construir, en orden

### Hito 0 — contrato ejecutable (bloquea a F3)

1. Dependencias con versión **exacta** (`npm i -E`), y después `npm ls` para confirmar que no se coló otra versión ni una segunda copia de katex:
   - dependencias: `astro@7.4.11 @astrojs/mdx@8.1.5 @astrojs/react@7.1.8 react@19.3.1 react-dom@19.3.1 @astrojs/markdown-remark@7.3.8 remark-math@6.0.0 rehype-katex@7.0.1 katex@0.16.47 ts-fsrs@6.0.0 mafs@0.21.0 @observablehq/plot@0.6.19 motion@14.12.0 idb-keyval@6.3.0 pagefind@1.6.0 astro-pagefind@2.0.1 @vite-pwa/astro@2.0.2`
   - desarrollo: `@astrojs/check@0.9.12 typescript@6.0.3 @types/react@19.3.0 @types/react-dom@19.3.0 vitest@5.1.0 @playwright/test@1.65.0 yaml@2.9.1`
   - `package.json`: `engines.node` = `">=24 <25"`, scripts `dev`, `build`, `preview` (`astro preview --port 4321 --ignore-lock`), `check` (`astro check`), `test` (`TZ=America/Argentina/Buenos_Aires vitest run`), `e2e` (`playwright test`).
2. `astro.config.mjs`:
   ```js
   import { defineConfig } from 'astro/config';
   import mdx from '@astrojs/mdx';
   import react from '@astrojs/react';
   import pagefind from 'astro-pagefind';
   import { AstroPWAIntegration } from '@vite-pwa/astro';   // export NOMBRADO (trampa 3)
   import { unified } from '@astrojs/markdown-remark';      // Astro 7 no trae remark por defecto (trampa 1)
   import remarkMath from 'remark-math';
   import rehypeKatex from 'rehype-katex';

   export default defineConfig({
     site: 'https://jrobilara.github.io',
     base: '/campus-personal',
     trailingSlash: 'always',
     integrations: [mdx(), react(), pagefind(), AstroPWAIntegration({ /* §5.6 */ })],
     markdown: { processor: unified({ remarkPlugins: [remarkMath], rehypePlugins: [rehypeKatex] }) },
   });
   ```
   Si las tablas GFM del ejemplo no salen como `<table>`, sumá el plugin GFM que corresponda al `unified(...)` con versión fija y anotalo.
3. `src/contenido/esquemas.ts` y `src/content.config.ts` copiados de CONTRATO §3; `src/contenido/integridad.ts` con las reglas I1-I15 de CONTRATO §4; `src/contenido/campus.ts` con `cargarCampus()`.
4. `src/content/areas.yaml` y el tema de ejemplo, tal cual CONTRATO §1.1 y §9.
5. Componentes MDX de CONTRATO §7 (`CasoReal`, `Intuicion`, `Formal`, `Analogia`, `Nota`, `Ojo`, `Cita`, `Formula`, `Profundizar`) y los **12 envoltorios de simulador** con su validación Zod de props (`src/simuladores/props.ts`, tipos de `SIMULADORES.md` §2) y una isla mínima que dice "Simulador en construcción". Exportá `NOMBRES_SIMULADORES` para la regla I9.
6. Página de tema mínima `src/pages/[area]/[tema].astro` + `/ejemplo/`: frontmatter, `<Content components={componentesMdx} />`, práctica en HTML estático (sin interactividad todavía) y fuentes.
7. Vitest de esquemas e integridad (§6.1, primeros dos ítems).
8. `npm run build` y `CAMPUS_ESTRICTO=1 npm run build` (este último **tiene que fallar** con I12/I13 porque todavía no hay áreas con temas: comprobalo y anotá el mensaje). Commit: `F2 hito 0: contrato ejecutable (esquemas, integridad, componentes MDX, ejemplo)`.

### Hito 1 — sitio navegable

Layout, tema claro/oscuro/sistema, portada, página de área, página de tema completa con ejercicios y casos interactivos, `catalogo.json` (§5.2).

### Hito 2 — progreso

`src/progreso/` según `PROGRESO-JSON.md`: almacén (idb-keyval), `fsrs.ts`, repaso de hoy, panel de progreso, ajustes (exportar, importar, deshacer importación, limpiar huérfanos, reiniciar, nuevas por día).

### Hito 3 — simuladores

Los 12, en el orden de `SIMULADORES.md` §4, reemplazando las islas "en construcción" sin cambiar las props.

### Hito 4 — buscador y PWA

Pagefind (§5.5) y PWA offline (§5.6).

### Hito 5 — tests completos y CI

Vitest y Playwright de §6, workflow de §7, `npx astro check` en 0 errores. Al final, el chequeo completo en verde: `npx astro check && npm run build && npm test && npx playwright test`.

## 5. Pantallas y piezas

Todas las URLs se arman con un helper `url(ruta)` en `src/lib/url.ts` que une `import.meta.env.BASE_URL` (que ya termina en `/`) con la ruta sin barra inicial (trampa 8). Prohibido concatenar `BASE_URL` a mano.

### 5.1 Layout y tema
- `<html lang="es">`, mobile-first, legible desde 360 px. Tipografía del sistema para el texto; KaTeX con su CSS (`katex/dist/katex.min.css`) y Mafs con `mafs/core.css` y `mafs/font.css`, importados una vez en el layout.
- Colores como variables CSS en `:root` y `[data-theme="dark"]`; el color de cada área sale de `areas.yaml` (`color` / `colorOscuro`) inyectado como `--color-area`.
- Tema: un script inline en `<head>` (antes de pintar) lee `campus:ajustes` de `localStorage` (con `try/catch`) y pone `data-theme="light|dark"` en `<html>`; con `sistema` sigue `prefers-color-scheme` y escucha sus cambios. Sin parpadeo al cargar.
- Navegación fija: Inicio · Repaso de hoy (con contador) · Progreso · Buscar · Ajustes. En celular, barra inferior.
- Todos los textos de interfaz en criollo con voseo ("Repasá", "Exportá tu progreso").

### 5.2 Datos para las islas: `catalogo.json`
Endpoint estático `src/pages/catalogo.json.ts` generado en el build desde `cargarCampus()` (sin temas de ejemplo): áreas (id, nombre, orden, colores, `exigeCasoDeGuardia`), temas (id, área, título, orden) y, por tema, tarjetas (id global, frente y dorso ya renderizados a HTML), ids globales de ejercicios y de casos. Lo usan repaso, progreso y portada; lo precachea la PWA.

### 5.3 Pantallas
| Ruta | Qué muestra |
|---|---|
| `/` | Las 6 áreas desde `areas.yaml` (en `orden`): ícono, nombre, color, descripción, cantidad de temas y dominio (isla chica). Arriba, "Para hoy: N tarjetas" con botón a `/repaso/`. Nada de nombres de área escritos en el código. |
| `/<area>/` | Los temas del área en `orden`: título, resumen, nivel, minutos, prerrequisitos (con enlace) y si ya hay progreso. Botón "Repasar esta área" → `/repaso/?area=<id>`. |
| `/<area>/<tema>/` | Encabezado (título, área, nivel, minutos, materias UNLaM, prerrequisitos), el cuerpo MDX y después Práctica y Fuentes (CONTRATO §6.2). Ids de sección: `caso-real`, `intuicion`, `formal`, `practica`, `fuentes`. `data-pagefind-body` en el `<main>` y `data-pagefind-meta="area:<nombre del área>"`. |
| `/ejemplo/` | El tema de ejemplo con la misma plantilla, `<meta name="robots" content="noindex">`, **sin** `data-pagefind-body`, sin enlaces desde ninguna parte. |
| `/repaso/` | Isla de repaso FSRS (`PROGRESO-JSON.md` §3.1): frente → "Mostrar respuesta" → 4 botones con el intervalo resultante. Atajos de teclado: espacio muestra, 1-4 califican. Al terminar: resumen y "Te quedan N para más tarde hoy". Acepta `?tema=` y `?area=`. |
| `/progreso/` | Panel (`PROGRESO-JSON.md` §5): dominio por área (barras), calendario de 26 semanas, racha, tarjetas de hoy y próximos 7 días. |
| `/buscar/` | Buscador (§5.5). |
| `/ajustes/` | Tema (claro / oscuro / del sistema), nuevas por día, exportar, importar, deshacer importación, limpiar huérfanos, reiniciar progreso. |
| 404 | Página en criollo con enlace a inicio. |

### 5.4 Práctica en la página de tema
- **Tarjetas**: lista con el frente visible y el dorso en `<details>` (así queda en el HTML para Pagefind). Botón "Repasar este tema ahora".
- **Ejercicios**: isla por ejercicio (`client:visible`) con SSR del enunciado. Numérico: input que acepta coma o punto, unidad al lado, botón "Corregir", reglas de tolerancia y `erroresComunes` de CONTRATO §8.3. Opción múltiple: radios + "Corregir", explicación de la elegida y de la correcta. V/F: dos botones. Cada respuesta actualiza `ejercicios` y `diasDeEstudio` en el progreso. Muestra "Intentos: N · Aciertos: M".
- **Casos de guardia**: isla navegable (CONTRATO §8.4): rol y contexto, decisión actual con sus opciones, consecuencia de la elegida, botón "Seguir", desenlace con resultado y lección, "Probar otro camino". Guarda intentos, mejor y último resultado.
- **Problemas**: lista estática con fuente, ubicación y enlace.
- El "texto corto" del YAML (CONTRATO §8.1) se renderiza en el build con un renderer propio en `src/lib/texto-corto.ts` (KaTeX con `throwOnError: true`).

### 5.5 Buscador (Pagefind)
- `astro-pagefind` indexa en el build. Solo se indexan páginas de tema (por `data-pagefind-body`); el ejemplo, repaso, progreso y ajustes no.
- UI propia en React con la API JS de Pagefind (no la UI legacy): `const pf = await import(/* @vite-ignore */ url('pagefind/pagefind.js'))`, `await pf.options({ baseUrl: import.meta.env.BASE_URL })`, `pf.search(q)`, y `data()` de los primeros 10 resultados. Filtro por área con el meta `area`. Muestra título, área y extracto con la coincidencia resaltada.
- En `npm run dev` no hay índice: la pantalla dice "El buscador funciona en el sitio construido (`npm run build && npm run preview`)".
- Pagefind detecta `lang="es"` (stemming en español): comprobá que "varianza" encuentra también "varianzas".

### 5.6 PWA (@vite-pwa/astro 2.0.2)
```js
AstroPWAIntegration({
  registerType: 'autoUpdate',
  manifest: {
    name: 'Campus personal', short_name: 'Campus', lang: 'es',
    start_url: '/campus-personal/', scope: '/campus-personal/', display: 'standalone',
    background_color: '#ffffff', theme_color: '#2563eb',
    icons: [{ src: 'icono.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }],
  },
  workbox: {
    globPatterns: ['**/*.{html,js,css,svg,woff,woff2,json,wasm,pf_meta,pf_index,pf_fragment}'],
    maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
    navigateFallback: null,
  },
})
```
- El plugin no inyecta el manifest ni registra el SW (trampa 3): en el layout, `<link rel="manifest" href={url('manifest.webmanifest')}>` y un script cliente que importa `registerSW` de `virtual:pwa-register` y lo llama con `{ immediate: true }`.
- Se precachea todo el sitio (son ~30 páginas): cualquier página anda offline después de la primera visita, no solo las visitadas.
- `pagefind()` va **antes** de la integración PWA en `integrations`, para que el índice exista cuando se arma el precache.

## 6. Tests

### 6.1 Vitest (`tests/`, sin `getViteConfig`: no está probado con Astro 7)
- **Esquemas**: el ejemplo (leído del disco con `yaml@2.9.1` y separando el frontmatter) valida; mutaciones que tienen que fallar con su ruta: 5 tarjetas (`tarjetas`), opción múltiple con 2 correctas, caso con ciclo, caso con nodo inalcanzable, fuente `video` sin `verMas`, una sola fuente principal, id `t-` usado en un ejercicio.
- **Integridad**: un test por regla I1-I15, con fixtures mínimos en `tests/fixtures/contenido/`.
- **FSRS con reloj fijo** (criterio 4) y **serialización** (`PROGRESO-JSON.md` §6).
- **Import inválido** (criterio 5): los cuatro casos de `PROGRESO-JSON.md` §6, el almacén queda idéntico.
- **Import válido** y **métricas**: export → import → mismos números de `calcularPanel`.
- **Texto corto**: negrita, itálica, código, `$…$`, bloque de código; LaTeX inválido tira error.

### 6.2 Playwright (`e2e/`)
`playwright.config.ts`: `webServer: { command: 'CAMPUS_INCLUIR_EJEMPLO=1 npm run build && npx astro preview --port 4321 --ignore-lock', url: 'http://localhost:4321/campus-personal/', reuseExistingServer: !process.env.CI, timeout: 180_000 }`, `use.baseURL: 'http://localhost:4321/campus-personal/'`, solo Chromium, perfil limpio por test.
- **Navegación**: la portada lista las 6 áreas de `areas.yaml`; entrar a un área y a un tema; en el tema, las secciones `#caso-real`, `#intuicion`, `#formal`, `#practica`, `#fuentes` existen en ese orden en el DOM.
- **Offline** (criterio 6): visitar la portada y un tema, esperar `navigator.serviceWorker.ready` y que la página esté controlada, `context.setOffline(true)`, recargar la portada y el tema: los dos cargan con su título.
- **Búsqueda** (criterio 7): en `/buscar/`, escribir "varianza"; tiene que aparecer un resultado que enlaza a `probabilidad-estadistica/variables-y-distribuciones/`. Mientras ese tema no exista, el test va con `test.fixme` y un comentario `// se activa cuando entre el contenido de F3`; el director lo destraba en F6.
- **Repaso**: con `page.clock.setFixedTime`, calificar "Bien" una tarjeta y comprobar que el contador "Para hoy" baja; adelantar el reloj al día de su `dueAt` y comprobar que vuelve.
- **Export/import** (criterio 5): el flujo de `PROGRESO-JSON.md` §6; además, importar un archivo inválido muestra el aviso y el panel no cambia.
- **Tema claro/oscuro**: cambiar en Ajustes, recargar, se mantiene.
- **Simuladores**: uno por simulador, con el tema de ejemplo o con fixtures: mover un control y verificar una línea de "qué tiene que verse" de `SIMULADORES.md` leyendo `data-lectura`.
- **Subpath**: ningún recurso pedido por la portada y el tema responde 404 (escuchar `response` y fallar con cualquier 404 bajo `/campus-personal/`).

## 7. GitHub Actions: `.github/workflows/deploy.yml`

```yaml
name: Deploy a GitHub Pages
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: false
env:
  CAMPUS_ESTRICTO: '1'
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@vN        # fijá el major del último release: gh api repos/actions/setup-node/releases/latest --jq .tag_name
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - run: npx astro check
      - run: npm run build
      - run: npm test
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test
        env:
          CI: 'true'
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: withastro/action@v6           # Node 24 por defecto; respeta CAMPUS_ESTRICTO del env
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v5
```

- `.nvmrc` = `24`. Se commitea el `package-lock.json`.
- En GitHub, Pages → Source = GitHub Actions (lo hace el director en F6).
- El workflow corre en modo estricto: con contenido incompleto, falla a propósito.

## 8. Trampas del stack que tenés que respetar

1. **Astro 7 no trae remark/rehype**: KaTeX solo anda con `@astrojs/markdown-remark` y `markdown.processor: unified({...})`. Los tutoriales de Astro 4-6 no sirven acá.
2. **ts-fsrs 6 cambió la API**: `DefaultScheduler()` (async), `newCard`, `preview`, `review`; nada de `createEmptyCard`/`fsrs()`/`.next()`. Los campos son `dueAt`, `lastReviewAt`, `scheduledDays`, `stabilityFast`, `cardId`, `scheduleStatus`. **Un card que pasó por JSON tira `SRSSchemaError` en `review()`** si no reconvertís `dueAt` y `lastReviewAt` a `Date`. `engines` pide Node ≥ 24.
3. **@vite-pwa/astro 2.0.x usa export nombrado** `AstroPWAIntegration` (la doc web muestra el default, que falla). No inyecta el `<link rel="manifest">` ni registra el SW: lo hacés en el layout.
4. **TypeScript 6.0.3, no 7**: `@astrojs/check@0.9.12` pide `^5 || ^6`.
5. **Una sola copia de katex (0.16.47)**: `katex@latest` es 0.19 y duplica CSS y fuentes. Confirmalo con `npm ls katex`. CSS desde `katex/dist/katex.min.css`.
6. **`astro preview` puede irse a segundo plano** en contexto no interactivo: usá `astro preview --port 4321 --ignore-lock` (también en Playwright).
7. **`npm i` sin versión instaló versiones viejas** (react 18, vitest 4) en la verificación: siempre `npm i -E paquete@versión` y `npm ls` después.
8. **`BASE_URL` ya termina en `/`** con `trailingSlash: 'always'`: concatenar a mano da `//`. Helper `url()`.
9. **El compilador de Astro 7 es estricto con HTML mal anidado** o sin cerrar: rompe el build.
10. **Las directivas `client:*` no van sobre componentes pasados por `components`** al `<Content>`: por eso cada simulador tiene envoltorio `.astro` que monta la isla.
11. **Mafs 0.21.0** no tiene releases desde 2024 (anda con React 19 en build). Si una isla de Mafs falla en SSR, `client:only="react"`; si falla del todo, el simulador se rehace con Plot sin cambiar sus props.
12. **Observable Plot es imperativo**: `Plot.plot()` en `useEffect` sobre un `ref`, y reemplazar el nodo en cada cambio. No está probado dentro de una isla en navegador: probalo primero con `SimDatos` del ejemplo.
13. **Pagefind bajo subpath no está probado con una búsqueda real**: tu test de búsqueda es la prueba. Usá `pf.options({ baseUrl })`.
14. **Node 24** con `nvm use` (esta PC trae Node 25, que Astro no soporta). CI con Node 24.
15. **Vitest con `getViteConfig` de Astro no está probado**: por eso la lógica testeable (esquemas, integridad, FSRS, progreso, métricas, texto corto) va en módulos puros que no importan `astro:content`.

## 9. Cómo entregás

- Commits por hito (`F2 hito N: …`), en tu rama o worktree. El hito 0 se avisa apenas está.
- Al terminar: chequeo completo en verde, `npm ls` sin duplicados de katex ni versiones distintas a las de §4, y un informe corto al director: qué quedó, qué test está en `fixme` y por qué, desvíos del contrato (si hubo) y riesgos.
