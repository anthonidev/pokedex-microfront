# ADR 008 — Estrategia de autenticación: mock local

## Contexto

El README pide "Login y sesión de usuario" pero no provee backend de autenticación — toda la data del reto sale de PokeAPI, que no tiene concepto de usuarios. No hay forma de implementar auth real sin inventar un backend fuera del alcance del reto.

## Decisión

Login **mock**, resuelto 100% client-side:

- Un formulario que acepta credenciales fijas (`demo@acity.dev` / `demo1234`, **precargadas por defecto** en el form) y documentadas en el README raíz para que el evaluador sepa cómo entrar sin buscar el dato.
- Validación de formulario con **react-hook-form + zod** (`zodResolver`): valida formato (email válido, contraseña no vacía) en el cliente antes de intentar nada; el chequeo de "¿son las credenciales de la demo?" es una regla de negocio aparte, resuelta en el `onSubmit` con `setError('root', ...)` — no forma parte del schema de zod porque no es una regla de *formato*, es una regla de *autenticación*. Botón de mostrar/ocultar contraseña (ícono `Eye`/`EyeOff` de lucide) sobre el mismo `Input` de shadcn.
- Al "loguear", se guarda una sesión simulada (`{ user, loggedInAt }`) en `localStorage`.
- Rutas protegidas verifican esa sesión con el store `useAuthStore` (Zustand, [`adr/005`](./005-state-management-zustand.md)) y redirigen a `/login` si no existe.
- Logout limpia `localStorage` y el store.

## Alternativas consideradas

- **Backend propio de auth (mock server con JSON server o similar)**: agrega una cuarta app/servicio a levantar, más superficie de configuración (puerto, CORS) para un beneficio marginal — el reto no evalúa "sabés implementar JWT", evalúa arquitectura de microfrontends y manejo de estado/data fetching en el frontend.
- **Auth de terceros (Firebase Auth, Auth0)**: introduce una dependencia externa real (API keys, cuenta de servicio) para un requisito que es explícitamente simple según el README ("El alcance ha sido diseñado para ser simple"). Sobre-ingeniería para el contexto.

## Consecuencias

- El login no protege nada realmente — es una puerta de UX (formulario, validación, feedback, sesión persistida), no un mecanismo de seguridad. Esto se declara explícitamente en el README de entrega para que no se lea como un descuido.
- Al estar la sesión en `localStorage` en vez de en el store de Zustand solamente, sobrevive a un refresh de página — comportamiento esperado de "sesión de usuario".
