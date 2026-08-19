# ADR 007 — TypeScript en las 3 apps

## Contexto

El README no exige TypeScript explícitamente (solo "React ≥16, Vite, Module Federation"). No fue una de las preguntas cerradas con el usuario, pero es una decisión con impacto transversal en las otras 8 ADRs (tipos de `Pokemon`/`HistoryEntry` en `packages/shared`, contrato del evento `pokemon-visited`, props de los componentes federados) que vale la pena dejar registrada explícitamente en vez de asumida en silencio.

## Decisión

TypeScript en las 3 apps y en `packages/shared`, en modo `strict`.

## Alternativas consideradas

- **JavaScript + JSDoc**: reduce fricción de setup en un ~5%, pero pierde el beneficio principal que se busca acá: que el **contrato compartido** entre Shell, MF1 y MF2 (el shape de `HistoryEntry` en localStorage, el detail del `CustomEvent`, la respuesta de PokeAPI) esté tipado en un solo lugar (`packages/shared`) y cualquier divergencia entre apps se detecte en build, no en runtime — justamente el punto más frágil de una arquitectura de microfrontends sin backend propio que valide contratos.

## Consecuencias

- `packages/shared` exporta los tipos de dominio (`Pokemon`, `PokemonType`, `HistoryEntry`, el shape del `CustomEventDetail` de `pokemon-visited`) — las 3 apps los importan, ninguna redefine su propia versión.
- Los tipos de respuesta de PokeAPI se definen a mano (subset de campos usados), no se genera un cliente completo — PokeAPI no publica un schema OpenAPI oficial mantenido, y generar tipos completos para endpoints no usados sería tiempo mal invertido en 2 días.
- Si el candidato decide en el momento que JS puro es preferible por velocidad, esta ADR es el lugar a actualizar — no una decisión escondida en config.
