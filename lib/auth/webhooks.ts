import "server-only"

import { verifyWebhook as verifyClerkRequestWebhook } from "@clerk/nextjs/webhooks"
import type { NextRequest } from "next/server"

import { parseClerkWebhookJson, type ClerkWebhookEvent } from "@/lib/clerk/webhook-events"
import { processClerkWebhookEvent } from "@/lib/clerk/process-clerk-webhook"

export async function verifyClerkWebhook(request: NextRequest): Promise<unknown> {
  return verifyClerkRequestWebhook(request)
}

export function parseClerkWebhookEvent(rawBody: string): ClerkWebhookEvent {
  return parseClerkWebhookJson(rawBody)
}

export async function handleVerifiedClerkWebhook(event: unknown) {
  return processClerkWebhookEvent(event as ClerkWebhookEvent)
}
