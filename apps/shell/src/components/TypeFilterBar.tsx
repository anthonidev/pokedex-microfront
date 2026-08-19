import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { POKEMON_TYPES, getPokemonTypeColor, type PokemonType } from '@acity/shared';
import { cn } from '@/lib/utils';

export type TypeFilter = 'all' | PokemonType;

interface TypeFilterBarProps {
  value: TypeFilter;
  onChange: (value: TypeFilter) => void;
}

const SCROLL_AMOUNT = 240;

export default function TypeFilterBar({ value, onChange }: TypeFilterBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  function updateScrollState() {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, []);

  function scrollByAmount(amount: number) {
    scrollRef.current?.scrollBy({ left: amount, behavior: 'smooth' });
  }

  return (
    <div className="flex items-center gap-1.5">
      <ScrollButton
        direction="left"
        visible={canScrollLeft}
        onClick={() => scrollByAmount(-SCROLL_AMOUNT)}
      />

      <div
        ref={scrollRef}
        role="tablist"
        aria-label="Filtrar por tipo"
        className="flex flex-1 gap-2 overflow-x-auto scroll-smooth [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
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

      <ScrollButton
        direction="right"
        visible={canScrollRight}
        onClick={() => scrollByAmount(SCROLL_AMOUNT)}
      />
    </div>
  );
}

function ScrollButton({
  direction,
  visible,
  onClick,
}: {
  direction: 'left' | 'right';
  visible: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === 'left' ? 'Ver tipos anteriores' : 'Ver más tipos'}
      className={cn(
        'shrink-0 rounded-full border border-border bg-card p-1.5 text-muted-foreground shadow-sm transition-opacity hover:text-foreground',
        visible ? 'opacity-100' : 'pointer-events-none opacity-0',
      )}
    >
      {direction === 'left' ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
    </button>
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
      className="relative shrink-0 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium text-muted-foreground capitalize transition-colors hover:text-foreground"
    >
      {active && (
        <motion.span
          layoutId="active-filter-pill"
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: color ?? 'var(--foreground)' }}
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        />
      )}
      <span className={cn('relative z-10', active && 'text-white')}>{children}</span>
    </button>
  );
}
