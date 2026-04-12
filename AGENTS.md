# AGENTS.md

## Dev Commands
- `npm run dev` - Start dev server
- `npm run build` - Type-check + Vite build
- `npm run lint` - ESLint (flat config, no type-aware rules)

## Tech Stack
- React 19 + Vite 8
- TypeScript (strict, project references: `tsconfig.app.json`, `tsconfig.node.json`)
- Tailwind CSS v4 with `@tailwindcss/postcss` plugin (NOT tailwindcss v3 postcss plugin)
- shadcn/ui-style components using Radix UI primitives
- Web Audio API for tone generation

## Path Alias
- `@/` maps to `./src/`

## Key Files
- `src/App.tsx` - Main audio therapy UI (Web Audio API oscillator)
- `src/components/ui/` - Reusable UI components (Button, Card, Slider)
- `src/lib/utils.ts` - `cn()` utility (clsx + tailwind-merge)
- `components.json` - shadcn/ui config (style: new-york, icons: lucide)

## Notes
- No test suite configured
- ESLint uses flat config (`eslint.config.js`), NOT `.eslintrc`
- Tailwind v4 uses `@import "tailwindcss"` in CSS, NOT `@tailwind base/components/utilities`
- React Compiler is intentionally NOT enabled
