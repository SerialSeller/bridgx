import { Radio, Search, Sparkles, UsersRound } from 'lucide-react'
import { useQuery } from 'convex/react'
import type { ReactNode } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useParams } from 'react-router'
import { api } from '../../../convex/_generated/api'
import { NEED_TAGS } from '../../../convex/tags'
import { Avatar } from '../../components/ui/Avatar'
import { Spinner } from '../../components/ui/Spinner'

const NEED_LABELS: Record<string, string> = NEED_TAGS

const LIVE_STYLES = `
@keyframes bx-pop { 0% { transform: scale(1.15) } 100% { transform: scale(1) } }
@keyframes bx-in { from { opacity: 0; transform: translateX(24px) } to { opacity: 1; transform: none } }
@keyframes bx-grow { from { transform: scaleX(0) } to { transform: scaleX(1) } }
@keyframes bx-blink { 0%, 100% { opacity: 1 } 50% { opacity: 0.35 } }
.bx-pop { display: inline-block; transform-origin: left center; animation: bx-pop 0.5s ease-out }
.bx-in { animation: bx-in 0.5s ease-out both }
.bx-grow { transform-origin: left center; animation: bx-grow 0.8s ease-out both }
.bx-blink { animation: bx-blink 1.6s ease-in-out infinite }
@media (prefers-reduced-motion: reduce) {
  .bx-pop, .bx-in, .bx-grow, .bx-blink { animation: none }
}
`

function Wordmark() {
  return (
    <span className="shrink-0 text-2xl font-bold tracking-tight">
      bridg<span className="text-gold">x</span>
    </span>
  )
}

function Centered({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-svh w-full place-items-center bg-ultramarine p-8 text-white">
      <style>{LIVE_STYLES}</style>
      {children}
    </main>
  )
}

export function LivePage() {
  const { slug = '' } = useParams()
  const event = useQuery(api.events.getBySlug, slug ? { slug } : 'skip')
  const eventArgs = event ? { eventId: event._id } : 'skip'
  const count = useQuery(api.attendees.count, eventArgs)
  const recent = useQuery(api.attendees.recent, eventArgs)
  const all = useQuery(api.attendees.listByEvent, eventArgs)

  if (event === undefined) {
    return (
      <Centered>
        <span className="grid size-20 place-items-center rounded-full bg-white">
          <Spinner size="lg" label="Loading live view" />
        </span>
      </Centered>
    )
  }

  if (event === null) {
    return (
      <Centered>
        <div className="text-center">
          <Wordmark />
          <p className="mt-6 text-4xl font-bold">Event not found</p>
          <p className="mt-3 text-lg text-white/75">Check the link and try again.</p>
        </div>
      </Centered>
    )
  }

  const joinUrl = `${window.location.origin}/e/${slug}`
  const joinLabel = `${window.location.host}/e/${slug}`
  const total = count ?? all?.length ?? 0
  const feed = (recent ?? []).slice(0, 6)

  const tally = new Map<string, number>()
  for (const person of all ?? []) {
    for (const tag of person.seeking ?? []) tally.set(tag, (tally.get(tag) ?? 0) + 1)
  }
  const topNeeds = [...tally.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
  const maxNeed = topNeeds[0]?.[1] ?? 0

  return (
    <main className="min-h-svh w-full bg-ultramarine p-6 text-white sm:p-8 lg:p-12">
      <style>{LIVE_STYLES}</style>

      <header className="flex items-center justify-between gap-6">
        <Wordmark />
        <div className="flex min-w-0 items-center gap-3">
          <span className="hidden items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold tracking-widest text-white uppercase sm:inline-flex">
            <span className="bx-blink size-2 rounded-full bg-mint" aria-hidden="true" />
            Live
          </span>
          <p className="truncate text-lg font-semibold text-white/80 lg:text-2xl">{event.name}</p>
        </div>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:mt-12 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:gap-16">
        <section aria-label="Join this event" className="flex min-w-0 flex-col items-center lg:items-start">
          <div className="w-full max-w-[420px] rounded-[40px] bg-white p-6 text-center lg:p-8">
            <QRCodeSVG
              value={joinUrl}
              size={360}
              level="M"
              marginSize={0}
              fgColor="#1a1a1a"
              bgColor="#ffffff"
              title={`Join ${event.name} on bridgx`}
              className="mx-auto h-auto w-full max-w-[360px]"
            />
            <p className="mt-6 text-2xl font-bold text-ink">Scan to meet everyone here</p>
            <p className="mt-2 text-sm break-all text-muted">{joinLabel}</p>
          </div>
          <p className="mt-6 flex items-center gap-2 text-lg font-semibold text-white/80 sm:text-xl">
            <Sparkles size={20} className="shrink-0 text-gold" aria-hidden="true" />
            No app. No login. 20 seconds.
          </p>
        </section>

        <section aria-label="Live stats" className="flex min-w-0 flex-col gap-10">
          <div aria-live="polite">
            <p className="flex items-center gap-2 text-sm font-bold tracking-widest text-white/70 uppercase">
              <UsersRound size={18} aria-hidden="true" /> In the room
            </p>
            <p className="mt-2 text-[96px] leading-none font-bold tabular-nums sm:text-[120px] lg:text-[160px]">
              <span key={total} className="bx-pop">{total}</span>
            </p>
            <p className="mt-2 text-2xl text-white/80">{total === 1 ? 'person here' : 'people here'}</p>
          </div>

          <div>
            <h2 className="flex items-center gap-2 text-sm font-bold tracking-widest text-white/70 uppercase">
              <Radio size={18} aria-hidden="true" /> Just joined
            </h2>
            {feed.length === 0 ? (
              <p className="mt-4 rounded-[24px] bg-royal px-5 py-6 text-xl font-semibold text-white/85">
                Be the first. Scan the code and say hello.
              </p>
            ) : (
              <ul className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-2">
                {feed.map((person) => (
                  <li key={person._id} className="bx-in flex min-w-0 items-center gap-4 rounded-[24px] bg-royal px-5 py-4">
                    <Avatar name={person.name || 'Guest'} src={person.photoUrl ?? undefined} size="lg" className="shrink-0" />
                    <div className="min-w-0">
                      <p className="truncate text-xl font-bold">{person.name || 'Guest'}</p>
                      {person.headline && <p className="truncate text-white/75">{person.headline}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {topNeeds.length > 0 && (
            <div>
              <h2 className="flex items-center gap-2 text-sm font-bold tracking-widest text-white/70 uppercase">
                <Search size={18} aria-hidden="true" /> What people here are looking for
              </h2>
              <ul className="mt-5 grid grid-cols-1 gap-4">
                {topNeeds.map(([tag, n]) => (
                  <li key={tag} className="min-w-0">
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="min-w-0 truncate text-xl font-bold">{NEED_LABELS[tag] ?? tag}</span>
                      <span className="shrink-0 text-lg font-semibold text-white/75 tabular-nums">{n}</span>
                    </div>
                    <div className="mt-2 h-3 overflow-hidden rounded-full bg-royal">
                      <div
                        className="bx-grow h-full rounded-full bg-gold transition-[width] duration-700 ease-out"
                        style={{ width: `${maxNeed ? Math.max(6, Math.round((n / maxNeed) * 100)) : 0}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
