import { expect, test } from 'vitest'
import { draftFromExtracted, emptyDraft, profileFromDraft, validatePhoto } from '../src/features/onboarding/profileForm'
import type { Id } from '../convex/_generated/dataModel'

test('manual fallback produces a saveable profile and omits blank optional contacts', () => {
  const draft = emptyDraft()
  draft.name = '  Deniz  '
  draft.contacts.email = ' demo@example.com '
  draft.contacts.whatsapp = '   '
  const profile = profileFromDraft(draft)
  expect(profile).toMatchObject({ name: 'Deniz', headline: '', bio: '', offers: [], seeking: [], industries: [], contacts: { email: 'demo@example.com' } })
  expect(profile).not.toHaveProperty('photoId')
  expect(profile).not.toHaveProperty('findMe')
})

test('review keeps AI draft tags and public contact suggestions while preserving editable photo data', () => {
  const draft = draftFromExtracted({ name: 'Ayşe', headline: 'Designer', bio: 'I design apps.', offers: ['ux-design'], seeking: ['cofounder'], industries: ['saas'], suggestedContacts: { github: 'https://github.com/ayse' } })
  draft.findMe = ' Blue jacket '
  draft.photoId = 'photo-id' as Id<'_storage'>
  expect(profileFromDraft(draft)).toMatchObject({ name: 'Ayşe', offers: ['ux-design'], seeking: ['cofounder'], contacts: { github: 'https://github.com/ayse' }, findMe: 'Blue jacket', photoId: 'photo-id', sources: ['text'] })
  expect(draftFromExtracted({ headline: '', bio: '', offers: [], seeking: [], industries: [] }).name).toBe('')
})

test('photo uploads reject unsupported formats and large files before storage calls', () => {
  expect(validatePhoto({ type: 'image/png', size: 1024 })).toBeNull()
  expect(validatePhoto({ type: 'text/html', size: 1024 })).toContain('JPEG')
  expect(validatePhoto({ type: 'image/jpeg', size: 6 * 1024 * 1024 })).toContain('5 MB')
})

test('saving trims text and enforces the backend limits even for an oversized draft', () => {
  const draft = emptyDraft()
  draft.name = '  ' + 'N'.repeat(90) + '  '
  draft.headline = '  ' + 'H'.repeat(70) + '  '
  draft.bio = '  ' + 'B'.repeat(220) + '  '
  draft.offers = ['frontend', 'backend', 'mobile', 'ai-ml', 'data', 'devops']
  draft.seeking = [...draft.offers]
  draft.industries = ['fintech', 'saas', 'edtech', 'healthtech', 'gaming']
  const profile = profileFromDraft(draft)
  expect(profile.name).toHaveLength(80)
  expect(profile.headline).toHaveLength(60)
  expect(profile.bio).toHaveLength(200)
  expect(profile.offers).toHaveLength(5)
  expect(profile.seeking).toHaveLength(5)
  expect(profile.industries).toHaveLength(4)
})
