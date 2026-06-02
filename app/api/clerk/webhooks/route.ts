// app/api/clerk/webhooks/route.ts

import { NextResponse, type NextRequest } from "next/server"

import { handleVerifiedClerkWebhook, verifyClerkWebhook } from "@/lib/auth/webhooks"
import type { ClerkWebhookEvent } from "@/types/authTypes"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type ClerkSessionCreatedEvent = ClerkWebhookEvent & {
  type: "session.created"
  data: ClerkWebhookEvent["data"] & {
    user: ClerkWebhookEvent["data"]
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object"
}

function isClerkSessionCreatedEvent(event: unknown): event is ClerkSessionCreatedEvent {
  if (!isRecord(event) || event.type !== "session.created" || !isRecord(event.data)) {
    return false
  }

  return isRecord(event.data.user) && typeof event.data.user.id === "string"
}

function normalizeClerkWebhookEvent(event: unknown): unknown {
  if (!isClerkSessionCreatedEvent(event)) return event

  return {
    ...event,
    type: "user.updated",
    data: event.data.user,
  } satisfies ClerkWebhookEvent
}

export async function POST(request: NextRequest) {
  const svixId = request.headers.get("svix-id")
  const svixTimestamp = request.headers.get("svix-timestamp")
  const svixSignature = request.headers.get("svix-signature")

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { ok: false, error: "Missing Clerk webhook signature headers." },
      { status: 400 }
    )
  }

  let event: unknown
  try {
    event = await verifyClerkWebhook(request)
  } catch (error) {
    if (error instanceof Error && error.message === "CLERK_WEBHOOK_SECRET is required") {
      return NextResponse.json({ ok: false, error: "Webhook is not configured." }, { status: 500 })
    }

    return NextResponse.json(
      { ok: false, error: "Invalid Clerk webhook signature or payload." },
      { status: 400 }
    )
  }

  const result = await handleVerifiedClerkWebhook({
    svixId,
    event: normalizeClerkWebhookEvent(event),
  })

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, status: result.status })
}
