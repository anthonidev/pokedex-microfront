# Atlantic City — Pokédex (Microfrontends)

Solución al reto técnico de Frontend Senior: una Pokédex construida como 3 aplicaciones independientes (Shell + 2 microfrontends) integradas en runtime vía **Module Federation**, consumiendo [PokeAPI](https://pokeapi.co/).

> El enunciado original del reto queda preservado en el historial de git y resumido en [`docs/00-overview.md`](./docs/00-overview.md).

## Stack

- **React 19** + **Vite 8** + **TypeScript** (`strict`) en las 3 apps.
- **Module Federation** (`@module-federation/vite`) para la integración runtime Shell ↔ MF1 ↔ MF2.
- **Tailwind CSS v4** — estilos y theming claro/oscuro.
- **Zustand** — estado de sesión y tema (Shell).
- **TanStack Query** — data fetching contra PokeAPI, un `QueryClient` independiente por app.
- **react-router v7** (data router) — routing del Shell, incluida la [View Transitions API](./docs/adr/018-view-transitions.md) nativa entre rutas.
- **pnpm workspaces + Turborepo** — monorepo.
- **oxlint** — linting.

Cada elección de stack (y por qué, y qué alternativas se descartaron) está documentada en [`docs/adr/`](./docs/adr/).

## Requisitos

- Node ≥ 20
- pnpm ≥ 10 (`corepack enable` si no lo tenés instalado)

## Instalación y arranque

```bash
pnpm install
pnpm dev
```

Esto levanta las 3 apps en paralelo (vía Turborepo):

| App | Rol | URL |
|---|---|---|
| `shell` | Host — login, home, buscador, routing, tema, toast | http://localhost:3000 |
| `mf1-detail` | Remote — detalle de Pokémon | http://localhost:3001 |
| `mf2-history` | Remote — historial de visitados | http://localhost:3002 |

Entrá a **http://localhost:3000**. Login demo (precargado en el formulario):

```
email:    demo@acity.dev
password: demo1234
```

### Levantar un microfrontend solo

MF1 y MF2 no dependen del Shell en ningún punto (sin router propio, sin estado inyectado por props obligatorias) — se pueden levantar y probar aislados:

```bash
pnpm --filter mf1-detail dev   # http://localhost:3001
pnpm --filter mf2-history dev  # http://localhost:3002
```

Cada uno trae su propio `App.tsx` de desarrollo que renderiza el componente expuesto con datos reales de PokeAPI, sin mocks.

## Scripts

Desde la raíz, corren la tarea en las 3 apps (+ `packages/shared`) vía Turborepo:

| Script | Qué hace |
|---|---|
| `pnpm dev` | Levanta Shell + MF1 + MF2 en paralelo |
| `pnpm build` | Build de producción de las 3 apps |
| `pnpm lint` | oxlint en todo el monorepo |
| `pnpm typecheck` | `tsc` en todo el monorepo |
| `pnpm format` | Prettier sobre `ts/tsx/md/json` |

También corren por app individual con `pnpm --filter <app> <script>` (ej. `pnpm --filter shell lint`).

## Estructura del monorepo

```
├── apps/
│   ├── shell/       # :3000 — host: login, home, buscador, routing, tema, toast
│   ├── mf1-detail/  # :3001 — remote: detalle de Pokémon
│   └── mf2-history/ # :3002 — remote: historial de visitados
├── packages/
│   └── shared/      # tipos de Pokemon, cliente PokeAPI, tokens de Tailwind, utils de localStorage/eventos
└── docs/
    ├── architecture.md   # cómo encajan las 3 apps y cómo se comunican
    ├── roadmap.md         # fases de desarrollo, con checklist
    └── adr/                # una decisión técnica por archivo
```

## Arquitectura (resumen)

El Shell es el único **host** de Module Federation; MF1 y MF2 son **remotes** que exponen un componente de entrada cada uno. No hay store compartido en runtime entre bundles federados — la comunicación cross-MFE pasa por dos canales nativos del browser:

- **Routing**: el Shell lee el param de ruta (`/pokemon/:name`) y se lo pasa a MF1 como prop plana — MF1 no tiene dependencia de router.
- **`localStorage` + `CustomEvent('pokemon-visited')`**: MF1 registra la visita y dispara el evento; MF2 lo escucha para refrescar su lista en vivo, y el Shell lo escucha para disparar el toast global.

Detalle completo, diagrama y alternativas descartadas en [`docs/architecture.md`](./docs/architecture.md).

## Decisiones técnicas

Cada decisión no trivial (stack, arquitectura, y las de UI que fueron más allá del mínimo del enunciado) está en `docs/adr/`, formato corto: Contexto → Decisión → Alternativas → Consecuencias.

| ADR | Decisión |
|---|---|
| [001](./docs/adr/001-monorepo-pnpm-turborepo.md) | Monorepo: pnpm workspaces + Turborepo |
| [002](./docs/adr/002-module-federation-vite.md) | Module Federation sobre Vite |
| [003](./docs/adr/003-cross-mfe-communication.md) | Comunicación entre Shell, MF1 y MF2 |
| [004](./docs/adr/004-styling-tailwind.md) | Estilos: Tailwind CSS |
| [005](./docs/adr/005-state-management-zustand.md) | State management: Zustand |
| [006](./docs/adr/006-data-fetching-tanstack-query.md) | Data fetching: TanStack Query |
| [007](./docs/adr/007-typescript.md) | TypeScript en las 3 apps |
| [008](./docs/adr/008-auth-strategy-mock.md) | Estrategia de autenticación: mock local |
| [009](./docs/adr/009-history-persistence-localstorage.md) | Persistencia del historial: localStorage |
| [010](./docs/adr/010-linting-oxlint.md) | Linting: oxlint |
| [011](./docs/adr/011-home-category-rows.md) | Home: filtro de tipo + grilla paginada |
| [012](./docs/adr/012-ui-components-shadcn.md) | Componentes interactivos: shadcn/ui sobre Radix |
| [013](./docs/adr/013-detail-page-beyond-scope.md) | Detalle: features más allá del alcance mínimo |
| [014](./docs/adr/014-animations-framer-motion.md) | Animaciones: framer-motion |
| [015](./docs/adr/015-search-typeahead-and-shortcut.md) | Buscador: sugerencias de tipeo + atajo de teclado |
| [016](./docs/adr/016-full-width-and-brand-color.md) | Layout a ancho completo + color de marca |
| [017](./docs/adr/017-mobile-bottom-nav.md) | Mobile: header simplificado + barra flotante inferior |
| [018](./docs/adr/018-view-transitions.md) | View Transitions API para navegación |
| [019](./docs/adr/019-detail-page-wide-layout.md) | Detalle: layout ancho en desktop |
| [020](./docs/adr/020-stat-radar-chart.md) | Estadísticas como radar hexagonal (SVG a mano) |
| [021](./docs/adr/021-history-ui-actions.md) | Historial: rediseño + acciones de borrado |

El progreso fase a fase (con qué se resolvió y cuándo) está en [`docs/roadmap.md`](./docs/roadmap.md).

## Estrategia de historial

Cada visita al detalle de un Pokémon (MF1) actualiza una entrada en `localStorage` con la forma:

```ts
{ name: string; image: string; visits: number; lastVisitedAt: string }
```

Sin duplicados (se busca por `name` y se incrementa `visits` si ya existe), persistente entre recargas, y notificada en vivo a MF2/Shell vía `CustomEvent('pokemon-visited')`. Detalle en [`docs/adr/009`](./docs/adr/009-history-persistence-localstorage.md).

## Desviaciones conocidas del enunciado

- **Home muestra ~30 Pokémon por categoría con scroll infinito**, no los "10 por categoría" literales del README original. Fue un cambio deliberado (ver [`docs/adr/011`](./docs/adr/011-home-category-rows.md)): la primera versión con 10 en fila generaba scroll horizontal incómodo; se reemplazó por un filtro de tipo + grilla vertical paginada, que da mejor UX sin perder la funcionalidad de "categorías" pedida.

## Estado de testing

Sin cobertura automatizada todavía (`pnpm test` no tiene runner configurado). Si se retoma, la prioridad documentada en el roadmap es: lógica de historial (incremento/dedupe/persistencia), búsqueda exacta por nombre, y lógica de dismiss del toast — la lógica de negocio no trivial del reto, por delante de smoke tests de componentes.
