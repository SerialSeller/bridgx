import type { Id } from '../../../convex/_generated/dataModel'
import type { Extracted } from '../../../convex/lib/extraction'
import type { Profile } from '../../../convex/lib/profiles'

export type ProfileDraft = Profile & { findMe: string }
export function emptyDraft(): ProfileDraft {
  return { name: '', headline: '', bio: '', offers: [], seeking: [], industries: [], contacts: {}, sources: ['text'], findMe: '' }
}
export function draftFromExtracted(value: Extracted): ProfileDraft {
  return { ...emptyDraft(), ...value, name: value.name ?? '', contacts: { ...value.suggestedContacts }, sources: ['text'] }
}
export function profileFromDraft(draft: ProfileDraft): Profile {
  const contacts: Profile['contacts'] = {}
  for (const [key, value] of Object.entries(draft.contacts)) {
    if (value?.trim()) contacts[key as keyof Profile['contacts']] = value.trim()
  }
  return {
    name: draft.name.trim().slice(0, 80), headline: draft.headline.trim().slice(0, 60), bio: draft.bio.trim().slice(0, 200),
    offers: draft.offers.slice(0, 5), seeking: draft.seeking.slice(0, 5), industries: draft.industries.slice(0, 4),
    contacts, sources: draft.sources,
    ...(draft.findMe.trim() ? { findMe: draft.findMe.trim() } : {}),
    ...(draft.photoId ? { photoId: draft.photoId as Id<'_storage'> } : {}),
  }
}
export function validatePhoto(file: { type: string; size: number }): string | null {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return 'Choose a JPEG, PNG, or WebP photo.'
  if (file.size > 5 * 1024 * 1024) return 'Choose a photo smaller than 5 MB.'
  return null
}
