import { Component, Suspense, lazy, useState, type ComponentType } from 'react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  label: string;
  onRetry: () => void;
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
    // Resetting `hasError` alone isn't enough — React.lazy() caches the rejected
    // import() promise on the lazy component reference forever, so it would just
    // throw the same cached rejection again. `onRetry` (bumping a key in the parent)
    // forces a *new* lazy() call, which actually re-attempts the dynamic import.
    this.props.onRetry();
    this.setState({ hasError: false });
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
}

function RemoteComponent<P extends object>({
  loader,
  componentProps,
}: {
  loader: () => Promise<{ default: ComponentType<P> }>;
  componentProps: P;
}) {
  // Lazy initializer form: runs exactly once, on this instance's first render — not on
  // every render, so it's not "creating a component during render" in the way a plain
  // `useMemo(() => lazy(loader), [...])` would be flagged for. A fresh *instance* of
  // this component (forced by the `key` change below) is what produces a fresh lazy().
  const [Remote] = useState(() => lazy(loader));
  return <Remote {...componentProps} />;
}

export default function RemoteBoundary<P extends object>({
  label,
  loader,
  componentProps,
}: RemoteBoundaryProps<P>) {
  const [retryKey, setRetryKey] = useState(0);

  return (
    <RemoteErrorBoundary label={label} onRetry={() => setRetryKey((key) => key + 1)}>
      <Suspense
        fallback={<div className="p-6 text-sm text-muted-foreground">Cargando {label}…</div>}
      >
        {/* Changing `key` unmounts/remounts RemoteComponent, so its useState lazy
            initializer runs again — that's what actually retries the import(). */}
        <RemoteComponent key={retryKey} loader={loader} componentProps={componentProps} />
      </Suspense>
    </RemoteErrorBoundary>
  );
}
