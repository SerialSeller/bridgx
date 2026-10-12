/// <reference types="vite/client" />
import { convexTest } from 'convex-test'
import { makeFunctionReference } from 'convex/server'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import schema from '../convex/schema'
import { chatJSON } from '../convex/llm'
import { sanitizeExtracted } from '../convex/lib/extraction'

const modules = import.meta.glob('../convex/**/*.{ts,js}')
const extract = makeFunctionReference<'action'>('ai:extractProfile')
const empty = { headline: '', bio: '', offers: [], seeking: [], industries: [] }
const response = (value: unknown) => new Response(JSON.stringify({ choices: [{ message: { content: value } }] }))

beforeEach(() => {
  vi.stubEnv('LLM_BASE_URL', 'https://example.test/v1/')
  vi.stubEnv('LLM_AUTH', 'Bearer test-secret')
  vi.stubEnv('LLM_MODEL', 'test-model')
})
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.useRealTimers() })

describe('JSON model helper', () => {
  test('uses configured provider, JSON mode, and strips code fences', async () => {
    const fetcher = vi.fn().mockResolvedValue(response('```json\n{"ok":true}\n```'))
    vi.stubGlobal('fetch', fetcher)
    expect(await chatJSON([{ role: 'user', content: 'test' }])).toEqual({ ok: true })
    const [url, options] = fetcher.mock.calls[0]
    expect(url).toBe('https://example.test/v1/chat/completions')
    expect(options.headers.Authorization).toBe('Bearer test-secret')
    expect(JSON.parse(options.body)).toMatchObject({ model: 'test-model', response_format: { type: 'json_object' } })
  })

  test('returns null on missing config, bad HTTP, malformed JSON, or network failure', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response('', { status: 401 }))
    vi.stubGlobal('fetch', fetcher)
    expect(await chatJSON([])).toBeNull()
    fetcher.mockResolvedValue(response('not JSON'))
    expect(await chatJSON([])).toBeNull()
    fetcher.mockRejectedValue(new Error('offline'))
    expect(await chatJSON([])).toBeNull()
    vi.stubEnv('LLM_AUTH', '')
    fetcher.mockClear()
    expect(await chatJSON([])).toBeNull()
    expect(fetcher).not.toHaveBeenCalled()
  })

  test('aborts a stalled call at the deadline and returns null', async () => {
    vi.useFakeTimers()
    vi.stubGlobal('fetch', vi.fn((_url, options) => new Promise((_resolve, reject) => {
      options.signal.addEventListener('abort', () => reject(new Error('aborted')))
    })))
    const result = chatJSON([], { timeoutMs: 20 })
    await vi.advanceTimersByTimeAsync(21)
    expect(await result).toBeNull()
  })
})

describe('profile extraction', () => {
  test('validates shapes, drops unknown tags, deduplicates, caps fields, and ignores private contacts', () => {
    const value = sanitizeExtracted({
      name: '  Deniz  ', headline: 'x'.repeat(90), bio: 'b'.repeat(250),
      offers: ['frontend', 'frontend', 'bogus', 'backend', 'ai-ml', 'data', 'devops', 'security'],
      seeking: 'sales', industries: ['fintech', 'bogus', 'saas', 'edtech', 'healthtech', 'gaming'],
      suggestedContacts: { email: 'private@example.com', whatsapp: '+905551234567', website: 'javascript:alert(1)', github: 'https://github.com/deniz' },
    })
    expect(value.name).toBe('Deniz')
    expect(value.headline).toHaveLength(60)
    expect(value.bio).toHaveLength(200)
    expect(value.offers).toEqual(['frontend', 'backend', 'ai-ml', 'data', 'devops'])
    expect(value.seeking).toEqual([])
    expect(value.industries).toEqual(['fintech', 'saas', 'edtech', 'healthtech'])
    expect(value.suggestedContacts).toEqual({ github: 'https://github.com/deniz' })
    expect(sanitizeExtracted(null)).toEqual(empty)
    expect(sanitizeExtracted(['bad'])).toEqual(empty)
  })

  test('redacts phone and email text, labels supplied sources, and sends image content parts', async () => {
    const fetcher = vi.fn().mockResolvedValue(response(JSON.stringify({
      headline: 'React developer', bio: 'I build fintech tools.',
      offers: ['frontend', 'cofounder'], seeking: ['sales', 'cofounder'], industries: ['fintech'],
    })))
    vi.stubGlobal('fetch', fetcher)
    const t = convexTest(schema, modules)
    const result = await t.action(extract, {
      text: 'I build React fintech. Looking for a sales cofounder. Email me private@example.com or +90 555 123 45 67.',
      sources: [{ label: 'GitHub', content: 'Developer at private@example.com, +905551234567' }],
      imageUrls: ['https://example.test/profile.png'], imagesReviewed: true,
    })
    expect(result).toMatchObject({ offers: ['frontend', 'cofounder'], seeking: ['sales', 'cofounder'], industries: ['fintech'] })
    const request = JSON.parse(fetcher.mock.calls[0][1].body)
    const payload = JSON.stringify(request.messages)
    expect(payload).not.toContain('private@example.com')
    expect(payload).not.toContain('555')
    expect(payload).toContain('GitHub')
    expect(request.messages[1].content).toContainEqual({ type: 'image_url', image_url: { url: 'https://example.test/profile.png' } })
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  test('AI failures and invalid image URLs still return a usable empty review form', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response('', { status: 503 }))
    vi.stubGlobal('fetch', fetcher)
    const t = convexTest(schema, modules)
    expect(await t.action(extract, { text: 'I am a developer', imageUrls: ['javascript:alert(1)'] })).toEqual(empty)
    const request = JSON.parse(fetcher.mock.calls[0][1].body)
    expect(request.messages[1].content.filter((p: { type: string }) => p.type === 'image_url')).toEqual([])
  })

  test('removes slash-separated and local seven-digit phone numbers from every text source', async () => {
    const fetcher = vi.fn().mockResolvedValue(response('{}'))
    vi.stubGlobal('fetch', fetcher)
    const t = convexTest(schema, modules)
    await t.action(extract, { text: 'Developer. Call 0555/1234567', sources: [{ label: 'Website', content: 'Phone: 5551234' }] })
    const payload = fetcher.mock.calls[0][1].body
    expect(payload).not.toContain('0555/1234567')
    expect(payload).not.toContain('5551234')
  })

  test('never forwards screenshots until the caller confirms contact details were reviewed and removed', async () => {
    const fetcher = vi.fn().mockResolvedValue(response('{}'))
    vi.stubGlobal('fetch', fetcher)
    const t = convexTest(schema, modules)
    await t.action(extract, { text: 'Developer', imageUrls: ['https://example.test/unreviewed.png'] })
    const payload = fetcher.mock.calls[0][1].body
    expect(payload).not.toContain('unreviewed.png')
    expect(payload).not.toContain('image_url')
  })
})
