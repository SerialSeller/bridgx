import { ArrowRight, Check, Copy, MapPin, MessageCircle, Sparkles, UsersRound } from 'lucide-react'
import { useAction, useQuery } from 'convex/react'
import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router'
import { api } from '../../../convex/_generated/api'
import { INDUSTRY_TAGS, NEED_TAGS } from '../../../convex/tags'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { Spinner } from '../../components/ui/Spinner'
import { getIdentity } from '../../lib/identity'

type Kind = 'helps-you' | 'you-help' | 'same-world'
type Contacts = { whatsapp?: string; email?: string; linkedin?: string; instagram?: string; x?: string; github?: string; website?: string }

const KIND_LABEL: Record<Kind, string> = { 'helps-you': 'Can help you', 'you-help': 'You can help', 'same-world': 'Same world' }
const KIND_STYLE: Record<Kind, string> = {
  'helps-you': 'bg-aqua text-brand',
  'you-help': 'border border-line bg-canvas text-ink',
  'same-world': 'border border-line bg-white text-muted',
}
const TAG_LABELS: Record<string, string> = { ...INDUSTRY_TAGS, ...NEED_TAGS }

function withHttps(url: string) {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`
}

// The first contact the person chose to share becomes the one-tap "say hi" action.
function sayHi(contacts: Contacts) {
  const digits = contacts.whatsapp?.replace(/\D/g, '')
  if (digits) return { href: `https://wa.me/${digits}`, label: 'Say hi on WhatsApp' }
  if (contacts.linkedin) return { href: withHttps(contacts.linkedin), label: 'Connect on LinkedIn' }
  if (contacts.instagram) return { href: withHttps(contacts.instagram.startsWith('@') ? `instagram.com/${contacts.instagram.slice(1)}` : contacts.instagram), label: 'Message on Instagram' }
  if (contacts.email) return { href: `mailto:${contacts.email}`, label: 'Send an email' }
  return null
}

function CopyButton({ text, onBrand }: { text: string; onBrand: boolean }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      className={`inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${onBrand ? 'bg-white/15 text-white hover:bg-white/25 focus-visible:outline-white' : 'border border-line bg-white text-ink hover:bg-aqua/40 focus-visible:outline-brand'}`}
    >
      {copied ? <><Check size={14} aria-hidden="true" /> Copied</> : <><Copy size={14} aria-hidden="true" /> Copy</>}
    </button>
  )
}

export function MatchesPage() {
  const { slug = 'demo' } = useParams()
  const identity = getIdentity(slug)
  const me = useQuery(api.attendees.get, identity ? { attendeeId: identity.attendeeId } : 'skip')
  const matches = useQuery(api.matches.forMe, identity && me ? { attendeeId: identity.attendeeId } : 'skip')
  const explainMatches = useAction(api.ai.explainMatches)
  const requested = useRef(false)
  const [writing, setWriting] = useState(false)

  // One AI call writes the intros for every match; until it lands, the tag-based text is shown.
  const needsText = matches?.some((match) => !match.hasExplanation) ?? false
  useEffect(() => {
    if (!identity || !needsText || requested.current) return
    requested.current = true
    setWriting(true)
    explainMatches({ attendeeId: identity.attendeeId, editKey: identity.editKey })
      .catch(() => undefined)
      .finally(() => setWriting(false))
  }, [identity, needsText, explainMatches])

  const header = (
    <header className="mb-7">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.17em] text-brand">Matches</p>
      <h1 className="font-display text-3xl font-bold tracking-[-0.04em] text-ink">Who you should meet</h1>
      <p className="mt-2 text-sm leading-6 text-muted">People here who can help you, need what you offer, or work in your world.</p>
    </header>
  )

  if (!identity || me === null) {
    return <>{header}<EmptyState icon={<Sparkles size={22} />} title="Your matches are waiting" description="Join this event in about 20 seconds to see who you should meet, why, and what to say first." action={<Button asChild size="sm"><Link to={`/e/${slug}/join`}>Create my profile <ArrowRight size={15} /></Link></Button>} /></>
  }

  if (me === undefined || matches === undefined) {
    return <>{header}<div className="flex items-center gap-3 text-sm font-semibold text-muted"><Spinner /> Finding your people…</div></>
  }

  if (matches.length === 0) {
    return <>{header}<EmptyState icon={<UsersRound size={22} />} title="No matches yet" description="As more people join, the ones who fit what you offer and need will appear here — live." action={<Button asChild variant="secondary" size="sm"><Link to={`/e/${slug}/people`}>Browse everyone</Link></Button>} /></>
  }

  return (
    <>
      {header}
      {writing && <p role="status" className="mb-4 flex items-center gap-2 text-xs font-semibold text-brand"><Spinner size="sm" /> Writing your intros…</p>}
      <ol className="flex min-w-0 flex-col gap-4">
        {matches.map((match, index) => {
          const top = index === 0
          const person = match.attendee
          const hi = sayHi(person.contacts)
          const kind = match.kind as Kind
          return (
            <li key={person._id} className="min-w-0">
              <div className={`min-w-0 overflow-hidden rounded-[24px] p-5 ${top ? 'bg-brand text-white' : 'border border-line bg-white'}`}>
                <div className="flex items-start justify-between gap-3">
                  <Link to={`/e/${slug}/p/${person._id}`} className={`flex min-w-0 flex-1 items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 ${top ? 'focus-visible:outline-white' : 'focus-visible:outline-brand'}`}>
                    <Avatar name={person.name} src={person.photoUrl ?? undefined} size="lg" />
                    <span className="min-w-0">
                      <span className={`block truncate font-display text-lg font-bold tracking-tight ${top ? 'text-white' : 'text-ink'}`}>{person.name}</span>
                      {person.headline && <span className={`block truncate text-sm ${top ? 'text-white/75' : 'text-muted'}`}>{person.headline}</span>}
                    </span>
                  </Link>
                  <span className={`inline-flex min-h-7 shrink-0 items-center rounded-full px-2.5 text-[11px] font-bold ${top ? 'bg-white text-brand' : KIND_STYLE[kind]}`}>{top ? 'Top match' : KIND_LABEL[kind]}</span>
                </div>

                {match.sharedTags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {match.sharedTags.slice(0, 4).map((tag) => (
                      <span key={tag} className={`inline-flex min-h-7 items-center rounded-full px-2.5 text-[11px] font-semibold ${top ? 'bg-white/15 text-white' : 'border border-line bg-white text-muted'}`}>{TAG_LABELS[tag] ?? tag}</span>
                    ))}
                  </div>
                )}

                <p className={`mt-4 text-[15px] leading-6 ${top ? 'text-white' : 'text-ink'}`}>{match.why}</p>

                <div className={`mt-4 flex items-start gap-3 rounded-xl p-3.5 ${top ? 'bg-white/10' : 'bg-canvas'}`}>
                  <span aria-hidden="true" className={`font-display text-2xl font-black leading-none ${top ? 'text-white/60' : 'text-brand'}`}>“</span>
                  <p className={`flex-1 text-sm leading-6 ${top ? 'text-white' : 'text-ink'}`}><span className="sr-only">Icebreaker: </span>{match.icebreaker}</p>
                  <CopyButton text={match.icebreaker} onBrand={top} />
                </div>

                {person.findMe && <p className={`mt-3 flex items-center gap-1.5 text-xs ${top ? 'text-white/75' : 'text-muted'}`}><MapPin size={13} aria-hidden="true" /> {person.findMe}</p>}

                <div className="mt-4 grid gap-2">
                  {hi && (
                    <Button asChild variant={top ? 'secondary' : 'primary'} className="w-full justify-between">
                      <a href={hi.href} target="_blank" rel="noreferrer"><span>{hi.label}</span><MessageCircle size={16} aria-hidden="true" /></a>
                    </Button>
                  )}
                  <Link to={`/e/${slug}/p/${person._id}`} className={`inline-flex min-h-10 items-center justify-center gap-1.5 text-sm font-semibold ${top ? 'text-white/85 hover:text-white' : 'text-brand'}`}>View profile <ArrowRight size={14} aria-hidden="true" /></Link>
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </>
  )
}
