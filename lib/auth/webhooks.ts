import "server-only"

import { verifyWebhook as verifyClerkRequestWebhook } from "@clerk/nextjs/webhooks"
import type { NextRequest } from "next/server"

import { parseClerkWebhookJson, processClerkWebhookEvent } from "@/lib/actions/authActions"
import type { ClerkWebhookEvent } from "@/types/auth"

export async function verifyClerkWebhook(request: NextRequest): Promise<unknown> {
  return verifyClerkRequestWebhook(request)
}

export async function handleVerifiedClerkWebhook(event: unknown) {
  return processClerkWebhookEvent(event as ClerkWebhookEvent)
}
