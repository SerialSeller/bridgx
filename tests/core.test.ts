/// <reference types="vite/client" />
import { convexTest } from 'convex-test'
import { describe, expect, test, vi } from 'vitest'
import { api } from '../convex/_generated/api'
import schema from '../convex/schema'

const modules = import.meta.glob('../convex/**/*.{ts,js}')
const profile = {
  name: 'Ayşe', headline: 'Frontend dev', bio: 'I build useful things.',
  offers: ['frontend'], seeking: ['ux-design'], industries: ['fintech'],
  contacts: { email: 'demo@example.com' }, sources: ['text'],
}

async function setup() {
  const t = convexTest(schema, modules)
  const event = await t.mutation(api.events.create, { name: 'Codex Hackathon Istanbul' })
  const row = await t.query(api.events.getBySlug, { slug: event.slug })
  if (!row) throw new Error('Event missing')
  const me = await t.mutation(api.attendees.create, { eventId: row._id, ...profile })
  return { t, event, eventId: row._id, me }
}

describe('core contract', () => {
  test('creates unique slugs and keeps event admin keys out of reads', async () => {
    const { t, event } = await setup()
    expect(event.slug).toMatch(/^codex-hackathon-istanbul-[a-z0-9]{4}$/)
    expect(event.adminKey.length).toBeGreaterThanOrEqual(32)
    const second = await t.mutation(api.events.create, { name: 'Codex Hackathon Istanbul' })
    expect(second.slug).not.toBe(event.slug)
    const read = await t.query(api.events.getBySlug, { slug: event.slug })
    expect(read).not.toHaveProperty('adminKey')
    expect(await t.query(api.events.getBySlug, { slug: 'missing' })).toBeNull()
    await expect(t.mutation(api.events.create, { name: '   ' })).rejects.toThrow()
  })

  test('protects edits and omits edit keys from every public profile read', async () => {
    const { t, eventId, me } = await setup()
    await expect(t.mutation(api.attendees.update, {
      attendeeId: me.attendeeId, editKey: 'wrong', ...profile, name: 'Intruder',
    })).rejects.toThrow('Invalid profile key')
    await t.mutation(api.attendees.update, {
      attendeeId: me.attendeeId, editKey: me.editKey, ...profile, name: '  Updated  ',
    })
    const person = await t.query(api.attendees.get, { attendeeId: me.attendeeId })
    expect(person?.name).toBe('Updated')
    expect(person).not.toHaveProperty('editKey')
    expect(person).toHaveProperty('photoUrl', null)
    for (const read of [api.attendees.listByEvent, api.attendees.recent]) {
      const people = await t.query(read, { eventId })
      expect(people).toHaveLength(1)
      expect(people[0]).not.toHaveProperty('editKey')
    }
    expect(await t.query(api.attendees.count, { eventId })).toBe(1)
  })

  test('lists only the requested event and returns the ten newest attendees', async () => {
    const { t, eventId } = await setup()
    const other = await t.mutation(api.events.create, { name: 'Other' })
    const otherEvent = await t.query(api.events.getBySlug, { slug: other.slug })
    if (!otherEvent) throw new Error('Event missing')
    await t.mutation(api.attendees.create, { eventId: otherEvent._id, ...profile, name: 'Other person' })
    for (let i = 0; i < 12; i++) {
      await t.mutation(api.attendees.create, { eventId, ...profile, name: `Person ${i}` })
    }
    const recent = await t.query(api.attendees.recent, { eventId })
    expect(recent).toHaveLength(10)
    expect(recent[0].name).toBe('Person 11')
    expect(recent[9].name).toBe('Person 2')
    expect(await t.query(api.attendees.count, { eventId })).toBe(13)
    expect(await t.query(api.attendees.listByEvent, { eventId: otherEvent._id })).toHaveLength(1)
  })

  test('saves require the owner key, toggle once, and cannot cross events', async () => {
    const { t, eventId, me } = await setup()
    const them = await t.mutation(api.attendees.create, { eventId, ...profile, name: 'Deniz' })
    const args = { fromId: me.attendeeId, toId: them.attendeeId, editKey: me.editKey }
    await expect(t.mutation(api.saves.toggle, { ...args, editKey: 'wrong' })).rejects.toThrow('Invalid profile key')
    await expect(t.query(api.saves.listMine, { fromId: me.attendeeId, editKey: 'wrong' })).rejects.toThrow('Invalid profile key')
    expect(await t.mutation(api.saves.toggle, args)).toEqual({ saved: true })
    const saved = await t.query(api.saves.listMine, { fromId: me.attendeeId, editKey: me.editKey })
    expect(saved[0].name).toBe('Deniz')
    expect(saved[0]).not.toHaveProperty('editKey')
    expect(await t.mutation(api.saves.toggle, args)).toEqual({ saved: false })
    expect(await t.query(api.saves.listMine, { fromId: me.attendeeId, editKey: me.editKey })).toEqual([])
    const cross = await t.run(async (ctx) => {
      const id = await ctx.db.insert('events', { slug: 'cross', name: 'Cross', adminKey: 'secret' })
      return ctx.db.insert('attendees', { eventId: id, ...profile, editKey: 'secret' })
    })
    await expect(t.mutation(api.saves.toggle, { ...args, toId: cross })).rejects.toThrow('same event')
  })

  test('puts the most recently saved person first even when IDs sort differently', async () => {
    vi.useFakeTimers()
    try {
      const { t, eventId, me } = await setup()
      const a = await t.mutation(api.attendees.create, { eventId, ...profile, name: 'First' })
      const b = await t.mutation(api.attendees.create, { eventId, ...profile, name: 'Second' })
      const auth = { fromId: me.attendeeId, editKey: me.editKey }
      await t.mutation(api.saves.toggle, { ...auth, toId: a.attendeeId })
      await t.mutation(api.saves.toggle, { ...auth, toId: b.attendeeId })
      const before = await t.query(api.saves.listMine, auth)
      const last = before[1]._id
      await t.mutation(api.saves.toggle, { ...auth, toId: last })
      vi.setSystemTime(Date.now() + 1000)
      await t.mutation(api.saves.toggle, { ...auth, toId: last })
      const after = await t.query(api.saves.listMine, auth)
      expect(after[0]._id).toBe(last)
    } finally {
      vi.useRealTimers()
    }
  })

  test('validates tags and turns a stored photo into a public URL', async () => {
    const { t, eventId } = await setup()
    await expect(t.mutation(api.attendees.create, { eventId, ...profile, offers: ['not-a-tag'] })).rejects.toThrow()
    await expect(t.mutation(api.attendees.create, { eventId, ...profile, seeking: Array(6).fill('backend') })).rejects.toThrow()
    const photoId = await t.run((ctx) => ctx.storage.store(new Blob(['image'], { type: 'image/png' })))
    const person = await t.mutation(api.attendees.create, { eventId, ...profile, photoId })
    const read = await t.query(api.attendees.get, { attendeeId: person.attendeeId })
    expect(read?.photoUrl).toMatch(/^https?:\/\//)
    expect(await t.mutation(api.files.generateUploadUrl, {})).toMatch(/^https?:\/\//)
  })
})
