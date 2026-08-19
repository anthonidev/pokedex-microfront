import type {
  Pokemon,
  PokemonListResponse,
  PokemonSpecies,
  PokemonTypeDetails,
  PokemonTypeResponse,
} from '../types/pokemon';

const BASE_URL = 'https://pokeapi.co/api/v2';

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`PokeAPI request failed (${response.status}): ${url}`);
  }
  return response.json() as Promise<T>;
}

export function getPokemonByType(type: string): Promise<PokemonTypeResponse> {
  return fetchJson<PokemonTypeResponse>(`${BASE_URL}/type/${type}`);
}

export function getPokemonList(limit: number, offset: number): Promise<PokemonListResponse> {
  return fetchJson<PokemonListResponse>(`${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`);
}

/** Exact-match lookup by lowercase name — no fragment/fuzzy search (see docs/00-overview.md). */
export function getPokemonByName(name: string): Promise<Pokemon> {
  return fetchJson<Pokemon>(`${BASE_URL}/pokemon/${name.toLowerCase()}`);
}

export function getPokemonById(id: number | string): Promise<Pokemon> {
  return fetchJson<Pokemon>(`${BASE_URL}/pokemon/${id}`);
}

/** Flavor text + damage relations live on separate PokeAPI resources from `/pokemon/{id}`. */
export function getPokemonSpecies(name: string): Promise<PokemonSpecies> {
  return fetchJson<PokemonSpecies>(`${BASE_URL}/pokemon-species/${name.toLowerCase()}`);
}

export function getTypeDetails(typeName: string): Promise<PokemonTypeDetails> {
  return fetchJson<PokemonTypeDetails>(`${BASE_URL}/type/${typeName}`);
}

/** First Spanish flavor text if PokeAPI has one for this species, else the first English one. */
export function getFlavorText(species: PokemonSpecies): string {
  const entry =
    species.flavor_text_entries.find((e) => e.language.name === 'es') ??
    species.flavor_text_entries.find((e) => e.language.name === 'en');
  return entry ? entry.flavor_text.replace(/[\n\f\r]+/g, ' ') : '';
}

/**
 * Prefers `dream_world` (an actual background-less SVG) per the README's "preferentemente
 * SVG sin fondo" requirement — not every Pokémon has one, so falls back to the PNG
 * official artwork, then the default sprite.
 */
export function getPokemonArtwork(pokemon: Pokemon): string {
  return (
    pokemon.sprites.other?.dream_world?.front_default ??
    pokemon.sprites.other?.['official-artwork']?.front_default ??
    pokemon.sprites.other?.home?.front_default ??
    pokemon.sprites.front_default ??
    ''
  );
}

/**
 * `/type/{type}` and `/pokemon?limit=&offset=` only return `{ name, url }`, not sprites.
 * The numeric id is embedded in the url (".../pokemon/6/"), so we can derive the
 * official-artwork image directly from the static sprites CDN without an extra request —
 * used by the search modal's browse grid, which doesn't need per-card type data.
 */
export function getPokemonIdFromUrl(url: string): number {
  const match = /\/pokemon\/(\d+)\/?$/.exec(url);
  return match ? Number(match[1]) : 0;
}

export function getArtworkUrlById(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}
