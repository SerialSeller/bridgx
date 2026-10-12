// Organizers have no login: the admin key from event creation is remembered on this device.
const keyFor = (slug: string) => `bridgx:admin:${slug}`

export function getAdminKey(slug: string): string | null {
  try {
    if (typeof window === 'undefined') return null
    return window.localStorage.getItem(keyFor(slug))
  } catch {
    return null
  }
}

export function setAdminKey(slug: string, adminKey: string): void {
  try {
    if (typeof window === 'undefined' || !adminKey) return
    window.localStorage.setItem(keyFor(slug), adminKey)
  } catch {
    // Storage unavailable: the admin link in the address bar still works.
  }
}
