# Bat Hunter 🦇🔫

This is a simple game made in a hackaton when you just have to kill the bats.

The game is available in the following public URL: https://bat-hunter-game.web.app/

## Development

Requirements: Node 24 and Yarn 4 (via `corepack enable`).

```bash
yarn install
cp .env.example .env.local # fill with the Firebase web app config
yarn dev
```

Scripts: `yarn lint`, `yarn typecheck`, `yarn format` / `yarn format:check`, `yarn build`.

## Firebase

The app uses the Firebase project `bat-hunter-game`:

- **Authentication**: Google provider (`signInWithPopup`).
- **Realtime Database**: access rules live in [`database.rules.json`](database.rules.json).
- **Hosting**: the `dist/` folder, configured in [`firebase.json`](firebase.json).

To try the rules locally (requires Java):

```bash
npx firebase-tools emulators:start --only auth,database
```

## Deploy

Done by GitHub Actions ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) once lint, typecheck, format and build pass:

- Push to `main` → database rules + Hosting live channel.
- Pull request → Hosting preview channel (Google sign-in doesn't work there, since preview domains aren't authorized).

Required repository secrets:

| Secret | Value |
| --- | --- |
| `FIREBASE_SERVICE_ACCOUNT_BAT_HUNTER_GAME` | Created by `npx firebase-tools init hosting:github`. Also grant it the _Firebase Realtime Database Admin_ role in IAM. |
| `FIREBASE_PROJECT_ID` | `bat-hunter-game` |
| `VITE_FIREBASE_*` | Same values as `.env.local` (`gh secret set -f .env.local`). |
