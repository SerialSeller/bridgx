# BridgX

Meet the right people at any event. One QR, no app, no login.

## Run locally

```sh
npm install
npx convex dev
npm run dev
```

Convex writes `VITE_CONVEX_URL` into the ignored `.env.local` file. The scaffold also renders a placeholder before the backend is connected.

```sh
npm run build
npx tsc --noEmit
npm run typecheck
```

Read [AGENTS.md](AGENTS.md), [the spec](docs/SPEC.md), [the cards](docs/TRELLO.md), and [the demo](docs/PITCH.md) before making changes.
