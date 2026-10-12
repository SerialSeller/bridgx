import { useMutation, useQuery } from 'convex/react'
import { ArrowLeft, Bookmark, ExternalLink, Globe, Mail, MessageCircle, Search, UserRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useOutletContext, useParams } from 'react-router'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import { INDUSTRY_TAGS, NEED_TAGS } from '../../../convex/tags'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Chip } from '../../components/ui/Chip'
import { EmptyState } from '../../components/ui/EmptyState'
import { Spinner } from '../../components/ui/Spinner'
import { getIdentity } from '../../lib/identity'

type EventPageContext = { event: { _id: Id<'events'> } }
type NeedTagKey = keyof typeof NEED_TAGS

const filterTags = Object.entries(NEED_TAGS) as [NeedTagKey, string][]

function LoadingDirectory() {
  return <div className="flex min-h-48 items-center justify-center gap-3 text-sm font-semibold text-muted"><Spinner /> Loading people…</div>
}

export function PeoplePage() {
  const { slug = '' } = useParams()
  const { event } = useOutletContext<EventPageContext>()
  const attendees = useQuery(api.attendees.listByEvent, { eventId: event._id })
  const [search, setSearch] = useState('')
  const [selectedTag, setSelectedTag] = useState<NeedTagKey | null>(null)

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    return (attendees ?? []).filter((person) => {
      const matchesSearch = !query || [person.name, person.headline, person.bio]
        .some((value) => value.toLocaleLowerCase().includes(query))
      const matchesTag = !selectedTag || person.offers.includes(selectedTag) || person.seeking.includes(selectedTag)
      return matchesSearch && matchesTag
    })
  }, [attendees, search, selectedTag])

  return (
    <>
      <header className="mb-6">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.17em] text-brand">People</p>
        <h1 className="font-display text-3xl font-bold tracking-[-0.04em] text-ink">Who’s in the room?</h1>
        <p className="mt-2 text-sm leading-6 text-muted">Find a person, a skill, or the conversation you came for.</p>
      </header>

      <label className="mb-4 flex min-h-12 items-center gap-3 rounded-2xl border border-line bg-white px-4 text-muted shadow-card focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/15">
        <Search size={18} aria-hidden="true" />
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, role, or bio" className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted/70" />
      </label>

      <div className="-mx-5 mb-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:-mx-7 sm:px-7" aria-label="Filter by offer or need">
        <Chip selected={selectedTag === null} onClick={() => setSelectedTag(null)}>All</Chip>
        {filterTags.map(([key, label]) => <Chip key={key} selected={selectedTag === key} onClick={() => setSelectedTag(selectedTag === key ? null : key)}>{label}</Chip>)}
      </div>

      {attendees === undefined ? <LoadingDirectory /> : filtered.length === 0 ? (
        <EmptyState icon={<Search size={21} />} title="No people match yet" description="Try a different name or tag, or clear the filters to see everyone here." action={<Button variant="secondary" size="sm" onClick={() => { setSearch(''); setSelectedTag(null) }}>Clear filters</Button>} />
      ) : (
        <section aria-label="Event attendees" className="grid gap-3">
          {filtered.map((person) => (
            <Link key={person._id} to={`/e/${slug}/p/${person._id}`} className="rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
              <Card interactive className="flex items-start gap-3 p-4">
                <Avatar name={person.name} src={person.photoUrl ?? undefined} size="lg" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink">{person.name}</p>
                  <p className="mt-1 text-sm leading-5 text-muted">{person.headline}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">{person.offers.slice(0, 3).map((tag) => <TagPill key={tag} label={NEED_TAGS[tag as NeedTagKey] ?? tag} />)}</div>
                  {person.seeking.length > 0 && <p className="mt-2 text-xs leading-5 text-muted"><strong className="text-ink">Looking for:</strong> {person.seeking.slice(0, 3).map((tag) => NEED_TAGS[tag as NeedTagKey] ?? tag).join(' · ')}</p>}
                </div>
              </Card>
            </Link>
          ))}
        </section>
      )}
    </>
  )
}

function contactUrl(kind: string, value?: string) {
  const contact = value?.trim()
  if (!contact) return null
  if (kind === 'email') return `mailto:${contact}`
  if (kind === 'whatsapp') {
    if (/^https?:\/\//i.test(contact)) return contact
    const number = contact.replace(/\D/g, '')
    return number ? `https://wa.me/${number}` : null
  }
  if (kind === 'website') {
    const url = /^https?:\/\//i.test(contact) ? contact : `https://${contact}`
    try {
      const parsed = new URL(url)
      return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.toString() : null
    } catch {
      return null
    }
  }
  const bases: Record<string, string> = {
    linkedin: 'https://www.linkedin.com/in/',
    instagram: 'https://www.instagram.com/',
    x: 'https://x.com/',
    github: 'https://github.com/',
  }
  if (/^https?:\/\//i.test(contact)) return contact
  return bases[kind] ? `${bases[kind]}${encodeURIComponent(contact.replace(/^@/, ''))}` : null
}

export function PersonPage() {
  const { slug = '', id = '' } = useParams()
  const { event } = useOutletContext<EventPageContext>()
  const attendees = useQuery(api.attendees.listByEvent, { eventId: event._id })
  const identity = getIdentity(slug)
  const savedPeople = useQuery(api.saves.listMine, identity ? { fromId: identity.attendeeId, editKey: identity.editKey } : 'skip')
  const toggleSave = useMutation(api.saves.toggle)
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState(false)
  const person = attendees?.find((attendee) => attendee._id === id)
  const isSaved = person ? savedPeople?.some((saved) => saved._id === person._id) ?? false : false

  async function handleSave() {
    if (!identity || !person) return
    setSaving(true)
    setNotice('')
    try {
      const result = await toggleSave({ fromId: identity.attendeeId, toId: person._id, editKey: identity.editKey })
      setNotice(result.saved ? 'Saved to your people.' : 'Removed from your saved people.')
    } catch (cause) {
      setNotice(cause instanceof Error ? cause.message : 'Could not update your saved people. Try again.')
    } finally {
      setSaving(false)
    }
  }

  if (attendees === undefined) return <LoadingDirectory />
  if (!person) return (
    <>
      <Link to={`/e/${slug}/people`} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-brand"><ArrowLeft size={16} /> All people</Link>
      <EmptyState icon={<UserRound size={22} />} title="Profile not found" description="This person may have left the event or the link may be out of date." action={<Button asChild variant="secondary" size="sm"><Link to={`/e/${slug}/people`}>Browse people</Link></Button>} />
    </>
  )

  const contactLinks = [
    { key: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, href: contactUrl('whatsapp', person.contacts.whatsapp) },
    { key: 'email', label: 'Email', icon: Mail, href: contactUrl('email', person.contacts.email) },
    { key: 'linkedin', label: 'LinkedIn', icon: ExternalLink, href: contactUrl('linkedin', person.contacts.linkedin) },
    { key: 'instagram', label: 'Instagram', icon: ExternalLink, href: contactUrl('instagram', person.contacts.instagram) },
    { key: 'x', label: 'X', icon: ExternalLink, href: contactUrl('x', person.contacts.x) },
    { key: 'github', label: 'GitHub', icon: ExternalLink, href: contactUrl('github', person.contacts.github) },
    { key: 'website', label: 'Website', icon: Globe, href: contactUrl('website', person.contacts.website) },
  ].filter((link) => link.href)

  return (
    <>
      <Link to={`/e/${slug}/people`} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-brand"><ArrowLeft size={16} /> All people</Link>
      <Card className="p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <Avatar name={person.name} src={person.photoUrl ?? undefined} size="xl" />
          <div className="min-w-0"><h1 className="font-display text-2xl font-bold tracking-tight text-ink">{person.name}</h1><p className="mt-1 text-sm text-muted">{person.headline}</p></div>
        </div>
        <p className="mt-5 text-sm leading-6 text-ink">{person.bio || 'This person has not added a bio yet.'}</p>

        {person.offers.length > 0 && <div className="mt-5"><p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-muted">Can offer</p><div className="flex flex-wrap gap-2">{person.offers.map((tag) => <TagPill key={tag} label={NEED_TAGS[tag as NeedTagKey] ?? tag} />)}</div></div>}
        {person.seeking.length > 0 && <div className="mt-4"><p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-muted">Looking for</p><div className="flex flex-wrap gap-2">{person.seeking.map((tag) => <TagPill key={tag} label={NEED_TAGS[tag as NeedTagKey] ?? tag} />)}</div></div>}
        {person.industries.length > 0 && <div className="mt-4"><p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-muted">Industries</p><div className="flex flex-wrap gap-2">{person.industries.map((tag) => <TagPill key={tag} label={INDUSTRY_TAGS[tag as keyof typeof INDUSTRY_TAGS] ?? tag} />)}</div></div>}

        {person.findMe && <p className="mt-5 rounded-xl bg-aqua px-3.5 py-3 text-sm leading-5 text-brand"><strong>Find me:</strong> {person.findMe}</p>}

        {contactLinks.length > 0 && <div className="mt-5"><p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-muted">Say hello</p><div className="flex flex-wrap gap-2">{contactLinks.map(({ key, label, icon: Icon, href }) => <a key={key} href={href!} target={href?.startsWith('mailto:') ? undefined : '_blank'} rel="noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-line bg-white px-3 text-sm font-semibold text-ink transition-colors hover:border-brand/25 hover:bg-aqua/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"><Icon size={15} aria-hidden="true" />{label}</a>)}</div></div>}

        <div className="mt-6 border-t border-line pt-5">
          {identity ? <Button className="w-full" variant={isSaved ? 'secondary' : 'primary'} disabled={saving || identity.attendeeId === person._id} onClick={handleSave}><Bookmark size={17} fill={isSaved ? 'currentColor' : 'none'} />{saving ? 'Saving…' : identity.attendeeId === person._id ? 'This is your profile' : isSaved ? 'Saved' : '☆ Save'}</Button> : <Button asChild className="w-full"><Link to={`/e/${slug}/join`}>Join to save this person</Link></Button>}
          {notice && <p role="status" className="mt-3 text-center text-sm text-muted">{notice}</p>}
          {!identity && <p className="mt-3 text-center text-xs leading-5 text-muted">Create your free event profile to save people.</p>}
        </div>
      </Card>
    </>
  )
}

function TagPill({ label }: { label: string }) {
  return <span className="inline-flex min-h-7 items-center rounded-full border border-line bg-white px-2.5 text-[11px] font-semibold text-muted">{label}</span>
}
