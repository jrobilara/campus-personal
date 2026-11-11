# CLAUDE.md — Reglas para Claude Code en campus-personal

> Solo reglas de comportamiento. Test por línea antes de agregar nada: **si borro esta línea, ¿Claude se equivoca? Si no, sobra.**

## Autonomía

Resolvés solo todo, producción incluida y el merge con el gate verde. Preguntás las 5 de `sensible:` en `.claude/kit.md` (borrar datos reales · plata · claves · mandar algo afuera a nombre del dueño · publicar un release) y lo que el `/inicio` manda preguntar: lo que dejó otra sesión es propuesta y espera el OK (paso 9). Lo rutinario lo decidís con la recomendada y lo avisás en una línea. Un obrero de fondo corre en `auto` con la lista de su encargo, y los porteros frenan igual.

Un `/director` o `/obrero` entra a su worktree con `EnterWorktree` (lo dice su skill).

Si la sesión cambió cómo trabaja el proyecto (un freno, una regla, un paso de un ritual), lo anota: `node .claude/scripts/cambios.cjs nuevo …`.

## El tamaño del pedido

Ante un pedido nuevo, **la primera línea de tu respuesta es el tamaño**, sin preguntar. Dos preguntas: ¿hace falta algo más que el pedido y el `git diff` para retomarlo? ¿lleva más de una sesión? Ninguna sí: *"chico, lo hago acá"*. Alguna sí: *"esto es más que chico: llamo al Arquitecto"*, e invocás `/arquitecto`. Tocar plata, permisos o datos reales no lo agranda: eso lo cuidan los frenos, no un spec.

Lo que sale de una charla con el dueño (una guía, un procedimiento, algo que está en su cabeza) es más que chico aunque termine en un documento: retomarlo pide esa charla. Más que chico **siempre invoca `/arquitecto`**, también de noche o sin el dueño: si trabaja alguien solo y cómo, lo decide el Arquitecto.

## Mapa de documentación

La única copia: `docs/README.md` y el resto apuntan acá. En la raíz de `docs/`, seis archivos y tres carpetas; lo que no encaja va a `referencia/`.

- `NORTE.md` qué es la app y para qué (manda ante la duda) · `MAPA.md` cómo se conecta (opcional).
- `SESSION_HANDOFF.md` dónde quedamos (tope 5.000 bytes; `/cierre` lo sobreescribe; si git dice otra cosa, manda git).
- `TODO.md` la única fuente de pendientes · `CHANGELOG.md` historia, no se reescribe · `README.md` la puerta, sin repetir este mapa.
- `modulos/<x>/` ficha, `SPEC.md`, historia; el spec más nuevo manda · `referencia/` lo que no cambia a diario (`trampas.md` es el desborde de este archivo) · `archive/` solo lo muerto.
- `.claude/kit.md` la ficha del kit (la lee un script: respetá su forma) · `.claude/frenos.log` solo se agrega.

## Cómo hablás

Todo en español, narración incluida. Decisiones: contexto, la RECOMENDADA primero, "qué cambia para vos" y el botón "explicámelo en criollo". Todo archivo que entregues se nombra con su ruta absoluta y fuera del scratchpad. Los entornos de prueba del proyecto, en `entornos:` de la ficha.

## Evidencia con datos reales

Capturas, exports y volcados viven **fuera del repo, con registro** (ruta, tramo, quién la borra), y se borran al cerrar.

## Este proyecto (stack, comandos y reglas)

- Stack: Astro 7 + MDX + islas de React 19, KaTeX (unified), ts-fsrs 6, Mafs + Observable Plot, motion, Pagefind, @vite-pwa/astro 2.0.2, idb-keyval, Zod, Vitest + Playwright. Las versiones van **fijadas** (nunca `latest`) y se revisan con `npm ls`. Detalle y trampas: `docs/modulos/v1/investigacion/stack-verificado.md`.
- Node 24 (`.nvmrc`); esta PC trae Node 25, que Astro no soporta: `nvm use` antes de correr nada.
- Comandos: `npm run dev` · chequeo base `npm run build` · chequeo completo `npx astro check && npm run build && npx vitest run && npx playwright test`.
- Deploy: push a `main` → GitHub Actions → `https://jrobilara.github.io/campus-personal/` (`base: '/campus-personal'`; con `trailingSlash` el `BASE_URL` ya termina en `/`).
- Áreas y temas salen de las content collections de Astro, validados con esquema Zod: sumar un tema es sumar un archivo, nunca tocar pantallas. Un archivo mal formado rompe el build con el archivo y el campo.
- Toda afirmación del contenido lleva cita (libro con capítulo, doc oficial o curso abierto con URL); videos y blogs solo como "para ver más". Nunca texto copiado de libros: paráfrasis propia.
- Cada tema sigue el orden caso real → intuición (gráfico, animación o simulador) → formal → práctica → fuentes, en criollo rioplatense con el término técnico en inglés entre paréntesis.
- Importar un JSON de progreso inválido avisa y no pisa el progreso actual; el JSON lleva `version`.
- Solo español (i18n: NO) y sin login (multi-tenant: NO): decididos en el SPEC-0, no se reabren sin Arquitecto.
