# BridgX — Pitch, demo and submission

Judging: **2:00 pitch + demo**, 1:00 Q&A, one judge. Finals: 3:00 + 1:00 Q&A on stage.
Scored 1–5 on: Problem & value · Execution & quality · Use of Codex & tools · Potential & impact · Pitch quality (20% each).

## Before you walk in

- Laptop: `/e/codex-hack-…/live` open full screen (real hackathon event), backup video ready offline.
- Phone A: already joined the real event, Matches tab open.
- Printed or on-screen QR for the judge to scan.
- Know the live numbers: people joined, matches shown.

## 2:00 script

**0:00 — Hook (15 s)**
"Last month I went to an event with 300 people. I had two hours. I talked to eight — mostly by luck. The person I really needed to meet was probably in that room, and I'll never know. And if you're an introvert, or you came alone, it's worse."

**0:15 — Live demo (70 s)**
- "Scan this." (judge scans the QR) → "No app, no login."
- On the join screen: type one sentence — or drop a LinkedIn screenshot, or a GitHub link. "BridgX builds your profile in seconds."
- Matches: "These are the 5 people here you should meet — *why*, and the first line to say. This one needs a backend dev; you are one."
- Tap WhatsApp → "Connected. No small talk."
- Turn the laptop: "That's you, just appeared on the live screen. **[N] people at this hackathon joined today.**"

**1:25 — Why it matters (20 s)**
"Three things: you save time, you never walk in cold, and you don't leave wondering who you missed. For organizers it's 60 seconds to set up, works next to Luma or Eventbrite — just share the QR — and people who see their matches before the event actually show up."

**1:45 — How we built it (15 s)**
"Built today with Codex: two people, two Codex sessions sharing one AGENTS.md, a Trello board Codex ran through Composio, [X] Codex tasks, [Y] PRs. AI runs on OpenAI models through fal's router, voice through fal Whisper, the poster art from fal."

**3:00 finals version:** add the smart import demo (screenshot → profile), the organizer admin page, and the business model.

## Q&A prep

| Question | Answer |
|---|---|
| How is this different from LinkedIn? | LinkedIn doesn't know who's in this room right now, or what they need today. |
| Brella / Swapcard / Grip? | Enterprise tools: expensive, app download, weeks of setup, built for big conferences. BridgX is one QR and 60 seconds, for any meetup. |
| Why would people fill it in? | It takes 20 seconds — one sentence or a screenshot — and the payoff is instant: your matches. You can also just browse. |
| Privacy? | Consent first. We only read what you hand us, you review before anything is public, you choose which contacts to show, and phone numbers/emails never go to the AI. We never scrape social sites. |
| How does matching work? | What you're looking for vs what others offer, on a shared tag vocabulary — fast, free, explainable, works even if AI is down. AI writes the why and the icebreaker for your top matches. |
| Cold start? | The organizer puts the QR on the screen and in the Luma reminder. Even 20% of a 300-person room is 60 profiles — more than you'd ever meet by walking around. |
| Business model? | Free up to 100 attendees. Paid per event for branding, organizer insights, contact export and sponsor matching. Annual plans for communities, coworkings, universities and accelerators. |
| What's next? | One profile across every event, mutual wave, post-event follow-up digest, Luma/Eventbrite integrations. |

**Tailor to your judge:**
- **OpenAI (Applied AI):** the Codex workflow and the OpenAI models behind the matching and vision import.
- **fal.ai:** fal router powering all the AI, Whisper voice onboarding, fal-generated poster.
- **Slush'D (events / partnerships):** the organizer side — 60-second setup, live screen, fewer no-shows, insights for sponsors. They run events like this one; they are the customer.
- **Founders / CTOs:** cold start, business model, why the deterministic matching scales.

## Submission form — draft answers

Fill in the brackets and **delete any feature that didn't ship**.

- **Team name:** BridgX
- **One-line project description:** BridgX turns any event into a smart network: attendees scan one QR, get an AI-built profile in 20 seconds, and instantly see who they should meet, why, and what to say first — so nobody leaves a 300-person event having met only 8.
- **Public GitHub repository link:** [https://github.com/…/bridgx]
- **Live project/Demo link:** [https://bridgx.netlify.app]
- **How did your team use Codex?**
  Codex was our whole build team. We wrote an AGENTS.md contract (stack, data model, folder ownership, rules) so two Codex sessions could build in parallel without conflicts. Codex scaffolded the repo, created and ran our Trello board through Composio (moving cards and linking PRs), built the Convex backend, the AI profile extraction and smart import, the matching engine, and every screen, reviewed our PRs, and fixed bugs we found testing on phones. [X] Codex tasks, [Y] PRs merged in one day.
- **Did your team use fal.ai? For what?**
  Yes. All BridgX AI runs on OpenAI models through fal's OpenRouter router: building profiles from text, GitHub, websites and LinkedIn screenshots (vision), and writing match explanations and icebreakers. fal Whisper powers voice onboarding, and we generated the printable event poster art with fal.
- **Team members:** [Musa — full name, email, LinkedIn] · [Abdullah — full name, email, LinkedIn]
