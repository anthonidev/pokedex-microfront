/**
 * Shape as suggested by the challenge README, plus `lastVisitedAt` used
 * internally to drive the "toast on reload" feature (see docs/adr/003 and 009).
 */
export interface HistoryEntry {
  name: string;
  image: string;
  visits: number;
  lastVisitedAt: string;
}

export interface PokemonVisitedEventDetail {
  entry: HistoryEntry;
}

export const POKEMON_VISITED_EVENT = 'pokemon-visited';

export type PokemonVisitedEvent = CustomEvent<PokemonVisitedEventDetail>;
