import { useState } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { getPokemonByType, getPokemonList, type PokemonListItem } from '@acity/shared';
import PokemonGridCard from '@/components/PokemonGridCard';
import TypeFilterBar, { type TypeFilter } from '@/components/TypeFilterBar';
import { useInfiniteScrollTrigger } from '@/hooks/use-infinite-scroll-trigger';

const PAGE_SIZE = 30;
const GRID_CLASS =
  'grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8';

export default function HomePage() {
  const [filter, setFilter] = useState<TypeFilter>('all');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const isFiltered = filter !== 'all';

  // A specific type comes back as one full (unpaginated) list from PokeAPI — "loading more"
  // for a filter just reveals more of what's already in memory, no extra network request.
  const typeQuery = useQuery({
    queryKey: ['pokemon-type', filter],
    queryFn: () => getPokemonByType(filter),
    enabled: isFiltered,
  });

  // "Todos" has no such single endpoint, so it stays genuinely paginated over the network.
  const listQuery = useInfiniteQuery({
    queryKey: ['pokemon-list'],
    queryFn: ({ pageParam }) => getPokemonList(PAGE_SIZE, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => (lastPage.next ? pages.length * PAGE_SIZE : undefined),
    enabled: !isFiltered,
  });

  const allTypeItems = typeQuery.data?.pokemon.map((entry) => entry.pokemon) ?? [];
  const hasMoreTypeItems = visibleCount < allTypeItems.length;

  const items: PokemonListItem[] = isFiltered
    ? allTypeItems.slice(0, visibleCount)
    : (listQuery.data?.pages.flatMap((page) => page.results) ?? []);

  function handleFilterChange(next: TypeFilter) {
    setFilter(next);
    setVisibleCount(PAGE_SIZE);
  }

  const sentinelRef = useInfiniteScrollTrigger(
    () => {
      if (isFiltered) {
        setVisibleCount((count) => count + PAGE_SIZE);
      } else {
        listQuery.fetchNextPage();
      }
    },
    isFiltered ? hasMoreTypeItems : !!listQuery.hasNextPage && !listQuery.isFetchingNextPage,
  );

  const isInitialLoading = isFiltered ? typeQuery.isPending : listQuery.isPending;
  const isError = isFiltered ? typeQuery.isError : listQuery.isError;

  return (
    <div className="flex flex-col gap-4">
      <TypeFilterBar value={filter} onChange={handleFilterChange} />

      {isError && (
        <p className="py-8 text-center text-sm text-destructive">No se pudo cargar el listado.</p>
      )}

      {isInitialLoading ? (
        <div className={GRID_CLASS}>
          {Array.from({ length: PAGE_SIZE }, (_, index) => (
            <div
              key={`home-skeleton-${index}`}
              className="aspect-[3/4] w-full animate-pulse rounded-2xl bg-muted"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No hay Pokémon para este filtro.
        </p>
      ) : (
        <>
          <div className={GRID_CLASS}>
            {items.map((item) => (
              <PokemonGridCard key={item.name} item={item} />
            ))}
          </div>
          <div ref={sentinelRef} className="h-10" />
          {!isFiltered && listQuery.isFetchingNextPage && (
            <p className="py-4 text-center text-sm text-muted-foreground">Cargando más…</p>
          )}
        </>
      )}
    </div>
  );
}
