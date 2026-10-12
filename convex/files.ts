import { v } from 'convex/values'
import { mutation } from './_generated/server'

export const generateUploadUrl = mutation({
  args: {}, returns: v.string(),
  handler: (ctx) => ctx.storage.generateUploadUrl(),
})
