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
- `shared: { react, 'react-dom': { singleton: true } }` para evitar múltiples copias de React en runtime (requisito técnico duro de Module Federation con React, no una elección de conveniencia).
- **Versión de React: 19** (última estable), fijada en `packages/shared` como dependencia de workspace única para que las 3 apps resuelvan exactamente la misma versión — indispensable para que `singleton: true` no rompa en runtime.

## Alternativas consideradas

- **`@originjs/vite-plugin-federation`** (elección original de este ADR): descartada en la implementación por estar sin mantenimiento activo desde abril 2025 y no declarar soporte de Vite 8 — ver actualización arriba.
- **Rspack Module Federation puro (sin Vite)**: cambiaría el build tool exigido por el README (que pide Vite explícitamente) — descartado por incumplir el requisito.
- **Iframes o Web Components como aislamiento de MFs**: más simple de razonar, pero no es "Module Federation" — incumple un requisito explícito y obligatorio del README.
- **Monolito con lazy-loaded routes (sin federation real)**: técnicamente más rápido de construir, pero no demuestra la competencia específica que el reto pide evaluar (30% del puntaje es "arquitectura / uso correcto de microfrontends").

## Bug real encontrado y corregido: CSS de los remotes no llegaba al Shell

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

## Consecuencias

- `react`/`react-dom` deben coincidir en versión exacta entre las 3 apps (se fija en `packages/shared` como dependencia compartida a nivel de workspace) para que `singleton: true` no falle en runtime.
- Cada remote debe poder compilarse y servirse de forma independiente (tanto en `vite dev` como en `vite build` + `vite preview`) — se verifica en Fase 3/4 del roadmap levantando cada MF solo.
- El Shell necesita `ErrorBoundary` alrededor de cada remote: si un MF no está disponible (build fallido, puerto caído), el resto de la app no debe romperse.
