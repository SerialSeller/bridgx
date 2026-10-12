import type { Id } from '../../convex/_generated/dataModel'

export type AttendeeIdentity = { attendeeId: Id<'attendees'>; editKey: string }
const keyFor = (slug: string) => `bridgx:${slug}`

export function getIdentity(slug: string): AttendeeIdentity | null {
  try {
    if (typeof window === 'undefined') return null
    const value: unknown = JSON.parse(window.localStorage.getItem(keyFor(slug)) ?? 'null')
    if (typeof value !== 'object' || value === null) return null
    if (!('attendeeId' in value) || !('editKey' in value)) return null
    if (typeof value.attendeeId !== 'string' || !value.attendeeId.trim()) return null
    if (typeof value.editKey !== 'string' || !value.editKey.trim()) return null
    return { attendeeId: value.attendeeId as Id<'attendees'>, editKey: value.editKey }
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
