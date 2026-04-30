import "server-only"

import type { Prisma, PrismaClient } from "@/prisma/generated/prisma/client"

import type {
  AnalyticsEventGroup,
  AnalyticsEventName,
  TrackAnalyticsEventInput,
} from "@/types/analytics"
import { trackAnalyticsEventInputSchema } from "@/schemas/analytics"

type Tx = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>

type AnalyticsEventPrefix =
  | "marketing."
  | "auth."
  | "setup."
  | "vouch."
  | "payment."
  | "notification."
  | "admin."

function assertEventPrefix(eventName: AnalyticsEventName, prefix: AnalyticsEventPrefix): void {
  if (!eventName.startsWith(prefix)) {
    throw new Error(`INVALID_ANALYTICS_EVENT_GROUP: expected ${prefix}`)
  }
}

function getEventGroup(eventName: AnalyticsEventName): AnalyticsEventGroup {
  if (eventName.startsWith("marketing.") || eventName.startsWith("auth.")) {
    return "acquisition"
  }

  const [prefix] = eventName.split(".")

  if (
    prefix === "setup" ||
    prefix === "vouch" ||
    prefix === "payment" ||
    prefix === "notification" ||
    prefix === "admin"
  ) {
    return prefix
  }

  return "acquisition"
}

function getEnvironment(): "development" | "preview" | "production" {
  if (process.env.VERCEL_ENV === "preview") return "preview"
  if (process.env.NODE_ENV === "production") return "production"
  return "development"
}

export async function recordAnalyticsEventTx(
  tx: Tx,
  input: TrackAnalyticsEventInput
): Promise<void> {
  const parsed = trackAnalyticsEventInputSchema.parse(input)

  await tx.analyticsEvent.create({
    data: {
      eventName: parsed.eventName,
      eventGroup: getEventGroup(parsed.eventName),
      environment: getEnvironment(),
      userId: parsed.userId ?? null,
      sessionId: parsed.sessionId ?? null,
      requestId: parsed.requestId ?? null,
      occurredAt: parsed.occurredAt ? new Date(parsed.occurredAt) : new Date(),
      properties: (parsed.properties ?? {}) as Prisma.InputJsonValue,
    },
  })
}

export async function recordMarketingAnalyticsEventTx(
  tx: Tx,
  input: TrackAnalyticsEventInput
): Promise<void> {
  const parsed = trackAnalyticsEventInputSchema.parse(input)
  assertEventPrefix(parsed.eventName, "marketing.")

  await recordAnalyticsEventTx(tx, input)
}

export async function recordSetupAnalyticsEventTx(
  tx: Tx,
  input: TrackAnalyticsEventInput
): Promise<void> {
  const parsed = trackAnalyticsEventInputSchema.parse(input)
  assertEventPrefix(parsed.eventName, "setup.")

  await recordAnalyticsEventTx(tx, input)
}

export async function recordVouchLifecycleAnalyticsEventTx(
  tx: Tx,
  input: TrackAnalyticsEventInput
): Promise<void> {
  const parsed = trackAnalyticsEventInputSchema.parse(input)
  assertEventPrefix(parsed.eventName, "vouch.")

  await recordAnalyticsEventTx(tx, input)
}

export async function recordPaymentAnalyticsEventTx(
  tx: Tx,
  input: TrackAnalyticsEventInput
): Promise<void> {
  const parsed = trackAnalyticsEventInputSchema.parse(input)
  assertEventPrefix(parsed.eventName, "payment.")

  await recordAnalyticsEventTx(tx, input)
}

export async function recordNotificationAnalyticsEventTx(
  tx: Tx,
  input: TrackAnalyticsEventInput
): Promise<void> {
  const parsed = trackAnalyticsEventInputSchema.parse(input)
  assertEventPrefix(parsed.eventName, "notification.")

  await recordAnalyticsEventTx(tx, input)
}

export async function recordAdminAnalyticsEventTx(
  tx: Tx,
  input: TrackAnalyticsEventInput
): Promise<void> {
  const parsed = trackAnalyticsEventInputSchema.parse(input)
  assertEventPrefix(parsed.eventName, "admin.")

  await recordAnalyticsEventTx(tx, input)
}
