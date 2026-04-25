import type { z } from "zod"
import type {
  legalPageIdSchema,
  marketingCtaClickedSchema,
  marketingCtaIdSchema,
  marketingPageIdSchema,
  marketingPageViewedSchema,
  publicNavigationItemSchema,
} from "@/schemas/marketing"

export type MarketingPageID = z.infer<typeof marketingPageIdSchema>
export type MarketingCtaID = z.infer<typeof marketingCtaIdSchema>
export type LegalPageID = z.infer<typeof legalPageIdSchema>
export type PublicNavigationItem = z.infer<typeof publicNavigationItemSchema>
export type MarketingEventInput = z.infer<typeof marketingPageViewedSchema>
export type MarketingCtaEventInput = z.infer<typeof marketingCtaClickedSchema>