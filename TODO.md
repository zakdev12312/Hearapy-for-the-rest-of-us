# TODO

Prioritized follow-ups from a codebase review (build: `npm run build` succeeds; app logic is generally sound).

## High

- **Align README with Vite `base` path** — `vite.config.ts` sets `base: '/Hearapy-for-the-rest-of-us/'`, so local dev and production assets live under that URL path. [README.md](README.md) tells users to open `http://localhost:5173` only; they should use `http://localhost:5173/Hearapy-for-the-rest-of-us/` (or document when `base` is `/` vs GitHub Pages).
- **Avoid stopping audio inside `setTimeLeft` state updaters** — In `App.tsx`, when the timer hits zero, `stopTone()` runs inside the `setTimeLeft` functional updater. That couples side effects to React batching and is easy to get wrong in Strict Mode. Prefer driving “timer finished” from a `useEffect` that watches `timeLeft` / a ref, or a single `requestAnimationFrame` / `setInterval` callback that only updates state and triggers stop in one place.

## Medium

- **Release Web Audio resources on teardown** — On unmount, oscillators/noise nodes are stopped, but `AudioContext` is never `close()`d. Closing (or at least `suspend()`) on cleanup reduces leaks if the app grows beyond a single static page.
- **Accessibility pass** — Icon-only controls (theme sun/moon, reset) and the mode toggle lack visible text for screen readers; add `aria-label` (and consider `aria-pressed` for theme). The countdown could use `aria-live="polite"` so assistive tech announces changes.
- **Optional: medical/wellness framing** — The product name and “therapy” wording can imply clinical benefit. A short line that this is for relaxation/wellness only and not medical treatment reduces misunderstanding (copy-only change).

## Low

- **Add automated tests when a runner exists** — No test suite is configured ([AGENTS.md](AGENTS.md)). When added, prioritize pure helpers (time formatting, timer state transitions) and keep Web Audio behind mocks.
- **Extract audio logic** — Moving `initAudio`, `startTone`, `stopTone`, and brown-noise buffer creation into a hook or module would shrink `App.tsx` and make the timer/audio separation clearer.
- **README “projects tab”** — The tip points to GitHub’s Projects tab; clarify or remove if the repo’s workflow changes.
- **Nice-to-haves** — Screen Wake Lock for long brown-noise sessions; `prefers-color-scheme` default before `localStorage` theme; PWA/offline shell if you want installability.
