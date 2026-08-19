import { useEffect } from 'react';

const BASE_TITLE = 'Atlantic City · Pokédex';

/** Sets `document.title` for the current route, restoring the base title on unmount so
 * navigating away (or an error boundary swapping the page) doesn't leave a stale title. */
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${BASE_TITLE}` : BASE_TITLE;
    return () => {
      document.title = BASE_TITLE;
    };
  }, [title]);
}
