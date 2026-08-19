import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SearchModal from './SearchModal';

const NAMES = { count: 2, next: null, previous: null, results: [
  { name: 'pikachu', url: '' },
  { name: 'bulbasaur', url: '' },
] };

const EMPTY_LIST = { count: 0, next: null, previous: null, results: [] };

const PIKACHU = {
  id: 25,
  name: 'pikachu',
  height: 4,
  weight: 60,
  types: [{ slot: 1, type: { name: 'electric', url: '' } }],
  stats: [],
  sprites: { front_default: 'default.png' },
  moves: [],
  species: { name: 'pikachu', url: '' },
};

function mockFetchByUrl(routes: Array<[string, unknown, number?]>) {
  vi.stubGlobal(
    'fetch',
    vi.fn((input: string | URL) => {
      const url = String(input);
      const match = routes.find(([pattern]) => url.includes(pattern));
      if (!match) return Promise.resolve(new Response(null, { status: 404 }));
      const [, body, status = 200] = match;
      return Promise.resolve(new Response(JSON.stringify(body), { status }));
    }),
  );
}

function renderSearchModal() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <SearchModal open onOpenChange={() => {}} />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('SearchModal — búsqueda exacta', () => {
  it('shows only the matching Pokémon for an exact name', async () => {
    mockFetchByUrl([
      ['limit=100000', NAMES],
      ['limit=30', EMPTY_LIST],
      ['/pokemon/pikachu', PIKACHU],
    ]);
    const user = userEvent.setup();
    renderSearchModal();

    await user.type(screen.getByPlaceholderText(/nombre exacto/i), 'pikachu');

    expect(await screen.findByText('pikachu', {}, { timeout: 2000 })).toBeInTheDocument();
  });

  it('is case-insensitive (README: exact match, lowercase)', async () => {
    mockFetchByUrl([
      ['limit=100000', NAMES],
      ['limit=30', EMPTY_LIST],
      ['/pokemon/pikachu', PIKACHU],
    ]);
    const user = userEvent.setup();
    renderSearchModal();

    await user.type(screen.getByPlaceholderText(/nombre exacto/i), 'PIKACHU');

    expect(await screen.findByText('pikachu', {}, { timeout: 2000 })).toBeInTheDocument();
  });

  it('shows "No encontrado" for a name that does not exist and has no suggestions', async () => {
    mockFetchByUrl([
      ['limit=100000', NAMES],
      ['limit=30', EMPTY_LIST],
    ]);
    const user = userEvent.setup();
    renderSearchModal();

    await user.type(screen.getByPlaceholderText(/nombre exacto/i), 'zzznoexiste');

    expect(await screen.findByText(/no encontrado/i, {}, { timeout: 2000 })).toBeInTheDocument();
  });
});
