# S1, S2, C1 foundation

Scope: implement the existing contract in AGENTS.md and docs/SPEC.md, in card order. Keep Abdullah's screens and demo data for their own cards.

- S1: preserve docs, scaffold Vite/React/TypeScript, install the specified dependencies, wire Tailwind and Convex, add SPA hosting configuration, create the public repo, connect a cloud Convex project, invite Abdullah when his username is supplied.
- S2: use the local server-only fal key for text JSON and image smoke tests; set dev Convex env values and record only a model slug proven by both calls. Never commit credentials.
- C1: implement the exact schema and tags, event creation/read, attendee creation/update/public reads, key-protected saves, upload URL, and event-scoped local identity. Publish a function contract here for Abdullah.

Validation: build and strict type checks before each PR. C1 additionally tests real Convex functions for secret omission, rejected edit keys, event boundaries, save toggling, recent ordering, and photo URLs. Push C1 to the connected dev deployment. Request Codex review before any merge.

Setup verified on 12 Oct 2026: [public repository](https://github.com/SerialSeller/bridgx), [Trello board](https://trello.com/b/HW5r8YxD/bridgx-codex-hackathon), and GitHub write access for Abdullahbit. The fal server values are configured on BridgX dev; production configuration belongs to S3.

## S2 verified provider

On 12 Oct 2026, two curl requests to `https://fal.run/openrouter/router/openai/v1/chat/completions` passed with `openai/gpt-6-luna` and `response_format: { type: "json_object" }`. Text returned `{ "ok": true }`; vision read a synthetic red PNG via `image_url` and returned `{ "color": "red" }`. Run `npm run ai:smoke` to repeat with a key from ignored `.env` or `.env.local`. No attendee data is used.

## C1 frontend contract

Import `{ api }` from `convex/_generated/api` and use reactive `useQuery` / `useMutation` calls inside the provider.

| Function | Arguments | Result |
|---|---|---|
| `events.create` | `{ name, date?, location? }` | `{ slug, adminKey }` |
| `events.getBySlug` | `{ slug }` | public event or `null` (`_id` is the eventId) |
| `attendees.create` | `{ eventId, ...profile }` | `{ attendeeId, editKey }` |
| `attendees.update` | `{ attendeeId, editKey, ...profile }` | `null` |
| `attendees.get` | `{ attendeeId }` | public attendee or `null` |
| `attendees.listByEvent` | `{ eventId }` | public attendees, oldest first |
| `attendees.count` | `{ eventId }` | number |
| `attendees.recent` | `{ eventId }` | newest 10 public attendees |
| `saves.toggle` | `{ fromId, toId, editKey }` | `{ saved: boolean }` |
| `saves.listMine` | `{ fromId, editKey }` | public attendees, most recently saved first |
| `files.generateUploadUrl` | `{}` | upload URL |

`profile` is `{ name, headline, bio, offers, seeking, industries, contacts, sources, findMe?, photoId? }`. Name is required; empty headline/bio and empty tags allow manual fallback onboarding. The complete profile is required for updates; omitted findMe/photoId clear them. The eventId and editKey remain fixed. Tag keys use the exported NEED_TAGS and INDUSTRY_TAGS vocabularies. Sources are text, voice, github, website, screenshot. Public attendees include `_id`, `_creationTime`, eventId, profile fields, `photoUrl: string | null`, and optional isSeed; never editKey. Event queries never expose adminKey.

After joining, call `setIdentity(slug, { attendeeId, editKey })` from `src/lib/identity.ts`. `getIdentity(slug)` returns that identity or null; `clearIdentity(slug)` clears only that event. Set/clear return false if browser storage is blocked, so onboarding can show a recovery message before losing the key.

Upload flow: call generateUploadUrl, POST a file with its Content-Type to that URL, read the returned storageId, pass it as photoId when saving the profile. Browsing does not need an identity; profile updates and both save operations verify the editKey on the server. Saves reject cross-event targets.

C1 validation: 8 tests pass, covering event/profile secret omission, edit-key rejection, event isolation, recent ordering, saves ordered by their creation time, save toggles and cross-event rejection, photo URLs, upload URL generation, and identity storage failures. Build, root TypeScript check, strict frontend/backend/test typechecks and lint pass. All 11 registered functions are present on the BridgX dev deployment; a live missing-event query returns null. Browser and phone testing are pending the screen cards.
