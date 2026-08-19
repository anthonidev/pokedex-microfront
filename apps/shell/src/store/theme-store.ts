import { create } from 'zustand';
import { applyTheme, getStoredTheme, type Theme } from '@acity/shared';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

/**
 * Persistence lives in @acity/shared (applyTheme/getStoredTheme), not in a Zustand
 * persist middleware here — that's the single source of truth also usable by MF1/MF2
 * without needing this store (see docs/adr/003). This store just mirrors it for React.
 */
export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: getStoredTheme(),
  setTheme: (theme) => {
    applyTheme(theme);
    set({ theme });
  },
  toggleTheme: () => {
    const next: Theme = get().theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    set({ theme: next });
  },
}));
