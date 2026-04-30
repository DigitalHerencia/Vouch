import "server-only"

import { verifyWebhook as verifyClerkRequestWebhook } from "@clerk/nextjs/webhooks"
import type { NextRequest } from "next/server"

import { processClerkWebhookEvent } from "@/lib/actions/authActions"
import { getRequiredEnv } from "@/lib/env"
import type { ClerkWebhookEvent } from "@/types/auth"

export async function verifyClerkWebhook(request: NextRequest): Promise<unknown> {
  return verifyClerkRequestWebhook(request, {
    signingSecret: getRequiredEnv("CLERK_WEBHOOK_SECRET"),
  })
}

export async function handleVerifiedClerkWebhook(input: { svixId: string; event: unknown }) {
  return processClerkWebhookEvent(input.event as ClerkWebhookEvent, input.svixId)
}
