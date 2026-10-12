import type { Id } from '../../convex/_generated/dataModel'

export type AttendeeIdentity = { attendeeId: Id<'attendees'>; editKey: string }
const keyFor = (slug: string) => `bridgx:${slug}`

export function parseIdentity(value: string): AttendeeIdentity | null {
  try {
    const parsed: unknown = JSON.parse(value)
    if (typeof parsed !== 'object' || parsed === null) return null
    if (!('attendeeId' in parsed) || !('editKey' in parsed)) return null
    if (typeof parsed.attendeeId !== 'string' || !parsed.attendeeId.trim()) return null
    if (typeof parsed.editKey !== 'string' || !parsed.editKey.trim()) return null
    return { attendeeId: parsed.attendeeId as Id<'attendees'>, editKey: parsed.editKey }
  } catch {
    return null
  }
}

export function getIdentity(slug: string): AttendeeIdentity | null {
  try {
    if (typeof window === 'undefined') return null
    const value = window.localStorage.getItem(keyFor(slug))
    return value ? parseIdentity(value) : null
  } catch {
    return null
  }
}

// A false result lets onboarding keep the key on screen if storage is unavailable.
export function setIdentity(slug: string, identity: AttendeeIdentity): boolean {
  try {
    if (typeof window === 'undefined') return false
    window.localStorage.setItem(keyFor(slug), JSON.stringify(identity))
    return true
  } catch {
    return false
  }
}

export function clearIdentity(slug: string): boolean {
  try {
    if (typeof window === 'undefined') return false
    window.localStorage.removeItem(keyFor(slug))
    return true
  } catch {
    return false
  }
}
