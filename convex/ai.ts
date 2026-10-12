import { v } from 'convex/values'
import { action } from './_generated/server'
import { chatJSON } from './llm'
import type { ContentPart } from './llm'
import { extractedValidator, redactContactDetails, safePublicUrl, sanitizeExtracted } from './lib/extraction'
import { EXTRACTION_PROMPT } from './prompts'

export const extractProfile = action({
  args: {
    text: v.string(),
    sources: v.optional(v.array(v.object({ label: v.string(), content: v.string() }))),
    imageUrls: v.optional(v.array(v.string())),
    // The upload/review UI must obtain this only after contact details are removed.
    imagesReviewed: v.optional(v.boolean()),
  },
  returns: extractedValidator,
  handler: async (_ctx, args) => {
    const sections = [`Attendee text:\n${redactContactDetails(args.text).slice(0, 12_000)}`]
    for (const source of (args.sources ?? []).slice(0, 5)) {
      sections.push(`Source: ${redactContactDetails(source.label).slice(0, 80)}\n${redactContactDetails(source.content).slice(0, 5_000)}`)
    }
    const content: ContentPart[] = [{ type: 'text', text: sections.join('\n\n') }]
    for (const image of (args.imagesReviewed === true ? args.imageUrls ?? [] : []).slice(0, 2)) {
      const url = safePublicUrl(image)
      if (url?.startsWith('https://')) content.push({ type: 'image_url', image_url: { url } })
    }
    if (!args.text.trim() && !(args.sources?.length) && content.length === 1) return sanitizeExtracted(null)
    const result = await chatJSON([
      { role: 'system', content: EXTRACTION_PROMPT }, { role: 'user', content },
    ])
    return sanitizeExtracted(result)
  },
})
