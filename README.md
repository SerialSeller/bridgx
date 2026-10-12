# BridgX

***Every physical gathering becomes a searchable intelligence network.***

Attendees scan one QR, get an AI-built profile in ~20 seconds, and instantly see **who they should meet, why, and what to say first**. Organizers create an event in 60 seconds and print the QR. No app, no login.

**Live:** [bridgx-6or8.netlify.app](https://bridgx-6or8.netlify.app) · **Try the demo event:** [/e/demo](https://bridgx-6or8.netlify.app/e/demo) · **Create an event:** [/new](https://bridgx-6or8.netlify.app/new)

---

## The problem

- **Time.** 300 people, 2 hours. You meet 8, mostly by luck.
- **Confidence.** Introverts and people who came alone walk in cold, with no idea who to approach.
- **Completeness.** You leave wondering who you missed. Usually the person you most needed was in the room.

## What we built

**For attendees**
- **Join in 20 seconds.** Type one sentence about who you are and what you're looking for. AI builds your headline, bio, and *offers / looking for / industry* tags. You review everything before anything is shared. If the AI is down, a manual form takes over, so joining never breaks.
- **Who you should meet.** Your top 5 matches, ranked by what you need vs. what they offer. Each one has a *why* line and an icebreaker (AI-written for your top 3, template-based otherwise), plus one-tap WhatsApp / LinkedIn / email.
- **People directory.** Search everyone at the event, filter by tag, open person pages with a "find me" hint (e.g. *"blue jacket, near the coffee bar"*).
- **Save and export.** Save people from their profile page, then export them all as phone contacts (`.vcf`).

**For organizers**
- **Create an event** in 60 seconds (name, date, location).
- **Admin page** (private link with an admin key) with the event QR, join link, QR PNG download and a live attendee count.
- **Live projector screen** with a live counter, a just-joined feed and what people here are looking for. It updates in real time.
- **Printable A4 poster** with the QR.

## How matching works

Offers and seeking share **one fixed tag vocabulary** (`convex/tags.ts`), so a match is an exact overlap, not a guess.

```
need  = |my needs ∩ their offers|        // they can help me
give  = |their needs ∩ my offers|        // I can help them
same  = |shared industries| + 0.5 × |shared offers|
score = 3·need + 2·give + same           // top 5, skip self and zero scores
```

- **Deterministic and explainable.** Every match shows the tags behind it.
- **Live.** It is a Convex query, so matches update as people join.
- **AI only writes the words.** The *why* and icebreaker are generated for the top 3 and cached. A template fallback built from the shared tags means the screen never breaks.

## Privacy

- **Consent first.** We only use what you type. You review your profile before it is saved.
- **You choose** which contacts to show.
- **Phone numbers and emails are never sent to the AI.** Contact details are redacted before any text reaches the model.
- **Event-scoped.** Profiles live inside one event.
- **No scraping** of LinkedIn, Instagram, X or any other social network.

## Built with

- **Frontend:** Vite, React 19, React Router, TypeScript, Tailwind CSS v4
- **Backend:** Convex (database, realtime queries, functions)
- **Hosting:** Netlify
- **AI:** OpenAI models (`openai/gpt-6-luna`) through fal.ai's OpenRouter router, billed to fal credits

## How we used Codex

- **Two people, parallel Codex sessions**, each in its own git worktree, sharing one contract: [`AGENTS.md`](AGENTS.md) (stack, data model, folder ownership, rules).
- **Every task was a Trello card** (board run through the Composio plugin), then its own branch and PR, then reviewed by Codex on GitHub, then squash-merged.
- **Codex wrote** the Convex backend with automated tests (`convex-test` + `vitest`), the AI extraction and matching logic, and the UI.

## How we used fal.ai

Every AI call goes through **fal's OpenRouter router** (OpenAI models):

- **Profile extraction:** one sentence in, structured profile with vocabulary-checked tags out.
- **Match explanations and icebreakers** for your top matches.

## Run locally

```sh
npm install
npx convex dev      # terminal 1: pushes functions, writes VITE_CONVEX_URL to .env.local
npm run dev         # terminal 2: http://localhost:5173
```

```sh
npm test            # backend tests (convex-test + vitest)
npx convex run seed:run '{"slug":"demo","name":"BridgX Demo Night"}'   # load demo profiles
```

The AI needs `LLM_BASE_URL`, `LLM_AUTH` and `LLM_MODEL` set as Convex env vars. Without them the app still works: joining falls back to the manual form and matches use template text. See [`AGENTS.md`](AGENTS.md) for the full setup.

## Docs

[`AGENTS.md`](AGENTS.md) (the shared contract) · [`docs/SPEC.md`](docs/SPEC.md) (product spec) · [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) (Netlify + Convex deploy)

## Team

**Musa & Abdullah**, OpenAI Codex Hackathon, Istanbul, 12 Oct 2026.
