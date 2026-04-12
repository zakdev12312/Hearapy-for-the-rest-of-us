# AGENTS.md

## Dev Commands
- `npm run dev` - Dev server
- `npm run build` - Type-check + Vite build
- `npm run lint` - ESLint (flat config, no type-aware rules)

## Tech Stack
- React 19 + Vite + TypeScript (strict, project references)
- Tailwind CSS v4 (`@tailwindcss/postcss` plugin, NOT v3)
- shadcn/ui-style components (Radix UI, CVA variants, new-york style)
- Web Audio API (oscillator-based tone generation)
- `@/` aliases to `./src/`

## Key Files
- `src/App.tsx` - Main audio therapy UI
- `src/components/ui/` - Button, Card, Slider components
- `src/lib/utils.ts` - `cn()` utility (clsx + tailwind-merge)
- `components.json` - shadcn/ui config reference

## Gotchas
- No test suite configured
- ESLint uses flat config (`eslint.config.js`), NOT `.eslintrc`
- Tailwind v4: CSS uses `@import "tailwindcss"`, NOT `@tailwind base/components/utilities`
- CSS variables use HSL format with `@theme` directive (not standard Tailwind)
- React Compiler is NOT enabled

## Git CLI

Basic workflow:
- `git add .` - Stage all changes
- `git commit -m "message"` - Commit staged changes
- `git push origin master` - Push to remote
- `git pull origin master` - Pull latest changes
- `git status` - Check what's changed
