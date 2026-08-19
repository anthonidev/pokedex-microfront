# ADR 012 — Componentes interactivos: shadcn/ui sobre Radix

## Contexto

El Shell necesita un dropdown de usuario (con teclado/foco accesible), un modal fullscreen para el buscador (Fase 2, con focus trap) y un sistema de toasts (con botón cerrar). Construir todo esto a mano con Tailwind puro implica resolver accesibilidad real (aria, foco, teclado) bajo el límite de 2 días — justo lo que pesa en "UX/UI" (20%) y en las recomendaciones del README ("transiciones y animaciones fluidas").

## Decisión

**shadcn/ui** (preset "Nova", base Radix) inicializado **solo en `apps/shell`** — MF1 y MF2 no lo necesitan porque no renderizan dropdown/dialog/toast, solo tarjetas simples.

- `npx shadcn@latest init --template vite --preset nova --base radix --no-monorepo -c apps/shell` (el CLI detecta el monorepo pnpm y exige `-c` para apuntar a un workspace específico).
- Componentes agregados: `button`, `dropdown-menu`, `dialog`, `sonner` (toast), `input`, `label`, `card`.
- Alias `@/*` → `apps/shell/src/*` configurado en `tsconfig.app.json` (`paths`, sin `baseUrl` — deprecado en las versiones actuales de TS, ver más abajo) y en `vite.config.ts` (`resolve.alias`, vía `fileURLToPath(new URL('./src', import.meta.url))`).

## Alternativas consideradas

- **Tailwind puro, componentes propios**: cero dependencias nuevas, pero hay que resolver focus trap del modal, aria del toast y navegación por teclado del dropdown a mano — riesgo alto de dejar huecos de accesibilidad bajo presión de tiempo.

## Gotchas reales encontrados en la implementación

- **El CLI de shadcn no detecta el alias `@/*` en este `vite.config.ts`** (probablemente por convivir con el plugin `federation()` de `@module-federation/vite`, que su analizador estático no reconoce): tanto `add` como `init` escriben los archivos generados en una carpeta literal `./@/...` en vez de `./src/...`, sin importar la sintaxis usada para el alias (se probó `path.resolve(__dirname, ...)` y `fileURLToPath(new URL(...))`, mismo resultado). La resolución real de Vite/TS **sí funciona** correctamente — es solo el CLI el que escribe mal. Workaround aplicado cada vez que se agrega un componente: mover manualmente `./@/components/ui/*.tsx` → `./src/components/ui/`.
- **`components.json` no se genera si no hay alias válido** — hubo que configurar `paths` en `tsconfig.app.json` y `resolve.alias` en `vite.config.ts` *antes* de correr `init`.
- **`sonner.tsx` generado depende de `next-themes`** (`useTheme()`), que asume un `<ThemeProvider>` de contexto de React — contradice la decisión de `docs/adr/003` de resolver el tema vía clase en `<html>` sin Context, para que sea compartible entre bundles federados sin depender de React. Se reemplazó `useTheme()` por `useThemeStore()` (Zustand, `docs/adr/005`) y se quitó `next-themes` de las dependencias.
- **Consolidación de theming**: el `init` generó su propio set completo de tokens (`--background`, `--primary`, `--card`, `--popover`, `--border`, etc., con soporte `.dark`) directamente en `apps/shell/src/index.css`. Para que MF1/MF2 se vean visualmente consistentes con el Shell (principio de `docs/adr/004`), esos tokens se movieron a `packages/shared/src/theme.css`, reemplazando la paleta ad-hoc (`brand-*`, `surface`, `ink`) creada en la Fase 0 — ahora las 3 apps comparten exactamente el mismo sistema de color, aunque solo el Shell use componentes shadcn.
- **`baseUrl` en `tsconfig.app.json`**: TypeScript actual marca `baseUrl` como deprecado (`TS5101`, se retira en TS 7.0). Con `"moduleResolution": "bundler"` no hace falta — `paths` funciona solo, resuelto relativo al propio archivo de tsconfig.

## Consecuencias

- El dropdown de usuario y el futuro modal de búsqueda tienen accesibilidad real (foco, teclado, `Escape`, aria) sin código propio — verificado manualmente (Escape cierra el dropdown, foco visible).
- Sonner reemplaza el "store de Zustand para toast" que preveía inicialmente el roadmap — no hace falta: Sonner mantiene su propia cola de toasts, se invoca imperativamente (`toast(...)`) desde donde se necesite. Ver actualización en `docs/adr/005`.
- Cualquier componente nuevo de shadcn que se agregue más adelante va a requerir el mismo workaround manual de mover archivos de `./@/` a `./src/` — queda documentado acá para no perder tiempo re-diagnosticándolo.
