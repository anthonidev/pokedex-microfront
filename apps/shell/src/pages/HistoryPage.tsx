import { useNavigate } from 'react-router-dom';
import RemoteBoundary from '@/RemoteBoundary';

/**
 * Same reasoning as PokemonDetailPage: MF2 stays router-free (see docs/adr/003), so "ver
 * detalle" from a history row asks the Shell to navigate instead of importing a router itself.
 */
export default function HistoryPage() {
  const navigate = useNavigate();

  return (
    <RemoteBoundary
      label="mf2History/History"
      loader={() => import('mf2History/History')}
      componentProps={{
        onViewDetail: (name: string) => navigate(`/pokemon/${name}`, { viewTransition: true }),
      }}
    />
  );
}
