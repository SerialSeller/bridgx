import { ConvexError, v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { cleanProfile, profileFields, publicAttendee, publicAttendeeValidator, randomString, requireProfileKey } from './lib/profiles'

export const create = mutation({
  args: { eventId: v.id('events'), ...profileFields },
  returns: v.object({ attendeeId: v.id('attendees'), editKey: v.string() }),
  handler: async (ctx, { eventId, ...profile }) => {
    if (!await ctx.db.get(eventId)) throw new ConvexError('Event not found.')
    const editKey = randomString(40)
    const attendeeId = await ctx.db.insert('attendees', { eventId, ...cleanProfile(profile), editKey })
    return { attendeeId, editKey }
  },
})

// Updates take the complete reviewed profile. Omitted optional fields are cleared.
export const update = mutation({
  args: { attendeeId: v.id('attendees'), editKey: v.string(), ...profileFields },
  returns: v.null(),
  handler: async (ctx, { attendeeId, editKey, ...profile }) => {
    const existing = await requireProfileKey(ctx, attendeeId, editKey)
    await ctx.db.replace(attendeeId, {
      ...cleanProfile(profile), eventId: existing.eventId, editKey: existing.editKey,
      ...(existing.isSeed !== undefined ? { isSeed: existing.isSeed } : {}),
    })
    const outgoing = await ctx.db.query('matchText').withIndex('by_pair', q => q.eq('fromId', attendeeId)).collect()
    const incoming = await ctx.db.query('matchText').filter(q => q.eq(q.field('toId'), attendeeId)).collect()
    for (const cached of [...outgoing, ...incoming]) await ctx.db.delete(cached._id)
    return null
  },
})

export const get = query({
  args: { attendeeId: v.id('attendees') },
  returns: v.union(publicAttendeeValidator, v.null()),
  handler: async (ctx, args) => {
    const attendee = await ctx.db.get(args.attendeeId)
    return attendee ? publicAttendee(ctx, attendee) : null
  },
})

export const listByEvent = query({
  args: { eventId: v.id('events') },
  returns: v.array(publicAttendeeValidator),
  handler: async (ctx, args) => {
    // The contract keeps events below 1,000 people; reads use the event index.
    const attendees = await ctx.db.query('attendees').withIndex('by_event', (q) => q.eq('eventId', args.eventId)).collect()
    return Promise.all(attendees.map((attendee) => publicAttendee(ctx, attendee)))
  },
})

export const count = query({
  args: { eventId: v.id('events') }, returns: v.number(),
  handler: async (ctx, args) => {
    const attendees = await ctx.db.query('attendees').withIndex('by_event', (q) => q.eq('eventId', args.eventId)).collect()
    return attendees.length
  },
})

export const recent = query({
  args: { eventId: v.id('events') }, returns: v.array(publicAttendeeValidator),
  handler: async (ctx, args) => {
    const attendees = await ctx.db.query('attendees').withIndex('by_event', (q) => q.eq('eventId', args.eventId)).order('desc').take(10)
    return Promise.all(attendees.map((attendee) => publicAttendee(ctx, attendee)))
  },
})
