import { QueryClient } from '@tanstack/react-query';

/**
 * Module-scope singleton, not created per-render: PokemonDetail stays mounted while
 * navigating between /pokemon/:name routes (only the `name` prop changes), so this
 * needs to survive across those prop changes to keep the cache useful.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // A Pokémon's stats/types/sprites/species text never change — there's no backend
      // write path that could invalidate them. Treating every response as permanently
      // fresh (and never garbage-collecting it) means browsing back to a Pokémon already
      // seen this session — via prev/next, history, or a repeat search — is instant,
      // with zero refetch against PokeAPI.
      staleTime: Infinity,
      gcTime: Infinity,
    },
  },
});
