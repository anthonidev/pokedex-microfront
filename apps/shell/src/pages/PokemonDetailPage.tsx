import { Navigate, useNavigate, useParams } from 'react-router-dom';
import RemoteBoundary from '@/RemoteBoundary';

/**
 * Reads the route param here (in the Shell) and passes it down as a plain prop
 * instead of having MF1 call useParams() itself — MF1 bundles its own separate
 * copy of react-router-dom, so its Context wouldn't see the Shell's Router
 * anyway. This also means MF1 has zero router dependency. See docs/adr/003.
 * Same reasoning for `onNavigate` (prev/next): MF1 asks the Shell to change
 * the URL instead of doing it itself.
 */
export default function PokemonDetailPage() {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();

  if (!name) {
    return <Navigate to="/" replace />;
  }

  return (
    <RemoteBoundary
      label="mf1Detail/PokemonDetail"
      loader={() => import('mf1Detail/PokemonDetail')}
      componentProps={{
        name,
        onNavigate: (nextName: string) =>
          navigate(`/pokemon/${nextName}`, { viewTransition: true }),
      }}
    />
  );
}
