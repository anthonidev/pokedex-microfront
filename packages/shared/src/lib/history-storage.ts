import { POKEMON_VISITED_EVENT, type HistoryEntry, type PokemonVisitedEvent } from '../types/history';

const HISTORY_KEY = 'ac-pokemon-history';
const LAST_VISITED_KEY = 'ac-pokemon-last-visited';
const TOAST_DISMISSED_FOR_KEY = 'ac-pokemon-toast-dismissed-for';

function readJson<T>(key: string): T | null {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getHistory(): HistoryEntry[] {
  return readJson<HistoryEntry[]>(HISTORY_KEY) ?? [];
}

export function getLastVisited(): HistoryEntry | null {
  return readJson<HistoryEntry>(LAST_VISITED_KEY);
}

/**
 * Records a visit: increments the counter if the Pokémon is already in history
 * (deduped by name), otherwise appends it with visits = 1. Updates the
 * "last visited" pointer and dispatches `pokemon-visited` so the Shell (toast)
 * and MF2 (history list) can react without a shared store — see docs/adr/003.
 */
export function registerVisit(pokemon: { name: string; image: string }): HistoryEntry {
  const history = getHistory();
  const now = new Date().toISOString();
  const existing = history.find((entry) => entry.name === pokemon.name);

  let entry: HistoryEntry;
  if (existing) {
    existing.visits += 1;
    existing.image = pokemon.image;
    existing.lastVisitedAt = now;
    entry = existing;
  } else {
    entry = { name: pokemon.name, image: pokemon.image, visits: 1, lastVisitedAt: now };
    history.push(entry);
  }

  writeJson(HISTORY_KEY, history);
  writeJson(LAST_VISITED_KEY, entry);
  // A fresh visit makes the toast eligible again, even if a previous one was dismissed.
  localStorage.removeItem(TOAST_DISMISSED_FOR_KEY);

  window.dispatchEvent(
    new CustomEvent(POKEMON_VISITED_EVENT, { detail: { entry } }) satisfies PokemonVisitedEvent,
  );

  return entry;
}

/** Removes one entry. Also clears the "last visited" pointer if it was that same entry, so a
 * reload doesn't toast about a Pokémon that's no longer in history. */
export function removeHistoryEntry(name: string): HistoryEntry[] {
  const history = getHistory().filter((entry) => entry.name !== name);
  writeJson(HISTORY_KEY, history);
  if (getLastVisited()?.name === name) {
    localStorage.removeItem(LAST_VISITED_KEY);
  }
  return history;
}

/** Clears the whole history, plus the "last visited" pointer and any dismissed-toast flag —
 * nothing left to toast about after a full clear. */
export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
  localStorage.removeItem(LAST_VISITED_KEY);
  localStorage.removeItem(TOAST_DISMISSED_FOR_KEY);
}

export function subscribeToVisits(callback: (entry: HistoryEntry) => void): () => void {
  const listener = (event: Event) => {
    callback((event as PokemonVisitedEvent).detail.entry);
  };
  window.addEventListener(POKEMON_VISITED_EVENT, listener);
  return () => window.removeEventListener(POKEMON_VISITED_EVENT, listener);
}

/** Whether the reload toast should show for the current `lastVisited` entry. */
export function shouldShowReloadToast(): boolean {
  const lastVisited = getLastVisited();
  if (!lastVisited) return false;
  const dismissedFor = localStorage.getItem(TOAST_DISMISSED_FOR_KEY);
  return dismissedFor !== lastVisited.lastVisitedAt;
}

/** Persists the dismiss so the toast stays closed until the next new visit. */
export function dismissReloadToast(): void {
  const lastVisited = getLastVisited();
  if (!lastVisited) return;
  localStorage.setItem(TOAST_DISMISSED_FOR_KEY, lastVisited.lastVisitedAt);
}
