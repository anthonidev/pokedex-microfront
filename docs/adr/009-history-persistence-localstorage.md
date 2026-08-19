# ADR 009 — Persistencia del historial: localStorage

## Contexto

El README pide una estrategia explícita para el historial de Pokémon visitados: guardar visitas, incrementar contador al abrir el detalle, evitar duplicados, y mantener persistencia entre recargas — y pide que la decisión quede documentada (este archivo cumple ese requisito puntual, además de encajar en el esquema general de ADRs).

## Decisión

`localStorage`, bajo una clave dedicada (ej. `ac-pokemon-history`), con la estructura sugerida por el propio README:

```ts
type HistoryEntry = {
  name: string;
  image: string;
  visits: number;
};
```

Lógica de escritura (vive en `packages/shared`, se invoca desde MF1 al montar el detalle — ver [`adr/003`](./003-cross-mfe-communication.md)):

1. Leer el array actual de `localStorage` (`[]` si no existe).
2. Buscar por `name` (clave natural del dominio — PokeAPI garantiza nombres únicos, es más estable que depender del id numérico si en algún punto se navega por nombre).
3. Si existe → `visits += 1`. Si no existe → push de nueva entrada con `visits: 1`.
4. Guardar el array actualizado.
5. Actualizar también `lastVisited` (para el toast, [`adr/003`](./003-cross-mfe-communication.md)) y disparar `CustomEvent('pokemon-visited')`.

## Alternativas consideradas

- **IndexedDB**: overkill para una lista acotada (Pokémon son ~1300 como techo teórico, en la práctica muchísimos menos por sesión de uso) — API asíncrona más compleja sin beneficio real a este volumen de datos.
- **Estado en memoria (store de Zustand) sin persistencia**: no cumple el requisito explícito de "persistencia obligatoria" del README — se pierde al recargar, que es justamente el caso que el toast necesita detectar.
- **Cookies**: límite de tamaño (~4KB) y overhead de enviarse en cada request HTTP (irrelevante acá porque no hay backend propio) — sin ninguna ventaja sobre `localStorage` para este caso.

## Consecuencias

- El historial es por navegador/dispositivo, no por "usuario" en ningún sentido real — coherente con que el login también es mock ([`adr/008`](./008-auth-strategy-mock.md)).
- Dedupe por `name` significa que si PokeAPI devolviera variantes con el mismo nombre pero distinto id (no ocurre en la práctica), se tratarían como el mismo Pokémon — riesgo aceptado y documentado, no un bug oculto.
- Toda lectura/escritura pasa por un único helper en `packages/shared` (no cada app reimplementa el parseo de `localStorage`) — evita que Shell, MF1 y MF2 diverjan en el shape de datos que leen/escriben.
