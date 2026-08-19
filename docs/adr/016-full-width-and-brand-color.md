# ADR 016 — Layout a ancho completo + color de marca real de Atlantic City

## Contexto

El contenido del Shell estaba centrado con `max-w-6xl mx-auto`, dejando franjas vacías grandes en pantallas anchas. El usuario preguntó si convenía usar todo el ancho de la página y pidió revisar el sitio real de la empresa (`casinoatlanticcity.com/apuestas-deportivas`) en busca de ideas de UI aprovechables — es, después de todo, la empresa a la que se postula.

Se navegó esa página con Playwright (captura de pantalla real, no solo el HTML) para sacar referencias visuales concretas.

## Qué se observó en el sitio real

- **Layout a ancho completo**, borde a borde — sidebar de navegación persistente a la izquierda, contenido principal ocupa el resto sin contenedor centrado.
- **Fondo casi negro** con un **verde-menta** como color de marca — sampleado directamente del botón "Iniciar sesión": `rgb(79, 193, 167)` / `#4FC1A7`.
- Header con logo a la izquierda y acciones (Iniciar sesión / Regístrate) a la derecha — ya coincide con el patrón que ya teníamos.

## Decisión

1. **Ancho completo**: `AppLayout` pasó de `max-w-6xl mx-auto` a `w-full` con padding responsivo (`px-4 sm:px-6 lg:px-8`). La grilla de Home/Buscador suma breakpoints `xl:grid-cols-6 2xl:grid-cols-8` para aprovechar el espacio extra en pantallas anchas en vez de dejarlo vacío.
2. **Color de marca**: `--primary` (y `--ring`, `--sidebar-primary`) en `packages/shared/theme.css` pasó del neutro `oklch(0.205 0 0)` (negro/blanco sin matiz, preset "Nova" de shadcn) al verde-menta real de Atlantic City — `oklch(0.7 0.1 172)` en claro, `oklch(0.75 0.13 172)` en oscuro (más luminoso para destacar contra el fondo casi negro). El resto de la paleta neutra (`background`, `card`, `border`, etc.) se mantiene — es un cambio de acento, no un rediseño completo de la paleta.

## Alternativas consideradas

- **Clonar también el sidebar de navegación persistente**: se descartó por alcance — el Home ya tiene su propio patrón de navegación (filtro de tipo + grilla) que funciona bien y fue validado recién; agregar un sidebar completo es un cambio de arquitectura de navegación más grande de lo que se pidió, no una mejora incremental.
- **Mantener el neutro de shadcn "Nova"**: es la opción "segura", pero no aprovecha la oportunidad obvia de alinear visualmente la entrega con la marca real de la empresa evaluadora — se prioriza la señal de "investigamos y nos alineamos a su identidad" sobre la neutralidad genérica.

## Consecuencias

- `--primary` es un **token compartido** (`packages/shared/theme.css`) — el cambio se refleja también en MF1 (los stat bars usan `bg-primary`) sin tocar ningún archivo de esa app. Se avisó explícitamente al usuario antes de aplicar el cambio, ya que había pedido no tocar esa vista todavía.
- `LoginPage` se mantiene centrada (no ancho completo) — es una pantalla de auth aislada, no parte de la navegación principal del Home; centrar el formulario sigue siendo el patrón correcto ahí.
