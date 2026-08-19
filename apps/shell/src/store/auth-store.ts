import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthSession {
  email: string;
  loggedInAt: string;
}

interface AuthState {
  session: AuthSession | null;
  login: (email: string) => void;
  logout: () => void;
}

/**
 * Mock auth (no real backend — PokeAPI has no concept of users, see docs/adr/008).
 * Persisted so the session survives a reload, which is what "sesión de usuario" means here.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      login: (email) => set({ session: { email, loggedInAt: new Date().toISOString() } }),
      logout: () => set({ session: null }),
    }),
    { name: 'ac-auth-session' },
  ),
);
