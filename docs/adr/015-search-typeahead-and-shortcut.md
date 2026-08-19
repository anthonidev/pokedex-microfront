# ADR 015 — Buscador: sugerencias de tipeo + atajo de teclado (sin tocar exact-match)

## Contexto

El README exige búsqueda **exact match** (lowercase, sin fragmento) — `GET /pokemon/{name}`, "Si existe → mostrar solo ese Pokémon. Si no existe → 'No encontrado'". Esto ya estaba bien implementado (Fase 2), pero en la revisión visual el usuario notó el problema real de UX que esa regla implica: escribir "pika" no devuelve nada, hay que saber el nombre completo de memoria.

## Decisión

**No se toca el requisito de exact-match** — sigue siendo lo que determina el resultado "oficial" (`getPokemonByName`, `retry: false`, muestra un solo resultado o "No encontrado"). Se agrega **una capa de UX encima**, no un reemplazo:

- `getAllPokemonNames()` (nuevo, `packages/shared`) trae **todos** los nombres de PokeAPI en un solo request (`?limit=100000`, no es paginación real) — se pide una vez por apertura del modal y se cachea indefinidamente (`staleTime: Infinity`).
- Mientras el usuario escribe, se filtra ese array **en el cliente** por substring (sin red, instantáneo) y se muestran como sugerencias clickeables — con las mismas cards que el resto de la app.
- Si el término tipeado coincide exacto → se muestra igual el resultado único (comportamiento README intacto, las sugerencias ni se renderizan en ese caso).
- Si no hay exact-match **ni** sugerencias → "No encontrado".

**Atajo de teclado:** `⌘K` (Mac) / `Ctrl+K` (resto) abre el buscador desde cualquier pantalla — `apps/shell/src/hooks/use-search-shortcut.ts`, un listener global de `keydown` en `AppLayout`. El botón del header ahora muestra el atajo (`kbd` con el símbolo correcto según plataforma) para que se descubra solo.

## Alternativas consideradas

- **Cambiar el buscador a fragment-search real** (que "pika" devuelva Pikachu como resultado "encontrado"): descartado de plano — el README es explícito y esto es un criterio de evaluación puntual ("Exact Match... No es búsqueda por fragmento"). Cambiarlo sería incumplir el enunciado, no una mejora de UX.
- **Sugerencias vía red por cada letra** (debounced `/pokemon?...` con algún filtro): PokeAPI no soporta filtrado por nombre en el listado, así que esto hubiera requerido traer igual la lista completa una vez y filtrar en cliente — se optó directamente por eso desde el principio, sin la vuelta de un endpoint que no existe.

## Consecuencias

- Un request adicional (~50-80KB) la primera vez que se abre el buscador en la sesión — cacheado después, cero costo en aperturas siguientes.
- `PokemonCard.tsx` (la versión liviana sin fetch por card) quedó sin uso una vez que el buscador también pasó a `PokemonGridCard` (mismo lenguaje visual que el Home, pedido explícito del usuario) — se borró en vez de dejarla muerta en el repo. `getPokemonIdFromUrl`/`getArtworkUrlById` se fueron con ella.
