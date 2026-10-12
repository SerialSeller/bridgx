# BridgX — Product spec

## The problem

At a 300-person event you have about 2 hours. You talk to maybe 8 people, mostly by chance. The person you most needed to meet was probably in the room, and you'll never know.

| Pillar | Pain | What BridgX does |
|---|---|---|
| **Time** | Wandering around, repeating "so what do you do?" twenty times | Shows the 5 people worth your time, ranked, with the reason |
| **Confidence** | Introverts freeze; people skip events when their friend cancels | You walk in knowing who to find and what to say first (icebreaker + "find me" hint). Works before the event too |
| **Completeness** | "Did I miss someone?" | Everyone at the event is in your pocket; save people and export them as contacts |

**Who uses it**
- **Attendees** — anyone at a meetup, conference, hackathon, career fair, coworking event. Especially people who came alone.
- **Organizers** — want attendees to leave happy, fewer no-shows, and something sponsors value. Setup must take 60 seconds and need no integration (works next to Luma, Eventbrite, Meetup — just share the link/QR).

## Core flows

### Attendee (the demo)
1. Scan the QR (phone camera, no app) → `/e/:slug` shows event name and "**47 people here**".
2. Tap **Join (20 sec)** → one big box: *"Tell us who you are and what you're looking for."* Type one sentence, or tap the mic, or add links/screenshots (smart import).
3. Tap **Build my profile** → AI fills headline, bio, offers, seeking, industries. User reviews (chips toggle on/off), adds name, contacts they want to share, optional "find me" hint and selfie → **Save**.
4. Lands on **Matches**: top 5 people with a kind badge (*Can help you* / *You can help* / *Same world*), shared tags, a one-line *why*, and an *icebreaker* with a copy button. Tap to open the person → WhatsApp / LinkedIn / email.
5. **People** tab: everyone, search by name/text, filter by tag chips. **Saved** tab: starred people + **Export contacts (.vcf)**.

**Skip path:** "Just browse" goes straight to People. Matches tab then shows a friendly prompt to join.

### Organizer
1. `/new` → event name, date, location → **Create**.
2. `/e/:slug/admin?key=…` → big QR, copy join link, download QR PNG, open live screen, open poster, attendee count, top "looking for" and "offering" tags.
3. Put `/e/:slug/live` on the projector: huge QR, live counter, newest joins feed, "What people here are looking for" bars. Updates in real time.
4. Optional: paste the join link into the Luma event description / reminder email so people join **before** arriving.

## Smart import (build a profile from socials)

Goal: a richer profile with less typing, from sources the **user hands us**.

| Source | How | Notes |
|---|---|---|
| One sentence (always) | Text box | The fallback for everything |
| Voice | Record ≤ 30 s in the browser (MediaRecorder) → Convex storage → fal Whisper → text | Same pipeline as text after transcription |
| GitHub | Username or URL → `api.github.com/users/:u` + 8 most recently pushed repos (name, description, language) | Header `User-Agent: bridgx`; optional `GITHUB_TOKEN` |
| Website / portfolio | Fetch URL (6 s timeout, ≤ 300 KB) → strip scripts/styles/tags → title + meta description + first 3,000 chars | Skip on error, keep going |
| LinkedIn / Instagram / X | **Screenshot upload** (≤ 2 images) → vision model reads it | We never scrape these sites. The URL is still saved as a contact link |

All sources are labelled and sent in **one** `ai.extractProfile` call. Response:

```ts
type Extracted = {
  name?: string;
  headline: string;          // ≤ 60 chars, "Role @ Company" style
  bio: string;               // ≤ 200 chars, first person, specific
  offers: NeedTag[];         // ≤ 5
  seeking: NeedTag[];        // ≤ 5
  industries: IndustryTag[]; // ≤ 4
  suggestedContacts?: { github?: string; website?: string; linkedin?: string; x?: string; instagram?: string };
};
```

The review screen shows **"Built from: ✓ text ✓ GitHub ✓ screenshot"** chips. Nothing is saved until the user taps Save. If the AI call fails, show the empty form with whatever we could parse — joining must never be blocked.

## Matching

Deterministic score on shared tags (see AGENTS.md) — fast, free, explainable, live. AI only writes the *why* + *icebreaker* for the top 3 and caches it.

`ai.explainMatches` prompt input: my headline/bio/tags + each candidate's headline/bio/tags + overlapping tags. Output per candidate:
- `why`: ≤ 140 chars, specific ("She's hiring a backend dev for a fintech app — that's exactly your stack.")
- `icebreaker`: ≤ 120 chars, natural first line I could say out loud, references something concrete from their profile. No "Hi, I noticed that…" clichés.

## Privacy (say this in the pitch)

- Consent first: we only read what you hand us; you review everything before it's public.
- You choose which contacts to show. Event-scoped: profiles live inside one event.
- No phone numbers or emails are sent to the AI.

## Out of scope today

Accounts/login, chat/messaging, push notifications, payments, Luma API, scraping social sites, native apps, multi-language.

## Stretch ideas (P2, only after all P1 is done)

- Mutual 👋 wave: both wave → both see "you both want to meet" (less awkward).
- Paste a Luma link on `/new` → prefill name/date/cover from the page's public meta tags.
- Organizer insights card: top needs vs offers, industries mix.
- fal-generated illustrated avatar for people without a photo.
- Post-event digest: "5 people you saved but didn't meet + a message draft".
