"use server"

import { prisma } from "@/lib/db/prisma"
import { trackAnalyticsEventInputSchema } from "@/schemas/analytics"
import { actionFailure, actionSuccess, type ActionResult } from "@/types/action-result"
import type { AnalyticsEventGroup, AnalyticsEventName, TrackAnalyticsEventInput } from "@/types/analytics"

const EVENT_GROUP_BY_PREFIX: Record<string, AnalyticsEventGroup> = {
  marketing: "acquisition",
  auth: "acquisition",
  setup: "setup",
  vouch: "vouch",
  payment: "payment",
  notification: "notification",
  admin: "admin",
}

type AnalyticsActionResult = {
  eventId: string
  eventName: AnalyticsEventName
  eventGroup: AnalyticsEventGroup
  occurredAt: string
}

function getAnalyticsEventGroup(eventName: AnalyticsEventName): AnalyticsEventGroup {
  const prefix = eventName.split(".")[0]
  return EVENT_GROUP_BY_PREFIX[prefix] ?? "vouch"
}

function getEnvironment() {
  if (process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production") {
    return "production" as const
  }

  if (process.env.VERCEL_ENV === "preview") {
    return "preview" as const
  }

  return "development" as const
}

async function trackAnalyticsEvent(
  input: unknown,
  allowedGroups: AnalyticsEventGroup[],
): Promise<ActionResult<AnalyticsActionResult>> {
  const parsed = trackAnalyticsEventInputSchema.safeParse(input)

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the analytics event payload.",
      parsed.error.flatten().fieldErrors,
    )
  }

  const eventGroup = getAnalyticsEventGroup(parsed.data.eventName)

  if (!allowedGroups.includes(eventGroup)) {
    return actionFailure("EVENT_GROUP_MISMATCH", "Analytics event is not allowed for this action.")
  }

  const occurredAt = parsed.data.occurredAt ? new Date(parsed.data.occurredAt) : new Date()

  const event = await prisma.analyticsEvent.create({
    data: {
      eventName: parsed.data.eventName,
      eventGroup,
      environment: getEnvironment(),
      userId: parsed.data.userId,
      sessionId: parsed.data.sessionId,
      requestId: parsed.data.requestId,
      occurredAt,
      properties: parsed.data.properties ?? {},
    },
    select: {
      id: true,
      eventName: true,
      eventGroup: true,
      occurredAt: true,
    },
  })

  return actionSuccess({
    eventId: event.id,
    eventName: event.eventName as AnalyticsEventName,
    eventGroup: event.eventGroup as AnalyticsEventGroup,
    occurredAt: event.occurredAt.toISOString(),
  })
}

export async function trackMarketingEvent(input: TrackAnalyticsEventInput): Promise<ActionResult<AnalyticsActionResult>> {
  return trackAnalyticsEvent(input, ["acquisition"])
}

export async function trackSetupEvent(input: TrackAnalyticsEventInput): Promise<ActionResult<AnalyticsActionResult>> {
  return trackAnalyticsEvent(input, ["setup"])
}

export async function trackVouchLifecycleEvent(input: TrackAnalyticsEventInput): Promise<ActionResult<AnalyticsActionResult>> {
  return trackAnalyticsEvent(input, ["vouch"])
}

export async function trackPaymentEvent(input: TrackAnalyticsEventInput): Promise<ActionResult<AnalyticsActionResult>> {
  return trackAnalyticsEvent(input, ["payment"])
}

export async function trackNotificationEvent(input: TrackAnalyticsEventInput): Promise<ActionResult<AnalyticsActionResult>> {
  return trackAnalyticsEvent(input, ["notification"])
}

export async function trackAdminOperationalEvent(input: TrackAnalyticsEventInput): Promise<ActionResult<AnalyticsActionResult>> {
  return trackAnalyticsEvent(input, ["admin"])
}
