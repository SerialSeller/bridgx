# BridgX — Design system

> Warm paper, one bold blue, one gold button. Calm enough for introverts, confident enough for a stage demo.

Light theme only. Mobile first (390px). Flat: **no shadows anywhere** — layers are separated by color (cream → white) and space.

## Principles

1. **One gold button per screen.** Gold (`#ffba09`) is the single primary action: Join, Build my profile, Save, Create event, Export. Everything else is outlined or text.
2. **Ultramarine is a moment, not a color.** `#1009f6` appears on at most 1–2 surfaces per screen (event hero, top match, live screen). Never for body text, borders or small accents.
3. **Paper calm.** Cream canvas, white cards, generous spacing, one font family. Personality comes from pill shapes, big rounded panels and small hand-drawn squiggles — not from more colors.
4. **Pills everywhere you tap.** Buttons, chips, tabs and badges are fully rounded (`999px`).

## Tokens

### Colors

| Token | Value | Use |
|---|---|---|
| `cream` | `#f0f0ec` | Page background (≈70% of every screen) |
| `pearl` | `#f7f7f3` | Inset blocks inside white cards (icebreaker box, input fill) |
| `white` | `#ffffff` | Cards, sheets, tab bar |
| `concrete` | `#eaeae6` | Hairline borders, dividers, disabled fills |
| `smoke` | `#d4d4d0` | Input borders only — **never text** (fails contrast) |
| `ink` | `#1a1a1a` | Primary text, headings, outlined-button borders, selected chips |
| `charcoal` | `#4d4d4d` | Secondary text, headlines under names |
| `dim` | `#6d6868` | Captions, timestamps, helper text |
| `ultramarine` | `#1009f6` | Brand surfaces (with white text) |
| `royal` | `#505cf9` | Cards placed *on* ultramarine (live screen feed) |
| `gold` | `#ffba09` | The primary button; bars on the live screen |
| `tangerine` | `#ff3b09` | Squiggle decorations; error text/icons |
| `mint` | `#00e9a7` | Badge: *Can help you*; success toasts |
| `sky` | `#add3e5` | Badge: *You can help*; "find me" block |
| `thistle` | `#e3c7de` | Badge: *Same world*; avatar fallback tint |

Avatar initials backgrounds rotate by name hash: `sky`, `thistle`, `mint`, `#ffe1a0` (light gold), `concrete`.

### Typography

One family for everything: **Inter Variable** (`npm i @fontsource-variable/inter`, `import "@fontsource-variable/inter"` in `main.tsx`). Weights 400 and 700 only. Hierarchy comes from size and weight, never a second font.

| Role | Size / line-height | Weight | Tailwind |
|---|---|---|---|
| Display (event name, page titles) | 32 / 1.15 | 700 | `text-[32px] leading-[1.15] font-bold` |
| Heading (section titles) | 24 / 1.25 | 700 | `text-2xl font-bold` |
| Title (card names) | 18 / 1.3 | 700 | `text-lg font-bold` |
| Body | 16 / 1.5 | 400 | `text-base` |
| Body small (headlines, meta) | 14 / 1.4 | 400 | `text-sm` |
| Label (chips, badges, buttons) | 14 / 1 | 700 | `text-sm font-bold` |
| Caption | 12 / 1.4 | 400 | `text-xs` |
| Live screen counter | 120–160 / 1 | 700 | `text-[140px] leading-none font-bold` |

Letter spacing normal. Numbers in counters use `tabular-nums`.

### Shape and space

| Thing | Value |
|---|---|
| Buttons, chips, badges, tabs, search field | `rounded-full` |
| Cards | `rounded-[24px]` |
| Hero panels, photos, QR containers | `rounded-[40px]` (photos: `rounded-[28px]` below 64px size) |
| Inputs and textareas | `rounded-[12px]` |
| Screen side padding | 16px (`px-4`) |
| Card padding | 20px (`p-5`); hero panels 24px (`p-6`) |
| Gap between cards | 12px (`gap-3`) |
| Gap between sections | 32px (`gap-8`) |
| Min tap target | 44px; primary buttons 52px tall |

Icons: `lucide-react`, 20px, `strokeWidth={1.75}`, color inherits text.

### Tailwind v4 (`src/index.css`)

```css
@import "tailwindcss";

@theme {
  --font-sans: "Inter Variable", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;

  --color-cream: #f0f0ec;
  --color-pearl: #f7f7f3;
  --color-concrete: #eaeae6;
  --color-smoke: #d4d4d0;
  --color-ink: #1a1a1a;
  --color-charcoal: #4d4d4d;
  --color-dim: #6d6868;
  --color-ultramarine: #1009f6;
  --color-royal: #505cf9;
  --color-gold: #ffba09;
  --color-tangerine: #ff3b09;
  --color-mint: #00e9a7;
  --color-sky: #add3e5;
  --color-thistle: #e3c7de;
}

@layer base {
  html { background: var(--color-cream); }
  body { @apply bg-cream text-ink font-sans antialiased; }
  ::selection { background: var(--color-gold); color: var(--color-ink); }
}
```

## Components (`src/components/ui/`)

| Component | Spec |
|---|---|
| **Button — primary** | `bg-gold text-ink border border-ink rounded-full h-[52px] px-7 text-sm font-bold w-full` (full width on mobile). Pressed: `active:translate-y-px`. Disabled: `bg-concrete border-concrete text-dim`. Loading: spinner + verb ("Reading you…"). |
| **Button — outline** | `bg-transparent text-ink border border-ink rounded-full h-[52px] px-6 text-sm font-bold`. Small variant `h-9 px-4` for in-card actions (Copy, Open). |
| **Button — on brand** | On ultramarine: `bg-white text-ink rounded-full` (never gold on ultramarine except the live screen bars). |
| **Text link** | `text-ink underline underline-offset-4 decoration-smoke` — used for "Skip, just browse". |
| **Card** | `bg-white rounded-[24px] p-5` — no border, no shadow. |
| **Brand card** | `bg-ultramarine text-white rounded-[40px] p-6`. Secondary text on it: `text-white/75`. |
| **Inset** | `bg-pearl rounded-[16px] p-4` — icebreaker quote, find-me hint, small stats. |
| **Chip (tag)** | `bg-cream text-ink rounded-full px-3.5 h-8 text-sm font-bold` inside white cards; `bg-white` when on cream. **Selected** (toggle): `bg-ink text-white`. Horizontal chip rows scroll: `flex gap-2 overflow-x-auto no-scrollbar`. |
| **Badge (match kind)** | Pill `h-7 px-3 text-xs font-bold text-ink`: *Can help you* `bg-mint`, *You can help* `bg-sky`, *Same world* `bg-thistle`. On ultramarine: `bg-white`. |
| **Input / textarea** | `bg-white border border-smoke rounded-[12px] px-4 py-3 text-base placeholder:text-dim focus:border-ink focus:outline-none`. Label above: `text-sm font-bold`. Helper below: `text-xs text-dim`. **Font size 16px** so iOS doesn't zoom. |
| **Search field** | Like input but `rounded-full h-12 pl-11` with a search icon. |
| **Avatar** | Photo: `rounded-[28px]` (48–64px) or `rounded-[40px]` (96px+), `object-cover`. No photo: same shape, initials `font-bold`, background from the rotation. |
| **Tab bar** | Fixed bottom, `bg-white border-t border-concrete`, height 64px + `pb-[env(safe-area-inset-bottom)]`. 4 items (People · Matches · Saved · Me): icon + `text-xs`. Active: `text-ink font-bold` with a `bg-cream rounded-full` pill behind the icon; inactive `text-dim`. Page content gets `pb-24`. |
| **Sheet** | Bottom sheet `bg-white rounded-t-[32px] p-6`, scrim `bg-ink/40`. |
| **Empty state** | Centered in a white card: squiggle, one `text-lg font-bold` line, one `text-sm text-charcoal` line, one outline button. |
| **Toast** | `bg-ink text-white rounded-full px-5 h-11 text-sm` bottom-center above the tab bar, 2.5s. |
| **Squiggle** | Inline SVG hand-drawn underline/loop, `stroke` gold or tangerine, 3px, round caps. Max one per screen, next to a display heading. |
| **Skeleton** | `bg-concrete rounded-[24px] animate-pulse` blocks in the shape of the cards. |

## Screens

**Home `/`** — Cream. Wordmark "BridgX" (`text-lg font-bold`, the X in ultramarine). White hero panel `rounded-[40px]`: display "Meet the right people at every event." + squiggle, one line of body, gold **Create an event**, outline **Try the demo**. Below: 3 cards — *Save time* / *Never walk in cold* (this one ultramarine) / *Miss no one*.

**Event landing `/e/:slug`** — Ultramarine hero panel: event name (display, white), date · location (`text-white/75`), live count as `text-5xl font-bold` + "people here", a row of 5 overlapping avatars (white 2px ring). Under it: gold **Join in 20 seconds**, text link **Skip, just browse**. Returning member → straight to Matches.

**Join `/e/:slug/join`** — Step dots (1 Tell us · 2 Review). Step 1: display "Who are you, and who do you want to meet?"; big textarea (5 rows) with example placeholder; row of outline small buttons: 🎤 Speak · GitHub · Website · Screenshot; gold **Build my profile**. Building state: the card shows a pulsing squiggle and rotating lines ("Reading your GitHub…", "Finding your people…"). Step 2: "Built from" chips at top; white cards for *About you* (name, headline, bio), *You offer* / *You're looking for* / *Your world* (toggle chips, AI picks preselected), *Find me* (sky inset), *Contacts* (inputs with icons + "Only add what you're happy to share here"), gold **Save & see my matches**.

**Matches `/e/:slug/matches`** — Heading "Who you should meet". **#1 match = brand card** (ultramarine, white badge, white text) — the hero of the demo. Matches 2–5 = white cards. Each: avatar + name + headline, kind badge, shared-tag chips, *why* (body), icebreaker in an inset with a big opening quote mark and small outline **Copy** button, tap anywhere → person. Not joined → empty state with gold Join.

**People `/e/:slug/people`** — Sticky search + scrolling filter chips on cream. List of white cards: 48px avatar, name (title), headline (`text-sm text-charcoal`), up to 3 offer chips, "Looking for …" (`text-xs text-dim`). Count line "47 people" above the list.

**Person `/e/:slug/p/:id`** — 96px avatar `rounded-[40px]`, name display, headline, find-me in sky inset with 📍, bio, chips sections. Primary gold = first available contact ("Say hi on WhatsApp" > LinkedIn > Email). Other contacts as outline pills with icons. Save = outline pill with ☆ / ★.

**Saved `/e/:slug/saved`** — List like People; gold **Export contacts (.vcf)** pinned above the tab bar.

**Admin `/e/:slug/admin`** — White panel with the QR on white in a `rounded-[40px]` concrete-bordered box, join link in a read-only input + Copy, buttons Download QR / Open live screen / Poster, stat insets (people joined, top looking-for).

**Live `/e/:slug/live`** — Full-screen **ultramarine**, landscape grid. Left: QR in a white `rounded-[40px]` card + URL in white. Right: giant white counter + "people here", newest 8 joins as `bg-royal rounded-[24px]` rows (white text) sliding in, "What people here are looking for" as gold bars on royal tracks. No buttons.

**Poster `/e/:slug/poster`** — A4 portrait on cream: ultramarine top panel with the event name, fal-generated art, big QR on white, "Scan to meet everyone here", squiggle, small BridgX wordmark.

## Motion

Subtle and fast: 150–250ms `ease-out`. New list items fade + rise 8px. Live screen join rows slide in from the right. Chip toggle is instant. Respect `prefers-reduced-motion` (disable movement, keep fades).

## Don'ts

- No shadows, gradients or glassmorphism.
- No second filled button color, no gold on more than one button per screen.
- No ultramarine text, borders or icons on light backgrounds.
- No sharp corners on cards (min 24px) and no square buttons.
- No pure black text (`#000`) — use `ink`.
- No `smoke` for text. No text below 12px.
- No emoji as decoration except 📍 (find me) and 🎤 (speak).
