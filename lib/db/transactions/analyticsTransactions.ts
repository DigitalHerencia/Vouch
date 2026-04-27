import "server-only"

import type { PrismaClient } from "@/prisma/generated/prisma/client"

import type { AnalyticsEventName, TrackAnalyticsEventInput } from "@/types/analytics"
import { trackAnalyticsEventInputSchema } from "@/schemas/analytics"

type Tx = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>

type AnalyticsEventPrefix =
  | "marketing."
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

export async function recordAnalyticsEventTx(
  _tx: Tx,
  input: TrackAnalyticsEventInput
): Promise<void> {
  trackAnalyticsEventInputSchema.parse(input)
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
