import { POKEMON_TYPES, getPokemonTypeColor, type PokemonType } from '@acity/shared';
import { cn } from '@/lib/utils';

export type TypeFilter = 'all' | PokemonType;

interface TypeFilterBarProps {
  value: TypeFilter;
  onChange: (value: TypeFilter) => void;
}

export default function TypeFilterBar({ value, onChange }: TypeFilterBarProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Filtrar por tipo">
      <FilterChip active={value === 'all'} onClick={() => onChange('all')}>
        Todos
      </FilterChip>
      {POKEMON_TYPES.map((type) => (
        <FilterChip
          key={type}
          active={value === type}
          onClick={() => onChange(type)}
          color={getPokemonTypeColor(type)}
        >
          {type}
        </FilterChip>
      ))}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  color,
  children,
}: {
  active: boolean;
  onClick: () => void;
  color?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      style={active && color ? { backgroundColor: color, borderColor: color } : undefined}
      className={cn(
        'shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium capitalize transition-colors',
        active
          ? 'border-transparent text-white'
          : 'border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      {children}
    </button>
  );
}
