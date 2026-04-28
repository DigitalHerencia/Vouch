"use server"

import { prisma } from "@/lib/db/prisma"
import type { Prisma } from "@/prisma/generated/prisma/client"
import { trackAnalyticsEventInputSchema } from "@/schemas/analytics"
import { actionFailure, actionSuccess, type ActionResult } from "@/types/action-result"
import type {
  AnalyticsEventGroup,
  AnalyticsEventName,
  TrackAnalyticsEventInput,
} from "@/types/analytics"

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

type FieldErrors = Record<string, string[]>

function getFieldErrors(error: {
  issues: Array<{ path: PropertyKey[]; message: string }>
}): FieldErrors {
  const fieldErrors: FieldErrors = {}

  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "form")
    fieldErrors[field] ??= []
    fieldErrors[field].push(issue.message)
  }

  return fieldErrors
}

function getAnalyticsEventGroup(eventName: AnalyticsEventName): AnalyticsEventGroup {
  const prefix = eventName.split(".")[0] ?? "vouch"
  return EVENT_GROUP_BY_PREFIX[prefix] ?? "vouch"
}

function getEnvironment(): "development" | "preview" | "production" {
  if (process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production") {
    return "production"
  }

  if (process.env.VERCEL_ENV === "preview") {
    return "preview"
  }

  return "development"
}

function toPrismaJson(value: Record<string, unknown>): Prisma.InputJsonObject {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonObject
}

async function trackAnalyticsEvent(
  input: unknown,
  allowedGroups: AnalyticsEventGroup[]
): Promise<ActionResult<AnalyticsActionResult>> {
  const parsed = trackAnalyticsEventInputSchema.safeParse(input)

  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_FAILED",
      "Check the analytics event payload.",
      getFieldErrors(parsed.error)
    )
  }

  const eventGroup = getAnalyticsEventGroup(parsed.data.eventName)

  if (!allowedGroups.includes(eventGroup)) {
    return actionFailure("EVENT_GROUP_MISMATCH", "Analytics event is not allowed for this action.")
  }

  const occurredAt = parsed.data.occurredAt ? new Date(parsed.data.occurredAt) : new Date()

  const data: Prisma.AnalyticsEventCreateInput = {
    eventName: parsed.data.eventName,
    eventGroup,
    environment: getEnvironment(),
    occurredAt,
  }

  if (parsed.data.userId) {
    data.user = {
      connect: {
        id: parsed.data.userId,
      },
    }
  }

  if (parsed.data.sessionId) {
    data.sessionId = parsed.data.sessionId
  }

  if (parsed.data.requestId) {
    data.requestId = parsed.data.requestId
  }

  if (parsed.data.properties) {
    data.properties = toPrismaJson(parsed.data.properties)
  }

  const event = await prisma.analyticsEvent.create({
    data,
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

export async function trackMarketingEvent(
  input: TrackAnalyticsEventInput
): Promise<ActionResult<AnalyticsActionResult>> {
  return trackAnalyticsEvent(input, ["acquisition"])
}

export async function trackSetupEvent(
  input: TrackAnalyticsEventInput
): Promise<ActionResult<AnalyticsActionResult>> {
  return trackAnalyticsEvent(input, ["setup"])
}

export async function trackVouchLifecycleEvent(
  input: TrackAnalyticsEventInput
): Promise<ActionResult<AnalyticsActionResult>> {
  return trackAnalyticsEvent(input, ["vouch"])
}

export async function trackPaymentEvent(
  input: TrackAnalyticsEventInput
): Promise<ActionResult<AnalyticsActionResult>> {
  return trackAnalyticsEvent(input, ["payment"])
}

export async function trackNotificationEvent(
  input: TrackAnalyticsEventInput
): Promise<ActionResult<AnalyticsActionResult>> {
  return trackAnalyticsEvent(input, ["notification"])
}

export async function trackAdminOperationalEvent(
  input: TrackAnalyticsEventInput
): Promise<ActionResult<AnalyticsActionResult>> {
  return trackAnalyticsEvent(input, ["admin"])
}
