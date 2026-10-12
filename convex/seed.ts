import { ConvexError, v } from 'convex/values'
import { internalMutation } from './_generated/server'
import { randomString } from './lib/profiles'
import { SEED_PROFILES } from './seedData'

export const run = internalMutation({
  args: { slug: v.string(), name: v.string() },
  returns: v.object({ slug: v.string(), createdEvent: v.boolean(), inserted: v.number(), alreadySeeded: v.boolean() }),
  handler: async (ctx, { slug, name }) => {
    if (slug !== 'demo') throw new ConvexError('Demo seed data can only be written to the demo event.')

    const existingEvent = await ctx.db.query('events').withIndex('by_slug', (q) => q.eq('slug', slug)).unique()
    const eventId = existingEvent?._id ?? await ctx.db.insert('events', {
      slug,
      name: name.trim() || 'BridgX Demo Night',
      adminKey: randomString(40),
    })
    const attendees = await ctx.db.query('attendees').withIndex('by_event', (q) => q.eq('eventId', eventId)).collect()
    if (attendees.some((attendee) => attendee.isSeed)) {
      return { slug, createdEvent: !existingEvent, inserted: 0, alreadySeeded: true }
    }

    for (const profile of SEED_PROFILES) {
      await ctx.db.insert('attendees', {
        eventId,
        ...profile,
        isSeed: true,
        editKey: randomString(40),
      })
    }
    return { slug, createdEvent: !existingEvent, inserted: SEED_PROFILES.length, alreadySeeded: false }
  },
})
