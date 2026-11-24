# Latte Finance Mobile

React Native (Expo SDK 58) app, TypeScript strict, expo-router. One codebase for iOS, Android and web. The web build (`npm run build:web`, output `dist/`) is hosted on Cloudflare (Workers static assets, `wrangler.jsonc`) from GitHub pushes.

**This repository is PUBLIC and is the owner's showcase.** Everything committed is visible to the world, forever (git history included). Treat every commit as a publication.

## Security rules (hard rules)

- Never commit secrets: `.env`, `.env.local`, any `.env.*` except `.env.example`, tokens, API keys, EAS credentials, keystores (`*.jks`, `*.keystore`), signing keys (`*.p8`, `*.p12`, `*.pem`, `*.key`), `google-services.json`, `GoogleService-Info.plist`, `credentials.json`.
- `EXPO_PUBLIC_*` values are bundled into the app and visible to anyone who opens it or the web build. Never put a secret in an `EXPO_PUBLIC_*` variable. The mobile app holds no secret: the worker does.
- Never commit personal data: no real emails, names or financial numbers in code, fixtures, tests, screenshots, docs or commit messages. Use fake data such as `alice@example.com`, `Alice`, `Bob`.
- Before every commit, run `git diff --cached` and read it for secrets and personal data. Stop and unstage if anything looks real.
- If a secret is committed by mistake, do not just delete it in a later commit: tell the owner, rotate the secret, then clean the history.
- `.env.example` holds placeholder names and non-secret defaults only.

## Source of truth

- Design lives in `../design/` (`stories.md`, `api_contracts.md`, `table_design.md`). The Claude Sheets artifact https://claude.ai/artifact/XFH3qcXTZCfrvnAoYR3PnA wins if a design file disagrees with it.
- Do not change the design. Raise gaps with the PM.
- Folders named `latte_factor_*` (`latte_factor_app`, `latte_factor_worker`, `latte_factor_agent`) are legacy. Reference only (UI ideas allowed). Never edit them, never copy secrets or data from them.
- The backend is the `latte_finance_worker` Cloudflare Worker. Its routes are in `api_contracts.md`.

## Structure

```
src/app/         expo-router routes (every file is a screen; _layout.tsx defines navigators)
src/components/  shared UI components
src/api/         worker client (apiPost, ApiError, API_URL)
src/theme/       colors, spacing, radius
__tests__/       jest-expo + @testing-library/react-native tests
```

Keep non-route code out of `src/app/`. Import with the `@/` alias (maps to `src/`).

## Commands

```bash
npm start            # expo dev server
npm run web          # dev server for web
npm run build:web    # static web export to dist/ (needs EXPO_PUBLIC_API_URL set, not localhost)
npm run typecheck    # tsc --noEmit
npm run lint         # expo lint
npm test             # jest
npx expo install <package>   # always use this to add dependencies (SDK-compatible versions)
npx expo-doctor      # check dependencies and config
```

Run `typecheck`, `lint` and `test` before declaring any task done. Both `npm run build:web` and a native start must keep working.

## Conventions

- The API base URL comes from `EXPO_PUBLIC_API_URL` (see `.env.example`), read only in `src/api/config.ts`. Screens call the worker through `src/api`, never with a hard-coded URL.
- Expo changes between SDKs. Before using an Expo, EAS or React Native API, check the versioned docs at `https://docs.expo.dev/versions/v58.0.0/` instead of trusting memory.
- Everything must render on web as well as native: no native-only modules without a web fallback.
- Money and dates follow the design: show account bill day 0 as "unknown", use the device time zone (Asia/Jakarta when unknown), never UTC, for "today" and cycles.
- Commit messages are short and plain, with no personal data.
