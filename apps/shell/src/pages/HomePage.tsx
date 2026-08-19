import { POKEMON_TYPES } from '@acity/shared';
import TypeRow from '@/components/TypeRow';

export default function HomePage() {
  return (
    <div className="flex flex-col gap-6">
      {POKEMON_TYPES.map((type) => (
        <TypeRow key={type} type={type} />
      ))}
    </div>
  );
}
