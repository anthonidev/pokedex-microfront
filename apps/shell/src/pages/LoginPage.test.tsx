import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import LoginPage from './LoginPage';

beforeEach(() => {
  localStorage.clear();
  useAuthStore.setState({ session: null });
});

describe('LoginPage', () => {
  it('rejects credentials that do not match the demo ones', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    // Exact match — the "Mostrar contraseña" toggle button's aria-label also contains
    // "contraseña", so a loose regex here matches both it and the actual field.
    await user.clear(screen.getByLabelText('Contraseña'));
    await user.type(screen.getByLabelText('Contraseña'), 'wrong-password');
    await user.click(screen.getByRole('button', { name: /ingresar/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/credenciales inválidas/i);
    expect(useAuthStore.getState().session).toBeNull();
  });

  it('logs in with the pre-filled demo credentials and persists the session', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: /ingresar/i }));

    await waitFor(
      () => expect(useAuthStore.getState().session?.email).toBe('demo@acity.dev'),
      { timeout: 2000 },
    );
  });
});
