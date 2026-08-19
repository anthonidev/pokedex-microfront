# ADR 018 — View Transitions API para navegación Home → Detalle

## Contexto

El usuario pidió una transición fluida al entrar al detalle de un Pokémon, con una duda explícita: ¿es viable en un esquema de microfrontends, donde MF1 (detalle) se monta como remoto vía Module Federation dentro del Shell?

## Decisión

Sí es viable, y sin trucos especiales. Module Federation no usa iframes: el árbol de React de MF1 se monta en el mismo `document` que el Shell. La View Transitions API nativa (`document.startViewTransition`) opera sobre snapshots del DOM completo, sin importar qué bundle produjo ese DOM — el límite de microfrontend le es invisible.

Implementación:

- react-router v7 (ya en uso) trae soporte de primera clase: `<Link viewTransition>` y `navigate(to, { viewTransition: true })` envuelven la navegación en `document.startViewTransition` automáticamente.
- Activado en el `Link` de `PokemonGridCard` (Home → Detalle) y en el `onNavigate` de `PokemonDetailPage` (prev/next dentro del detalle).
- Para el efecto de "la imagen se mueve" entre la card de la grilla y el hero del detalle: se asigna `viewTransitionName: pokemon-artwork-<name>` (inline style) a la imagen en ambos lugares — mismo nombre en el snapshot viejo y el nuevo hace que el navegador interpole posición/tamaño automáticamente. El nombre se genera por Pokémon (no un valor fijo) para no chocar entre las N cards visibles a la vez en la grilla — cada una necesita un `view-transition-name` único mientras coexisten.
- **Caveat propio de MFE**: si MF1 todavía no fue cargado en la sesión, `import('mf1Detail/PokemonDetail')` es asíncrono — la transición podría capturar el skeleton de carga como snapshot "after" en vez del contenido real. Se mitiga precargando el remoto (mismo `import()`, sin usar el resultado) al montar Home, así el bundle ya está en la caché del runtime de Module Federation para cuando el usuario haga click.

## Alternativas consideradas

- **framer-motion `layoutId`** (ya usado en Home para el indicador de filtro activo): requiere que el elemento compartido siga montado en el mismo árbol de React durante la transición — no funciona bien cruzando un cambio de ruta completo con un `React.lazy`/Suspense de por medio (el componente viejo se desmonta antes de que exista el nuevo). La View Transitions API nativa trabaja a nivel de snapshots del DOM, no de árbol de componentes, así que no le importa el remount.

## Consecuencias

- Sin dependencias nuevas — API nativa del navegador + soporte ya incluido en react-router v7.
- Navegadores sin soporte (Safari < 18, Firefox) ignoran `viewTransition` y navegan normal — degrada con gracia, no rompe nada.

## Adenda: requiere el "data router"

Tras implementar esto, la transición no se notaba en absoluto. Se verificó con un monkey-patch de `document.startViewTransition` (contar invocaciones) que **nunca se estaba llamando** a pesar de `viewTransition={true}` en el `Link`. Inspeccionando el código fuente de `react-router`: el manejo de `viewTransitionOpts` (el `useEffect`/callback que efectivamente llama a `document.startViewTransition`) vive en la implementación del **data router** (`createBrowserRouter` + `<RouterProvider>`) — el `<BrowserRouter>` clásico/declarativo es una implementación más simple (historia + re-render por suscripción) que no pasa por ese mecanismo, aunque el prop `viewTransition` siga existiendo en el tipo de `<Link>` sin importar qué router uses (el tipo no sabe cuál elegiste).

Fix: se migró `App.tsx`/`main.tsx` de `<BrowserRouter><Routes>...</Routes></BrowserRouter>` a `createBrowserRouter(createRoutesFromElements(<Route>...</Route>)) + <RouterProvider>` — mismas rutas declaradas en JSX (sin reescribirlas a objetos), solo cambia cómo se las entrega al router. Verificado con el mismo monkey-patch: la navegación ahora sí invoca `document.startViewTransition` exactamente una vez por click.
