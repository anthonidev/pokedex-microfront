# ADR 008 — Estrategia de autenticación: mock local

## Contexto

El README pide "Login y sesión de usuario" pero no provee backend de autenticación — toda la data del reto sale de PokeAPI, que no tiene concepto de usuarios. No hay forma de implementar auth real sin inventar un backend fuera del alcance del reto.

## Decisión

Login **mock**, resuelto 100% client-side:

- Un formulario que acepta credenciales fijas y documentadas en el README raíz (ej. cualquier email con formato válido + password no vacío, o un usuario/contraseña fijo tipo `demo`/`demo`) — la validación exacta se define en Fase 1 del roadmap y se deja explícita en el README de entrega para que el evaluador sepa cómo entrar.
- Al "loguear", se guarda una sesión simulada (`{ user, loggedInAt }`) en `localStorage`.
- Rutas protegidas verifican esa sesión con el store `useAuthStore` (Zustand, [`adr/005`](./005-state-management-zustand.md)) y redirigen a `/login` si no existe.
- Logout limpia `localStorage` y el store.

## Alternativas consideradas

- **Backend propio de auth (mock server con JSON server o similar)**: agrega una cuarta app/servicio a levantar, más superficie de configuración (puerto, CORS) para un beneficio marginal — el reto no evalúa "sabés implementar JWT", evalúa arquitectura de microfrontends y manejo de estado/data fetching en el frontend.
- **Auth de terceros (Firebase Auth, Auth0)**: introduce una dependencia externa real (API keys, cuenta de servicio) para un requisito que es explícitamente simple según el README ("El alcance ha sido diseñado para ser simple"). Sobre-ingeniería para el contexto.

## Consecuencias

- El login no protege nada realmente — es una puerta de UX (formulario, validación, feedback, sesión persistida), no un mecanismo de seguridad. Esto se declara explícitamente en el README de entrega para que no se lea como un descuido.
- Al estar la sesión en `localStorage` en vez de en el store de Zustand solamente, sobrevive a un refresh de página — comportamiento esperado de "sesión de usuario".
