# Roadmap — Fases de desarrollo

Dimensionado para el límite de **2 días calendario**. Cada fase tiene un checklist accionable — ir tildando durante el desarrollo. Si el tiempo aprieta, las fases 6-8 son las primeras candidatas a recortar (siguen dando funcionalidad completa sin ellas; lo que no se negocia son las fases 0-5, que cubren el 100% de los requisitos funcionales obligatorios del README).

---

## Día 1

### Fase 0 — Bootstrap del monorepo

- [x] `pnpm-workspace.yaml` + `turbo.json` en la raíz.
- [x] `apps/shell`, `apps/mf1-detail`, `apps/mf2-history` — scaffold Vite + React + TS cada uno.
- [x] `packages/shared` — tipos de dominio (`Pokemon`, `PokemonType`, `HistoryEntry`), cliente fetch a PokeAPI, utils de `localStorage` + `CustomEvent`.
- [x] Module Federation wireado mínimo: Shell consume un componente placeholder de MF1 y MF2 (confirma que el pipeline de build/dev funciona antes de construir features encima). Verificado en browser (Playwright): sin errores de consola, dark mode heredado por los remotes.
- [x] oxlint + Prettier + `tsconfig` base compartidos (ver `docs/adr/010`, reemplaza ESLint por vigencia del scaffold actual de Vite).
- [x] Tailwind v4 configurado en las 3 apps con los mismos tokens (colores, dark mode vía clase) desde `packages/shared` (ver `docs/adr/004`).
- [x] `pnpm dev` (vía Turborepo) levanta las 3 apps en paralelo en :3000/:3001/:3002.

### Fase 1 — Shell: core

- [x] Login mock (credenciales fijas `demo@acity.dev` / `demo1234`, mostradas como hint) — sesión persistida vía Zustand `persist` en `localStorage`.
- [x] Rutas protegidas (`ProtectedRoute` + React Router, redirect a `/login` con `state.from` si no hay sesión).
- [x] Layout general + navegación (Home/Historial) + dropdown de usuario (shadcn) con "Cerrar sesión".
- [x] Store Zustand `auth` (sesión) y `theme` (claro/oscuro, delega persistencia a `@acity/shared`).
- [x] Toggle de tema funcional end-to-end — verificado con Playwright, dark mode persiste tras logout (independiente de la sesión).
- [x] Home: 18 filas horizontales por tipo (`docs/adr/011`), `GET /type/{type}` vía TanStack Query, 10 Pokémon por categoría, imágenes derivadas del id sin fetch extra, loading/error por fila.
- [x] shadcn/ui inicializado en el Shell (`docs/adr/012`): dropdown-menu, dialog, sonner, button, input, label, card.

### Fase 2 — Shell: buscador

- [x] Modal fullscreen (shadcn `Dialog` overrideado a `inset-0`/`h-screen`/`w-screen`, foco atrapado + `Escape` vía Radix).
- [x] Listado inicial: `GET /pokemon?limit=30&offset=0`, mismas `PokemonCard` que Home (imagen derivada del id, sin fetch extra).
- [x] Infinite scroll: `useInfiniteQuery` + `IntersectionObserver` propio (`useInfiniteScrollTrigger`), `offset += 30` al llegar al final — verificado cargando 3 páginas seguidas.
- [x] Búsqueda exacta: `GET /pokemon/{name}` — lowercase, debounce de 500ms, sin trim/normalización de acentos (regla del README). 404 → estado "No encontrado" verificado.
- [x] Click en un resultado cierra el modal y navega a `/pokemon/:name` (placeholder de MF1) — verificado con Playwright.

---

## Día 2

### Fase 3 — MF1: Detalle de Pokémon

- [ ] App standalone funcional en :3001 sin depender del Shell corriendo.
- [ ] Fetch por id/nombre: `GET /pokemon/{id|name}`.
- [ ] UI: imagen (preferir `sprites.other['official-artwork'].front_default` o el SVG disponible), nombre, tipos, stats base.
- [ ] Loading/error states (incluyendo Pokémon inexistente).
- [ ] Al montar: registra la visita en `localStorage` (incrementa contador, evita duplicados) y dispara `CustomEvent('pokemon-visited', { detail })`.
- [ ] Wireado como remote consumido por el Shell en la ruta `/pokemon/:name`.

### Fase 4 — MF2: Historial

- [ ] App standalone funcional en :3002 sin depender del Shell corriendo.
- [ ] Lee la lista de visitados desde `localStorage` al montar.
- [ ] UI: imagen, nombre, contador de visitas por Pokémon.
- [ ] Se suscribe a `pokemon-visited` para reflejar visitas nuevas en vivo (sin recargar) si el usuario tiene el historial abierto en otra pestaña/vista.
- [ ] Wireado como remote consumido por el Shell en la ruta `/history`.

### Fase 5 — Toast al recargar

- [ ] Shell se suscribe a `pokemon-visited` para toast inmediato tras una visita.
- [ ] Al montar (recarga de página): si hay `lastVisited` en `localStorage` y no fue "dismisseado" para esa visita → mostrar toast.
- [ ] Botón "Cerrar" → persiste el dismiss (flag ligado al Pokémon/visita actual) para que no reaparezca hasta la próxima visita nueva.

### Fase 6 — Polish

- [ ] Responsive (mobile/tablet/desktop) en las 3 apps.
- [ ] Transiciones: apertura de modal, cambio de tema, toast (entrada/salida).
- [ ] Auditoría de loading/error/empty states — que ninguna pantalla quede en blanco sin feedback.
- [ ] Accesibilidad básica: foco atrapado en modal, `aria-live` en toast, contraste en dark mode.

### Fase 7 — Testing

- [ ] Vitest + RTL configurado en `packages/shared` y en cada app.
- [ ] Test: lógica de historial (incremento, dedupe, persistencia) — la pieza de lógica de negocio más "no trivial" del reto.
- [ ] Test: búsqueda exacta (lowercase, no encontrado).
- [ ] Test: lógica de dismiss del toast (no reaparece hasta nueva visita).
- [ ] 1-2 smoke tests de render por app (Shell/MF1/MF2).

### Fase 8 — Entrega

- [ ] README raíz: instalación, scripts, cómo levantar Shell + MFs (juntos y standalone), decisiones técnicas (enlazando a `docs/adr/`).
- [ ] Repaso final contra los 4 criterios de evaluación del README original (Arquitectura / Funcionalidad / Calidad de código / UX-UI).
- [ ] Opcional (si sobra tiempo): deploy demo (Vercel/Netlify, 3 apps o Shell con MFs embebidos en build).
