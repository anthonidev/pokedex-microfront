# ADR 004 — Estilos: Tailwind CSS

## Contexto

El README deja elegir entre CSS, CSS Modules, Tailwind o Styled Components. Hay 3 apps independientes que deben verse como *una sola aplicación coherente* (mismo look & feel, mismo dark mode) a pesar de ser bundles separados de Module Federation.

## Decisión

**Tailwind CSS**, con una configuración compartida que las 3 apps extienden — mismos tokens de color/espaciado y la misma estrategia de dark mode basada en clase.

> **Actualización (implementación, Fase 0):** al instalar, npm resolvió Tailwind v4 (config CSS-first, sin `tailwind.config.js`). El "preset compartido" se implementa como `packages/shared/src/theme.css`, con los tokens en un bloque `@theme` y un `@custom-variant dark (&:where(.dark, .dark *));` para mantener dark mode por clase (Tailwind v4 usa `prefers-color-scheme` por defecto, y acá lo necesitamos atado a la clase en `<html>` que decide el store de theme). Cada app lo importa en su CSS de entrada: `@import "tailwindcss"; @import "@acity/shared/theme.css";`. Sigue siendo "una config compartida", solo que en CSS en vez de en un objeto JS/TS.

## Alternativas consideradas

- **CSS Modules**: cero dependencias, scope garantizado, pero construir un sistema de theming (variables para light/dark, tokens consistentes entre 3 apps) a mano consume tiempo que en un plazo de 2 días se necesita para funcionalidad.
- **Styled Components**: buen DX vía `ThemeProvider`, pero eso implica un Context de React con el theme — y por [`adr/003`](./003-cross-mfe-communication.md) se decidió evitar estado de React compartido entre remotes. Habría que reinstanciar el `ThemeProvider` en cada MF y sincronizarlo manualmente con el Shell, más trabajo que el enfoque de clase CSS + `localStorage`.
- **CSS plano**: manejable para una sola app, pero sin ninguna garantía de consistencia entre 3 proyectos separados — alto riesgo de que MF1/MF2 "se vean distintos" al Shell.

## Consecuencias

- Dark mode se resuelve con una clase (`dark`) en `document.documentElement`, no con Context — coherente con la estrategia de comunicación cross-MFE ya elegida (ninguna app necesita "saber" del theme del Shell, solo leer la clase del `<html>` que ya comparten).
- Las 3 apps deben mantener su config de Tailwind alineada al preset compartido — si diverge, se nota visualmente de inmediato (bajo riesgo de que pase desapercibido).
- Bundle de utilidades de Tailwind se paga 3 veces (una por app), aceptable dado que cada app debe ser independientemente desplegable.
