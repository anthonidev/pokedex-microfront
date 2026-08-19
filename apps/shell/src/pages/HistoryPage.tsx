import { useNavigate } from 'react-router-dom';
import RemoteBoundary from '@/RemoteBoundary';
import { useDocumentTitle } from '@/hooks/use-document-title';

/**
 * Mirrors History's real grid layout (see docs/adr/021) so there's no jump in shape once MF2's
 * bundle finishes downloading and takes over — same reasoning as PokemonDetailSkeleton for MF1
 * (docs/adr/019). Lives here (not in packages/shared) since, unlike MF1, MF2 has no internal
 * "data pending" state of its own to also cover — `getHistory()` reads localStorage
 * synchronously, there's no async gap once the bundle has loaded.
 */
function HistorySkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-5xl animate-pulse flex-col gap-4 p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-2">
          <div className="h-7 w-28 rounded bg-muted" />
          <div className="h-4 w-36 rounded bg-muted" />
        </div>
        <div className="h-8 w-36 rounded-full bg-muted" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="h-20 rounded-2xl bg-muted" />
        ))}
      </div>
    </div>
  );
}

/**
 * Same reasoning as PokemonDetailPage: MF2 stays router-free (see docs/adr/003), so "ver
 * detalle" from a history row asks the Shell to navigate instead of importing a router itself.
 */
export default function HistoryPage() {
  const navigate = useNavigate();
  useDocumentTitle('Historial');

  return (
    <RemoteBoundary
      label="mf2History/History"
      loader={() => import('mf2History/History')}
      fallback={<HistorySkeleton />}
      componentProps={{
        onViewDetail: (name: string) => navigate(`/pokemon/${name}`, { viewTransition: true }),
      }}
    />
  );
}
