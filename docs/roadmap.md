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

- [x] App standalone funcional en :3001 sin depender del Shell corriendo — verificado con Playwright (Pikachu demo, historial se registra igual).
- [x] Fetch por nombre: `GET /pokemon/{name}` (el Shell pasa `name`, no id — ver `adr/003`).
- [x] UI: imagen SVG sin fondo (`dream_world`, con fallback a PNG), nombre, badges de tipo con color por tipo, stats con barras.
- [x] Loading/error states — "No encontrado" con `retry: false` (ver bug corregido abajo).
- [x] Al montar: registra la visita en `localStorage` (incrementa contador, evita duplicados) y dispara `CustomEvent('pokemon-visited', { detail })` — verificado (visits 1 → 2 tras reload).
- [x] Wireado como remote consumido por el Shell en la ruta `/pokemon/:name` — Shell lee el param y lo pasa como prop (`adr/003`), cada remote con su propio `QueryClientProvider` (`adr/006`).

**Bug encontrado y corregido en esta fase:** sin `retry: false`, TanStack Query reintentaba 3 veces con backoff antes de mostrar "No encontrado" en un 404 (~5-7s de pantalla en blanco). Un 404 de PokeAPI es definitivo, no transitorio — reintentar no tenía sentido. Mismo fix ya aplicado en el `exactQuery` del buscador (Fase 2).

### Fase 4 — MF2: Historial

- [x] App standalone funcional en :3002 sin depender del Shell corriendo — verificado (estado vacío correcto; localStorage es por origen, así que standalone en :3002 nunca comparte historial con :3000/:3001, solo al federarse).
- [x] Lee `getHistory()` de `packages/shared` al montar, ordenado por más reciente primero.
- [x] UI: imagen, nombre, contador de visitas ("1 visita" / "N visitas") — mismo lenguaje visual que MF1 (tokens de `packages/shared/theme.css`).
- [x] Se suscribe a `pokemon-visited` (`subscribeToVisits`) y re-lee el historial completo en cada visita — sin duplicar la lógica de merge/dedupe que ya hace `registerVisit`.
- [x] Wireado como remote consumido por el Shell en la ruta `/history` — verificado con Playwright: visita en `/pokemon/charizard` (Shell+MF1) aparece reflejada en `/history` (Shell+MF2), confirmando que comparten `localStorage` al ejecutar dentro del mismo origen del Shell.

**Bug encontrado y corregido en esta fase:** el CSS propio de MF1/MF2 no llegaba al Shell al federarse — clases como `size-12`/`size-48` no tenían regla CSS en la página (se veían a tamaño natural de imagen). Se detectó inspeccionando estilos computados con Playwright, no por la captura de pantalla (que "se veía bien" por coincidencia de nombres de clase con el Shell). Fix: `@source` de Tailwind v4 en `apps/shell/src/index.css` apuntando al código fuente de MF1/MF2, para que el build del Shell genere el superset completo de clases. Detalle completo en `docs/adr/002`.

### Fase 5 — Toast al recargar

- [x] Shell se suscribe a `pokemon-visited` (`VisitToastListener`, montado en `AppLayout`) para toast inmediato tras una visita — verificado con Playwright (Gengar).
- [x] Al montar (recarga de página): si hay `lastVisited` en `localStorage` y no fue "dismisseado" para esa visita → mostrar toast — verificado (Charizard, reaparece tras reload hasta que se cierra).
- [x] Botón "Cerrar" → persiste el dismiss vía `dismissReloadToast()` y no reaparece tras recargar — verificado. Toast con `duration: Infinity` (solo desaparece por acción explícita del usuario, no por timeout, para que el dismiss-persistente tenga sentido con lo que pide el README).

### Auditoría de código (post Fase 5)

Antes de arrancar Polish, se hizo una auditoría del código de las Fases 0-5 (correctitud, reuso, arquitectura). Un sub-agente de revisión encontró 4 bugs reales, todos corregidos:

- [x] **Conteo de visitas duplicado/perdido** (`PokemonDetailContent.tsx`) — el efecto de `registerVisit` dependía del objeto `pokemon` en vez de `name`, causando doble registro por el double-invoke de StrictMode en dev, y ningún registro al revisitar un Pokémon ya cacheado por TanStack Query. Fix: guard con `useRef` keyeado por `name`. Verificado con Playwright (visita nueva → `visits: 1`; revisita → `visits: 2`).
- [x] **Remote caído rompía la sección para siempre** (`RemoteBoundary.tsx`) — `hasError` nunca se reseteaba y `React.lazy()` cachea la promesa rechazada para siempre. Fix: botón "Reintentar" + `RemoteBoundary` ahora recibe un `loader` y fuerza un `lazy()` nuevo vía remount (`key` + `useState` con inicializador perezoso). Verificado por revisión de código/tipos, no por inyección de fallo real en vivo (matar el server de dev tira abajo todo el grupo de procesos de Turborepo).
- [x] **Requests de scroll infinito de más al tipear** (`use-infinite-scroll-trigger.ts`) — el `IntersectionObserver` se recreaba en cada render por un callback no memoizado. Fix: patrón "latest ref" (con la escritura del ref dentro de un `useEffect`, no durante el render, para no romper la regla `react/refs` del linter).
- [x] **Buscador sin loading state inicial** (`SearchModal.tsx`) — la grilla quedaba vacía hasta que llegaban los primeros 30 resultados. Fix: skeleton mientras `listQuery.isPending`.

Mejoras de reuso aplicadas: `NotFoundState` extraído a `packages/shared` (estaba duplicado entre Shell y MF1), accessor seguro `getPokemonTypeColor` (sin cast `as PokemonType`), y config de build de Vite extraída a `vite.shared.config.ts` (evita repetirla en los 3 `vite.config.ts`).

### Rediseño visual (post Fase 5, antes de Polish)

El usuario revisó la app corriendo y pidió mejoras concretas de UI/UX antes de seguir con Polish/Testing/Entrega:

- [x] **Login**: react-hook-form + zod (validación de formato), toggle mostrar/ocultar contraseña, credenciales demo precargadas, rediseño visual (badge, glow, animación de entrada). Ver `docs/adr/008`.
- [x] **Home**: reemplazadas las 18 filas horizontales por un filtro de tipo (chips) + una sola grilla con scroll infinito — resuelve el scroll horizontal molesto que señaló el usuario. Cards con gradiente de color por tipo y numeración `#NNN` (referencia visual del usuario). Ver `docs/adr/011` (actualizado, supersede la decisión original de Fase 1).
- [x] **Detalle (MF1)**: header con gradiente por tipo, navegación prev/next entre Pokémon consecutivos, tabs Info/Stats/Movimientos, sección "Fuerte contra" (type-effectiveness real de PokeAPI), descripción (flavor text). Deliberadamente por fuera del alcance mínimo del README, a pedido explícito del usuario — sin agregar botones decorativos sin función real. Ver `docs/adr/013` (nuevo).
- [x] **Home (ajustes finos)**: la barra de filtros pasó de scrollbar visible a botones laterales (aparecen solo si hay más para ver en esa dirección); hover de las cards con framer-motion (spring) en vez de CSS lineal, se sentía brusco; chip activo del filtro con indicador deslizante (`layoutId`). Ver `docs/adr/014`.
- [x] **Buscador**: sugerencias de tipeo en vivo sobre la lista completa de nombres (client-side, sin red por letra) — "pika" ahora sugiere Pikachu y sus variantes, sin tocar el requisito de exact-match del README. Mismo estilo visual que el Home (se unificó todo en `PokemonGridCard`, se borró el `PokemonCard` viejo). Atajo `⌘K`/`Ctrl+K` para abrir el buscador desde cualquier pantalla. Ver `docs/adr/015`.
- [x] **Ancho completo + color de marca real**: se relevó `casinoatlanticcity.com/apuestas-deportivas` (captura real vía Playwright) — layout borde a borde y verde-menta `#4FC1A7` como color de marca. `AppLayout` pasó a `w-full`, grilla con más columnas en pantallas anchas (`xl`/`2xl`), y `--primary` del tema compartido pasó del neutro de shadcn al verde real de Atlantic City. Ver `docs/adr/016`.
- [x] **Ajustes finos de feedback del usuario tras probar la app**:
  - Apertura del buscador se sentía brusca — la animación base de shadcn (`zoom-in-95`) está pensada para un diálogo chico centrado; aplicada a un panel a pantalla completa, un 5% de escala son decenas de píxeles de salto. Se neutralizó el zoom (`zoom-in-100`) y se reemplazó por un fade + slide sutil (`slide-in-from-top-2`, `duration-200`).
  - El chip "Todos" del filtro perdía el texto en modo oscuro — usaba `var(--foreground)` como fondo (que se vuelve casi blanco en oscuro) con texto forzado a blanco. Se cambió a las clases `bg-foreground`/`text-background`, que por construcción siempre contrastan correctamente en cualquier tema.
  - El input del buscador tenía el texto pegado al borde y el botón de cerrar del modal se solapaba con el propio input (el input llegaba hasta 1rem del borde, el botón ocupa de 0.5rem a 2.25rem) — se agregó `pr-14` al contenedor del input y `px-1` al input mismo.
  - Tipografía de las cards: se sumó una segunda fuente (Space Grotesk Variable, vía `@fontsource-variable/space-grotesk`) como `--font-heading`, separada de la fuente de cuerpo (Geist) — usada en el nombre de cada card (más grande, `tracking-tight`) y en el título del header, para dar jerarquía tipográfica real en vez de todo con la misma fuente.

**Bug encontrado (no corregido a pedido explícito — "esa página todavía dejala"):** `GET /pokemon-species/{name}` devuelve 404 para variantes de forma (ej. `pikachu-libre`, cualquier mega-evolución/forma regional) — ese endpoint usa el nombre de la especie base, no el de la variante. Afecta la descripción (flavor text) del detalle. Pendiente para cuando se retome esa vista: usar `pokemon.species.name` (viene en la respuesta de `/pokemon/{name}`) en vez del `name` tipeado/de ruta.

Verificado con Playwright en las 3 apps (standalone y federado), light/dark, sin errores de consola. Un bug de layout encontrado y corregido en el momento (badge de tipo tapado por la imagen en el header del detalle).

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
