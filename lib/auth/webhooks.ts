// lib/auth/webhooks.ts

import "server-only"

import { verifyWebhook as verifyClerkRequestWebhook } from "@clerk/nextjs/webhooks"
import type { NextRequest } from "next/server"

import { processClerkWebhookEvent } from "@/lib/webhooks/clerk"
import type { ClerkWebhookEvent } from "@/types/authTypes"

export async function verifyClerkWebhook(request: NextRequest): Promise<unknown> {
  return verifyClerkRequestWebhook(request, {
    signingSecret: getClerkWebhookSecret(),
  })
}

export async function handleVerifiedClerkWebhook(input: { svixId: string; event: unknown }) {
  return processClerkWebhookEvent(input.event as ClerkWebhookEvent, input.svixId)
}

function getClerkWebhookSecret(): string {
  const secret = process.env.CLERK_WEBHOOK_SECRET

  if (!secret) {
    throw new Error("CLERK_WEBHOOK_SECRET is required")
  }

  return secret
}
