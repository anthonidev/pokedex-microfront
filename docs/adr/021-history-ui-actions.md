# ADR 021 — Historial: rediseño + acciones de borrado

## Contexto

MF2 (historial) tenía la implementación mínima de la Fase 4 — una lista simple de una columna, sin ninguna acción. El usuario pidió mejorarla, alinearla visualmente con el resto de la app, y agregar: borrar un registro individual, vaciar todo el historial, y un acceso directo al detalle de cada Pokémon.

## Decisión

- **Layout**: pasa de lista angosta (`max-w-md`) a una grilla de cards (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`) a todo el ancho, coherente con el resto de la app (bordes/`rounded-2xl`/`bg-card` iguales a Home y Detalle, tipografía `font-heading` para nombres, mismo estilo de badge de conteo).
- **Borrar un registro**: botón de tacho por card, sin confirmación (acción de bajo riesgo, fácilmente reversible con una nueva visita).
- **Vaciar todo**: el botón "Vaciar historial" se transforma inline en "¿Vaciar todo? [Sí, vaciar] [Cancelar]" en vez de abrir un modal — evita sumar una dependencia de diálogo (Radix AlertDialog) a MF2 solo para una confirmación, consistente con el criterio ya usado en el radar de stats (ADR 020) de no traer una librería para algo chico. El botón de confirmación usa el mismo estilo "destructivo suave" (`bg-destructive/10 text-destructive`) que ya usa el dropdown de logout del Shell.
- **Ir al detalle**: cada card suma un botón de flecha. MF2 sigue sin depender de un router (ver ADR 003) — recibe un `onViewDetail?: (name: string) => void` opcional desde el Shell (nuevo `HistoryPage.tsx`, mismo patrón que `PokemonDetailPage.tsx` para el prev/next de MF1) y usa `viewTransition: true` en la navegación, igual que el resto de los flujos hacia el detalle (ADR 018). Al ser opcional, el botón no se renderiza cuando MF2 corre standalone en `:3002` sin el Shell.
- **Lógica de borrado**: `removeHistoryEntry`/`clearHistory` nuevas en `packages/shared/lib/history-storage.ts`. Si el registro borrado era el "último visitado", también se limpia ese puntero — así un reload no muestra el toast de un Pokémon que ya no está en el historial.
- Se agregó `lucide-react` a `mf2-history` (ya usado en Shell y MF1) para los íconos — dependencia chica y ya presente en el resto del monorepo, no es una librería nueva de verdad.

## Alternativas consideradas

- **Modal/diálogo de confirmación para "vaciar todo"**: descartado por el motivo de arriba (dependencia nueva para MF2 solo para esto).
- **Confirmación también para borrar un registro individual**: descartado — es una acción de bajo riesgo (un Pokémon se puede volver a visitar fácilmente), pedir confirmación ahí sería fricción innecesaria.

## Consecuencias

- `RemoteBoundary` no cambia de interfaz por esto (ya tenía `componentProps` genérico); solo se agregó el wiring puntual en `HistoryPage.tsx`.
- El README no pide borrar/vaciar historial — es una mejora agregada, no reemplaza nada de lo obligatorio (lista, imagen, nombre, conteo, persistencia siguen intactos).
