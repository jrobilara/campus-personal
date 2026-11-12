# Handoff — campus-personal

> Foto de dónde quedamos. `/cierre` lo SOBREESCRIBE ENTERO: acá no se apila historia (eso es el CHANGELOG). Tope 5.000 bytes, secciones fijas y en este orden. Si no entra: el detalle va al CHANGELOG, las trampas a `referencia/trampas.md` y los pendientes al TODO.

## Estado
- Rama · entorno: main · local; el sitio va a GitHub Pages (`https://jrobilara.github.io/campus-personal/`)
- Accesos temporales a producción: ninguno
- Producción: F6b en curso (repo público, Pages y primer deploy); chequeo completo verde antes de publicar (377 unit + 170 e2e)

## Próximo paso
Confirmar el deploy en el sitio vivo (portada con las 6 áreas, un tema por área, buscador "varianza", offline, export/import) y, si todo anda, avanzar a F7 (revisión de código y de UI) según `docs/modulos/v1/README.md`.

## Bloqueos
- ninguno

## Te espera
- Vetar o ajustar la lista de temas de v1 (SPEC-0, "Temas de v1") cuando vuelvas.

## En curso
- nada: montaje terminado, la construcción arranca dirigida desde la sesión del Arquitecto.

## Contexto
- La sesión del Arquitecto pasa a director por pedido del dueño: lanza subagentes (Opus medio planifica, Sonnet alto ejecuta) y no escribe código ni contenido.
- Repo público `jrobilara/campus-personal` autorizado; `gh` ya autenticado con `repo` y `workflow`.
- Trampas del stack (Astro 7 sin remark por defecto, ts-fsrs 6 con API nueva, @vite-pwa/astro con export nombrado, TS ^6, katex 0.16.47): `docs/modulos/v1/investigacion/stack-verificado.md`.
