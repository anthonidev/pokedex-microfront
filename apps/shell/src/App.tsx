import { lazy } from 'react';
import RemoteBoundary from './RemoteBoundary';

const PokemonDetail = lazy(() => import('mf1Detail/PokemonDetail'));
const History = lazy(() => import('mf2History/History'));

/**
 * Fase 0: solo valida que el Shell consume ambos remotes vía Module Federation.
 * El ruteo real (React Router, /pokemon/:name, /history) llega en las Fases 1-4.
 */
function App() {
  return (
    <main className="min-h-screen bg-surface p-8 text-ink">
      <h1 className="text-2xl font-bold text-brand-700">Shell — Bootstrap Fase 0</h1>
      <p className="mt-1 text-sm text-ink-muted">Consumiendo remotes de MF1 y MF2 vía Module Federation.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <RemoteBoundary label="mf1Detail/PokemonDetail">
          <PokemonDetail />
        </RemoteBoundary>
        <RemoteBoundary label="mf2History/History">
          <History />
        </RemoteBoundary>
      </div>
    </main>
  );
}

export default App;
