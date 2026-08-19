import { Component, useEffect, useState, type ComponentType, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  label: string;
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Isolates a single federated remote: if it fails to load (build not running,
 * port down), the rest of the Shell keeps working — see docs/adr/002.
 */
class RemoteErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  retry = () => {
    // A plain in-memory retry (reset `hasError`, re-run the loader) isn't reliable here —
    // @module-federation/vite's runtime caches a failed remoteEntry.js load at the session
    // level and won't re-attempt the network request just because React asks again
    // (verified: the remote coming back up mid-session, then clicking retry, still failed;
    // only a full reload picked it up). A real reload is the one thing guaranteed to work.
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive">
          <p>
            No se pudo cargar el remote <strong>{this.props.label}</strong>. ¿Está corriendo su
            servidor de desarrollo?
          </p>
          <Button variant="outline" size="sm" onClick={this.retry}>
            Reintentar
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

interface RemoteBoundaryProps<P extends object> {
  label: string;
  loader: () => Promise<{ default: ComponentType<P> }>;
  componentProps: P;
  /** Shown while the remote's own bundle is still downloading — a route can pass a skeleton
   * that matches its real content's shape instead of the generic "Cargando…" text, so there's
   * no visible seam between "remote loading" and "remote loaded, data loading" (which the
   * remote renders itself once its code is in). Defaults to the plain text for routes that
   * don't have one yet. */
  fallback?: ReactNode;
}

function RemoteComponent<P extends object>({
  loader,
  componentProps,
  fallback,
}: {
  loader: () => Promise<{ default: ComponentType<P> }>;
  componentProps: P;
  fallback: ReactNode;
}) {
  // Not React.lazy()/Suspense: in production, once Shell and the remote are on separate
  // origins, the federation runtime's own module cache resolves `import(...)` correctly
  // (verified directly — `__mf_module_cache__.remote[...]` holds the real component), but
  // React's lazy()/Suspense pair never notices that resolution and stays suspended forever
  // — no error, just a permanently pending fallback. Driving the same promise through a
  // plain effect sidesteps whatever timing mismatch causes that; only reproduces cross-origin
  // (prod/Vercel), not in local dev where Shell and the remotes share one Vite server.
  const [Remote, setRemote] = useState<ComponentType<P> | null>(null);
  // `loader()` rejecting (remote down, network failure) isn't catchable by
  // RemoteErrorBoundary directly — error boundaries only catch synchronous render errors,
  // not promise rejections from an effect. Stashing it and re-throwing during render is the
  // standard way to hand an async error off to the nearest error boundary.
  const [error, setError] = useState<unknown>(null);
  if (error) throw error;

  useEffect(() => {
    let cancelled = false;
    loader()
      .then((mod) => {
        if (!cancelled) setRemote(() => mod.default);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err);
      });
    return () => {
      cancelled = true;
    };
    // Deliberately not depending on `loader` — callers (e.g. PokemonDetailPage) pass a new
    // inline function every render, and re-running this on every unrelated parent re-render
    // would flash back to the fallback each time. Should run exactly once per mount; "retry"
    // is a full page reload (see RemoteErrorBoundary.retry), not a re-run of this effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!Remote) return <>{fallback}</>;
  return <Remote {...componentProps} />;
}

export default function RemoteBoundary<P extends object>({
  label,
  loader,
  componentProps,
  fallback = <div className="p-6 text-sm text-muted-foreground">Cargando {label}…</div>,
}: RemoteBoundaryProps<P>) {
  return (
    <RemoteErrorBoundary label={label}>
      <RemoteComponent loader={loader} componentProps={componentProps} fallback={fallback} />
    </RemoteErrorBoundary>
  );
}
