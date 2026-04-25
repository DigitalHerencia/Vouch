import type { z } from "zod"
import type {
  analyticsEventGroupSchema,
  analyticsEventNameSchema,
  trackAnalyticsEventInputSchema,
} from "@/schemas/analytics"

export type AnalyticsEventGroup = z.infer<typeof analyticsEventGroupSchema>
export type AnalyticsEventName = z.infer<typeof analyticsEventNameSchema>
export type TrackAnalyticsEventInput = z.infer<typeof trackAnalyticsEventInputSchema>