# ADR 011 — Home: filas horizontales por categoría

## Contexto

El README pide mostrar "10 Pokémon por categoría" en Home pero no especifica cuántas categorías mostrar. PokeAPI expone 18 tipos oficiales (excluyendo "shadow"/"unknown", que no son categorías que un usuario elegiría).

## Decisión

Mostrar las **18 categorías** como filas horizontales con scroll independiente (patrón "Netflix"), cada una con sus 10 Pokémon, en vez de un selector que muestre una categoría a la vez.

## Alternativas consideradas

- **Selector de una categoría a la vez (tabs/pills)**: un solo request activo, página más corta y liviana. Se descartó por dar menos impacto visual y no aprovechar tan bien el criterio de UX/UI (20% del puntaje) ni las recomendaciones de "transiciones y animaciones fluidas".

## Consecuencias

- 18 requests a `GET /type/{type}` en el mount de Home — cada uno independiente vía `useQuery` de TanStack Query (`docs/adr/006`), con su propio loading/error state por fila (no bloquean entre sí).
- **Sin requests adicionales por Pokémon**: `/type/{type}` solo devuelve `{name, url}`, no sprites. En vez de hacer 1 fetch extra por cada uno de los 180 Pokémon (10 × 18) para obtener la imagen, el id se extrae del `url` (`.../pokemon/6/`) y la imagen se arma directamente contra el CDN estático de sprites (`packages/shared/src/api/pokeapi.ts` → `getPokemonIdFromUrl` + `getArtworkUrlById`). Evita un problema real de escalabilidad/rate-limit con PokeAPI.
- Cada fila muestra su propio skeleton de carga y mensaje de error — ninguna categoría bloquea a las demás si falla.
