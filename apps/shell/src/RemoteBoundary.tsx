import { Component, Suspense, type ReactNode } from 'react';

interface Props {
  label: string;
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Isolates a single federated remote: if it fails to load (build not running,
 * port down), the rest of the Shell keeps working — see docs/adr/002.
 */
class RemoteErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive">
          No se pudo cargar el remote <strong>{this.props.label}</strong>. ¿Está corriendo su
          servidor de desarrollo?
        </div>
      );
    }
    return this.props.children;
  }
}

export default function RemoteBoundary({ label, children }: Props) {
  return (
    <RemoteErrorBoundary label={label}>
      <Suspense
        fallback={<div className="p-6 text-sm text-muted-foreground">Cargando {label}…</div>}
      >
        {children}
      </Suspense>
    </RemoteErrorBoundary>
  );
}
