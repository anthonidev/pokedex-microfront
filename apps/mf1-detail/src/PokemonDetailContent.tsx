import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  getFlavorText,
  getPokemonArtwork,
  getPokemonByName,
  getPokemonSpecies,
  getPokemonTypeColor,
  getPokemonTypeGradient,
  getTypeDetails,
  registerVisit,
  NotFoundState,
} from '@acity/shared';

interface PokemonDetailContentProps {
  name: string;
  /** Shell owns routing (see docs/adr/003) — prev/next asks it to navigate, MF1 stays router-free. */
  onNavigate?: (name: string) => void;
}

type TabKey = 'info' | 'stats' | 'moves';

export default function PokemonDetailContent({ name, onNavigate }: PokemonDetailContentProps) {
  const [tab, setTab] = useState<TabKey>('info');

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

  const speciesQuery = useQuery({
    queryKey: ['pokemon-species', name],
    queryFn: () => getPokemonSpecies(name),
    enabled: !!pokemon,
  });

  const typeNames = pokemon?.types.map(({ type }) => type.name) ?? [];
  const typeDetailsQueries = useQueries({
    queries: typeNames.map((typeName) => ({
      queryKey: ['type-details', typeName],
      queryFn: () => getTypeDetails(typeName),
    })),
  });
  const strongAgainst = Array.from(
    new Set(
      typeDetailsQueries.flatMap(
        (query) => query.data?.damage_relations.double_damage_to.map((t) => t.name) ?? [],
      ),
    ),
  );

  // Keyed by name (not the `pokemon` object reference) so a visit is registered exactly
  // once per navigation — see docs/adr/002 (Fase-4 audit note) for why `[pokemon]` alone
  // both double-counts under StrictMode and misses genuine revisits of cached Pokémon.
  const registeredForRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pokemon) return;
    if (registeredForRef.current === name) return;
    registeredForRef.current = name;
    registerVisit({ name: pokemon.name, image: getPokemonArtwork(pokemon) });
  }, [name, pokemon]);

  if (isPending) {
    return (
      <div className="mx-auto flex max-w-md animate-pulse flex-col items-center gap-4 p-6">
        <div className="size-40 rounded-full bg-muted" />
        <div className="h-6 w-32 rounded bg-muted" />
      </div>
    );
  }

  if (isError) {
    return <NotFoundState name={name} />;
  }

  const artwork = getPokemonArtwork(pokemon);
  const primaryType = pokemon.types[0]?.type.name ?? 'normal';
  const flavorText = speciesQuery.data ? getFlavorText(speciesQuery.data) : '';

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 lg:flex-row lg:items-start">
      {/* Hero card: full-bleed "phone card" on mobile, self-contained sticky card on desktop.
          Same markup both ways — only paddings/margins/rounding change per breakpoint. */}
      <div className="lg:sticky lg:top-20 lg:w-96 lg:shrink-0">
        <div
          className="relative flex flex-col items-center gap-3 rounded-b-[2.5rem] px-6 pt-6 pb-24 text-white lg:rounded-[2rem] lg:pb-6"
          style={{ backgroundImage: getPokemonTypeGradient(primaryType) }}
        >
          <div className="flex w-full items-center justify-between">
            <NavButton
              direction="prev"
              disabled={!onNavigate || pokemon.id <= 1}
              onClick={() => onNavigate?.(String(pokemon.id - 1))}
            />
            <span className="rounded-full bg-black/20 px-3 py-1 text-sm font-semibold tabular-nums backdrop-blur-sm">
              #{String(pokemon.id).padStart(3, '0')}
            </span>
            <NavButton
              direction="next"
              disabled={!onNavigate}
              onClick={() => onNavigate?.(String(pokemon.id + 1))}
            />
          </div>

          <h1 className="font-heading text-2xl font-bold capitalize">{pokemon.name}</h1>
          <div className="flex gap-2">
            {pokemon.types.map(({ type }) => (
              <span
                key={type.name}
                className="rounded-full bg-black/20 px-3 py-1 text-xs font-semibold capitalize backdrop-blur-sm"
              >
                {type.name}
              </span>
            ))}
          </div>
        </div>

        {artwork && (
          <img
            src={artwork}
            alt={pokemon.name}
            // Matches the `viewTransitionName` on the grid card for this same Pokémon — the
            // browser morphs position/size between the two automatically. See docs/adr/018.
            style={{ viewTransitionName: `pokemon-artwork-${pokemon.name}` }}
            className="relative z-10 mx-auto -mt-24 size-40 object-contain drop-shadow-xl lg:mt-0 lg:mb-6 lg:size-48"
          />
        )}
      </div>

      <div className="-mt-4 flex min-w-0 flex-1 flex-col gap-4 px-6 pb-6 text-foreground lg:mt-0 lg:px-0">
        {/* Tabs only make sense where vertical/horizontal space is scarce — desktop shows every
            section at once instead (see docs/adr/019). */}
        <div className="flex gap-1 rounded-full bg-muted p-1 lg:hidden">
          <TabButton active={tab === 'info'} onClick={() => setTab('info')}>
            Info
          </TabButton>
          <TabButton active={tab === 'stats'} onClick={() => setTab('stats')}>
            Stats
          </TabButton>
          <TabButton active={tab === 'moves'} onClick={() => setTab('moves')}>
            Movimientos
          </TabButton>
        </div>

        <div className={`${tab === 'info' ? 'flex' : 'hidden'} flex-col gap-4 lg:flex`}>
          <Section title="Descripción">
            {flavorText && <p className="text-sm text-muted-foreground">{flavorText}</p>}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl bg-muted p-3">
                <p className="text-xs text-muted-foreground">Altura</p>
                <p className="font-semibold">{(pokemon.height / 10).toFixed(1)} m</p>
              </div>
              <div className="rounded-xl bg-muted p-3">
                <p className="text-xs text-muted-foreground">Peso</p>
                <p className="font-semibold">{(pokemon.weight / 10).toFixed(1)} kg</p>
              </div>
            </div>
            {strongAgainst.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">Fuerte contra</p>
                <div className="flex flex-wrap gap-1.5">
                  {strongAgainst.map((typeName) => (
                    <span
                      key={typeName}
                      style={{ backgroundColor: getPokemonTypeColor(typeName) }}
                      className="rounded-full px-2.5 py-1 text-xs font-medium text-white capitalize"
                    >
                      {typeName}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Section>
        </div>

        <div className={`${tab === 'stats' ? 'flex' : 'hidden'} flex-col gap-2 lg:flex`}>
          <Section title="Estadísticas">
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
          </Section>
        </div>

        <div className={`${tab === 'moves' ? 'flex' : 'hidden'} flex-col gap-2 lg:flex`}>
          <Section title="Movimientos">
            <div className="flex flex-wrap gap-1.5">
              {pokemon.moves.slice(0, 15).map(({ move }) => (
                <span
                  key={move.name}
                  className="rounded-full border border-border bg-card px-2.5 py-1 text-xs capitalize"
                >
                  {move.name.replace(/-/g, ' ')}
                </span>
              ))}
              {pokemon.moves.length === 0 && (
                <p className="text-sm text-muted-foreground">Sin movimientos registrados.</p>
              )}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex w-full flex-col gap-4 rounded-2xl border border-transparent p-0 lg:border-border lg:bg-card lg:p-5">
      <h2 className="hidden font-heading text-sm font-bold tracking-tight text-foreground lg:block">
        {title}
      </h2>
      {children}
    </div>
  );
}

function NavButton({
  direction,
  disabled,
  onClick,
}: {
  direction: 'prev' | 'next';
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={direction === 'prev' ? 'Pokémon anterior' : 'Pokémon siguiente'}
      className="rounded-full bg-black/20 p-2 backdrop-blur-sm transition-opacity disabled:opacity-30"
    >
      {direction === 'prev' ? <ChevronLeft className="size-5" /> : <ChevronRight className="size-5" />}
    </button>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-full py-1.5 text-sm font-medium transition-colors ${
        active ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
      }`}
    >
      {children}
    </button>
  );
}
