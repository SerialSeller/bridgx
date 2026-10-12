import { ConvexError, v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { publicAttendee, publicAttendeeValidator, requireProfileKey } from './lib/profiles'

export const toggle = mutation({
  args: { fromId: v.id('attendees'), toId: v.id('attendees'), editKey: v.string() },
  returns: v.object({ saved: v.boolean() }),
  handler: async (ctx, args) => {
    const me = await requireProfileKey(ctx, args.fromId, args.editKey)
    const them = await ctx.db.get(args.toId)
    if (!them || me.eventId !== them.eventId) throw new ConvexError('Save people from the same event.')
    if (me._id === them._id) throw new ConvexError('Choose someone else to save.')
    const existing = await ctx.db.query('saves')
      .withIndex('by_from', (q) => q.eq('fromId', args.fromId).eq('toId', args.toId)).unique()
    if (existing) {
      await ctx.db.delete(existing._id)
      return { saved: false }
    }
    await ctx.db.insert('saves', { fromId: args.fromId, toId: args.toId })
    return { saved: true }
  },
})

export const listMine = query({
  args: { fromId: v.id('attendees'), editKey: v.string() },
  returns: v.array(publicAttendeeValidator),
  handler: async (ctx, args) => {
    const me = await requireProfileKey(ctx, args.fromId, args.editKey)
    const saves = await ctx.db.query('saves').withIndex('by_from', (q) => q.eq('fromId', args.fromId)).order('desc').collect()
    saves.sort((a, b) => b._creationTime - a._creationTime)
    const attendees = await Promise.all(saves.map((save) => ctx.db.get(save.toId)))
    return Promise.all(attendees.flatMap((attendee) => attendee && attendee.eventId === me.eventId ? [publicAttendee(ctx, attendee)] : []))
  },
})
