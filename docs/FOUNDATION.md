# S1, S2, C1 foundation

Scope: implement the existing contract in AGENTS.md and docs/SPEC.md, in card order. Keep Abdullah's screens and demo data for their own cards.

- S1: preserve docs, scaffold Vite/React/TypeScript, install the specified dependencies, wire Tailwind and Convex, add SPA hosting configuration, create the public repo, connect a cloud Convex project, invite Abdullah when his username is supplied.
- S2: use the local server-only fal key for text JSON and image smoke tests; set dev Convex env values and record only a model slug proven by both calls. Never commit credentials.
- C1: implement the exact schema and tags, event creation/read, attendee creation/update/public reads, key-protected saves, upload URL, and event-scoped local identity. Publish a function contract here for Abdullah.

Validation: build and strict type checks before each PR. C1 additionally tests real Convex functions for secret omission, rejected edit keys, event boundaries, save toggling, recent ordering, and photo URLs. Push C1 to the connected dev deployment. Request Codex review before any merge.

External prerequisites: the connected Trello account currently has no BridgX board. Card transitions need the board URL/access. Abdullah's write invitation needs his GitHub username. S2 needs FAL_KEY in ignored .env.local.
