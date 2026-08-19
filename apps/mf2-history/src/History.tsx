import { useEffect, useState } from 'react';
import { getHistory, subscribeToVisits, type HistoryEntry } from '@acity/shared';

function sortByMostRecent(entries: HistoryEntry[]): HistoryEntry[] {
  return [...entries].sort(
    (a, b) => new Date(b.lastVisitedAt).getTime() - new Date(a.lastVisitedAt).getTime(),
  );
}

export default function History() {
  const [entries, setEntries] = useState<HistoryEntry[]>(() => sortByMostRecent(getHistory()));

  useEffect(() => {
    // Re-reads the full list on every visit instead of merging the single entry from the
    // event — localStorage is already the source of truth (see docs/adr/009), so this
    // keeps this component's merge/dedupe logic identical to what registerVisit already did.
    return subscribeToVisits(() => setEntries(sortByMostRecent(getHistory())));
  }, []);

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 p-12 text-center text-foreground">
        <p className="text-lg font-medium">Todavía no visitaste ningún Pokémon</p>
        <p className="text-sm text-muted-foreground">
          Los Pokémon que abras desde el detalle van a aparecer acá.
        </p>
      </div>
    );
  }

  return (
    <ul className="mx-auto flex max-w-md flex-col gap-2 p-6">
      {entries.map((entry) => (
        <li
          key={entry.name}
          className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 text-card-foreground"
        >
          <img src={entry.image} alt={entry.name} className="size-12 shrink-0 object-contain" />
          <span className="flex-1 text-sm font-medium capitalize">{entry.name}</span>
          <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold tabular-nums text-muted-foreground">
            {entry.visits} {entry.visits === 1 ? 'visita' : 'visitas'}
          </span>
        </li>
      ))}
    </ul>
  );
}
