# Contributing

How the Bat Hunter code is organized and the rules every change follows. The README covers setup and deploy.

## Layout

| Path | What goes there |
| --- | --- |
| `src/components/` | Shared UI with no game or Firebase knowledge: buttons, cards, modal, segmented control, score summary. |
| `src/features/` | Game features: auth, single-player, multiplayer, difficulty picker, sign-in modal. |
| `src/pages/` | One folder per route, wired in `App.tsx`. |
| `src/hooks/` | Reusable hooks: game modes, counters, spawner, countdown, layout. |
| `src/i18n/` | Every text the player reads, in en-US (`en.ts`, the source) and pt-BR (`pt.ts`), plus the language provider and `useI18n`. |
| `src/models/` | Firebase data access, one file per kind of record (users, matches, games, messages). |
| `src/services/` | Everything else that is not UI: scoring and bat types (pure), the flight engine, shots and audio (DOM), Firebase and auth wrappers, the account (LGPD) and legal constants. |
| `src/test/` | Test setup and helpers (`renderWithContext`, `firebaseMock`). |
| `scripts/` | Node scripts: the retention job and data migrations. |
| `rules/` | Tests of `database.rules.json` on the Firebase emulator. |
| `brand/` | Logo manual and the scripts that draw every brand asset. |
| `docs/lgpd/` | LGPD records. |
| `.ai/plans/` | Plans and the history of what was done. |

## Conventions

- **Imports across folders use `src/...`** (for example `src/components`, `src/services/game-service`). Relative imports only within a folder, and for assets outside `src` (`brand/`). Lint enforces it.
- **Files starting with `_`** are internal to their folder; the folder's `index.ts` exports its public API.
- **No `setState` in effects and no refs read during render**: derive state instead (the React Compiler lint rules are on). For values that long-lived callbacks need, use `useLatestRef`.
- **No `alert()`**: show messages in the page.
- **Every text the player reads goes in `src/i18n/en.ts` and `pt.ts`** and is shown with `const { t } = useI18n()`; dates go through `formatDate`/`formatDateTime`/`formatTime`. Texts with a variable are functions (`greeting: (name) => ...`). The typecheck fails if pt-BR misses a key, a test fails if a Portuguese text is left equal to the English one (list real exceptions in `SAME_IN_BOTH`), and lint blocks text written straight in JSX. The legal pages are the exception: one reviewed JSX block per language. Tests render in English by default; pass `{ language: 'pt-BR' }` to `renderWithContext` to check the Portuguese.
- **Personal data**: store only what the game shows (first name, photo), keep the database rules private to the players involved, and update `docs/lgpd/` and the privacy policy when something new is processed. The retention periods live in `src/services/retention-days.json`, read by both the policy and the cleanup job.

## Tests

```bash
yarn test            # unit and component tests (Vitest + Testing Library, jsdom)
yarn test:coverage   # the same, failing under 100% of lines, branches, functions and statements
yarn test:rules      # database rules on the Firebase emulator (needs Java 21)
```

- Every change keeps coverage at **100%**; CI blocks the deploy otherwise. Cover behavior through the UI or the public function, not implementation details.
- Tests run against a fake `demo-bat-hunter` Firebase project and mock the data layer; they never reach the real database.
- Use `renderWithContext` (router, auth and multiplayer contexts) for components, fake timers for countdowns and flights, and a fixed `Math.random` for bats.
- Code that cannot be reached by a test is dead: remove it rather than ignoring it.

## Commits

One commit per change, with a message that explains why (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`, `ci:`). The type decides the release version: `feat` bumps the minor, a `!` after the type or a `BREAKING CHANGE:` footer the major, anything else the patch (see the README's Releases). A squash merge keeps only the PR's title, so it follows the same format.

Changes reach `main` through pull requests. Each merge deploys after lint, typecheck, format, build, tests with coverage and rules tests pass.
