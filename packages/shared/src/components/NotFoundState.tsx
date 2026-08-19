interface NotFoundStateProps {
  name: string;
}

/** Shared "No encontrado" state — used by the search modal (Shell) and MF1's detail view. */
export function NotFoundState({ name }: NotFoundStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 p-12 text-center">
      <p className="text-lg font-medium">No encontrado</p>
      <p className="text-sm text-muted-foreground">
        No existe un Pokémon con el nombre "{name}".
      </p>
    </div>
  );
}
