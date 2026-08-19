import { lazy } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import RemoteBoundary from '@/RemoteBoundary';

const PokemonDetail = lazy(() => import('mf1Detail/PokemonDetail'));

/**
 * Reads the route param here (in the Shell) and passes it down as a plain prop
 * instead of having MF1 call useParams() itself — MF1 bundles its own separate
 * copy of react-router-dom, so its Context wouldn't see the Shell's Router
 * anyway. This also means MF1 has zero router dependency. See docs/adr/003.
 */
export default function PokemonDetailPage() {
  const { name } = useParams<{ name: string }>();

  if (!name) {
    return <Navigate to="/" replace />;
  }

  return (
    <RemoteBoundary label="mf1Detail/PokemonDetail">
      <PokemonDetail name={name} />
    </RemoteBoundary>
  );
}
