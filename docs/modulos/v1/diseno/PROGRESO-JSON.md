# PROGRESO-JSON — progreso en el navegador, export e import (v1)

> El progreso vive solo en el navegador (idb-keyval) y se pasa entre dispositivos exportando e importando un JSON. Este documento fija el formato (versión 1), la integración con ts-fsrs 6, las reglas de import y las métricas del panel. Lo implementa F2.
>
> Verificado hoy contra ts-fsrs 6.0.0 instalado en el proyecto descartable de `stack-verificado.md`: la forma del card y del revlog de abajo es la que devuelve la librería, y **un card que pasó por `JSON.parse` falla en `review()` con `SRSSchemaError: Expected valid Date fields`** hasta que se reconvierten `dueAt` y `lastReviewAt` a `Date`.

## 1. Dónde se guarda

| Qué | Dónde | Clave |
|---|---|---|
| Progreso completo (objeto `ProgresoV1`) | IndexedDB vía idb-keyval (store por defecto) | `campus:progreso` |
| Copia previa a la última importación | idem | `campus:progreso-antes-de-importar` |
| Ajustes (tema, nuevas por día) | `localStorage` | `campus:ajustes` → `{ "tema": "sistema", "nuevasPorDia": 10 }` |

Los ajustes no viajan en el export (son del dispositivo). Toda escritura del progreso pasa por `update('campus:progreso', fn)` de idb-keyval (transacción atómica), así dos pestañas no se pisan a mitad de una escritura.

## 2. Formato `ProgresoV1`

### 2.1 Ejemplo

```json
{
  "app": "campus-personal",
  "version": 1,
  "exportadoEn": "2026-11-20T21:14:03.120Z",
  "fsrs": { "libreria": "ts-fsrs@6.0.0", "modelo": "FSRS-7" },
  "tarjetas": {
    "probabilidad-estadistica/bayes-falsos-positivos#t-vpp-baja-prevalencia": {
      "card": {
        "stability": 3.9221,
        "stabilityFast": 3.13768,
        "difficulty": 3.53072398,
        "dueAt": "2026-11-24T18:39:55.164Z",
        "lastReviewAt": "2026-11-20T00:00:00.000Z",
        "state": 2,
        "scheduleStatus": "review",
        "cardId": "a33f9bb9-0cb0-4b4f-94c0-0839a93c5998",
        "reps": 1,
        "lapses": 0,
        "scheduledDays": 4.777721809269842,
        "learningStep": 0
      }
    }
  },
  "revlog": [
    {
      "tarjeta": "probabilidad-estadistica/bayes-falsos-positivos#t-vpp-baja-prevalencia",
      "log": {
        "stability": 0, "stabilityFast": 0, "difficulty": 0,
        "dueAt": "2026-11-20T00:00:00.000Z", "lastReviewAt": null,
        "reviewTime": "2026-11-20T00:00:00.000Z",
        "scheduleStatus": "new", "rating": 3, "state": 0,
        "cardId": "a33f9bb9-0cb0-4b4f-94c0-0839a93c5998",
        "scheduledDays": 0, "learningStep": 0
      }
    }
  ],
  "ejercicios": {
    "analisis-datos/limpieza-y-eda#e-duplicados": {
      "intentos": 3, "aciertos": 2, "ultimoResultado": "acierto", "ultimoEn": "2026-11-20T21:02:11.000Z"
    }
  },
  "casos": {
    "servidores/backups-rpo-rto#c-ransomware-viernes": {
      "intentos": 2, "mejorResultado": "bien", "ultimoResultado": "regular", "ultimoEn": "2026-11-19T22:40:00.000Z"
    }
  },
  "diasDeEstudio": { "2026-11-19": 4, "2026-11-20": 17 }
}
```

### 2.2 Esquema Zod (`src/progreso/esquema.ts`)

```ts
import { z } from 'astro/zod';

const RE_ID_GLOBAL = /^[a-z0-9]+(?:-[a-z0-9]+)*\/[a-z0-9]+(?:-[a-z0-9]+)*#[tecp]-[a-z0-9]+(?:-[a-z0-9]+)*$/;
const RE_DIA = /^\d{4}-\d{2}-\d{2}$/;
const iso = z.iso.datetime({ offset: true }); // string ISO 8601

const idGlobal = z.string().regex(RE_ID_GLOBAL);

// Card de ts-fsrs 6 serializado (fechas como string ISO). looseObject: tolera campos nuevos de versiones futuras.
export const esquemaCardSerializado = z.looseObject({
  stability: z.number().nonnegative(),
  stabilityFast: z.number().nonnegative(),
  difficulty: z.number().nonnegative(),
  dueAt: iso,
  lastReviewAt: iso.nullable(),
  state: z.number().int().min(0).max(3),        // State: 0 New, 1 Learning, 2 Review, 3 Relearning
  scheduleStatus: z.string(),                    // "new" | "learning" | "review" | …
  cardId: z.string(),
  reps: z.number().int().nonnegative(),
  lapses: z.number().int().nonnegative(),
  scheduledDays: z.number().nonnegative(),
  learningStep: z.number().int().nonnegative(),
});

export const esquemaRevlogSerializado = z.looseObject({
  rating: z.number().int().min(1).max(4),        // Rating: 1 Again, 2 Hard, 3 Good, 4 Easy
  state: z.number().int().min(0).max(3),         // estado ANTES de calificar
  reviewTime: iso,
  dueAt: iso,
  lastReviewAt: iso.nullable(),
  stability: z.number(),
  stabilityFast: z.number(),
  difficulty: z.number(),
  scheduledDays: z.number(),
  learningStep: z.number().int(),
  scheduleStatus: z.string(),
  cardId: z.string(),
});

export const esquemaProgresoV1 = z.object({
  app: z.literal('campus-personal'),
  version: z.literal(1),
  exportadoEn: iso.nullable(),                   // null mientras vive en el navegador; se llena al exportar
  fsrs: z.object({ libreria: z.string(), modelo: z.string() }),
  tarjetas: z.record(idGlobal, z.object({ card: esquemaCardSerializado })),
  revlog: z.array(z.object({ tarjeta: idGlobal, log: esquemaRevlogSerializado })),
  ejercicios: z.record(idGlobal, z.object({
    intentos: z.number().int().min(1),
    aciertos: z.number().int().min(0),
    ultimoResultado: z.enum(['acierto', 'error']),
    ultimoEn: iso,
  })).refine((r) => Object.values(r).every((e) => e.aciertos <= e.intentos), 'aciertos no puede superar intentos'),
  casos: z.record(idGlobal, z.object({
    intentos: z.number().int().min(1),
    mejorResultado: z.enum(['bien', 'regular', 'mal']),
    ultimoResultado: z.enum(['bien', 'regular', 'mal']),
    ultimoEn: iso,
  })),
  diasDeEstudio: z.record(z.string().regex(RE_DIA), z.number().int().min(1)), // día local → cantidad de acciones
});
export type ProgresoV1 = z.infer<typeof esquemaProgresoV1>;

export const progresoVacio = (): ProgresoV1 => ({
  app: 'campus-personal', version: 1, exportadoEn: null,
  fsrs: { libreria: 'ts-fsrs@6.0.0', modelo: 'FSRS-7' },
  tarjetas: {}, revlog: [], ejercicios: {}, casos: {}, diasDeEstudio: {},
});
```

Si `z.looseObject` o `z.iso.datetime` no existieran con ese nombre en el Zod que trae Astro (4.6.7 los tiene), se usa el equivalente de esa versión (`z.object(...).passthrough()`, `z.string().datetime({ offset: true })`) sin cambiar la semántica.

Prefijos de id: `t-` en `tarjetas` y `revlog`, `e-` en `ejercicios`, `c-` en `casos`. F2 agrega esa verificación por colección con un `superRefine` (el regex general acepta los cuatro prefijos).

## 3. FSRS: el módulo `src/progreso/fsrs.ts`

```ts
import { DefaultScheduler, Rating } from 'ts-fsrs';

export const CONFIG_FSRS = {
  version: 'FSRS-7',
  desiredRetention: 0.9,
  enableFuzz: false,            // sin azar: el test con reloj fijo es determinista
  enableShortTerm: true,
  learningSteps: ['1m', '10m'],
  relearningSteps: ['10m'],
  maximumInterval: 36_500,
} as const;                     // son los valores por defecto de ts-fsrs 6.0.0, escritos explícitos

export async function crearPlanificador() { return DefaultScheduler(CONFIG_FSRS); } // memoizar

export function serializarCard(card): CardSerializado;   // Date → toISOString(); el resto tal cual
export function deserializarCard(s: CardSerializado);    // dueAt y lastReviewAt → new Date(...) (lastReviewAt puede ser null)
export function serializarRevlog(log): RevlogSerializado; // reviewTime, dueAt, lastReviewAt → ISO

/** Califica una tarjeta (nueva si no hay estado previo) y devuelve el progreso nuevo (inmutable). */
export async function calificar(p: ProgresoV1, idTarjeta: string, nota: 1 | 2 | 3 | 4, ahora: Date): Promise<ProgresoV1>;
// - sin estado: card = planificador.newCard({ now: ahora })
// - con estado: card = deserializarCard(p.tarjetas[id].card)
// - r = planificador.review({ card, grade: nota, now: ahora })
// - guarda serializarCard(r.card), agrega { tarjeta: id, log: serializarRevlog(r.revlog) } y suma 1 a diasDeEstudio[diaLocal(ahora)]

/** Para hoy: la tarjeta tiene estado y su dueAt es ≤ al fin del día local de `ahora`. */
export function estaParaHoy(c: CardSerializado, ahora: Date): boolean;
```

Notas obligatorias:
- La API vieja (`createEmptyCard`, `fsrs()`, `.next()`) está deprecada en ts-fsrs 6: no se usa.
- El `cardId` que genera `newCard` (UUID al azar) se guarda pero **no** es la clave: la clave es el id global del contrato.
- Botones de calificación: "Otra vez" (1), "Difícil" (2), "Bien" (3), "Fácil" (4). Cada botón muestra debajo el intervalo que resultaría (`planificador.preview(...)`), por ejemplo "10 min", "4 d".
- "Día local" = fecha en la zona horaria del navegador, `YYYY-MM-DD`. Los tests fijan `TZ=America/Argentina/Buenos_Aires`.

### 3.1 Repaso de hoy

- **Vencidas**: tarjetas con estado y `estaParaHoy`. Se muestran ordenadas por `dueAt`. Las que están en aprendizaje con `dueAt` más tarde hoy (por ejemplo, en 10 minutos) aparecen cuando llega su hora; mientras, la pantalla dice "Te quedan N para más tarde hoy".
- **Nuevas**: tarjetas del catálogo sin estado, en orden de área (`orden`), tema (`orden`) y posición en `practica.yaml`. Por día entran como máximo `nuevasPorDia − nuevas ya calificadas hoy` (las que tienen un revlog de hoy con `state` 0). `nuevasPorDia` por defecto 10, ajustable 0-50 en Ajustes.
- `/repaso/?tema=<temaId>`: solo ese tema, y las nuevas de ese tema entran **sin** límite diario.
- `/repaso/?area=<areaId>`: solo esa área, con el límite diario.
- Tarjetas del tema de ejemplo (`ejemplo: true`) y tarjetas huérfanas (id que ya no existe en el contenido) nunca entran.

## 4. Export, import y reinicio

### 4.1 Exportar
Botón "Exportar progreso" en Ajustes: descarga `campus-progreso-YYYY-MM-DD.json` con el `ProgresoV1` actual, `exportadoEn` = ahora, JSON con sangría de 2 espacios. Incluye los huérfanos.

### 4.2 Importar (decisión: **reemplazo**, no merge)
Pasos de `importarProgreso(texto: string, almacen: Almacen, ahora: Date)`, donde `Almacen` es una interfaz `{ leer(clave), escribir(clave, valor) }` (en producción, idb-keyval; en Vitest, un `Map` en memoria):

1. `JSON.parse`. Si falla → error "El archivo no es un JSON válido". **No se escribe nada.**
2. Si `app` no es `campus-personal` → error "Este archivo no es un progreso del campus".
3. Si `version` es mayor que la que entiende la app → error "El archivo es de una versión más nueva de la app (vN). Actualizá la página e intentá de nuevo". Si es menor, se corren las migraciones `migrarDeV<n>` en orden (en v1 no hay ninguna).
4. `esquemaProgresoV1.safeParse`. Si falla → error con hasta 5 problemas (`tarjetas.<id>.card.dueAt: …`). **No se escribe nada.**
5. Se muestra un resumen y se pide confirmación: "Vas a reemplazar tu progreso actual (N tarjetas, M días) por el del archivo (N′ tarjetas, M′ días, exportado el …). ¿Seguir?".
6. Al confirmar: se guarda el progreso actual en `campus:progreso-antes-de-importar` y después el importado (con `exportadoEn: null`) en `campus:progreso`. Aparece el botón "Deshacer la importación", que restaura la copia.
7. Ids que no existen en el contenido actual (temas o tarjetas borrados o renombrados): **se conservan** tal cual, no cuentan en ninguna métrica ni entran al repaso, y el resumen avisa "K elementos son de temas que ya no existen: se guardan, pero no cuentan". En Ajustes hay un botón "Limpiar elementos huérfanos" que los borra (con confirmación).

Por qué reemplazo y no merge:
- El caso de uso es pasar el progreso de un dispositivo al otro (exportar en la PC, importar en el celular), no combinar dos historias.
- Combinar dos estados FSRS de una misma tarjeta no tiene una respuesta correcta sin reconstruir todo desde el revlog, y eso es caro y frágil.
- Con reemplazo, el criterio 5 del SPEC ("en un navegador limpio el panel muestra los mismos números") se cumple por construcción, y la copia previa más "Deshacer" cubren el error de importar el archivo equivocado.

### 4.3 Reiniciar
Botón "Reiniciar progreso" en Ajustes, con confirmación escrita (tipear `REINICIAR`). Borra `campus:progreso` y `campus:progreso-antes-de-importar`; no toca los ajustes.

## 5. Métricas del panel de progreso (`/progreso/`)

Todas se calculan con `ahora` inyectable (para tests) y **sin contar** temas de ejemplo ni huérfanos.

### 5.1 Dominio por área (0-100)

Para cada área *a*:

- **T_a (tarjetas)** = promedio, sobre **todas** las tarjetas del catálogo del área, de la retención estimada hoy:
  - tarjeta con estado: `c = deserializarCard(...)` y `R = planificador.model.forgettingCurve(c, planificador.chrono.difference(c.lastReviewAt, ahora))` (fechas como `Date`), recortada a [0, 1];
  - tarjeta nunca repasada: `R = 0`.
- **E_a (ejercicios)** = cantidad de ejercicios del área cuyo `ultimoResultado` es `acierto` ÷ cantidad total de ejercicios del área.
- **C_a (casos)** = promedio, sobre todos los casos del área, del puntaje del mejor resultado: `bien` = 1, `regular` = 0.5, `mal` = 0, sin intentar = 0.

```
Dominio_a = round(100 · (0.6·T_a + 0.3·E_a + 0.1·C_a))   si el área tiene casos
Dominio_a = round(100 · (0.7·T_a + 0.3·E_a))             si no tiene
```

Por qué así: las tarjetas pesan más porque son la medida de memoria que FSRS estima día a día (baja sola si no repasás); los ejercicios miden aplicación; los casos, criterio. El denominador es todo el catálogo, así que un área recién empezada arranca baja aunque lo poco hecho esté perfecto.

Se muestra como barras horizontales (Observable Plot, `barX`) con el color de cada área, y al tocar un área, el desglose: T, E y C en %, "tarjetas vistas X de Y", "ejercicios resueltos bien X de Y", "casos X de Y".

### 5.2 Calendario de días de estudio

- Grilla de las últimas 26 semanas (columnas = semanas, filas = días lun-dom), Plot `cell`, intensidad por `diasDeEstudio[dia]` en 4 escalones (0, 1-5, 6-15, 16+).
- Suman 1 acción: calificar una tarjeta, responder un ejercicio, llegar a un desenlace de un caso.
- Debajo: "Racha: N días" (días consecutivos con ≥1 acción que terminan hoy o ayer) y "Días estudiados en los últimos 30: M".

### 5.3 Tarjetas de hoy

- "Para hoy: V vencidas + K nuevas" (K = las nuevas que entrarían hoy según §3.1) y botón "Empezar repaso" → `/repaso/`.
- Por área: vencidas de hoy.
- "Próximos 7 días": cuántas vencen cada día (por `dueAt` en día local).

## 6. Tests que dependen de este documento

- **Vitest, FSRS con reloj fijo** (criterio 4): `ahora = 2026-01-01T12:00:00-03:00`; calificar "Bien" una tarjeta nueva; leer `dueAt` (D); `estaParaHoy` es `false` a las 23:59:59 del día local anterior a D y `true` a las 00:00:00 del día local de D. Además: serializar → `JSON.stringify` → `JSON.parse` → deserializar → `review` no tira error (la trampa del encabezado de este documento).
- **Vitest, import inválido** (criterio 5): con un almacén en memoria que ya tiene un progreso P, importar (a) texto que no es JSON, (b) JSON de otra app, (c) `version: 2`, (d) `tarjetas.<id>.card.dueAt: "ayer"`; en los cuatro casos el resultado es error con mensaje y el almacén sigue teniendo exactamente P (`toEqual`).
- **Vitest, import válido**: exportar P, importar en un almacén vacío, `calcularPanel(catalogo, progreso, ahora)` da los mismos números que con P.
- **Playwright** (criterio 5): calificar 3 tarjetas y responder 1 ejercicio con el reloj fijado (`page.clock.setFixedTime`), anotar los números del panel, exportar, abrir un contexto de navegador nuevo, importar el archivo y comparar los números (dominio por área, días, para hoy).
