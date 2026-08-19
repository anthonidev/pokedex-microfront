# ADR 003 — Comunicación entre Shell, MF1 y MF2

## Contexto

Shell, MF1 y MF2 son bundles independientes de Module Federation, potencialmente desplegados y versionados por separado. Necesitan coordinar tres cosas: (1) qué Pokémon mostrar en el detalle, (2) que una visita a un Pokémon se refleje en el historial y dispare el toast, (3) el tema claro/oscuro. No hay backend propio, así que toda la coordinación es client-side.

## Decisión

Tres canales nativos del browser, sin estado de React compartido entre bundles:

1. **Routing** — el Shell pasa `pokemonId`/`name` a MF1 vía **route param** (`/pokemon/:name`).

   > **Actualización (implementación, Fase 3):** MF1 **no** llama `useParams()` internamente. Cada bundle federado trae su propia copia de `react-router-dom` (no está en la lista `shared` de Module Federation) — como React Router funciona con Context de React, dos copias distintas no comparten el mismo Context, así que `useParams()` dentro de MF1 devolvería `undefined` aunque el Shell sí tenga la ruta bien matcheada. Es un problema conocido de microfrontends con router. Se resolvió así: el **Shell** lee el param en `apps/shell/src/pages/PokemonDetailPage.tsx` con su propio `useParams()` y se lo pasa a `<PokemonDetail name={name} />` como **prop simple**. MF1 queda con cero dependencia de `react-router-dom` — más alineado todavía con "MF1 debe ser standalone", y evita compartir esa librería como singleton entre bundles.
2. **`localStorage` + `CustomEvent`** — MF1, al montar, escribe/incrementa la entrada de historial en `localStorage` y dispara `window.dispatchEvent(new CustomEvent('pokemon-visited', { detail: entry }))`. MF2 y el Shell (toast) se suscriben a ese evento con `window.addEventListener`.
3. **`document.documentElement` + `localStorage`** — el tema se aplica como clase CSS en el `<html>`, no vía Context de React. Ver [`adr/004`](./004-styling-tailwind.md) para el detalle de theming.

## Alternativas consideradas

- **Store de Zustand compartido vía Module Federation `shared`**: técnicamente posible (exponer el store como módulo federado), pero acopla la versión y el ciclo de vida de MF1/MF2 al store del Shell — si el Shell cambia la forma del store, rompe los MFs en producción sin que su propio build lo detecte. Contradice el punto de tener microfrontends independientes.
- **Props inyectadas por el host al montar el remote** (el Shell le pasa el objeto Pokémon completo a MF1): funciona, pero MF1 deja de ser standalone — no se podría abrir `localhost:3001` directo y ver un detalle funcional, que es parte de lo que valida que la separación de responsabilidades sea real.
- **`postMessage` entre iframes**: correcto para aislamiento fuerte (CSS/JS realmente separados), pero Module Federation ya comparte el mismo documento/runtime de React — usar `postMessage` encima sería una capa de complejidad no justificada aquí.
- **`BroadcastChannel` en vez de `CustomEvent` + `localStorage`**: cubre mejor el caso multi-pestaña, pero el requisito del reto es persistencia entre recargas (una pestaña), no sincronización realtime entre pestañas — `localStorage` + evento en el mismo `window` es suficiente y más simple.

## Consecuencias

- MF1 y MF2 se pueden desarrollar, testear y demostrar de forma aislada (`pnpm --filter mf1-detail dev` en :3001 funciona solo).
- El "contrato" entre apps es un shape de datos en `localStorage` + el nombre del evento — ambos definidos una sola vez en `packages/shared` para que no diverjan entre apps.
- Si el Shell no está montado (se abre MF1 directo), la visita igual se registra en `localStorage` — el toast simplemente no se dispara porque el Shell no está escuchando, comportamiento aceptable dado que el toast es una feature del Shell, no del dominio de "detalle".
