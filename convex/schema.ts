// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  events: defineTable({
    slug: v.string(),                    // url-safe, unique, e.g. "codex-hack-ist"
    name: v.string(),
    date: v.optional(v.string()),
    location: v.optional(v.string()),
    adminKey: v.string(),                // secret, only returned once by events.create
  }).index("by_slug", ["slug"]),

  attendees: defineTable({
    eventId: v.id("events"),
    name: v.string(),
    headline: v.string(),                // "Backend dev @ Trendyol"
    bio: v.string(),                     // 1–2 sentences
    offers: v.array(v.string()),         // NEED_TAGS keys, max 5
    seeking: v.array(v.string()),        // NEED_TAGS keys, max 5
    industries: v.array(v.string()),     // INDUSTRY_TAGS keys, max 4
    findMe: v.optional(v.string()),      // "Blue jacket, near the coffee bar"
    photoId: v.optional(v.id("_storage")),
    contacts: v.object({
      whatsapp: v.optional(v.string()),
      email: v.optional(v.string()),
      linkedin: v.optional(v.string()),
      instagram: v.optional(v.string()),
      x: v.optional(v.string()),
      github: v.optional(v.string()),
      website: v.optional(v.string()),
    }),
    sources: v.array(v.string()),        // "text" | "voice" | "github" | "website" | "screenshot"
    editKey: v.string(),                 // secret; NEVER returned by public queries
    isSeed: v.optional(v.boolean()),
  }).index("by_event", ["eventId"]),

  matchText: defineTable({              // cache of AI explanations
    fromId: v.id("attendees"),
    toId: v.id("attendees"),
    why: v.string(),
    icebreaker: v.string(),
  }).index("by_pair", ["fromId", "toId"]),

  saves: defineTable({
    fromId: v.id("attendees"),
    toId: v.id("attendees"),
  }).index("by_from", ["fromId", "toId"]),
});
