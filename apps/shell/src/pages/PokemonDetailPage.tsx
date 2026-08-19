import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { PokemonDetailSkeleton } from '@acity/shared';
import RemoteBoundary from '@/RemoteBoundary';
import { useDocumentTitle } from '@/hooks/use-document-title';

/**
 * Reads the route param here (in the Shell) and passes it down as a plain prop
 * instead of having MF1 call useParams() itself — MF1 has zero react-router
 * dependency of its own, so it has no Router context to read from anyway.
 * See docs/adr/003. Same reasoning for `onNavigate` (prev/next): MF1 asks the
 * Shell to change the URL instead of doing it itself.
 */
export default function PokemonDetailPage() {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  // Route param only (e.g. "pikachu" -> "Pikachu") — the real display name lives inside
  // MF1's own data fetch, not available here in the Shell.
  useDocumentTitle(name && name.charAt(0).toUpperCase() + name.slice(1));

  if (!name) {
    return <Navigate to="/" replace />;
  }

  return (
    <RemoteBoundary
      label="mf1Detail/PokemonDetail"
      loader={() => import('mf1Detail/PokemonDetail')}
      fallback={<PokemonDetailSkeleton />}
      componentProps={{
        name,
        onNavigate: (nextName: string) =>
          navigate(`/pokemon/${nextName}`, { viewTransition: true }),
      }}
    />
  );
}
