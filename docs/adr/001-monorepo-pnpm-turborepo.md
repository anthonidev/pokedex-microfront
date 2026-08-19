# ADR 001 — Monorepo: pnpm workspaces + Turborepo

## Contexto

El reto exige 3 aplicaciones independientes (Shell + 2 MFs) que deben poder desarrollarse y levantarse juntas, y que además comparten tipos/utilidades (contrato de Pokémon, cliente de PokeAPI, tokens de theme). Con 2 días de plazo, el tooling de orquestación no puede sumar fricción.

## Decisión

**pnpm workspaces** como base (instalación única, linking eficiente entre `apps/*` y `packages/shared`) + **Turborepo** encima para orquestar tasks (`dev`, `build`, `lint`, `test`) en paralelo con caché local.

## Alternativas consideradas

- **npm workspaces sin Turborepo**: cero dependencias extra, pero instalación más lenta y sin caché de tasks — cada `build`/`lint` se re-ejecuta completo aunque solo se haya tocado un paquete.
- **Nx**: soporte "nativo" de Module Federation vía generadores propios, pero esos generadores abstraen justamente la parte que el reto evalúa (armar Module Federation a mano y que se note en el código). Curva de setup más alta, mayor riesgo de perder horas configurando en vez de construyendo features.
- **Carpetas sueltas sin workspace**: cada app con su propio `node_modules`, orquestadas con `concurrently` desde la raíz. Funciona, pero no hay forma limpia de compartir `packages/shared` sin publicarlo o duplicar código.

## Consecuencias

- Un solo `pnpm install` en la raíz instala todo.
- `turbo dev` levanta Shell + MF1 + MF2 en paralelo con output diferenciado por proceso.
- `turbo build`/`turbo lint` solo re-ejecutan lo afectado (caché local) — relevante iterando rápido bajo el límite de 2 días.
- `turbo.json` es config mínima (4-5 tasks), no genera código ni impone estructura — no interfiere con el setup manual de Module Federation, que queda 100% legible en cada `vite.config.ts`.
