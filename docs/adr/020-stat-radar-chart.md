# ADR 020 — Estadísticas como radar hexagonal (SVG a mano)

## Contexto

Las 6 estadísticas base (PS, Ataque, Defensa, Velocidad, Ataque/Defensa especiales) se mostraban como barras horizontales. El usuario pidió el clásico gráfico de polígono/hexágono ("radar chart") que usan la mayoría de las Pokédex.

## Decisión

SVG hecho a mano (`apps/mf1-detail/src/StatRadar.tsx`), sin librería de charts:

- 6 ejes en el orden clásico de Pokédex, en sentido horario desde arriba: PS, Ataque, Defensa, Velocidad, Def. Esp., At. Esp.
- Escala fija a un máximo de 150 (no relativa por Pokémon) — así los polígonos son comparables entre Pokémon; algunos outliers raros (ej. PS 255 de Blissey) simplemente tocan el borde exterior.
- Grilla de fondo (4 niveles concéntricos) + polígono de datos relleno con el color del tipo primario (`getPokemonTypeColor`), coherente con el resto de la app (cards y header con degradado por tipo).
- Etiquetas ancladas dinámicamente (`start`/`middle`/`end` según el lado del hexágono) en vez de centradas parejo — se leen mejor y no se amontonan contra el gráfico.
- Debajo del SVG, una grilla de valores numéricos (no solo visual) para no perder legibilidad exacta — el gráfico es un complemento, no reemplaza el dato preciso.

## Alternativas consideradas

- **Librería de charts (recharts/visx)**: se conversó explícitamente con el usuario antes de implementar. Se descartó para un solo gráfico estático de 6 ejes fijos — es una dependencia nueva grande (varias decenas de KB) solo para evitar ~100 líneas de trigonometría básica, y un SVG propio da control total sobre el tema (colores por tipo, dark mode, breakpoints) sin pelear contra los defaults de la librería. Quedó explícitamente abierto: "si se complica, instalamos una librería" — no hizo falta.

## Consecuencias

- Sin dependencias nuevas.
- El componente es puramente presentacional (recibe `stats` + `primaryType`), fácil de testear con datos fijos si se llega a la Fase 7 (testing).
