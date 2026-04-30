import "server-only"

import { verifyWebhook as verifyClerkRequestWebhook } from "@clerk/nextjs/webhooks"
import type { NextRequest } from "next/server"

import { processClerkWebhookEvent } from "@/lib/actions/authActions"
import type { ClerkWebhookEvent } from "@/types/auth"

export async function verifyClerkWebhook(request: NextRequest): Promise<unknown> {
  const signingSecret =
    process.env.CLERK_WEBHOOK_SIGNING_SECRET ?? process.env.CLERK_SIGNING_SECRET

  return signingSecret
    ? verifyClerkRequestWebhook(request, { signingSecret })
    : verifyClerkRequestWebhook(request)
}

export async function handleVerifiedClerkWebhook(input: { svixId: string; event: unknown }) {
  return processClerkWebhookEvent(input.event as ClerkWebhookEvent, input.svixId)
}
