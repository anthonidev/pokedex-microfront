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

export interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: PokemonTypeSlot[];
  stats: PokemonStat[];
  sprites: PokemonSprites;
}
