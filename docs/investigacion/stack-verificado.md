# Verificación técnica de stack - campus-personal (fecha: 2026-11-11)

Método: `npm view` + API del registry (npmjs) de HOY, docs oficiales (WebFetch), API de GitHub (releases/pushed_at) y, sobre todo, un proyecto descartable en
`/tmp/claude-1000/-home-juan/bbcad05a-c209-4ace-bda0-6ca88a5a3f55/scratchpad/scaf/verif` (Astro 7 + MDX + React + KaTeX + Mafs + Motion + ts-fsrs + Pagefind + PWA + Zod + Vitest + Playwright) donde construí y ejecuté todo. Ahí "VERIFICADO (probado)" = lo corrí hoy; "VERIFICADO (registry/docs)" = sólo leído.

## Recomendación en una línea
Astro 7 + @astrojs/mdx + islas React 19 (client:visible), KaTeX con unified (remark-math + rehype-katex), ts-fsrs 6 (API nueva), Mafs + Observable Plot, Motion, Pagefind, @vite-pwa/astro 2 (export nombrado), idb-keyval, Vitest 5 + Playwright, Zod vía content collections, withastro/action@v6, Node 24.

## Hallazgos críticos (cambian lo que "sabías")
1. **Astro 7 usa Sätteri (Rust) como procesador Markdown/MDX por defecto; remark/rehype ya NO vienen.** Para remark-math/rehype-katex hay que instalar `@astrojs/markdown-remark` y poner `markdown.processor: unified({ remarkPlugins:[remarkMath], rehypePlugins:[rehypeKatex] })`. Probado: build OK, genera `.katex` y `.katex-display`. Fuente: https://docs.astro.build/en/guides/upgrade-to/v7/ y https://docs.astro.build/en/guides/markdown-content/
   Alternativa nativa probada: `satteri({ features:{ math:true, rawHtml:true }, mdastPlugins:[satteriKatex()] })` (satteri-katex 0.3.0, comunidad, pre-1.0). OJO: sin `rawHtml:true` el build de MDX FALLA ("Cannot compile a raw node"); y KaTeX debe ir en `mdastPlugins` (no hast) o `$$..$$` sale como bloque de código (https://dev.to/ashish-codejourney/astro-7-renders-your-display-maths-as-a-code-block-and-wont-tell-you-cp0). Elegí unified: camino conocido y probado, sin depender de un plugin 0.x.
2. **ts-fsrs 6.0.0 cambió la API**: `createEmptyCard`, `fsrs()`, `.next()` aparecen como `deprecated` (astro check lo marca). API actual: `const s = await DefaultScheduler(); const card = s.newCard({now}); s.preview({card,now}); s.review({card,grade:Rating.Good,now}) -> {card, revlog}`. Default = FSRS-7. Los campos del card cambiaron (`dueAt`, `lastReviewAt`, `scheduledDays`, `stabilityFast`, `cardId`...). Engines `node >=24` (afecta CI/Vitest, no el navegador). Probado en Node y en Vitest. Fuente: README de ts-fsrs@6.0.0 instalado + https://www.npmjs.com/package/ts-fsrs
3. **@vite-pwa/astro 2.0.x (v2.0.0 = 31 oct 2026) cambió a export NOMBRADO** `import { AstroPWAIntegration } from '@vite-pwa/astro'`. Las docs web (vite-pwa-org / unplugin-pwa.netlify.app) siguen mostrando `import AstroPWA from` (default) y fallan: "does not provide an export named 'default'". La verdad está en el README del paquete. No inyecta `<link rel=manifest>` ni registra el SW solo (hay que añadirlos al layout). Probado: genera sw.js, workbox, manifest con scope `/campus-personal/` y precachea los archivos de pagefind.
4. **TypeScript 7.0.2 es `latest`, pero @astrojs/check@0.9.12 pide `typescript ^5 || ^6`** -> fijar `typescript@^6` (6.0.3). Probado: `astro check` 0 errores con TS 6.0.3.
5. **katex duplicado**: rehype-katex/remark-math/mafs dependen de katex `^0.16`; `katex@latest` es 0.19.1 -> dos copias y CSS/fuentes desalineados. Fijé `katex@0.16.47` (npm ls: una sola copia deduped). Importar CSS de `katex/dist/katex.min.css`.
6. **`astro preview` en Astro 7 puede quedar en segundo plano** (en mi entorno detectó contexto no interactivo y daemonizó; Playwright `webServer` salió con "exited early"). Solución usada: `astro preview --port 4321 --ignore-lock` -> smoke OK (también con CI=true).
7. En mi instalación `npm i react vitest ...` sin versión resolvió react 18.3.1 y vitest 4.1.12 aunque `latest` es 19.3.1 / 5.1.0 (causa no determinada; posible caché/espejo). Fijá versiones explícitas y verificá con `npm ls`.
8. `import.meta.env.BASE_URL` con `base:'/campus-personal'` + `trailingSlash:'always'` terminó con "/" -> concatenar `${BASE_URL}/x` dio `/campus-personal//x`. Armar URLs con un helper.

## Tabla por ítem

| # | Ítem | Versión (latest hoy) / fecha release | Estado | Fuente | Por qué / compat |
|---|------|------|--------|--------|------------------|
| 1 | Astro | 7.4.11 (2026-11-11); engines node >=22.23.4 (impares no soportados); Vite 8.3.8 | mantenido (push hoy) | https://registry.npmjs.org/astro ; https://docs.astro.build/en/install-and-setup/ | Recomendado vs Vite+React SPA: HTML estático por tema (cero JS salvo islas), content collections + Zod, `base` nativo, Pagefind y PWA con integraciones. SPA exigiría router, base en rutas, SSR de MDX/SEO manual. |
| 1b | @astrojs/mdx | 8.1.5 (2026-11-11); peer astro ^7.2.10 | ok | https://registry.npmjs.org/@astrojs/mdx ; https://docs.astro.build/en/guides/integrations-guide/mdx/ | MDX con componentes React en islas. Probado. |
| 1c | @astrojs/react | 7.1.8 (2026-11-11); react 17/18/19; Vite plugin-react 6 | ok | https://registry.npmjs.org/@astrojs/react | React elegido sobre Preact: Mafs/Motion/Recharts son React-first. @astrojs/preact 6.1.5 también existe (preact 11.2.0). |
| 1d | React | 19.3.1 (2026-11-11) | ok | https://registry.npmjs.org/react | Peer de mafs/motion/astro-react satisfecho. |
| 2 | remark-math | 6.0.0 (2023-09-19) | estable, sin releases desde 2023 (push 2025-02) | https://registry.npmjs.org/remark-math | unified 11, compatible con @astrojs/markdown-remark 7.3.8 (probado). |
| 2 | rehype-katex | 7.0.1 (2024-08-19) | idem | https://registry.npmjs.org/rehype-katex | Pide katex ^0.16. |
| 2 | katex | 0.19.1 latest (2026-10-23); usar 0.16.47 | mantenido (push hoy) | https://registry.npmjs.org/katex | Ver hallazgo 5. |
| 2 | @astrojs/markdown-remark | 7.3.8 (2026-11-11) | ok | https://docs.astro.build/en/guides/markdown-content/ | Necesario en Astro 7 para unified. |
| 3 | ts-fsrs | 6.0.0 (2026-10-28), node >=24, FSRS-3..7 | mantenido (push 2026-11-10) | https://registry.npmjs.org/ts-fsrs ; https://github.com/open-spaced-repetition/ts-fsrs | API `DefaultScheduler`. Guardar `card` y `revlog` (serializan a JSON; fechas como string ISO -> reconvertir si hace falta). |
| 4 | @observablehq/plot | 0.6.19 (2026-11-05) | mantenido (push 2026-11-05) | https://registry.npmjs.org/@observablehq/plot | ELEGIDO #1: curvas/distribuciones/panel de progreso con poco código; dep d3. Imperativo (usar `useEffect`+ref o `client:only`; no probé render en navegador). |
| 4 | mafs | 0.21.0 (2024-10-20; modified 2025-03) | commits recientes (push 2026-11-05) pero sin release hace 13 meses | https://registry.npmjs.org/mafs | ELEGIDO #2: sliders+curvas interactivas, soporta React >=18 (compila con React 19, probado build). Riesgo: sin releases; si se rompe, Plot cubre. Requiere `mafs/core.css` y `font.css`. |
| 4 | recharts | 3.10.1 (2026-11-03) | mantenido | https://registry.npmjs.org/recharts | Descartado salvo plan B para el panel de progreso. |
| 4 | d3 | 7.9.2 (2026-11-03) | mantenido | https://registry.npmjs.org/d3 | Ya viene bajo Plot. |
| 4 | @visx/visx | 4.0.0 (2026-06-11) | push 2026-06 | https://registry.npmjs.org/@visx/visx | Descartado: más bajo nivel, más código. |
| 4 | jsxgraph | 1.14.3 (2026-11-06) | mantenido | https://registry.npmjs.org/jsxgraph | Descartado: no React-nativo, pesado. |
| 5 | motion | 14.12.0 (2026-11-10); import `motion/react`; deps framer-motion 14.12.0 | mantenido | https://registry.npmjs.org/motion | Paquete actual = `motion` (framer-motion sigue publicándose igual). Probado `import { motion } from 'motion/react'`. Para el balanceador de carga bastan SVG+CSS/Motion. |
| 6 | pagefind | 1.6.0 (2026-11-01) | mantenido | https://pagefind.app/docs/ ; https://registry.npmjs.org/pagefind | ELEGIDO: índice estático por build, detecta `lang="es"`, no carga el índice entero. Probado `npx pagefind --site dist`. |
| 6 | astro-pagefind | 2.0.1 (2026-07-03); peer astro ^2..^7 | ok | https://github.com/shishkin/astro-pagefind | Integración que indexa en el build y soporta `base`. Probado: "Pagefind indexed 1 pages", escribe dist/pagefind. El UI legacy está en mantenimiento; usar el Component UI de Pagefind 1.5+. Fuse.js 7.5.0 / MiniSearch 7.2.0 descartados (cargan todo el índice). |
| 7 | @vite-pwa/astro | 2.0.2 (2026-11-09); peer astro ^5/6/7, node >=22.14 | mantenido pero major MUY reciente (2.0.0 = 2026-10-31) | https://registry.npmjs.org/@vite-pwa/astro ; https://github.com/vite-pwa/astro/releases | Probado con Astro 7.4.11 / Vite 8.3.8. Ver hallazgo 3. vite-plugin-pwa 2.0.0 (2026-10-03, vite hasta ^8) sirve sólo si fuera SPA Vite. |
| 8 | idb-keyval | 6.3.0 (2026-07-08) | ok | https://registry.npmjs.org/idb-keyval | ELEGIDO: KV simple, 0 deps, exportar/importar = volcar claves a JSON. |
| 8 | dexie | 4.4.7 (2026-10-19) | mantenido | https://registry.npmjs.org/dexie | Plan B si el log de repasos necesita consultas/índices. |
| 9 | vitest | 5.1.0 (2026-11-02); node ^22.12 / ^24 / >=26; vite ^6.4/7/8 | mantenido | https://registry.npmjs.org/vitest | Probado test de ts-fsrs en verde. Integración con `getViteConfig` de Astro NO probada. |
| 9 | @playwright/test | 1.65.0 (2026-11-05) | mantenido | https://registry.npmjs.org/@playwright/test | Probado smoke contra `astro preview`: KaTeX display visible, slider de la isla hidratada, `pagefind.js` 200. Chromium headless ~126 MiB. |
| 10 | withastro/action | v6 (último tag v6.1.4, 2026-10-23); node por defecto 24 | mantenido | https://docs.astro.build/en/guides/deploy/github/ ; API GitHub releases | Workflow oficial: checkout@v7 (7.0.1), withastro/action@v6, deploy-pages@v5 (5.0.1). Config: `site:'https://usuario.github.io'`, `base:'/campus-personal'`. Pages Source = GitHub Actions. Commitear lockfile. |
| 10 | Node | LTS vigentes hoy: 26.13.1 "Lithium" (2026-11-10) y 24.22.3 "Krypton" (2026-11-10) | - | https://nodejs.org/dist/index.json | Usar Node 24 en CI/local (default de la action, cumple astro >=22.23.4, ts-fsrs >=24, vitest). Node 25 (impar, el de esta máquina v25.9.0) no es soportado por Astro, aunque instaló y compiló. |
| 11 | Zod / content collections | zod 4.6.7 (2026-10-12); `import { z } from 'astro/zod'` | ok | https://registry.npmjs.org/zod | Probado: `loader: glob(...)` + `z.object` en `src/content.config.ts`; una tarjeta con `dorso: ""` rompe el build (exit 1: "tarjetas.0.dorso: Too small: expected string to have >=1 characters"). |
| - | @astrojs/check + typescript | 0.9.12 (2026-10-21) + typescript 6.0.3 (NO 7.0.2) | - | https://registry.npmjs.org/@astrojs/check | Ver hallazgo 4. |

## Scaffolding (verificado, exit 0, ~35 s)
```
npm create astro@latest campus-personal -- --template minimal --yes --no-git --skip-houston --install
```
Flags documentados en https://github.com/withastro/astro/blob/main/packages/create-astro/README.md: `--template`, `--yes/-y`, `--no/-n`, `--install/--no-install`, `--git/--no-git`, `--add <integración>`, `--no-ai` (evita AGENTS.md), `--dry-run`, `--skip-houston`. Después:
```
npx astro add mdx react   # o npm i directo con versiones fijas
npm i @astrojs/markdown-remark remark-math rehype-katex katex@0.16.47 ts-fsrs@6 mafs @observablehq/plot motion idb-keyval pagefind astro-pagefind @vite-pwa/astro react@19 react-dom@19
npm i -D @astrojs/check typescript@6 @types/react @types/react-dom vitest@5 @playwright/test
```
(Nota: en el mismo directorio donde el CLI crea el proyecto con `--yes`, la plantilla minimal trae sólo `astro` y scripts dev/build/preview/astro.)

## Comando de test base
- Proyecto recién creado (minimal) -> verde, probado: `npm run build`
- Con `@astrojs/check` + `typescript@^6` instalados -> verde, probado en proyecto fresco: `npx astro check && npm run build` (0 errors / 0 warnings / 0 hints; sin esas dos dependencias `astro check` pide instalarlas).
- Stack completo (probado en piezas): `npx astro check && npm run build && npx vitest run && npx playwright test` con `webServer.command: 'npx astro preview --port 4321 --ignore-lock'`.

## Riesgos
- Astro 7 es un cambio de procesador MD/MDX; casi todo tutorial/LLM de remark-math asume Astro 4-6. Usar unified explícito.
- @vite-pwa/astro 2.0.x es nuevo y sus docs están desactualizadas; fijar versión exacta y probar offline real (instalar PWA, modo avión) tras cada subida.
- Mafs sin release desde oct-2024 (ok con React 19 en build, pero sin garantías).
- ts-fsrs 6: API nueva (async scheduler, campos renombrados); tutoriales viejos usan la deprecada. Definir formato de serialización de cards/revlog desde el día 1 (el import/export JSON depende de eso) y versionarlo.
- Dos copias de katex o `typescript@7` rompen silenciosamente (CSS/fuentes; astro check).
- GitHub Pages bajo subpath: probar con `base` desde el primer commit (fetch del índice de Pagefind, `start_url`/`scope` del manifest, `BASE_URL` con doble barra).
- Rust compiler de Astro 7 es estricto: HTML mal anidado/tags sin cerrar ahora rompen el build (bueno para MDX, pero atención al migrar contenido).

## NO VERIFICADO
- Render real de Observable Plot dentro de una isla React en navegador (sólo versión/registro).
- Funcionamiento offline real del SW (instalación y navegación sin red) y actualización del SW en GitHub Pages; sólo verifiqué que se genera, precachea pagefind y tiene scope correcto.
- Pagefind funcionando en navegador bajo subpath (verifiqué indexado y que `pagefind.js` responde 200 bajo `/campus-personal/`; no ejecuté una búsqueda real). La doc de Pagefind sobre `basePath` devolvió 404 (https://pagefind.app/docs/api-config/); la compatibilidad con base la afirma el README de astro-pagefind.
- Vitest integrado con config de Astro (`getViteConfig`) y tests de componentes React.
- El workflow de GitHub Actions real (lo leí de la doc oficial; no se ejecutó en GitHub).
- Estado de mantenimiento de Node 24 (si ya pasó a Maintenance) y fechas de EOL: sólo vi que ambos figuran como LTS en nodejs.org/dist/index.json.
- Causa de que `npm i` sin versión instalara react 18.3.1 / vitest 4.1.12.
- Motion con la animación específica del balanceador (sólo import y build).
