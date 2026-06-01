// lib/auth/webhooks.ts

import "server-only"

import { verifyWebhook as verifyClerkRequestWebhook } from "@clerk/nextjs/webhooks"
import type { NextRequest } from "next/server"

import { getRequiredEnv } from "@/lib/env"
import { processClerkWebhookEvent } from "@/lib/webhooks/clerk"
import type { ClerkWebhookEvent } from "@/types/authTypes"

export async function verifyClerkWebhook(request: NextRequest): Promise<unknown> {
  return verifyClerkRequestWebhook(request, {
    signingSecret: getRequiredEnv("CLERK_WEBHOOK_SECRET"),
  })
}

export async function handleVerifiedClerkWebhook(input: { svixId: string; event: unknown }) {
  return processClerkWebhookEvent(input.event as ClerkWebhookEvent, input.svixId)
}
