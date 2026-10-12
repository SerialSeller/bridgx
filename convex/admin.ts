import { v } from 'convex/values'
import { internalMutation } from './_generated/server'

// Internal only (CLI): removes test profiles from an event by id.
export const removeAttendees = internalMutation({
  args: { ids: v.array(v.id('attendees')) },
  returns: v.number(),
  handler: async (ctx, { ids }) => {
    let removed = 0
    for (const id of ids) {
      if (await ctx.db.get(id)) {
        await ctx.db.delete(id)
        removed++
      }
    }
    return removed
  },
})
