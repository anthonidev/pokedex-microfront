# Overview — Reto Técnico Frontend Senior (Atlantic City)

## Qué es esto

Reto técnico de postulación para Desarrollador Frontend Senior en Atlantic City. Evalúa arquitectura de microfrontends, manejo de estado/data fetching y UX, mediante una app que consume [PokeAPI](https://pokeapi.co/).

El `README.md` raíz pasó a ser el README de entrega (instalación, scripts, arquitectura, decisiones). La especificación original del reto queda preservada en el historial de git (commit previo a la reescritura del README raíz).

## Restricción dura

**2 días calendario** desde el inicio del reto. Esto condiciona todas las decisiones documentadas en `adr/`: se prioriza lo que da más señal de "criterio senior" por hora invertida, no cobertura exhaustiva de features.

## Alcance obligatorio (del README original)

- Login (mock) + sesión de usuario.
- Home: categorías (tipos) con 10 Pokémon por categoría.
- Buscador modal fullscreen: 30 iniciales + infinite scroll (+30 por página) + búsqueda exacta por nombre.
- MF1 — Detalle de Pokémon (imagen SVG preferente, nombre, tipos, stats).
- MF2 — Historial de visitados (imagen, nombre, contador de visitas, persistencia).
- Tema claro/oscuro.
- Toast al recargar con el último Pokémon visitado (con dismiss persistente hasta la próxima visita).
- 3 apps corriendo en :3000 (shell), :3001 (MF1), :3002 (MF2), integradas vía Module Federation.

## Fuera de alcance (explícitamente, para no quemar tiempo)

- Backend propio / autenticación real — el login es mock, no hay usuarios reales ni JWT server-side (no hay servidor: todo corre contra PokeAPI, que no tiene auth).
- Internacionalización (i18n).
- SSR — el README pide Vite + Module Federation, que asume CSR.
- Cobertura de tests exhaustiva (E2E completo) — se prioriza testear la lógica de negocio no trivial (historial, búsqueda exacta, dismiss del toast), no todos los componentes.
- CI/CD complejo — a lo sumo un workflow simple de lint+build+test si el tiempo alcanza (Fase 8).

## Cómo leer esta carpeta

- [`architecture.md`](./architecture.md) — cómo encajan las 3 apps y cómo se comunican.
- [`roadmap.md`](./roadmap.md) — fases de desarrollo con checklist, mapeadas a Día 1 / Día 2.
- [`adr/`](./adr/) — una decisión técnica por archivo, formato Contexto → Decisión → Alternativas → Consecuencias.

## Criterios de evaluación (para no perder de vista mientras se construye)

| Criterio | Peso |
|---|---|
| Arquitectura (separación de responsabilidades, microfrontends, integración con Shell) | 30% |
| Funcionalidad (todo lo listado arriba, funcionando) | 30% |
| Calidad de código (organización, legibilidad, estado/data fetching) | 20% |
| UX/UI (navegación, tema, transiciones, feedback visual) | 20% |
