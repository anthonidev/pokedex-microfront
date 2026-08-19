import type { Pokemon, PokemonListResponse, PokemonTypeResponse } from '../types/pokemon';

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

/** Prefers the background-less official artwork SVG/PNG, falls back to the default sprite. */
export function getPokemonArtwork(pokemon: Pokemon): string {
  return (
    pokemon.sprites.other?.['official-artwork']?.front_default ??
    pokemon.sprites.other?.home?.front_default ??
    pokemon.sprites.front_default ??
    ''
  );
}

/**
 * `/type/{type}` and `/pokemon?limit=&offset=` only return `{ name, url }`, not sprites.
 * The numeric id is embedded in the url (".../pokemon/6/"), so we can derive the
 * official-artwork image directly from the static sprites CDN — avoiding N extra
 * `/pokemon/{name}` requests per row on the Home page (10 per type × 18 types).
 */
export function getPokemonIdFromUrl(url: string): number {
  const match = /\/pokemon\/(\d+)\/?$/.exec(url);
  return match ? Number(match[1]) : 0;
}

export function getArtworkUrlById(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}
