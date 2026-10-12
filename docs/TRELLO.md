# BridgX — Trello board spec (for Codex via Composio)

## Instructions for Codex

Use the Composio Trello tools to build this board exactly. Do it once; if a board named **BridgX — Codex Hackathon** already exists, update it instead of creating a duplicate.

1. **Workspace:** create a Trello workspace (organization) named **BridgX**. If the tools can't create workspaces, use the default workspace and continue.
2. **Board:** create **BridgX — Codex Hackathon** in that workspace. Remove Trello's default lists.
3. **Lists**, in this order (`pos` 1–7):
   1. `P0 · Core (by 13:45)`
   2. `P1 · Wow (by 15:00)`
   3. `Ship (15:00–15:45)`
   4. `Doing`
   5. `In Review`
   6. `Done`
   7. `P2 · Stretch`
4. **Labels:** `Musa` (blue), `Abdullah` (green), `Both` (purple), `P0` (red), `P1` (orange), `P2` (yellow), `backend` (sky), `frontend` (lime), `AI` (pink), `pitch` (black).
5. **Members:** invite `<MUSA_EMAIL>` and `<ABDULLAH_EMAIL>` if supported (replace placeholders first). Otherwise the owner labels are enough.
6. **Cards:** create every card below in its list, in order (`pos` 1, 2, 3… per list). Card name = `<ID> · <title>`. Put the description in the card description and each acceptance item as a checklist item in a checklist named `Done when`. Due dates are already UTC (Istanbul = UTC+3) — use them exactly.
7. Pin a first card in `P0 · Core` named `📌 Rules` with the "Working agreement" section as its description.
8. When finished, print the board URL.

## Working agreement

- Start a card → move to **Doing**. PR opened → move to **In Review** + comment the PR link. Merged → **Done**.
- Branch `musa/<ID>-short-name` or `abdullah/<ID>-short-name`. PR title `[<ID>] title`.
- P0 before P1 before P2. Feature freeze 15:00. Submit 15:45. Deadline 16:00.
- Musa owns the heavy parts (backend, AI, onboarding, matching). Abdullah owns UI screens, organizer pages, demo data, assets, and submission.

---

## List: P0 · Core (by 13:45)

### S1 · Repo + scaffold
- Labels: Musa, P0, frontend · Due: 2026-10-12T09:00:00.000Z
- Description: The repo root is the existing `bridgx/` folder — **never delete or overwrite `AGENTS.md` or `docs/`**. Scaffold Vite React TS in a temp folder next to it (`npm create vite@latest bridgx-tmp -- --template react-ts`), copy everything from it into `bridgx/` (including `.gitignore`), delete the temp folder. Install `convex react-router qrcode.react lucide-react`, Tailwind v4 (`tailwindcss @tailwindcss/vite`, add plugin, `@import "tailwindcss";`). Wrap the app in `ConvexProvider` with `import.meta.env.VITE_CONVEX_URL`. Add `netlify.toml` from AGENTS.md. `git init`, create **public** GitHub repo `bridgx`, push `main`, add Abdullah as collaborator. Musa runs `npx convex dev` once himself (it's interactive: login + create project).
- Done when:
  - [ ] `npm run dev` shows a BridgX placeholder page
  - [ ] Public GitHub repo exists with `main` pushed
  - [ ] Abdullah has write access

### S2 · Convex env + AI smoke test
- Labels: Musa, P0, AI · Due: 2026-10-12T09:00:00.000Z
- Description: Set Convex env vars from AGENTS.md (dev). Run one curl against `https://fal.run/openrouter/router/openai/v1/chat/completions` with `LLM_MODEL` asking for a tiny JSON object, and one with an `image_url` part, to confirm the model slug, JSON mode and vision all work. Write the working model slug back into AGENTS.md.
- Done when:
  - [ ] Text JSON call works
  - [ ] Image call works (or note the fallback model that does)
  - [ ] Exact model slug recorded in AGENTS.md

### S3 · Netlify deploy
- Labels: Abdullah, P0, frontend · Due: 2026-10-12T09:15:00.000Z
- Description: Connect the GitHub repo to a new Netlify site. Build settings come from `netlify.toml`. Add `CONVEX_DEPLOY_KEY` (Convex dashboard → production deploy key) in Netlify env. After the first deploy, set the Convex **prod** env vars too (`npx convex env set --prod …`). Rename the site to something like `bridgx.netlify.app` if free.
- Done when:
  - [ ] Pushing to `main` deploys automatically
  - [ ] Live URL opens on a phone, including a deep route like `/e/test` (SPA redirect works)
  - [ ] Live URL posted in the team chat

### S4 · Trello board
- Labels: Abdullah, P0 · Due: 2026-10-12T09:00:00.000Z
- Description: Build this board from `docs/TRELLO.md` with Codex + Composio. Max 15 minutes — if Composio fights you, create the lists by hand and move on.
- Done when:
  - [ ] Board exists with all lists, labels and cards

### C1 · Convex schema + core functions
- Labels: Musa, P0, backend · Due: 2026-10-12T09:30:00.000Z
- Description: Implement `convex/schema.ts` and `convex/tags.ts` exactly as in AGENTS.md. Functions: `events.create` (returns `{slug, adminKey}`; slug from name + 4 random chars), `events.getBySlug`, `attendees.create` (returns `{attendeeId, editKey}`), `attendees.update` (checks editKey), `attendees.get`, `attendees.listByEvent`, `attendees.count`, `attendees.recent` (last 10), `saves.toggle` / `saves.listMine` (check editKey), `files.generateUploadUrl`. All public reads go through `publicAttendee()` (no secrets, includes photo URL). Add `src/lib/identity.ts` for `localStorage["bridgx:<slug>"]`. **Ship this first — Abdullah's screens depend on it.**
- Done when:
  - [ ] All functions callable from the dashboard
  - [ ] No query returns `editKey` or `adminKey`
  - [ ] Abdullah told the function names

### C2 · AI profile extraction
- Labels: Musa, P0, AI, backend · Due: 2026-10-12T10:00:00.000Z
- Description: `convex/llm.ts` `chatJSON()` (fetch, 20 s timeout, JSON parse, `null` on failure). `convex/prompts.ts` extraction prompt with both tag vocabularies and the rules (cofounder in both lists, invest/raise meanings, max counts, no invented facts). `ai.extractProfile` action takes `{ text, sources?: {label, content}[], imageUrls?: string[] }` and returns the `Extracted` shape from SPEC.md, validated against the vocab. Designed so smart import (W1) only adds more `sources`.
- Done when:
  - [ ] "I'm a React dev at a fintech startup, looking for a cofounder with sales skills" → sensible headline, `offers:[frontend, cofounder]`, `seeking:[sales, cofounder]`, `industries:[fintech]`
  - [ ] Invalid tags are dropped; bad AI response returns a safe empty result

### A1 · App shell + design system
- Labels: Abdullah, P0, frontend · Due: 2026-10-12T09:30:00.000Z
- Description: Routes from AGENTS.md (placeholders are fine), mobile layout (`max-w-md mx-auto`), bottom tab bar for event pages (People · Matches · Saved · Me), BridgX wordmark, color + type tokens in Tailwind theme, `components/ui`: Button, Card, Chip (toggleable), Avatar (photo or initials), Sheet, EmptyState, Spinner. Home `/` with one-line pitch, "Create an event", "Try the demo".
- Done when:
  - [ ] Every route renders something on a 390px screen
  - [ ] UI components used by at least one screen

### A2 · Create event + event landing + admin QR
- Labels: Abdullah, P0, frontend · Due: 2026-10-12T10:00:00.000Z
- Description: `/new` form (name, date, location) → `events.create` → redirect to `/e/:slug/admin?key=…`. Admin page: big QR (`qrcode.react`) for the join URL `https://<site>/e/:slug`, copy link, download QR as PNG, links to live screen and poster, live attendee count. `/e/:slug` landing: event name, "N people here" (live), **Join (20 sec)** → `/join`, **Just browse** → `/people`. Unknown slug → friendly 404.
- Done when:
  - [ ] Create event → scan QR with a phone → lands on the event page
  - [ ] Count updates live when someone joins

### A3 · Directory + person page
- Labels: Abdullah, P0, frontend · Due: 2026-10-12T10:30:00.000Z
- Description: `/e/:slug/people`: search box (name, headline, bio), horizontal tag filter chips (offers/seeking, from `convex/tags.ts`), person cards (avatar, name, headline, up to 3 offer chips, "looking for" line). `/e/:slug/p/:id`: full profile, find-me hint, contact buttons (WhatsApp `wa.me`, email, LinkedIn, Instagram, X, GitHub, website — only those present), ☆ Save (needs identity; if not joined, prompt to join).
- Done when:
  - [ ] 40 seed profiles scroll smoothly; search + filter work together
  - [ ] Contact buttons open the right app on a phone

### A4 · Demo seed data
- Labels: Abdullah, P0, backend · Due: 2026-10-12T10:30:00.000Z
- Description: `convex/seedData.ts`: 40 realistic profiles for an Istanbul tech meetup — mix of devs, designers, founders, investors, marketers, students, recruiters; Turkish and international names; offers/seeking use only vocab keys and create obvious complementary pairs; fake contacts (`example.com`, `linkedin.com/in/demo-…`). `convex/seed.ts` `internalMutation run({slug, name})`: create event if missing, insert with `isSeed: true`, idempotent. Seed only the `demo` event.
- Done when:
  - [ ] `npx convex run seed:run '{"slug":"demo","name":"BridgX Demo Night"}'` fills `/e/demo/people`
  - [ ] Re-running doesn't duplicate

### C3 · Onboarding (join flow)
- Labels: Musa, P0, frontend, AI · Due: 2026-10-12T10:30:00.000Z
- Description: `/e/:slug/join` per SPEC.md. Step 1: one big text box + **Build my profile** (calls `ai.extractProfile`, shows a short "reading you…" state). Step 2: review — name, headline, bio editable; offers/seeking/industries as toggle chips (all vocab available, AI picks preselected); contacts (WhatsApp, email, LinkedIn, Instagram, X, GitHub, website — all optional, "only add what you're happy to share here"); find-me hint; optional selfie upload. **Save** → `attendees.create` → store identity → go to Matches. "Skip, just browse" link always visible. If AI fails, show the empty review form.
- Done when:
  - [ ] Phone → one sentence → saved profile in under 30 s
  - [ ] Works with AI disabled (wrong key) — user can still fill and save
  - [ ] Returning visitor with identity goes to Matches, can edit profile from "Me"

### C4 · Matches
- Labels: Musa, P0, AI, backend, frontend · Due: 2026-10-12T10:45:00.000Z
- Description: `matches.forMe({attendeeId})` query with the scoring from AGENTS.md (top 5, kind + overlapping tags + cached text). `ai.explainMatches` action for up to 3 uncached matches in one AI call → writes `matchText`; template fallback if AI fails. `/e/:slug/matches` UI: cards with kind badge (*Can help you* / *You can help* / *Same world*), shared tag chips, *why*, *icebreaker* with copy button, tap → person page. Not joined → prompt to join.
- Done when:
  - [ ] Joining the demo event as "backend dev looking for a designer cofounder" shows designers/cofounder-seekers first with sensible text
  - [ ] Matches update when a new matching person joins (live)
  - [ ] Text is cached (second visit makes no AI call)

### M1 · Milestone: full flow live + use it here
- Labels: Both, P0 · Due: 2026-10-12T10:45:00.000Z
- Description: On the Netlify URL with two real phones: create event → scan → join → matches → contact → save. Then create the real event **Codex Hackathon Istanbul** on prod and ask the organizers if you can share the QR with participants. Real hackers joining = proof for the pitch.
- Done when:
  - [ ] Whole flow works on iPhone Safari and Android Chrome
  - [ ] Real event created, first real people joined

---

## List: P1 · Wow (by 15:00)

### W1 · Smart import from socials
- Labels: Musa, P1, AI, backend, frontend · Due: 2026-10-12T11:30:00.000Z
- Description: Per SPEC.md "Smart import". Join step 1 gets an "Add links or screenshots" section: GitHub, website, LinkedIn/Instagram/X URL fields, and screenshot upload (≤ 2). `enrich.ts`: `readGithub(username)`, `readWebsite(url)` (timeouts, size cap, strip HTML, never throw). Screenshots → storage URL → `imageUrls` for the vision call. Never fetch LinkedIn/Instagram/X pages — their URLs only become contact links. Review screen shows "Built from" chips.
- Done when:
  - [ ] GitHub username alone produces a good dev profile
  - [ ] LinkedIn screenshot alone produces headline + tags
  - [ ] Any failing source is skipped silently; the rest still work

### W4 · Live projector screen
- Labels: Abdullah, P1, frontend · Due: 2026-10-12T11:30:00.000Z
- Description: `/e/:slug/live`, landscape, dark: huge QR + join URL, big live counter, feed of the newest 8 joins (avatar, name, headline, animate in), "What people here are looking for" — top 6 `seeking` tags as bars. Realtime via Convex queries; no refresh needed.
- Done when:
  - [ ] Someone joins on a phone → appears on the screen within ~1 s
  - [ ] Readable from 5 meters on a laptop/projector

### W5 · Saved + export contacts
- Labels: Abdullah, P1, frontend · Due: 2026-10-12T11:30:00.000Z
- Description: `/e/:slug/saved` lists saved people (`saves.listMine`). **Export contacts** builds one `.vcf` with all of them (FN, TITLE, EMAIL, TEL, URL for LinkedIn/website, NOTE "Met at <event> via BridgX") and downloads it. Single-person "Add to contacts" on the person page too.
- Done when:
  - [ ] Exported file imports into iPhone and Android contacts

### W2 · Voice onboarding
- Labels: Musa, P1, AI · Due: 2026-10-12T12:00:00.000Z
- Description: Mic button in join step 1: record ≤ 30 s (MediaRecorder; handle iOS Safari's mp4/aac), upload to Convex storage, `ai.transcribe` action calls fal Whisper with the storage URL, put the transcript into the text box, then run extraction.
- Done when:
  - [ ] Speaking one sentence on an iPhone fills the profile

### W3 · Match quality + resilience pass
- Labels: Musa, P1, AI · Due: 2026-10-12T12:00:00.000Z
- Description: Tune the extraction and explanation prompts on 10 varied inputs (Turkish + English, vague inputs, investors, students). Check the fallback path with a broken key. Make sure no AI call happens on page loads that don't need it.
- Done when:
  - [ ] 10 test inputs give sensible tags and text
  - [ ] App fully usable with AI down

### W6 · fal.ai event poster
- Labels: Abdullah, P1, frontend, AI · Due: 2026-10-12T12:00:00.000Z
- Description: Ask fal Agent which image model to use for a bold, minimal "meet everyone here" poster background (no text in the image). Generate 2–3 options with fal, save the best to `public/poster-bg.png`. `/e/:slug/poster`: A4 portrait, background + event name + "Scan to meet everyone here" + big QR + BridgX wordmark, print CSS (`@page { size: A4 }`). Bonus: generate per-event backgrounds from the event name via a Convex action.
- Done when:
  - [ ] Poster prints cleanly / saves as PDF from the browser
  - [ ] The QR on the printed poster scans

### W7 · Find-me + selfie on cards
- Labels: Abdullah, P1, frontend · Due: 2026-10-12T12:00:00.000Z
- Description: Show selfie (or initials avatar) and the find-me hint ("📍 Blue jacket, near the coffee bar") on person cards, the person page and match cards. Musa's join flow already stores `photoId` and `findMe`.
- Done when:
  - [ ] You can physically find a person from their card

---

## List: Ship (15:00–15:45)

### F1 · Feature freeze + bug bash
- Labels: Both, P0 · Due: 2026-10-12T12:20:00.000Z
- Description: 15:00 no new features. Both run the full demo flow on two phones on the live URL, fix only what breaks the demo. Clear test junk from the real event (keep real people).
- Done when:
  - [ ] Demo flow passes 3 times in a row

### F6 · Codex usage evidence
- Labels: Musa, pitch · Due: 2026-10-12T12:35:00.000Z
- Description: Count Codex tasks run and PRs merged, screenshot the Codex task list, the PR list with Codex reviews, and this Trello board. Put the numbers into `docs/PITCH.md` and the README.
- Done when:
  - [ ] Numbers + 3 screenshots ready

### F2 · README
- Labels: Abdullah, pitch · Due: 2026-10-12T12:35:00.000Z
- Description: One-line pitch, live link, 3 screenshots (join, matches, live screen), the problem (3 pillars), how it works (matching + smart import), how Codex was used (numbers from F6), how fal.ai was used, tech stack, run locally.
- Done when:
  - [ ] README renders well on GitHub

### F3 · Backup demo video
- Labels: Abdullah, pitch · Due: 2026-10-12T12:35:00.000Z
- Description: 60–90 s phone screen recording of the full flow (scan → join → matches → contact → live screen). Keep it on both laptops in case Wi-Fi dies during judging.
- Done when:
  - [ ] Video plays offline on both laptops

### F4 · Pitch rehearsal
- Labels: Both, pitch · Due: 2026-10-12T12:40:00.000Z
- Description: Run `docs/PITCH.md` 3 times with a 2:00 timer, then the 3:00 finals version once. Practise the Q&A answers.
- Done when:
  - [ ] Under 2:00 three times

### F5 · Submit the form
- Labels: Abdullah, pitch · Due: 2026-10-12T12:45:00.000Z
- Description: Submit the Google Form using the draft answers in `docs/PITCH.md`. Check the GitHub repo is **public** (private is rejected) and the live link works in an incognito window. Only claim features that actually shipped.
- Done when:
  - [ ] Form submitted before 15:45

---

## List: P2 · Stretch (only if all P1 is done)

### X1 · Mutual 👋 wave
- Labels: Musa, P2 · Description: Wave at someone; when both waved, both see "You both want to meet 👋" at the top of Matches.

### X2 · Luma link import
- Labels: Abdullah, P2 · Description: On `/new`, paste a Luma URL → Convex action reads the page's public `og:title`, `og:image` and date → prefills the form.

### X3 · Organizer insights
- Labels: Abdullah, P2 · Description: Admin page card: top needs vs top offers, industry mix, "unmet needs" (needs nobody offers).

### X4 · fal avatars
- Labels: Musa, P2 · Description: For people without a selfie, generate an illustrated avatar from their headline with fal (no real faces).
