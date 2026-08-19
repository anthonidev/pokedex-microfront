import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { PokemonStat } from '@acity/shared';
import StatRadar from './StatRadar';

function stat(name: string, base_stat: number): PokemonStat {
  return { base_stat, effort: 0, stat: { name, url: '' } };
}

describe('StatRadar', () => {
  it('renders every axis label and its value', () => {
    render(
      <StatRadar
        stats={[
          stat('hp', 35),
          stat('attack', 55),
          stat('defense', 40),
          stat('speed', 90),
          stat('special-defense', 50),
          stat('special-attack', 50),
        ]}
        primaryType="electric"
      />,
    );

    expect(screen.getByText('PS')).toBeInTheDocument();
    expect(screen.getByText('35')).toBeInTheDocument();
    expect(screen.getByText('Velocidad')).toBeInTheDocument();
    expect(screen.getByText('90')).toBeInTheDocument();
  });

  it('defaults a missing stat to 0 instead of crashing', () => {
    render(<StatRadar stats={[stat('hp', 35)]} primaryType="normal" />);

    expect(screen.getByText('Ataque')).toBeInTheDocument();
    // hp=35 is the only real one; every other axis falls back to 0.
    expect(screen.getAllByText('0')).toHaveLength(5);
  });
});
