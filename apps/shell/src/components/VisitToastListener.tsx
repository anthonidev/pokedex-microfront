import { useEffect } from 'react';
import { toast } from 'sonner';
import {
  dismissReloadToast,
  getLastVisited,
  shouldShowReloadToast,
  subscribeToVisits,
  type HistoryEntry,
} from '@acity/shared';

const TOAST_ID = 'last-visited-pokemon';

function showVisitToast(entry: HistoryEntry) {
  toast('Último Pokémon visitado', {
    id: TOAST_ID,
    description: <span className="capitalize">{entry.name}</span>,
    icon: <img src={entry.image} alt={entry.name} className="size-8 object-contain" />,
    // Stays until the user explicitly closes it — README: "no debe volver a mostrarse
    // hasta que exista una nueva visita", which only makes sense tied to a deliberate close.
    duration: Number.POSITIVE_INFINITY,
    action: {
      label: 'Cerrar',
      onClick: () => {
        dismissReloadToast();
        toast.dismiss(TOAST_ID);
      },
    },
  });
}

/**
 * Renders nothing — just wires the two triggers for the "toast on reload" feature:
 * an immediate toast right after a visit, and the reload check on mount. Lives inside
 * AppLayout (behind ProtectedRoute) since AppLayout stays mounted across in-app
 * navigation, so the reload check only re-runs on an actual page reload.
 */
export default function VisitToastListener() {
  useEffect(() => {
    if (shouldShowReloadToast()) {
      const entry = getLastVisited();
      if (entry) showVisitToast(entry);
    }

    return subscribeToVisits((entry) => showVisitToast(entry));
  }, []);

  return null;
}
