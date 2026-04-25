import { z } from "zod"
import { internalReturnToPathSchema } from "./common"

export const marketingPageIdSchema = z.enum([
  "home",
  "how_it_works",
  "pricing",
  "faq",
  "terms",
  "privacy",
])

export const marketingCtaIdSchema = z.enum([
  "create_vouch",
  "how_it_works",
  "sign_in",
  "get_started",
  "learn_principles",
])

export const legalPageIdSchema = z.enum(["terms", "privacy"])

export const sanitizedMarketingPathSchema = internalReturnToPathSchema

export const sanitizedReferrerDomainSchema = z
  .string()
  .trim()
  .max(253)
  .regex(/^[a-z0-9.-]+$/i)
  .optional()

export const publicNavigationItemSchema = z.object({
  label: z.string().trim().min(1).max(80),
  href: internalReturnToPathSchema,
  external: z.boolean().optional(),
})

export const marketingPageViewedSchema = z.object({
  pageId: marketingPageIdSchema,
  path: sanitizedMarketingPathSchema,
  referrerDomain: sanitizedReferrerDomainSchema,
})

export const marketingCtaClickedSchema = z.object({
  ctaId: marketingCtaIdSchema,
  pageId: marketingPageIdSchema,
  destination: internalReturnToPathSchema.optional(),
})