# ADR 019 — Detalle de Pokémon: layout ancho en desktop

## Contexto

El detalle (MF1) se dejó sin tocar durante el resto de la sesión mientras se pulía el Shell (ver ADR 013). Retomándolo: usaba un layout tipo "tarjeta de teléfono" (`max-w-md mx-auto`) heredado del diseño original, que en pantallas de escritorio deja franjas vacías enormes a los costados — el usuario lo señaló explícitamente ("está como centrado y se tiene mucho espacio en blanco") y compartió 4 referencias visuales, dejando la decisión final abierta.

## Decisión (v2 — revisada tras feedback)

La primera versión de este ADR proponía dos columnas en desktop (ficha sticky a la izquierda, panel de info a la derecha). El usuario probó esa versión y pidió más: seguía sintiéndose con mucho espacio en blanco y quería más protagonismo para el sprite del Pokémon. Se abandonó el esquema de dos columnas por uno de **hero ancho + grilla de info debajo**, un solo árbol de componente (sin duplicar mobile/desktop):

- **Mobile (`<lg`)**: sin cambios — card con degradado por tipo, imagen flotante superpuesta (con `-mt-24`, rompe el borde inferior de la card), tabs Info/Stats/Movimientos (un panel visible a la vez). Ya estaba bien resuelto para esa densidad de pantalla.
- **Desktop (`≥lg`)**: el header con degradado pasa a ocupar el ancho completo (ya no una columna angosta de 360px) y el sprite crece a `size-72` (288px, contra los 160px de mobile) manteniendo el mismo truco de superposición (`-mt-40`) pero a mayor escala — sigue siendo el elemento dominante de la vista, ahora con espacio real para respirar. Debajo, en vez de tabs o de tres cards apiladas verticalmente (que en desktop se sentían igual de vacías, solo que una debajo de la otra), las tres secciones se acomodan en una grilla (`lg:grid-cols-3`): Descripción ocupa 2 columnas, Estadísticas 1, Movimientos las 3 — layout tipo panel de producto, no una lista de cards sueltas.
- Mismo JSX para ambos breakpoints: solo clases responsive de Tailwind (tamaños/paddings/márgenes, `col-span-*`, y el mismo patrón `hidden/flex` por tab que ya se usaba para las secciones en mobile). Evita mantener dos componentes de detalle en paralelo.

## Alternativas consideradas

- **Dos columnas con ficha sticky (v1 de este ADR)**: descartada tras el feedback — dejaba el sprite encerrado en una columna angosta (384px) sin protagonismo, y el panel derecho seguía leyéndose como 3 cajas vacías apiladas en vez de una vista cohesiva.
- **Copiar una referencia literal** (ej. la de Charizard con navbar propia y fondo blanco liso): descartado — rompería la identidad visual ya establecida en el resto de la app (cards con degradado por tipo, tokens de marca Atlantic City de ADR 016). Se tomó la *composición* (imagen grande y protagonista, info organizada alrededor) sin el estilo visual de la referencia.
- **Tabs también en desktop**: descartado — tiene sentido en mobile por espacio vertical/horizontal escaso, pero en desktop esconder información sin necesidad es peor UX que mostrarla toda de una vez.

## Consecuencias

- El sprite ahora "sangra" bastante fuera del header con degradado en desktop (no solo asoma un poco, como en mobile) — es intencional, es el elemento que se pidió que tuviera más protagonismo.
