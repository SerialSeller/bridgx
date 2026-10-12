/// <reference types="vite/client" />
import { convexTest } from 'convex-test'
import { makeFunctionReference } from 'convex/server'
import { afterEach, describe, expect, test, vi } from 'vitest'
import schema from '../convex/schema'
import { api } from '../convex/_generated/api'
import { rankMatches, sanitizeMatchText } from '../convex/lib/matching'

const modules = import.meta.glob('../convex/**/*.{ts,js}')
const forMe = makeFunctionReference<'query'>('matches:forMe')
const me = { _id: 'me', eventId: 'one', name: 'Deniz', offers: ['backend', 'cofounder'], seeking: ['ux-design', 'cofounder'], industries: ['fintech'] }
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs() })

test('malformed explanations fall back and generated text is bounded', () => {
  const fallback = { why: 'You can help.', icebreaker: 'What are you building?' }
  expect(sanitizeMatchText({ why: 3, icebreaker: [] }, fallback)).toEqual(fallback)
  expect(sanitizeMatchText({ why: 'w'.repeat(150), icebreaker: 'i'.repeat(140) }, fallback)).toEqual({ why: 'w'.repeat(140), icebreaker: 'i'.repeat(120) })
})

test('AI failure caches fallback, skips second calls, and profile edits invalidate text', async () => {
  vi.stubEnv('LLM_BASE_URL', 'https://model.example/v1')
  vi.stubEnv('LLM_AUTH', 'Key test-only')
  vi.stubEnv('LLM_MODEL', 'test-model')
  const fetchMock = vi.fn().mockResolvedValue(new Response('unavailable', {status:503}))
  vi.stubGlobal('fetch', fetchMock)
  const t = convexTest(schema, modules)
  const event = await t.mutation(api.events.create, {name:'Cache QA'})
  const row = await t.query(api.events.getBySlug, {slug:event.slug})
  if (!row) throw new Error('Event missing')
  const base = {eventId:row._id, headline:'Builder', bio:'Email me at private@example.com or +90 555 123 4567', contacts:{email:'private@example.com'}, sources:['text'], industries:[]}
  const mine = await t.mutation(api.attendees.create, {...base,name:'QA',offers:['backend'],seeking:['ux-design']})
  const other = await t.mutation(api.attendees.create, {...base,name:'Designer',offers:['ux-design'],seeking:['backend']})
  const explain = makeFunctionReference<'action'>('ai:explainMatches')
  await expect(t.action(explain, {...mine,editKey:'wrong'})).rejects.toThrow('Invalid profile key')
  await t.action(explain, mine)
  expect(fetchMock).toHaveBeenCalledTimes(1)
  const body = String(fetchMock.mock.calls[0][1].body)
  expect(body).not.toContain('private@example.com')
  expect(body).not.toContain('555 123 4567')
  expect((await t.query(forMe, {attendeeId:mine.attendeeId}))[0]).toMatchObject({hasExplanation:true})
  await t.action(explain, mine)
  expect(fetchMock).toHaveBeenCalledTimes(1)
  await t.mutation(api.attendees.update, {...other,name:'Updated designer',headline:base.headline,bio:base.bio,contacts:base.contacts,sources:base.sources,industries:[],offers:['ux-design'],seeking:['backend']})
  expect((await t.query(forMe, {attendeeId:mine.attendeeId}))[0].hasExplanation).toBe(false)
})

describe('matching score', () => {
  test('calculates weighted terms and overlapping tags exactly', () => {
    const [match] = rankMatches(me, [{ ...me, _id: 'designer', name: 'Ayşe', offers: ['ux-design', 'cofounder'], seeking: ['backend', 'cofounder'] }])
    expect(match.score).toBe(11.5)
    expect(match.kind).toBe('helps-you')
    expect(match.overlap).toEqual({ need: ['ux-design', 'cofounder'], give: ['backend', 'cofounder'], industries: ['fintech'], offers: ['cofounder'] })
  })
  test('skips self, other events, and zero scores; caps at five in stable order', () => {
    const people = Array.from({ length: 8 }, (_, i) => ({ ...me, _id: `p${i}`, name: `Person ${i}` }))
    const zero = { ...me, _id: 'zero', offers: ['marketing'], seeking: ['sales'], industries: ['gaming'] }
    const other = { ...me, _id: 'other', eventId: 'two' }
    const first = rankMatches(me, [me, zero, other, ...people])
    expect(first).toHaveLength(5)
    expect(first.map(x => x.person._id)).toEqual(['p0', 'p1', 'p2', 'p3', 'p4'])
    expect(rankMatches(me, [...people].reverse())).toEqual(first)
  })
  test('kind uses the largest weighted term and duplicate tags do not inflate scores', () => {
    const give = { ...me, _id: 'give', offers: ['ux-design', 'ux-design'], seeking: ['backend', 'cofounder'], industries: [] }
    expect(rankMatches(me, [give])[0]).toMatchObject({ score: 7, kind: 'you-help' })
    const same = { ...me, _id: 'same', offers: ['backend'], seeking: [], industries: ['fintech'] }
    expect(rankMatches(me, [same])[0]).toMatchObject({ score: 1.5, kind: 'same-world' })
  })
})

describe('matching query', () => {
  test('returns same-event public profiles, cached text, and new relevant joins', async () => {
    const t = convexTest(schema, modules)
    const event = await t.mutation(api.events.create, { name: 'Matches' })
    const row = await t.query(api.events.getBySlug, { slug: event.slug })
    if (!row) throw new Error('Event missing')
    const base = { headline: 'Backend dev', bio: 'Building together', contacts: {}, sources: ['text'], eventId: row._id }
    const mine = await t.mutation(api.attendees.create, { ...base, name: me.name, offers: me.offers, seeking: me.seeking, industries: me.industries })
    const marketer = await t.mutation(api.attendees.create, { ...base, name: 'Marketer', offers: ['marketing'], seeking: ['backend'], industries: [] })
    const before = await t.query(forMe, { attendeeId: mine.attendeeId })
    expect(before.map((x: { attendee: { name: string } }) => x.attendee.name)).toEqual(['Marketer'])
    const designer = await t.mutation(api.attendees.create, { ...base, name: 'Ayşe', offers: ['ux-design', 'cofounder'], seeking: ['backend', 'cofounder'], industries: ['fintech'] })
    await t.run(ctx => ctx.db.insert('matchText', { fromId: mine.attendeeId, toId: designer.attendeeId, why: 'You can build together.', icebreaker: 'What are you building?' }))
    const after = await t.query(forMe, { attendeeId: mine.attendeeId })
    expect(after[0]).toMatchObject({ attendee: { name: 'Ayşe' }, hasExplanation: true, why: 'You can build together.', icebreaker: 'What are you building?' })
    expect(after[0].attendee).not.toHaveProperty('editKey')
    expect(after[1].attendee._id).toBe(marketer.attendeeId)
    expect(after[1].why.length).toBeGreaterThan(0)
    expect(after[1].icebreaker.length).toBeGreaterThan(0)
    const foreign = await t.run(async ctx => {
      const eventId = await ctx.db.insert('events', { slug: 'other', name: 'Other', adminKey: 'secret' })
      return ctx.db.insert('attendees', { ...base, eventId, name: 'Other', offers: me.offers, seeking: me.seeking, industries: me.industries, editKey: 'secret' })
    })
    expect((await t.query(forMe, { attendeeId: mine.attendeeId })).map((x: { attendee: { _id: string } }) => x.attendee._id)).not.toContain(foreign)
  })
})
