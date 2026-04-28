"use server"

import { trackMarketingEvent } from "@/lib/actions/analyticsActions"
import { actionFailure, type ActionResult } from "@/types/action-result"
import { marketingCtaClickedSchema, marketingPageViewedSchema } from "@/schemas/marketing"

type MarketingTrackResult = Awaited<ReturnType<typeof trackMarketingEvent>>

export async function trackMarketingPageViewed(input: unknown): Promise<MarketingTrackResult> {
  const parsed = marketingPageViewedSchema.safeParse(input)

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the marketing page event fields.",
      parsed.error.flatten().fieldErrors
    ) as ActionResult<never>
  }

  return trackMarketingEvent({
    eventName: "marketing.page_viewed",
    properties: {
      page_id: parsed.data.pageId,
      path: parsed.data.path,
      referrer_domain: parsed.data.referrerDomain,
    },
  })
}

export async function trackMarketingCtaClicked(input: unknown): Promise<MarketingTrackResult> {
  const parsed = marketingCtaClickedSchema.safeParse(input)

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the marketing CTA event fields.",
      parsed.error.flatten().fieldErrors
    ) as ActionResult<never>
  }

  return trackMarketingEvent({
    eventName: "marketing.cta_clicked",
    properties: {
      cta_id: parsed.data.ctaId,
      page_id: parsed.data.pageId,
      destination: parsed.data.destination,
    },
  })
}
