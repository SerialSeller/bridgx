import { ArrowRight, Bookmark, Check, Download, UsersRound } from 'lucide-react'
import { useQuery } from 'convex/react'
import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { api } from '../../../convex/_generated/api'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { Spinner } from '../../components/ui/Spinner'
import { getIdentity } from '../../lib/identity'

type Contacts = { whatsapp?: string; email?: string; linkedin?: string; instagram?: string; x?: string; github?: string; website?: string }
type VCardPerson = { name: string; headline?: string; bio?: string; contacts: Contacts }

const CONTACT_LABELS: [keyof Contacts, string][] = [
  ['whatsapp', 'WhatsApp'],
  ['email', 'Email'],
  ['linkedin', 'LinkedIn'],
  ['instagram', 'Instagram'],
  ['x', 'X'],
  ['github', 'GitHub'],
  ['website', 'Website'],
]

function withHttps(url: string) {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`
}

// vCard text values escape backslashes, commas, semicolons and newlines.
function escapeVCard(value: string) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/\r\n|\r|\n/g, '\\n')
}

function splitName(name: string) {
  const trimmed = name.trim()
  const index = trimmed.lastIndexOf(' ')
  if (index === -1) return { first: trimmed, last: '' }
  return { first: trimmed.slice(0, index).trim(), last: trimmed.slice(index + 1) }
}

function toVCard(people: VCardPerson[], eventName?: string) {
  return people
    .map((person) => {
      const name = person.name.trim() || 'BridgX contact'
      const { first, last } = splitName(name)
      const lines = ['BEGIN:VCARD', 'VERSION:3.0', `FN:${escapeVCard(name)}`, `N:${escapeVCard(last)};${escapeVCard(first)};;;`]
      const headline = person.headline?.trim()
      if (headline) lines.push(`TITLE:${escapeVCard(headline)}`)
      const digits = person.contacts.whatsapp?.replace(/\D/g, '')
      if (digits) lines.push(`TEL;TYPE=CELL:+${digits}`)
      const email = person.contacts.email?.trim()
      if (email) lines.push(`EMAIL:${email}`)
      for (const url of [person.contacts.linkedin, person.contacts.website, person.contacts.github]) {
        const value = url?.trim()
        if (value) lines.push(`URL:${withHttps(value)}`)
      }
      const where = eventName ? ` at ${eventName}` : ''
      const bio = person.bio?.trim()
      lines.push(`NOTE:${escapeVCard(`Met via BridgX${where}${bio ? ` — ${bio}` : ''}`)}`)
      lines.push('END:VCARD')
      return lines.join('\r\n')
    })
    .join('\r\n')
}

function downloadFile(text: string, filename: string) {
  const blob = new Blob([text], { type: 'text/vcard;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function SavedPage() {
  const { slug = '' } = useParams()
  const identity = getIdentity(slug)
  const event = useQuery(api.events.getBySlug, slug ? { slug } : 'skip')
  const me = useQuery(api.attendees.get, identity ? { attendeeId: identity.attendeeId } : 'skip')
  const saved = useQuery(api.saves.listMine, identity && me ? { fromId: identity.attendeeId, editKey: identity.editKey } : 'skip')
  const [exported, setExported] = useState(false)

  const header = (
    <header className="mb-7">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.17em] text-brand">Saved</p>
      <h1 className="font-display text-3xl font-bold tracking-[-0.04em] text-ink">People worth remembering</h1>
      <p className="mt-2 text-sm leading-6 text-muted">Everyone you saved here, ready to take home in one tap.</p>
    </header>
  )

  if (!identity || me === null) {
    return (
      <>
        {header}
        <EmptyState
          icon={<Bookmark size={22} />}
          title="Join to save people"
          description="Create your profile in about 20 seconds, then save anyone you want to remember after the event."
          action={<Button asChild size="sm"><Link to={`/e/${slug}/join`}>Create my profile <ArrowRight size={15} aria-hidden="true" /></Link></Button>}
        />
      </>
    )
  }

  if (me === undefined || saved === undefined) {
    return <>{header}<div role="status" className="flex items-center gap-3 text-sm font-semibold text-muted"><Spinner /> Loading your people…</div></>
  }

  if (saved.length === 0) {
    return (
      <>
        {header}
        <EmptyState
          icon={<Bookmark size={22} />}
          title="No saved people yet"
          description="Tap Save on anyone's profile to keep them here, then export them all to your contacts."
          action={<Button asChild variant="secondary" size="sm"><Link to={`/e/${slug}/people`}><UsersRound size={15} aria-hidden="true" /> Browse people</Link></Button>}
        />
      </>
    )
  }

  const count = saved.length

  function exportContacts() {
    if (!saved || saved.length === 0) return
    downloadFile(toVCard(saved, event?.name), `bridgx-${slug || 'event'}-contacts.vcf`)
    setExported(true)
    window.setTimeout(() => setExported(false), 2500)
  }

  return (
    <>
      {header}
      <div className="mb-5 flex flex-col gap-3">
        <Button type="button" size="lg" onClick={exportContacts} className="w-full">
          {exported ? <Check size={18} aria-hidden="true" /> : <Download size={18} aria-hidden="true" />}
          {exported ? 'Downloaded — open it to add' : 'Export contacts (.vcf)'}
        </Button>
        <p className="text-center text-xs leading-5 text-dim">One file with everyone. Open it on your phone to add them all to Contacts.</p>
      </div>

      <p className="mb-3 text-xs font-bold uppercase tracking-[0.17em] text-dim" aria-live="polite">{count} saved</p>

      <ul className="flex min-w-0 flex-col gap-3">
        {saved.map((person) => {
          const contacts = person.contacts as Contacts
          const available = CONTACT_LABELS.filter(([key]) => Boolean(contacts[key]?.trim()))
          return (
            <li key={person._id} className="min-w-0">
              <Link to={`/e/${slug}/p/${person._id}`} className="flex min-w-0 items-center gap-3 rounded-[24px] border border-line bg-white p-4 transition-colors hover:border-ink/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
                <Avatar name={person.name} src={person.photoUrl ?? undefined} size="lg" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold text-ink">{person.name}</span>
                  {person.headline && <span className="block truncate text-sm text-muted">{person.headline}</span>}
                  {available.length > 0 && (
                    <span className="mt-2 flex flex-wrap gap-1">
                      {available.map(([key, label]) => (
                        <span key={key} className="inline-flex min-h-6 items-center rounded-full bg-pearl px-2 text-[11px] font-semibold text-muted">{label}</span>
                      ))}
                    </span>
                  )}
                </span>
                <ArrowRight size={16} aria-hidden="true" className="shrink-0 text-dim" />
              </Link>
            </li>
          )
        })}
      </ul>
    </>
  )
}
