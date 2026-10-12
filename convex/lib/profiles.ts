import { ConvexError, v } from 'convex/values'
import type { Infer } from 'convex/values'
import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'
import { INDUSTRY_TAGS, NEED_TAGS } from '../tags'

export const contactsValidator = v.object({
  whatsapp: v.optional(v.string()), email: v.optional(v.string()),
  linkedin: v.optional(v.string()), instagram: v.optional(v.string()),
  x: v.optional(v.string()), github: v.optional(v.string()), website: v.optional(v.string()),
})
export const profileFields = {
  name: v.string(), headline: v.string(), bio: v.string(),
  offers: v.array(v.string()), seeking: v.array(v.string()), industries: v.array(v.string()),
  findMe: v.optional(v.string()), photoId: v.optional(v.id('_storage')),
  contacts: contactsValidator, sources: v.array(v.string()),
}
export const profileValidator = v.object(profileFields)
export const publicAttendeeValidator = v.object({
  _id: v.id('attendees'), _creationTime: v.number(), eventId: v.id('events'),
  ...profileFields, photoUrl: v.union(v.string(), v.null()), isSeed: v.optional(v.boolean()),
})
export type Profile = Infer<typeof profileValidator>

export function cleanText(value: string, label: string, max: number, required = false) {
  const trimmed = value.trim()
  if ((required && !trimmed) || trimmed.length > max) {
    throw new ConvexError(`${label} must be ${required ? '1–' : 'at most '}${max} characters.`)
  }
  return trimmed
}

function cleanTags(values: string[], vocabulary: object, label: string, max: number) {
  if (values.length > max || values.some((tag) => !Object.hasOwn(vocabulary, tag))) {
    throw new ConvexError(`${label} must contain at most ${max} valid tags.`)
  }
  return [...new Set(values)]
}

export function cleanProfile(profile: Profile): Profile {
  const contacts: Profile['contacts'] = {}
  for (const [key, value] of Object.entries(profile.contacts)) {
    if (value !== undefined) {
      const trimmed = cleanText(value, 'Contact', 500)
      if (trimmed) contacts[key as keyof Profile['contacts']] = trimmed
    }
  }
  const allowedSources = ['text', 'voice', 'github', 'website', 'screenshot']
  if (profile.sources.length > 5 || profile.sources.some((source) => !allowedSources.includes(source))) {
    throw new ConvexError('Choose valid profile sources.')
  }
  return {
    name: cleanText(profile.name, 'Name', 80, true),
    headline: cleanText(profile.headline, 'Headline', 60),
    bio: cleanText(profile.bio, 'Bio', 200),
    offers: cleanTags(profile.offers, NEED_TAGS, 'Offers', 5),
    seeking: cleanTags(profile.seeking, NEED_TAGS, 'Seeking', 5),
    industries: cleanTags(profile.industries, INDUSTRY_TAGS, 'Industries', 4),
    contacts, sources: [...new Set(profile.sources)],
    ...(profile.findMe?.trim() ? { findMe: cleanText(profile.findMe, 'Find-me hint', 160) } : {}),
    ...(profile.photoId ? { photoId: profile.photoId } : {}),
  }
}

// Convex supplies a strong seeded PRNG inside mutations; generate secrets per call.
export function randomString(length: number, alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_') {
  return Array.from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('')
}

export async function requireProfileKey(ctx: QueryCtx | MutationCtx, attendeeId: Id<'attendees'>, editKey: string) {
  const attendee = await ctx.db.get(attendeeId)
  if (!attendee || !editKey || attendee.editKey !== editKey) {
    throw new ConvexError('Invalid profile key.')
  }
  return attendee
}

export async function publicAttendee(ctx: QueryCtx | MutationCtx, attendee: Doc<'attendees'>): Promise<Infer<typeof publicAttendeeValidator>> {
  return {
    _id: attendee._id, _creationTime: attendee._creationTime, eventId: attendee.eventId,
    name: attendee.name, headline: attendee.headline, bio: attendee.bio,
    offers: attendee.offers, seeking: attendee.seeking, industries: attendee.industries,
    contacts: attendee.contacts, sources: attendee.sources,
    photoUrl: attendee.photoId ? await ctx.storage.getUrl(attendee.photoId) : null,
    ...(attendee.findMe !== undefined ? { findMe: attendee.findMe } : {}),
    ...(attendee.photoId !== undefined ? { photoId: attendee.photoId } : {}),
    ...(attendee.isSeed !== undefined ? { isSeed: attendee.isSeed } : {}),
  }
}
