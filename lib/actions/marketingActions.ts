"use server"

import { z } from "zod"

import { trackMarketingEvent } from "@/lib/actions/analyticsActions"
import { actionFailure, type ActionResult } from "@/types/action-result"

const marketingPageViewedSchema = z.object({
  pageId: z.string().trim().min(1).max(128),
  path: z.string().trim().min(1).max(256),
  referrerDomain: z.string().trim().max(256).optional(),
  sessionId: z.string().trim().min(1).max(128).optional(),
  requestId: z.string().trim().min(1).max(128).optional(),
})

const marketingCtaClickedSchema = z.object({
  ctaId: z.string().trim().min(1).max(128),
  pageId: z.string().trim().min(1).max(128),
  destination: z.string().trim().max(256).optional(),
  sessionId: z.string().trim().min(1).max(128).optional(),
  requestId: z.string().trim().min(1).max(128).optional(),
})

type MarketingTrackResult = Awaited<ReturnType<typeof trackMarketingEvent>>

export async function trackMarketingPageViewed(input: unknown): Promise<MarketingTrackResult> {
  const parsed = marketingPageViewedSchema.safeParse(input)

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the marketing page event fields.",
      parsed.error.flatten().fieldErrors,
    ) as ActionResult<never>
  }

  return trackMarketingEvent({
    eventName: "marketing.page_viewed",
    sessionId: parsed.data.sessionId,
    requestId: parsed.data.requestId,
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
      parsed.error.flatten().fieldErrors,
    ) as ActionResult<never>
  }

  return trackMarketingEvent({
    eventName: "marketing.cta_clicked",
    sessionId: parsed.data.sessionId,
    requestId: parsed.data.requestId,
    properties: {
      cta_id: parsed.data.ctaId,
      page_id: parsed.data.pageId,
      destination: parsed.data.destination,
    },
  })
}
