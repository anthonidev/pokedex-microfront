import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInfiniteQuery, useQuery, type UseQueryResult } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { getPokemonByName, getPokemonList, type Pokemon } from '@acity/shared';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useInfiniteScrollTrigger } from '@/hooks/use-infinite-scroll-trigger';
import PokemonCard from './PokemonCard';

const PAGE_SIZE = 30;
const GRID_CLASS = 'grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-6';

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const [term, setTerm] = useState('');
  const debouncedTerm = useDebouncedValue(term.trim().toLowerCase(), 500);
  const navigate = useNavigate();

  const isSearching = debouncedTerm.length > 0;

  const listQuery = useInfiniteQuery({
    queryKey: ['pokemon-list'],
    queryFn: ({ pageParam }) => getPokemonList(PAGE_SIZE, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => (lastPage.next ? pages.length * PAGE_SIZE : undefined),
    enabled: open && !isSearching,
  });

  const exactQuery = useQuery({
    queryKey: ['pokemon-exact', debouncedTerm],
    queryFn: () => getPokemonByName(debouncedTerm),
    enabled: open && isSearching,
    retry: false,
  });

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
            <ExactResult query={exactQuery} name={debouncedTerm} onSelect={goToPokemon} />
          ) : (
            <>
              <div className={GRID_CLASS}>
                {listQuery.data?.pages
                  .flatMap((page) => page.results)
                  .map((item) => (
                    <PokemonCard
                      key={item.name}
                      item={item}
                      className="w-full"
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

function ExactResult({
  query,
  name,
  onSelect,
}: {
  query: UseQueryResult<Pokemon>;
  name: string;
  onSelect: (name: string) => void;
}) {
  if (query.isPending) {
    return <p className="text-sm text-muted-foreground">Buscando "{name}"…</p>;
  }

  if (query.isError) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <p className="text-lg font-medium">No encontrado</p>
        <p className="text-sm text-muted-foreground">
          No existe un Pokémon con el nombre "{name}".
        </p>
      </div>
    );
  }

  const pokemon = query.data;

  return (
    <div className={GRID_CLASS}>
      <PokemonCard
        item={{ name: pokemon.name, url: `https://pokeapi.co/api/v2/pokemon/${pokemon.id}/` }}
        className="w-full"
        onClick={() => onSelect(pokemon.name)}
      />
    </div>
  );
}
