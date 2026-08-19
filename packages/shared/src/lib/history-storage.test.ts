import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearHistory,
  dismissReloadToast,
  getHistory,
  getLastVisited,
  registerVisit,
  removeHistoryEntry,
  shouldShowReloadToast,
  subscribeToVisits,
} from './history-storage';

beforeEach(() => {
  localStorage.clear();
});

describe('registerVisit', () => {
  it('adds a new entry with visits = 1', () => {
    const entry = registerVisit({ name: 'pikachu', image: 'pikachu.svg' });

    expect(entry.visits).toBe(1);
    expect(getHistory()).toEqual([entry]);
  });

  it('increments the counter instead of duplicating an existing entry', () => {
    registerVisit({ name: 'pikachu', image: 'pikachu.svg' });
    registerVisit({ name: 'pikachu', image: 'pikachu.svg' });
    registerVisit({ name: 'pikachu', image: 'pikachu.svg' });

    const history = getHistory();
    expect(history).toHaveLength(1);
    expect(history[0]?.visits).toBe(3);
  });

  it('keeps separate entries for different Pokémon', () => {
    registerVisit({ name: 'pikachu', image: 'pikachu.svg' });
    registerVisit({ name: 'bulbasaur', image: 'bulbasaur.svg' });

    expect(getHistory()).toHaveLength(2);
  });

  it('persists across "reloads" (a fresh read from localStorage)', () => {
    registerVisit({ name: 'pikachu', image: 'pikachu.svg' });

    // Simulates a reload: nothing in memory, only what a fresh call to getHistory() reads.
    expect(getHistory()).toHaveLength(1);
    expect(getHistory()[0]?.name).toBe('pikachu');
  });

  it('sets the "last visited" pointer to the just-visited entry', () => {
    registerVisit({ name: 'pikachu', image: 'pikachu.svg' });
    registerVisit({ name: 'bulbasaur', image: 'bulbasaur.svg' });

    expect(getLastVisited()?.name).toBe('bulbasaur');
  });

  it('dispatches the pokemon-visited event with the resulting entry', () => {
    const callback = vi.fn();
    subscribeToVisits(callback);

    const entry = registerVisit({ name: 'pikachu', image: 'pikachu.svg' });

    expect(callback).toHaveBeenCalledExactlyOnceWith(entry);
  });

  it('unsubscribes when the returned cleanup function is called', () => {
    const callback = vi.fn();
    const unsubscribe = subscribeToVisits(callback);
    unsubscribe();

    registerVisit({ name: 'pikachu', image: 'pikachu.svg' });

    expect(callback).not.toHaveBeenCalled();
  });
});

describe('removeHistoryEntry', () => {
  it('removes only the matching entry', () => {
    registerVisit({ name: 'pikachu', image: 'pikachu.svg' });
    registerVisit({ name: 'bulbasaur', image: 'bulbasaur.svg' });

    const remaining = removeHistoryEntry('pikachu');

    expect(remaining).toHaveLength(1);
    expect(remaining[0]?.name).toBe('bulbasaur');
  });

  it('clears the "last visited" pointer if it pointed at the removed entry', () => {
    registerVisit({ name: 'pikachu', image: 'pikachu.svg' });

    removeHistoryEntry('pikachu');

    expect(getLastVisited()).toBeNull();
  });

  it('leaves the "last visited" pointer untouched for an unrelated removal', () => {
    registerVisit({ name: 'pikachu', image: 'pikachu.svg' });
    registerVisit({ name: 'bulbasaur', image: 'bulbasaur.svg' });

    removeHistoryEntry('pikachu');

    expect(getLastVisited()?.name).toBe('bulbasaur');
  });
});

describe('clearHistory', () => {
  it('empties the history and the "last visited" pointer', () => {
    registerVisit({ name: 'pikachu', image: 'pikachu.svg' });

    clearHistory();

    expect(getHistory()).toEqual([]);
    expect(getLastVisited()).toBeNull();
  });
});

describe('reload toast (shouldShowReloadToast / dismissReloadToast)', () => {
  it('does not show the toast when nothing was ever visited', () => {
    expect(shouldShowReloadToast()).toBe(false);
  });

  it('shows the toast right after a visit', () => {
    registerVisit({ name: 'pikachu', image: 'pikachu.svg' });

    expect(shouldShowReloadToast()).toBe(true);
  });

  it('stops showing the toast once dismissed', () => {
    registerVisit({ name: 'pikachu', image: 'pikachu.svg' });
    dismissReloadToast();

    expect(shouldShowReloadToast()).toBe(false);
  });

  it('shows the toast again after a new visit to the SAME Pokémon, even if previously dismissed', () => {
    // This is the explicit edge case from the README: "no debe volver a mostrarse hasta
    // que exista una nueva visita" — re-visiting the same Pokémon still counts as a new visit.
    registerVisit({ name: 'pikachu', image: 'pikachu.svg' });
    dismissReloadToast();
    expect(shouldShowReloadToast()).toBe(false);

    registerVisit({ name: 'pikachu', image: 'pikachu.svg' });

    expect(shouldShowReloadToast()).toBe(true);
  });

  it('shows the toast again after visiting a different Pokémon', () => {
    registerVisit({ name: 'pikachu', image: 'pikachu.svg' });
    dismissReloadToast();

    registerVisit({ name: 'bulbasaur', image: 'bulbasaur.svg' });

    expect(shouldShowReloadToast()).toBe(true);
  });
});
