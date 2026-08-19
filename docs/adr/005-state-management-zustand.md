# ADR 005 — State management: Zustand

## Contexto

El README pide elegir un state manager entre Redux, Redux Toolkit o Zustand. El estado global real del reto es acotado: sesión (auth), tema, y el estado del toast en el Shell. MF1 y MF2 no necesitan estado global compartido con el Shell (por [`adr/003`](./003-cross-mfe-communication.md), se comunican vía routing/localStorage/eventos, no store).

## Decisión

**Zustand**, con stores pequeños y separados por dominio dentro del Shell: `useAuthStore`, `useThemeStore`. MF1 y MF2 no necesitan su propio store global — su estado es local a los componentes o vive en TanStack Query / localStorage.

> **Actualización (implementación, Fase 1):** el `useToastStore` previsto originalmente no se necesitó. Al adoptar shadcn/ui ([`adr/012`](./012-ui-components-shadcn.md)) para el toast se usa **Sonner**, que mantiene su propia cola de notificaciones internamente — se invoca imperativamente (`toast(...)`) desde donde haga falta, sin necesidad de un store propio para esa parte del estado.

## Alternativas consideradas

- **Redux Toolkit**: más "enterprise", DevTools potentes, e integración natural con RTK Query si se hubiera elegido esa opción de data fetching. Pero implica más boilerplate (slices, store setup, Provider) para un estado global que en este reto es deliberadamente chico — el costo no se justifica en 2 días.
- **Redux clásico**: descartado directamente — es el más verboso de las 3 opciones y no aporta nada que RTK no dé mejor.

## Consecuencias

- Sin `Provider` — cada store de Zustand se importa y usa directo vía hook (`useAuthStore()`), lo que además evita el problema de "Context no cruza bundles de Module Federation de forma confiable" ya que ni siquiera se necesita Context para esto.
- Al ser stores separados por dominio (no un único store gigante), queda claro en el código qué pertenece a auth, qué a theme y qué a toast — legible para un evaluador que lee rápido.
- Si en algún punto se necesitara compartir un store entre Shell y un MF, la decisión de [`adr/003`](./003-cross-mfe-communication.md) ya establece que no se hace vía Module Federation `shared` — se resolvería con el mismo patrón de `localStorage` + evento, no cambiando esta decisión.
