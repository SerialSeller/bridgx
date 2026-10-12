import { v } from 'convex/values'
import { internalMutation, internalQuery, query } from './_generated/server'
import { publicAttendee, publicAttendeeValidator, requireProfileKey } from './lib/profiles'
import type { Doc } from './_generated/dataModel'
import { fallbackMatch, rankMatches } from './lib/matching'

export const matchKindValidator = v.union(v.literal('helps-you'), v.literal('you-help'), v.literal('same-world'))
export const overlapValidator = v.object({ need: v.array(v.string()), give: v.array(v.string()), industries: v.array(v.string()), offers: v.array(v.string()) })
export const forMe = query({
  args: { attendeeId: v.id('attendees') },
  returns: v.array(v.object({
    attendee: publicAttendeeValidator, score: v.number(), kind: matchKindValidator,
    overlap: overlapValidator, sharedTags: v.array(v.string()), why: v.string(), icebreaker: v.string(), hasExplanation: v.boolean(),
  })),
  handler: async (ctx, { attendeeId }) => {
    const me = await ctx.db.get(attendeeId)
    if (!me) return []
    const people = await ctx.db.query('attendees').withIndex('by_event', q => q.eq('eventId', me.eventId)).collect()
    return Promise.all(rankMatches(me, people).map(async match => {
      const cached = await ctx.db.query('matchText').withIndex('by_pair', q => q.eq('fromId', me._id).eq('toId', match.person._id)).unique()
      const fallback = fallbackMatch(match)
      return {
        attendee: await publicAttendee(ctx, match.person), score: match.score, kind: match.kind,
        overlap: match.overlap, sharedTags: match.sharedTags,
        why: cached?.why || fallback.why, icebreaker: cached?.icebreaker || fallback.icebreaker, hasExplanation: Boolean(cached),
      }
    }))
  },
})

const promptProfile = v.object({ name: v.string(), headline: v.string(), bio: v.string(), offers: v.array(v.string()), seeking: v.array(v.string()), industries: v.array(v.string()) })
const textPair = v.object({ toId: v.id('attendees'), why: v.string(), icebreaker: v.string() })
function profileText(person: Doc<'attendees'>) {
  return { name: person.name, headline: person.headline, bio: person.bio, offers: person.offers, seeking: person.seeking, industries: person.industries }
}

export const explanationPlan = internalQuery({
  args: { attendeeId: v.id('attendees'), editKey: v.string() },
  returns: v.object({ me: promptProfile, matches: v.array(v.object({ ...textPair.fields, person: promptProfile })) }),
  handler: async (ctx, { attendeeId, editKey }) => {
    const me = await requireProfileKey(ctx, attendeeId, editKey)
    const people = await ctx.db.query('attendees').withIndex('by_event', q => q.eq('eventId', me.eventId)).collect()
    const missing = []
    for (const match of rankMatches(me, people).slice(0, 3)) {
      const cached = await ctx.db.query('matchText').withIndex('by_pair', q => q.eq('fromId', me._id).eq('toId', match.person._id)).unique()
      if (!cached) missing.push({ toId: match.person._id, person: profileText(match.person), ...fallbackMatch(match) })
    }
    return { me: profileText(me), matches: missing }
  },
})

export const storeExplanations = internalMutation({
  args: { attendeeId: v.id('attendees'), editKey: v.string(), pairs: v.array(textPair) }, returns: v.null(),
  handler: async (ctx, { attendeeId, editKey, pairs }) => {
    const me = await requireProfileKey(ctx, attendeeId, editKey)
    for (const pair of pairs.slice(0, 3)) {
      const person = await ctx.db.get(pair.toId)
      if (!person || person.eventId !== me.eventId || pair.toId === attendeeId) continue
      const existing = await ctx.db.query('matchText').withIndex('by_pair', q => q.eq('fromId', attendeeId).eq('toId', pair.toId)).unique()
      if (!existing) await ctx.db.insert('matchText', { fromId: attendeeId, toId: pair.toId, why: pair.why.slice(0, 140), icebreaker: pair.icebreaker.slice(0, 120) })
    }
    return null
  },
})
