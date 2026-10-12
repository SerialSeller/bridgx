# AGENTS.md — BridgX

BridgX: attendees scan one QR code at an event, get an AI-built profile in ~20 seconds, and instantly see **who they should meet, why, and what to say first**. Organizers create an event in 60 seconds and print the QR. No app install, no login.

Built today at the OpenAI Codex Hackathon (Istanbul, 12 Oct 2026). **Hard deadline: submissions lock at 16:00 Istanbul time. Feature freeze at 15:00.** Prefer shipping a working simple thing over a perfect complex thing.

Read before working:
- `docs/SPEC.md` — what to build (screens, flows, matching, smart import)
- `docs/DESIGN.md` — the shared visual contract for every UI change
- `docs/TRELLO.md` — every task, owner, priority, acceptance criteria
- `docs/PITCH.md` — demo script (build what the demo needs first)

---

## Stack

- **Frontend:** Vite + React 19 + TypeScript (strict) + Tailwind CSS v4 + React Router v7 (`react-router`) + `qrcode.react` + `lucide-react` icons
- **Backend / DB / realtime / file storage:** Convex (queries, mutations, actions). No other backend.
- **AI:** OpenAI models through **fal.ai's OpenRouter router** (OpenAI-compatible API, billed to fal credits). Voice via fal Whisper. Images via fal.
- **Hosting:** Netlify (static SPA) + Convex production deployment.

Do not add Next.js, Supabase, Firebase, Redux, a UI kit, or an auth provider.

## Commands

```bash
npm install
npx convex dev            # terminal 1 — pushes convex/ functions, writes VITE_CONVEX_URL to .env.local
npm run dev               # terminal 2 — Vite on http://localhost:5173
npm run build             # must pass before every PR
npx tsc --noEmit          # must pass before every PR
npx convex run seed:run '{"slug":"demo","name":"BridgX Demo Night"}'   # load demo profiles
```

Env vars for Convex functions (set for **dev and prod** — prod is easy to forget):

```bash
npx convex env set LLM_BASE_URL "https://fal.run/openrouter/router/openai/v1"
npx convex env set LLM_AUTH "Key <FAL_KEY>"
npx convex env set LLM_MODEL "openai/gpt-6-luna"
npx convex env set FAL_KEY "<FAL_KEY>"
npx convex env set GITHUB_TOKEN "<optional, raises GitHub API rate limit>"
# repeat each with --prod after the production deployment exists
```

| Var | Where | Purpose |
|---|---|---|
| `LLM_BASE_URL` | Convex | OpenAI-compatible base URL (fal router) |
| `LLM_AUTH` | Convex | Full `Authorization` header value. fal: `Key <FAL_KEY>`. OpenRouter: `Bearer <key>` |
| `LLM_MODEL` | Convex | `openai/gpt-6-luna` (cheap, vision + JSON). Verified 12 Oct 2026 with text JSON and image input against the fal router; fallback `openai/gpt-5.6-luna` |
| `FAL_KEY` | Convex | fal Whisper (voice) and fal image endpoints |
| `GITHUB_TOKEN` | Convex | optional, for smart import |
| `CONVEX_DEPLOY_KEY` | Netlify | production deploy key from the Convex dashboard |
| `VITE_CONVEX_URL` | `.env.local` | written automatically by `npx convex dev` / `convex deploy --cmd` |

Backup AI provider (text only, rate limited 20 req/min, 50 req/day): `LLM_BASE_URL=https://openrouter.ai/api/v1`, `LLM_AUTH="Bearer <OPENROUTER_KEY>"`, `LLM_MODEL=nvidia/nemotron-3-super-120b-a12b:free`. Switching provider must only require changing env vars.

Netlify: `netlify.toml` at repo root:

```toml
[build]
  command = "npx convex deploy --cmd 'npm run build'"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## Repo layout and ownership

Two people work in parallel, each with Codex. **Stay inside your owner's folders.** If you must touch a shared file, keep the change minimal and say so in the PR.

```
convex/
  schema.ts            Musa   — data model (contract below; change only with both agreeing)
  tags.ts              Musa   — tag vocabularies, imported by frontend too
  events.ts            Musa   — create, getBySlug, stats
  attendees.ts         Musa   — create, update, get, listByEvent, count, recent
  saves.ts             Musa   — toggle, listMine
  files.ts             Musa   — generateUploadUrl, getUrl
  llm.ts               Musa   — chatJSON() helper (fetch, timeout, JSON parse, returns null on failure)
  prompts.ts           Musa   — all prompt text
  ai.ts                Musa   — extractProfile, explainMatches, transcribe (actions)
  enrich.ts            Musa   — GitHub + website readers for smart import
  matches.ts           Musa   — forMe query (deterministic scoring)
  seed.ts, seedData.ts Abdullah — demo profiles (internalMutation)
src/
  main.tsx, App.tsx    shared — providers + routes (add your route, nothing else)
  lib/                 Musa   — identity (localStorage), vcard, formatting helpers
  components/ui/       Abdullah — Button, Card, Chip, Sheet, Avatar, TabBar, EmptyState
  features/onboarding/ Musa
  features/matches/    Musa
  features/directory/  Abdullah
  features/organizer/  Abdullah — Home, CreateEvent, Admin, Live, Poster
  features/saved/      Abdullah
public/                Abdullah
docs/                  both
```

## Routes

| Route | Screen | Owner |
|---|---|---|
| `/` | Home: what BridgX is, "Create an event", "Try the demo" (`/e/demo`) | Abdullah |
| `/new` | Create event form → redirect to admin | Abdullah |
| `/e/:slug` | Event landing: name, live "N people here", **Join (20 sec)** / **Just browse** | Abdullah |
| `/e/:slug/join` | Onboarding: smart import → review/edit → contacts → save | Musa |
| `/e/:slug/people` | Directory: search, tag filters, person cards | Abdullah |
| `/e/:slug/p/:id` | Person detail: bio, tags, find-me, contact buttons, save | Abdullah |
| `/e/:slug/matches` | Top matches with why + icebreaker | Musa |
| `/e/:slug/saved` | Saved people + export all as vCard | Abdullah |
| `/e/:slug/admin?key=` | Organizer: QR, links, download QR, count, insights | Abdullah |
| `/e/:slug/live` | Projector screen: huge QR, live count, join feed, top "looking for" | Abdullah |
| `/e/:slug/poster` | Printable A4 poster with QR (fal-generated background) | Abdullah |

Event pages share a bottom tab bar: **People · Matches · Saved · Me**.

## Data model (the contract)

```ts
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  events: defineTable({
    slug: v.string(),                    // url-safe, unique, e.g. "codex-hack-ist"
    name: v.string(),
    date: v.optional(v.string()),
    location: v.optional(v.string()),
    adminKey: v.string(),                // secret, only returned once by events.create
  }).index("by_slug", ["slug"]),

  attendees: defineTable({
    eventId: v.id("events"),
    name: v.string(),
    headline: v.string(),                // "Backend dev @ Trendyol"
    bio: v.string(),                     // 1–2 sentences
    offers: v.array(v.string()),         // NEED_TAGS keys, max 5
    seeking: v.array(v.string()),        // NEED_TAGS keys, max 5
    industries: v.array(v.string()),     // INDUSTRY_TAGS keys, max 4
    findMe: v.optional(v.string()),      // "Blue jacket, near the coffee bar"
    photoId: v.optional(v.id("_storage")),
    contacts: v.object({
      whatsapp: v.optional(v.string()),
      email: v.optional(v.string()),
      linkedin: v.optional(v.string()),
      instagram: v.optional(v.string()),
      x: v.optional(v.string()),
      github: v.optional(v.string()),
      website: v.optional(v.string()),
    }),
    sources: v.array(v.string()),        // "text" | "voice" | "github" | "website" | "screenshot"
    editKey: v.string(),                 // secret; NEVER returned by public queries
    isSeed: v.optional(v.boolean()),
  }).index("by_event", ["eventId"]),

  matchText: defineTable({              // cache of AI explanations
    fromId: v.id("attendees"),
    toId: v.id("attendees"),
    why: v.string(),
    icebreaker: v.string(),
  }).index("by_pair", ["fromId", "toId"]),

  saves: defineTable({
    fromId: v.id("attendees"),
    toId: v.id("attendees"),
  }).index("by_from", ["fromId", "toId"]),
});
```

Identity without login: after joining, store `{ attendeeId, editKey }` in `localStorage["bridgx:<slug>"]`. Mutations that change a profile or saves take `editKey` and verify it server-side. Organizer admin actions take `adminKey`.

## Tags (`convex/tags.ts`)

The same vocabulary is used for `offers` and `seeking` so matches are exact. The AI must only output these keys.

```ts
export const NEED_TAGS = {
  frontend: "Frontend dev", backend: "Backend dev", mobile: "Mobile dev",
  "ai-ml": "AI / ML", data: "Data & analytics", devops: "DevOps & cloud",
  web3: "Web3", hardware: "Hardware & IoT", security: "Security",
  product: "Product management", "ux-design": "UI/UX design", "brand-design": "Brand & graphic design",
  marketing: "Marketing", growth: "Growth", content: "Content & social media",
  community: "Community", sales: "Sales & BD", partnerships: "Partnerships",
  investment: "Investment",          // offers = I invest · seeking = I'm raising
  legal: "Legal", finance: "Finance & accounting", operations: "Operations",
  jobs: "Jobs",                      // offers = I'm hiring · seeking = I'm looking for a job
  freelance: "Freelance work",       // offers = I freelance · seeking = I need a freelancer
  cofounder: "Co-founder",           // looking for a cofounder → put in BOTH offers and seeking
  mentorship: "Mentorship",          // offers = I mentor · seeking = I want a mentor
  customers: "Customers & pilots",   // offers = I could be a customer/pilot · seeking = I need customers
  feedback: "Product feedback", speaking: "Speaking & events", press: "Press & media",
} as const;

export const INDUSTRY_TAGS = {
  "ai-tools": "AI tools", fintech: "Fintech", healthtech: "Healthtech", edtech: "Edtech",
  ecommerce: "E-commerce", saas: "B2B SaaS", consumer: "Consumer apps", gaming: "Gaming",
  climate: "Climate", mobility: "Mobility", logistics: "Logistics", food: "Food",
  proptech: "Proptech", creator: "Creator economy", travel: "Travel", web3: "Web3",
  deeptech: "Deep tech", hrtech: "HR tech", legaltech: "Legaltech", impact: "Social impact",
  agency: "Agency & services", other: "Other",
} as const;
```

## Matching (`convex/matches.ts`, a query — updates live as people join)

```
need  = |me.seeking ∩ them.offers|          // they can help me
give  = |them.seeking ∩ me.offers|          // I can help them
same  = |me.industries ∩ them.industries| + 0.5 × |me.offers ∩ them.offers|
score = 3·need + 2·give + 1·same            // skip self; skip score 0; top 5
```

Return each match with `kind` (`"helps-you" | "you-help" | "same-world"` = the largest term), the overlapping tag keys, and any cached `matchText`. The UI then calls the `ai.explainMatches` action **once** for the top 3 that have no cached text; it writes `matchText`. If the AI fails, build text from the tags (e.g. "You're looking for UI/UX design and Ayşe offers it.") so the screen never breaks.

## AI rules (`convex/llm.ts`, `convex/ai.ts`)

- One helper: `chatJSON<T>(messages, { model?, timeoutMs = 20000 })` → `fetch(\`${LLM_BASE_URL}/chat/completions\`)` with header `Authorization: process.env.LLM_AUTH`, `response_format: { type: "json_object" }`. Strip code fences, `JSON.parse`, **return `null` on any error**. Every caller must have a non-AI fallback.
- Images: OpenAI-style content parts `{ type: "image_url", image_url: { url } }` with a Convex storage URL.
- Validate AI output: drop tags not in the vocabulary, cap counts, trim strings. Never trust the shape.
- **Privacy:** never send phone numbers or emails to the model. Send only the text, links' public content, and screenshots the user gave us.
- Smart import reads only what the user hands us: GitHub (public API), a personal website, screenshots, voice. **Never fetch or scrape LinkedIn, Instagram, or X** (login walls and their terms) — ask for a screenshot instead.
- Keep all prompt text in `convex/prompts.ts`.
- Voice: `POST https://fal.run/fal-ai/whisper` with `{ audio_url }` and header `Authorization: Key ${FAL_KEY}`; read the transcript from the response (verify the field name on first call).

## Convex rules

- Actions can't touch the DB directly: use `ctx.runQuery` / `ctx.runMutation` with `internal.*` functions.
- `fetch` works in the default Convex runtime — do not add `"use node"` unless a Node API is truly needed.
- Public queries return a `publicAttendee()` shape: no `editKey`, no `adminKey`.
- Uploads: mutation `files.generateUploadUrl` → client `POST`s the file → store the returned `storageId`.
- Lists are per event via `by_event`; events stay small (<1,000 attendees), so in-memory scoring is fine.

## UI rules

- **Mobile first.** Design at 390px wide; content `max-w-md mx-auto`; tap targets ≥ 44px; works one-handed.
- Every screen has a loading, empty, and error state. No blank screens.
- Contact buttons use deep links: `https://wa.me/<digits>`, `mailto:`, LinkedIn/Instagram/X/GitHub URLs, website.
- Tone: warm, short, confident. Say "Who you should meet", not "Recommendations".
- Joining must feel like 20 seconds: one text box first, the form is only for reviewing what AI filled.
- Always offer **"Skip, just browse"** — browsing must work without a profile.

## Workflow

- Branch per Trello card: `musa/C2-extract`, `abdullah/A3-directory`. Small PRs, squash-merge to `main` fast. `main` auto-deploys to Netlify.
- PR title starts with the card id: `[C2] AI profile extraction`. PR description: what changed + how to test on a phone.
- Before opening a PR: `npm run build` and `npx tsc --noEmit` pass.
- Trello (via Composio): when you start a card move it to **Doing**; when the PR is open move it to **In Review** and comment the PR link; after merge move it to **Done**.
- Use Codex review on PRs before merging.
- Don't build anything that isn't on the board. P0 before P1 before P2.
- Demo data (`isSeed: true`) goes only into the `demo` event. Never seed a real event.
