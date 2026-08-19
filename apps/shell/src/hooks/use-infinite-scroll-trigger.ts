import { useEffect, useRef } from 'react';

/**
 * Fires `onIntersect` when the returned ref's element scrolls into view.
 * Used to load the next page of the search modal's list without a scroll listener.
 */
export function useInfiniteScrollTrigger(onIntersect: () => void, enabled: boolean) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  // "Latest ref" pattern: callers pass an inline arrow function (a fresh reference on
  // every render), so the observer's own effect only depends on `enabled` — otherwise
  // it would tear down and recreate the IntersectionObserver on every render, and a
  // freshly-observed element reports its current intersection state immediately,
  // re-triggering `onIntersect` for reasons unrelated to actual scrolling.
  const onIntersectRef = useRef(onIntersect);
  useEffect(() => {
    onIntersectRef.current = onIntersect;
  });

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !enabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onIntersectRef.current();
      },
      { rootMargin: '200px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled]);

  return sentinelRef;
}
