import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getPokemonArtwork,
  getPokemonByName,
  registerVisit,
  POKEMON_TYPE_COLORS,
  type PokemonType,
} from '@acity/shared';

interface PokemonDetailContentProps {
  name: string;
}

export default function PokemonDetailContent({ name }: PokemonDetailContentProps) {
  const {
    data: pokemon,
    isPending,
    isError,
  } = useQuery({
    queryKey: ['pokemon-detail', name],
    queryFn: () => getPokemonByName(name),
    // A 404 means the Pokémon doesn't exist — retrying just delays "No encontrado" for no reason.
    retry: false,
  });

  useEffect(() => {
    if (!pokemon) return;
    registerVisit({ name: pokemon.name, image: getPokemonArtwork(pokemon) });
  }, [pokemon]);

  if (isPending) {
    return (
      <div className="mx-auto flex max-w-md animate-pulse flex-col items-center gap-4 p-6">
        <div className="size-48 rounded-full bg-muted" />
        <div className="h-6 w-32 rounded bg-muted" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-2 p-12 text-center">
        <p className="text-lg font-medium">No encontrado</p>
        <p className="text-sm text-muted-foreground">
          No existe un Pokémon con el nombre "{name}".
        </p>
      </div>
    );
  }

  const artwork = getPokemonArtwork(pokemon);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 p-6 text-center text-foreground">
      {artwork && <img src={artwork} alt={pokemon.name} className="size-48 object-contain" />}
      <h1 className="text-2xl font-bold capitalize">{pokemon.name}</h1>

      <div className="flex gap-2">
        {pokemon.types.map(({ type }) => (
          <span
            key={type.name}
            className="rounded-full px-3 py-1 text-xs font-semibold text-white capitalize"
            style={{ backgroundColor: POKEMON_TYPE_COLORS[type.name as PokemonType] }}
          >
            {type.name}
          </span>
        ))}
      </div>

      <div className="w-full space-y-2 text-left">
        {pokemon.stats.map((stat) => (
          <div key={stat.stat.name} className="flex items-center gap-3">
            <span className="w-28 shrink-0 text-xs font-medium text-muted-foreground capitalize">
              {stat.stat.name.replace('-', ' ')}
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.min(100, (stat.base_stat / 255) * 100)}%` }}
              />
            </div>
            <span className="w-8 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
              {stat.base_stat}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
