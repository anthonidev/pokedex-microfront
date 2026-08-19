import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './query-client';
import PokemonDetailContent from './PokemonDetailContent';

interface PokemonDetailProps {
  name: string;
  onNavigate?: (name: string) => void;
  onGoHome?: () => void;
}

/**
 * Exposed via Module Federation as `mf1Detail/PokemonDetail`. Wraps its own
 * QueryClientProvider — React Context doesn't cross a federation boundary
 * (this bundle has its own copy of @tanstack/react-query), so relying on the
 * Shell's provider would throw "No QueryClient set". See docs/adr/006.
 */
export default function PokemonDetail({ name, onNavigate, onGoHome }: PokemonDetailProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <PokemonDetailContent name={name} onNavigate={onNavigate} onGoHome={onGoHome} />
    </QueryClientProvider>
  );
}
