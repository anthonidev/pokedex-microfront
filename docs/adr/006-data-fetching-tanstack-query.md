# ADR 006 — Data fetching: TanStack Query

## Contexto

El README pide elegir entre RTK Query, TanStack Query, SWR o Axios (con manejo manual de loading/error si se elige Axios). Los casos de uso concretos son: fetch de tipos + 10 Pokémon por tipo (Home), listado paginado con scroll infinito (buscador), búsqueda exacta por nombre, y fetch de detalle por id/nombre (MF1).

## Decisión

**TanStack Query**, con un `QueryClient` propio por app (Shell, MF1, MF2 — ver [`architecture.md`](../architecture.md), sección "Data fetching por app"). El buscador usa específicamente `useInfiniteQuery` para el scroll infinito (`offset += 30` por página, `getNextPageParam` calculado desde la página anterior).

## Alternativas consideradas

- **RTK Query**: la integración más natural hubiera sido si se elegía Redux Toolkit como state manager — unifica todo bajo un solo store. Al haber elegido Zustand ([`adr/005`](./005-state-management-zustand.md)), sumar RTK Query implicaría traer Redux solo para el data layer, dos paradigmas de estado conviviendo sin necesidad.
- **SWR**: API simple y liviana, pero su soporte de paginación infinita (`useSWRInfinite`) es más manual que `useInfiniteQuery` de TanStack, y el ecosistema de devtools/caching granular de TanStack Query es más maduro para mostrar manejo de cache real (relevante para el 20% de "calidad de código / manejo de estado y data fetching").
- **Axios + hooks propios**: máximo control, pero implica construir a mano loading/error/retry/paginación/cache — riesgo alto de bugs sutiles (condiciones de carrera en el scroll infinito, refetch duplicado) bajo el límite de 2 días. El propio README advierte que si se elige Axios "se espera manejo correcto de loading, error y estados de red" — con TanStack Query eso viene resuelto de fábrica y el tiempo se invierte en UX en vez de en plumbing.

## Consecuencias

- Loading/error/empty states son consistentes en toda la app porque salen del mismo patrón (`isLoading`/`isError`/`data`) en los 3 proyectos.
- El buscador exacto (`GET /pokemon/{name}`) se implementa como una `useQuery` separada de la infinita, habilitada solo cuando hay término de búsqueda (`enabled: !!searchTerm`) — evita mezclar la paginación con el caso de match exacto.
- Cache no se comparte entre Shell/MF1/MF2 (cada uno con su `QueryClient`) — una visita a un Pokémon desde Home y luego desde Historial dispara 2 requests en vez de reusar cache, tradeoff aceptado a cambio del desacople total entre bundles (mismo razonamiento que [`adr/003`](./003-cross-mfe-communication.md)).

> **Actualización (implementación, Fase 3):** "cada app su propio `QueryClient`" no alcanza con un solo `QueryClientProvider` en el `main.tsx` de cada app — el componente **expuesto** por un remote (`mf1Detail/PokemonDetail`) necesita envolverse en **su propio** `QueryClientProvider` (`apps/mf1-detail/src/PokemonDetail.tsx`), porque al montarse dentro del árbol de React del Shell no hereda el Provider del Shell (Context no cruza el boundary de Module Federation, mismo problema de fondo que con `react-router-dom` en [`adr/003`](./003-cross-mfe-communication.md)). El `QueryClient` se crea una sola vez a nivel de módulo (`apps/mf1-detail/src/query-client.ts`), no en cada render, para no perder cache al navegar entre `/pokemon/:name` distintos.
