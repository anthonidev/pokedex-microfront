import { useEffect, useRef } from 'react';

/**
 * Fires `onIntersect` when the returned ref's element scrolls into view.
 * Used to load the next page of the search modal's list without a scroll listener.
 */
export function useInfiniteScrollTrigger(onIntersect: () => void, enabled: boolean) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !enabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onIntersect();
      },
      { rootMargin: '200px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [onIntersect, enabled]);

  return sentinelRef;
}
