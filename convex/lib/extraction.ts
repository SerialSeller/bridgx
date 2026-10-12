import { v } from 'convex/values'
import { INDUSTRY_TAGS, NEED_TAGS } from '../tags'
import type { IndustryTag, NeedTag } from '../tags'

export const extractedValidator = v.object({
  name: v.optional(v.string()), headline: v.string(), bio: v.string(),
  offers: v.array(v.string()), seeking: v.array(v.string()), industries: v.array(v.string()),
  suggestedContacts: v.optional(v.object({
    github: v.optional(v.string()), website: v.optional(v.string()),
    linkedin: v.optional(v.string()), x: v.optional(v.string()), instagram: v.optional(v.string()),
  })),
})
export type Extracted = {
  name?: string; headline: string; bio: string;
  offers: NeedTag[]; seeking: NeedTag[]; industries: IndustryTag[];
  suggestedContacts?: Partial<Record<'github' | 'website' | 'linkedin' | 'x' | 'instagram', string>>;
}

export function redactContactDetails(text: string): string {
  return text
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email removed]')
    .replace(/(?:\+?\d[\d\s().-]{6,}\d)/g, '[phone removed]')
}

export function safePublicUrl(value: unknown): string | undefined {
  if (typeof value !== 'string' || value.length > 500) return undefined
  try {
    const url = new URL(value.trim())
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return undefined
    return url.href
  } catch { return undefined }
}

function text(value: unknown, max: number) {
  return typeof value === 'string' ? redactContactDetails(value.trim()).slice(0, max) : ''
}
function tags<K extends string>(value: unknown, vocabulary: Record<K, string>, max: number): K[] {
  if (!Array.isArray(value)) return []
  return [...new Set(value.filter((key): key is K => typeof key === 'string' && Object.hasOwn(vocabulary, key)))].slice(0, max)
}

export function sanitizeExtracted(value: unknown): Extracted {
  const empty: Extracted = { headline: '', bio: '', offers: [], seeking: [], industries: [] }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return empty
  const row = value as Record<string, unknown>
  const offers = tags(row.offers, NEED_TAGS, 5)
  const seeking = tags(row.seeking, NEED_TAGS, 5)
  if (offers.includes('cofounder') || seeking.includes('cofounder')) {
    for (const list of [offers, seeking]) {
      if (!list.includes('cofounder')) { if (list.length === 5) list.pop(); list.push('cofounder') }
    }
  }
  const result: Extracted = {
    headline: text(row.headline, 60), bio: text(row.bio, 200), offers, seeking,
    industries: tags(row.industries, INDUSTRY_TAGS, 4),
  }
  const name = text(row.name, 80)
  if (name) result.name = name
  if (row.suggestedContacts && typeof row.suggestedContacts === 'object' && !Array.isArray(row.suggestedContacts)) {
    const contacts = row.suggestedContacts as Record<string, unknown>
    const clean: NonNullable<Extracted['suggestedContacts']> = {}
    for (const key of ['github', 'website', 'linkedin', 'x', 'instagram'] as const) {
      const url = safePublicUrl(contacts[key])
      if (url) clean[key] = url
    }
    if (Object.keys(clean).length) result.suggestedContacts = clean
  }
  return result
}
