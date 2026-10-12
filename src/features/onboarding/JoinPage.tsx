import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useAction, useMutation, useQuery } from 'convex/react'
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router'
import { ArrowRight, Check, LoaderCircle, MapPin, Camera } from 'lucide-react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import { INDUSTRY_TAGS, NEED_TAGS } from '../../../convex/tags'
import { clearIdentity, getIdentity, setIdentity } from '../../lib/identity'
import { draftFromExtracted, emptyDraft, profileFromDraft, validatePhoto } from './profileForm'
import type { ProfileDraft } from './profileForm'
import { TabBar } from '../../components/ui/TabBar'

const inputClass = 'mt-2 w-full rounded-xl border border-smoke bg-white px-4 py-3 text-base text-ink placeholder:text-dim focus:border-ink focus:outline-none'
const primaryClass = 'inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full border border-ink bg-gold px-7 text-sm font-bold text-ink disabled:border-concrete disabled:bg-concrete disabled:text-dim'
const outlineClass = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-ink px-5 text-sm font-bold text-ink'
const contactFields = [
  ['whatsapp', 'WhatsApp', 'tel', '+90…'], ['email', 'Email', 'email', 'you@example.com'],
  ['linkedin', 'LinkedIn', 'url', 'https://linkedin.com/in/…'], ['instagram', 'Instagram', 'url', 'https://instagram.com/…'],
  ['x', 'X', 'url', 'https://x.com/…'], ['github', 'GitHub', 'url', 'https://github.com/…'],
  ['website', 'Website', 'url', 'https://your-site.com'],
] as const

function TagPicker({ title, vocabulary, selected, max, onChange }: {
  title: string; vocabulary: Record<string, string>; selected: string[]; max: number; onChange: (tags: string[]) => void;
}) {
  const [expanded, setExpanded] = useState(false)
  const keys = Object.keys(vocabulary)
  const visible = expanded ? keys : [...new Set([...selected, ...keys.slice(0, selected.length ? 0 : 6)])]
  return <section className="rounded-[24px] bg-white p-5">
    <div className="mb-3 flex items-center justify-between gap-3"><h2 className="text-lg font-bold">{title}</h2><span className="text-xs text-dim">{selected.length}/{max}</span></div>
    <div className="flex flex-wrap gap-2">{visible.map(key => <button key={key} type="button" aria-pressed={selected.includes(key)} disabled={!selected.includes(key) && selected.length >= max}
      onClick={() => onChange(selected.includes(key) ? selected.filter(tag => tag !== key) : [...selected, key])}
      className={`min-h-11 rounded-full px-3.5 text-sm font-bold disabled:opacity-50 ${selected.includes(key) ? 'bg-ink text-white' : 'bg-cream text-ink'}`}>{vocabulary[key]}</button>)}</div>
    <button className="mt-3 min-h-11 text-sm underline underline-offset-4" type="button" onClick={() => setExpanded(!expanded)}>{expanded ? 'Show selected tags' : 'See all options'}</button>
  </section>
}

function JoinForm({ slug, editing }: { slug: string; editing: boolean }) {
  const navigate = useNavigate()
  const [identity, setLocalIdentity] = useState(() => getIdentity(slug))
  const event = useQuery(api.events.getBySlug, { slug })
  const person = useQuery(api.attendees.get, identity ? { attendeeId: identity.attendeeId } : 'skip')
  const extract = useAction(api.ai.extractProfile)
  const create = useMutation(api.attendees.create)
  const update = useMutation(api.attendees.update)
  const uploadUrl = useMutation(api.files.generateUploadUrl)
  const [step, setStep] = useState<1 | 2>(editing ? 2 : 1)
  const [text, setText] = useState('')
  const [draft, setDraft] = useState<ProfileDraft>(emptyDraft)
  const [busy, setBusy] = useState<'reading' | 'saving' | 'uploading' | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [photoPreview, setPhotoPreview] = useState<string>()
  const [recovery, setRecovery] = useState<string>()
  const loaded = useRef(false)

  useEffect(() => {
    if (editing && person && event && person.eventId === event._id && !loaded.current) {
      setDraft({ name: person.name, headline: person.headline, bio: person.bio, offers: person.offers, seeking: person.seeking,
        industries: person.industries, contacts: { ...person.contacts }, sources: person.sources, findMe: person.findMe ?? '',
        ...(person.photoId ? { photoId: person.photoId } : {}) })
      setPhotoPreview(person.photoUrl ?? undefined)
      loaded.current = true
    }
  }, [editing, person, event])
  useEffect(() => () => { if (photoPreview?.startsWith('blob:')) URL.revokeObjectURL(photoPreview) }, [photoPreview])

  const browse = <Link className="inline-flex min-h-11 items-center text-sm underline underline-offset-4" to={`/e/${slug}/people`}>Skip, just browse</Link>
  if (event === undefined || (identity && person === undefined)) return <main className="mx-auto grid min-h-svh max-w-md place-content-center gap-4 bg-cream px-4 text-ink" role="status"><LoaderCircle className="mx-auto animate-spin" aria-hidden="true" /><p>Getting your event ready…</p>{browse}</main>
  if (!event) return <main className="mx-auto min-h-svh max-w-md bg-cream px-4 py-12 text-ink"><h1 className="text-[32px] font-bold leading-[1.15]">That event isn’t here.</h1><p className="mt-4 text-charcoal">Check your event link or ask the organizer for the QR.</p><Link className={outlineClass + ' mt-6'} to="/">Go home</Link></main>
  if (identity && (!person || person.eventId !== event._id)) return <main className="mx-auto min-h-svh max-w-md bg-cream px-4 py-12 text-ink"><h1 className="text-2xl font-bold">Your profile isn’t available.</h1><p className="mt-3 text-charcoal">You can join this event again or keep browsing.</p><button className={outlineClass + ' mt-5'} onClick={() => { clearIdentity(slug); setLocalIdentity(null); setStep(1) }}>Join again</button><div>{browse}</div></main>
  if (identity && !editing) return <Navigate to={`/e/${slug}/matches`} replace />
  if (!identity && editing) return <Navigate to={`/e/${slug}/join`} replace />
  const eventId = event._id

  function change<K extends keyof ProfileDraft>(key: K, value: ProfileDraft[K]) { setDraft(current => ({ ...current, [key]: value })) }
  async function buildProfile(e: FormEvent) {
    e.preventDefault(); setBusy('reading'); setError(''); setNotice('')
    try {
      const result = await extract({ text })
      setDraft(draftFromExtracted(result))
      if (!result.headline && !result.bio && !result.offers.length) setNotice('AI is taking a break. Add your details below and keep going.')
    } catch {
      setDraft(emptyDraft()); setNotice('AI is taking a break. Add your details below and keep going.')
    } finally { setBusy(null); setStep(2) }
  }
  async function selectPhoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const invalid = validatePhoto(file)
    if (invalid) { setError(invalid); return }
    setBusy('uploading'); setError('')
    try {
      const url = await uploadUrl({})
      const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': file.type }, body: file })
      if (!response.ok) throw new Error('Upload failed')
      const result: { storageId?: string } = await response.json()
      if (!result.storageId) throw new Error('Upload failed')
      change('photoId', result.storageId as Id<'_storage'>)
      setPhotoPreview(URL.createObjectURL(file))
    } catch { setError('Your photo didn’t upload. Try again, or save without it.') }
    finally { setBusy(null) }
  }
  async function saveProfile(e: FormEvent) {
    e.preventDefault(); setError('')
    if (!draft.name.trim()) { setError('Add your name so people can find you.'); return }
    setBusy('saving')
    try {
      const profile = profileFromDraft(draft)
      if (identity && editing) {
        await update({ attendeeId: identity.attendeeId, editKey: identity.editKey, ...profile })
        navigate(`/e/${slug}/matches`)
      } else {
        const saved = await create({ eventId, ...profile })
        if (setIdentity(slug, saved)) navigate(`/e/${slug}/matches`)
        else {
          setRecovery(JSON.stringify(saved))
          setNotice('Your profile is saved, but this browser cannot remember your private edit key. Keep the recovery key below before leaving.')
        }
      }
    } catch { setError('We couldn’t save your profile. Check your details and try again. Your draft is still here.') }
    finally { setBusy(null) }
  }

  return <main className="mx-auto min-h-svh w-full max-w-md bg-cream px-4 pb-28 pt-6 font-sans text-ink">
    <header className="mb-8 flex items-center justify-between gap-4"><Link to={`/e/${slug}`} className="min-h-11 py-3 text-lg font-bold">BridgX</Link><span className="truncate text-xs text-dim">{event.name}</span></header>
    <p className="mb-3 text-sm text-dim">{editing ? 'Your profile' : `1 Tell us · 2 Review ${step === 2 ? '✓' : ''}`}</p>
    <h1 className="mb-6 text-[32px] font-bold leading-[1.15]">{editing ? 'Make your introduction yours.' : step === 1 ? 'Who are you, and who do you want to meet?' : 'Looks like you?'}</h1>
    {notice && <p className="mb-4 rounded-2xl bg-white p-4 text-sm text-charcoal" role="status">{notice}</p>}
    {error && <p className="mb-4 rounded-2xl bg-white p-4 text-sm text-tangerine" role="alert">{error}</p>}
    {recovery ? <section className="rounded-[24px] bg-white p-5"><h2 className="text-lg font-bold">Your private recovery key</h2><p className="mt-2 text-sm text-charcoal">Keep this private. It lets you edit your profile.</p><textarea aria-label="Private recovery key" readOnly value={recovery} className={inputClass} rows={4} /><Link className={outlineClass + ' mt-4'} to={`/e/${slug}/people`}>Browse people</Link></section> : step === 1 ?
      <form onSubmit={buildProfile} className="space-y-5"><label className="block rounded-[24px] bg-white p-5"><span className="text-sm font-bold">Tell us a little about yourself</span><textarea className={inputClass} rows={5} maxLength={12000} value={text} onChange={e => setText(e.target.value)} placeholder="I’m a backend developer building fintech tools. I’m looking for a designer and a cofounder." /></label><p className="text-xs text-dim">Your draft stays private until you review and save it.</p><button className={primaryClass} disabled={busy !== null}>{busy ? <><LoaderCircle size={20} className="animate-spin" aria-hidden="true" />Reading you…</> : <>Build my profile<ArrowRight size={20} aria-hidden="true" /></>}</button><button className="min-h-11 text-sm underline underline-offset-4" type="button" disabled={busy !== null} onClick={() => { setDraft(emptyDraft()); setStep(2) }}>Fill it in myself</button></form> :
      <form onSubmit={saveProfile} className="space-y-3">
        <p className="flex items-center gap-2 text-xs text-dim"><Check size={16} aria-hidden="true" />{editing ? 'Your profile is shared with this event' : 'Built from text · review before sharing'}</p>
        <section className="space-y-4 rounded-[24px] bg-white p-5"><h2 className="text-lg font-bold">About you</h2>{([['name', 'Name', 80], ['headline', 'Headline', 60]] as const).map(([key, label, max]) => <label key={key} className="block text-sm font-bold">{label}<input className={inputClass} required={key === 'name'} maxLength={max} autoComplete={key === 'name' ? 'name' : 'off'} value={draft[key]} onChange={e => change(key, e.target.value)} /></label>)}<label className="block text-sm font-bold">A little about you<textarea className={inputClass} maxLength={200} rows={3} value={draft.bio} onChange={e => change('bio', e.target.value)} /></label></section>
        <TagPicker title="You offer" vocabulary={NEED_TAGS} selected={draft.offers} max={5} onChange={tags => change('offers', tags)} />
        <TagPicker title="You’re looking for" vocabulary={NEED_TAGS} selected={draft.seeking} max={5} onChange={tags => change('seeking', tags)} />
        <TagPicker title="Your world" vocabulary={INDUSTRY_TAGS} selected={draft.industries} max={4} onChange={tags => change('industries', tags)} />
        <section className="rounded-[24px] bg-white p-5"><label className="block text-sm font-bold"><span className="flex items-center gap-2"><MapPin size={20} aria-hidden="true" />Find me</span><input className={inputClass + ' bg-sky'} maxLength={160} placeholder="Blue jacket, near the coffee bar" value={draft.findMe} onChange={e => change('findMe', e.target.value)} /></label><div className="mt-5 flex items-center gap-4">{photoPreview && <img src={photoPreview} alt="Your profile photo preview" className="size-16 rounded-[28px] object-cover" />}<label className={outlineClass}><Camera size={20} aria-hidden="true" />{busy === 'uploading' ? 'Uploading…' : 'Add a selfie'}<input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={selectPhoto} disabled={busy !== null} /></label></div><p className="mt-2 text-xs text-dim">Optional. Your photo will be visible to people in this event.</p></section>
        <details className="rounded-[24px] bg-white p-5" open={editing || undefined}><summary className="min-h-11 cursor-pointer text-lg font-bold">Contacts (optional)</summary><p className="mb-4 text-sm text-charcoal">Only add what you’re happy to share here.</p><div className="space-y-4">{contactFields.map(([key, label, type, placeholder]) => <label key={key} className="block text-sm font-bold">{label}<input className={inputClass} type={type} maxLength={500} placeholder={placeholder} value={draft.contacts[key] ?? ''} onChange={e => change('contacts', { ...draft.contacts, [key]: e.target.value })} /></label>)}</div></details>
        <div className="pt-5"><button className={primaryClass} disabled={busy !== null}>{busy ? <><LoaderCircle size={20} className="animate-spin" aria-hidden="true" />{busy === 'saving' ? 'Saving…' : 'Uploading…'}</> : editing ? 'Save changes' : 'Save & see my matches'}</button></div>
        {!editing && <button className="min-h-11 text-sm underline underline-offset-4" type="button" onClick={() => setStep(1)}>Back to your introduction</button>}
      </form>}
    <div className="mt-5">{browse}</div>
    <TabBar slug={slug} />
  </main>
}

export function JoinPage({ editMode = false }: { editMode?: boolean }) {
  const { slug = '' } = useParams()
  const [params] = useSearchParams()
  const editing = editMode || params.get('edit') === '1'
  return <JoinForm key={`${slug}:${editing}`} slug={slug} editing={editing} />
}
