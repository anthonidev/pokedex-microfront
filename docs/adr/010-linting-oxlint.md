# ADR 010 — Linting: oxlint

## Contexto

El roadmap (Fase 0) preveía "ESLint + Prettier" como combinación estándar. Al scaffoldear las apps con `pnpm create vite ... --template react-ts`, el template actual instala **oxlint** por defecto en vez de ESLint, con un `.oxlintrc.json` mínimo (`react/rules-of-hooks`, `react/only-export-components`) por app.

## Decisión

Adoptar **oxlint** (linter, escrito en Rust) tal como lo trae el scaffold oficial, en vez de instalar ESLint + typescript-eslint por separado. **Prettier se mantiene** para formateo (oxlint no formatea, solo lintea).

## Alternativas consideradas

- **ESLint + typescript-eslint + eslint-plugin-react-hooks** (plan original): ecosistema de reglas más grande y maduro (incluidas reglas type-aware), pero significa desinstalar lo que Vite ya scaffoldeó y mantener config plana (`eslint.config.js`) a mano — tiempo que no se justifica cuando el propio tooling oficial de Vite ya resolvió el linter por defecto en esta versión.

## Consecuencias

- `pnpm lint` (vía Turborepo → `oxlint` en cada app) es órdenes de magnitud más rápido que ESLint, relevante para iterar rápido en 2 días.
- Cobertura de reglas más acotada que ESLint+typescript-eslint (sin reglas type-aware todavía tan extensas) — aceptable para el alcance de este reto; no es un proyecto de larga vida que necesite el catálogo completo de reglas de ESLint.
- `.oxlintrc.json` queda uno por app (generado por el scaffold) en vez de una config raíz única — se revisa en Fase 6 (polish) que las 3 apps queden alineadas en las mismas reglas.
