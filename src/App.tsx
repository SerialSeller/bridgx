import {
  ArrowRight,
  Bookmark,
  CalendarDays,
  Compass,
  MapPin,
  Search,
  Sparkles,
  UsersRound,
} from 'lucide-react'
import { useState } from 'react'
import {
  BrowserRouter,
  Link,
  Outlet,
  Route,
  Routes,
  useParams,
} from 'react-router'
import { Avatar } from './components/ui/Avatar'
import { Button } from './components/ui/Button'
import { Card } from './components/ui/Card'
import { Chip } from './components/ui/Chip'
import { EmptyState } from './components/ui/EmptyState'
import { Spinner } from './components/ui/Spinner'
import { Sheet } from './components/ui/Sheet'
import { TabBar } from './components/ui/TabBar'

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
  return (
    <div className="min-h-svh bg-canvas">
      <div className="mx-auto flex min-h-svh w-full max-w-md flex-col px-5 pb-28 pt-6 sm:px-7">
        <header className="mb-8 flex items-center justify-between">
          <Brand />
          <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-muted shadow-sm">Event space</span>
        </header>
        <main className="flex-1"><Outlet /></main>
        <TabBar slug={slug} />
      </div>
    </div>
  )
}

function EventLandingPage() {
  const { slug = 'demo' } = useParams()
  return (
    <>
      <div className="mb-7 flex items-center gap-2 text-xs font-semibold text-muted"><CalendarDays size={15} aria-hidden="true" /> BridgX meetup</div>
      <PageHeader eyebrow="You’re in the right place" title="Meet your next co-founder, collaborator, or friend." detail="See who’s here and find a good reason to start a conversation." />
      <Card className="mb-5 overflow-hidden p-0">
        <div className="h-32 bg-[radial-gradient(circle_at_78%_28%,rgba(29,135,121,0.45),transparent_24%),linear-gradient(135deg,#183934,#76c7b7)]" />
        <div className="p-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">Tonight’s gathering</p>
          <h2 className="mt-2 font-display text-xl font-bold tracking-tight text-ink">{slug === 'demo' ? 'BridgX Demo Night' : 'Your event'}</h2>
          <div className="mt-3 flex items-center gap-2 text-sm text-muted"><MapPin size={15} aria-hidden="true" /> Istanbul</div>
          <div className="mt-5 flex items-center gap-3 rounded-xl bg-canvas px-3 py-2.5">
            <div className="flex -space-x-2"><Avatar name="Ayşe" size="sm" /><Avatar name="Deniz" size="sm" /><Avatar name="Mert" size="sm" /></div>
            <span className="text-sm font-medium text-ink"><strong>47 people</strong> here</span>
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

function PeoplePlaceholder() {
  return <><PageHeader eyebrow="People" title="Who’s in the room?" detail="Find a person, a skill, or the conversation you came for." /><label className="mb-4 flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3 text-muted shadow-card"><Search size={18} aria-hidden="true" /><span className="text-sm">Search people</span></label><div className="mb-5 flex gap-2 overflow-x-auto pb-1"><Chip selected>All</Chip><Chip>Design</Chip><Chip>Product</Chip><Chip>Startups</Chip></div><div className="grid gap-3"><PersonPreview name="Ayşe Yılmaz" headline="Product designer · building in healthtech" tags={['UI/UX design','Healthtech']} /><PersonPreview name="Deniz Kaya" headline="Backend developer · open to cofounding" tags={['Backend dev','Co-founder']} /></div></>
}

function PersonPreview({ name, headline, tags }: { name: string; headline: string; tags: string[] }) {
  return <Card className="flex items-start gap-3 p-4"><Avatar name={name} size="lg" /><div className="min-w-0 flex-1"><p className="font-semibold text-ink">{name}</p><p className="mt-1 text-sm leading-5 text-muted">{headline}</p><div className="mt-3 flex flex-wrap gap-1.5">{tags.map((tag) => <Chip key={tag} size="sm">{tag}</Chip>)}</div></div><button className="rounded-xl p-2 text-muted hover:bg-canvas hover:text-brand" aria-label={`Save ${name}`}><Bookmark size={18} /></button></Card>
}

function MatchesPlaceholder() {
  return <><PageHeader eyebrow="Matches" title="Who you should meet" detail="Thoughtful introductions start with a little context." /><EmptyState icon={<Sparkles size={22} />} title="Your matches are waiting" description="Join this event to see people who can help you—and people you can help." action={<Button asChild size="sm"><Link to="../join">Create my profile</Link></Button>} /></>
}

function SavedPlaceholder() {
  return <><PageHeader eyebrow="Saved" title="People worth remembering" detail="Keep the connections you want to follow up with." /><EmptyState icon={<Bookmark size={22} />} title="No saved people yet" description="Tap the bookmark on a profile to keep it close. You can export your list later." action={<Button asChild variant="secondary" size="sm"><Link to="../people">Browse people</Link></Button>} /></>
}

function PersonPagePlaceholder() {
  const { id = 'person' } = useParams()
  return <><Link to="../people" className="mb-6 inline-flex text-sm font-semibold text-brand">← All people</Link><Card className="p-5"><div className="flex items-center gap-4"><Avatar name={id} size="xl" /><div><h1 className="font-display text-xl font-bold text-ink">{id}</h1><p className="mt-1 text-sm text-muted">A little about me</p></div></div><div className="mt-6 flex flex-wrap gap-2"><Chip>Product</Chip><Chip>Co-founder</Chip></div><p className="mt-5 text-sm leading-6 text-muted">I’m here to meet thoughtful people and build something useful together.</p><Button variant="secondary" className="mt-5 w-full">Save this person <Bookmark size={16} /></Button></Card></>
}

function CreateEventPage() {
  return <><PageHeader eyebrow="For organizers" title="Bring your people together." detail="Create an event and give every attendee a better first conversation." /><Card className="space-y-4 p-5"><label className="block text-sm font-semibold text-ink">Event name<div className="mt-2 rounded-xl border border-line bg-white px-3.5 py-3 text-sm font-normal text-muted">e.g. Istanbul Founders Night</div></label><label className="block text-sm font-semibold text-ink">Date and location<div className="mt-2 rounded-xl border border-line bg-white px-3.5 py-3 text-sm font-normal text-muted">Add these when you’re ready</div></label><Button className="w-full" disabled>Create event <ArrowRight size={16} /></Button></Card></>
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
      <Route path="/new" element={<CreateEventPage />} />
      <Route path="/e/:slug" element={<EventLayout />}>
        <Route index element={<EventLandingPage />} />
        <Route path="join" element={<JoinPlaceholder />} />
        <Route path="people" element={<PeoplePlaceholder />} />
        <Route path="p/:id" element={<PersonPagePlaceholder />} />
        <Route path="matches" element={<MatchesPlaceholder />} />
        <Route path="saved" element={<SavedPlaceholder />} />
      </Route>
      <Route path="/e/:slug/admin" element={<OrganizerPlaceholder title="Your event, in one scan." detail="Your QR code, join link, and live attendee count will live here." />} />
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
