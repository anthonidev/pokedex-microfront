import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { registerVisit } from '@acity/shared';
import History from './History';

beforeEach(() => {
  localStorage.clear();
});

describe('History', () => {
  it('shows the empty state when nothing was visited yet', () => {
    render(<History />);

    expect(screen.getByText(/todav[íi]a no visitaste/i)).toBeInTheDocument();
  });

  it('lists visited Pokémon with their visit count', () => {
    registerVisit({ name: 'pikachu', image: 'pikachu.svg' });
    registerVisit({ name: 'pikachu', image: 'pikachu.svg' });
    registerVisit({ name: 'bulbasaur', image: 'bulbasaur.svg' });

    render(<History />);

    const pikachuCard = screen.getByText('pikachu').closest('li');
    expect(pikachuCard).not.toBeNull();
    expect(within(pikachuCard as HTMLElement).getByText('2 visitas')).toBeInTheDocument();

    const bulbasaurCard = screen.getByText('bulbasaur').closest('li');
    expect(within(bulbasaurCard as HTMLElement).getByText('1 visita')).toBeInTheDocument();
  });

  it('does not render the "ver detalle" button when onViewDetail is not provided (standalone MF2)', () => {
    registerVisit({ name: 'pikachu', image: 'pikachu.svg' });

    render(<History />);

    expect(screen.queryByLabelText(/ver detalle/i)).not.toBeInTheDocument();
  });

  it('calls onViewDetail with the Pokémon name when its arrow button is clicked', async () => {
    registerVisit({ name: 'pikachu', image: 'pikachu.svg' });
    const onViewDetail = vi.fn();
    const user = userEvent.setup();

    render(<History onViewDetail={onViewDetail} />);
    await user.click(screen.getByLabelText(/ver detalle de pikachu/i));

    expect(onViewDetail).toHaveBeenCalledExactlyOnceWith('pikachu');
  });

  it('removes a single entry without touching the others', async () => {
    registerVisit({ name: 'pikachu', image: 'pikachu.svg' });
    registerVisit({ name: 'bulbasaur', image: 'bulbasaur.svg' });
    const user = userEvent.setup();

    render(<History />);
    await user.click(screen.getByLabelText(/quitar pikachu/i));

    expect(screen.queryByText('pikachu')).not.toBeInTheDocument();
    expect(screen.getByText('bulbasaur')).toBeInTheDocument();
  });

  it('clears the whole history after confirming', async () => {
    registerVisit({ name: 'pikachu', image: 'pikachu.svg' });
    registerVisit({ name: 'bulbasaur', image: 'bulbasaur.svg' });
    const user = userEvent.setup();

    render(<History />);
    await user.click(screen.getByRole('button', { name: /vaciar historial/i }));
    await user.click(screen.getByRole('button', { name: /s[íi], vaciar/i }));

    expect(screen.getByText(/todav[íi]a no visitaste/i)).toBeInTheDocument();
  });

  it('does not clear anything if the "vaciar todo" confirmation is cancelled', async () => {
    registerVisit({ name: 'pikachu', image: 'pikachu.svg' });
    const user = userEvent.setup();

    render(<History />);
    await user.click(screen.getByRole('button', { name: /vaciar historial/i }));
    await user.click(screen.getByRole('button', { name: /cancelar/i }));

    expect(screen.getByText('pikachu')).toBeInTheDocument();
  });
});
