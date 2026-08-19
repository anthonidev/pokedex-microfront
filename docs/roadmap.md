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
- [x] **Header mobile + barra flotante inferior**: header colapsado en mobile (marca acortada a "Pokédex", sin nav/buscador/email, solo toggle de tema) — nav principal + buscador + usuario se movieron a una pill flotante fija abajo (`MobileBottomNav`), con el ítem activo resaltado en el color de marca, siguiendo la referencia que aportó el usuario. `UserMenu` sumó un modo `iconOnly` para reusarse ahí sin duplicar el dropdown de logout. Ver `docs/adr/017`.
- [x] **Menú de usuario mobile: scroll-lock + toast tapando la barra inferior**: al abrir el dropdown de cuenta desde la pill flotante, la barra de scroll desaparecía y el layout saltaba. Causa: `DropdownMenu` de Radix es `modal` por defecto, lo que bloquea el scroll del body (`react-remove-scroll`) al abrirse — innecesario para un menú liviano que no es un modal a pantalla completa; se corrigió con `modal={false}`. De paso se encontró la causa real de que algunos clicks cerca del borde inferior no llegaran: Sonner fuerza el contenedor de toasts a ancho completo por debajo de 600px, anclado al borde que indique `position` — al no fijarlo, usaba el default `bottom-right`, quedando ancho completo y anclado abajo, justo sobre la pill flotante, interceptando sus clicks. Se fijó `position="top-center"` en el `Toaster`.

**Bug corregido:** `GET /pokemon-species/{name}` devolvía 404 para variantes de forma (ej. `pikachu-libre`, cualquier mega-evolución/forma regional) — ese endpoint usa el nombre de la especie base, no el de la variante. Afectaba la descripción (flavor text) del detalle. Fix: la query de especie ahora usa `pokemon.species.name` (viene en la respuesta de `/pokemon/{name}`, se agregó ese campo al tipo `Pokemon` compartido) en vez del `name` tipeado/de ruta.

Verificado con Playwright en las 3 apps (standalone y federado), light/dark, sin errores de consola. Un bug de layout encontrado y corregido en el momento (badge de tipo tapado por la imagen en el header del detalle).

### Detalle de Pokémon: retomado (post Fase 6, mobile-nav)

- [x] **View Transitions Home → Detalle y prev/next**: `<Link viewTransition>` (grilla) y `navigate(to, { viewTransition: true })` (prev/next) — soporte nativo de react-router v7 sobre `document.startViewTransition`. La imagen del Pokémon comparte `viewTransitionName` entre la card de la grilla y el hero del detalle (mismo nombre por Pokémon), así el navegador interpola su posición/tamaño automáticamente al navegar. Funciona sin cambios especiales cruzando el límite de Module Federation, porque la API opera sobre snapshots del DOM del documento, no del árbol de componentes — MF1 se monta en el mismo `document` que el Shell. Se agregó un prefetch de `mf1Detail/PokemonDetail` al montar Home para que el primer click ya tenga el remoto cargado y la transición no termine mostrando el skeleton de carga. Ver `docs/adr/018`.
- [x] **Layout ancho en desktop**: el detalle usaba `max-w-md mx-auto` (tarjeta de teléfono) incluso en pantallas grandes, dejando franjas vacías enormes — señalado por el usuario, que aportó 4 referencias visuales sin pedir copiar ninguna literal. Un solo árbol de componente: en mobile (`<lg`) se mantiene el diseño de card+tabs ya resuelto; en desktop (`≥lg`) pasa a dos columnas (card sticky con imagen+nav a la izquierda, las tres secciones Descripción/Estadísticas/Movimientos mostradas todas a la vez a la derecha — sin tabs, que ahí ya no se justifican). Ver `docs/adr/019`.
- [x] **La view transition no se notaba**: `document.startViewTransition` nunca se llamaba a pesar de `viewTransition={true}`. Causa: ese mecanismo vive en el "data router" de react-router — `<BrowserRouter>` clásico (lo que usábamos) es una implementación más simple que no pasa por ahí. Fix: migrado a `createBrowserRouter` + `<RouterProvider>` (mismas rutas en JSX, vía `createRoutesFromElements`, sin reescribirlas). Ver adenda en `docs/adr/018`.
- [x] **Layout desktop, segunda vuelta**: la primera versión (dos columnas, ficha sticky angosta) seguía sintiéndose vacía y el sprite no tenía protagonismo. Se reemplazó por un hero a todo el ancho con el sprite mucho más grande (`size-64` vs `size-40` en mobile) rompiendo el borde inferior del degradado, y la info debajo pasó de tres cards apiladas a una grilla (`grid-cols-3`: Descripción 2 columnas, Estadísticas 1, Movimientos las 3) — se corrigió en el camino un bug real donde el sprite tapaba el nombre/badges (el "tirón" negativo hacia arriba superaba el padding disponible). Ver `docs/adr/019` v2.
- [x] **Posición del toast de "último visitado" responsive**: quedó anclado arriba en mobile (evita tapar la barra inferior, ver entrada anterior) pero eso no es necesario en desktop, que no tiene esa barra — ahora usa `bottom-right` (más convencional) desde `sm` en adelante vía un hook `useMediaQuery` chico. No es un requerimiento del README, es una decisión de UI.
- [x] **Estadísticas como radar hexagonal**: reemplazadas las barras horizontales por el clásico gráfico de polígono de 6 ejes (PS/Ataque/Defensa/Velocidad/Def. Esp./At. Esp.), SVG hecho a mano (sin librería de charts, conversado con el usuario primero) coloreado con el tipo primario del Pokémon. Ver `docs/adr/020`.
- [x] **Faltaba el skeleton en la fase de carga del remote**: el skeleton nuevo (entrada anterior) solo cubría la espera de datos de PokeAPI *una vez* que el bundle de MF1 ya había cargado — mientras Module Federation todavía está bajando ese bundle, `RemoteBoundary` mostraba un simple texto ("Cargando mf1Detail/..."). Se movió el skeleton a `packages/shared` (`PokemonDetailSkeleton`) y se usa en ambas fases: como `fallback` de `RemoteBoundary` (Shell, mientras el bundle de MF1 descarga) y dentro de `PokemonDetailContent` (MF1, mientras espera la respuesta de PokeAPI) — mismo componente, sin costura visible entre una fase y la otra. `RemoteBoundary` ahora acepta un `fallback` opcional por ruta (default: el texto genérico, que MF2/Historial sigue usando).

### Historial: rediseño + acciones (post retomada del Detalle)

- [x] **UI alineada al resto de la app + acciones nuevas**: la lista angosta de una columna pasó a una grilla de cards a todo el ancho (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`), mismo lenguaje visual que Home/Detalle. Se agregó: borrar un registro individual (sin confirmación, bajo riesgo), vaciar todo el historial (confirmación inline "¿Vaciar todo? Sí/Cancelar" en vez de un modal — evita sumar una dependencia de diálogo a MF2 solo para esto), y un botón para ir al detalle de cada Pokémon (`onViewDetail` opcional desde el Shell, mismo patrón router-free que MF1 — ver ADR 003). Nuevas `removeHistoryEntry`/`clearHistory` en `packages/shared`. Ver `docs/adr/021`.

### Auditoría completa + bugs corregidos (pre Fase 6-8)

Antes de arrancar el resto del pulido, auditoría contra el README (funcional, arquitectura, calidad de código) y caza de bugs, verificada en vivo con Playwright (no solo lectura estática):

- [x] **Doble navegación al elegir un resultado en el buscador**: `SearchModal` llamaba `navigate()` a mano en el `onClick` que le pasaba a `PokemonGridCard`, pero el `<Link>` interno de la card también navega solo (el `onClick` externo no hacía `preventDefault`) — un solo click empujaba **2 entradas al history**, rompiendo el botón "atrás" (había que pulsarlo dos veces para salir del detalle). Verificado instrumentando `history.pushState`. Fix: el `onClick` que recibe `PokemonGridCard` desde el buscador ahora solo cierra el modal; la navegación la hace el `Link` una sola vez.
- [x] **View transition rota al navegar desde el buscador**: `Unexpected duplicate view-transition-name: pokemon-artwork-bulbasaur` en consola, transición abortada. Causa: la grilla del modal de búsqueda muestra las mismas cards que la grilla de Home, que sigue montada detrás (con su propia animación de cierre) — dos elementos con el mismo `viewTransitionName` simultáneamente. Fix: nueva prop `viewTransition` en `PokemonGridCard` (default `true`), puesta en `false` en los 3 usos dentro de `SearchModal` — la búsqueda ya no intentaba el morph antes de este audit tampoco, así que no es una regresión de UX, solo se resolvió la colisión de raíz.
- [x] **Comentario desactualizado** en `PokemonDetailPage.tsx` (decía que MF1 bundlea su propia copia de react-router-dom — ya no es así, MF1 no tiene la dependencia).
- [~] **Intento de `singleton: true` explícito en Module Federation** (los 3 `vite.config.ts` usan el shorthand `shared: ['react', 'react-dom']`, que implica `singleton: false` — riesgo teórico de "Invalid hook call" si las versiones de React llegaran a divergir entre apps). Se probó la forma objeto con `singleton: true` — rompió el dev server (`@module-federation/vite@1.20.7`, error de Vite `Pre-transform error ... without null bytes` sobre el virtual module de `react-dom`, página en blanco). Revertido: no vale la pena cambiar un dev server que funciona por un hardening de config en una versión de plugin que no lo soporta bien, más aún con las 3 apps ya fijando la misma versión de React (`^19.2.8`). Queda documentado en el propio `vite.config.ts` para no reintentarlo a ciegas.

Hallazgos de la auditoría que quedan pendientes, no bugs: falta el README raíz de entrega (Fase 8, bloqueante real) y la cobertura de tests (Fase 7). También quedó marcado que Home muestra 30 Pokémon por categoría + scroll infinito en vez de los "10" literales del README — decisión ya tomada (ver ADR 011), conviene que el README de entrega la reconozca explícitamente.

### Fase 6 — Polish

- [x] **Responsive (mobile/tablet/desktop)**: revisado con Playwright en mobile (375px), y desktop (1440px), light/dark, en Home/Detalle (tabs Info/Stats)/Historial — sin overflow, sin texto cortado, radar de stats legible en ambos temas.
- [x] Transiciones: modal (zoom+slide), cambio de tema (instantáneo por CSS variables, sin flash), toast (entrada/salida de Sonner) — ya cubiertas por trabajo previo de la sesión (ver ADR 014/018).
- [x] Auditoría de loading/error/empty states — ya cubierta en la auditoría de bugs anterior (skeletons de Shell/MF1/MF2, estados de error en queries, empty state de Historial).
- [x] **Accesibilidad**:
  - Foco atrapado + autofocus en el modal de búsqueda: ✅ ya funcionaba (Radix `FocusScope`).
  - **Bug real encontrado y corregido — Escape no cerraba el modal de búsqueda.** Causa raíz identificada leyendo el código fuente de `@radix-ui/react-dismissable-layer`: su listener de Escape solo se registra si esa capa resuelve como "la más alta" (`isHighestLayer`) en su stack interno — esa condición no se cumplía de forma fiable acá. Se agregó un `onKeyDown` explícito en `SearchModal` que cierra el modal en Escape, sin depender de ese mecanismo interno. Verificado en vivo (abrir → Escape → se cierra).
  - `aria-modal`: esta versión de `@radix-ui/react-dialog` (1.1.23) nunca lo setea (confirmado en su código fuente, no es algo que rompimos) — se agregó explícito en el wrapper `ui/dialog.tsx`.
  - `aria-live` en el toast: ya lo trae Sonner por defecto (`aria-live="polite"` en el contenedor de notificaciones) — sin cambios necesarios.
  - Contraste en dark mode: revisado visualmente en Home/Detalle/Stats/Historial, sin problemas de legibilidad.
- **Hallazgo menor, no corregido (a decisión del usuario)**: el toast de "último visitado" (`bottom-right` en desktop, `duration: Infinity` hasta que se cierra) puede superponerse visualmente con contenido de la esquina inferior derecha de la página (ej. la card de Estadísticas en el detalle, o las últimas cards de la grilla de Home) mientras está abierto. Es el comportamiento estándar de un toast de esquina fija en cualquier app (Gmail, Slack, etc.) — no bloquea funcionalidad, el toast es descartable — pero se documenta como trade-off conocido en vez de corregirse sin consultar, ya que ya se había marcado la posición del toast como una decisión de UI no exigida por el README.

### Fase 7 — Testing

- [x] Vitest + RTL configurado en `packages/shared` y en cada app (`vitest.shared.config.ts` en la raíz, mismo patrón que `vite.shared.config.ts`; `@testing-library/jest-dom/vitest` como `setupFiles` en las 3 apps). Tuvo que agregarse un `src/vitest.d.ts` por app (solo `import '@testing-library/jest-dom/vitest'`) porque `tsconfig.app.json` fija un array `types` explícito que no recogía la ampliación de tipos de los matchers — sin eso, `tsc -b` fallaba con `toBeInTheDocument` inexistente aunque `vitest run` sí pasaba (vitest no type-checka).
- [x] Test: lógica de historial (incremento, dedupe, persistencia, `removeHistoryEntry`, `clearHistory`) — `packages/shared/src/lib/history-storage.test.ts`, 16 tests.
- [x] Test: búsqueda exacta (lowercase, no encontrado) — normalización a lowercase y rechazo en 404 en `packages/shared/src/api/pokeapi.test.ts`; comportamiento end-to-end (incluye mayúsculas y "sin sugerencias → No encontrado") en `apps/shell/src/components/SearchModal.test.tsx`.
- [x] Test: lógica de dismiss del toast (no reaparece hasta nueva visita, incluido el caso borde de revisitar el mismo Pokémon) — `shouldShowReloadToast`/`dismissReloadToast` en `history-storage.test.ts`.
- [x] Smoke tests de render por app: `mf2-history` (`History.test.tsx`, 7 tests — lista/conteo/remove/clear/onViewDetail, sin red porque History es 100% localStorage), `mf1-detail` (`StatRadar.test.tsx` + `PokemonDetail.test.tsx` con fetch mockeado, incluye verificar que la visita se registra en el historial), `shell` (`LoginPage.test.tsx` — credenciales inválidas / login correcto).
- 41 tests en total, 4/4 packages en verde (`pnpm turbo run test typecheck lint` y `pnpm turbo run build`).

### Fase 8 — Entrega

- [x] README raíz: instalación, scripts, cómo levantar Shell + MFs (juntos y standalone), decisiones técnicas (enlazando a `docs/adr/`). Reemplazó al README original del enunciado (preservado en el historial de git) — decisión confirmada con el usuario antes de sobreescribirlo.
- [x] **Repaso final contra los 4 criterios de evaluación**: Arquitectura (30%) y Calidad de código (20%) — cubiertos, ver auditoría de arquitectura de esta sesión (MFs standalone, sin store compartido, `packages/shared` bien acotado, TS `strict` sin `any`). Funcionalidad (30%) — todo lo obligatorio del README cumplido; única desviación (30 vs 10 por categoría en Home) documentada en el README raíz. UX/UI (20%) — tema, transiciones (View Transitions + Framer Motion), responsive y accesibilidad básica auditados en la Fase 6 de arriba. Sin bloqueantes pendientes.
- [~] Opcional: deploy demo. Se decidió Vercel (3 apps son builds estáticos, sin backend propio — Railway/Docker no aportarían nada acá). Repo preparado para el deploy: URLs de los remotes de Module Federation parametrizadas por variable de entorno (`VITE_MF1_ENTRY_URL`/`VITE_MF2_ENTRY_URL` en `apps/shell/vite.config.ts`, con fallback a `localhost` para que `pnpm dev` no necesite nada especial), `vercel.json` por app (rewrite SPA en Shell, CORS en los remotes para que Module Federation pueda cargar su `remoteEntry.js` cross-origin). Pasos del dashboard de Vercel documentados en el README raíz. Falta solo la parte manual (crear los 3 proyectos en Vercel y conectarlos al repo), que le corresponde al usuario.
