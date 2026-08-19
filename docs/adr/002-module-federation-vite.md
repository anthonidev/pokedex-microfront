# ADR 002 — Module Federation sobre Vite

## Contexto

El README exige explícitamente React ≥16, Vite y Module Federation, con 3 puertos fijos (3000/3001/3002) y un Shell (host) que consume dos remotes (MF1 detalle, MF2 historial).

## Decisión

> **Actualización (implementación, Fase 0):** al scaffoldear el proyecto, `pnpm create vite` instaló Vite 8. Se verificó contra npm que `@originjs/vite-plugin-federation` no tiene publicación desde abril 2025 y no declara soporte de Vite 8, mientras que `@module-federation/vite` (paquete activo del mismo equipo de Module Federation, con soporte para Webpack/Rspack/Vite) se actualizó hace días y declara soporte explícito `vite ^5 || ^6 || ^7 || ^8`. Se usa **`@module-federation/vite`** en su lugar — misma decisión arquitectónica (Module Federation sobre Vite), distinto paquete por vigencia real de mantenimiento.

Usar **`@module-federation/vite`** para implementar Module Federation sobre Vite:

- **Shell** (`apps/shell`): `federation({ name: 'shell', remotes: { mf1Detail: { type: 'module', name: 'mf1Detail', entry: 'http://localhost:3001/remoteEntry.js' }, mf2History: { ... } } })`.
- **MF1** (`apps/mf1-detail`): `federation({ name: 'mf1Detail', filename: 'remoteEntry.js', exposes: { './PokemonDetail': './src/PokemonDetail.tsx' } })`.
- **MF2** (`apps/mf2-history`): análogo, expone `./History`.
- Shell consume ambos remotes con `React.lazy(() => import('mf1Detail/PokemonDetail'))` dentro de las rutas correspondientes, envuelto en `Suspense` + `ErrorBoundary`.
- Las 3 apps corren con `vite dev` normal (con HMR) tanto en Shell como en los remotes — a diferencia de `@originjs/vite-plugin-federation` (que sí requería `build --watch` + `preview` porque el `remoteEntry.js` solo se generaba en build de producción), `@module-federation/vite` sirve el manifest/remote entry también en modo `serve`. Cada remote fija `server.origin: 'http://localhost:<puerto>'` para que las URLs generadas apunten al dev server correcto.
- **Versión de React: 19** (última estable), fijada en `packages/shared` como dependencia de workspace única para que las 3 apps resuelvan exactamente la misma versión.
- `shared: ['react', 'react-dom']` (forma corta, `singleton: false` implícito) en las 3 apps. Se probó la forma objeto con `singleton: true` explícito dos veces en esta sesión, por dos motivos distintos, y las dos veces se descartó — ver "Bugs reales encontrados y corregidos" abajo: rompía el dev server de `@module-federation/vite@1.20.7`, y cuando se lo hizo build-only (para no tocar dev) tampoco resultó ser la causa del bug real de producción, así que no se volvió a intentar.

## Alternativas consideradas

- **`@originjs/vite-plugin-federation`** (elección original de este ADR): descartada en la implementación por estar sin mantenimiento activo desde abril 2025 y no declarar soporte de Vite 8 — ver actualización arriba.
- **Rspack Module Federation puro (sin Vite)**: cambiaría el build tool exigido por el README (que pide Vite explícitamente) — descartado por incumplir el requisito.
- **Iframes o Web Components como aislamiento de MFs**: más simple de razonar, pero no es "Module Federation" — incumple un requisito explícito y obligatorio del README.
- **Monolito con lazy-loaded routes (sin federation real)**: técnicamente más rápido de construir, pero no demuestra la competencia específica que el reto pide evaluar (30% del puntaje es "arquitectura / uso correcto de microfrontends").

## Bugs reales encontrados y corregidos

### CSS de los remotes no llegaba al Shell

> **Actualización (implementación, Fase 4):** al verificar visualmente el historial (MF2) con Playwright, las imágenes se veían a tamaño natural (~360px) en vez del tamaño fijado por Tailwind (`size-12` → 3rem). Investigando: `document.styleSheets` en el Shell solo mostraba las hojas de estilo del propio Shell — el CSS compilado de MF1/MF2 **nunca se estaba inyectando** al federarse. Lo que parecía "andar bien" en capturas anteriores (bordes, `bg-card`, `rounded-lg`, etc.) era pura coincidencia: el Shell define esas mismas clases de Tailwind en su propio bundle (por compartir tokens vía `packages/shared/theme.css`), así que cualquier clase que **no** coincidiera por nombre exacto con algo ya usado en el Shell (como `size-12`, `size-48`, específicos de MF1/MF2) simplemente no tenía regla CSS en la página.
>
> **Causa:** `@module-federation/vite` tiene la opción `bundleAllCSS` (default `false`) que en teoría resuelve justo esto — se probó `bundleAllCSS: true` tanto en los remotes como en el host, con limpieza total de caché (`node_modules/.vite`, `.mf`) entre cada intento, y **no tuvo efecto en modo `vite dev`** (sí podría funcionar en un build de producción, pero no se depende de eso — ver fix).
>
> **Fix aplicado:** en vez de depender de que Module Federation propague el CSS del remote, se usa el directive `@source` de Tailwind v4 (pensado para monorepos) en `apps/shell/src/index.css`:
> ```css
> @source '../../mf1-detail/src';
> @source '../../mf2-history/src';
> ```
> Esto hace que el build de Tailwind del **Shell** escanee también el código fuente de MF1 y MF2, generando un superset de todas las clases que cualquier remote podría usar — sin importar si el CSS del remote llega o no al documento. Es más robusto que depender del comportamiento de un plugin de terceros en modo dev, y funciona igual en dev y en build. Se dejó `bundleAllCSS: true` en las 3 apps como defensa adicional (no molesta, y podría ayudar en producción), pero el fix real es el `@source`.
>
> Verificado con Playwright inspeccionando estilos computados (no solo la captura de pantalla): `getComputedStyle(img).width` pasó de `362px` (tamaño natural de la imagen, sin CSS aplicado) a `192px` (`size-48` = 12rem) como se esperaba.
>
> **Lección:** verificar estilos federados por *inspección de estilos computados*, no por si la captura de pantalla "se ve bien" — clases con nombres coincidentes entre apps (`bg-card`, `border-border`, etc., ya usadas en el Shell por compartir tokens) pueden ocultar por completo este tipo de bug.

### El detalle y el historial no cargaban en producción (funcionaba perfecto en dev)

> **Actualización (post-deploy a Vercel):** con las 3 apps ya deployadas (Fase 8, deploy demo) y las variables de entorno de los remotes bien configuradas, el usuario reportó que `/pokemon/:name` y `/history` se quedaban vacíos. Verificado que no era un problema de deploy: las 3 URLs eran correctas, CORS estaba bien (`access-control-allow-origin: *`), y las URLs de los remotes estaban bien horneadas en el build del Shell (`grep` sobre el bundle deployado las mostró correctas).
>
> **Reproducido localmente** sirviendo los 3 builds de producción con `vite preview` en sus propios puertos (Shell:3000, MF1:3001, MF2:3002 — orígenes distintos entre sí, igual que en Vercel) — algo que nunca se había probado en toda la sesión, porque `pnpm dev` (con todo en el mismo servidor Vite) **enmascaraba el bug por completo**: nunca se manifestaba en dev, solo cruzando orígenes reales en un build de producción.
>
> **Diagnóstico** (con `page.evaluate` para inspeccionar el fiber tree de React directamente, ya que no había ningún error en consola): el módulo remoto SÍ se resolvía correctamente a nivel del runtime de Module Federation (`window.__mf_module_cache__.remote[...]` tenía el componente real, una función válida) — pero el `<Suspense>` de React seguía mostrando el fallback **para siempre**, con el fiber del boundary (`tag: 13`, `SuspenseComponent`) atascado en estado suspendido. `React.lazy()` nunca se enteraba de que la promesa ya se había resuelto del lado del runtime de federación — sin lanzar ningún error, sin reintentar, sin nada. Se descartó que fuera el clásico problema de "dos copias de React" (`shared` sin `singleton: true`): se probó explícitamente con `singleton: true` (build-only, condicionado a `command === 'build'` para no romper otra vez el dev server — ver más abajo) y el bug persistía idéntico; y también se confirmó que **sin** `singleton: true` pero con el fix real (ver abajo) todo funcionaba perfecto — así que el singleton nunca fue la causa.
>
> **Fix real:** en `apps/shell/src/RemoteBoundary.tsx`, se reemplazó el mecanismo `React.lazy(loader)` + `<Suspense>` por un `useEffect` manual que llama `loader().then(...)` y guarda el componente resuelto en `useState` — mismo resultado final, pero sin depender del protocolo especial de "lanzar la promesa durante el render" que `lazy`/`Suspense` usan internamente, que es exactamente lo que no se estaba destrabando con el runtime de `@module-federation/vite@1.20.7` en producción cross-origin. Verificado con las 3 apps servidas en puertos separados vía `vite preview`: `pokemon/pikachu` y `/history` cargan sus datos reales (llamadas a PokeAPI incluidas) sin ningún error.
>
> **Efecto colateral corregido en el mismo cambio:** como los boundaries de error de React (`RemoteErrorBoundary`) solo atrapan errores síncronos de render, no rejections de promesas dentro de un efecto, el nuevo `useEffect` necesitó un `.catch()` explícito que guarda el error y lo vuelve a lanzar durante el render (`if (error) throw error`) para que el error boundary lo siga atrapando igual que antes.
>
> **Segundo hallazgo, en el botón "Reintentar" del error boundary:** con MF1 caído a propósito (para probar el estado de error), se confirmó que el boundary de error se mostraba bien — pero al levantar MF1 de nuevo y apretar "Reintentar" (que antes solo reseteaba estado de React), seguía fallando: el runtime de Module Federation cachea el fallo de carga del `remoteEntry.js` a nivel de sesión del browser y no vuelve a intentar la request de red solo porque React se lo pida de nuevo. Un `reload()` completo de la página sí funciona siempre. Se simplificó `retry` para que haga `window.location.reload()` directamente, en vez de mantener el mecanismo de re-render vía `key` (que ya no servía para nada).
>
> **Por qué el `singleton: true` (build-only) no fue la causa, pero sí rompió el dev server:** se probó también, por las dudas, aplicar `shared: { react: { singleton: true, ... }, 'react-dom': { singleton: true, ... } }` únicamente para `vite build` (con `defineConfig(({ command }) => ...)`, dejando `vite dev` con la forma corta) — el *build* sí compilaba bien con esa forma (a diferencia de un intento anterior en modo dev, que rompía con `Pre-transform error` — ver `docs/roadmap.md`), pero el bug de producción seguía exactamente igual. Se descartó por completo: no aporta nada sobre el fix real, y agrega una rama de configuración condicional innecesaria.
>
> **Lección:** un bug de Module Federation en producción puede ser 100% invisible en `pnpm dev` si todas las apps comparten el mismo servidor de desarrollo — el único test que lo reprodujo fue servir los 3 builds reales en orígenes separados (`vite preview`, mismo patrón que Vercel) *antes* de gastar un ciclo de deploy para descubrirlo.

## Consecuencias

- `react`/`react-dom` deben coincidir en versión exacta entre las 3 apps (se fija en `packages/shared` como dependencia compartida a nivel de workspace).
- Cada remote debe poder compilarse y servirse de forma independiente (tanto en `vite dev` como en `vite build` + `vite preview`) — se verifica en Fase 3/4 del roadmap levantando cada MF solo.
- El Shell necesita `ErrorBoundary` alrededor de cada remote: si un MF no está disponible (build fallido, puerto caído), el resto de la app no debe romperse.
