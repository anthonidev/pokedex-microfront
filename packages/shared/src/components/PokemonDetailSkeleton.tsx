/**
 * Mirrors the detail page's real layout (hero + info grid, see docs/adr/019) so nothing jumps
 * in size once real content lands. Shared between the Shell (as the `RemoteBoundary` Suspense
 * fallback, shown while MF1's own bundle is still downloading) and MF1 itself (shown while its
 * PokeAPI query is pending, once its bundle *has* loaded) — same shape either way, so a user
 * never sees a visible seam between the two loading phases.
 */
export function PokemonDetailSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-5xl animate-pulse flex-col">
      <div className="flex flex-col items-center gap-3 rounded-b-[2.5rem] bg-muted px-6 pt-6 pb-24 lg:rounded-[2rem] lg:pb-40">
        <div className="h-9 w-full" />
        <div className="h-8 w-40 rounded bg-muted-foreground/15 lg:h-11 lg:w-56" />
        <div className="h-5 w-24 rounded-full bg-muted-foreground/15" />
      </div>
      <div className="relative z-10 mx-auto -mt-24 size-40 rounded-full bg-muted-foreground/15 lg:-mt-40 lg:size-64" />
      <div className="mt-4 grid gap-4 px-6 pb-6 lg:grid-cols-3 lg:px-0">
        <div className="h-40 rounded-2xl bg-muted lg:col-span-2" />
        <div className="h-40 rounded-2xl bg-muted lg:col-span-1" />
        <div className="h-20 rounded-2xl bg-muted lg:col-span-3" />
      </div>
    </div>
  );
}
