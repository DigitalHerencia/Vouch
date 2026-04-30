import "server-only"

import type { NextRequest } from "next/server"

import { mapClerkUserToLocalInput } from "@/lib/auth/clerk"
import { verifyClerkWebhook } from "@/lib/auth/webhooks"
import type { ClerkWebhookEvent } from "@/lib/clerk/webhook-events"

export async function verifyClerkWebhookSignature(request: NextRequest) {
  return verifyClerkWebhook(request)
}

export function mapClerkWebhookToUserSyncInput(event: ClerkWebhookEvent) {
  if (event.type === "user.deleted") {
    return null
  }

  return mapClerkUserToLocalInput(event.data)
}
