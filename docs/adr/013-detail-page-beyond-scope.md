# ADR 013 — Detalle de Pokémon: features más allá del alcance mínimo del README

## Contexto

El README solo exige, para el detalle de Pokémon: imagen, nombre, tipos, stats básicos. Ya cumplido desde la Fase 3. Durante la revisión visual, el usuario aportó referencias de diseño (tarjetas con header de color por tipo, tabs, navegación) y pidió explícitamente ir más allá del mínimo: *"si algo que suma nos aporta y no está en el alcance podemos tomarnos la libertad, tenemos que sobresalir frente al resto"*.

## Decisión

Se suman al detalle (MF1) tres piezas de contenido que el README no pide, todas usando endpoints ya públicos de PokeAPI (nada inventado ni mockeado):

- **Descripción ("Info")**: `GET /pokemon-species/{name}` → `flavor_text_entries`, primero en español si existe, si no en inglés. Limpieza de saltos de línea/form-feed que PokeAPI deja crudos en ese campo.
- **Movimientos**: `pokemon.moves` ya viene en la respuesta de `/pokemon/{name}` (sin fetch adicional) — se muestran los primeros 15 como chips.
- **"Fuerte contra"**: por cada tipo del Pokémon, `GET /type/{type}` trae `damage_relations.double_damage_to` — se combinan (dedupe) los tipos contra los que el Pokémon tiene ventaja. 1-2 requests extra (uno por tipo, típicamente 1 o 2).
- **Navegación prev/next** (`#id - 1` / `#id + 1`) entre Pokémon consecutivos, vía el mismo mecanismo de prop `onNavigate` que ya usa `name` (`docs/adr/003`) — MF1 sigue sin depender de `react-router-dom`.

## Alternativas consideradas

- **Quedarse solo con lo mínimo del README**: es la opción "segura", pero el usuario pidió explícitamente diferenciarse — quedarse corto acá iría en contra de un pedido directo, no de una interpretación libre del alcance.
- **Agregar también acciones decorativas** (favoritos, compartir, "ubicación", comparar — presentes en una de las imágenes de referencia): descartado. Esas acciones no tienen ningún dato ni funcionalidad real detrás en este dominio (un Pokémon no tiene "ubicación") — agregarlas solo para imitar la referencia visual sería UI que aparenta hacer algo y no hace nada, lo cual pesa negativo en una revisión de código senior. Se prefirió sumar solo funciones que **funcionan de verdad** con datos reales.

## Consecuencias

- El detalle de un Pokémon pasa de 1 request (`/pokemon/{name}`) a hasta 4 (`+ /pokemon-species/{name}` + 1-2 `/type/{type}`) — todas vía `useQuery`/`useQueries` independientes, cacheadas, sin bloquear el render principal (el header/imagen/tipos aparecen apenas resuelve la primera).
- Las 3 tabs (Info / Stats / Movimientos) usan un tab-switcher hecho a mano con Tailwind, no un componente de shadcn — MF1 no tiene shadcn instalado (solo el Shell, `docs/adr/012`) y no vale la pena sumarlo para un solo componente.
