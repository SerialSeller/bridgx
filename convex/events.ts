import { ConvexError, v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { cleanText, randomString } from './lib/profiles'

const publicEventValidator = v.object({
  _id: v.id('events'), _creationTime: v.number(), slug: v.string(), name: v.string(),
  date: v.optional(v.string()), location: v.optional(v.string()),
})

export const create = mutation({
  args: { name: v.string(), date: v.optional(v.string()), location: v.optional(v.string()) },
  returns: v.object({ slug: v.string(), adminKey: v.string() }),
  handler: async (ctx, args) => {
    const name = cleanText(args.name, 'Event name', 120, true)
    const base = name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60).replace(/-$/, '') || 'event'
    let slug = ''
    for (let attempt = 0; attempt < 8; attempt++) {
      const candidate = `${base}-${randomString(4, 'abcdefghijklmnopqrstuvwxyz0123456789')}`
      const existing = await ctx.db.query('events').withIndex('by_slug', (q) => q.eq('slug', candidate)).unique()
      if (!existing) { slug = candidate; break }
    }
    if (!slug) throw new ConvexError('Please try creating the event again.')
    const adminKey = randomString(40)
    await ctx.db.insert('events', {
      slug, name, adminKey,
      ...(args.date?.trim() ? { date: cleanText(args.date, 'Date', 40) } : {}),
      ...(args.location?.trim() ? { location: cleanText(args.location, 'Location', 160) } : {}),
    })
    return { slug, adminKey }
  },
})

export const getBySlug = query({
  args: { slug: v.string() },
  returns: v.union(publicEventValidator, v.null()),
  handler: async (ctx, args) => {
    const event = await ctx.db.query('events').withIndex('by_slug', (q) => q.eq('slug', args.slug)).unique()
    if (!event) return null
    return {
      _id: event._id, _creationTime: event._creationTime, slug: event.slug, name: event.name,
      ...(event.date !== undefined ? { date: event.date } : {}),
      ...(event.location !== undefined ? { location: event.location } : {}),
    }
  },
})
