export interface PokemonListItem {
  name: string;
  url: string;
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonListItem[];
}

export interface PokemonTypeSlot {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

export interface PokemonTypeResponse {
  name: string;
  pokemon: Array<{
    slot: number;
    pokemon: PokemonListItem;
  }>;
}

export interface PokemonStat {
  base_stat: number;
  effort: number;
  stat: {
    name: string;
    url: string;
  };
}

export interface PokemonSprites {
  front_default: string | null;
  other?: {
    'official-artwork'?: {
      front_default: string | null;
    };
    dream_world?: {
      front_default: string | null;
    };
    home?: {
      front_default: string | null;
    };
  };
}

/** The 18 official PokeAPI types shown as rows on the Home page (excludes non-standard "shadow"/"unknown"). */
export const POKEMON_TYPES = [
  'normal',
  'fire',
  'water',
  'electric',
  'grass',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'dark',
  'steel',
  'fairy',
] as const;

export type PokemonType = (typeof POKEMON_TYPES)[number];

/** Community-standard color per type, used for the type badges in the detail view. */
export const POKEMON_TYPE_COLORS: Record<PokemonType, string> = {
  normal: '#A8A878',
  fire: '#F08030',
  water: '#6890F0',
  electric: '#F8D030',
  grass: '#78C850',
  ice: '#98D8D8',
  fighting: '#C03028',
  poison: '#A040A0',
  ground: '#E0C068',
  flying: '#A890F0',
  psychic: '#F85888',
  bug: '#A8B820',
  rock: '#B8A038',
  ghost: '#705898',
  dragon: '#7038F8',
  dark: '#705848',
  steel: '#B8B8D0',
  fairy: '#EE99AC',
};

const FALLBACK_TYPE_COLOR = '#68A090';

/** Safe accessor — PokeAPI could in principle return a type name outside our known list. */
export function getPokemonTypeColor(typeName: string): string {
  return (POKEMON_TYPE_COLORS as Record<string, string>)[typeName] ?? FALLBACK_TYPE_COLOR;
}

/** Soft-to-vivid diagonal gradient for card backgrounds, derived from the same type color. */
export function getPokemonTypeGradient(typeName: string): string {
  const color = getPokemonTypeColor(typeName);
  return `linear-gradient(160deg, color-mix(in srgb, ${color} 35%, white) 0%, ${color} 100%)`;
}

export interface PokemonMove {
  move: {
    name: string;
    url: string;
  };
}

export interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: PokemonTypeSlot[];
  stats: PokemonStat[];
  sprites: PokemonSprites;
  moves: PokemonMove[];
  /** Base species name — form variants (e.g. `pikachu-libre`) have a *different* `name` than
   * this, and the `/pokemon-species/{name}` endpoint only accepts the species name. */
  species: { name: string; url: string };
}

export interface PokemonSpeciesFlavorText {
  flavor_text: string;
  language: { name: string; url: string };
}

export interface PokemonSpecies {
  flavor_text_entries: PokemonSpeciesFlavorText[];
}

export interface PokemonTypeDetails {
  name: string;
  damage_relations: {
    double_damage_to: Array<{ name: string; url: string }>;
  };
}
