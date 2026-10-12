import {
  ArrowRight,
  Bookmark,
  CalendarDays,
  Check,
  Compass,
  Copy,
  Download,
  MapPin,
  Sparkles,
  UsersRound,
} from 'lucide-react'
import { useMutation, useQuery } from 'convex/react'
import { useRef, useState, type FormEvent, type ReactNode } from 'react'
import { api } from '../convex/_generated/api'
import type { Id } from '../convex/_generated/dataModel'
import { QRCodeCanvas } from 'qrcode.react'
import {
  BrowserRouter,
  Link,
  Outlet,
  Route,
  Routes,
  useNavigate,
  useOutletContext,
  useParams,
  useSearchParams,
} from 'react-router'
import { Avatar } from './components/ui/Avatar'
import { Button } from './components/ui/Button'
import { Card } from './components/ui/Card'
import { EmptyState } from './components/ui/EmptyState'
import { Spinner } from './components/ui/Spinner'
import { Sheet } from './components/ui/Sheet'
import { TabBar } from './components/ui/TabBar'
import { PeoplePage, PersonPage } from './features/directory/DirectoryPages'

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="inline-flex items-center gap-2.5 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand">
      <span className="grid size-9 place-items-center rounded-xl bg-brand text-sm font-black text-white shadow-sm">B</span>
      {!compact && <span className="font-display text-lg font-bold tracking-tight text-ink">bridg<span className="text-brand">x</span></span>}
    </Link>
  )
}

function HomePage() {
  const [howItWorksOpen, setHowItWorksOpen] = useState(false)
  return (
    <main className="relative mx-auto flex min-h-svh w-full max-w-md flex-col overflow-hidden px-5 pb-10 pt-7 sm:px-7">
      <div className="pointer-events-none absolute -right-24 top-20 size-72 rounded-full bg-aqua/60 blur-3xl" />
      <header className="relative flex items-center justify-between">
        <Brand />
        <span className="rounded-full border border-line bg-white/80 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Meet better</span>
      </header>

      <section className="relative flex flex-1 flex-col justify-center py-14">
        <div className="mb-7 inline-flex w-fit items-center gap-2 rounded-full border border-brand/15 bg-white/80 px-3.5 py-2 text-xs font-semibold text-brand shadow-sm">
          <Sparkles size={14} aria-hidden="true" /> The right people are already here
        </div>
        <h1 className="font-display text-[3.2rem] font-bold leading-[0.98] tracking-[-0.055em] text-ink">
          Meet the people who <span className="text-brand">move you forward.</span>
        </h1>
        <p className="mt-5 max-w-sm text-[16px] leading-7 text-muted">
          One QR. No app. No login. Find who you should meet, why, and what to say first.
        </p>

        <div className="mt-9 grid gap-3">
          <Button asChild size="lg" className="justify-between">
            <Link to="/new"><span>Create an event</span><ArrowRight size={18} aria-hidden="true" /></Link>
          </Button>
          <Button asChild variant="secondary" size="lg" className="justify-between">
            <Link to="/e/demo"><span>Try the demo</span><Compass size={18} aria-hidden="true" /></Link>
          </Button>
        </div>

        <button onClick={() => setHowItWorksOpen(true)} className="mt-4 min-h-11 self-center rounded-xl px-4 text-sm font-semibold text-brand hover:bg-white/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">How it works</button>

        <Card className="mt-9 flex items-center gap-4 border-brand/10 bg-white/80 p-4">
          <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-aqua text-brand"><UsersRound size={21} aria-hidden="true" /></div>
          <div><p className="text-sm font-semibold text-ink">A better first conversation</p><p className="mt-1 text-xs leading-5 text-muted">Know who’s in the room before you say hello.</p></div>
        </Card>
      </section>

      <footer className="relative flex items-center justify-between text-xs text-muted">
        <span>Made for the moments that matter.</span>
        <span className="font-semibold text-ink">BridgX</span>
      </footer>
      <Sheet open={howItWorksOpen} onClose={() => setHowItWorksOpen(false)} title="Find your next good conversation">
        <ol className="space-y-4 text-sm leading-6 text-muted">
          <li><strong className="text-ink">1. Scan the event QR.</strong> No app or account needed.</li>
          <li><strong className="text-ink">2. Share a little about yourself.</strong> Review your profile before it’s shared.</li>
          <li><strong className="text-ink">3. Meet with a head start.</strong> See who to meet, why, and what to say.</li>
        </ol>
      </Sheet>
    </main>
  )
}

function PageHeader({ eyebrow, title, detail }: { eyebrow: string; title: string; detail?: string }) {
  return (
    <header className="mb-7">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.17em] text-brand">{eyebrow}</p>
      <h1 className="font-display text-3xl font-bold tracking-[-0.04em] text-ink">{title}</h1>
      {detail && <p className="mt-2 text-sm leading-6 text-muted">{detail}</p>}
    </header>
  )
}

function EventLayout() {
  const { slug = 'demo' } = useParams()
  const event = useQuery(api.events.getBySlug, { slug })
  const attendeeCount = useQuery(api.attendees.count, event ? { eventId: event._id } : 'skip')

  if (event === undefined) return <LoadingPage />
  if (event === null) return <NotFoundPage />

  return (
    <div className="min-h-svh bg-canvas">
      <div className="mx-auto flex min-h-svh w-full max-w-md flex-col px-5 pb-28 pt-6 sm:px-7">
        <header className="mb-8 flex items-center justify-between">
          <Brand />
          <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-muted shadow-sm">Event space</span>
        </header>
        <main className="flex-1"><Outlet context={{ event, attendeeCount }} /></main>
        <TabBar slug={slug} />
      </div>
    </div>
  )
}

function EventLandingPage() {
  const { slug = 'demo' } = useParams()
  const { event, attendeeCount } = useOutletContext<EventContext>()
  return (
    <>
      <div className="mb-7 flex items-center gap-2 text-xs font-semibold text-muted"><CalendarDays size={15} aria-hidden="true" /> BridgX meetup</div>
      <PageHeader eyebrow="You’re in the right place" title={event.name} detail="See who’s here and find a good reason to start a conversation." />
      <Card className="mb-5 overflow-hidden p-0">
        <div className="h-32 bg-[radial-gradient(circle_at_78%_28%,rgba(29,135,121,0.45),transparent_24%),linear-gradient(135deg,#183934,#76c7b7)]" />
        <div className="p-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">You’re invited</p>
          <h2 className="mt-2 font-display text-xl font-bold tracking-tight text-ink">{event.name}</h2>
          {(event.date || event.location) && <div className="mt-3 grid gap-2 text-sm text-muted">
            {event.date && <div className="flex items-center gap-2"><CalendarDays size={15} aria-hidden="true" /> {event.date}</div>}
            {event.location && <div className="flex items-center gap-2"><MapPin size={15} aria-hidden="true" /> {event.location}</div>}
          </div>}
          <div className="mt-5 flex items-center gap-3 rounded-xl bg-canvas px-3 py-2.5">
            <div className="flex -space-x-2"><Avatar name="Ayşe" size="sm" /><Avatar name="Deniz" size="sm" /><Avatar name="Mert" size="sm" /></div>
            <span className="text-sm font-medium text-ink"><strong>{attendeeCount ?? '—'} people</strong> here</span>
          </div>
        </div>
      </Card>
      <div className="grid gap-3">
        <Button asChild size="lg" className="justify-between"><Link to={`/e/${slug}/join`}><span>Join (20 sec)</span><ArrowRight size={18} aria-hidden="true" /></Link></Button>
        <Button asChild variant="secondary" size="lg" className="justify-between"><Link to={`/e/${slug}/people`}><span>Just browse</span><UsersRound size={18} aria-hidden="true" /></Link></Button>
      </div>
    </>
  )
}

function JoinPlaceholder() {
  return <><PageHeader eyebrow="Make your introduction" title="A little about you goes a long way." detail="Build a profile in about 20 seconds. You choose what to share." /><Card className="p-5"><div className="mb-4 grid size-12 place-items-center rounded-2xl bg-aqua text-brand"><Sparkles size={22} aria-hidden="true" /></div><p className="text-sm font-semibold text-ink">Your story, your way</p><p className="mt-2 text-sm leading-6 text-muted">Tell us what you do and who you’d like to meet. You can review everything before it’s shared.</p><Button className="mt-5 w-full" disabled>Build my profile <ArrowRight size={16} /></Button></Card><p className="mt-5 text-center text-xs text-muted">Skip, just browse</p></>
}

function MatchesPlaceholder() {
  return <><PageHeader eyebrow="Matches" title="Who you should meet" detail="Thoughtful introductions start with a little context." /><EmptyState icon={<Sparkles size={22} />} title="Your matches are waiting" description="Join this event to see people who can help you—and people you can help." action={<Button asChild size="sm"><Link to="../join">Create my profile</Link></Button>} /></>
}

function SavedPlaceholder() {
  return <><PageHeader eyebrow="Saved" title="People worth remembering" detail="Keep the connections you want to follow up with." /><EmptyState icon={<Bookmark size={22} />} title="No saved people yet" description="Tap the bookmark on a profile to keep it close. You can export your list later." action={<Button asChild variant="secondary" size="sm"><Link to="../people">Browse people</Link></Button>} /></>
}

function CreateEventPage() {
  const createEvent = useMutation(api.events.create)
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [location, setLocation] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const created = await createEvent({
        name: name.trim(),
        ...(date ? { date } : {}),
        ...(location.trim() ? { location: location.trim() } : {}),
      })
      navigate(`/e/${created.slug}/admin?key=${encodeURIComponent(created.adminKey)}`)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not create the event. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <>
      <PageHeader eyebrow="For organizers" title="Bring your people together." detail="Create an event and give every attendee a better first conversation." />
      <Card className="p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-semibold text-ink">Event name
            <input required maxLength={120} value={name} onChange={(event) => setName(event.target.value)} placeholder="Istanbul Founders Night" className="mt-2 min-h-12 w-full rounded-xl border border-line bg-white px-3.5 text-base font-normal text-ink outline-none placeholder:text-muted/70 focus:border-brand focus:ring-2 focus:ring-brand/15" />
          </label>
          <label className="block text-sm font-semibold text-ink">Date <span className="font-normal text-muted">· optional</span>
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-line bg-white px-3.5 text-base font-normal text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/15" />
          </label>
          <label className="block text-sm font-semibold text-ink">Location <span className="font-normal text-muted">· optional</span>
            <input maxLength={160} value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Kadıköy, Istanbul" className="mt-2 min-h-12 w-full rounded-xl border border-line bg-white px-3.5 text-base font-normal text-ink outline-none placeholder:text-muted/70 focus:border-brand focus:ring-2 focus:ring-brand/15" />
          </label>
          {error && <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-3 text-sm text-red-700">{error}</p>}
          <Button type="submit" className="w-full" disabled={submitting || !name.trim()}>
            {submitting ? <><Spinner size="sm" className="border-white/35 border-t-white" /> Creating event…</> : <>Create event <ArrowRight size={16} /></>}
          </Button>
        </form>
      </Card>
    </>
  )
}

type EventSummary = { _id: Id<'events'>; slug: string; name: string; date?: string; location?: string }
type EventContext = { event: EventSummary; attendeeCount: number | undefined }

function LoadingPage() {
  return <main className="grid min-h-svh place-items-center bg-canvas px-5"><div className="flex items-center gap-3 text-sm font-semibold text-muted"><Spinner /> Loading event…</div></main>
}

function ConvexRequired({ children }: { children: ReactNode }) {
  if (import.meta.env.VITE_CONVEX_URL) return children
  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col justify-center px-6">
      <PageHeader eyebrow="One quick setup" title="Connect your event workspace." detail="Start Convex in this repo to create and load live events." />
      <Card className="p-5 text-sm leading-6 text-muted"><code className="rounded bg-canvas px-2 py-1 text-ink">npx convex dev</code> writes the local URL and enables event creation.</Card>
      <Button asChild variant="secondary" className="mt-4"><Link to="/">Back home</Link></Button>
    </main>
  )
}

function AdminPage() {
  const { slug = '' } = useParams()
  const [searchParams] = useSearchParams()
  const adminKey = searchParams.get('key')
  const event = useQuery(api.events.getBySlug, { slug })
  const attendeeCount = useQuery(api.attendees.count, event ? { eventId: event._id } : 'skip')
  const qrCanvas = useRef<HTMLCanvasElement>(null)
  const [notice, setNotice] = useState('')
  const joinUrl = `${window.location.origin}/e/${slug}`

  async function copyJoinLink() {
    try {
      await navigator.clipboard.writeText(joinUrl)
      setNotice('Join link copied.')
    } catch {
      setNotice('Copy is unavailable here. Select the link below to copy it.')
    }
  }

  function downloadQr() {
    const canvas = qrCanvas.current
    if (!canvas) return
    canvas.toBlob((blob) => {
      if (!blob) {
        setNotice('Could not create the QR image. Try again.')
        return
      }
      const link = document.createElement('a')
      const objectUrl = URL.createObjectURL(blob)
      link.href = objectUrl
      link.download = `bridgx-${slug}-qr.png`
      link.click()
      URL.revokeObjectURL(objectUrl)
    }, 'image/png')
  }

  if (event === undefined) return <LoadingPage />
  if (event === null) return <NotFoundPage />
  if (!adminKey) return <NotFoundPage />

  return (
    <main className="min-h-svh bg-canvas">
      <div className="mx-auto w-full max-w-2xl px-5 py-7 sm:px-8">
        <header className="mb-10 flex items-center justify-between"><Brand /><span className="rounded-full bg-aqua px-3 py-1.5 text-xs font-bold text-brand">Organizer</span></header>
        <PageHeader eyebrow="Your event is ready" title={event.name} detail="Put this link or QR in front of the room. People can join without installing an app." />
        <Card className="grid gap-6 p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-7">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">Attendee link</p>
            <p className="mt-2 break-all rounded-xl bg-canvas px-3.5 py-3 text-sm font-semibold text-ink">{joinUrl}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button onClick={copyJoinLink} variant="secondary"><Copy size={16} /> Copy link</Button>
              <Button onClick={downloadQr} variant="secondary"><Download size={16} /> Download QR PNG</Button>
            </div>
            {notice && <p role="status" className="mt-3 flex items-center gap-1.5 text-sm text-brand"><Check size={15} /> {notice}</p>}
          </div>
          <div className="mx-auto rounded-2xl border border-line bg-white p-3 shadow-card sm:mx-0">
            <QRCodeCanvas ref={qrCanvas} value={joinUrl} size={512} level="H" includeMargin className="size-56 sm:size-60" aria-label="Event join QR code" />
          </div>
        </Card>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Card className="p-4"><p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">People here</p><p className="mt-2 font-display text-3xl font-bold text-ink">{attendeeCount ?? '—'}</p><p className="mt-1 text-xs text-muted">Updates live as guests join</p></Card>
          <Button asChild variant="secondary" className="min-h-24 justify-between"><Link to={`/e/${slug}/live`}>Open live screen <ArrowRight size={16} /></Link></Button>
          <Button asChild variant="secondary" className="min-h-24 justify-between"><Link to={`/e/${slug}/poster`}>Open event poster <ArrowRight size={16} /></Link></Button>
        </div>
        <Link to={`/e/${slug}`} className="mt-7 inline-block text-sm font-semibold text-brand">← Preview attendee page</Link>
      </div>
    </main>
  )
}

function OrganizerPlaceholder({ title, detail }: { title: string; detail: string }) {
  const { slug = 'demo' } = useParams()
  return <div className="min-h-svh bg-canvas"><main className="mx-auto w-full max-w-md px-5 py-7 sm:px-7"><header className="mb-12"><Brand /></header><PageHeader eyebrow="Event organizer" title={title} detail={detail} /><Card className="mb-4 flex items-center gap-3 p-4"><div className="grid size-11 place-items-center rounded-2xl bg-aqua text-brand"><Spinner size="sm" /></div><div><p className="text-sm font-semibold text-ink">Event data will appear here</p><p className="mt-1 text-xs text-muted">This view is ready for your event.</p></div></Card><div className="grid grid-cols-2 gap-3"><Button asChild variant="secondary" size="sm"><Link to={`/e/${slug}/live`}>Live screen</Link></Button><Button asChild variant="secondary" size="sm"><Link to={`/e/${slug}/poster`}>Event poster</Link></Button></div><Link to={`/e/${slug}`} className="mt-7 inline-block text-sm font-semibold text-brand">← Back to event</Link></main></div>
}

function NotFoundPage() {
  return <main className="mx-auto flex min-h-svh max-w-md flex-col justify-center px-6"><PageHeader eyebrow="404 · Page not found" title="That page isn’t here." detail="Try going back to the event or start from the home page." /><Button asChild><Link to="/">Go home <ArrowRight size={16} /></Link></Button></main>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/new" element={<ConvexRequired><CreateEventPage /></ConvexRequired>} />
      <Route path="/e/:slug" element={<ConvexRequired><EventLayout /></ConvexRequired>}>
        <Route index element={<EventLandingPage />} />
        <Route path="join" element={<JoinPlaceholder />} />
        <Route path="people" element={<PeoplePage />} />
        <Route path="p/:id" element={<PersonPage />} />
        <Route path="matches" element={<MatchesPlaceholder />} />
        <Route path="saved" element={<SavedPlaceholder />} />
      </Route>
      <Route path="/e/:slug/admin" element={<ConvexRequired><AdminPage /></ConvexRequired>} />
      <Route path="/e/:slug/live" element={<OrganizerPlaceholder title="The room is coming together." detail="A live view for the big screen, built for everyone to read." />} />
      <Route path="/e/:slug/poster" element={<OrganizerPlaceholder title="A warm welcome starts here." detail="Print a simple poster that gets people meeting." />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

function App() {
  return <BrowserRouter><AppRoutes /></BrowserRouter>
}

export default App
