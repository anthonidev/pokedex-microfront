import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  getPokemonArtwork,
  getPokemonByName,
  getPokemonTypeGradient,
  type PokemonListItem,
} from '@acity/shared';

interface PokemonGridCardProps {
  item: PokemonListItem;
  onClick?: () => void;
}

export default function PokemonGridCard({ item, onClick }: PokemonGridCardProps) {
  const { data: pokemon, isPending } = useQuery({
    queryKey: ['pokemon-detail', item.name],
    queryFn: () => getPokemonByName(item.name),
  });

  if (isPending || !pokemon) {
    return <div className="aspect-[3/4] w-full animate-pulse rounded-2xl bg-muted" />;
  }

  const primaryType = pokemon.types[0]?.type.name ?? 'normal';
  const artwork = getPokemonArtwork(pokemon);

  return (
    <Link
      to={`/pokemon/${pokemon.name}`}
      onClick={onClick}
      className="group relative flex aspect-[3/4] w-full flex-col overflow-hidden rounded-2xl p-3 text-white shadow-md transition-transform hover:-translate-y-1 hover:shadow-xl"
      style={{ backgroundImage: getPokemonTypeGradient(primaryType) }}
    >
      <span className="self-start rounded-full bg-black/25 px-2 py-0.5 text-xs font-semibold tabular-nums backdrop-blur-sm">
        #{String(pokemon.id).padStart(3, '0')}
      </span>

      <div className="flex flex-1 items-center justify-center">
        {artwork && (
          <img
            src={artwork}
            alt={pokemon.name}
            loading="lazy"
            className="size-24 object-contain drop-shadow-lg transition-transform group-hover:scale-110 sm:size-28"
          />
        )}
      </div>

      <div className="flex flex-col items-center gap-1.5">
        <span className="text-sm font-bold capitalize drop-shadow">{pokemon.name}</span>
        <div className="flex flex-wrap justify-center gap-1">
          {pokemon.types.map(({ type }) => (
            <span
              key={type.name}
              className="rounded-full bg-black/25 px-2 py-0.5 text-[10px] font-medium capitalize backdrop-blur-sm"
            >
              {type.name}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
