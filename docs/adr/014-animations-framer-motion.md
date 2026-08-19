# ADR 014 — Animaciones: framer-motion (solo Shell, solo donde suma)

## Contexto

El README valora "transiciones y animaciones fluidas" en sus recomendaciones. Las transiciones CSS que ya existían (`transition-colors`, `transition-transform`) alcanzan para casos simples, pero el hover de las cards del Home se sentía brusco (ease lineal, sin sensación de "peso"), y no hay forma limpia en CSS puro de animar un indicador que se desliza entre elementos de ancho variable (el pill del filtro activo).

## Decisión

**framer-motion**, usado puntualmente en 2 lugares del Home — no se adoptó como reemplazo general de las transiciones CSS existentes (dark mode, dropdown, dialog siguen con CSS/Radix, que ya animan bien):

- **`PokemonGridCard`**: hover/tap con física de resorte (`whileHover`, `whileTap`, `transition: { type: 'spring', stiffness: 350, damping: 28 }`) en vez de `transition-transform` con ease lineal — se siente con más "peso" y menos abrupto. También entrada suave (`initial`/`animate`, fade + slide de 10px) cuando cada card termina de cargar su detalle.
- **`TypeFilterBar`**: el chip de tipo activo usa `layoutId` compartido (`motion.span`) — al cambiar de filtro, el fondo de color se desliza de un chip al otro en vez de aparecer/desaparecer de golpe.

## Alternativas consideradas

- **Solo CSS (`transition`/`@keyframes`)**: suficiente para fades y color, pero animar un elemento que cambia de posición/ancho entre dos elementos hermanos (el pill del filtro) requiere medir posiciones a mano — exactamente el problema que `layoutId` de framer-motion resuelve de fábrica.
- **Adoptar framer-motion en todas partes** (reemplazar Radix/`tw-animate-css` también): descartado — Radix ya anima bien sus propios primitivos (dropdown, dialog) vía atributos `data-state`, y duplicar esa animación con una librería externa sería trabajo sin beneficio.

## Consecuencias

- Solo `apps/shell` depende de `framer-motion` — MF1/MF2 no lo necesitan.
- Las animaciones son deliberadamente sutiles (springs con `stiffness`/`damping` moderados, desplazamientos de pocos píxeles) — se prioriza que "se sienta mejor", no un efecto vistoso que distraiga.
