import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
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
  PokemonDetailSkeleton,
} from '@acity/shared';
import StatRadar from './StatRadar';

interface PokemonDetailContentProps {
  name: string;
  /** Shell owns routing (see docs/adr/003) — prev/next asks it to navigate, MF1 stays router-free. */
  onNavigate?: (name: string) => void;
  onGoHome?: () => void;
}

type TabKey = 'info' | 'stats' | 'moves';

export default function PokemonDetailContent({
  name,
  onNavigate,
  onGoHome,
}: PokemonDetailContentProps) {
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
    // `pokemon.species.name` (not the route `name`) — form variants like `pikachu-libre` have
    // a different route name than their species; the species endpoint only accepts the latter.
    queryKey: ['pokemon-species', pokemon?.species.name],
    queryFn: () => getPokemonSpecies(pokemon!.species.name),
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

  // Desktop convenience — mirrors the prev/next chevrons exactly (same bounds check, same
  // callback). Ignored with a modifier held so it doesn't fight the browser's own
  // back/forward gestures (Cmd/Alt/Ctrl+Arrow).
  useEffect(() => {
    if (!onNavigate || !pokemon) return;
    const currentId = pokemon.id;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === 'ArrowLeft' && currentId > 1) {
        onNavigate?.(String(currentId - 1));
      } else if (event.key === 'ArrowRight') {
        onNavigate?.(String(currentId + 1));
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNavigate, pokemon]);

  if (isPending) {
    return <PokemonDetailSkeleton />;
  }

  if (isError) {
    return <NotFoundState name={name} />;
  }

  const artwork = getPokemonArtwork(pokemon);
  const primaryType = pokemon.types[0]?.type.name ?? 'normal';
  const flavorText = speciesQuery.data ? getFlavorText(speciesQuery.data) : '';

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col">
      {/* Hero: full-bleed "phone card" on mobile, wide banner on desktop — the artwork is the
          centerpiece either way, just a lot bigger and further out of the frame on desktop
          (see docs/adr/019). Same markup both breakpoints, only sizing/spacing changes. */}
      <div
        className="relative flex flex-col items-center gap-3 rounded-b-[2.5rem] px-6 pt-6 pb-24 text-white lg:rounded-[2rem] lg:px-12 lg:pt-10 lg:pb-40"
        style={{ backgroundImage: getPokemonTypeGradient(primaryType) }}
      >
        {/* grid-cols-3 (not flex justify-between) so the #id badge stays perfectly centered
            regardless of the "volver" button only existing in the left cell. */}
        <div className="grid w-full grid-cols-3 items-center">
          <div className="flex items-center gap-2 justify-self-start">
            {onGoHome && (
              <button
                type="button"
                onClick={onGoHome}
                aria-label="Volver al inicio"
                className="flex items-center gap-1.5 rounded-full bg-black/20 p-2 backdrop-blur-sm transition-colors hover:bg-black/30"
              >
                <ArrowLeft className="size-5" />
                <span className="hidden pr-1 text-sm font-semibold sm:inline">Inicio</span>
              </button>
            )}
            <NavButton
              direction="prev"
              disabled={!onNavigate || pokemon.id <= 1}
              onClick={() => onNavigate?.(String(pokemon.id - 1))}
            />
          </div>
          <span className="justify-self-center rounded-full bg-black/20 px-3 py-1 text-sm font-semibold tabular-nums backdrop-blur-sm">
            #{String(pokemon.id).padStart(3, '0')}
          </span>
          <NavButton
            direction="next"
            disabled={!onNavigate}
            onClick={() => onNavigate?.(String(pokemon.id + 1))}
            className="justify-self-end"
          />
        </div>

        <h1 className="font-heading text-2xl font-bold capitalize lg:text-4xl">{pokemon.name}</h1>
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
          className="relative z-10 mx-auto -mt-24 size-40 object-contain drop-shadow-xl lg:-mt-40 lg:size-64"
        />
      )}

      <div className="-mt-4 flex flex-col gap-4 px-6 pb-6 text-foreground lg:mt-4 lg:px-0">
        {/* Tabs only make sense where vertical/horizontal space is scarce — desktop shows every
            section at once instead, arranged in a grid so nothing sits alone in a mostly-empty
            card (see docs/adr/019). */}
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

        <div className="lg:grid lg:grid-cols-3 lg:gap-4">
          <div className={`${tab === 'info' ? 'flex' : 'hidden'} flex-col gap-4 lg:col-span-2 lg:flex`}>
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

          <div className={`${tab === 'stats' ? 'flex' : 'hidden'} flex-col gap-2 lg:col-span-1 lg:flex`}>
            <Section title="Estadísticas">
              <StatRadar stats={pokemon.stats} primaryType={primaryType} />
            </Section>
          </div>

          <div className={`${tab === 'moves' ? 'flex' : 'hidden'} flex-col gap-2 lg:col-span-3 lg:flex`}>
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
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex h-full w-full flex-col gap-4 rounded-2xl border border-transparent p-0 lg:border-border lg:bg-card lg:p-5">
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
  className = '',
}: {
  direction: 'prev' | 'next';
  disabled: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={direction === 'prev' ? 'Pokémon anterior' : 'Pokémon siguiente'}
      className={`rounded-full bg-black/20 p-2 backdrop-blur-sm transition-opacity disabled:opacity-30 ${className}`}
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
