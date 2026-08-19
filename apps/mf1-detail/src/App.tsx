import { useState } from 'react';
import PokemonDetail from './PokemonDetail';

/** Standalone entry so MF1 can be viewed/tested on :3001 without the Shell running. */
function App() {
  const [name, setName] = useState('pikachu');

  return (
    <main className="min-h-screen bg-background p-8 text-foreground">
      <PokemonDetail name={name} onNavigate={setName} />
    </main>
  );
}

export default App;
