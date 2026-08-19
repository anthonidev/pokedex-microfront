import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
      className="aspect-[3/4] w-full"
    >
      <Link
        to={`/pokemon/${pokemon.name}`}
        onClick={onClick}
        className="relative flex h-full w-full flex-col overflow-hidden rounded-2xl p-3 text-white shadow-md"
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
              className="size-24 object-contain drop-shadow-lg sm:size-28"
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
    </motion.div>
  );
}
