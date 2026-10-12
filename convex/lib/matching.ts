import { INDUSTRY_TAGS, NEED_TAGS } from '../tags'

export type MatchProfile = { _id: string; eventId: string; name: string; offers: string[]; seeking: string[]; industries: string[] }
export type MatchKind = 'helps-you' | 'you-help' | 'same-world'
export type Overlap = { need: string[]; give: string[]; industries: string[]; offers: string[] }
export type RankedMatch<T extends MatchProfile> = { person: T; score: number; kind: MatchKind; overlap: Overlap; sharedTags: string[] }

function intersection(a: string[], b: string[]) {
  const other = new Set(b)
  return [...new Set(a)].filter(tag => other.has(tag))
}

export function rankMatches<T extends MatchProfile>(me: MatchProfile, people: T[]): RankedMatch<T>[] {
  const matches: RankedMatch<T>[] = []
  for (const person of people) {
    if (person._id === me._id || person.eventId !== me.eventId) continue
    const overlap: Overlap = {
      need: intersection(me.seeking, person.offers), give: intersection(person.seeking, me.offers),
      industries: intersection(me.industries, person.industries), offers: intersection(me.offers, person.offers),
    }
    const need = 3 * overlap.need.length
    const give = 2 * overlap.give.length
    const same = overlap.industries.length + 0.5 * overlap.offers.length
    const score = need + give + same
    if (!score) continue
    const kind: MatchKind = need >= give && need >= same ? 'helps-you' : give >= same ? 'you-help' : 'same-world'
    matches.push({ person, score, kind, overlap, sharedTags: [...new Set([...overlap.need, ...overlap.give, ...overlap.industries, ...overlap.offers])] })
  }
  return matches.sort((a, b) => b.score - a.score || a.person._id.localeCompare(b.person._id)).slice(0, 5)
}

function labels(keys: string[], vocabulary: Record<string, string>) { return keys.map(key => vocabulary[key] ?? key).slice(0, 2).join(' and ') }

export function fallbackMatch<T extends MatchProfile>(match: RankedMatch<T>) {
  const { person, overlap, kind } = match
  let why: string
  let topic: string
  let icebreaker: string
  const first = person.name.trim().split(/\s+/)[0] || person.name
  if (kind === 'helps-you') {
    topic = labels(overlap.need, NEED_TAGS)
    why = `You're looking for ${topic} and ${person.name} offers it.`
    icebreaker = `Hi ${first}, I'm looking for ${topic.toLowerCase()} help. Got five minutes to compare notes?`
  } else if (kind === 'you-help') {
    topic = labels(overlap.give, NEED_TAGS)
    why = `${person.name} is looking for ${topic}; you can help.`
    icebreaker = `Hi ${first}, I saw you're looking for ${topic.toLowerCase()}. That's what I do. What are you building?`
  } else {
    topic = overlap.industries.length ? labels(overlap.industries, INDUSTRY_TAGS) : labels(overlap.offers, NEED_TAGS)
    why = `You and ${person.name} share ${topic} interests.`
    icebreaker = `Hi ${first}, we're both in ${topic.toLowerCase()}. What are you working on right now?`
  }
  return { why: why.slice(0, 140), icebreaker: icebreaker.slice(0, 120) }
}

export function sanitizeMatchText(value: unknown, fallback: { why: string; icebreaker: string }) {
  const fields = typeof value === 'object' && value !== null ? value as Record<string, unknown> : {}
  return {
    why: typeof fields.why === 'string' && fields.why.trim() ? fields.why.trim().slice(0, 140) : fallback.why,
    icebreaker: typeof fields.icebreaker === 'string' && fields.icebreaker.trim() ? fields.icebreaker.trim().slice(0, 120) : fallback.icebreaker,
  }
}
