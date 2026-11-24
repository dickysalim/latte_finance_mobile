# Latte Finance Mobile

Household finance tracker for iOS, Android and web. Built with React Native, Expo and TypeScript.

Status: early scaffold. Screens are added flow by flow.

## Stack

- Expo SDK 58, React Native, React 19
- expo-router (file-based routing)
- TypeScript (strict)
- Jest, jest-expo, Testing Library
- Backend: a Cloudflare Worker (separate repository)
- Web build hosted on Cloudflare Pages

## Run it

```bash
npm install
cp .env.example .env.local   # then set EXPO_PUBLIC_API_URL
npm start                    # or: npm run web
```

`EXPO_PUBLIC_API_URL` is the worker URL. It is bundled into the app and is public: never put a secret in it.

## Scripts

| Script | What it does |
| --- | --- |
| `npm start` | Expo dev server |
| `npm run web` | Dev server for web |
| `npm run build:web` | Static web export to `dist/` |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |
| `npm test` | Jest tests |

## Structure

```
src/app/         routes
src/components/  shared components
src/api/         worker client
src/theme/       design tokens
```
