import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInfiniteQuery, useQuery, type UseQueryResult } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import {
  getAllPokemonNames,
  getPokemonByName,
  getPokemonList,
  NotFoundState,
  type Pokemon,
  type PokemonListItem,
} from '@acity/shared';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useInfiniteScrollTrigger } from '@/hooks/use-infinite-scroll-trigger';
import PokemonGridCard from './PokemonGridCard';

const PAGE_SIZE = 30;
const MAX_SUGGESTIONS = 24;
const GRID_CLASS = 'grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5';

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const [term, setTerm] = useState('');
  const debouncedTerm = useDebouncedValue(term.trim().toLowerCase(), 500);
  const navigate = useNavigate();

  const isSearching = term.trim().length > 0;

  const listQuery = useInfiniteQuery({
    queryKey: ['pokemon-list'],
    queryFn: ({ pageParam }) => getPokemonList(PAGE_SIZE, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => (lastPage.next ? pages.length * PAGE_SIZE : undefined),
    enabled: open && !isSearching,
  });

  // The README's actual "exact match" behavior (lowercase, no fragment search) — drives
  // the single-result "found" case and the final "No encontrado".
  const exactQuery = useQuery({
    queryKey: ['pokemon-exact', debouncedTerm],
    queryFn: () => getPokemonByName(debouncedTerm),
    enabled: open && debouncedTerm.length > 0,
    retry: false,
  });

  // Full name list, fetched once and cached forever — powers live typeahead suggestions
  // (e.g. "pika" → Pikachu) so exact-match isn't a dead end while the user is still typing.
  // This does NOT replace the exact-match requirement above; it's a UX layer on top of it.
  const namesQuery = useQuery({
    queryKey: ['pokemon-all-names'],
    queryFn: getAllPokemonNames,
    enabled: open,
    staleTime: Number.POSITIVE_INFINITY,
  });

  const suggestions = useMemo(() => {
    const query = term.trim().toLowerCase();
    if (!query || !namesQuery.data) return [];
    return namesQuery.data.results
      .filter((item) => item.name.includes(query))
      .slice(0, MAX_SUGGESTIONS);
  }, [term, namesQuery.data]);

  const sentinelRef = useInfiniteScrollTrigger(
    () => listQuery.fetchNextPage(),
    open && !isSearching && !!listQuery.hasNextPage && !listQuery.isFetchingNextPage,
  );

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (!next) setTerm('');
  }

  function goToPokemon(name: string) {
    handleOpenChange(false);
    navigate(`/pokemon/${name}`);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton
        className="top-0 left-0 grid h-screen w-screen max-w-none translate-x-0 translate-y-0 grid-rows-[auto_1fr] gap-0 rounded-none p-0 sm:max-w-none"
      >
        <DialogTitle className="sr-only">Buscar Pokémon</DialogTitle>

        <div className="flex items-center gap-3 border-b border-border p-4">
          <Search className="size-5 shrink-0 text-muted-foreground" />
          <Input
            autoFocus
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Buscar Pokémon por nombre exacto…"
            className="border-none px-0 text-base shadow-none focus-visible:ring-0"
          />
        </div>

        <div className="overflow-y-auto p-4">
          {isSearching ? (
            <SearchResults
              term={term}
              exactQuery={exactQuery}
              suggestions={suggestions}
              onSelect={goToPokemon}
            />
          ) : listQuery.isPending ? (
            <SkeletonGrid />
          ) : (
            <>
              <div className={GRID_CLASS}>
                {listQuery.data?.pages
                  .flatMap((page) => page.results)
                  .map((item) => (
                    <PokemonGridCard
                      key={item.name}
                      item={item}
                      onClick={() => handleOpenChange(false)}
                    />
                  ))}
              </div>
              <div ref={sentinelRef} className="h-10" />
              {listQuery.isFetchingNextPage && (
                <p className="py-4 text-center text-sm text-muted-foreground">Cargando más…</p>
              )}
              {listQuery.isError && (
                <p className="py-4 text-center text-sm text-destructive">
                  No se pudo cargar el listado de Pokémon.
                </p>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SkeletonGrid() {
  return (
    <div className={GRID_CLASS}>
      {Array.from({ length: PAGE_SIZE }, (_, index) => (
        <div
          key={`search-skeleton-${index}`}
          className="aspect-[3/4] w-full animate-pulse rounded-2xl bg-muted"
        />
      ))}
    </div>
  );
}

function SearchResults({
  term,
  exactQuery,
  suggestions,
  onSelect,
}: {
  term: string;
  exactQuery: UseQueryResult<Pokemon>;
  suggestions: PokemonListItem[];
  onSelect: (name: string) => void;
}) {
  if (exactQuery.isSuccess) {
    const pokemon = exactQuery.data;
    return (
      <div className={GRID_CLASS}>
        <PokemonGridCard
          item={{ name: pokemon.name, url: `https://pokeapi.co/api/v2/pokemon/${pokemon.id}/` }}
          onClick={() => onSelect(pokemon.name)}
        />
      </div>
    );
  }

  if (suggestions.length > 0) {
    return (
      <div className={GRID_CLASS}>
        {suggestions.map((item) => (
          <PokemonGridCard key={item.name} item={item} onClick={() => onSelect(item.name)} />
        ))}
      </div>
    );
  }

  if (exactQuery.isError) {
    return <NotFoundState name={term.trim()} />;
  }

  return <p className="text-sm text-muted-foreground">Buscando "{term.trim()}"…</p>;
}
