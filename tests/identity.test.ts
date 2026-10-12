import { afterEach, expect, test, vi } from 'vitest'
import { clearIdentity, getIdentity, setIdentity } from '../src/lib/identity'
import type { Id } from '../convex/_generated/dataModel'

function storage() {
  const values = new Map<string, string>()
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value) },
    removeItem: (key: string) => { values.delete(key) },
  }
}
afterEach(() => vi.unstubAllGlobals())

test('persists identity separately for each event and clears only one event', () => {
  const localStorage = storage()
  vi.stubGlobal('window', { localStorage })
  const identity = { attendeeId: 'person' as Id<'attendees'>, editKey: 'secret' }
  expect(setIdentity('demo', identity)).toBe(true)
  expect(localStorage.getItem('bridgx:demo')).toBe(JSON.stringify(identity))
  expect(getIdentity('demo')).toEqual(identity)
  expect(getIdentity('other')).toBeNull()
  expect(clearIdentity('demo')).toBe(true)
  expect(getIdentity('demo')).toBeNull()
})

test('treats malformed, missing, and unavailable storage as no identity', () => {
  const localStorage = storage()
  vi.stubGlobal('window', { localStorage })
  for (const value of ['not json', 'null', '{}', '{"attendeeId":123,"editKey":"secret"}']) {
    localStorage.setItem('bridgx:demo', value)
    expect(getIdentity('demo')).toBeNull()
  }
  vi.stubGlobal('window', { get localStorage() { throw new Error('Blocked') } })
  expect(getIdentity('demo')).toBeNull()
  expect(setIdentity('demo', { attendeeId: 'person' as Id<'attendees'>, editKey: 'secret' })).toBe(false)
  expect(clearIdentity('demo')).toBe(false)
})
