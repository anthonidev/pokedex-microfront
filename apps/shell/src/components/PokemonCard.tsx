import { Link } from 'react-router-dom';
import { getArtworkUrlById, getPokemonIdFromUrl, type PokemonListItem } from '@acity/shared';

export default function PokemonCard({ item }: { item: PokemonListItem }) {
  const id = getPokemonIdFromUrl(item.url);

  return (
    <Link
      to={`/pokemon/${item.name}`}
      className="flex w-28 shrink-0 flex-col items-center gap-2 rounded-lg border border-transparent p-2 text-center transition-colors hover:border-border hover:bg-muted"
    >
      <img
        src={getArtworkUrlById(id)}
        alt={item.name}
        loading="lazy"
        className="size-20 object-contain"
      />
      <span className="text-sm font-medium capitalize">{item.name}</span>
    </Link>
  );
}
