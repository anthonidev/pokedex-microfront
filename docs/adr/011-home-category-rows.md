# ADR 011 — Home: filtro de tipo + grilla paginada (supersede filas horizontales)

## Contexto

El README pide mostrar "10 Pokémon por categoría" en Home pero no especifica cuántas categorías mostrar. PokeAPI expone 18 tipos oficiales (excluyendo "shadow"/"unknown", que no son categorías que un usuario elegiría).

> **Actualización (revisión visual post Fase 5):** la primera versión (filas horizontales estilo "Netflix", ver más abajo) generaba scroll horizontal por cada una de las 18 categorías simultáneamente — mala experiencia de navegación, señalada explícitamente por el usuario tras revisar la app. Se reemplazó por **un filtro de tipo (chips: "Todos" + 18 tipos) + una sola grilla con scroll infinito** (`apps/shell/src/components/TypeFilterBar.tsx`, `apps/shell/src/pages/HomePage.tsx`), reusando el mismo patrón de paginación que ya tenía el buscador (`docs/adr/002` scroll infinito, Fase 2).
>
> **Cómo pagina cada modo:**
> - **"Todos"**: `useInfiniteQuery` sobre `GET /pokemon?limit=30&offset=0` (paginación real de red, igual que el buscador).
> - **Un tipo específico**: `GET /type/{type}` devuelve la lista *completa* de ese tipo en una sola respuesta (no paginada por la API) — "cargar más" en este modo no pega a la red de nuevo, solo revela más elementos de un array ya en memoria (`visibleCount` progresivo). Sigue dando la sensación de scroll infinito y evita renderizar cientos de cards de una sola vez.
>
> **Cards con gradiente por tipo:** para lograr el estilo de card con gradiente de color + numeración `#NNN` que pidió el usuario (referencia visual aportada), cada card de la grilla (`PokemonGridCard.tsx`) necesita el/los tipo(s) reales del Pokémon — algo que ni `/type/{type}` ni `/pokemon?limit&offset` devuelven (solo `{name, url}`). Esto **revierte deliberadamente** la optimización "sin fetch extra por Pokémon" de la versión anterior de este ADR: cada card ahora hace su propio `GET /pokemon/{name}` vía `useQuery` (cacheado, con skeleton mientras carga). Se acepta el costo (hasta 30 requests por página de grilla) porque: (1) PokeAPI es un CDN estático sin rate-limit agresivo para uso razonable, (2) es el patrón que usa la gran mayoría de clones de Pokédex reales, y (3) el usuario priorizó explícitamente el impacto visual ("tenemos que sobresalir frente al resto") sobre minimizar requests. El buscador (`SearchModal`) mantiene la versión sin fetch extra (`getPokemonIdFromUrl` + `getArtworkUrlById`) porque ahí sí puede haber 90+ items cargados a la vez sin filtro que los acote.

## Decisión original (Fase 1, luego reemplazada)

Mostrar las **18 categorías** como filas horizontales con scroll independiente (patrón "Netflix"), cada una con sus 10 Pokémon, en vez de un selector que muestre una categoría a la vez.

## Alternativas consideradas

- **Selector de una categoría a la vez (tabs/pills)**: un solo request activo, página más corta y liviana. Se descartó por dar menos impacto visual y no aprovechar tan bien el criterio de UX/UI (20% del puntaje) ni las recomendaciones de "transiciones y animaciones fluidas".

## Consecuencias

- 18 requests a `GET /type/{type}` en el mount de Home — cada uno independiente vía `useQuery` de TanStack Query (`docs/adr/006`), con su propio loading/error state por fila (no bloquean entre sí).
- **Sin requests adicionales por Pokémon**: `/type/{type}` solo devuelve `{name, url}`, no sprites. En vez de hacer 1 fetch extra por cada uno de los 180 Pokémon (10 × 18) para obtener la imagen, el id se extrae del `url` (`.../pokemon/6/`) y la imagen se arma directamente contra el CDN estático de sprites (`packages/shared/src/api/pokeapi.ts` → `getPokemonIdFromUrl` + `getArtworkUrlById`). Evita un problema real de escalabilidad/rate-limit con PokeAPI.
- Cada fila muestra su propio skeleton de carga y mensaje de error — ninguna categoría bloquea a las demás si falla.
