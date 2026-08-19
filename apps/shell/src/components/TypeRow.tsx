import { useQuery } from '@tanstack/react-query';
import { getPokemonByType, type PokemonType } from '@acity/shared';
import PokemonCard from './PokemonCard';

const POKEMON_PER_CATEGORY = 10;

export default function TypeRow({ type }: { type: PokemonType }) {
  const { data, isPending, isError } = useQuery({
    queryKey: ['pokemon-type', type],
    queryFn: () => getPokemonByType(type),
  });

  return (
    <section>
      <h2 className="mb-2 text-lg font-semibold capitalize">{type}</h2>

      {isPending && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {Array.from({ length: POKEMON_PER_CATEGORY }, (_, index) => (
            <div
              key={`${type}-skeleton-${index}`}
              className="size-28 shrink-0 animate-pulse rounded-lg bg-muted"
            />
          ))}
        </div>
      )}

      {isError && (
        <p className="text-sm text-destructive">No se pudo cargar la categoría "{type}".</p>
      )}

      {data && (
        <div className="flex gap-1 overflow-x-auto pb-1">
          {data.pokemon.slice(0, POKEMON_PER_CATEGORY).map(({ pokemon }) => (
            <PokemonCard key={pokemon.name} item={pokemon} />
          ))}
        </div>
      )}
    </section>
  );
}
