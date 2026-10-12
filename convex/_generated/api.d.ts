/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai from "../ai.js";
import type * as attendees from "../attendees.js";
import type * as events from "../events.js";
import type * as files from "../files.js";
import type * as lib_extraction from "../lib/extraction.js";
import type * as lib_matching from "../lib/matching.js";
import type * as lib_profiles from "../lib/profiles.js";
import type * as llm from "../llm.js";
import type * as matches from "../matches.js";
import type * as prompts from "../prompts.js";
import type * as saves from "../saves.js";
import type * as seed from "../seed.js";
import type * as seedData from "../seedData.js";
import type * as tags from "../tags.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ai: typeof ai;
  attendees: typeof attendees;
  events: typeof events;
  files: typeof files;
  "lib/extraction": typeof lib_extraction;
  "lib/matching": typeof lib_matching;
  "lib/profiles": typeof lib_profiles;
  llm: typeof llm;
  matches: typeof matches;
  prompts: typeof prompts;
  saves: typeof saves;
  seed: typeof seed;
  seedData: typeof seedData;
  tags: typeof tags;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
