import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { getHistory } from '@acity/shared';
import PokemonDetail from './PokemonDetail';

const POKEMON_RESPONSE = {
  id: 25,
  name: 'pikachu',
  height: 4,
  weight: 60,
  types: [{ slot: 1, type: { name: 'electric', url: '' } }],
  stats: [{ base_stat: 35, effort: 0, stat: { name: 'hp', url: '' } }],
  sprites: { front_default: 'default.png', other: { dream_world: { front_default: 'pikachu.svg' } } },
  moves: [],
  species: { name: 'pikachu', url: '' },
};

const SPECIES_RESPONSE = {
  flavor_text_entries: [{ flavor_text: 'Un ratón eléctrico.', language: { name: 'es', url: '' } }],
};

function mockFetchByUrl(routes: Record<string, unknown>) {
  vi.stubGlobal(
    'fetch',
    vi.fn((input: string | URL) => {
      const url = String(input);
      const match = Object.entries(routes).find(([pattern]) => url.includes(pattern));
      if (!match) return Promise.resolve(new Response(null, { status: 404 }));
      return Promise.resolve(new Response(JSON.stringify(match[1]), { status: 200 }));
    }),
  );
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('PokemonDetail (smoke)', () => {
  it('renders the fetched Pokémon (name, type, stat) and registers the visit in history', async () => {
    mockFetchByUrl({
      '/pokemon/pikachu': POKEMON_RESPONSE,
      '/pokemon-species/pikachu': SPECIES_RESPONSE,
      '/type/electric': { name: 'electric', damage_relations: { double_damage_to: [] } },
    });

    render(<PokemonDetail name="pikachu" />);

    expect(await screen.findByRole('heading', { name: 'pikachu' })).toBeInTheDocument();
    expect(screen.getByText('electric')).toBeInTheDocument();

    await waitFor(() => {
      expect(getHistory()).toEqual([
        expect.objectContaining({ name: 'pikachu', visits: 1 }),
      ]);
    });
  });

  it('shows the "no encontrado" state for a name PokeAPI 404s on', async () => {
    mockFetchByUrl({});

    render(<PokemonDetail name="pokemon-que-no-existe" />);

    expect(await screen.findByText(/no encontrado/i)).toBeInTheDocument();
  });
});
