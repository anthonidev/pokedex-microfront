import { useEffect, useState } from 'react';
import { ArrowRight, History as HistoryIcon, Trash2 } from 'lucide-react';
import {
  clearHistory,
  getHistory,
  removeHistoryEntry,
  subscribeToVisits,
  type HistoryEntry,
} from '@acity/shared';

interface HistoryProps {
  /** Shell owns routing (see docs/adr/003) — MF2 asks it to navigate, stays router-free.
   * Optional so MF2 still renders standalone on :3002 without the Shell (see App.tsx). */
  onViewDetail?: (name: string) => void;
}

function sortByMostRecent(entries: HistoryEntry[]): HistoryEntry[] {
  return [...entries].sort(
    (a, b) => new Date(b.lastVisitedAt).getTime() - new Date(a.lastVisitedAt).getTime(),
  );
}

export default function History({ onViewDetail }: HistoryProps) {
  const [entries, setEntries] = useState<HistoryEntry[]>(() => sortByMostRecent(getHistory()));
  const [confirmingClear, setConfirmingClear] = useState(false);

  useEffect(() => {
    // Re-reads the full list on every visit instead of merging the single entry from the
    // event — localStorage is already the source of truth (see docs/adr/009), so this
    // keeps this component's merge/dedupe logic identical to what registerVisit already did.
    return subscribeToVisits(() => setEntries(sortByMostRecent(getHistory())));
  }, []);

  function handleRemove(name: string) {
    setEntries(sortByMostRecent(removeHistoryEntry(name)));
  }

  function handleClear() {
    clearHistory();
    setEntries([]);
    setConfirmingClear(false);
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 p-12 text-center text-foreground">
        <div className="flex size-14 items-center justify-center rounded-full bg-muted">
          <HistoryIcon className="size-6 text-muted-foreground" />
        </div>
        <p className="text-lg font-medium">Todavía no visitaste ningún Pokémon</p>
        <p className="text-sm text-muted-foreground">
          Los Pokémon que abras desde el detalle van a aparecer acá.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Historial</h1>
          <p className="text-sm text-muted-foreground">
            {entries.length} {entries.length === 1 ? 'Pokémon visitado' : 'Pokémon visitados'}
          </p>
        </div>

        {confirmingClear ? (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">¿Vaciar todo?</span>
            <button
              type="button"
              onClick={handleClear}
              className="rounded-full bg-destructive/10 px-3 py-1.5 font-medium text-destructive transition-colors hover:bg-destructive/20"
            >
              Sí, vaciar
            </button>
            <button
              type="button"
              onClick={() => setConfirmingClear(false)}
              className="rounded-full border border-border px-3 py-1.5 font-medium transition-colors hover:bg-muted"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingClear(true)}
            className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive"
          >
            <Trash2 className="size-4" />
            Vaciar historial
          </button>
        )}
      </div>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map((entry) => (
          <li
            key={entry.name}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 text-card-foreground transition-shadow hover:shadow-md"
          >
            <img
              src={entry.image}
              alt={entry.name}
              // Matches the `viewTransitionName` on the detail page's hero image for this same
              // Pokémon — morphs into it when navigating there via `onViewDetail`. See
              // docs/adr/018.
              style={onViewDetail ? { viewTransitionName: `pokemon-artwork-${entry.name}` } : undefined}
              className="size-14 shrink-0 object-contain"
            />

            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate font-heading text-sm font-bold capitalize">
                {entry.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {entry.visits} {entry.visits === 1 ? 'visita' : 'visitas'}
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              {onViewDetail && (
                <button
                  type="button"
                  onClick={() => onViewDetail(entry.name)}
                  aria-label={`Ver detalle de ${entry.name}`}
                  className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <ArrowRight className="size-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => handleRemove(entry.name)}
                aria-label={`Quitar ${entry.name} del historial`}
                className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
