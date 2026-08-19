# ADR 019 — Detalle de Pokémon: layout ancho en desktop

## Contexto

El detalle (MF1) se dejó sin tocar durante el resto de la sesión mientras se pulía el Shell (ver ADR 013). Retomándolo: usaba un layout tipo "tarjeta de teléfono" (`max-w-md mx-auto`) heredado del diseño original, que en pantallas de escritorio deja franjas vacías enormes a los costados — el usuario lo señaló explícitamente ("está como centrado y se tiene mucho espacio en blanco") y compartió 4 referencias visuales, dejando la decisión final abierta.

## Decisión

Un solo árbol de componente responsive (sin duplicar mobile/desktop):

- **Mobile (`<lg`)**: se mantiene el diseño actual — card con degradado por tipo, imagen flotante superpuesta, tabs Info/Stats/Movimientos (un panel visible a la vez). Ya estaba bien resuelto para esa densidad de pantalla, no hacía falta tocarlo.
- **Desktop (`≥lg`)**: dos columnas (`lg:grid-cols-[360px_1fr]`), inspirado en la composición de las referencias (ficha con imagen + navegación prev/next a un lado, panel de información al otro):
  - Columna izquierda: la misma card con degradado, pero autocontenida (esquinas redondeadas en las 4 puntas en vez del "bleed" a los bordes de mobile) y `sticky` al hacer scroll.
  - Columna derecha: en vez de tabs, las tres secciones (Descripción/Stats/Movimientos) se muestran simultáneamente como bloques apilados — con espacio de sobra en desktop, ocultar contenido detrás de tabs deja de tener sentido.
- Mismo JSX para ambos breakpoints: solo clases responsive de Tailwind (paddings/márgenes que cambian de "bleed" a "card cerrada", `hidden lg:block` en las secciones que en mobile dependen del tab activo). Evita mantener dos componentes de detalle en paralelo.

## Alternativas consideradas

- **Copiar una referencia literal** (ej. la de Charizard con navbar propia y fondo blanco liso): descartado — rompería la identidad visual ya establecida en el resto de la app (cards con degradado por tipo, tokens de marca Atlantic City de ADR 016). Se tomó la *composición* (dos columnas, ficha + panel de info) sin el estilo visual de la referencia.
- **Tabs también en desktop**: descartado — tiene sentido en mobile por espacio vertical/horizontal escaso, pero en desktop esconder información sin necesidad es peor UX que mostrarla toda de una vez, que es justamente el espacio que sobraba.

## Consecuencias

- El bug conocido de `pokemon-species` devolviendo 404 en variantes de forma (ver nota en `docs/roadmap.md`, aún pendiente) sigue igual — este cambio es solo de layout/presentación, no toca la lógica de datos.
