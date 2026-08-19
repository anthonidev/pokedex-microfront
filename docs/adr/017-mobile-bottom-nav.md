# ADR 017 — Mobile: header simplificado + barra flotante inferior

## Contexto

El header (logo, nav Home/Historial, buscador con texto+atajo, toggle de tema, email del usuario) fue pensado para desktop — en mobile todo eso compitiendo por ~375px de ancho se ve amontonado. El usuario pidió simplificar el header y sugirió una barra de navegación inferior flotante, aportando una referencia visual (pill flotante con íconos, ítem activo resaltado).

## Decisión

**Por debajo de `sm` (640px):**
- Header: marca acortada a "Pokédex" (vs. "Atlantic City · Pokédex" en desktop), sin los links de nav, sin el botón de buscador, sin el email del usuario — solo queda el toggle de tema (utilidad liviana, no estorba).
- Nueva `MobileBottomNav.tsx`: pill flotante fija (`fixed bottom-4 left-1/2 -translate-x-1/2`, oculta con `sm:hidden`) con 4 accesos: Home, Historial (con estado activo vía `NavLink`, círculo relleno con `--primary`), Buscar (abre el mismo modal que ya existía) y Usuario (reutiliza `UserMenu`, con un prop `iconOnly` nuevo que oculta el email y ajusta el botón disparador a un círculo de ícono, para no duplicar la lógica del dropdown/logout).

**Desde `sm` en adelante:** el header vuelve a mostrar todo (nav, buscador, tema, usuario) — sin cambios respecto a como estaba.

`<main>` suma `pb-24` (solo hasta `sm`) para que el contenido no quede tapado por la pill flotante al hacer scroll hasta el final.

## Alternativas consideradas

- **Menú hamburguesa colapsable**: patrón más tradicional, pero esconde la navegación principal detrás de un tap extra — la barra inferior deja Home/Historial/Buscar/Usuario accesibles con un solo tap, más apropiado para una app que se usa activamente en mobile (no un sitio de contenido estático).
- **Mantener el header igual y solo achicar fuentes/espaciados**: no resuelve el problema de fondo (5+ elementos interactivos no entran cómodos en un header de mobile sin volverse ilegibles).

## Consecuencias

- `UserMenu` ahora se renderiza en dos lugares (header desktop, pill mobile) con el mismo componente — evita una segunda implementación del dropdown de logout.
- La pill es `fixed`, así que no participa del flujo normal del documento — cualquier página nueva que se agregue al Shell necesita heredar el `pb-24` de `AppLayout` (ya lo hace, al vivir dentro del mismo `<main>`), no requiere que cada página individual se ocupe de eso.
