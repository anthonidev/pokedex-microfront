import { QueryClient } from '@tanstack/react-query';

/**
 * Module-scope singleton, not created per-render: PokemonDetail stays mounted while
 * navigating between /pokemon/:name routes (only the `name` prop changes), so this
 * needs to survive across those prop changes to keep the cache useful.
 */
export const queryClient = new QueryClient();
