import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getFlavorText, getPokemonArtwork, getPokemonByName } from './pokeapi';
import type { Pokemon, PokemonSpecies } from '../types/pokemon';

function makePokemon(overrides: Partial<Pokemon> = {}): Pokemon {
  return {
    id: 25,
    name: 'pikachu',
    height: 4,
    weight: 60,
    types: [],
    stats: [],
    sprites: { front_default: 'default.png' },
    moves: [],
    species: { name: 'pikachu', url: '' },
    ...overrides,
  };
}

describe('getPokemonByName', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('normalizes the name to lowercase before requesting — README requires exact match, all lowercase', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(makePokemon()), { status: 200 }),
    );

    await getPokemonByName('PIKACHU');

    expect(fetch).toHaveBeenCalledWith('https://pokeapi.co/api/v2/pokemon/pikachu');
  });

  it('rejects when PokeAPI responds 404 (the "no encontrado" case)', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 404 }));

    await expect(getPokemonByName('pokemon-que-no-existe')).rejects.toThrow();
  });
});

describe('getPokemonArtwork', () => {
  it('prefers dream_world (the actual background-less SVG)', () => {
    const pokemon = makePokemon({
      sprites: {
        front_default: 'default.png',
        other: {
          dream_world: { front_default: 'dream-world.svg' },
          'official-artwork': { front_default: 'official-artwork.png' },
        },
      },
    });

    expect(getPokemonArtwork(pokemon)).toBe('dream-world.svg');
  });

  it('falls back to official-artwork when dream_world is unavailable', () => {
    const pokemon = makePokemon({
      sprites: {
        front_default: 'default.png',
        other: {
          dream_world: { front_default: null },
          'official-artwork': { front_default: 'official-artwork.png' },
        },
      },
    });

    expect(getPokemonArtwork(pokemon)).toBe('official-artwork.png');
  });

  it('falls back to the default sprite when nothing else is available', () => {
    const pokemon = makePokemon({ sprites: { front_default: 'default.png' } });

    expect(getPokemonArtwork(pokemon)).toBe('default.png');
  });
});

describe('getFlavorText', () => {
  function makeSpecies(
    entries: PokemonSpecies['flavor_text_entries'],
  ): PokemonSpecies {
    return { flavor_text_entries: entries };
  }

  it('prefers the Spanish entry when available', () => {
    const species = makeSpecies([
      { flavor_text: 'English text', language: { name: 'en', url: '' } },
      { flavor_text: 'Texto en español', language: { name: 'es', url: '' } },
    ]);

    expect(getFlavorText(species)).toBe('Texto en español');
  });

  it('falls back to English when there is no Spanish entry', () => {
    const species = makeSpecies([
      { flavor_text: 'English text', language: { name: 'en', url: '' } },
    ]);

    expect(getFlavorText(species)).toBe('English text');
  });

  it('strips embedded newlines/form-feeds from the raw PokeAPI text', () => {
    const species = makeSpecies([
      { flavor_text: 'Line one\nLine\ftwo\rLine three', language: { name: 'en', url: '' } },
    ]);

    expect(getFlavorText(species)).toBe('Line one Line two Line three');
  });

  it('returns an empty string when there is no entry in either language', () => {
    expect(getFlavorText(makeSpecies([]))).toBe('');
  });
});
