import History from './History';

/** Standalone entry so MF2 can be viewed/tested on :3002 without the Shell running. */
function App() {
  return (
    <main className="min-h-screen bg-background p-8 text-foreground">
      <History />
    </main>
  );
}

export default App;
